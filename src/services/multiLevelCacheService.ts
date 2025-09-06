import { RedisClientType } from 'redis';
import { createHash } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { LRUCache } from 'lru-cache';

// Cache Configuration Interfaces
export interface CacheConfig {
  l1: {
    enabled: boolean;
    maxSize: number; // Maximum number of items
    maxAge: number; // TTL in milliseconds
    updateAgeOnGet: boolean;
  };
  l2: {
    enabled: boolean;
    keyPrefix: string;
    defaultTTL: number; // TTL in seconds
    compressionEnabled: boolean;
  };
  l3: {
    enabled: boolean;
    basePath: string;
    maxFileSize: number; // Maximum file size in bytes
    cleanupInterval: number; // Cleanup interval in milliseconds
    compressionEnabled: boolean;
  };
  strategy: {
    writeThrough: boolean;
    writeBack: boolean;
    readThrough: boolean;
    evictionPolicy: 'lru' | 'lfu' | 'fifo';
  };
}

export interface CacheItem<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number; // Size in bytes
  metadata?: {
    source: string;
    version: string;
    tags: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface CacheStats {
  l1: {
    hits: number;
    misses: number;
    size: number;
    maxSize: number;
    hitRate: number;
  };
  l2: {
    hits: number;
    misses: number;
    size: number;
    hitRate: number;
  };
  l3: {
    hits: number;
    misses: number;
    size: number;
    hitRate: number;
  };
  overall: {
    totalHits: number;
    totalMisses: number;
    overallHitRate: number;
  };
}

export interface CacheOperation {
  operation: 'get' | 'set' | 'delete' | 'clear';
  key: string;
  level: 'l1' | 'l2' | 'l3';
  timestamp: number;
  duration: number;
  success: boolean;
  size?: number;
}

export class MultiLevelCacheService {
  private config: CacheConfig;
  private redis: RedisClientType;
  private l1Cache: LRUCache<string, CacheItem>;
  private stats: CacheStats;
  private operations: CacheOperation[] = [];
  private cleanupTimer?: NodeJS.Timeout;
  private compressionEnabled: boolean;

  constructor(config: CacheConfig, redis: RedisClientType) {
    this.config = config;
    this.redis = redis;
    this.compressionEnabled = config.l2.compressionEnabled || config.l3.compressionEnabled;
    
    // Initialize L1 cache (in-memory)
    this.l1Cache = new LRUCache<string, CacheItem>({
      max: config.l1.maxSize,
      ttl: config.l1.maxAge,
      updateAgeOnGet: config.l1.updateAgeOnGet,
      dispose: (value, key) => {
        this.recordOperation('delete', key, 'l1', 0, true);
      },
    });
    
    // Initialize stats
    this.stats = {
      l1: { hits: 0, misses: 0, size: 0, maxSize: config.l1.maxSize, hitRate: 0 },
      l2: { hits: 0, misses: 0, size: 0, hitRate: 0 },
      l3: { hits: 0, misses: 0, size: 0, hitRate: 0 },
      overall: { totalHits: 0, totalMisses: 0, overallHitRate: 0 },
    };
    
    // Start cleanup timer for L3 cache
    if (config.l3.enabled) {
      this.startCleanupTimer();
    }
  }

  async get<T = any>(key: string, options?: {
    skipL1?: boolean;
    skipL2?: boolean;
    skipL3?: boolean;
    refreshTTL?: boolean;
  }): Promise<T | null> {
    const startTime = Date.now();
    const normalizedKey = this.normalizeKey(key);
    
    try {
      // Try L1 cache first
      if (this.config.l1.enabled && !options?.skipL1) {
        const l1Result = await this.getFromL1<T>(normalizedKey);
        if (l1Result !== null) {
          this.stats.l1.hits++;
          this.recordOperation('get', normalizedKey, 'l1', Date.now() - startTime, true);
          return l1Result;
        }
        this.stats.l1.misses++;
      }
      
      // Try L2 cache (Redis)
      if (this.config.l2.enabled && !options?.skipL2) {
        const l2Result = await this.getFromL2<T>(normalizedKey);
        if (l2Result !== null) {
          this.stats.l2.hits++;
          
          // Write back to L1 if enabled
          if (this.config.l1.enabled && this.config.strategy.writeBack) {
            await this.setToL1(normalizedKey, l2Result);
          }
          
          this.recordOperation('get', normalizedKey, 'l2', Date.now() - startTime, true);
          return l2Result.value;
        }
        this.stats.l2.misses++;
      }
      
      // Try L3 cache (Disk)
      if (this.config.l3.enabled && !options?.skipL3) {
        const l3Result = await this.getFromL3<T>(normalizedKey);
        if (l3Result !== null) {
          this.stats.l3.hits++;
          
          // Write back to L2 and L1 if enabled
          if (this.config.strategy.writeBack) {
            if (this.config.l2.enabled) {
              await this.setToL2(normalizedKey, l3Result);
            }
            if (this.config.l1.enabled) {
              await this.setToL1(normalizedKey, l3Result);
            }
          }
          
          this.recordOperation('get', normalizedKey, 'l3', Date.now() - startTime, true);
          return l3Result.value;
        }
        this.stats.l3.misses++;
      }
      
      // Cache miss
      this.recordOperation('get', normalizedKey, 'l1', Date.now() - startTime, false);
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      this.recordOperation('get', normalizedKey, 'l1', Date.now() - startTime, false);
      return null;
    } finally {
      this.updateStats();
    }
  }

  async set<T = any>(
    key: string,
    value: T,
    options?: {
      ttl?: number;
      skipL1?: boolean;
      skipL2?: boolean;
      skipL3?: boolean;
      metadata?: CacheItem['metadata'];
      priority?: 'low' | 'medium' | 'high' | 'critical';
    }
  ): Promise<boolean> {
    const startTime = Date.now();
    const normalizedKey = this.normalizeKey(key);
    const ttl = options?.ttl || this.config.l2.defaultTTL * 1000;
    
    const cacheItem: CacheItem<T> = {
      key: normalizedKey,
      value,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
      size: this.calculateSize(value),
      metadata: options?.metadata || {
        source: 'unknown',
        version: '1.0.0',
        tags: [],
        priority: options?.priority || 'medium',
      },
    };
    
    try {
      let success = true;
      
      // Write-through strategy: write to all enabled levels
      if (this.config.strategy.writeThrough) {
        if (this.config.l1.enabled && !options?.skipL1) {
          success = success && await this.setToL1(normalizedKey, cacheItem);
        }
        
        if (this.config.l2.enabled && !options?.skipL2) {
          success = success && await this.setToL2(normalizedKey, cacheItem);
        }
        
        if (this.config.l3.enabled && !options?.skipL3) {
          success = success && await this.setToL3(normalizedKey, cacheItem);
        }
      } else {
        // Write to L1 first, then propagate based on strategy
        if (this.config.l1.enabled && !options?.skipL1) {
          success = await this.setToL1(normalizedKey, cacheItem);
        }
        
        // Asynchronously write to L2 and L3 if write-back is enabled
        if (this.config.strategy.writeBack) {
          this.propagateToLowerLevels(normalizedKey, cacheItem, options);
        }
      }
      
      this.recordOperation('set', normalizedKey, 'l1', Date.now() - startTime, success, cacheItem.size);
      return success;
    } catch (error) {
      console.error('Cache set error:', error);
      this.recordOperation('set', normalizedKey, 'l1', Date.now() - startTime, false, cacheItem.size);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    const startTime = Date.now();
    const normalizedKey = this.normalizeKey(key);
    
    try {
      let success = true;
      
      // Delete from all levels
      if (this.config.l1.enabled) {
        success = success && this.deleteFromL1(normalizedKey);
      }
      
      if (this.config.l2.enabled) {
        success = success && await this.deleteFromL2(normalizedKey);
      }
      
      if (this.config.l3.enabled) {
        success = success && await this.deleteFromL3(normalizedKey);
      }
      
      this.recordOperation('delete', normalizedKey, 'l1', Date.now() - startTime, success);
      return success;
    } catch (error) {
      console.error('Cache delete error:', error);
      this.recordOperation('delete', normalizedKey, 'l1', Date.now() - startTime, false);
      return false;
    }
  }

  async clear(level?: 'l1' | 'l2' | 'l3'): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      let success = true;
      
      if (!level || level === 'l1') {
        if (this.config.l1.enabled) {
          this.l1Cache.clear();
          this.stats.l1.size = 0;
        }
      }
      
      if (!level || level === 'l2') {
        if (this.config.l2.enabled) {
          const pattern = `${this.config.l2.keyPrefix}*`;
          const keys = await this.redis.keys(pattern);
          if (keys.length > 0) {
            await this.redis.del(keys);
          }
          this.stats.l2.size = 0;
        }
      }
      
      if (!level || level === 'l3') {
        if (this.config.l3.enabled) {
          success = success && await this.clearL3Cache();
          this.stats.l3.size = 0;
        }
      }
      
      this.recordOperation('clear', level || 'all', level || 'l1', Date.now() - startTime, success);
      return success;
    } catch (error) {
      console.error('Cache clear error:', error);
      this.recordOperation('clear', level || 'all', level || 'l1', Date.now() - startTime, false);
      return false;
    }
  }

  async mget<T = any>(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>();
    
    // Process keys in batches for better performance
    const batchSize = 100;
    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      const batchPromises = batch.map(async (key) => {
        const value = await this.get<T>(key);
        return { key, value };
      });
      
      const batchResults = await Promise.all(batchPromises);
      for (const { key, value } of batchResults) {
        results.set(key, value);
      }
    }
    
    return results;
  }

  async mset<T = any>(items: Map<string, T>, options?: {
    ttl?: number;
    metadata?: CacheItem['metadata'];
  }): Promise<boolean> {
    const promises = Array.from(items.entries()).map(([key, value]) => 
      this.set(key, value, options)
    );
    
    const results = await Promise.all(promises);
    return results.every(result => result);
  }

  // L1 Cache Operations (In-Memory)
  private async getFromL1<T>(key: string): Promise<T | null> {
    const item = this.l1Cache.get(key);
    if (!item) return null;
    
    // Check if item has expired
    if (this.isExpired(item)) {
      this.l1Cache.delete(key);
      return null;
    }
    
    // Update access statistics
    item.accessCount++;
    item.lastAccessed = Date.now();
    
    return item.value as T;
  }

  private async setToL1<T>(key: string, item: CacheItem<T>): Promise<boolean> {
    try {
      this.l1Cache.set(key, item);
      this.stats.l1.size = this.l1Cache.size;
      return true;
    } catch (error) {
      console.error('L1 cache set error:', error);
      return false;
    }
  }

  private deleteFromL1(key: string): boolean {
    const deleted = this.l1Cache.delete(key);
    this.stats.l1.size = this.l1Cache.size;
    return deleted;
  }

  // L2 Cache Operations (Redis)
  private async getFromL2<T>(key: string): Promise<CacheItem<T> | null> {
    try {
      const redisKey = `${this.config.l2.keyPrefix}${key}`;
      const data = await this.redis.get(redisKey);
      
      if (!data) return null;
      
      const item: CacheItem<T> = this.config.l2.compressionEnabled ? 
        this.decompress(data) : JSON.parse(data);
      
      // Check if item has expired
      if (this.isExpired(item)) {
        await this.redis.del(redisKey);
        return null;
      }
      
      // Update access statistics
      item.accessCount++;
      item.lastAccessed = Date.now();
      
      return item;
    } catch (error) {
      console.error('L2 cache get error:', error);
      return null;
    }
  }

  private async setToL2<T>(key: string, item: CacheItem<T>): Promise<boolean> {
    try {
      const redisKey = `${this.config.l2.keyPrefix}${key}`;
      const data = this.config.l2.compressionEnabled ? 
        this.compress(item) : JSON.stringify(item);
      
      const ttlSeconds = Math.ceil(item.ttl / 1000);
      await this.redis.setEx(redisKey, ttlSeconds, data);
      
      return true;
    } catch (error) {
      console.error('L2 cache set error:', error);
      return false;
    }
  }

  private async deleteFromL2(key: string): Promise<boolean> {
    try {
      const redisKey = `${this.config.l2.keyPrefix}${key}`;
      const result = await this.redis.del(redisKey);
      return result > 0;
    } catch (error) {
      console.error('L2 cache delete error:', error);
      return false;
    }
  }

  // L3 Cache Operations (Disk)
  private async getFromL3<T>(key: string): Promise<CacheItem<T> | null> {
    try {
      const filePath = this.getL3FilePath(key);
      
      try {
        const data = await fs.readFile(filePath, 'utf8');
        const item: CacheItem<T> = this.config.l3.compressionEnabled ? 
          this.decompress(data) : JSON.parse(data);
        
        // Check if item has expired
        if (this.isExpired(item)) {
          await fs.unlink(filePath).catch(() => {}); // Ignore errors
          return null;
        }
        
        // Update access statistics
        item.accessCount++;
        item.lastAccessed = Date.now();
        
        return item;
      } catch (fileError) {
        // File doesn't exist or can't be read
        return null;
      }
    } catch (error) {
      console.error('L3 cache get error:', error);
      return null;
    }
  }

  private async setToL3<T>(key: string, item: CacheItem<T>): Promise<boolean> {
    try {
      const filePath = this.getL3FilePath(key);
      const dir = path.dirname(filePath);
      
      // Ensure directory exists
      await fs.mkdir(dir, { recursive: true });
      
      const data = this.config.l3.compressionEnabled ? 
        this.compress(item) : JSON.stringify(item);
      
      // Check file size limit
      if (Buffer.byteLength(data, 'utf8') > this.config.l3.maxFileSize) {
        console.warn(`L3 cache item too large for key: ${key}`);
        return false;
      }
      
      await fs.writeFile(filePath, data, 'utf8');
      return true;
    } catch (error) {
      console.error('L3 cache set error:', error);
      return false;
    }
  }

  private async deleteFromL3(key: string): Promise<boolean> {
    try {
      const filePath = this.getL3FilePath(key);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      // File might not exist, which is fine
      return true;
    }
  }

  private async clearL3Cache(): Promise<boolean> {
    try {
      const cacheDir = this.config.l3.basePath;
      
      try {
        const files = await fs.readdir(cacheDir, { recursive: true });
        const deletePromises = files
          .filter(file => typeof file === 'string' && file.endsWith('.cache'))
          .map(file => fs.unlink(path.join(cacheDir, file)).catch(() => {}));
        
        await Promise.all(deletePromises);
      } catch (dirError) {
        // Directory might not exist
      }
      
      return true;
    } catch (error) {
      console.error('L3 cache clear error:', error);
      return false;
    }
  }

  // Utility Methods
  private normalizeKey(key: string): string {
    // Create a consistent key format
    return createHash('md5').update(key).digest('hex');
  }

  private getL3FilePath(key: string): string {
    const hash = this.normalizeKey(key);
    const subDir = hash.substring(0, 2); // Use first 2 chars for subdirectory
    return path.join(this.config.l3.basePath, subDir, `${hash}.cache`);
  }

  private isExpired(item: CacheItem): boolean {
    return Date.now() > (item.timestamp + item.ttl);
  }

  private calculateSize(value: any): number {
    try {
      return Buffer.byteLength(JSON.stringify(value), 'utf8');
    } catch {
      return 0;
    }
  }

  private compress(data: any): string {
    // Simplified compression - in production, use a proper compression library
    try {
      const jsonString = JSON.stringify(data);
      // This is a placeholder - implement actual compression (e.g., gzip, lz4)
      return Buffer.from(jsonString).toString('base64');
    } catch {
      return JSON.stringify(data);
    }
  }

  private decompress(data: string): any {
    // Simplified decompression - in production, use a proper compression library
    try {
      const jsonString = Buffer.from(data, 'base64').toString('utf8');
      return JSON.parse(jsonString);
    } catch {
      return JSON.parse(data);
    }
  }

  private async propagateToLowerLevels<T>(
    key: string,
    item: CacheItem<T>,
    options?: { skipL2?: boolean; skipL3?: boolean }
  ): Promise<void> {
    // Asynchronously propagate to L2 and L3
    const promises: Promise<any>[] = [];
    
    if (this.config.l2.enabled && !options?.skipL2) {
      promises.push(this.setToL2(key, item));
    }
    
    if (this.config.l3.enabled && !options?.skipL3) {
      promises.push(this.setToL3(key, item));
    }
    
    // Don't wait for completion to avoid blocking
    Promise.all(promises).catch(error => {
      console.error('Error propagating to lower cache levels:', error);
    });
  }

  private recordOperation(
    operation: CacheOperation['operation'],
    key: string,
    level: CacheOperation['level'],
    duration: number,
    success: boolean,
    size?: number
  ): void {
    const op: CacheOperation = {
      operation,
      key,
      level,
      timestamp: Date.now(),
      duration,
      success,
      size,
    };
    
    this.operations.push(op);
    
    // Keep only last 1000 operations
    if (this.operations.length > 1000) {
      this.operations = this.operations.slice(-1000);
    }
  }

  private updateStats(): void {
    // Update hit rates
    const l1Total = this.stats.l1.hits + this.stats.l1.misses;
    this.stats.l1.hitRate = l1Total > 0 ? this.stats.l1.hits / l1Total : 0;
    
    const l2Total = this.stats.l2.hits + this.stats.l2.misses;
    this.stats.l2.hitRate = l2Total > 0 ? this.stats.l2.hits / l2Total : 0;
    
    const l3Total = this.stats.l3.hits + this.stats.l3.misses;
    this.stats.l3.hitRate = l3Total > 0 ? this.stats.l3.hits / l3Total : 0;
    
    // Update overall stats
    this.stats.overall.totalHits = this.stats.l1.hits + this.stats.l2.hits + this.stats.l3.hits;
    this.stats.overall.totalMisses = this.stats.l1.misses + this.stats.l2.misses + this.stats.l3.misses;
    
    const overallTotal = this.stats.overall.totalHits + this.stats.overall.totalMisses;
    this.stats.overall.overallHitRate = overallTotal > 0 ? this.stats.overall.totalHits / overallTotal : 0;
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(async () => {
      await this.performCleanup();
    }, this.config.l3.cleanupInterval);
  }

  private async performCleanup(): Promise<void> {
    try {
      // Clean up expired items from L3 cache
      if (this.config.l3.enabled) {
        await this.cleanupL3Cache();
      }
      
      // Clean up old operations
      const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
      this.operations = this.operations.filter(op => op.timestamp > cutoff);
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  private async cleanupL3Cache(): Promise<void> {
    try {
      const cacheDir = this.config.l3.basePath;
      
      try {
        const files = await fs.readdir(cacheDir, { recursive: true, withFileTypes: true });
        
        for (const file of files) {
          if (file.isFile() && file.name.endsWith('.cache')) {
            const filePath = path.join(cacheDir, file.name);
            
            try {
              const data = await fs.readFile(filePath, 'utf8');
              const item = this.config.l3.compressionEnabled ? 
                this.decompress(data) : JSON.parse(data);
              
              if (this.isExpired(item)) {
                await fs.unlink(filePath);
              }
            } catch {
              // If we can't read or parse the file, delete it
              await fs.unlink(filePath).catch(() => {});
            }
          }
        }
      } catch (dirError) {
        // Directory might not exist
      }
    } catch (error) {
      console.error('L3 cache cleanup error:', error);
    }
  }

  // Public API Methods
  getStats(): CacheStats {
    this.updateStats();
    return { ...this.stats };
  }

  getOperations(limit: number = 100): CacheOperation[] {
    return this.operations.slice(-limit);
  }

  async getSize(): Promise<{ l1: number; l2: number; l3: number; total: number }> {
    const l1Size = this.l1Cache.size;
    
    let l2Size = 0;
    if (this.config.l2.enabled) {
      try {
        const pattern = `${this.config.l2.keyPrefix}*`;
        const keys = await this.redis.keys(pattern);
        l2Size = keys.length;
      } catch {
        l2Size = 0;
      }
    }
    
    let l3Size = 0;
    if (this.config.l3.enabled) {
      try {
        const files = await fs.readdir(this.config.l3.basePath, { recursive: true });
        l3Size = files.filter(file => typeof file === 'string' && file.endsWith('.cache')).length;
      } catch {
        l3Size = 0;
      }
    }
    
    return {
      l1: l1Size,
      l2: l2Size,
      l3: l3Size,
      total: l1Size + l2Size + l3Size,
    };
  }

  async warmup(keys: string[]): Promise<void> {
    // Pre-load frequently accessed keys into L1 cache
    const promises = keys.map(key => this.get(key));
    await Promise.all(promises);
  }

  async invalidatePattern(pattern: string): Promise<number> {
    let invalidated = 0;
    
    // Invalidate from L1
    if (this.config.l1.enabled) {
      const regex = new RegExp(pattern);
      for (const [key] of this.l1Cache.entries()) {
        if (regex.test(key)) {
          this.l1Cache.delete(key);
          invalidated++;
        }
      }
    }
    
    // Invalidate from L2
    if (this.config.l2.enabled) {
      try {
        const searchPattern = `${this.config.l2.keyPrefix}*${pattern}*`;
        const keys = await this.redis.keys(searchPattern);
        if (keys.length > 0) {
          await this.redis.del(keys);
          invalidated += keys.length;
        }
      } catch (error) {
        console.error('L2 pattern invalidation error:', error);
      }
    }
    
    // Invalidate from L3 (simplified - would need more sophisticated pattern matching)
    if (this.config.l3.enabled) {
      // This is a simplified implementation
      // In production, you might want to maintain an index for pattern-based invalidation
    }
    
    return invalidated;
  }

  async close(): Promise<void> {
    // Clear cleanup timer
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    // Clear L1 cache
    this.l1Cache.clear();
    
    // Perform final cleanup
    await this.performCleanup();
    
    console.log('Multi-level cache service closed');
  }
}

// Factory function for creating cache service with default configuration
export function createMultiLevelCache(
  redis: RedisClientType,
  overrides?: Partial<CacheConfig>
): MultiLevelCacheService {
  const defaultConfig: CacheConfig = {
    l1: {
      enabled: true,
      maxSize: 1000,
      maxAge: 5 * 60 * 1000, // 5 minutes
      updateAgeOnGet: true,
    },
    l2: {
      enabled: true,
      keyPrefix: 'cache:',
      defaultTTL: 3600, // 1 hour
      compressionEnabled: false,
    },
    l3: {
      enabled: true,
      basePath: './cache',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      cleanupInterval: 60 * 60 * 1000, // 1 hour
      compressionEnabled: true,
    },
    strategy: {
      writeThrough: false,
      writeBack: true,
      readThrough: true,
      evictionPolicy: 'lru',
    },
  };
  
  const config = { ...defaultConfig, ...overrides };
  return new MultiLevelCacheService(config, redis);
}