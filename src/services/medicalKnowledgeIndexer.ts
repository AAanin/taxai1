import { weaviateService, MedicalDocument } from './weaviateService';
import { redisCacheService } from './redisCacheService';
import { v4 as uuidv4 } from 'uuid';

// Browser environment check
const isBrowser = typeof window !== 'undefined';

// Medical Knowledge Categories
export const MEDICAL_CATEGORIES = {
  SYMPTOMS: 'symptoms',
  DISEASES: 'diseases',
  MEDICATIONS: 'medications',
  TREATMENTS: 'treatments',
  PREVENTION: 'prevention',
  EMERGENCY: 'emergency',
  NUTRITION: 'nutrition',
  MENTAL_HEALTH: 'mental_health',
  PEDIATRICS: 'pediatrics',
  WOMEN_HEALTH: 'women_health',
  ELDERLY_CARE: 'elderly_care'
} as const;

// Medical Knowledge Entry Interface
export interface MedicalKnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: keyof typeof MEDICAL_CATEGORIES;
  language: 'bn' | 'en';
  source: string;
  tags: string[];
  reliability: number; // 0-1 scale
  lastUpdated: Date;
  metadata?: {
    author?: string;
    reviewedBy?: string;
    references?: string[];
    symptoms?: string[];
    conditions?: string[];
    medications?: string[];
    dosage?: string;
    sideEffects?: string[];
    contraindications?: string[];
  };
}

// Indexing Statistics
export interface IndexingStats {
  totalDocuments: number;
  documentsIndexed: number;
  documentsSkipped: number;
  errors: number;
  categories: Record<string, number>;
  languages: Record<string, number>;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

// Medical Knowledge Indexer Service
export class MedicalKnowledgeIndexer {
  private static instance: MedicalKnowledgeIndexer;
  private isInitialized: boolean = false;
  private isBrowserEnv: boolean;
  private indexingStats: IndexingStats;

  private constructor() {
    this.isBrowserEnv = isBrowser;
    this.indexingStats = this.initializeStats();
  }

  public static getInstance(): MedicalKnowledgeIndexer {
    if (!MedicalKnowledgeIndexer.instance) {
      MedicalKnowledgeIndexer.instance = new MedicalKnowledgeIndexer();
    }
    return MedicalKnowledgeIndexer.instance;
  }

  private initializeStats(): IndexingStats {
    return {
      totalDocuments: 0,
      documentsIndexed: 0,
      documentsSkipped: 0,
      errors: 0,
      categories: {},
      languages: {},
      startTime: new Date()
    };
  }

  public async initialize(): Promise<void> {
    if (this.isBrowserEnv) {
      console.warn('⚠️ Medical Knowledge Indexer not available in browser environment');
      return;
    }

    try {
      if (this.isInitialized) return;

      // Ensure Weaviate service is ready
      if (!weaviateService.isReady()) {
        await weaviateService.initialize();
      }

      this.isInitialized = true;
      console.log('✅ Medical Knowledge Indexer initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Medical Knowledge Indexer:', error);
      throw error;
    }
  }

  // Index a single medical document
  public async indexDocument(entry: MedicalKnowledgeEntry): Promise<boolean> {
    if (this.isBrowserEnv || !this.isInitialized) {
      console.warn('⚠️ Indexing not available in browser environment');
      return false;
    }

    try {
      // Validate entry
      if (!this.validateEntry(entry)) {
        this.indexingStats.documentsSkipped++;
        return false;
      }

      // Convert to Weaviate document format
      const weaviateDoc: MedicalDocument = {
        id: entry.id,
        title: entry.title,
        content: entry.content,
        category: entry.category,
        language: entry.language,
        source: entry.source,
        tags: entry.tags,
        reliability: entry.reliability,
        metadata: {
          lastUpdated: entry.lastUpdated.toISOString(),
          ...entry.metadata
        }
      };

      // Index in Weaviate
      await weaviateService.addDocuments([weaviateDoc]);

      // Cache frequently accessed documents in Redis
      if (entry.reliability >= 0.8 || entry.category === 'emergency') {
        await this.cacheDocument(entry);
      }

      // Update statistics
      this.updateStats(entry, 'indexed');
      
      console.log(`✅ Indexed document: ${entry.title} (${entry.category})`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to index document ${entry.title}:`, error);
      this.indexingStats.errors++;
      return false;
    }
  }

  // Index multiple medical documents in batch
  public async indexDocuments(entries: MedicalKnowledgeEntry[]): Promise<IndexingStats> {
    if (this.isBrowserEnv || !this.isInitialized) {
      console.warn('⚠️ Batch indexing not available in browser environment');
      return this.indexingStats;
    }

    console.log(`🚀 Starting batch indexing of ${entries.length} medical documents...`);
    this.indexingStats = this.initializeStats();
    this.indexingStats.totalDocuments = entries.length;

    const batchSize = 10; // Process in batches to avoid overwhelming the system
    const batches = this.chunkArray(entries, batchSize);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`📦 Processing batch ${i + 1}/${batches.length} (${batch.length} documents)`);

      // Process batch in parallel
      const batchPromises = batch.map(entry => this.indexDocument(entry));
      await Promise.allSettled(batchPromises);

      // Small delay between batches to prevent rate limiting
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    this.indexingStats.endTime = new Date();
    this.indexingStats.duration = this.indexingStats.endTime.getTime() - this.indexingStats.startTime.getTime();

    console.log('📊 Indexing completed:', this.getIndexingSummary());
    return this.indexingStats;
  }

  // Cache high-priority documents in Redis
  private async cacheDocument(entry: MedicalKnowledgeEntry): Promise<void> {
    try {
      if (redisCacheService && redisCacheService.isReady()) {
        const cacheKey = `medical_doc:${entry.category}:${entry.id}`;
        await redisCacheService.set(cacheKey, entry, 86400); // Cache for 24 hours
        
        // Also cache by common search terms
        for (const tag of entry.tags) {
          const tagKey = `medical_tag:${tag.toLowerCase()}`;
          await redisCacheService.sadd(tagKey, entry.id);
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to cache document in Redis:', error);
    }
  }

  // Validate medical knowledge entry
  private validateEntry(entry: MedicalKnowledgeEntry): boolean {
    if (!entry.id || !entry.title || !entry.content) {
      console.warn('⚠️ Invalid entry: missing required fields');
      return false;
    }

    if (!Object.values(MEDICAL_CATEGORIES).includes(entry.category)) {
      console.warn(`⚠️ Invalid category: ${entry.category}`);
      return false;
    }

    if (!['bn', 'en'].includes(entry.language)) {
      console.warn(`⚠️ Invalid language: ${entry.language}`);
      return false;
    }

    if (entry.reliability < 0 || entry.reliability > 1) {
      console.warn(`⚠️ Invalid reliability score: ${entry.reliability}`);
      return false;
    }

    if (entry.content.length < 50) {
      console.warn('⚠️ Content too short for meaningful indexing');
      return false;
    }

    return true;
  }

  // Update indexing statistics
  private updateStats(entry: MedicalKnowledgeEntry, action: 'indexed' | 'skipped'): void {
    if (action === 'indexed') {
      this.indexingStats.documentsIndexed++;
    } else {
      this.indexingStats.documentsSkipped++;
    }

    // Update category stats
    this.indexingStats.categories[entry.category] = 
      (this.indexingStats.categories[entry.category] || 0) + 1;

    // Update language stats
    this.indexingStats.languages[entry.language] = 
      (this.indexingStats.languages[entry.language] || 0) + 1;
  }

  // Utility function to chunk array into smaller batches
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // Get indexing summary
  public getIndexingSummary(): string {
    const stats = this.indexingStats;
    const successRate = stats.totalDocuments > 0 
      ? ((stats.documentsIndexed / stats.totalDocuments) * 100).toFixed(1)
      : '0';
    
    const duration = stats.duration 
      ? `${(stats.duration / 1000).toFixed(1)}s`
      : 'N/A';

    return `
📊 Medical Knowledge Indexing Summary:
✅ Successfully indexed: ${stats.documentsIndexed}/${stats.totalDocuments} (${successRate}%)
⏭️ Skipped: ${stats.documentsSkipped}
❌ Errors: ${stats.errors}
⏱️ Duration: ${duration}
📚 Categories: ${Object.keys(stats.categories).length}
🌐 Languages: ${Object.keys(stats.languages).join(', ')}
    `;
  }

  // Create sample medical knowledge entries for testing
  public createSampleMedicalKnowledge(): MedicalKnowledgeEntry[] {
    return [
      {
        id: uuidv4(),
        title: 'জ্বরের লক্ষণ ও চিকিৎসা',
        content: 'জ্বর হলো শরীরের তাপমাত্রা স্বাভাবিকের চেয়ে বেড়ে যাওয়া। সাধারণত ১০০.৪°F (৩৮°C) বা তার বেশি তাপমাত্রাকে জ্বর বলা হয়। জ্বরের কারণ হতে পারে ভাইরাল বা ব্যাকটেরিয়াল ইনফেকশন। চিকিৎসায় পর্যাপ্ত বিশ্রাম, পানি পান এবং প্রয়োজনে প্যারাসিটামল সেবন করা যেতে পারে।',
        category: 'symptoms',
        language: 'bn',
        source: 'Dr. Mimu Medical Database',
        tags: ['জ্বর', 'fever', 'তাপমাত্রা', 'ইনফেকশন', 'প্যারাসিটামল'],
        reliability: 0.9,
        lastUpdated: new Date(),
        metadata: {
          symptoms: ['জ্বর', 'মাথাব্যথা', 'শরীর ব্যথা'],
          medications: ['প্যারাসিটামল'],
          author: 'Dr. Mimu Team'
        }
      },
      {
        id: uuidv4(),
        title: 'Diabetes Management and Prevention',
        content: 'Diabetes is a chronic condition that affects how your body processes blood sugar (glucose). Type 2 diabetes can often be prevented or delayed through lifestyle changes including regular exercise, healthy diet, and weight management. Management includes monitoring blood sugar levels, taking prescribed medications, and regular medical check-ups.',
        category: 'diseases',
        language: 'en',
        source: 'Medical Research Institute',
        tags: ['diabetes', 'blood sugar', 'glucose', 'insulin', 'prevention'],
        reliability: 0.95,
        lastUpdated: new Date(),
        metadata: {
          conditions: ['Type 1 Diabetes', 'Type 2 Diabetes'],
          medications: ['Metformin', 'Insulin'],
          author: 'Endocrinology Department'
        }
      },
      {
        id: uuidv4(),
        title: 'হার্ট অ্যাটাকের জরুরি লক্ষণ',
        content: 'হার্ট অ্যাটাকের প্রধান লক্ষণগুলি হলো: বুকে তীব্র ব্যথা বা চাপ অনুভব, বাম হাতে ব্যথা, শ্বাসকষ্ট, ঘাম, বমি বমি ভাব। এই লক্ষণগুলি দেখা দিলে অবিলম্বে ৯৯৯ নম্বরে কল করুন এবং নিকটস্থ হাসপাতালে নিয়ে যান। দেরি করবেন না, কারণ দ্রুত চিকিৎসা জীবন বাঁচাতে পারে।',
        category: 'emergency',
        language: 'bn',
        source: 'Emergency Medical Guidelines',
        tags: ['হার্ট অ্যাটাক', 'heart attack', 'বুকে ব্যথা', 'জরুরি', 'emergency'],
        reliability: 1.0,
        lastUpdated: new Date(),
        metadata: {
          symptoms: ['বুকে ব্যথা', 'শ্বাসকষ্ট', 'ঘাম', 'বমি ভাব'],
          author: 'Emergency Medicine Team'
        }
      },
      {
        id: uuidv4(),
        title: 'গর্ভাবস্থায় পুষ্টি',
        content: 'গর্ভাবস্থায় সুষম পুষ্টি অত্যন্ত গুরুত্বপূর্ণ। প্রতিদিন ফলিক অ্যাসিড, আয়রন, ক্যালসিয়াম সমৃদ্ধ খাবার খেতে হবে। সবুজ শাকসবজি, ডাল, মাছ, মাংস, দুধ ও দুগ্ধজাত খাবার নিয়মিত খান। ধূমপান ও অ্যালকোহল সম্পূর্ণ বর্জন করুন। নিয়মিত ডাক্তারের পরামর্শ নিন।',
        category: 'women_health',
        language: 'bn',
        source: 'Maternal Health Guidelines',
        tags: ['গর্ভাবস্থা', 'pregnancy', 'পুষ্টি', 'nutrition', 'ফলিক অ্যাসিড'],
        reliability: 0.92,
        lastUpdated: new Date(),
        metadata: {
          author: 'Gynecology Department',
          references: ['WHO Pregnancy Guidelines', 'Bangladesh Health Ministry']
        }
      },
      {
        id: uuidv4(),
        title: 'শিশুদের টিকাদান সূচি',
        content: 'শিশুদের নিয়মিত টিকাদান অত্যন্ত গুরুত্বপূর্ণ। জন্মের পর থেকে ২ বছর পর্যন্ত নির্ধারিত সময়ে সকল টিকা দিতে হবে। BCG, DPT, পোলিও, হেপাটাইটিস বি, হাম, রুবেলা টিকা অবশ্যই দিতে হবে। টিকাদানের পর হালকা জ্বর বা ব্যথা হতে পারে, এটি স্বাভাবিক।',
        category: 'pediatrics',
        language: 'bn',
        source: 'Pediatric Immunization Program',
        tags: ['টিকা', 'vaccination', 'শিশু', 'children', 'immunization'],
        reliability: 0.98,
        lastUpdated: new Date(),
        metadata: {
          author: 'Pediatrics Department',
          references: ['EPI Bangladesh', 'WHO Immunization Schedule']
        }
      }
    ];
  }

  // Get current statistics
  public getStats(): IndexingStats {
    return { ...this.indexingStats };
  }

  // Reset statistics
  public resetStats(): void {
    this.indexingStats = this.initializeStats();
  }

  // Check if service is ready
  public isReady(): boolean {
    return this.isInitialized && !this.isBrowserEnv;
  }
}

// Export singleton instance
export const medicalKnowledgeIndexer = MedicalKnowledgeIndexer.getInstance();

// Initialize service
if (!isBrowser) {
  medicalKnowledgeIndexer.initialize().catch(console.error);
}

export default medicalKnowledgeIndexer;