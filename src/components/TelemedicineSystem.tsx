// Telemedicine System - টেলিমেডিসিন সিস্টেম
import React, { useState, useEffect, useRef } from 'react';
import {
  Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Monitor,
  MessageCircle, FileText, Camera, Settings, Users, Clock,
  Share2, Download, Upload, Maximize, Minimize, Volume2,
  VolumeX, Wifi, WifiOff, Signal, Battery, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

// Types
interface VideoCallSession {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  doctorName: string;
  patientName: string;
  startTime: Date;
  endTime?: Date;
  status: 'waiting' | 'connecting' | 'active' | 'ended' | 'failed';
  duration: number;
  recordingEnabled: boolean;
  chatEnabled: boolean;
  screenSharingEnabled: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'doctor' | 'patient';
  message: string;
  timestamp: Date;
  type: 'text' | 'file' | 'prescription' | 'system';
  fileUrl?: string;
  fileName?: string;
}

interface MediaSettings {
  video: {
    enabled: boolean;
    deviceId?: string;
    quality: 'low' | 'medium' | 'high';
  };
  audio: {
    enabled: boolean;
    deviceId?: string;
    volume: number;
  };
  screen: {
    sharing: boolean;
  };
}

interface ConnectionStatus {
  status: 'excellent' | 'good' | 'poor' | 'disconnected';
  latency: number;
  bandwidth: number;
  packetLoss: number;
}

const TelemedicineSystem: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<VideoCallSession | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [mediaSettings, setMediaSettings] = useState<MediaSettings>({
    video: { enabled: true, quality: 'medium' },
    audio: { enabled: true, volume: 80 },
    screen: { sharing: false }
  });
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'excellent',
    latency: 45,
    bandwidth: 1200,
    packetLoss: 0.1
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [availableDevices, setAvailableDevices] = useState<{
    cameras: MediaDeviceInfo[];
    microphones: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
  }>({ cameras: [], microphones: [], speakers: [] });
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // Initialize media devices
  useEffect(() => {
    initializeMediaDevices();
    // Simulate session start
    startDemoSession();
  }, []);

  const initializeMediaDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setAvailableDevices({
        cameras: devices.filter(device => device.kind === 'videoinput'),
        microphones: devices.filter(device => device.kind === 'audioinput'),
        speakers: devices.filter(device => device.kind === 'audiooutput')
      });
    } catch (error) {
      console.error('Error accessing media devices:', error);
      showNotification('মিডিয়া ডিভাইস অ্যাক্সেস করতে সমস্যা হয়েছে', 'error');
    }
  };

  const startDemoSession = () => {
    const demoSession: VideoCallSession = {
      id: 'session-1',
      appointmentId: 'apt-1',
      doctorId: 'doc-1',
      patientId: user?.uid || 'patient-1',
      doctorName: 'ডা. আহমেদ হাসান',
      patientName: user?.displayName || 'রোগী',
      startTime: new Date(),
      status: 'active',
      duration: 0,
      recordingEnabled: false,
      chatEnabled: true,
      screenSharingEnabled: false
    };
    
    setCurrentSession(demoSession);
    
    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: 'msg-1',
      senderId: 'system',
      senderName: 'সিস্টেম',
      senderType: 'doctor',
      message: 'টেলিমেডিসিন সেশন শুরু হয়েছে। আপনার স্বাস্থ্য সমস্যা নিয়ে আলোচনা করুন।',
      timestamp: new Date(),
      type: 'system'
    };
    
    setChatMessages([welcomeMessage]);
  };

  const toggleVideo = () => {
    setMediaSettings(prev => ({
      ...prev,
      video: { ...prev.video, enabled: !prev.video.enabled }
    }));
    
    if (localVideoRef.current) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getVideoTracks().forEach(track => {
          track.enabled = !mediaSettings.video.enabled;
        });
      }
    }
  };

  const toggleAudio = () => {
    setMediaSettings(prev => ({
      ...prev,
      audio: { ...prev.audio, enabled: !prev.audio.enabled }
    }));
    
    if (localVideoRef.current) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getAudioTracks().forEach(track => {
          track.enabled = !mediaSettings.audio.enabled;
        });
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!mediaSettings.screen.sharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        setMediaSettings(prev => ({
          ...prev,
          screen: { sharing: true }
        }));
        
        showNotification('স্ক্রিন শেয়ারিং শুরু হয়েছে', 'success');
      } else {
        setMediaSettings(prev => ({
          ...prev,
          screen: { sharing: false }
        }));
        
        showNotification('স্ক্রিন শেয়ারিং বন্ধ হয়েছে', 'info');
      }
    } catch (error) {
      console.error('Screen sharing error:', error);
      showNotification('স্ক্রিন শেয়ারিং করতে সমস্যা হয়েছে', 'error');
    }
  };

  const endCall = () => {
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        status: 'ended',
        endTime: new Date()
      });
      
      showNotification('কল সমাপ্ত হয়েছে', 'info');
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && currentSession) {
      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: user?.uid || 'patient-1',
        senderName: user?.displayName || 'রোগী',
        senderType: 'patient',
        message: newMessage.trim(),
        timestamp: new Date(),
        type: 'text'
      };
      
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Simulate doctor response
      setTimeout(() => {
        const doctorResponse: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          senderId: 'doc-1',
          senderName: 'ডা. আহমেদ হাসান',
          senderType: 'doctor',
          message: 'আপনার সমস্যা বুঝতে পারছি। আরো বিস্তারিত বলুন।',
          timestamp: new Date(),
          type: 'text'
        };
        setChatMessages(prev => [...prev, doctorResponse]);
      }, 2000);
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus.status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-yellow-600';
      case 'poor': return 'text-orange-600';
      case 'disconnected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus.status) {
      case 'excellent': return <Wifi className="w-4 h-4" />;
      case 'good': return <Signal className="w-4 h-4" />;
      case 'poor': return <WifiOff className="w-4 h-4" />;
      case 'disconnected': return <AlertTriangle className="w-4 h-4" />;
      default: return <Wifi className="w-4 h-4" />;
    }
  };

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">টেলিমেডিসিন সেশন</h2>
          <p className="text-gray-600">কোনো সক্রিয় সেশন নেই</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-gray-900 flex flex-col`}>
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Video className="w-6 h-6 text-blue-400" />
            <h1 className="text-lg font-semibold">টেলিমেডিসিন</h1>
          </div>
          <div className="text-sm text-gray-300">
            {currentSession.doctorName} এর সাথে পরামর্শ
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className={`flex items-center space-x-2 ${getConnectionStatusColor()}`}>
            {getConnectionStatusIcon()}
            <span className="text-sm">
              {connectionStatus.status === 'excellent' ? 'চমৎকার' :
               connectionStatus.status === 'good' ? 'ভালো' :
               connectionStatus.status === 'poor' ? 'দুর্বল' : 'সংযোগ বিচ্ছিন্ন'}
            </span>
          </div>
          
          {/* Session Duration */}
          <div className="flex items-center space-x-2 text-gray-300">
            <Clock className="w-4 h-4" />
            <span className="text-sm">১৫:৩২</span>
          </div>
          
          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative">
          {/* Remote Video */}
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            />
            {/* Placeholder for demo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">ডা</span>
                </div>
                <p className="text-lg font-medium">{currentSession.doctorName}</p>
                <p className="text-sm text-gray-300">কার্ডিওলজিস্ট</p>
              </div>
            </div>
          </div>
          
          {/* Local Video (Picture-in-Picture) */}
          <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600">
            <video
              ref={localVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            {/* Placeholder for demo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-sm font-bold">আপনি</span>
                </div>
                <p className="text-xs">{currentSession.patientName}</p>
              </div>
            </div>
            
            {/* Video Status Indicators */}
            <div className="absolute top-2 left-2 flex space-x-1">
              {!mediaSettings.video.enabled && (
                <div className="bg-red-600 rounded-full p-1">
                  <VideoOff className="w-3 h-3 text-white" />
                </div>
              )}
              {!mediaSettings.audio.enabled && (
                <div className="bg-red-600 rounded-full p-1">
                  <MicOff className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>
          
          {/* Screen Sharing Indicator */}
          {mediaSettings.screen.sharing && (
            <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2">
              <Monitor className="w-4 h-4" />
              <span className="text-sm">স্ক্রিন শেয়ার করা হচ্ছে</span>
            </div>
          )}
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">চ্যাট</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Minimize className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {chatMessages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.senderType === 'patient' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      message.type === 'system'
                        ? 'bg-gray-100 text-gray-700 text-center text-sm'
                        : message.senderType === 'patient'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {message.type !== 'system' && (
                      <p className="text-xs opacity-75 mb-1">{message.senderName}</p>
                    )}
                    <p className="text-sm">{message.message}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {message.timestamp.toLocaleTimeString('bn-BD', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="মেসেজ লিখুন..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-gray-800 p-4">
        <div className="flex items-center justify-center space-x-4">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-colors ${
              mediaSettings.audio.enabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {mediaSettings.audio.enabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          
          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${
              mediaSettings.video.enabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {mediaSettings.video.enabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
          
          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={`p-3 rounded-full transition-colors ${
              mediaSettings.screen.sharing
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            <Monitor className="w-5 h-5" />
          </button>
          
          {/* Chat Toggle */}
          <button
            onClick={() => setShowChat(!showChat)}
            className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
          
          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          {/* End Call */}
          <button
            onClick={endCall}
            className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">সেটিংস</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Minimize className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Camera Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ক্যামেরা</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  {availableDevices.cameras.map(camera => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label || 'ক্যামেরা'}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Microphone Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">মাইক্রোফোন</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  {availableDevices.microphones.map(mic => (
                    <option key={mic.deviceId} value={mic.deviceId}>
                      {mic.label || 'মাইক্রোফোন'}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Video Quality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ভিডিও মান</label>
                <select 
                  value={mediaSettings.video.quality}
                  onChange={(e) => setMediaSettings(prev => ({
                    ...prev,
                    video: { ...prev.video, quality: e.target.value as 'low' | 'medium' | 'high' }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">নিম্ন</option>
                  <option value="medium">মাঝারি</option>
                  <option value="high">উচ্চ</option>
                </select>
              </div>
              
              {/* Audio Volume */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">অডিও ভলিউম</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={mediaSettings.audio.volume}
                  onChange={(e) => setMediaSettings(prev => ({
                    ...prev,
                    audio: { ...prev.audio, volume: parseInt(e.target.value) }
                  }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>০%</span>
                  <span>{mediaSettings.audio.volume}%</span>
                  <span>১০০%</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                বাতিল
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                সংরক্ষণ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelemedicineSystem;