// Live Chat System - লাইভ চ্যাট সিস্টেম
import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Send, X, Minimize2, Maximize2, Phone, Video,
  Paperclip, Smile, MoreVertical, User, Bot, Clock, Check,
  CheckCheck, Mic, MicOff, Camera, CameraOff, Settings,
  Search, Archive, Star, Trash2, Download, Upload, Image,
  FileText, Heart, AlertCircle, Info, Shield
} from 'lucide-react';
import langchainService from '../services/langchainService';
import { useNotification } from '../contexts/NotificationContext';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'doctor' | 'ai' | 'support';
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'voice' | 'video' | 'system';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  attachments?: {
    type: 'image' | 'file' | 'voice' | 'video';
    url: string;
    name: string;
    size?: number;
  }[];
  replyTo?: string;
  isEmergency?: boolean;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'doctor-consultation' | 'ai-assistant' | 'support' | 'emergency';
  participants: {
    id: string;
    name: string;
    role: 'user' | 'doctor' | 'ai' | 'support';
    avatar?: string;
    isOnline: boolean;
    lastSeen?: Date;
  }[];
  lastMessage?: Message;
  unreadCount: number;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high' | 'emergency';
}

interface LiveChatSystemProps {
  isOpen: boolean;
  onClose: () => void;
  initialRoom?: string;
  emergencyMode?: boolean;
}

const LiveChatSystem: React.FC<LiveChatSystemProps> = ({ 
  isOpen, 
  onClose, 
  initialRoom,
  emergencyMode = false 
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string>('');
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<{[roomId: string]: Message[]}>({});
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isVoiceCall, setIsVoiceCall] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showNotification } = useNotification();

  // Initialize chat rooms and messages
  useEffect(() => {
    initializeChatSystem();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, activeRoom]);

  // Set initial room if provided
  useEffect(() => {
    if (initialRoom && chatRooms.length > 0) {
      setActiveRoom(initialRoom);
    } else if (emergencyMode) {
      // Create emergency room
      createEmergencyRoom();
    }
  }, [initialRoom, emergencyMode, chatRooms]);

  const initializeChatSystem = () => {
    const mockRooms: ChatRoom[] = [
      {
        id: 'ai-assistant',
        name: 'AI স্বাস্থ্য সহায়ক',
        type: 'ai-assistant',
        participants: [
          {
            id: 'ai-1',
            name: 'ডা. AI সহায়ক',
            role: 'ai',
            isOnline: true
          },
          {
            id: 'user-1',
            name: 'আপনি',
            role: 'user',
            isOnline: true
          }
        ],
        unreadCount: 0,
        isActive: true,
        priority: 'medium'
      },
      {
        id: 'doctor-consultation',
        name: 'ডা. রহিমা খাতুন',
        type: 'doctor-consultation',
        participants: [
          {
            id: 'doctor-1',
            name: 'ডা. রহিমা খাতুন',
            role: 'doctor',
            isOnline: true,
            lastSeen: new Date()
          },
          {
            id: 'user-1',
            name: 'আপনি',
            role: 'user',
            isOnline: true
          }
        ],
        unreadCount: 2,
        isActive: true,
        priority: 'high'
      },
      {
        id: 'support',
        name: 'কাস্টমার সাপোর্ট',
        type: 'support',
        participants: [
          {
            id: 'support-1',
            name: 'সাপোর্ট টিম',
            role: 'support',
            isOnline: true
          },
          {
            id: 'user-1',
            name: 'আপনি',
            role: 'user',
            isOnline: true
          }
        ],
        unreadCount: 0,
        isActive: true,
        priority: 'low'
      }
    ];

    setChatRooms(mockRooms);
    setActiveRoom(mockRooms[0].id);

    // Initialize messages for each room
    const initialMessages: {[roomId: string]: Message[]} = {};
    
    // AI Assistant messages
    initialMessages['ai-assistant'] = [
      {
        id: '1',
        senderId: 'ai-1',
        senderName: 'ডা. AI সহায়ক',
        senderType: 'ai',
        content: 'নমস্কার! আমি আপনার AI স্বাস্থ্য সহায়ক। আপনার কোনো স্বাস্থ্য সংক্রান্ত প্রশ্ন থাকলে জিজ্ঞাসা করুন।',
        timestamp: new Date(Date.now() - 300000),
        type: 'text',
        status: 'read'
      }
    ];

    // Doctor consultation messages
    initialMessages['doctor-consultation'] = [
      {
        id: '2',
        senderId: 'doctor-1',
        senderName: 'ডা. রহিমা খাতুন',
        senderType: 'doctor',
        content: 'আসসালামু আলাইকুম। আপনার অ্যাপয়েন্টমেন্টের জন্য ধন্যবাদ। আপনার সমস্যা কি?',
        timestamp: new Date(Date.now() - 600000),
        type: 'text',
        status: 'read'
      },
      {
        id: '3',
        senderId: 'user-1',
        senderName: 'আপনি',
        senderType: 'user',
        content: 'ওয়ালাইকুম আসসালাম ডাক্তার। আমার কয়েকদিন ধরে মাথাব্যথা হচ্ছে।',
        timestamp: new Date(Date.now() - 580000),
        type: 'text',
        status: 'read'
      },
      {
        id: '4',
        senderId: 'doctor-1',
        senderName: 'ডা. রহিমা খাতুন',
        senderType: 'doctor',
        content: 'মাথাব্যথার তীব্রতা কেমন? কোন সময় বেশি হয়?',
        timestamp: new Date(Date.now() - 120000),
        type: 'text',
        status: 'delivered'
      }
    ];

    // Support messages
    initialMessages['support'] = [
      {
        id: '5',
        senderId: 'support-1',
        senderName: 'সাপোর্ট টিম',
        senderType: 'support',
        content: 'আপনাকে স্বাগতম! কোনো সাহায্য প্রয়োজন হলে জানান।',
        timestamp: new Date(Date.now() - 900000),
        type: 'text',
        status: 'read'
      }
    ];

    setMessages(initialMessages);
  };

  const createEmergencyRoom = () => {
    const emergencyRoom: ChatRoom = {
      id: 'emergency',
      name: 'জরুরি সেবা',
      type: 'emergency',
      participants: [
        {
          id: 'emergency-1',
          name: 'জরুরি সেবা টিম',
          role: 'doctor',
          isOnline: true
        },
        {
          id: 'user-1',
          name: 'আপনি',
          role: 'user',
          isOnline: true
        }
      ],
      unreadCount: 0,
      isActive: true,
      priority: 'emergency'
    };

    setChatRooms(prev => [emergencyRoom, ...prev]);
    setActiveRoom('emergency');

    // Add emergency welcome message
    const emergencyMessage: Message = {
      id: Date.now().toString(),
      senderId: 'emergency-1',
      senderName: 'জরুরি সেবা টিম',
      senderType: 'doctor',
      content: '🚨 জরুরি সেবায় স্বাগতম। আপনার জরুরি সমস্যা বলুন। আমরা অবিলম্বে সাহায্য করব।',
      timestamp: new Date(),
      type: 'text',
      status: 'sent',
      isEmergency: true
    };

    setMessages(prev => ({
      ...prev,
      'emergency': [emergencyMessage]
    }));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    const currentRoom = chatRooms.find(room => room.id === activeRoom);
    if (!currentRoom) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'user-1',
      senderName: 'আপনি',
      senderType: 'user',
      content: newMessage.trim(),
      timestamp: new Date(),
      type: selectedFiles.length > 0 ? 'file' : 'text',
      status: 'sending',
      attachments: selectedFiles.map(file => ({
        type: file.type.startsWith('image/') ? 'image' : 'file',
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      })),
      isEmergency: currentRoom.type === 'emergency'
    };

    // Add message to current room
    setMessages(prev => ({
      ...prev,
      [activeRoom]: [...(prev[activeRoom] || []), message]
    }));

    // Clear input
    setNewMessage('');
    setSelectedFiles([]);

    // Simulate message sent
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [activeRoom]: prev[activeRoom].map(msg => 
          msg.id === message.id ? { ...msg, status: 'sent' } : msg
        )
      }));
    }, 1000);

    // Handle AI response
    if (currentRoom.type === 'ai-assistant') {
      await handleAIResponse(message.content);
    }

    // Handle emergency response
    if (currentRoom.type === 'emergency') {
      handleEmergencyResponse(message.content);
    }
  };

  const handleAIResponse = async (userMessage: string) => {
    setIsAIProcessing(true);
    
    try {
      const aiResponse = await langchainService.generateMedicalResponse(
        `ব্যবহারকারী বলেছেন: "${userMessage}". একজন সহায়ক AI ডাক্তার হিসেবে উত্তর দিন। বাংলায় সহজ ভাষায় জবাব দিন।`,
        'bn'
      );

      const aiMessage: Message = {
        id: Date.now().toString(),
        senderId: 'ai-1',
        senderName: 'ডা. AI সহায়ক',
        senderType: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        type: 'text',
        status: 'sent'
      };

      setMessages(prev => ({
        ...prev,
        [activeRoom]: [...(prev[activeRoom] || []), aiMessage]
      }));

    } catch (error) {
      console.error('AI response error:', error);
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        senderId: 'ai-1',
        senderName: 'ডা. AI সহায়ক',
        senderType: 'ai',
        content: 'দুঃখিত, এই মুহূর্তে আমি উত্তর দিতে পারছি না। পরে আবার চেষ্টা করুন।',
        timestamp: new Date(),
        type: 'text',
        status: 'sent'
      };

      setMessages(prev => ({
        ...prev,
        [activeRoom]: [...(prev[activeRoom] || []), errorMessage]
      }));
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleEmergencyResponse = (userMessage: string) => {
    // Simulate emergency team response
    setTimeout(() => {
      const emergencyResponse: Message = {
        id: Date.now().toString(),
        senderId: 'emergency-1',
        senderName: 'জরুরি সেবা টিম',
        senderType: 'doctor',
        content: '🚨 আপনার বার্তা পেয়েছি। জরুরি সেবা টিম আপনার সাথে যোগাযোগ করবে। এই মুহূর্তে ১৯৯ নম্বরে কল করুন।',
        timestamp: new Date(),
        type: 'text',
        status: 'sent',
        isEmergency: true
      };

      setMessages(prev => ({
        ...prev,
        [activeRoom]: [...(prev[activeRoom] || []), emergencyResponse]
      }));

      // Show emergency notification
      showNotification({
        type: 'error',
        title: 'জরুরি সতর্কতা',
        message: 'জরুরি সেবা টিম অবহিত করা হয়েছে। ১৯৯ নম্বরে কল করুন।'
      });
    }, 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startVoiceCall = () => {
    setIsVoiceCall(true);
    showNotification({
      type: 'info',
      title: 'ভয়েস কল',
      message: 'ভয়েস কল শুরু হয়েছে'
    });
  };

  const startVideoCall = () => {
    setIsVideoCall(true);
    showNotification({
      type: 'info',
      title: 'ভিডিও কল',
      message: 'ভিডিও কল শুরু হয়েছে'
    });
  };

  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'ai-assistant': return Bot;
      case 'doctor-consultation': return User;
      case 'support': return MessageCircle;
      case 'emergency': return AlertCircle;
      default: return MessageCircle;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('bn-BD', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const currentRoom = chatRooms.find(room => room.id === activeRoom);
  const currentMessages = messages[activeRoom] || [];

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">
                {isMinimized ? 'লাইভ চ্যাট' : (currentRoom?.name || 'লাইভ চ্যাট')}
              </h3>
              {!isMinimized && currentRoom && (
                <p className="text-xs text-blue-100">
                  {currentRoom.participants.filter(p => p.isOnline && p.role !== 'user').length} জন অনলাইন
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isMinimized && currentRoom && (
              <>
                <button 
                  onClick={startVoiceCall}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="ভয়েস কল"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button 
                  onClick={startVideoCall}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="ভিডিও কল"
                >
                  <Video className="w-4 h-4" />
                </button>
              </>
            )}
            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Chat Rooms List */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex overflow-x-auto p-2 space-x-2">
                {chatRooms.map((room) => {
                  const IconComponent = getRoomIcon(room.type);
                  return (
                    <button
                      key={room.id}
                      onClick={() => setActiveRoom(room.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                        activeRoom === room.id
                          ? 'bg-blue-100 text-blue-600'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm font-medium">{room.name}</span>
                      {room.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {room.unreadCount}
                        </span>
                      )}
                      {room.priority === 'emergency' && (
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${
                    message.senderType === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : message.isEmergency
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-gray-100 text-gray-800'
                  } rounded-lg p-3`}>
                    {message.senderType !== 'user' && (
                      <div className="flex items-center space-x-2 mb-1">
                        {message.senderType === 'ai' && <Bot className="w-4 h-4" />}
                        {message.senderType === 'doctor' && <User className="w-4 h-4" />}
                        {message.senderType === 'support' && <MessageCircle className="w-4 h-4" />}
                        <span className="text-xs font-medium">{message.senderName}</span>
                      </div>
                    )}
                    
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-white/20 rounded">
                            {attachment.type === 'image' ? <Image className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                            <span className="text-xs">{attachment.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                      {message.senderType === 'user' && (
                        <div className="flex items-center space-x-1">
                          {message.status === 'sending' && <Clock className="w-3 h-3" />}
                          {message.status === 'sent' && <Check className="w-3 h-3" />}
                          {message.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
                          {message.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-300" />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isAIProcessing && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 rounded-lg p-3 max-w-xs">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4" />
                      <span className="text-xs font-medium">ডা. AI সহায়ক</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <span className="text-xs text-gray-500 ml-2">টাইপ করছে...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* File Preview */}
            {selectedFiles.length > 0 && (
              <div className="border-t border-gray-200 p-3">
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                      {file.type.startsWith('image/') ? <Image className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      <span className="text-xs">{file.name}</span>
                      <button 
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="ফাইল সংযুক্ত করুন"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="বার্তা লিখুন..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                
                <button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim() && selectedFiles.length === 0}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LiveChatSystem;