import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';

// Browser environment check
const isBrowser = typeof window !== 'undefined';

// Chat session interfaces
interface ChatSession {
  sessionId: string;
  userId?: string;
  messages: BaseMessage[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    messageCount: number;
    totalTokens?: number;
    avgResponseTime?: number;
  };
}

interface CacheStats {
  totalSessions: number;
  totalMessages: number;
  cacheHitRate: number;
  avgSessionDuration: number;
  memoryUsage: number;
}

interface SessionQuery {
  sessionId: string;
  limit?: number;
  offset?: number;
  includeMetadata?: boolean;
}

// Chat Caching Service Class
class ChatCachingService {
  private redisMemoryService: any = null;
  private redisCacheService: any = null;
  private isInitialized = false;
  private sessionCache = new Map<string, ChatSession>();
  private readonly SESSION_TTL = 24 * 60 * 60; // 24 hours in seconds
  private readonly MAX_MESSAGES_PER_SESSION = 100;
  private readonly CACHE_KEY_PREFIX = 'chat_session:';

  constructor() {
    if (!isBrowser) {
      this.initializeServices();
    }
  }

  private async initializeServices() {
    try {
      // Load Redis services dynamically
      const redisModule = await import('./redisMemoryService');
      const cacheModule = await import('./redisCacheService');
      
      this.redisMemoryService = redisModule.redisMemoryService;
      this.redisCacheService = cacheModule.redisCacheService;
      
      if (this.redisMemoryService && this.redisCacheService) {
        await this.redisMemoryService.initialize();
        await this.redisCacheService.initialize();
        this.isInitialized = true;
        console.log('✅ Chat Caching Service initialized');
      }
    } catch (error) {
      console.warn('⚠️ Chat Caching Service initialization failed:', error);
    }
  }

  async initialize(): Promise<void> {
    if (!this.isInitialized && !isBrowser) {
      await this.initializeServices();
    }
  }

  // Store chat session
  async storeSession(session: ChatSession): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        this.sessionCache.set(session.sessionId, session);
        return true;
      }

      const cacheKey = `${this.CACHE_KEY_PREFIX}${session.sessionId}`;
      const sessionData = {
        ...session,
        messages: session.messages.map(msg => ({
          type: msg._getType(),
          content: msg.content,
          additional_kwargs: msg.additional_kwargs || {}
        }))
      };

      await this.redisCacheService.set(
        cacheKey,
        JSON.stringify(sessionData),
        this.SESSION_TTL
      );

      // Also store in memory cache for quick access
      this.sessionCache.set(session.sessionId, session);
      
      return true;
    } catch (error) {
      console.error('Error storing chat session:', error);
      return false;
    }
  }

  // Retrieve chat session
  async getSession(sessionId: string): Promise<ChatSession | null> {
    try {
      // Check memory cache first
      if (this.sessionCache.has(sessionId)) {
        return this.sessionCache.get(sessionId)!;
      }

      if (!this.isInitialized) {
        return null;
      }

      const cacheKey = `${this.CACHE_KEY_PREFIX}${sessionId}`;
      const cachedData = await this.redisCacheService.get(cacheKey);
      
      if (cachedData) {
        const sessionData = JSON.parse(cachedData);
        
        // Reconstruct messages
        const messages = sessionData.messages.map((msgData: any) => {
          if (msgData.type === 'human') {
            return new HumanMessage(msgData.content, msgData.additional_kwargs);
          } else if (msgData.type === 'ai') {
            return new AIMessage(msgData.content, msgData.additional_kwargs);
          }
          return null;
        }).filter(Boolean);

        const session: ChatSession = {
          ...sessionData,
          messages,
          metadata: {
            ...sessionData.metadata,
            createdAt: new Date(sessionData.metadata.createdAt),
            updatedAt: new Date(sessionData.metadata.updatedAt)
          }
        };

        // Update memory cache
        this.sessionCache.set(sessionId, session);
        return session;
      }

      return null;
    } catch (error) {
      console.error('Error retrieving chat session:', error);
      return null;
    }
  }

  // Add message to session
  async addMessageToSession(
    sessionId: string,
    message: BaseMessage,
    userId?: string
  ): Promise<boolean> {
    try {
      let session = await this.getSession(sessionId);
      
      if (!session) {
        // Create new session
        session = {
          sessionId,
          userId,
          messages: [],
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            messageCount: 0
          }
        };
      }

      // Add message
      session.messages.push(message);
      session.metadata.updatedAt = new Date();
      session.metadata.messageCount = session.messages.length;

      // Limit messages per session
      if (session.messages.length > this.MAX_MESSAGES_PER_SESSION) {
        session.messages = session.messages.slice(-this.MAX_MESSAGES_PER_SESSION);
        session.metadata.messageCount = this.MAX_MESSAGES_PER_SESSION;
      }

      return await this.storeSession(session);
    } catch (error) {
      console.error('Error adding message to session:', error);
      return false;
    }
  }

  // Get session messages with pagination
  async getSessionMessages(query: SessionQuery): Promise<BaseMessage[]> {
    try {
      const session = await this.getSession(query.sessionId);
      if (!session) return [];

      const { limit = 50, offset = 0 } = query;
      const messages = session.messages.slice(offset, offset + limit);
      
      return messages;
    } catch (error) {
      console.error('Error getting session messages:', error);
      return [];
    }
  }

  // Clear session
  async clearSession(sessionId: string): Promise<boolean> {
    try {
      // Remove from memory cache
      this.sessionCache.delete(sessionId);

      if (!this.isInitialized) {
        return true;
      }

      const cacheKey = `${this.CACHE_KEY_PREFIX}${sessionId}`;
      await this.redisCacheService.delete(cacheKey);
      
      return true;
    } catch (error) {
      console.error('Error clearing session:', error);
      return false;
    }
  }

  // Get cache statistics
  async getCacheStats(): Promise<CacheStats> {
    try {
      const stats: CacheStats = {
        totalSessions: this.sessionCache.size,
        totalMessages: 0,
        cacheHitRate: 0,
        avgSessionDuration: 0,
        memoryUsage: 0
      };

      // Calculate from memory cache
      let totalMessages = 0;
      let totalDuration = 0;
      const now = new Date();

      for (const session of this.sessionCache.values()) {
        totalMessages += session.messages.length;
        const duration = now.getTime() - session.metadata.createdAt.getTime();
        totalDuration += duration;
      }

      stats.totalMessages = totalMessages;
      stats.avgSessionDuration = stats.totalSessions > 0 ? totalDuration / stats.totalSessions : 0;
      stats.memoryUsage = JSON.stringify(Array.from(this.sessionCache.values())).length;

      return stats;
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        totalSessions: 0,
        totalMessages: 0,
        cacheHitRate: 0,
        avgSessionDuration: 0,
        memoryUsage: 0
      };
    }
  }

  // Cleanup expired sessions
  async cleanupExpiredSessions(): Promise<number> {
    try {
      let cleanedCount = 0;
      const now = new Date();
      const expireTime = this.SESSION_TTL * 1000; // Convert to milliseconds

      for (const [sessionId, session] of this.sessionCache.entries()) {
        const age = now.getTime() - session.metadata.updatedAt.getTime();
        if (age > expireTime) {
          await this.clearSession(sessionId);
          cleanedCount++;
        }
      }

      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      return 0;
    }
  }

  // Get service status
  getStatus(): { isInitialized: boolean; cacheSize: number; redisConnected: boolean } {
    return {
      isInitialized: this.isInitialized,
      cacheSize: this.sessionCache.size,
      redisConnected: !!(this.redisMemoryService && this.redisCacheService)
    };
  }
}

// Export singleton instance
export const chatCachingService = new ChatCachingService();

// Initialize if not in browser
if (!isBrowser) {
  chatCachingService.initialize().catch(console.error);
}

export default chatCachingService;
export type { ChatSession, CacheStats, SessionQuery };