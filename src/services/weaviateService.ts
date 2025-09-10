import weaviate, { WeaviateClient, ApiKey } from 'weaviate-ts-client';
import { OpenAIEmbeddings } from '@langchain/openai';
import { WeaviateStore } from '@langchain/weaviate';
import { Document } from '@langchain/core/documents';

// Browser environment check
const isBrowser = typeof window !== 'undefined';

// Weaviate Configuration
interface WeaviateConfig {
  scheme: string;
  host: string;
  apiKey?: string;
  className: string;
  openaiApiKey?: string;
}

// Medical Document Interface
export interface MedicalDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  language: string;
  source: string;
  tags: string[];
  reliability: number;
  metadata?: Record<string, any>;
}

// Search Result Interface
export interface WeaviateSearchResult {
  document: MedicalDocument;
  score: number;
  certainty: number;
}

// Weaviate Service Class
export class WeaviateService {
  private static instance: WeaviateService;
  private client: WeaviateClient | null = null;
  private vectorStore: WeaviateStore | null = null;
  private embeddings: OpenAIEmbeddings | null = null;
  private isInitialized: boolean = false;
  private isBrowserEnv: boolean;
  private config: WeaviateConfig;

  private constructor() {
    this.isBrowserEnv = isBrowser;
    this.config = {
      scheme: process.env.WEAVIATE_SCHEME || 'http',
      host: process.env.WEAVIATE_HOST || 'localhost:8080',
      apiKey: process.env.WEAVIATE_API_KEY,
      className: 'MedicalKnowledge',
      openaiApiKey: process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY
    };
  }

  public static getInstance(): WeaviateService {
    if (!WeaviateService.instance) {
      WeaviateService.instance = new WeaviateService();
    }
    return WeaviateService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isBrowserEnv) {
      console.warn('⚠️ Weaviate not available in browser environment');
      return;
    }

    try {
      if (this.isInitialized) return;

      // Initialize Weaviate client
      const clientConfig: any = {
        scheme: this.config.scheme,
        host: this.config.host,
      };

      if (this.config.apiKey) {
        clientConfig.apiKey = new ApiKey(this.config.apiKey);
      }

      this.client = weaviate.client(clientConfig);

      // Initialize OpenAI embeddings
      if (this.config.openaiApiKey) {
        this.embeddings = new OpenAIEmbeddings({
          openAIApiKey: this.config.openaiApiKey,
          modelName: 'text-embedding-ada-002',
        });
      }

      // Check if schema exists, create if not
      await this.ensureSchema();

      // Initialize LangChain Weaviate store
      if (this.client && this.embeddings) {
        this.vectorStore = new WeaviateStore(this.embeddings, {
          client: this.client,
          indexName: this.config.className,
          textKey: 'content',
          metadataKeys: ['title', 'category', 'language', 'source', 'tags', 'reliability']
        });
      }

      this.isInitialized = true;
      console.log('✅ Weaviate service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Weaviate service:', error);
      throw error;
    }
  }

  private async ensureSchema(): Promise<void> {
    if (!this.client) return;

    try {
      // Check if class exists
      const schema = await this.client.schema.getter().do();
      const classExists = schema.classes?.some(
        (cls: any) => cls.class === this.config.className
      );

      if (!classExists) {
        await this.createSchema();
      }
    } catch (error) {
      console.error('❌ Failed to ensure schema:', error);
      throw error;
    }
  }

  private async createSchema(): Promise<void> {
    if (!this.client) return;

    const classObj = {
      class: this.config.className,
      description: 'Medical knowledge documents for Dr. Mimu chatbot',
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
          moduleConfig: {
            'text2vec-openai': {
              skip: false,
              vectorizePropertyName: false,
            },
          },
        },
        {
          name: 'content',
          dataType: ['text'],
          description: 'Document content',
          moduleConfig: {
            'text2vec-openai': {
              skip: false,
              vectorizePropertyName: false,
            },
          },
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
          description: 'Document reliability score (0-1)',
        },
      ],
    };

    try {
      await this.client.schema.classCreator().withClass(classObj).do();
      console.log('✅ Weaviate schema created successfully');
    } catch (error) {
      console.error('❌ Failed to create Weaviate schema:', error);
      throw error;
    }
  }

  // Add medical documents to Weaviate
  public async addDocuments(documents: MedicalDocument[]): Promise<void> {
    if (this.isBrowserEnv || !this.client) {
      console.warn('⚠️ Weaviate not available in browser environment');
      return;
    }

    try {
      const langchainDocs = documents.map(
        (doc) =>
          new Document({
            pageContent: doc.content,
            metadata: {
              id: doc.id,
              title: doc.title,
              category: doc.category,
              language: doc.language,
              source: doc.source,
              tags: doc.tags,
              reliability: doc.reliability,
              ...doc.metadata,
            },
          })
      );

      if (this.vectorStore) {
        await this.vectorStore.addDocuments(langchainDocs);
        console.log(`✅ Added ${documents.length} documents to Weaviate`);
      }
    } catch (error) {
      console.error('❌ Failed to add documents to Weaviate:', error);
      throw error;
    }
  }

  // Semantic search in Weaviate
  public async semanticSearch(
    query: string,
    options: {
      limit?: number;
      certainty?: number;
      category?: string;
      language?: string;
      minReliability?: number;
    } = {}
  ): Promise<WeaviateSearchResult[]> {
    if (this.isBrowserEnv || !this.client) {
      console.warn('⚠️ Weaviate not available in browser environment');
      return [];
    }

    try {
      const {
        limit = 10,
        certainty = 0.7,
        category,
        language,
        minReliability = 0.5,
      } = options;

      let weaviateQuery = this.client.graphql
        .get()
        .withClassName(this.config.className)
        .withFields('title content category language source tags reliability _additional { certainty }')
        .withNearText({ concepts: [query], certainty })
        .withLimit(limit);

      // Add filters
      const whereFilters: any[] = [];

      if (category) {
        whereFilters.push({
          path: ['category'],
          operator: 'Equal',
          valueText: category,
        });
      }

      if (language) {
        whereFilters.push({
          path: ['language'],
          operator: 'Equal',
          valueText: language,
        });
      }

      if (minReliability > 0) {
        whereFilters.push({
          path: ['reliability'],
          operator: 'GreaterThanEqual',
          valueNumber: minReliability,
        });
      }

      if (whereFilters.length > 0) {
        const whereCondition = whereFilters.length === 1 
          ? whereFilters[0]
          : {
              operator: 'And',
              operands: whereFilters,
            };
        weaviateQuery = weaviateQuery.withWhere(whereCondition);
      }

      const result = await weaviateQuery.do();
      const documents = result.data?.Get?.[this.config.className] || [];

      return documents.map((doc: any) => ({
        document: {
          id: doc.id || '',
          title: doc.title || '',
          content: doc.content || '',
          category: doc.category || '',
          language: doc.language || '',
          source: doc.source || '',
          tags: doc.tags || [],
          reliability: doc.reliability || 0,
        },
        score: doc._additional?.certainty || 0,
        certainty: doc._additional?.certainty || 0,
      }));
    } catch (error) {
      console.error('❌ Failed to perform semantic search:', error);
      return [];
    }
  }

  // Hybrid search (semantic + keyword)
  public async hybridSearch(
    query: string,
    options: {
      limit?: number;
      alpha?: number; // 0 = keyword only, 1 = semantic only
      category?: string;
      language?: string;
      minReliability?: number;
    } = {}
  ): Promise<WeaviateSearchResult[]> {
    if (this.isBrowserEnv || !this.client) {
      console.warn('⚠️ Weaviate not available in browser environment');
      return [];
    }

    try {
      const {
        limit = 10,
        alpha = 0.75, // Favor semantic search
        category,
        language,
        minReliability = 0.5,
      } = options;

      let weaviateQuery = this.client.graphql
        .get()
        .withClassName(this.config.className)
        .withFields('title content category language source tags reliability _additional { score }')
        .withHybrid({
          query,
          alpha,
        })
        .withLimit(limit);

      // Add filters (same as semantic search)
      const whereFilters: any[] = [];

      if (category) {
        whereFilters.push({
          path: ['category'],
          operator: 'Equal',
          valueText: category,
        });
      }

      if (language) {
        whereFilters.push({
          path: ['language'],
          operator: 'Equal',
          valueText: language,
        });
      }

      if (minReliability > 0) {
        whereFilters.push({
          path: ['reliability'],
          operator: 'GreaterThanEqual',
          valueNumber: minReliability,
        });
      }

      if (whereFilters.length > 0) {
        const whereCondition = whereFilters.length === 1 
          ? whereFilters[0]
          : {
              operator: 'And',
              operands: whereFilters,
            };
        weaviateQuery = weaviateQuery.withWhere(whereCondition);
      }

      const result = await weaviateQuery.do();
      const documents = result.data?.Get?.[this.config.className] || [];

      return documents.map((doc: any) => ({
        document: {
          id: doc.id || '',
          title: doc.title || '',
          content: doc.content || '',
          category: doc.category || '',
          language: doc.language || '',
          source: doc.source || '',
          tags: doc.tags || [],
          reliability: doc.reliability || 0,
        },
        score: doc._additional?.score || 0,
        certainty: doc._additional?.score || 0,
      }));
    } catch (error) {
      console.error('❌ Failed to perform hybrid search:', error);
      return [];
    }
  }

  // Get similar documents
  public async getSimilarDocuments(
    documentId: string,
    limit: number = 5
  ): Promise<WeaviateSearchResult[]> {
    if (this.isBrowserEnv || !this.client) {
      console.warn('⚠️ Weaviate not available in browser environment');
      return [];
    }

    try {
      const result = await this.client.graphql
        .get()
        .withClassName(this.config.className)
        .withFields('title content category language source tags reliability _additional { certainty }')
        .withNearObject({ id: documentId })
        .withLimit(limit)
        .do();

      const documents = result.data?.Get?.[this.config.className] || [];

      return documents.map((doc: any) => ({
        document: {
          id: doc.id || '',
          title: doc.title || '',
          content: doc.content || '',
          category: doc.category || '',
          language: doc.language || '',
          source: doc.source || '',
          tags: doc.tags || [],
          reliability: doc.reliability || 0,
        },
        score: doc._additional?.certainty || 0,
        certainty: doc._additional?.certainty || 0,
      }));
    } catch (error) {
      console.error('❌ Failed to get similar documents:', error);
      return [];
    }
  }

  // Delete documents
  public async deleteDocument(documentId: string): Promise<void> {
    if (this.isBrowserEnv || !this.client) {
      console.warn('⚠️ Weaviate not available in browser environment');
      return;
    }

    try {
      await this.client.data
        .deleter()
        .withClassName(this.config.className)
        .withId(documentId)
        .do();
      
      console.log(`✅ Deleted document ${documentId} from Weaviate`);
    } catch (error) {
      console.error('❌ Failed to delete document:', error);
      throw error;
    }
  }

  // Get document count
  public async getDocumentCount(): Promise<number> {
    if (this.isBrowserEnv || !this.client) {
      return 0;
    }

    try {
      const result = await this.client.graphql
        .aggregate()
        .withClassName(this.config.className)
        .withFields('meta { count }')
        .do();

      return result.data?.Aggregate?.[this.config.className]?.[0]?.meta?.count || 0;
    } catch (error) {
      console.error('❌ Failed to get document count:', error);
      return 0;
    }
  }

  // Health check
  public async healthCheck(): Promise<boolean> {
    if (this.isBrowserEnv || !this.client) {
      return false;
    }

    try {
      await this.client.misc.liveChecker().do();
      return true;
    } catch (error) {
      console.error('❌ Weaviate health check failed:', error);
      return false;
    }
  }

  // Getters
  public getClient(): WeaviateClient | null {
    return this.client;
  }

  public getVectorStore(): WeaviateStore | null {
    return this.vectorStore;
  }

  public isReady(): boolean {
    return this.isInitialized && !this.isBrowserEnv;
  }
}

// Export singleton instance
export const weaviateService = WeaviateService.getInstance();

// Initialize Weaviate service
if (!isBrowser) {
  weaviateService.initialize().catch(console.error);
}

export default weaviateService;