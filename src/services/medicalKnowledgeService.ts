import { Client as MilvusClient } from '@zilliz/milvus2-sdk-node';
import weaviate, { WeaviateClient } from 'weaviate-ts-client';
import { createHash } from 'crypto';
import { RedisClientType } from 'redis';

// Medical Knowledge Interfaces
export interface MedicalDocument {
  id: string;
  title: string;
  content: string;
  category: 'symptom' | 'disease' | 'treatment' | 'drug' | 'procedure';
  language: 'en' | 'bn';
  metadata: {
    source: string;
    author?: string;
    publishedDate?: Date;
    tags: string[];
    reliability: number; // 0-1 score
  };
  embedding?: number[];
}

export interface SearchQuery {
  text: string;
  language: 'en' | 'bn';
  category?: string[];
  filters?: Record<string, any>;
  limit?: number;
  threshold?: number;
}

export interface SearchResult {
  document: MedicalDocument;
  score: number;
  relevance: number;
}

export interface SymptomAnalysis {
  symptoms: string[];
  possibleConditions: {
    condition: string;
    probability: number;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }[];
  recommendations: string[];
  urgency: 'routine' | 'urgent' | 'emergency';
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  interactionType: 'minor' | 'moderate' | 'major' | 'contraindicated';
  description: string;
  effects: string[];
  recommendations: string[];
}

export interface KnowledgeServiceConfig {
  milvus?: {
    address: string;
    username?: string;
    password?: string;
    database?: string;
    collection: string;
  };
  weaviate?: {
    scheme: string;
    host: string;
    apiKey?: string;
    className: string;
  };
  redis: RedisClientType;
  cacheConfig: {
    searchTTL: number;
    embeddingTTL: number;
    analysisTTL: number;
  };
  embeddingModel: {
    provider: 'openai' | 'huggingface' | 'local';
    model: string;
    apiKey?: string;
    dimensions: number;
  };
}

export class MedicalKnowledgeService {
  private milvusClient?: MilvusClient;
  private weaviateClient?: WeaviateClient;
  private redis: RedisClientType;
  private config: KnowledgeServiceConfig;
  private isInitialized = false;

  constructor(config: KnowledgeServiceConfig) {
    this.config = config;
    this.redis = config.redis;
  }

  async initialize(): Promise<void> {
    try {
      // Initialize Milvus if configured
      if (this.config.milvus) {
        this.milvusClient = new MilvusClient({
          address: this.config.milvus.address,
          username: this.config.milvus.username,
          password: this.config.milvus.password,
          database: this.config.milvus.database,
        });

        // Check collection exists
        const hasCollection = await this.milvusClient.hasCollection({
          collection_name: this.config.milvus.collection,
        });

        if (!hasCollection.value) {
          await this.createMilvusCollection();
        }
      }

      // Initialize Weaviate if configured
      if (this.config.weaviate) {
        this.weaviateClient = weaviate.client({
          scheme: this.config.weaviate.scheme,
          host: this.config.weaviate.host,
          apiKey: this.config.weaviate.apiKey ? weaviate.apiKey(this.config.weaviate.apiKey) : undefined,
        });

        // Check schema exists
        const schema = await this.weaviateClient.schema.getter().do();
        const classExists = schema.classes?.some(
          (cls: any) => cls.class === this.config.weaviate!.className
        );

        if (!classExists) {
          await this.createWeaviateSchema();
        }
      }

      this.isInitialized = true;
      console.log('MedicalKnowledgeService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MedicalKnowledgeService:', error);
      throw error;
    }
  }

  private async createMilvusCollection(): Promise<void> {
    if (!this.milvusClient || !this.config.milvus) return;

    const schema = {
      collection_name: this.config.milvus.collection,
      description: 'Medical knowledge documents collection',
      fields: [
        {
          name: 'id',
          data_type: 'VarChar',
          max_length: 100,
          is_primary_key: true,
        },
        {
          name: 'title',
          data_type: 'VarChar',
          max_length: 500,
        },
        {
          name: 'content',
          data_type: 'VarChar',
          max_length: 10000,
        },
        {
          name: 'category',
          data_type: 'VarChar',
          max_length: 50,
        },
        {
          name: 'language',
          data_type: 'VarChar',
          max_length: 10,
        },
        {
          name: 'embedding',
          data_type: 'FloatVector',
          dim: this.config.embeddingModel.dimensions,
        },
      ],
    };

    await this.milvusClient.createCollection(schema);
    
    // Create index
    await this.milvusClient.createIndex({
      collection_name: this.config.milvus.collection,
      field_name: 'embedding',
      index_type: 'IVF_FLAT',
      metric_type: 'COSINE',
      params: { nlist: 1024 },
    });
  }

  private async createWeaviateSchema(): Promise<void> {
    if (!this.weaviateClient || !this.config.weaviate) return;

    const classObj = {
      class: this.config.weaviate.className,
      description: 'Medical knowledge documents',
      vectorizer: 'text2vec-openai',
      moduleConfig: {
        'text2vec-openai': {
          model: 'ada',
          modelVersion: '002',
          type: 'text',
        },
      },
      properties: [
        {
          name: 'title',
          dataType: ['text'],
          description: 'Document title',
        },
        {
          name: 'content',
          dataType: ['text'],
          description: 'Document content',
        },
        {
          name: 'category',
          dataType: ['text'],
          description: 'Document category',
        },
        {
          name: 'language',
          dataType: ['text'],
          description: 'Document language',
        },
        {
          name: 'source',
          dataType: ['text'],
          description: 'Document source',
        },
        {
          name: 'tags',
          dataType: ['text[]'],
          description: 'Document tags',
        },
        {
          name: 'reliability',
          dataType: ['number'],
          description: 'Document reliability score',
        },
      ],
    };

    await this.weaviateClient.schema.classCreator().withClass(classObj).do();
  }

  async addDocument(document: MedicalDocument): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    try {
      // Generate embedding if not provided
      if (!document.embedding) {
        document.embedding = await this.generateEmbedding(document.content, document.language);
      }

      // Store in Milvus
      if (this.milvusClient && this.config.milvus) {
        await this.milvusClient.insert({
          collection_name: this.config.milvus.collection,
          data: [{
            id: document.id,
            title: document.title,
            content: document.content,
            category: document.category,
            language: document.language,
            embedding: document.embedding,
          }],
        });
      }

      // Store in Weaviate
      if (this.weaviateClient && this.config.weaviate) {
        await this.weaviateClient.data
          .creator()
          .withClassName(this.config.weaviate.className)
          .withId(document.id)
          .withProperties({
            title: document.title,
            content: document.content,
            category: document.category,
            language: document.language,
            source: document.metadata.source,
            tags: document.metadata.tags,
            reliability: document.metadata.reliability,
          })
          .do();
      }

      // Cache document
      const cacheKey = `doc:${document.id}`;
      await this.redis.setEx(cacheKey, this.config.cacheConfig.embeddingTTL, JSON.stringify(document));

      console.log(`Document ${document.id} added successfully`);
    } catch (error) {
      console.error('Failed to add document:', error);
      throw error;
    }
  }

  async search(query: SearchQuery): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey('search', query);
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      let results: SearchResult[] = [];

      // Search in Milvus (vector search)
      if (this.milvusClient && this.config.milvus) {
        const embedding = await this.generateEmbedding(query.text, query.language);
        
        const searchParams = {
          collection_name: this.config.milvus.collection,
          vectors: [embedding],
          search_params: {
            anns_field: 'embedding',
            topk: query.limit || 10,
            metric_type: 'COSINE',
            params: { nprobe: 10 },
          },
          output_fields: ['id', 'title', 'content', 'category', 'language'],
        };

        const milvusResults = await this.milvusClient.search(searchParams);
        
        for (const result of milvusResults.results) {
          results.push({
            document: {
              id: result.id,
              title: result.title,
              content: result.content,
              category: result.category as any,
              language: result.language as any,
              metadata: { source: '', tags: [], reliability: 1 },
            },
            score: result.score,
            relevance: result.score,
          });
        }
      }

      // Search in Weaviate (hybrid search)
      if (this.weaviateClient && this.config.weaviate) {
        let weaviateQuery = this.weaviateClient.graphql
          .get()
          .withClassName(this.config.weaviate.className)
          .withFields('title content category language source tags reliability')
          .withNearText({ concepts: [query.text] })
          .withLimit(query.limit || 10);

        if (query.category && query.category.length > 0) {
          weaviateQuery = weaviateQuery.withWhere({
            path: ['category'],
            operator: 'ContainsAny',
            valueTextArray: query.category,
          });
        }

        const weaviateResults = await weaviateQuery.do();
        
        if (weaviateResults.data?.Get?.[this.config.weaviate.className]) {
          for (const result of weaviateResults.data.Get[this.config.weaviate.className]) {
            results.push({
              document: {
                id: result.id || this.generateId(),
                title: result.title,
                content: result.content,
                category: result.category as any,
                language: result.language as any,
                metadata: {
                  source: result.source,
                  tags: result.tags || [],
                  reliability: result.reliability || 1,
                },
              },
              score: result._additional?.certainty || 0,
              relevance: result._additional?.certainty || 0,
            });
          }
        }
      }

      // Sort by relevance and apply threshold
      results = results
        .filter(r => r.relevance >= (query.threshold || 0.5))
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, query.limit || 10);

      // Cache results
      await this.redis.setEx(cacheKey, this.config.cacheConfig.searchTTL, JSON.stringify(results));

      return results;
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  async analyzeSymptoms(symptoms: string[], language: 'en' | 'bn' = 'en'): Promise<SymptomAnalysis> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey('symptoms', { symptoms, language });
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Search for related conditions
      const searchQuery = symptoms.join(' ');
      const searchResults = await this.search({
        text: searchQuery,
        language,
        category: ['disease', 'symptom'],
        limit: 20,
        threshold: 0.6,
      });

      // Analyze and rank conditions
      const conditionMap = new Map<string, { count: number; scores: number[]; descriptions: Set<string> }>();
      
      for (const result of searchResults) {
        const condition = this.extractConditionFromDocument(result.document);
        if (condition) {
          if (!conditionMap.has(condition)) {
            conditionMap.set(condition, { count: 0, scores: [], descriptions: new Set() });
          }
          const entry = conditionMap.get(condition)!;
          entry.count++;
          entry.scores.push(result.relevance);
          entry.descriptions.add(result.document.content.substring(0, 200));
        }
      }

      // Calculate probabilities and create analysis
      const possibleConditions = Array.from(conditionMap.entries())
        .map(([condition, data]) => {
          const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
          const probability = Math.min(avgScore * (data.count / searchResults.length), 1);
          
          return {
            condition,
            probability,
            description: Array.from(data.descriptions)[0] || '',
            severity: this.calculateSeverity(condition, symptoms) as 'low' | 'medium' | 'high' | 'critical',
          };
        })
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 5);

      const analysis: SymptomAnalysis = {
        symptoms,
        possibleConditions,
        recommendations: await this.generateRecommendations(symptoms, possibleConditions, language),
        urgency: this.calculateUrgency(possibleConditions),
      };

      // Cache analysis
      await this.redis.setEx(cacheKey, this.config.cacheConfig.analysisTTL, JSON.stringify(analysis));

      return analysis;
    } catch (error) {
      console.error('Symptom analysis failed:', error);
      throw error;
    }
  }

  async checkDrugInteractions(drugs: string[]): Promise<DrugInteraction[]> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey('drug_interactions', { drugs });
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const interactions: DrugInteraction[] = [];

      // Check all drug pairs
      for (let i = 0; i < drugs.length; i++) {
        for (let j = i + 1; j < drugs.length; j++) {
          const drug1 = drugs[i];
          const drug2 = drugs[j];

          // Search for interaction information
          const searchQuery = `${drug1} ${drug2} interaction contraindication`;
          const searchResults = await this.search({
            text: searchQuery,
            language: 'en',
            category: ['drug'],
            limit: 5,
            threshold: 0.7,
          });

          if (searchResults.length > 0) {
            const interaction = this.extractDrugInteraction(drug1, drug2, searchResults);
            if (interaction) {
              interactions.push(interaction);
            }
          }
        }
      }

      // Cache interactions
      await this.redis.setEx(cacheKey, this.config.cacheConfig.analysisTTL, JSON.stringify(interactions));

      return interactions;
    } catch (error) {
      console.error('Drug interaction check failed:', error);
      throw error;
    }
  }

  private async generateEmbedding(text: string, language: 'en' | 'bn'): Promise<number[]> {
    // This is a placeholder - implement actual embedding generation
    // based on your chosen embedding model (OpenAI, HuggingFace, etc.)
    
    const cacheKey = `embedding:${createHash('md5').update(text + language).digest('hex')}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Placeholder embedding - replace with actual implementation
    const embedding = new Array(this.config.embeddingModel.dimensions).fill(0).map(() => Math.random());
    
    await this.redis.setEx(cacheKey, this.config.cacheConfig.embeddingTTL, JSON.stringify(embedding));
    return embedding;
  }

  private generateCacheKey(operation: string, data: any): string {
    const hash = createHash('md5').update(JSON.stringify(data)).digest('hex');
    return `knowledge:${operation}:${hash}`;
  }

  private generateId(): string {
    return createHash('md5').update(Date.now().toString() + Math.random().toString()).digest('hex');
  }

  private extractConditionFromDocument(document: MedicalDocument): string | null {
    // Extract condition name from document title or content
    // This is a simplified implementation
    const title = document.title.toLowerCase();
    const content = document.content.toLowerCase();
    
    // Look for common medical condition patterns
    const conditionPatterns = [
      /(?:diagnosis|condition|disease):\s*([^\n\.]+)/i,
      /([a-z\s]+(?:syndrome|disease|disorder|condition))/i,
    ];
    
    for (const pattern of conditionPatterns) {
      const match = (title + ' ' + content).match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return document.title;
  }

  private calculateSeverity(condition: string, symptoms: string[]): string {
    // Simplified severity calculation
    const criticalKeywords = ['emergency', 'critical', 'severe', 'acute', 'urgent'];
    const highKeywords = ['serious', 'significant', 'major'];
    const mediumKeywords = ['moderate', 'mild'];
    
    const text = (condition + ' ' + symptoms.join(' ')).toLowerCase();
    
    if (criticalKeywords.some(keyword => text.includes(keyword))) return 'critical';
    if (highKeywords.some(keyword => text.includes(keyword))) return 'high';
    if (mediumKeywords.some(keyword => text.includes(keyword))) return 'medium';
    
    return 'low';
  }

  private calculateUrgency(conditions: any[]): 'routine' | 'urgent' | 'emergency' {
    const maxSeverity = conditions.reduce((max, condition) => {
      const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
      return Math.max(max, severityOrder[condition.severity as keyof typeof severityOrder] || 1);
    }, 1);
    
    if (maxSeverity >= 4) return 'emergency';
    if (maxSeverity >= 3) return 'urgent';
    return 'routine';
  }

  private async generateRecommendations(
    symptoms: string[],
    conditions: any[],
    language: 'en' | 'bn'
  ): Promise<string[]> {
    // Generate contextual recommendations
    const recommendations = [];
    
    if (conditions.some(c => c.severity === 'critical' || c.severity === 'high')) {
      recommendations.push(
        language === 'bn' 
          ? 'অবিলম্বে একজন ডাক্তারের সাথে যোগাযোগ করুন'
          : 'Consult a doctor immediately'
      );
    }
    
    recommendations.push(
      language === 'bn'
        ? 'লক্ষণগুলি নিয়মিত পর্যবেক্ষণ করুন'
        : 'Monitor symptoms regularly'
    );
    
    if (symptoms.length > 3) {
      recommendations.push(
        language === 'bn'
          ? 'একটি বিস্তারিত মেডিকেল চেকআপ করান'
          : 'Consider a comprehensive medical checkup'
      );
    }
    
    return recommendations;
  }

  private extractDrugInteraction(drug1: string, drug2: string, searchResults: SearchResult[]): DrugInteraction | null {
    // Extract interaction information from search results
    const bestResult = searchResults[0];
    if (!bestResult) return null;
    
    const content = bestResult.document.content.toLowerCase();
    
    // Determine interaction type
    let interactionType: 'minor' | 'moderate' | 'major' | 'contraindicated' = 'minor';
    if (content.includes('contraindicated') || content.includes('avoid')) {
      interactionType = 'contraindicated';
    } else if (content.includes('major') || content.includes('serious')) {
      interactionType = 'major';
    } else if (content.includes('moderate')) {
      interactionType = 'moderate';
    }
    
    return {
      drug1,
      drug2,
      interactionType,
      description: bestResult.document.content.substring(0, 300),
      effects: this.extractEffects(content),
      recommendations: this.extractRecommendations(content),
    };
  }

  private extractEffects(content: string): string[] {
    // Extract potential effects from content
    const effects = [];
    const effectPatterns = [
      /(?:effects?|side effects?):\s*([^\n\.]+)/gi,
      /(?:may cause|can cause|results in)\s+([^\n\.]+)/gi,
    ];
    
    for (const pattern of effectPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        effects.push(match[1].trim());
      }
    }
    
    return effects.slice(0, 3); // Limit to 3 effects
  }

  private extractRecommendations(content: string): string[] {
    // Extract recommendations from content
    const recommendations = [];
    const recPatterns = [
      /(?:recommend|suggest|advise)\s+([^\n\.]+)/gi,
      /(?:should|must|need to)\s+([^\n\.]+)/gi,
    ];
    
    for (const pattern of recPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        recommendations.push(match[1].trim());
      }
    }
    
    return recommendations.slice(0, 2); // Limit to 2 recommendations
  }

  async getStats(): Promise<any> {
    const stats = {
      totalDocuments: 0,
      documentsByCategory: {},
      documentsByLanguage: {},
      cacheHitRate: 0,
      lastUpdated: new Date(),
    };
    
    // Get stats from vector databases
    if (this.milvusClient && this.config.milvus) {
      try {
        const collectionStats = await this.milvusClient.getCollectionStatistics({
          collection_name: this.config.milvus.collection,
        });
        stats.totalDocuments = parseInt(collectionStats.data.row_count || '0');
      } catch (error) {
        console.error('Failed to get Milvus stats:', error);
      }
    }
    
    return stats;
  }

  async cleanup(): Promise<void> {
    try {
      if (this.milvusClient) {
        // Milvus client cleanup if needed
      }
      
      if (this.weaviateClient) {
        // Weaviate client cleanup if needed
      }
      
      console.log('MedicalKnowledgeService cleanup completed');
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }
}