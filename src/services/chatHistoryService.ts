// Chat History Service - চ্যাট হিস্টরি সার্ভিস
// Manages patient chat history with timestamps, reports, and prescriptions

export interface ChatMessage {
  id: string;
  userId: string;
  sessionId: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  metadata?: {
    reportIds?: string[];
    prescriptionIds?: string[];
    symptoms?: string[];
    diagnosis?: string;
    recommendations?: string[];
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  startTime: Date;
  lastActivity: Date;
  messages: ChatMessage[];
  summary?: string;
  tags?: string[];
  reports?: UploadedReport[];
  prescriptions?: Prescription[];
}

export interface UploadedReport {
  id: string;
  fileName: string;
  fileType: string;
  uploadTime: Date;
  content?: string;
  analysis?: string;
}

export interface Prescription {
  id: string;
  doctorName?: string;
  medicines: string[];
  instructions: string;
  date: Date;
  duration?: string;
}

export interface ChatHistoryFilter {
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  keywords?: string[];
  tags?: string[];
  hasReports?: boolean;
  hasPrescriptions?: boolean;
}

class ChatHistoryService {
  private readonly STORAGE_KEY = 'dr_mimu_chat_history';
  private readonly SESSIONS_KEY = 'dr_mimu_chat_sessions';
  private readonly REPORTS_KEY = 'dr_mimu_uploaded_reports';
  private readonly PRESCRIPTIONS_KEY = 'dr_mimu_prescriptions';

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get current user ID (can be enhanced with actual auth)
  private getCurrentUserId(): string {
    return localStorage.getItem('current_user_id') || 'anonymous_user';
  }

  // Save chat message
  saveChatMessage(message: Omit<ChatMessage, 'id' | 'userId' | 'timestamp'>): ChatMessage {
    const chatMessage: ChatMessage = {
      id: this.generateId(),
      userId: this.getCurrentUserId(),
      timestamp: new Date(),
      ...message
    };

    // Get existing messages
    const messages = this.getAllMessages();
    messages.push(chatMessage);

    // Save to localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(messages));

    // Update session
    this.updateSession(message.sessionId, chatMessage);

    return chatMessage;
  }

  // Get all messages
  getAllMessages(): ChatMessage[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const messages = JSON.parse(stored);
      return messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    } catch (error) {
      console.error('Error loading chat messages:', error);
      return [];
    }
  }

  // Get messages by session
  getMessagesBySession(sessionId: string): ChatMessage[] {
    return this.getAllMessages().filter(msg => msg.sessionId === sessionId);
  }

  // Get messages by user
  getMessagesByUser(userId?: string): ChatMessage[] {
    const targetUserId = userId || this.getCurrentUserId();
    return this.getAllMessages().filter(msg => msg.userId === targetUserId);
  }

  // Create new chat session
  createSession(title?: string): ChatSession {
    const session: ChatSession = {
      id: this.generateId(),
      userId: this.getCurrentUserId(),
      title: title || `চ্যাট সেশন - ${new Date().toLocaleDateString('bn-BD')}`,
      startTime: new Date(),
      lastActivity: new Date(),
      messages: [],
      tags: []
    };

    const sessions = this.getAllSessions();
    sessions.push(session);
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));

    return session;
  }

  // Update session
  private updateSession(sessionId: string, newMessage: ChatMessage): void {
    const sessions = this.getAllSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex !== -1) {
      sessions[sessionIndex].lastActivity = new Date();
      sessions[sessionIndex].messages.push(newMessage);
      
      // Auto-generate title from first user message
      if (!sessions[sessionIndex].title.includes('চ্যাট সেশন') && newMessage.type === 'user') {
        const firstWords = newMessage.content.split(' ').slice(0, 5).join(' ');
        sessions[sessionIndex].title = firstWords.length > 30 ? firstWords.substring(0, 30) + '...' : firstWords;
      }
      
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
    }
  }

  // Get all sessions
  getAllSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(this.SESSIONS_KEY);
      if (!stored) return [];
      
      const sessions = JSON.parse(stored);
      return sessions.map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        lastActivity: new Date(session.lastActivity),
        messages: session.messages?.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })) || []
      }));
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      return [];
    }
  }

  // Get session by ID
  getSessionById(sessionId: string): ChatSession | null {
    const sessions = this.getAllSessions();
    return sessions.find(s => s.id === sessionId) || null;
  }

  // Delete session
  deleteSession(sessionId: string): boolean {
    try {
      const sessions = this.getAllSessions();
      const filteredSessions = sessions.filter(s => s.id !== sessionId);
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(filteredSessions));
      
      // Also remove messages from this session
      const messages = this.getAllMessages();
      const filteredMessages = messages.filter(m => m.sessionId !== sessionId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredMessages));
      
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  // Save uploaded report
  saveUploadedReport(report: Omit<UploadedReport, 'id' | 'uploadTime'>): UploadedReport {
    const uploadedReport: UploadedReport = {
      id: this.generateId(),
      uploadTime: new Date(),
      ...report
    };

    const reports = this.getAllReports();
    reports.push(uploadedReport);
    localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));

    return uploadedReport;
  }

  // Get all reports
  getAllReports(): UploadedReport[] {
    try {
      const stored = localStorage.getItem(this.REPORTS_KEY);
      if (!stored) return [];
      
      const reports = JSON.parse(stored);
      return reports.map((report: any) => ({
        ...report,
        uploadTime: new Date(report.uploadTime)
      }));
    } catch (error) {
      console.error('Error loading reports:', error);
      return [];
    }
  }

  // Save prescription
  savePrescription(prescription: Omit<Prescription, 'id'>): Prescription {
    const savedPrescription: Prescription = {
      id: this.generateId(),
      ...prescription
    };

    const prescriptions = this.getAllPrescriptions();
    prescriptions.push(savedPrescription);
    localStorage.setItem(this.PRESCRIPTIONS_KEY, JSON.stringify(prescriptions));

    return savedPrescription;
  }

  // Get all prescriptions
  getAllPrescriptions(): Prescription[] {
    try {
      const stored = localStorage.getItem(this.PRESCRIPTIONS_KEY);
      if (!stored) return [];
      
      const prescriptions = JSON.parse(stored);
      return prescriptions.map((prescription: any) => ({
        ...prescription,
        date: new Date(prescription.date)
      }));
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      return [];
    }
  }

  // Search and filter chat history
  searchChatHistory(filter: ChatHistoryFilter): ChatSession[] {
    let sessions = this.getAllSessions();
    
    // Filter by user
    if (filter.userId) {
      sessions = sessions.filter(s => s.userId === filter.userId);
    }
    
    // Filter by date range
    if (filter.dateFrom) {
      sessions = sessions.filter(s => s.startTime >= filter.dateFrom!);
    }
    if (filter.dateTo) {
      sessions = sessions.filter(s => s.startTime <= filter.dateTo!);
    }
    
    // Filter by keywords
    if (filter.keywords && filter.keywords.length > 0) {
      sessions = sessions.filter(session => {
        const searchText = (
          session.title + ' ' + 
          session.messages.map(m => m.content).join(' ') + ' ' +
          (session.summary || '')
        ).toLowerCase();
        
        return filter.keywords!.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
      });
    }
    
    // Filter by tags
    if (filter.tags && filter.tags.length > 0) {
      sessions = sessions.filter(session => 
        session.tags?.some(tag => filter.tags!.includes(tag))
      );
    }
    
    // Filter by reports
    if (filter.hasReports) {
      sessions = sessions.filter(session => 
        session.reports && session.reports.length > 0
      );
    }
    
    // Filter by prescriptions
    if (filter.hasPrescriptions) {
      sessions = sessions.filter(session => 
        session.prescriptions && session.prescriptions.length > 0
      );
    }
    
    // Sort by last activity (newest first)
    return sessions.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  }

  // Get context for AI (recent messages and relevant history)
  getContextForAI(currentSessionId: string, limit: number = 10): {
    recentMessages: ChatMessage[];
    relevantHistory: ChatMessage[];
    reports: UploadedReport[];
    prescriptions: Prescription[];
  } {
    const currentSession = this.getSessionById(currentSessionId);
    const recentMessages = currentSession?.messages.slice(-limit) || [];
    
    // Get relevant history from other sessions
    const allMessages = this.getMessagesByUser();
    const otherMessages = allMessages.filter(m => m.sessionId !== currentSessionId);
    
    // Simple relevance scoring based on keywords
    const currentKeywords = recentMessages
      .map(m => m.content.toLowerCase())
      .join(' ')
      .split(' ')
      .filter(word => word.length > 3);
    
    const relevantHistory = otherMessages
      .filter(msg => {
        const msgWords = msg.content.toLowerCase().split(' ');
        return currentKeywords.some(keyword => msgWords.includes(keyword));
      })
      .slice(-5); // Last 5 relevant messages
    
    return {
      recentMessages,
      relevantHistory,
      reports: this.getAllReports().slice(-3), // Last 3 reports
      prescriptions: this.getAllPrescriptions().slice(-3) // Last 3 prescriptions
    };
  }

  // Export chat history
  exportChatHistory(format: 'json' | 'text' = 'json'): string {
    const data = {
      sessions: this.getAllSessions(),
      reports: this.getAllReports(),
      prescriptions: this.getAllPrescriptions(),
      exportDate: new Date().toISOString()
    };
    
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      // Text format
      let text = `ডা. মিমু চ্যাট হিস্টরি\nএক্সপোর্ট তারিখ: ${new Date().toLocaleDateString('bn-BD')}\n\n`;
      
      data.sessions.forEach(session => {
        text += `সেশন: ${session.title}\n`;
        text += `তারিখ: ${session.startTime.toLocaleDateString('bn-BD')}\n`;
        text += `বার্তা সংখ্যা: ${session.messages.length}\n\n`;
        
        session.messages.forEach(msg => {
          text += `[${msg.timestamp.toLocaleTimeString('bn-BD')}] ${msg.type === 'user' ? 'রোগী' : 'ডা. মিমু'}: ${msg.content}\n`;
        });
        
        text += '\n---\n\n';
      });
      
      return text;
    }
  }

  // Clear all data
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SESSIONS_KEY);
    localStorage.removeItem(this.REPORTS_KEY);
    localStorage.removeItem(this.PRESCRIPTIONS_KEY);
  }
}

// Export singleton instance
export const chatHistoryService = new ChatHistoryService();
export default chatHistoryService;