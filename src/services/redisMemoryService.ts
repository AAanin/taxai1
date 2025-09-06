import { BufferMemory } from 'langchain/memory';
import { RedisChatMessageHistory } from '@langchain/redis';
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { redisClient } from './redisService';
import { redisCacheService } from './redisCacheService';

// Browser environment check
const isBrowser = typeof window !== 'undefined';

// Memory Configuration
const MEMORY_TTL = parseInt(process.env.REDIS_SESSION_TTL || '86400'); // 24 hours
const MEMORY_PREFIX = 'dr_mimu_memory:';

// Agent Memory Interface
export interface AgentMemoryEntry {
  sessionId: string;
  userId?: string;
  doctorId?: string;
  messages: BaseMessage[];
  context: {
    patientInfo?: {
      name?: string;
      age?: number;
      gender?: string;
      medicalHistory?: string[];
      currentSymptoms?: string[];
      allergies?: string[];
    };
    conversationSummary?: string;
    lastInteraction: number;
    totalInteractions: number;
    topics: string[];
    sentiment?: 'positive' | 'neutral' | 'negative' | 'concerned';
    urgency?: 'low' | 'medium' | 'high' | 'emergency';
  };
  metadata: {
    language: 'en' | 'bn';
    platform: 'web' | 'mobile' | 'api';
    userAgent?: string;
    location?: string;
  };
}

// Conversation Context
export interface ConversationContext {
  currentTopic?: string;
  extractedSymptoms: string[];
  suggestedMedicines: string[];
  recommendedDoctors: string[];
  followUpQuestions: string[];
  riskAssessment?: {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    recommendations: string[];
  };
}

// Redis Memory Service for AI Agents
export class RedisMemoryService {
  private static instance: RedisMemoryService;
  private isInitialized: boolean = false;
  private isBrowserEnv: boolean;

  private constructor() {
    this.isBrowserEnv = isBrowser;
  }

  public static getInstance(): RedisMemoryService {
    if (!RedisMemoryService.instance) {
      RedisMemoryService.instance = new RedisMemoryService();
    }
    return RedisMemoryService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;
      
      if (this.isBrowserEnv) {
        console.warn('Redis Memory Service not available in browser environment');
        this.isInitialized = true;
        return;
      }
      
      if (!redisClient) {
        console.warn('Redis client not available');
        this.isInitialized = true;
        return;
      }
      
      // Test memory operations
      await this.ping();
      
      this.isInitialized = true;
      console.log('✅ Redis Memory Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Redis Memory Service:', error);
      // Don't throw error, just mark as initialized with fallback
      this.isInitialized = true;
    }
  }

  // Create LangChain Memory with Redis backend
  public createBufferMemory(sessionId: string, options?: {
    returnMessages?: boolean;
    memoryKey?: string;
    maxTokenLimit?: number;
  }): BufferMemory | null {
    if (this.isBrowserEnv || !redisClient) {
      console.warn('Buffer memory not available in browser environment');
      return null;
    }
    
    const { returnMessages = true, memoryKey = 'chat_history', maxTokenLimit = 2000 } = options || {};

    try {
      const chatHistory = new RedisChatMessageHistory({
        sessionId,
        client: redisClient,
        ttl: MEMORY_TTL,
      });

      return new BufferMemory({
        chatHistory,
        returnMessages,
        memoryKey,
        maxTokenLimit,
      });
    } catch (error) {
      console.error('Failed to create buffer memory:', error);
      return null;
    }
  }

  // Store complete agent memory
  public async storeAgentMemory(memory: AgentMemoryEntry): Promise<void> {
    try {
      if (this.isBrowserEnv || !redisClient) {
        console.warn('Agent memory storage not available in browser environment');
        return;
      }
      
      const memoryKey = `${MEMORY_PREFIX}agent:${memory.sessionId}`;
      
      // Update last interaction time
      memory.context.lastInteraction = Date.now();
      
      // Store the complete memory object
      await redisClient.setex(
        memoryKey,
        MEMORY_TTL,
        JSON.stringify(memory)
      );

      // Store in user index for quick retrieval
      if (memory.userId) {
        await redisClient.sadd(
          `${MEMORY_PREFIX}user_sessions:${memory.userId}`,
          memory.sessionId
        );
        await redisClient.expire(
          `${MEMORY_PREFIX}user_sessions:${memory.userId}`,
          MEMORY_TTL
        );
      }

      // Store in doctor index if applicable
      if (memory.doctorId) {
        await redisClient.sadd(
          `${MEMORY_PREFIX}doctor_sessions:${memory.doctorId}`,
          memory.sessionId
        );
        await redisClient.expire(
          `${MEMORY_PREFIX}doctor_sessions:${memory.doctorId}`,
          MEMORY_TTL
        );
      }

      console.log(`💾 Stored agent memory for session: ${memory.sessionId}`);
    } catch (error) {
      console.error('❌ Failed to store agent memory:', error);
      if (!this.isBrowserEnv) {
        throw error;
      }
    }
  }

  // Retrieve agent memory
  public async getAgentMemory(sessionId: string): Promise<AgentMemoryEntry | null> {
    try {
      if (this.isBrowserEnv || !redisClient) {
        console.warn('Agent memory retrieval not available in browser environment');
        return null;
      }
      
      const memoryKey = `${MEMORY_PREFIX}agent:${sessionId}`;
      const stored = await redisClient.get(memoryKey);
      
      if (stored) {
        const memory: AgentMemoryEntry = JSON.parse(stored);
        console.log(`🧠 Retrieved agent memory for session: ${sessionId}`);
        return memory;
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to get agent memory:', error);
      return null;
    }
  }

  // Add message to conversation
  public async addMessage(
    sessionId: string,
    message: BaseMessage,
    context?: Partial<ConversationContext>
  ): Promise<void> {
    try {
      // Get existing memory or create new
      let memory = await this.getAgentMemory(sessionId);
      
      if (!memory) {
        memory = {
          sessionId,
          messages: [],
          context: {
            lastInteraction: Date.now(),
            totalInteractions: 0,
            topics: [],
          },
          metadata: {
            language: 'bn',
            platform: 'web',
          },
        };
      }

      // Add new message
      memory.messages.push(message);
      memory.context.totalInteractions++;
      memory.context.lastInteraction = Date.now();

      // Update context if provided
      if (context) {
        if (context.currentTopic && !memory.context.topics.includes(context.currentTopic)) {
          memory.context.topics.push(context.currentTopic);
        }
        
        // Merge conversation context
        const conversationContext = await this.getConversationContext(sessionId) || {};
        await this.updateConversationContext(sessionId, { ...conversationContext, ...context });
      }

      // Limit message history to prevent memory bloat
      if (memory.messages.length > 50) {
        memory.messages = memory.messages.slice(-40); // Keep last 40 messages
      }

      await this.storeAgentMemory(memory);
    } catch (error) {
      console.error('❌ Failed to add message:', error);
      throw error;
    }
  }

  // Get conversation history
  public async getConversationHistory(
    sessionId: string,
    limit?: number
  ): Promise<BaseMessage[]> {
    try {
      const memory = await this.getAgentMemory(sessionId);
      
      if (!memory) return [];

      const messages = memory.messages;
      return limit ? messages.slice(-limit) : messages;
    } catch (error) {
      console.error('❌ Failed to get conversation history:', error);
      return [];
    }
  }

  // Store conversation context
  public async updateConversationContext(
    sessionId: string,
    context: Partial<ConversationContext>
  ): Promise<void> {
    try {
      const contextKey = `${MEMORY_PREFIX}context:${sessionId}`;
      
      // Get existing context
      const existing = await redisClient.get(contextKey);
      const currentContext: ConversationContext = existing ? JSON.parse(existing) : {
        extractedSymptoms: [],
        suggestedMedicines: [],
        recommendedDoctors: [],
        followUpQuestions: [],
      };

      // Merge with new context
      const updatedContext = { ...currentContext, ...context };
      
      await redisClient.setex(
        contextKey,
        MEMORY_TTL,
        JSON.stringify(updatedContext)
      );

      console.log(`🔄 Updated conversation context for session: ${sessionId}`);
    } catch (error) {
      console.error('❌ Failed to update conversation context:', error);
    }
  }

  // Get conversation context
  public async getConversationContext(sessionId: string): Promise<ConversationContext | null> {
    try {
      const contextKey = `${MEMORY_PREFIX}context:${sessionId}`;
      const stored = await redisClient.get(contextKey);
      
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('❌ Failed to get conversation context:', error);
      return null;
    }
  }

  // Get user's recent sessions
  public async getUserSessions(userId: string, limit: number = 10): Promise<string[]> {
    try {
      const sessions = await redisClient.smembers(`${MEMORY_PREFIX}user_sessions:${userId}`);
      
      // Sort by last interaction time
      const sessionDetails = await Promise.all(
        sessions.map(async (sessionId) => {
          const memory = await this.getAgentMemory(sessionId);
          return {
            sessionId,
            lastInteraction: memory?.context.lastInteraction || 0,
          };
        })
      );

      return sessionDetails
        .sort((a, b) => b.lastInteraction - a.lastInteraction)
        .slice(0, limit)
        .map(s => s.sessionId);
    } catch (error) {
      console.error('❌ Failed to get user sessions:', error);
      return [];
    }
  }

  // Generate conversation summary
  public async generateConversationSummary(sessionId: string): Promise<string> {
    try {
      const memory = await this.getAgentMemory(sessionId);
      if (!memory || memory.messages.length === 0) {
        return 'No conversation history found.';
      }

      const context = await this.getConversationContext(sessionId);
      
      let summary = `Conversation Summary:\n`;
      summary += `Total Messages: ${memory.messages.length}\n`;
      summary += `Topics Discussed: ${memory.context.topics.join(', ')}\n`;
      
      if (context?.extractedSymptoms.length) {
        summary += `Symptoms: ${context.extractedSymptoms.join(', ')}\n`;
      }
      
      if (context?.suggestedMedicines.length) {
        summary += `Suggested Medicines: ${context.suggestedMedicines.join(', ')}\n`;
      }
      
      if (context?.riskAssessment) {
        summary += `Risk Level: ${context.riskAssessment.level}\n`;
      }

      // Store summary in memory
      memory.context.conversationSummary = summary;
      await this.storeAgentMemory(memory);

      return summary;
    } catch (error) {
      console.error('❌ Failed to generate conversation summary:', error);
      return 'Failed to generate summary.';
    }
  }

  // Clear session memory
  public async clearSessionMemory(sessionId: string): Promise<void> {
    try {
      const keys = [
        `${MEMORY_PREFIX}agent:${sessionId}`,
        `${MEMORY_PREFIX}context:${sessionId}`,
        `langchain:chat_history:${sessionId}`,
      ];

      await redisClient.del(...keys);
      console.log(`🧹 Cleared memory for session: ${sessionId}`);
    } catch (error) {
      console.error('❌ Failed to clear session memory:', error);
    }
  }

  // Get memory statistics
  public async getMemoryStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    totalMessages: number;
    averageMessagesPerSession: number;
    memoryUsage: string;
  }> {
    try {
      const sessionKeys = await redisClient.keys(`${MEMORY_PREFIX}agent:*`);
      const totalSessions = sessionKeys.length;
      
      let totalMessages = 0;
      let activeSessions = 0;
      const now = Date.now();
      const activeThreshold = 24 * 60 * 60 * 1000; // 24 hours

      for (const key of sessionKeys) {
        const stored = await redisClient.get(key);
        if (stored) {
          const memory: AgentMemoryEntry = JSON.parse(stored);
          totalMessages += memory.messages.length;
          
          if (now - memory.context.lastInteraction < activeThreshold) {
            activeSessions++;
          }
        }
      }

      const memoryKeys = await redisClient.keys(`${MEMORY_PREFIX}*`);
      const memoryUsage = `${memoryKeys.length} keys`;

      return {
        totalSessions,
        activeSessions,
        totalMessages,
        averageMessagesPerSession: totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0,
        memoryUsage,
      };
    } catch (error) {
      console.error('❌ Failed to get memory stats:', error);
      return {
        totalSessions: 0,
        activeSessions: 0,
        totalMessages: 0,
        averageMessagesPerSession: 0,
        memoryUsage: '0 keys',
      };
    }
  }

  // Cleanup old memories
  public async cleanupOldMemories(olderThanDays: number = 7): Promise<number> {
    try {
      const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
      const sessionKeys = await redisClient.keys(`${MEMORY_PREFIX}agent:*`);
      
      let deletedCount = 0;
      
      for (const key of sessionKeys) {
        const stored = await redisClient.get(key);
        if (stored) {
          const memory: AgentMemoryEntry = JSON.parse(stored);
          
          if (memory.context.lastInteraction < cutoffTime) {
            const sessionId = memory.sessionId;
            await this.clearSessionMemory(sessionId);
            deletedCount++;
          }
        }
      }

      console.log(`🧹 Cleaned up ${deletedCount} old memory sessions`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Failed to cleanup old memories:', error);
      return 0;
    }
  }

  // Utility methods
  private async ping(): Promise<void> {
    if (!redisClient) {
      throw new Error('Redis client not available');
    }
    await redisClient.ping();
  }

  public isReady(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const redisMemoryService = RedisMemoryService.getInstance();

// Initialize on import
redisMemoryService.initialize().catch(console.error);

export default redisMemoryService;