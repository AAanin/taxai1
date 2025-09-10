// Browser environment check
const isBrowser = typeof window !== 'undefined';

// API optimization interfaces
interface CacheConfig {
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum cache size
  compressionEnabled: boolean;
  keyPrefix: string;
}

interface PerformanceMetrics {
  requestCount: number;
  cacheHitRate: number;
  avgResponseTime: number;
  errorRate: number;
  memoryUsage: number;
  lastUpdated: Date;
}

interface OptimizationStats {
  totalRequests: number;
  cachedResponses: number;
  savedTime: number; // in milliseconds
  bandwidthSaved: number; // in bytes
  costSavings: number; // estimated cost savings
}

interface APIRequest {
  endpoint: string;
  method: string;
  params?: any;
  headers?: Record<string, string>;
  timestamp: number;
}

interface CachedResponse {
  data: any;
  timestamp: number;
  ttl: number;
  size: number;
  compressed: boolean;
  hitCount: number;
}

// API Optimization Service Class
class APIOptimizationService {
  private redisCacheService: any = null;
  private isInitialized = false;
  private localCache = new Map<string, CachedResponse>();
  private performanceMetrics: PerformanceMetrics;
  private requestQueue: APIRequest[] = [];
  private readonly MAX_QUEUE_SIZE = 1000;
  
  private readonly defaultConfig: CacheConfig = {
    ttl: 300, // 5 minutes
    maxSize: 1000, // 1000 entries
    compressionEnabled: true,
    keyPrefix: 'api_cache:'
  };

  constructor() {
    this.performanceMetrics = {
      requestCount: 0,
      cacheHitRate: 0,
      avgResponseTime: 0,
      errorRate: 0,
      memoryUsage: 0,
      lastUpdated: new Date()
    };

    if (!isBrowser) {
      this.initializeServices();
    }
  }

  private async initializeServices() {
    try {
      // Load Redis cache service dynamically
      const cacheModule = await import('./redisCacheService');
      this.redisCacheService = cacheModule.redisCacheService;
      
      if (this.redisCacheService) {
        await this.redisCacheService.initialize();
        this.isInitialized = true;
        console.log('✅ API Optimization Service initialized');
      }
    } catch (error) {
      console.warn('⚠️ API Optimization Service initialization failed:', error);
    }
  }

  async initialize(): Promise<void> {
    if (!this.isInitialized && !isBrowser) {
      await this.initializeServices();
    }
  }

  // Generate cache key for API requests
  private generateCacheKey(endpoint: string, method: string, params?: any): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    const key = `${method}:${endpoint}:${paramsStr}`;
    return `${this.defaultConfig.keyPrefix}${this.hashString(key)}`;
  }

  // Simple hash function for cache keys
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Compress data if enabled
  private compressData(data: any): string {
    try {
      const jsonStr = JSON.stringify(data);
      // Simple compression simulation (in real app, use actual compression)
      return jsonStr;
    } catch (error) {
      console.error('Error compressing data:', error);
      return JSON.stringify(data);
    }
  }

  // Decompress data
  private decompressData(compressedData: string): any {
    try {
      return JSON.parse(compressedData);
    } catch (error) {
      console.error('Error decompressing data:', error);
      return null;
    }
  }

  // Cache API response
  async cacheResponse(
    endpoint: string,
    method: string,
    params: any,
    response: any,
    customTTL?: number
  ): Promise<boolean> {
    try {
      const cacheKey = this.generateCacheKey(endpoint, method, params);
      const ttl = customTTL || this.defaultConfig.ttl;
      const timestamp = Date.now();
      
      const cachedResponse: CachedResponse = {
        data: response,
        timestamp,
        ttl,
        size: JSON.stringify(response).length,
        compressed: this.defaultConfig.compressionEnabled,
        hitCount: 0
      };

      // Store in local cache
      this.localCache.set(cacheKey, cachedResponse);
      
      // Limit local cache size
      if (this.localCache.size > this.defaultConfig.maxSize) {
        const firstKey = this.localCache.keys().next().value;
        this.localCache.delete(firstKey);
      }

      // Store in Redis if available
      if (this.isInitialized && this.redisCacheService) {
        const compressedData = this.defaultConfig.compressionEnabled 
          ? this.compressData(response) 
          : JSON.stringify(response);
        
        await this.redisCacheService.set(cacheKey, compressedData, ttl);
      }

      return true;
    } catch (error) {
      console.error('Error caching API response:', error);
      return false;
    }
  }

  // Get cached API response
  async getCachedResponse(
    endpoint: string,
    method: string,
    params?: any
  ): Promise<any | null> {
    try {
      const cacheKey = this.generateCacheKey(endpoint, method, params);
      const now = Date.now();

      // Check local cache first
      const localCached = this.localCache.get(cacheKey);
      if (localCached && (now - localCached.timestamp) < (localCached.ttl * 1000)) {
        localCached.hitCount++;
        this.updateMetrics(true, 0); // Cache hit
        return localCached.data;
      }

      // Check Redis cache
      if (this.isInitialized && this.redisCacheService) {
        const cachedData = await this.redisCacheService.get(cacheKey);
        if (cachedData) {
          const response = this.defaultConfig.compressionEnabled 
            ? this.decompressData(cachedData) 
            : JSON.parse(cachedData);
          
          // Update local cache
          const cachedResponse: CachedResponse = {
            data: response,
            timestamp: now,
            ttl: this.defaultConfig.ttl,
            size: cachedData.length,
            compressed: this.defaultConfig.compressionEnabled,
            hitCount: 1
          };
          this.localCache.set(cacheKey, cachedResponse);
          
          this.updateMetrics(true, 0); // Cache hit
          return response;
        }
      }

      this.updateMetrics(false, 0); // Cache miss
      return null;
    } catch (error) {
      console.error('Error getting cached response:', error);
      this.updateMetrics(false, 0);
      return null;
    }
  }

  // Invalidate cache for specific endpoint
  async invalidateCache(endpoint: string, method?: string): Promise<boolean> {
    try {
      const pattern = method 
        ? `${this.defaultConfig.keyPrefix}${this.hashString(`${method}:${endpoint}:`)}*`
        : `${this.defaultConfig.keyPrefix}*${endpoint}*`;

      // Clear from local cache
      for (const [key] of this.localCache) {
        if (key.includes(endpoint)) {
          this.localCache.delete(key);
        }
      }

      // Clear from Redis cache
      if (this.isInitialized && this.redisCacheService) {
        // Note: This is a simplified approach. In production, use Redis SCAN with pattern
        await this.redisCacheService.deletePattern(pattern);
      }

      return true;
    } catch (error) {
      console.error('Error invalidating cache:', error);
      return false;
    }
  }

  // Update performance metrics
  private updateMetrics(cacheHit: boolean, responseTime: number) {
    this.performanceMetrics.requestCount++;
    
    if (cacheHit) {
      const totalHits = this.performanceMetrics.cacheHitRate * (this.performanceMetrics.requestCount - 1) + 1;
      this.performanceMetrics.cacheHitRate = totalHits / this.performanceMetrics.requestCount;
    } else {
      const totalHits = this.performanceMetrics.cacheHitRate * (this.performanceMetrics.requestCount - 1);
      this.performanceMetrics.cacheHitRate = totalHits / this.performanceMetrics.requestCount;
    }
    
    if (responseTime > 0) {
      const totalTime = this.performanceMetrics.avgResponseTime * (this.performanceMetrics.requestCount - 1) + responseTime;
      this.performanceMetrics.avgResponseTime = totalTime / this.performanceMetrics.requestCount;
    }
    
    this.performanceMetrics.memoryUsage = this.calculateMemoryUsage();
    this.performanceMetrics.lastUpdated = new Date();
  }

  // Calculate memory usage
  private calculateMemoryUsage(): number {
    let totalSize = 0;
    for (const cached of this.localCache.values()) {
      totalSize += cached.size;
    }
    return totalSize;
  }

  // Get performance metrics
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  // Get optimization statistics
  getOptimizationStats(): OptimizationStats {
    const cachedResponses = Math.floor(this.performanceMetrics.requestCount * this.performanceMetrics.cacheHitRate);
    const avgSavedTime = 200; // Estimated 200ms saved per cache hit
    const avgResponseSize = 1024; // Estimated 1KB per response
    
    return {
      totalRequests: this.performanceMetrics.requestCount,
      cachedResponses,
      savedTime: cachedResponses * avgSavedTime,
      bandwidthSaved: cachedResponses * avgResponseSize,
      costSavings: cachedResponses * 0.001 // Estimated $0.001 per API call
    };
  }

  // Clear all caches
  async clearAllCaches(): Promise<boolean> {
    try {
      // Clear local cache
      this.localCache.clear();
      
      // Clear Redis cache
      if (this.isInitialized && this.redisCacheService) {
        await this.redisCacheService.deletePattern(`${this.defaultConfig.keyPrefix}*`);
      }
      
      // Reset metrics
      this.performanceMetrics = {
        requestCount: 0,
        cacheHitRate: 0,
        avgResponseTime: 0,
        errorRate: 0,
        memoryUsage: 0,
        lastUpdated: new Date()
      };
      
      return true;
    } catch (error) {
      console.error('Error clearing caches:', error);
      return false;
    }
  }

  // Optimize API request with caching
  async optimizedRequest(
    endpoint: string,
    method: string = 'GET',
    params?: any,
    options?: { ttl?: number; forceRefresh?: boolean }
  ): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Check cache first (unless force refresh)
      if (!options?.forceRefresh) {
        const cachedResponse = await this.getCachedResponse(endpoint, method, params);
        if (cachedResponse) {
          console.log(`🎯 API Cache hit for ${method} ${endpoint}`);
          return cachedResponse;
        }
      }

      // Make actual API request (this would be implemented based on your API client)
      console.log(`🌐 Making API request to ${method} ${endpoint}`);
      
      // Simulate API call (replace with actual implementation)
      const response = await this.makeAPICall(endpoint, method, params);
      
      const responseTime = Date.now() - startTime;
      this.updateMetrics(false, responseTime);
      
      // Cache the response
      await this.cacheResponse(endpoint, method, params, response, options?.ttl);
      
      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(false, responseTime);
      
      // Update error rate
      const totalErrors = this.performanceMetrics.errorRate * (this.performanceMetrics.requestCount - 1) + 1;
      this.performanceMetrics.errorRate = totalErrors / this.performanceMetrics.requestCount;
      
      throw error;
    }
  }

  // Simulate API call (replace with actual implementation)
  private async makeAPICall(endpoint: string, method: string, params?: any): Promise<any> {
    // This is a placeholder - implement actual API calling logic
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: `Response from ${endpoint}`,
          timestamp: new Date().toISOString()
        });
      }, Math.random() * 1000 + 500); // Simulate 500-1500ms response time
    });
  }

  // Get service status
  getStatus(): { isInitialized: boolean; cacheSize: number; redisConnected: boolean } {
    return {
      isInitialized: this.isInitialized,
      cacheSize: this.localCache.size,
      redisConnected: !!(this.redisCacheService && this.isInitialized)
    };
  }
}

// Export singleton instance
export const apiOptimizationService = new APIOptimizationService();

// Initialize if not in browser
if (!isBrowser) {
  apiOptimizationService.initialize().catch(console.error);
}

export default apiOptimizationService;
export type { CacheConfig, PerformanceMetrics, OptimizationStats, APIRequest, CachedResponse };