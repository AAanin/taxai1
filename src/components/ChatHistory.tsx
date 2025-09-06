// Chat History Component - চ্যাট ইতিহাস কম্পোনেন্ট
// Displays patient chat history with search and filter functionality

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Search, 
  Filter, 
  MessageCircle, 
  Calendar, 
  User, 
  Bot, 
  FileText, 
  Pill, 
  Download, 
  Trash2, 
  Eye,
  ChevronRight,
  X
} from 'lucide-react';
import chatHistoryService, { ChatSession, ChatHistoryFilter } from '../services/chatHistoryService';

interface ChatHistoryProps {
  onSessionSelect?: (sessionId: string) => void;
  currentSessionId?: string;
  className?: string;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ 
  onSessionSelect, 
  currentSessionId, 
  className = '' 
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [showSessionDetail, setShowSessionDetail] = useState(false);
  
  // Filter states
  const [dateFilter, setDateFilter] = useState({
    from: '',
    to: ''
  });
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [hasReports, setHasReports] = useState(false);
  const [hasPrescriptions, setHasPrescriptions] = useState(false);

  // Load chat sessions on component mount
  useEffect(() => {
    loadChatSessions();
  }, []);

  // Apply filters when search query or filters change
  useEffect(() => {
    applyFilters();
  }, [sessions, searchQuery, dateFilter, tagFilter, hasReports, hasPrescriptions]);

  // Load all chat sessions
  const loadChatSessions = () => {
    try {
      const allSessions = chatHistoryService.getAllSessions();
      setSessions(allSessions);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  };

  // Apply search and filters
  const applyFilters = () => {
    const filter: ChatHistoryFilter = {
      keywords: searchQuery ? [searchQuery] : undefined,
      dateFrom: dateFilter.from ? new Date(dateFilter.from) : undefined,
      dateTo: dateFilter.to ? new Date(dateFilter.to) : undefined,
      tags: tagFilter.length > 0 ? tagFilter : undefined,
      hasReports: hasReports || undefined,
      hasPrescriptions: hasPrescriptions || undefined
    };

    const filtered = chatHistoryService.searchChatHistory(filter);
    setFilteredSessions(filtered);
  };

  // Handle session selection
  const handleSessionSelect = (session: ChatSession) => {
    if (onSessionSelect) {
      onSessionSelect(session.id);
    }
  };

  // Handle session deletion
  const handleDeleteSession = (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (window.confirm('এই চ্যাট সেশনটি মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।')) {
      const success = chatHistoryService.deleteSession(sessionId);
      if (success) {
        loadChatSessions();
        if (currentSessionId === sessionId && onSessionSelect) {
          // Create new session if current session is deleted
          const newSession = chatHistoryService.createSession();
          onSessionSelect(newSession.id);
        }
      }
    }
  };

  // View session details
  const viewSessionDetails = (session: ChatSession, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedSession(session);
    setShowSessionDetail(true);
  };

  // Export chat history
  const exportChatHistory = () => {
    try {
      const exportData = chatHistoryService.exportChatHistory('text');
      const blob = new Blob([exportData], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dr-mimu-chat-history-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting chat history:', error);
      alert('চ্যাট ইতিহাস এক্সপোর্ট করতে সমস্যা হয়েছে।');
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setDateFilter({ from: '', to: '' });
    setTagFilter([]);
    setHasReports(false);
    setHasPrescriptions(false);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('bn-BD', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get session summary
  const getSessionSummary = (session: ChatSession) => {
    if (session.messages.length === 0) return 'কোন বার্তা নেই';
    
    const firstUserMessage = session.messages.find(msg => msg.type === 'user');
    if (firstUserMessage) {
      return firstUserMessage.content.length > 50 
        ? firstUserMessage.content.substring(0, 50) + '...' 
        : firstUserMessage.content;
    }
    
    return 'নতুন চ্যাট';
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
            চ্যাট ইতিহাস
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportChatHistory}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="এক্সপোর্ট করুন"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
              title="ফিল্টার"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="চ্যাট খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                তারিখের পরিসর
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={dateFilter.from}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <input
                  type="date"
                  value={dateFilter.to}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Content Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                বিষয়বস্তু
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={hasReports}
                    onChange={(e) => setHasReports(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">রিপোর্ট সহ</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={hasPrescriptions}
                    onChange={(e) => setHasPrescriptions(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">প্রেসক্রিপশন সহ</span>
                </label>
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              সব ফিল্টার মুছুন
            </button>
          </div>
        )}
      </div>

      {/* Sessions List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredSessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">কোন চ্যাট পাওয়া যায়নি</p>
            <p className="text-sm">নতুন চ্যাট শুরু করুন বা ফিল্টার পরিবর্তন করুন</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSessionSelect(session)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  currentSessionId === session.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {session.title}
                      </h3>
                      {session.reports && session.reports.length > 0 && (
                        <FileText className="w-3 h-3 text-green-600" title="রিপোর্ট সহ" />
                      )}
                      {session.prescriptions && session.prescriptions.length > 0 && (
                        <Pill className="w-3 h-3 text-purple-600" title="প্রেসক্রিপশন সহ" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {getSessionSummary(session)}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(session.lastActivity)}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(session.lastActivity)}
                      </span>
                      <span className="flex items-center">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        {session.messages.length} বার্তা
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={(e) => viewSessionDetails(session, e)}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="বিস্তারিত দেখুন"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session Detail Modal */}
      {showSessionDetail && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  চ্যাট বিস্তারিত
                </h3>
                <button
                  onClick={() => setShowSessionDetail(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4">
                <h4 className="font-medium text-gray-900">{selectedSession.title}</h4>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span>শুরু: {formatDate(selectedSession.startTime)}</span>
                  <span>শেষ কার্যকলাপ: {formatDate(selectedSession.lastActivity)}</span>
                  <span>{selectedSession.messages.length} বার্তা</span>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-96">
              {/* Messages */}
              <div className="space-y-4">
                {selectedSession.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      message.type === 'user' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div className={`flex-1 ${
                      message.type === 'user' ? 'text-right' : 'text-left'
                    }`}>
                      <div className={`inline-block p-3 rounded-lg max-w-xs lg:max-w-md ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reports and Prescriptions */}
              {(selectedSession.reports?.length || selectedSession.prescriptions?.length) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  {selectedSession.reports && selectedSession.reports.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-green-600" />
                        আপলোড করা রিপোর্ট
                      </h5>
                      <div className="space-y-2">
                        {selectedSession.reports.map((report) => (
                          <div key={report.id} className="p-2 bg-green-50 rounded-lg">
                            <p className="text-sm font-medium text-green-900">{report.fileName}</p>
                            <p className="text-xs text-green-700">
                              {formatDate(report.uploadTime)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedSession.prescriptions && selectedSession.prescriptions.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Pill className="w-4 h-4 mr-2 text-purple-600" />
                        প্রেসক্রিপশন
                      </h5>
                      <div className="space-y-2">
                        {selectedSession.prescriptions.map((prescription) => (
                          <div key={prescription.id} className="p-2 bg-purple-50 rounded-lg">
                            <p className="text-sm font-medium text-purple-900">
                              {prescription.medicines.join(', ')}
                            </p>
                            <p className="text-xs text-purple-700">
                              {prescription.doctorName} - {formatDate(prescription.date)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHistory;