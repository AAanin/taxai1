// Mock module for @langchain/redis to prevent browser import errors

// Mock RedisVectorStore
export class RedisVectorStore {
  constructor() {
    console.warn('RedisVectorStore not available in browser environment');
  }
  
  static fromTexts() {
    console.warn('RedisVectorStore.fromTexts not available in browser environment');
    return null;
  }
  
  static fromDocuments() {
    console.warn('RedisVectorStore.fromDocuments not available in browser environment');
    return null;
  }
  
  async similaritySearch() {
    console.warn('RedisVectorStore.similaritySearch not available in browser environment');
    return [];
  }
  
  async addDocuments() {
    console.warn('RedisVectorStore.addDocuments not available in browser environment');
    return [];
  }
}

// Mock RedisCache
export class RedisCache {
  constructor() {
    console.warn('RedisCache not available in browser environment');
  }
  
  async lookup() {
    return null;
  }
  
  async update() {
    // No-op
  }
}

// Mock RedisChatMessageHistory
export class RedisChatMessageHistory {
  constructor() {
    console.warn('RedisChatMessageHistory not available in browser environment');
  }
  
  async getMessages() {
    return [];
  }
  
  async addMessage() {
    // No-op
  }
  
  async clear() {
    // No-op
  }
}

// Default export
export default {
  RedisVectorStore,
  RedisCache,
  RedisChatMessageHistory
};