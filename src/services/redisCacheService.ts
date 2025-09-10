import { RedisCache } from '@langchain/redis';
import { BaseCache } from '@langchain/core/caches';
import { Generation } from '@langchain/core/outputs';
import { redisClient } from './redisService';

// Browser-safe hash function
const createBrowserSafeHash = (data: string): string => {
  if (typeof window !== 'undefined') {
    // Browser environment - use simple hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  } else {
    // Node.js environment - use crypto
    try {
      const crypto = require('crypto');
      return crypto.createHash('md5').update(data).digest('hex');
    } catch {
      // Fallback to simple hash
      let hash = 0;
      for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(36);
    }
  }
};

// Cache Configuration
const CACHE_TTL = parseInt(process.env.REDIS_CACHE_TTL || '3600'); // 1 hour
const CACHE_PREFIX = 'dr_mimu_cache:';

// Semantic Cache Interface
export interface SemanticCacheEntry {
  query: string;
  response: string;
  embedding?: number[];
  metadata: {
    model: string;
    timestamp: number;
    userId?: string;
    sessionId?: string;
    type: 'medical_advice' | 'medicine_info' | 'symptom_analysis' | 'general';
    language: 'en' | 'bn';
    confidence?: number;
  };
}

// Redis LangChain Cache Service with Enhanced Performance
export class RedisCacheService {
  private static instance: RedisCacheService;
  private langchainCache: RedisCache | null = null;
  private semanticCache: Map<string, SemanticCacheEntry> = new Map();
  private isInitialized: boolean = false;
  private isBrowserEnv: boolean;
  private cacheStats: {
    hits: number;
    misses: number;
    totalRequests: number;
    costSavings: number;
  } = { hits: 0, misses: 0, totalRequests: 0, costSavings: 0 };

  private constructor() {
    this.isBrowserEnv = typeof window !== 'undefined';
    
    if (!this.isBrowserEnv && redisClient) {
      try {
        this.langchainCache = new RedisCache({
          client: redisClient,
          ttl: CACHE_TTL,
        });
      } catch (error) {
        console.warn('Failed to initialize Redis LangChain Cache:', error);
      }
    }
  }

  public static getInstance(): RedisCacheService {
    if (!RedisCacheService.instance) {
      RedisCacheService.instance = new RedisCacheService();
    }
    return RedisCacheService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;
      
      if (this.isBrowserEnv) {
        console.warn('Redis Cache not available in browser environment, using fallback');
        this.isInitialized = true;
        return;
      }
      
      if (!this.langchainCache) {
        console.warn('Redis LangChain Cache not available');
        this.isInitialized = true;
        return;
      }
      
      // Test cache connection
      await this.langchainCache.lookup('test', 'test');
      
      this.isInitialized = true;
      console.log('✅ Redis LangChain Cache initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Redis Cache:', error);
      // Don't throw error, just mark as initialized with fallback
      this.isInitialized = true;
    }
  }

  // LangChain Cache Methods
  public getLangChainCache(): BaseCache | null {
    return this.langchainCache;
  }

  public async lookup(prompt: string, llmKey: string): Promise<Generation[] | null> {
    try {
      if (!this.langchainCache || this.isBrowserEnv) {
        return null;
      }
      return await this.langchainCache.lookup(prompt, llmKey);
    } catch (error) {
      console.error('❌ Cache lookup failed:', error);
      return null;
    }
  }

  public async update(prompt: string, llmKey: string, value: Generation[]): Promise<void> {
    try {
      if (!this.langchainCache || this.isBrowserEnv) {
        return;
      }
      await this.langchainCache.update(prompt, llmKey, value);
    } catch (error) {
      console.error('❌ Cache update failed:', error);
    }
  }

  // Semantic Caching Methods
  public async setSemanticCache(
    query: string,
    response: string,
    metadata: Omit<SemanticCacheEntry['metadata'], 'timestamp'>
  ): Promise<void> {
    try {
      if (this.isBrowserEnv || !redisClient) {
        return;
      }
      
      const cacheKey = this.generateSemanticCacheKey(query, metadata.type, metadata.userId);
      
      const cacheEntry: SemanticCacheEntry = {
        query,
        response,
        metadata: {
          ...metadata,
          timestamp: Date.now(),
        },
      };

      await redisClient.setex(
        `${CACHE_PREFIX}semantic:${cacheKey}`,
        CACHE_TTL,
        JSON.stringify(cacheEntry)
      );

      // Also store in a sorted set for efficient retrieval
      await redisClient.zadd(
        `${CACHE_PREFIX}semantic_queries:${metadata.type}`,
        Date.now(),
        cacheKey
      );

      console.log(`💾 Cached semantic response for: ${query.substring(0, 50)}...`);
    } catch (error) {
      console.error('❌ Failed to set semantic cache:', error);
    }
  }

  public async getSemanticCache(
    query: string,
    type: SemanticCacheEntry['metadata']['type'],
    userId?: string
  ): Promise<SemanticCacheEntry | null> {
    try {
      if (this.isBrowserEnv || !redisClient) {
        return null;
      }
      
      const cacheKey = this.generateSemanticCacheKey(query, type, userId);
      const cached = await redisClient.get(`${CACHE_PREFIX}semantic:${cacheKey}`);
      
      if (cached) {
        const entry: SemanticCacheEntry = JSON.parse(cached);
        console.log(`🎯 Cache hit for: ${query.substring(0, 50)}...`);
        return entry;
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to get semantic cache:', error);
      return null;
    }
  }

  // Similar query detection using semantic similarity
  public async findSimilarCachedQueries(
    query: string,
    type: SemanticCacheEntry['metadata']['type'],
    threshold: number = 0.85,
    limit: number = 5
  ): Promise<SemanticCacheEntry[]> {
    try {
      if (this.isBrowserEnv || !redisClient) {
        return [];
      }
      
      // Get recent queries of the same type
      const recentKeys = await redisClient.zrevrange(
        `${CACHE_PREFIX}semantic_queries:${type}`,
        0,
        limit * 2 // Get more to filter by similarity
      );

      const similarEntries: SemanticCacheEntry[] = [];

      for (const key of recentKeys) {
        const cached = await redisClient.get(`${CACHE_PREFIX}semantic:${key}`);
        if (cached) {
          const entry: SemanticCacheEntry = JSON.parse(cached);
          
          // Simple similarity check (can be enhanced with embeddings)
          const similarity = this.calculateTextSimilarity(query, entry.query);
          
          if (similarity >= threshold) {
            similarEntries.push(entry);
            if (similarEntries.length >= limit) break;
          }
        }
      }

      return similarEntries;
    } catch (error) {
      console.error('❌ Failed to find similar cached queries:', error);
      return [];
    }
  }

  // Session-based caching
  public async setSessionCache(
    sessionId: string,
    key: string,
    value: any,
    ttl?: number
  ): Promise<void> {
    try {
      if (this.isBrowserEnv || !redisClient) {
        return;
      }
      
      const cacheKey = `${CACHE_PREFIX}session:${sessionId}:${key}`;
      const serializedValue = JSON.stringify(value);
      
      if (ttl) {
        await redisClient.setex(cacheKey, ttl, serializedValue);
      } else {
        await redisClient.setex(cacheKey, CACHE_TTL, serializedValue);
      }
    } catch (error) {
      console.error('❌ Failed to set session cache:', error);
    }
  }

  public async getSessionCache<T>(sessionId: string, key: string): Promise<T | null> {
    try {
      if (this.isBrowserEnv || !redisClient) {
        return null;
      }
      
      const cacheKey = `${CACHE_PREFIX}session:${sessionId}:${key}`;
      const cached = await redisClient.get(cacheKey);
      
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('❌ Failed to get session cache:', error);
      return null;
    }
  }

  public async clearSessionCache(sessionId: string): Promise<void> {
    try {
      if (this.isBrowserEnv || !redisClient) {
        return;
      }
      
      const pattern = `${CACHE_PREFIX}session:${sessionId}:*`;
      const keys = await redisClient.keys(pattern);
      
      if (keys.length > 0) {
        await redisClient.del(...keys);
        console.log(`🧹 Cleared ${keys.length} session cache entries`);
      }
    } catch (error) {
      console.error('❌ Failed to clear session cache:', error);
    }
  }

  // User-specific caching
  public async setUserCache(
    userId: string,
    key: string,
    value: any,
    ttl?: number
  ): Promise<void> {
    try {
      if (this.isBrowserEnv || !redisClient) {
        return;
      }
      
      const cacheKey = `${CACHE_PREFIX}user:${userId}:${key}`;
      const serializedValue = JSON.stringify(value);
      
      if (ttl) {
        await redisClient.setex(cacheKey, ttl, serializedValue);
      } else {
        await redisClient.setex(cacheKey, CACHE_TTL, serializedValue);
      }
    } catch (error) {
      console.error('❌ Failed to set user cache:', error);
    }
  }

  // Semantic Caching for AI Responses
  public async setSemanticCacheAI(
    query: string,
    response: string,
    metadata: Partial<SemanticCacheEntry['metadata']>
  ): Promise<void> {
    try {
      if (this.isBrowserEnv || !redisClient) {
        // Browser fallback
        const entry: SemanticCacheEntry = {
          query,
          response,
          metadata: {
            model: metadata.model || 'unknown',
            timestamp: Date.now(),
            userId: metadata.userId,
            sessionId: metadata.sessionId,
            type: metadata.type || 'general',
            language: metadata.language || 'en',
            ...metadata
          }
        };
        this.semanticCache.set(query, entry);
        return;
      }
      
      const cacheKey = `${CACHE_PREFIX}semantic:${this.hashQuery(query)}`;
      const entry: SemanticCacheEntry = {
        query,
        response,
        metadata: {
          model: metadata.model || 'unknown',
          timestamp: Date.now(),
          userId: metadata.userId,
          sessionId: metadata.sessionId,
          type: metadata.type || 'general',
          language: metadata.language || 'en',
          ...metadata
        }
      };
      
      await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(entry));
    } catch (error) {
      console.error('❌ Failed to set semantic cache:', error);
    }
  }

  public async getSemanticCacheAI(query: string): Promise<SemanticCacheEntry | null> {
    try {
      this.cacheStats.totalRequests++;
      
      if (this.isBrowserEnv || !redisClient) {
        // Browser fallback
        const cached = this.semanticCache.get(query);
        if (cached) {
          this.cacheStats.hits++;
          this.cacheStats.costSavings += this.estimateCostSaving(cached.metadata.model);
          return cached;
        }
        this.cacheStats.misses++;
        return null;
      }
      
      const cacheKey = `${CACHE_PREFIX}semantic:${this.hashQuery(query)}`;
      const cached = await redisClient.get(cacheKey);
      
      if (cached) {
        this.cacheStats.hits++;
        const entry = JSON.parse(cached) as SemanticCacheEntry;
        this.cacheStats.costSavings += this.estimateCostSaving(entry.metadata.model);
        return entry;
      }
      
      this.cacheStats.misses++;
      return null;
    } catch (error) {
      console.error('❌ Failed to get semantic cache:', error);
      this.cacheStats.misses++;
      return null;
    }
  }

  // LLM Response Caching with Cost Optimization
  public async cacheLLMResponse(
    prompt: string,
    response: string,
    model: string,
    metadata?: any
  ): Promise<void> {
    await this.setSemanticCacheAI(prompt, response, {
      model,
      type: 'medical_advice',
      ...metadata
    });
  }

  public async getCachedLLMResponse(prompt: string): Promise<string | null> {
    const cached = await this.getSemanticCacheAI(prompt);
    return cached ? cached.response : null;
  }

  // Chat Session Caching
  public async setChatHistory(
    sessionId: string,
    messages: any[],
    ttl?: number
  ): Promise<void> {
    try {
      if (this.isBrowserEnv || !redisClient) {
        return;
      }
      
      const cacheKey = `${CACHE_PREFIX}chat:${sessionId}`;
      await redisClient.setex(
        cacheKey,
        ttl || CACHE_TTL,
        JSON.stringify(messages)
      );
    } catch (error) {
      console.error('❌ Failed to cache chat history:', error);
    }
  }

  public async getChatHistory(sessionId: string): Promise<any[] | null> {
    try {
      if (this.isBrowserEnv || !redisClient) {
        return null;
      }
      
      const cacheKey = `${CACHE_PREFIX}chat:${sessionId}`;
      const cached = await redisClient.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('❌ Failed to get chat history:', error);
      return null;
    }
  }

  // Utility Methods
  private hashQuery(query: string): string {
    // Simple hash function for query caching
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private estimateCostSaving(model: string): number {
    // Estimate cost savings based on model type
    const costPerToken = {
      'gpt-4': 0.03,
      'gpt-3.5-turbo': 0.002,
      'gemini-pro': 0.001,
      'claude': 0.008,
      'unknown': 0.005
    };
    
    const avgTokens = 150; // Average response tokens
    return (costPerToken[model] || costPerToken.unknown) * avgTokens;
  }

  // Performance Analytics
  public getCacheStatsAnalytics(): typeof this.cacheStats & { hitRate: number } {
    return {
      ...this.cacheStats,
      hitRate: this.cacheStats.totalRequests > 0 
        ? (this.cacheStats.hits / this.cacheStats.totalRequests) * 100 
        : 0
    };
  }

  public resetCacheStats(): void {
    this.cacheStats = { hits: 0, misses: 0, totalRequests: 0, costSavings: 0 };
  }

  public async getUserCache<T>(userId: string, key: string): Promise<T | null> {
    try {
      if (this.isBrowserEnv || !redisClient) {
        return null;
      }
      
      const cacheKey = `${CACHE_PREFIX}user:${userId}:${key}`;
      const cached = await redisClient.get(cacheKey);
      
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('❌ Failed to get user cache:', error);
      return null;
    }
  }

  // Medical advice caching with expiration
  public async cacheMedicalAdvice(
    symptoms: string[],
    advice: string,
    userId?: string,
    confidence?: number
  ): Promise<void> {
    try {
      const query = symptoms.join(', ');
      await this.setSemanticCache(query, advice, {
        model: 'medical_ai',
        type: 'medical_advice',
        language: 'bn',
        userId,
        confidence,
      });
    } catch (error) {
      console.error('❌ Failed to cache medical advice:', error);
    }
  }

  public async getCachedMedicalAdvice(
    symptoms: string[],
    userId?: string
  ): Promise<string | null> {
    try {
      const query = symptoms.join(', ');
      const cached = await this.getSemanticCache(query, 'medical_advice', userId);
      
      if (cached) {
        return cached.response;
      }

      // Try to find similar cached advice
      const similar = await this.findSimilarCachedQueries(query, 'medical_advice', 0.8, 1);
      if (similar.length > 0) {
        console.log('🔍 Found similar cached medical advice');
        return similar[0].response;
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to get cached medical advice:', error);
      return null;
    }
  }

  // Cache statistics
  public async getCacheStats(): Promise<{
    totalKeys: number;
    semanticCacheSize: number;
    sessionCacheSize: number;
    userCacheSize: number;
    memoryUsage: string;
  }> {
    try {
      const totalKeys = await redisClient.dbsize();
      
      const semanticKeys = await redisClient.keys(`${CACHE_PREFIX}semantic:*`);
      const sessionKeys = await redisClient.keys(`${CACHE_PREFIX}session:*`);
      const userKeys = await redisClient.keys(`${CACHE_PREFIX}user:*`);
      
      const memoryInfo = await redisClient.memory('usage');
      
      return {
        totalKeys,
        semanticCacheSize: semanticKeys.length,
        sessionCacheSize: sessionKeys.length,
        userCacheSize: userKeys.length,
        memoryUsage: `${(memoryInfo / 1024 / 1024).toFixed(2)} MB`,
      };
    } catch (error) {
      console.error('❌ Failed to get cache stats:', error);
      return {
        totalKeys: 0,
        semanticCacheSize: 0,
        sessionCacheSize: 0,
        userCacheSize: 0,
        memoryUsage: '0 MB',
      };
    }
  }

  // Utility methods
  private generateSemanticCacheKey(
    query: string,
    type: string,
    userId?: string
  ): string {
    const baseString = `${query}:${type}:${userId || 'anonymous'}`;
    return createBrowserSafeHash(baseString);
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    // Simple Jaccard similarity (can be enhanced with more sophisticated algorithms)
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  public async clearCache(pattern?: string): Promise<void> {
    try {
      const searchPattern = pattern || `${CACHE_PREFIX}*`;
      const keys = await redisClient.keys(searchPattern);
      
      if (keys.length > 0) {
        await redisClient.del(...keys);
        console.log(`🧹 Cleared ${keys.length} cache entries`);
      }
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
    }
  }

  public isReady(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const redisCacheService = RedisCacheService.getInstance();

// Initialize on import
redisCacheService.initialize().catch(console.error);

export default redisCacheService;