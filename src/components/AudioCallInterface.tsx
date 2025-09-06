// অডিও কল ইন্টারফেস - মিমুর সাথে ভয়েস কল করার জন্য
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, PhoneOff, Mic, MicOff, Volume2, VolumeX, 
  Loader2, AlertCircle, CheckCircle, X, Phone 
} from 'lucide-react';
import { useMedicalAI } from '../hooks/useMedicalAI';

interface AudioCallInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'bn' | 'en';
}

type CallStatus = 'idle' | 'connecting' | 'active' | 'ended' | 'error';

interface AudioCallState {
  status: CallStatus;
  isRecording: boolean;
  isMuted: boolean;
  isSpeakerOn: boolean;
  hasPermission: boolean;
  error: string | null;
  transcript: string;
  aiResponse: string;
}

const AudioCallInterface: React.FC<AudioCallInterfaceProps> = ({ 
  isOpen, 
  onClose, 
  language 
}) => {
  const { sendMessage, loading } = useMedicalAI();
  
  // অডিও কল স্টেট
  const [callState, setCallState] = useState<AudioCallState>({
    status: 'idle',
    isRecording: false,
    isMuted: false,
    isSpeakerOn: true,
    hasPermission: false,
    error: null,
    transcript: '',
    aiResponse: ''
  });

  // অডিও রেফারেন্স
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);

  // মাইক্রোফোন অনুমতি চেক এবং অডিও স্ট্রিম সেটআপ
  const requestMicrophonePermission = async () => {
    try {
      setCallState(prev => ({ ...prev, status: 'connecting', error: null }));
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      audioStreamRef.current = stream;
      setCallState(prev => ({ 
        ...prev, 
        hasPermission: true, 
        status: 'active',
        error: null 
      }));
      
      setupMediaRecorder(stream);
      setupSpeechRecognition();
      
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setCallState(prev => ({ 
        ...prev, 
        status: 'error',
        error: language === 'bn' 
          ? 'মাইক্রোফোন অ্যাক্সেস প্রয়োজন। অনুগ্রহ করে অনুমতি দিন।'
          : 'Microphone access required. Please grant permission.'
      }));
    }
  };

  // মিডিয়া রেকর্ডার সেটআপ
  const setupMediaRecorder = (stream: MediaStream) => {
    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        processAudioRecording();
      };
      
      mediaRecorderRef.current = mediaRecorder;
    } catch (error) {
      console.error('MediaRecorder setup failed:', error);
      setCallState(prev => ({ 
        ...prev, 
        error: language === 'bn' 
          ? 'অডিও রেকর্ডিং সেটআপ ব্যর্থ হয়েছে।'
          : 'Audio recording setup failed.'
      }));
    }
  };

  // স্পিচ রিকগনিশন সেটআপ
  const setupSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'bn' ? 'bn-BD' : 'en-US';
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setCallState(prev => ({ ...prev, transcript: finalTranscript }));
          handleUserSpeech(finalTranscript);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setCallState(prev => ({ 
          ...prev, 
          error: language === 'bn' 
            ? 'ভয়েস রিকগনিশন ত্রুটি।'
            : 'Voice recognition error.'
        }));
      };
      
      recognitionRef.current = recognition;
    } else {
      setCallState(prev => ({ 
        ...prev, 
        error: language === 'bn' 
          ? 'আপনার ব্রাউজার ভয়েস রিকগনিশন সাপোর্ট করে না।'
          : 'Your browser does not support voice recognition.'
      }));
    }
  };

  // অডিও রেকর্ডিং প্রসেস করা
  const processAudioRecording = async () => {
    if (audioChunksRef.current.length === 0) return;
    
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    audioChunksRef.current = [];
    
    // এখানে অডিও ব্লব কে টেক্সটে কনভার্ট করার লজিক থাকবে
    // বর্তমানে আমরা স্পিচ রিকগনিশন ব্যবহার করছি
  };

  // ব্যবহারকারীর কথা প্রসেস করা
  const handleUserSpeech = async (transcript: string) => {
    try {
      const response = await sendMessage(transcript, language);
      setCallState(prev => ({ ...prev, aiResponse: response }));
      speakAIResponse(response);
    } catch (error) {
      console.error('AI response error:', error);
      const errorMessage = language === 'bn' 
        ? 'AI প্রতিক্রিয়া পেতে সমস্যা হয়েছে।'
        : 'Failed to get AI response.';
      setCallState(prev => ({ ...prev, error: errorMessage }));
    }
  };

  // AI প্রতিক্রিয়া বলা (টেক্সট-টু-স্পিচ)
  const speakAIResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      // পূর্ববর্তী স্পিচ বন্ধ করা
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = callState.isSpeakerOn ? 1 : 0;
      
      utterance.onend = () => {
        // স্পিচ শেষ হলে আবার রেকর্ডিং শুরু করা
        if (callState.status === 'active' && !callState.isMuted) {
          startListening();
        }
      };
      
      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  // শোনা শুরু করা
  const startListening = () => {
    if (recognitionRef.current && callState.status === 'active' && !callState.isMuted) {
      try {
        recognitionRef.current.start();
        setCallState(prev => ({ ...prev, isRecording: true }));
      } catch (error) {
        console.error('Failed to start listening:', error);
      }
    }
  };

  // শোনা বন্ধ করা
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setCallState(prev => ({ ...prev, isRecording: false }));
    }
  };

  // কল শুরু করা
  const startCall = async () => {
    await requestMicrophonePermission();
  };

  // কল শেষ করা
  const endCall = () => {
    // সব অডিও স্ট্রিম এবং রেকর্ডিং বন্ধ করা
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    setCallState({
      status: 'ended',
      isRecording: false,
      isMuted: false,
      isSpeakerOn: true,
      hasPermission: false,
      error: null,
      transcript: '',
      aiResponse: ''
    });
    
    // 2 সেকেন্ড পর মোডাল বন্ধ করা
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  // মিউট টগল
  const toggleMute = () => {
    const newMutedState = !callState.isMuted;
    setCallState(prev => ({ ...prev, isMuted: newMutedState }));
    
    if (newMutedState) {
      stopListening();
    } else {
      startListening();
    }
  };

  // স্পিকার টগল
  const toggleSpeaker = () => {
    setCallState(prev => ({ ...prev, isSpeakerOn: !prev.isSpeakerOn }));
  };

  // কম্পোনেন্ট আনমাউন্ট হলে ক্লিনআপ
  useEffect(() => {
    return () => {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // কল স্ট্যাটাস অনুযায়ী UI টেক্সট
  const getStatusText = () => {
    switch (callState.status) {
      case 'idle':
        return language === 'bn' ? 'মিমুর সাথে কথা বলুন' : 'Talk to Mimu';
      case 'connecting':
        return language === 'bn' ? 'সংযোগ করা হচ্ছে...' : 'Connecting...';
      case 'active':
        return language === 'bn' ? 'কল চালু আছে' : 'Call Active';
      case 'ended':
        return language === 'bn' ? 'কল শেষ' : 'Call Ended';
      case 'error':
        return language === 'bn' ? 'ত্রুটি' : 'Error';
      default:
        return '';
    }
  };

  // স্ট্যাটাস আইকন
  const getStatusIcon = () => {
    switch (callState.status) {
      case 'connecting':
        return <Loader2 className="w-6 h-6 animate-spin" />;
      case 'active':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'ended':
        return <CheckCircle className="w-6 h-6 text-gray-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Phone className="w-6 h-6" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            if (callState.status === 'idle' || callState.status === 'ended') {
              onClose();
            }
          }
        }}
      >
        <motion.div
          initial={{ 
            scale: 0.8, 
            opacity: 0, 
            y: 50,
            rotateX: -15
          }}
          animate={{ 
            scale: 1, 
            opacity: 1, 
            y: 0,
            rotateX: 0
          }}
          exit={{ 
            scale: 0.8, 
            opacity: 0, 
            y: 50,
            rotateX: 15
          }}
          transition={{ 
            duration: 0.4, 
            ease: "easeOut",
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
          style={{ perspective: "1000px" }}
        >
          {/* Modal Glow Effect */}
          <motion.div
            animate={{
              opacity: callState.status === 'active' ? [0.3, 0.6, 0.3] : [0.1, 0.2, 0.1],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -inset-2 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl blur-xl"
          />
          {/* হেডার */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 text-center relative overflow-hidden">
            {/* Background Animation */}
            <motion.div
              animate={{
                background: callState.status === 'active' 
                  ? [
                      "linear-gradient(45deg, #3b82f6, #2563eb)",
                      "linear-gradient(45deg, #2563eb, #1d4ed8)",
                      "linear-gradient(45deg, #3b82f6, #2563eb)"
                    ]
                  : callState.status === 'connecting'
                  ? [
                      "linear-gradient(45deg, #f59e0b, #d97706)",
                      "linear-gradient(45deg, #d97706, #b45309)",
                      "linear-gradient(45deg, #f59e0b, #d97706)"
                    ]
                  : ["linear-gradient(45deg, #3b82f6, #2563eb)"]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0"
            />
            
            {/* Floating Particles */}
            {callState.status === 'active' && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -30, 0],
                      x: [0, Math.sin(i) * 20, 0],
                      opacity: [0, 0.6, 0],
                      scale: [0.3, 1, 0.3]
                    }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeInOut"
                    }}
                    className="absolute w-2 h-2 bg-white/40 rounded-full"
                    style={{
                      top: `${20 + (i % 3) * 20}%`,
                      left: `${10 + (i % 4) * 20}%`
                    }}
                  />
                ))}
              </>
            )}
            
            <button
              onClick={() => {
                if (callState.status === 'active') {
                  endCall();
                } else {
                  onClose();
                }
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex flex-col items-center space-y-3 relative z-10">
              {/* Avatar with Status Ring */}
              <div className="relative">
                {/* Status Ring Animation */}
                <motion.div
                  animate={{
                    scale: callState.status === 'active' ? [1, 1.3, 1] : [1],
                    opacity: callState.status === 'active' ? [0.3, 0.7, 0.3] : [0.3],
                    rotate: callState.status === 'connecting' ? [0, 360] : [0]
                  }}
                  transition={{
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 1, repeat: Infinity, ease: "linear" }
                  }}
                  className={`absolute inset-0 rounded-full border-2 ${
                    callState.status === 'active' ? 'border-green-300' :
                    callState.status === 'connecting' ? 'border-yellow-300' :
                    callState.status === 'error' ? 'border-red-300' :
                    'border-white/30'
                  }`}
                />
                
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center relative">
                  <motion.div
                    animate={{
                      scale: callState.status === 'active' ? [1, 1.2, 1] : [1, 1.1, 1],
                      rotate: callState.status === 'active' ? [0, 10, -10, 0] : [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: callState.status === 'active' ? 1.5 : 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {getStatusIcon()}
                  </motion.div>
                  
                  {/* Pulse Effect for Active Call */}
                  {callState.status === 'active' && (
                    <motion.div
                      animate={{
                        scale: [1, 1.5],
                        opacity: [0.6, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeOut"
                      }}
                      className="absolute inset-0 rounded-full bg-green-400/30"
                    />
                  )}
                </div>
              </div>
              
              <div>
                <motion.h2 
                  animate={{
                    scale: callState.status === 'active' ? [1, 1.05, 1] : [1]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-xl font-bold"
                >
                  {language === 'bn' ? 'ডা. মিমু' : 'Dr. Mimu'}
                </motion.h2>
                <p className="text-blue-100 text-sm">
                  {language === 'bn' ? 'AI চিকিৎসা সহায়ক' : 'AI Medical Assistant'}
                </p>
              </div>
              
              <motion.div 
                animate={{
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center space-x-2"
              >
                {getStatusIcon()}
                <span className="text-sm font-medium">{getStatusText()}</span>
              </motion.div>
              
              {/* Audio Waveform Visualization */}
              {callState.status === 'active' && callState.isRecording && (
                <div className="flex items-center space-x-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: [4, 16, 4],
                        backgroundColor: [
                          "rgba(34, 197, 94, 0.6)",
                          "rgba(34, 197, 94, 1)",
                          "rgba(34, 197, 94, 0.6)"
                        ]
                      }}
                      transition={{
                        duration: 0.5 + i * 0.1,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: "easeInOut"
                      }}
                      className="w-1 bg-green-400 rounded-full"
                      style={{ height: '4px' }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* কল কন্ট্রোল */}
          <div className="p-6">
            {/* ত্রুটি বার্তা */}
            {callState.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700"
              >
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{callState.error}</span>
              </motion.div>
            )}

            {/* ট্রান্সক্রিপ্ট */}
            {callState.transcript && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-1">
                  {language === 'bn' ? 'আপনি বলেছেন:' : 'You said:'}
                </p>
                <p className="text-sm text-blue-700">{callState.transcript}</p>
              </div>
            )}

            {/* AI প্রতিক্রিয়া */}
            {callState.aiResponse && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium mb-1">
                  {language === 'bn' ? 'ডা. মিমু বলেছেন:' : 'Dr. Mimu says:'}
                </p>
                <p className="text-sm text-green-700">{callState.aiResponse}</p>
              </div>
            )}

            {/* কল বাটন */}
            <div className="flex justify-center space-x-4">
              {callState.status === 'idle' && (
                <div className="relative">
                  {/* Pulsing Ring */}
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 rounded-full bg-green-400/30"
                  />
                  
                  <motion.button
                    onClick={startCall}
                    whileHover={{ 
                      scale: 1.1,
                      boxShadow: "0 10px 30px rgba(34, 197, 94, 0.4)"
                    }}
                    whileTap={{ scale: 0.9 }}
                    animate={{
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        "0 4px 20px rgba(34, 197, 94, 0.3)",
                        "0 8px 25px rgba(34, 197, 94, 0.4)",
                        "0 4px 20px rgba(34, 197, 94, 0.3)"
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg flex items-center justify-center transition-colors overflow-hidden"
                  >
                    {/* Inner Glow */}
                    <motion.div
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [0.8, 1.1, 0.8]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-2 rounded-full bg-white/20"
                    />
                    
                    <motion.div
                      animate={{
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Heart className="w-6 h-6 relative z-10" />
                    </motion.div>
                  </motion.button>
                </div>
              )}

              {callState.status === 'active' && (
                <>
                  {/* মিউট বাটন */}
                  <div className="relative">
                    {callState.isMuted && (
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.4, 0.7, 0.4]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 rounded-full bg-red-400/40"
                      />
                    )}
                    
                    <motion.button
                      onClick={toggleMute}
                      whileHover={{ 
                        scale: 1.1,
                        rotate: [0, -10, 10, 0]
                      }}
                      whileTap={{ scale: 0.9 }}
                      animate={{
                        backgroundColor: callState.isMuted 
                          ? ["#ef4444", "#dc2626", "#ef4444"]
                          : ["#e5e7eb", "#d1d5db", "#e5e7eb"]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className={`relative w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors ${
                        callState.isMuted 
                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      <motion.div
                        animate={{
                          scale: callState.isMuted ? [1, 1.2, 1] : [1]
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: callState.isMuted ? Infinity : 0,
                          ease: "easeInOut"
                        }}
                      >
                        {callState.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </motion.div>
                    </motion.button>
                  </div>

                  {/* কল শেষ বাটন */}
                  <div className="relative">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 rounded-full bg-red-400/30"
                    />
                    
                    <motion.button
                      onClick={endCall}
                      whileHover={{ 
                        scale: 1.1,
                        rotate: [0, 10, -10, 0],
                        boxShadow: "0 10px 30px rgba(239, 68, 68, 0.4)"
                      }}
                      whileTap={{ scale: 0.9 }}
                      animate={{
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          "0 4px 20px rgba(239, 68, 68, 0.3)",
                          "0 8px 25px rgba(239, 68, 68, 0.4)",
                          "0 4px 20px rgba(239, 68, 68, 0.3)"
                        ]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="relative w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg flex items-center justify-center transition-colors overflow-hidden"
                    >
                      {/* Inner Glow */}
                      <motion.div
                        animate={{
                          opacity: [0.3, 0.6, 0.3],
                          scale: [0.8, 1.1, 0.8]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-2 rounded-full bg-white/20"
                      />
                      
                      <motion.div
                        animate={{
                          rotate: [0, -5, 5, 0]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <PhoneOff className="w-6 h-6 relative z-10" />
                      </motion.div>
                    </motion.button>
                  </div>

                  {/* স্পিকার বাটন */}
                  <div className="relative">
                    {callState.isSpeakerOn && (
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 rounded-full bg-blue-400/30"
                      />
                    )}
                    
                    <motion.button
                      onClick={toggleSpeaker}
                      whileHover={{ 
                        scale: 1.1,
                        rotate: [0, 8, -8, 0]
                      }}
                      whileTap={{ scale: 0.9 }}
                      animate={{
                        backgroundColor: callState.isSpeakerOn 
                          ? ["#3b82f6", "#2563eb", "#3b82f6"]
                          : ["#e5e7eb", "#d1d5db", "#e5e7eb"]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className={`relative w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors ${
                        callState.isSpeakerOn 
                          ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      <motion.div
                        animate={{
                          scale: callState.isSpeakerOn ? [1, 1.1, 1] : [1]
                        }}
                        transition={{
                          duration: 1,
                          repeat: callState.isSpeakerOn ? Infinity : 0,
                          ease: "easeInOut"
                        }}
                      >
                        {callState.isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                      </motion.div>
                    </motion.button>
                  </div>
                </>
              )}
            </div>

            {/* রেকর্ডিং ইন্ডিকেটর এবং মাইক্রোফোন লেভেল */}
            {callState.isRecording && (
              <div className="mt-4 space-y-3">
                {/* Microphone Level Indicator */}
                <div className="flex items-center justify-center space-x-1">
                  {[...Array(7)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: [8, 24, 8],
                        backgroundColor: [
                          "rgba(239, 68, 68, 0.6)",
                          "rgba(239, 68, 68, 1)",
                          "rgba(239, 68, 68, 0.6)"
                        ],
                        boxShadow: [
                          "0 0 5px rgba(239, 68, 68, 0.3)",
                          "0 0 15px rgba(239, 68, 68, 0.6)",
                          "0 0 5px rgba(239, 68, 68, 0.3)"
                        ]
                      }}
                      transition={{
                        duration: 0.3 + i * 0.05,
                        repeat: Infinity,
                        delay: i * 0.05,
                        ease: "easeInOut"
                      }}
                      className="w-1 bg-red-500 rounded-full"
                      style={{ height: '8px' }}
                    />
                  ))}
                </div>
                
                {/* Recording Status */}
                <motion.div
                  animate={{ 
                    opacity: [1, 0.5, 1],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="flex items-center justify-center space-x-3 text-red-500"
                >
                  {/* Pulsing Dot */}
                  <motion.div
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1],
                      boxShadow: [
                        "0 0 5px rgba(239, 68, 68, 0.5)",
                        "0 0 15px rgba(239, 68, 68, 0.8)",
                        "0 0 5px rgba(239, 68, 68, 0.5)"
                      ]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-3 h-3 bg-red-500 rounded-full"
                  />
                  
                  {/* Sound Waves */}
                  <div className="flex items-center space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.3, 0.8, 0.3]
                        }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeInOut"
                        }}
                        className="w-1 h-4 bg-red-400 rounded-full"
                      />
                    ))}
                  </div>
                  
                  <span className="text-sm font-medium">
                    {language === 'bn' ? 'শুনছি...' : 'Listening...'}
                  </span>
                </motion.div>
              </div>
            )}

            {/* লোডিং ইন্ডিকেটর */}
            {loading && (
              <div className="mt-4 flex items-center justify-center space-x-2 text-blue-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">
                  {language === 'bn' ? 'প্রক্রিয়াকরণ...' : 'Processing...'}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AudioCallInterface;