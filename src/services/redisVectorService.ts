import { RedisVectorStore } from '@langchain/redis';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import { redisClient } from './redisService';

// Browser environment check
const isBrowser = typeof window !== 'undefined';

// Vector Database Configuration
const VECTOR_INDEX_NAME = process.env.REDIS_VECTOR_INDEX_NAME || 'dr_mimu_vectors';
const VECTOR_DIMENSION = parseInt(process.env.REDIS_VECTOR_DIMENSION || '1536');

// Medical Document Interface
export interface MedicalDocument {
  id: string;
  content: string;
  type: 'symptom' | 'medicine' | 'disease' | 'treatment' | 'advice' | 'general';
  metadata: {
    category?: string;
    severity?: 'low' | 'medium' | 'high';
    language?: 'en' | 'bn';
    source?: string;
    timestamp?: number;
    userId?: string;
    doctorId?: string;
  };
}

// Redis Vector Database Service
export class RedisVectorService {
  private static instance: RedisVectorService;
  private vectorStore: RedisVectorStore | null = null;
  private embeddings: OpenAIEmbeddings | null = null;
  private isInitialized: boolean = false;
  private isBrowserEnv: boolean;

  private constructor() {
    this.isBrowserEnv = isBrowser;
    
    if (!this.isBrowserEnv) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (apiKey && apiKey !== 'your-openai-api-key-here' && !apiKey.startsWith('sk-xxx')) {
        try {
          this.embeddings = new OpenAIEmbeddings({
            openAIApiKey: apiKey,
            modelName: 'text-embedding-ada-002',
          });
        } catch (error) {
          console.warn('Failed to initialize OpenAI embeddings:', error);
        }
      } else {
        console.warn('OpenAI API key not configured or is placeholder value');
      }
    }
  }

  public static getInstance(): RedisVectorService {
    if (!RedisVectorService.instance) {
      RedisVectorService.instance = new RedisVectorService();
    }
    return RedisVectorService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      if (this.isBrowserEnv) {
        console.warn('Redis Vector Database not available in browser environment');
        this.isInitialized = true;
        return;
      }

      if (!this.embeddings || !redisClient) {
        console.warn('Redis Vector Database dependencies not available');
        this.isInitialized = true;
        return;
      }

      // Create Redis Vector Store
      this.vectorStore = new RedisVectorStore(this.embeddings, {
        redisClient: redisClient,
        indexName: VECTOR_INDEX_NAME,
        keyPrefix: 'dr_mimu:',
        indexOptions: {
          ALGORITHM: 'HNSW',
          DISTANCE_METRIC: 'COSINE',
          INITIAL_CAP: 1000,
          M: 16,
          EF_CONSTRUCTION: 200,
        },
      });

      // Create index if it doesn't exist
      await this.createIndexIfNotExists();
      
      this.isInitialized = true;
      console.log('✅ Redis Vector Database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Redis Vector Database:', error);
      // Don't throw error, just mark as initialized with fallback
      this.isInitialized = true;
    }
  }

  private async createIndexIfNotExists(): Promise<void> {
    try {
      if (this.isBrowserEnv || !redisClient) {
        return;
      }
      
      // Check if index exists
      const indexInfo = await redisClient.call('FT.INFO', VECTOR_INDEX_NAME);
      console.log('📊 Vector index already exists:', VECTOR_INDEX_NAME);
    } catch (error) {
      // Index doesn't exist, create it
      console.log('🔧 Creating new vector index:', VECTOR_INDEX_NAME);
      await this.createVectorIndex();
    }
  }

  private async createVectorIndex(): Promise<void> {
    try {
      if (this.isBrowserEnv || !redisClient) {
        return;
      }
      
      const indexCommand = [
        'FT.CREATE',
        VECTOR_INDEX_NAME,
        'ON', 'HASH',
        'PREFIX', '1', 'dr_mimu:',
        'SCHEMA',
        'content', 'TEXT',
        'type', 'TAG',
        'category', 'TAG',
        'severity', 'TAG',
        'language', 'TAG',
        'source', 'TEXT',
        'userId', 'TAG',
        'doctorId', 'TAG',
        'timestamp', 'NUMERIC',
        'vector', 'VECTOR', 'HNSW', '6',
        'TYPE', 'FLOAT32',
        'DIM', VECTOR_DIMENSION.toString(),
        'DISTANCE_METRIC', 'COSINE',
        'INITIAL_CAP', '1000',
        'M', '16',
        'EF_CONSTRUCTION', '200'
      ];

      await redisClient.call(...indexCommand);
      console.log('✅ Vector index created successfully');
    } catch (error) {
      console.error('❌ Failed to create vector index:', error);
      throw error;
    }
  }

  // Add medical documents to vector database
  public async addDocuments(documents: MedicalDocument[]): Promise<void> {
    try {
      if (this.isBrowserEnv) {
        console.warn('Vector database not available in browser environment');
        return;
      }
      
      if (!this.vectorStore) {
        await this.initialize();
      }

      if (!this.vectorStore) {
        console.warn('Vector store not initialized');
        return;
      }

      const langchainDocs = documents.map(doc => new Document({
        pageContent: doc.content,
        metadata: {
          id: doc.id,
          type: doc.type,
          ...doc.metadata,
        },
      }));

      await this.vectorStore.addDocuments(langchainDocs);
      console.log(`✅ Added ${documents.length} documents to vector database`);
    } catch (error) {
      console.error('❌ Failed to add documents:', error);
      // Don't throw error in browser environment
      if (!this.isBrowserEnv) {
        throw error;
      }
    }
  }

  // Semantic search for medical information
  public async semanticSearch(
    query: string,
    options: {
      k?: number;
      filter?: {
        type?: string;
        category?: string;
        severity?: string;
        language?: string;
        userId?: string;
        doctorId?: string;
      };
      threshold?: number;
    } = {}
  ): Promise<Array<{ document: MedicalDocument; score: number }>> {
    try {
      if (this.isBrowserEnv) {
        console.warn('Semantic search not available in browser environment');
        return [];
      }
      
      if (!this.vectorStore) {
        await this.initialize();
      }

      if (!this.vectorStore) {
        console.warn('Vector store not initialized');
        return [];
      }

      const { k = 5, filter = {}, threshold = 0.7 } = options;

      // Build filter string for Redis
      const filterParts: string[] = [];
      if (filter.type) filterParts.push(`@type:{${filter.type}}`);
      if (filter.category) filterParts.push(`@category:{${filter.category}}`);
      if (filter.severity) filterParts.push(`@severity:{${filter.severity}}`);
      if (filter.language) filterParts.push(`@language:{${filter.language}}`);
      if (filter.userId) filterParts.push(`@userId:{${filter.userId}}`);
      if (filter.doctorId) filterParts.push(`@doctorId:{${filter.doctorId}}`);

      const filterString = filterParts.length > 0 ? filterParts.join(' ') : '*';

      const results = await this.vectorStore.similaritySearchWithScore(
        query,
        k,
        { filter: filterString }
      );

      return results
        .filter(([, score]) => score >= threshold)
        .map(([doc, score]) => ({
          document: {
            id: doc.metadata.id,
            content: doc.pageContent,
            type: doc.metadata.type,
            metadata: doc.metadata,
          } as MedicalDocument,
          score,
        }));
    } catch (error) {
      console.error('❌ Failed to perform semantic search:', error);
      return [];
    }
  }

  // Find similar medical cases
  public async findSimilarCases(
    symptoms: string[],
    patientInfo?: {
      age?: number;
      gender?: string;
      medicalHistory?: string[];
    },
    k: number = 5
  ): Promise<Array<{ document: MedicalDocument; score: number }>> {
    try {
      const query = symptoms.join(' ');
      const results = await this.semanticSearch(query, {
        k,
        filter: { type: 'symptom' },
        threshold: 0.6,
      });

      return results;
    } catch (error) {
      console.error('❌ Failed to find similar cases:', error);
      return [];
    }
  }

  // Get medicine recommendations based on symptoms
  public async getMedicineRecommendations(
    symptoms: string[],
    k: number = 3
  ): Promise<Array<{ document: MedicalDocument; score: number }>> {
    try {
      const query = symptoms.join(' ');
      const results = await this.semanticSearch(query, {
        k,
        filter: { type: 'medicine' },
        threshold: 0.7,
      });

      return results;
    } catch (error) {
      console.error('❌ Failed to get medicine recommendations:', error);
      return [];
    }
  }

  // Store user conversation for context
  public async storeConversation(
    userId: string,
    conversation: {
      userMessage: string;
      aiResponse: string;
      timestamp: number;
      context?: any;
    }
  ): Promise<void> {
    try {
      const document: MedicalDocument = {
        id: `conversation_${userId}_${conversation.timestamp}`,
        content: `User: ${conversation.userMessage}\nAI: ${conversation.aiResponse}`,
        type: 'general',
        metadata: {
          category: 'conversation',
          userId,
          timestamp: conversation.timestamp,
          source: 'chat_history',
          language: 'bn',
        },
      };

      await this.addDocuments([document]);
    } catch (error) {
      console.error('❌ Failed to store conversation:', error);
    }
  }

  // Get user conversation history
  public async getUserConversationHistory(
    userId: string,
    limit: number = 10
  ): Promise<MedicalDocument[]> {
    try {
      const results = await this.semanticSearch('conversation history', {
        k: limit,
        filter: { userId, category: 'conversation' },
        threshold: 0.1,
      });

      return results
        .sort((a, b) => (b.document.metadata.timestamp || 0) - (a.document.metadata.timestamp || 0))
        .map(result => result.document);
    } catch (error) {
      console.error('❌ Failed to get conversation history:', error);
      return [];
    }
  }

  // Delete documents by filter
  public async deleteDocuments(filter: {
    type?: string;
    userId?: string;
    doctorId?: string;
    category?: string;
  }): Promise<void> {
    try {
      if (this.isBrowserEnv || !redisClient) {
        console.warn('Document deletion not available in browser environment');
        return;
      }
      
      const filterParts: string[] = [];
      if (filter.type) filterParts.push(`@type:{${filter.type}}`);
      if (filter.userId) filterParts.push(`@userId:{${filter.userId}}`);
      if (filter.doctorId) filterParts.push(`@doctorId:{${filter.doctorId}}`);
      if (filter.category) filterParts.push(`@category:{${filter.category}}`);

      const filterString = filterParts.join(' ');
      
      // Search for documents to delete
      const searchResults = await redisClient.call(
        'FT.SEARCH',
        VECTOR_INDEX_NAME,
        filterString,
        'LIMIT', '0', '1000',
        'RETURN', '0'
      );

      if (Array.isArray(searchResults) && searchResults.length > 1) {
        const docIds = [];
        for (let i = 1; i < searchResults.length; i += 2) {
          docIds.push(searchResults[i]);
        }

        if (docIds.length > 0) {
          await redisClient.del(...docIds);
          console.log(`🗑️ Deleted ${docIds.length} documents`);
        }
      }
    } catch (error) {
      console.error('❌ Failed to delete documents:', error);
      if (!this.isBrowserEnv) {
        throw error;
      }
    }
  }

  // Get database statistics
  public async getStats(): Promise<{
    totalDocuments: number;
    indexInfo: any;
  }> {
    try {
      if (this.isBrowserEnv || !redisClient) {
        console.warn('Database stats not available in browser environment');
        return { totalDocuments: 0, indexInfo: null };
      }
      
      const indexInfo = await redisClient.call('FT.INFO', VECTOR_INDEX_NAME);
      const totalDocuments = indexInfo[indexInfo.indexOf('num_docs') + 1] || 0;

      return {
        totalDocuments: parseInt(totalDocuments),
        indexInfo,
      };
    } catch (error) {
      console.error('❌ Failed to get stats:', error);
      return { totalDocuments: 0, indexInfo: null };
    }
  }

  public isReady(): boolean {
    return this.isInitialized && this.vectorStore !== null;
  }
}

// Export singleton instance
export const redisVectorService = RedisVectorService.getInstance();

// Initialize on import
redisVectorService.initialize().catch(console.error);

export default redisVectorService;