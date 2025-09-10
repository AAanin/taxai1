import { weaviateService, WeaviateSearchResult } from './weaviateService';
import { redisCacheService } from './redisCacheService';
import { medicalKnowledgeIndexer, MedicalKnowledgeEntry } from './medicalKnowledgeIndexer';
import { Language } from '../types';

// Browser environment check
const isBrowser = typeof window !== 'undefined';

// RAG Query Interface
export interface RAGQuery {
  question: string;
  language: Language;
  category?: string;
  userId?: string;
  sessionId?: string;
  maxResults?: number;
  minReliability?: number;
  includeCache?: boolean;
}

// RAG Response Interface
export interface RAGResponse {
  answer: string;
  sources: Array<{
    title: string;
    content: string;
    category: string;
    reliability: number;
    source: string;
    relevanceScore: number;
  }>;
  confidence: number;
  cached: boolean;
  processingTime: number;
  metadata: {
    totalSources: number;
    averageReliability: number;
    searchMethod: 'semantic' | 'hybrid' | 'cached';
    language: Language;
  };
}

// Context Building Options
interface ContextOptions {
  maxContextLength: number;
  prioritizeReliability: boolean;
  includeMetadata: boolean;
  deduplicateContent: boolean;
}

// Enhanced RAG Service
export class EnhancedRAGService {
  private static instance: EnhancedRAGService;
  private isInitialized: boolean = false;
  private isBrowserEnv: boolean;
  private defaultContextOptions: ContextOptions;

  private constructor() {
    this.isBrowserEnv = isBrowser;
    this.defaultContextOptions = {
      maxContextLength: 4000, // Maximum characters for context
      prioritizeReliability: true,
      includeMetadata: true,
      deduplicateContent: true
    };
  }

  public static getInstance(): EnhancedRAGService {
    if (!EnhancedRAGService.instance) {
      EnhancedRAGService.instance = new EnhancedRAGService();
    }
    return EnhancedRAGService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isBrowserEnv) {
      console.warn('⚠️ Enhanced RAG Service not available in browser environment');
      return;
    }

    try {
      if (this.isInitialized) return;

      // Ensure dependencies are ready
      if (!weaviateService.isReady()) {
        await weaviateService.initialize();
      }

      if (!medicalKnowledgeIndexer.isReady()) {
        await medicalKnowledgeIndexer.initialize();
      }

      this.isInitialized = true;
      console.log('✅ Enhanced RAG Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Enhanced RAG Service:', error);
      throw error;
    }
  }

  // Main RAG query method
  public async query(ragQuery: RAGQuery): Promise<RAGResponse> {
    const startTime = Date.now();
    
    if (this.isBrowserEnv || !this.isInitialized) {
      return this.createFallbackResponse(ragQuery, startTime);
    }

    try {
      // Step 1: Check cache first for performance
      if (ragQuery.includeCache !== false) {
        const cachedResponse = await this.checkCache(ragQuery);
        if (cachedResponse) {
          cachedResponse.processingTime = Date.now() - startTime;
          return cachedResponse;
        }
      }

      // Step 2: Perform semantic search in Weaviate
      const searchResults = await this.performSemanticSearch(ragQuery);
      
      if (searchResults.length === 0) {
        return this.createNoResultsResponse(ragQuery, startTime);
      }

      // Step 3: Build context from search results
      const context = await this.buildContext(searchResults, this.defaultContextOptions);
      
      // Step 4: Generate answer using context
      const answer = await this.generateContextualAnswer(ragQuery, context);
      
      // Step 5: Create response
      const response = this.createRAGResponse(
        ragQuery,
        answer,
        searchResults,
        context,
        startTime,
        false
      );

      // Step 6: Cache the response for future queries
      await this.cacheResponse(ragQuery, response);

      return response;
    } catch (error) {
      console.error('❌ RAG query failed:', error);
      return this.createErrorResponse(ragQuery, startTime, error);
    }
  }

  // Check Redis cache for similar queries
  private async checkCache(ragQuery: RAGQuery): Promise<RAGResponse | null> {
    try {
      if (!redisCacheService || !redisCacheService.isReady()) {
        return null;
      }

      // Create cache key based on question and language
      const cacheKey = this.createCacheKey(ragQuery);
      const cached = await redisCacheService.get(cacheKey);
      
      if (cached) {
        console.log('🎯 RAG cache hit for query:', ragQuery.question.substring(0, 50));
        return {
          ...cached,
          cached: true,
          metadata: {
            ...cached.metadata,
            searchMethod: 'cached' as const
          }
        };
      }

      // Check for semantically similar cached queries
      const similarCached = await this.findSimilarCachedQueries(ragQuery);
      if (similarCached) {
        console.log('🔍 Found similar cached RAG response');
        return {
          ...similarCached,
          cached: true,
          metadata: {
            ...similarCached.metadata,
            searchMethod: 'cached' as const
          }
        };
      }

      return null;
    } catch (error) {
      console.warn('⚠️ Cache check failed:', error);
      return null;
    }
  }

  // Perform semantic search using Weaviate
  private async performSemanticSearch(ragQuery: RAGQuery): Promise<WeaviateSearchResult[]> {
    try {
      const searchOptions = {
        limit: ragQuery.maxResults || 10,
        certainty: 0.7, // Minimum relevance threshold
        category: ragQuery.category,
        language: ragQuery.language,
        minReliability: ragQuery.minReliability || 0.6
      };

      // Try hybrid search first (combines semantic + keyword)
      let results = await weaviateService.hybridSearch(ragQuery.question, {
        ...searchOptions,
        alpha: 0.75 // Favor semantic search
      });

      // If hybrid search doesn't return enough results, try pure semantic search
      if (results.length < 3) {
        const semanticResults = await weaviateService.semanticSearch(
          ragQuery.question,
          searchOptions
        );
        
        // Merge and deduplicate results
        const combinedResults = [...results, ...semanticResults];
        const uniqueResults = this.deduplicateResults(combinedResults);
        results = uniqueResults.slice(0, searchOptions.limit);
      }

      console.log(`🔍 Found ${results.length} relevant documents for query`);
      return results;
    } catch (error) {
      console.error('❌ Semantic search failed:', error);
      return [];
    }
  }

  // Build context from search results
  private async buildContext(
    searchResults: WeaviateSearchResult[],
    options: ContextOptions
  ): Promise<string> {
    try {
      let context = '';
      let currentLength = 0;
      const processedContent = new Set<string>();

      // Sort by reliability and relevance if prioritizing reliability
      const sortedResults = options.prioritizeReliability
        ? searchResults.sort((a, b) => {
            const reliabilityDiff = b.document.reliability - a.document.reliability;
            return reliabilityDiff !== 0 ? reliabilityDiff : b.score - a.score;
          })
        : searchResults.sort((a, b) => b.score - a.score);

      for (const result of sortedResults) {
        const { document } = result;
        
        // Skip if content is too similar (deduplication)
        if (options.deduplicateContent && this.isContentSimilar(document.content, processedContent)) {
          continue;
        }

        // Prepare content section
        let contentSection = `\n\n--- ${document.title} (${document.category}) ---\n`;
        contentSection += document.content;
        
        if (options.includeMetadata) {
          contentSection += `\n[Source: ${document.source}, Reliability: ${(document.reliability * 100).toFixed(0)}%]`;
        }

        // Check if adding this content would exceed the limit
        if (currentLength + contentSection.length > options.maxContextLength) {
          // Try to add a truncated version
          const remainingSpace = options.maxContextLength - currentLength - 100; // Leave some buffer
          if (remainingSpace > 200) {
            const truncatedContent = document.content.substring(0, remainingSpace) + '...';
            contentSection = `\n\n--- ${document.title} (${document.category}) ---\n${truncatedContent}`;
            if (options.includeMetadata) {
              contentSection += `\n[Source: ${document.source}, Reliability: ${(document.reliability * 100).toFixed(0)}%]`;
            }
            context += contentSection;
          }
          break;
        }

        context += contentSection;
        currentLength += contentSection.length;
        processedContent.add(document.content.substring(0, 100)); // Store first 100 chars for similarity check
      }

      return context.trim();
    } catch (error) {
      console.error('❌ Context building failed:', error);
      return 'No relevant medical information found.';
    }
  }

  // Generate contextual answer using the built context
  private async generateContextualAnswer(
    ragQuery: RAGQuery,
    context: string
  ): Promise<string> {
    try {
      // For now, return a structured response based on context
      // In a full implementation, this would use an LLM to generate a natural answer
      
      if (!context || context.trim() === '') {
        return ragQuery.language === 'bn'
          ? 'দুঃখিত, আপনার প্রশ্নের জন্য পর্যাপ্ত তথ্য পাওয়া যায়নি। অনুগ্রহ করে আরও নির্দিষ্ট প্রশ্ন করুন বা ডাক্তারের পরামর্শ নিন।'
          : 'Sorry, insufficient information found for your question. Please ask a more specific question or consult a doctor.';
      }

      // Extract key information from context
      const contextSummary = this.extractKeyInformation(context, ragQuery.language);
      
      return contextSummary;
    } catch (error) {
      console.error('❌ Answer generation failed:', error);
      return ragQuery.language === 'bn'
        ? 'উত্তর তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
        : 'Failed to generate answer. Please try again.';
    }
  }

  // Extract key information from context
  private extractKeyInformation(context: string, language: Language): string {
    // Simple extraction logic - in production, this would be more sophisticated
    const sections = context.split('---').filter(section => section.trim());
    
    if (sections.length === 0) {
      return language === 'bn'
        ? 'কোনো প্রাসঙ্গিক তথ্য পাওয়া যায়নি।'
        : 'No relevant information found.';
    }

    // Take the most relevant sections and create a summary
    const topSections = sections.slice(0, 3); // Top 3 most relevant
    
    let summary = language === 'bn'
      ? 'আপনার প্রশ্নের ভিত্তিতে পাওয়া তথ্য:\n\n'
      : 'Based on your question, here is the relevant information:\n\n';

    topSections.forEach((section, index) => {
      const lines = section.split('\n').filter(line => line.trim());
      if (lines.length > 1) {
        const title = lines[0].replace(/\(.*?\)/, '').trim();
        const content = lines.slice(1, -1).join(' ').substring(0, 300); // First 300 chars
        summary += `${index + 1}. **${title}**\n${content}...\n\n`;
      }
    });

    summary += language === 'bn'
      ? '\n⚠️ **গুরুত্বপূর্ণ**: এই তথ্য শুধুমাত্র সাধারণ জ্ঞানের জন্য। গুরুতর সমস্যার জন্য অবশ্যই ডাক্তারের পরামর্শ নিন।'
      : '\n⚠️ **Important**: This information is for general knowledge only. For serious issues, please consult a doctor.';

    return summary;
  }

  // Create RAG response object
  private createRAGResponse(
    ragQuery: RAGQuery,
    answer: string,
    searchResults: WeaviateSearchResult[],
    context: string,
    startTime: number,
    cached: boolean
  ): RAGResponse {
    const sources = searchResults.map(result => ({
      title: result.document.title,
      content: result.document.content.substring(0, 200) + '...', // Truncate for response
      category: result.document.category,
      reliability: result.document.reliability,
      source: result.document.source,
      relevanceScore: result.score
    }));

    const averageReliability = sources.length > 0
      ? sources.reduce((sum, source) => sum + source.reliability, 0) / sources.length
      : 0;

    const confidence = this.calculateConfidence(searchResults, context);

    return {
      answer,
      sources,
      confidence,
      cached,
      processingTime: Date.now() - startTime,
      metadata: {
        totalSources: sources.length,
        averageReliability,
        searchMethod: cached ? 'cached' : 'hybrid',
        language: ragQuery.language
      }
    };
  }

  // Calculate confidence score based on search results and context
  private calculateConfidence(searchResults: WeaviateSearchResult[], context: string): number {
    if (searchResults.length === 0) return 0;

    // Factors affecting confidence:
    // 1. Number of relevant sources
    // 2. Average reliability of sources
    // 3. Average relevance score
    // 4. Context length (more context = higher confidence)

    const sourceCount = Math.min(searchResults.length / 5, 1); // Max benefit from 5 sources
    const avgReliability = searchResults.reduce((sum, result) => sum + result.document.reliability, 0) / searchResults.length;
    const avgRelevance = searchResults.reduce((sum, result) => sum + result.score, 0) / searchResults.length;
    const contextFactor = Math.min(context.length / 2000, 1); // Max benefit from 2000 chars

    const confidence = (sourceCount * 0.3 + avgReliability * 0.4 + avgRelevance * 0.2 + contextFactor * 0.1);
    return Math.round(confidence * 100) / 100; // Round to 2 decimal places
  }

  // Utility methods
  private createCacheKey(ragQuery: RAGQuery): string {
    const normalizedQuestion = ragQuery.question.toLowerCase().trim();
    return `rag:${ragQuery.language}:${this.hashString(normalizedQuestion)}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private async findSimilarCachedQueries(ragQuery: RAGQuery): Promise<RAGResponse | null> {
    // Simplified similarity check - in production, use vector similarity
    try {
      if (!redisCacheService || !redisCacheService.isReady()) {
        return null;
      }

      // This is a placeholder - implement proper semantic similarity
      const keywords = ragQuery.question.toLowerCase().split(' ').filter(word => word.length > 3);
      
      for (const keyword of keywords.slice(0, 3)) { // Check top 3 keywords
        const similarKey = `rag:${ragQuery.language}:*${keyword}*`;
        // In a real implementation, you'd use Redis SCAN with pattern matching
        // For now, return null to indicate no similar queries found
      }

      return null;
    } catch (error) {
      console.warn('⚠️ Similar query search failed:', error);
      return null;
    }
  }

  private deduplicateResults(results: WeaviateSearchResult[]): WeaviateSearchResult[] {
    const seen = new Set<string>();
    return results.filter(result => {
      const key = `${result.document.title}:${result.document.category}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private isContentSimilar(content: string, processedContent: Set<string>): boolean {
    const contentStart = content.substring(0, 100);
    for (const processed of processedContent) {
      if (this.calculateSimilarity(contentStart, processed) > 0.8) {
        return true;
      }
    }
    return false;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Simple Jaccard similarity
    const set1 = new Set(str1.toLowerCase().split(' '));
    const set2 = new Set(str2.toLowerCase().split(' '));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }

  private async cacheResponse(ragQuery: RAGQuery, response: RAGResponse): Promise<void> {
    try {
      if (redisCacheService && redisCacheService.isReady() && response.confidence > 0.7) {
        const cacheKey = this.createCacheKey(ragQuery);
        await redisCacheService.set(cacheKey, response, 3600); // Cache for 1 hour
        console.log('💾 RAG response cached successfully');
      }
    } catch (error) {
      console.warn('⚠️ Failed to cache RAG response:', error);
    }
  }

  // Fallback responses
  private createFallbackResponse(ragQuery: RAGQuery, startTime: number): RAGResponse {
    return {
      answer: ragQuery.language === 'bn'
        ? 'দুঃখিত, AI সেবা সাময়িকভাবে অনুপলব্ধ। অনুগ্রহ করে পরে আবার চেষ্টা করুন।'
        : 'Sorry, AI service is temporarily unavailable. Please try again later.',
      sources: [],
      confidence: 0,
      cached: false,
      processingTime: Date.now() - startTime,
      metadata: {
        totalSources: 0,
        averageReliability: 0,
        searchMethod: 'cached',
        language: ragQuery.language
      }
    };
  }

  private createNoResultsResponse(ragQuery: RAGQuery, startTime: number): RAGResponse {
    return {
      answer: ragQuery.language === 'bn'
        ? 'আপনার প্রশ্নের জন্য কোনো প্রাসঙ্গিক তথ্য পাওয়া যায়নি। অনুগ্রহ করে আরও নির্দিষ্ট প্রশ্ন করুন বা ডাক্তারের পরামর্শ নিন।'
        : 'No relevant information found for your question. Please ask a more specific question or consult a doctor.',
      sources: [],
      confidence: 0,
      cached: false,
      processingTime: Date.now() - startTime,
      metadata: {
        totalSources: 0,
        averageReliability: 0,
        searchMethod: 'semantic',
        language: ragQuery.language
      }
    };
  }

  private createErrorResponse(ragQuery: RAGQuery, startTime: number, error: any): RAGResponse {
    console.error('RAG Error:', error);
    return {
      answer: ragQuery.language === 'bn'
        ? 'তথ্য খোঁজার সময় সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
        : 'An error occurred while searching for information. Please try again.',
      sources: [],
      confidence: 0,
      cached: false,
      processingTime: Date.now() - startTime,
      metadata: {
        totalSources: 0,
        averageReliability: 0,
        searchMethod: 'semantic',
        language: ragQuery.language
      }
    };
  }

  // Public utility methods
  public isReady(): boolean {
    return this.isInitialized && !this.isBrowserEnv;
  }

  public async getStats(): Promise<any> {
    if (!this.isReady()) return null;
    
    return {
      weaviateDocuments: await weaviateService.getDocumentCount(),
      weaviateHealth: await weaviateService.healthCheck(),
      indexerStats: medicalKnowledgeIndexer.getStats()
    };
  }
}

// Export singleton instance
export const enhancedRAGService = EnhancedRAGService.getInstance();

// Initialize service
if (!isBrowser) {
  enhancedRAGService.initialize().catch(console.error);
}

export default enhancedRAGService;