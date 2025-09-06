// Browser environment check
const isBrowser = typeof window !== 'undefined';

// Conditional Redis imports for browser compatibility
let Redis: any = null;
let createClient: any = null;

if (!isBrowser) {
  try {
    Redis = require('ioredis');
    const redisModule = require('redis');
    createClient = redisModule.createClient;
  } catch (error) {
    console.warn('Redis modules not available in browser environment');
  }
}

// Redis client configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

// IORedis client for advanced features (only in Node.js)
export const redisClient = !isBrowser && Redis ? new Redis(redisConfig) : null;

// Standard Redis client for basic operations (only in Node.js)
export const standardRedisClient = !isBrowser && createClient ? createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
}) : null;

// Redis Service Class
export class RedisService {
  private static instance: RedisService;
  private client: any;
  private isConnected: boolean = false;
  private isBrowserEnv: boolean;

  private constructor() {
    this.isBrowserEnv = isBrowser;
    this.client = redisClient;
    if (!this.isBrowserEnv && this.client) {
      this.setupEventHandlers();
    }
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  private setupEventHandlers(): void {
    if (!this.client) return;
    
    this.client.on('connect', () => {
      console.log('✅ Redis connected successfully');
      this.isConnected = true;
    });

    this.client.on('error', (error) => {
      console.error('❌ Redis connection error:', error);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      console.log('🔌 Redis connection closed');
      this.isConnected = false;
    });
  }

  public async connect(): Promise<void> {
    if (this.isBrowserEnv) {
      console.warn('Redis not available in browser environment');
      return;
    }
    
    try {
      if (!this.isConnected && this.client) {
        await this.client.connect();
      }
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.isBrowserEnv || !this.client) {
      return;
    }
    
    try {
      await this.client.disconnect();
    } catch (error) {
      console.error('Failed to disconnect from Redis:', error);
    }
  }

  // Basic Cache Operations
  public async set(key: string, value: any, ttl?: number): Promise<void> {
    if (this.isBrowserEnv || !this.client) {
      // Browser fallback: use localStorage with TTL simulation
      const data = { value, timestamp: Date.now(), ttl };
      localStorage.setItem(`redis:${key}`, JSON.stringify(data));
      return;
    }
    
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error) {
      console.error(`Failed to set key ${key}:`, error);
      throw error;
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    if (this.isBrowserEnv || !this.client) {
      // Browser fallback: use localStorage with TTL check
      const stored = localStorage.getItem(`redis:${key}`);
      if (!stored) return null;
      
      try {
        const data = JSON.parse(stored);
        if (data.ttl && Date.now() - data.timestamp > data.ttl * 1000) {
          localStorage.removeItem(`redis:${key}`);
          return null;
        }
        return data.value;
      } catch {
        return null;
      }
    }
    
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Failed to get key ${key}:`, error);
      return null;
    }
  }

  public async del(key: string): Promise<void> {
    if (this.isBrowserEnv || !this.client) {
      localStorage.removeItem(`redis:${key}`);
      return;
    }
    
    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Failed to delete key ${key}:`, error);
      throw error;
    }
  }

  public async exists(key: string): Promise<boolean> {
    if (this.isBrowserEnv || !this.client) {
      return localStorage.getItem(`redis:${key}`) !== null;
    }
    
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Failed to check existence of key ${key}:`, error);
      return false;
    }
  }

  // Hash Operations for Complex Data
  public async hset(key: string, field: string, value: any): Promise<void> {
    if (this.isBrowserEnv || !this.client) {
      // Browser fallback: simulate hash with localStorage
      const hashKey = `redis:hash:${key}:${field}`;
      localStorage.setItem(hashKey, JSON.stringify(value));
      return;
    }
    
    try {
      await this.client.hset(key, field, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set hash field ${field} in ${key}:`, error);
      throw error;
    }
  }

  public async hget<T>(key: string, field: string): Promise<T | null> {
    if (this.isBrowserEnv || !this.client) {
      // Browser fallback: get from localStorage
      const hashKey = `redis:hash:${key}:${field}`;
      const stored = localStorage.getItem(hashKey);
      return stored ? JSON.parse(stored) : null;
    }
    
    try {
      const value = await this.client.hget(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Failed to get hash field ${field} from ${key}:`, error);
      return null;
    }
  }

  public async hgetall<T>(key: string): Promise<Record<string, T>> {
    if (this.isBrowserEnv || !this.client) {
      // Browser fallback: simulate hgetall with localStorage
      const result: Record<string, T> = {};
      const prefix = `redis:hash:${key}:`;
      for (let i = 0; i < localStorage.length; i++) {
        const storageKey = localStorage.key(i);
        if (storageKey && storageKey.startsWith(prefix)) {
          const field = storageKey.substring(prefix.length);
          const value = localStorage.getItem(storageKey);
          if (value) {
            result[field] = JSON.parse(value);
          }
        }
      }
      return result;
    }
    
    try {
      const hash = await this.client.hgetall(key);
      const result: Record<string, T> = {};
      for (const [field, value] of Object.entries(hash)) {
        result[field] = JSON.parse(value);
      }
      return result;
    } catch (error) {
      console.error(`Failed to get all hash fields from ${key}:`, error);
      return {};
    }
  }

  // List Operations for Queues and Logs
  public async lpush(key: string, ...values: any[]): Promise<void> {
    if (this.isBrowserEnv || !this.client) {
      // Browser fallback: simulate list with localStorage array
      const listKey = `redis:list:${key}`;
      const existing = localStorage.getItem(listKey);
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(...values);
      localStorage.setItem(listKey, JSON.stringify(list));
      return;
    }
    
    try {
      const serializedValues = values.map(v => JSON.stringify(v));
      await this.client.lpush(key, ...serializedValues);
    } catch (error) {
      console.error(`Failed to push to list ${key}:`, error);
      throw error;
    }
  }

  public async rpop<T>(key: string): Promise<T | null> {
    if (this.isBrowserEnv || !this.client) {
      // Browser fallback: pop from localStorage array
      const listKey = `redis:list:${key}`;
      const existing = localStorage.getItem(listKey);
      if (!existing) return null;
      const list = JSON.parse(existing);
      const value = list.pop();
      localStorage.setItem(listKey, JSON.stringify(list));
      return value || null;
    }
    
    try {
      const value = await this.client.rpop(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Failed to pop from list ${key}:`, error);
      return null;
    }
  }

  public async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    if (this.isBrowserEnv || !this.client) {
      // Browser fallback: slice from localStorage array
      const listKey = `redis:list:${key}`;
      const existing = localStorage.getItem(listKey);
      if (!existing) return [];
      const list = JSON.parse(existing);
      return list.slice(start, stop === -1 ? undefined : stop + 1);
    }
    
    try {
      const values = await this.client.lrange(key, start, stop);
      return values.map(v => JSON.parse(v));
    } catch (error) {
      console.error(`Failed to get range from list ${key}:`, error);
      return [];
    }
  }

  // Set Operations for Unique Collections
  public async sadd(key: string, ...members: any[]): Promise<void> {
    if (this.isBrowserEnv || !this.client) {
      // Browser fallback: simulate set with localStorage array
      const setKey = `redis:set:${key}`;
      const existing = localStorage.getItem(setKey);
      const set = new Set(existing ? JSON.parse(existing) : []);
      members.forEach(member => set.add(JSON.stringify(member)));
      localStorage.setItem(setKey, JSON.stringify([...set]));
      return;
    }
    
    try {
      const serializedMembers = members.map(m => JSON.stringify(m));
      await this.client.sadd(key, ...serializedMembers);
    } catch (error) {
      console.error(`Failed to add to set ${key}:`, error);
      throw error;
    }
  }

  public async smembers<T>(key: string): Promise<T[]> {
    if (this.isBrowserEnv || !this.client) {
      // Browser fallback: get from localStorage set
      const setKey = `redis:set:${key}`;
      const existing = localStorage.getItem(setKey);
      if (!existing) return [];
      const set = JSON.parse(existing);
      return set.map(m => JSON.parse(m));
    }
    
    try {
      const members = await this.client.smembers(key);
      return members.map(m => JSON.parse(m));
    } catch (error) {
      console.error(`Failed to get members from set ${key}:`, error);
      return [];
    }
  }

  // Utility Methods
  public async flushdb(): Promise<void> {
    if (this.isBrowserEnv || !this.client) {
      // Browser fallback: clear all redis keys from localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('redis:')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      return;
    }
    
    try {
      await this.client.flushdb();
    } catch (error) {
      console.error('Failed to flush database:', error);
      throw error;
    }
  }

  public async ping(): Promise<string> {
    if (this.isBrowserEnv || !this.client) {
      return 'PONG'; // Browser fallback
    }
    
    try {
      return await this.client.ping();
    } catch (error) {
      console.error('Failed to ping Redis:', error);
      throw error;
    }
  }

  public getClient(): Redis {
    return this.client;
  }

  public isHealthy(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const redisService = RedisService.getInstance();

// Initialize Redis connection
redisService.connect().catch(console.error);

export default redisService;