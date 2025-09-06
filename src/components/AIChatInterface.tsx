// React এবং প্রয়োজনীয় hooks ইমপোর্ট
import React, { useState, useRef, useEffect } from 'react';
// Lucide React থেকে আইকন ইমপোর্ট - UI এর জন্য
import { Send, Bot, User, ShoppingCart, Calendar, Pill, Stethoscope, MapPin, Star, Clock, DollarSign, Upload, Heart, Phone, FileText, Shield, Baby, Activity } from 'lucide-react';
// মেডিকেল ডেটা সার্ভিস - রোগী ও চিকিৎসা তথ্য ব্যবস্থাপনার জন্য
import { medicalDataService } from '../services/medicalDataService';
// বাংলাদেশের স্থানীয় মেডিকেল ডেটা - ওষুধ, হাসপাতাল, ডাক্তারের তথ্য
import { bangladeshMedicalData } from '../data/bangladeshMedicalData';
// LangChain AI সার্ভিস - Gemini + GPT + mimo ইন্টিগ্রেশনের জন্য
import langchainService from '../services/langchainService';
// ওষুধ অর্ডার সিস্টেম কম্পোনেন্ট
import MedicineOrderSystem from './MedicineOrderSystem';
// ডাক্তার অ্যাপয়েন্টমেন্ট সিস্টেম কম্পোনেন্ট
import DoctorAppointmentSystem from './DoctorAppointmentSystem';
// প্রেসক্রিপশন আপলোড সিস্টেম কম্পোনেন্ট
import PrescriptionUpload from './PrescriptionUpload';
// অর্ডার কনফার্মেশন সিস্টেম কম্পোনেন্ট
import OrderConfirmationSystem from './OrderConfirmationSystem';
// ডেটা স্টোরেজ সার্ভিস - চ্যাট হিস্ট্রি ও মেডিকেল ডেটা সংরক্ষণের জন্য
import dataStorageService from '../services/dataStorageService';
// চ্যাট হিস্টরি সার্ভিস - চ্যাট ইতিহাস ব্যবস্থাপনার জন্য
import chatHistoryService, { ChatMessage, ChatSession } from '../services/chatHistoryService';

// চ্যাট ইনপুট কম্পোনেন্ট ইমপোর্ট
import ChatInput from './ChatInput';

// চ্যাট মেসেজের জন্য ইন্টারফেস - প্রতিটি মেসেজের গঠন নির্ধারণ করে
interface Message {
  id: string; // ইউনিক আইডি
  text: string; // মেসেজের টেক্সট
  sender: 'user' | 'bot'; // পাঠানোর ব্যক্তি - ইউজার নাকি বট
  timestamp: Date; // মেসেজ পাঠানোর সময়
  type?: 'text' | 'medicine' | 'doctor' | 'order' | 'appointment'; // মেসেজের ধরন
  data?: any; // অতিরিক্ত ডেটা (ওষুধ/ডাক্তারের তথ্য)
}

// ওষুধের তথ্যের জন্য ইন্টারফেস - বাংলাদেশি ওষুধের সম্পূর্ণ তথ্য
interface Medicine {
  id: string; // ওষুধের ইউনিক আইডি
  name: string; // ওষুধের নাম (বাংলা/ইংরেজি)
  brand: string; // ব্র্যান্ড নাম (স্কয়ার, বেক্সিমকো ইত্যাদি)
  price: number; // দাম (টাকায়)
  image?: string; // ওষুধের ছবি (ঐচ্ছিক)
  description: string; // ওষুধের বর্ণনা ও ব্যবহার
  dosage: string; // ডোজ ও সেবনবিধি
  sideEffects: string[]; // পার্শ্বপ্রতিক্রিয়ার তালিকা
}

// ডাক্তারের তথ্যের জন্য ইন্টারফেস - বাংলাদেশি ডাক্তারদের সম্পূর্ণ তথ্য
interface Doctor {
  id: string; // ডাক্তারের ইউনিক আইডি
  name: string; // ডাক্তারের নাম
  specialty: string; // বিশেষত্ব (কার্ডিওলজি, গাইনোকলজি ইত্যাদি)
  experience: number; // অভিজ্ঞতা (বছরে)
  rating: number; // রেটিং (৫ এর মধ্যে)
  location: string; // অবস্থান (ঢাকা, চট্টগ্রাম ইত্যাদি)
  fee: number; // ভিজিট ফি (টাকায়)
  image?: string; // ডাক্তারের ছবি (ঐচ্ছিক)
  availability: string[]; // সপ্তাহের কোন দিন পাওয়া যায়
}

// AI চ্যাট ইন্টারফেস কম্পোনেন্ট প্রপস
interface AIChatInterfaceProps {
  sessionId?: string;
  onSessionChange?: (sessionId: string) => void;
  language?: 'bn' | 'en';
  onClose?: () => void;
}

// AI চ্যাট ইন্টারফেস কম্পোনেন্ট - ডা. মিমুর মূল চ্যাট সিস্টেম
const AIChatInterface: React.FC<AIChatInterfaceProps> = ({ sessionId, onSessionChange, language = 'bn', onClose }) => {
  // ইউজার আইডি - বর্তমানে ডিফল্ট ইউজার, পরবর্তীতে authentication থেকে আসবে
  const [userId] = useState('default-user-id');
  
  // বর্তমান চ্যাট সেশন
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  
  // চ্যাট মেসেজগুলোর স্টেট - প্রাথমিক স্বাগত বার্তা সহ
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'আসসালামু আলাইকুম! আমি ডা.মিমু, আপনার AI চিকিৎসা সহায়ক। আমি বাংলা এবং ইংরেজি উভয় ভাষায় আপনাকে চিকিৎসা সংক্রান্ত পরামর্শ দিতে পারি। আপনার স্বাস্থ্য সমস্যা সম্পর্কে বলুন।',
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  // ইনপুট টেক্সট স্টেট - ইউজারের টাইপ করা মেসেজ
  const [inputText, setInputText] = useState('');
  // SMS শেয়ার স্টেট
  const [showSmsModal, setShowSmsModal] = useState(false);
  // ওষুধ অর্ডার মোডাল স্টেট
  const [showMedicineOrder, setShowMedicineOrder] = useState(false);
  // ডাক্তার অ্যাপয়েন্টমেন্ট মোডাল স্টেট
  const [showDoctorAppointment, setShowDoctorAppointment] = useState(false);
  // লোডিং স্টেট - AI প্রসেসিং এর সময় দেখানোর জন্য
  const [isLoading, setIsLoading] = useState(false);
  // বর্তমান ভিউ স্টেট - চ্যাট, ওষুধ অর্ডার বা ডাক্তার অ্যাপয়েন্টমেন্ট
  const [currentView, setCurrentView] = useState<'chat' | 'medicine' | 'doctor'>('chat');
  // প্রেসক্রিপশন আপলোড মোডাল দেখানোর স্টেট
  const [showPrescriptionUpload, setShowPrescriptionUpload] = useState(false);
  // কনফার্মেশন মোডাল দেখানোর স্টেট
  const [showConfirmation, setShowConfirmation] = useState(false);
  // কনফার্মেশন ডেটা স্টেট - অর্ডার বা অ্যাপয়েন্টমেন্ট আইডি
  const [confirmationData, setConfirmationData] = useState<{ orderId?: string; appointmentId?: string }>({});
  // মোবাইল কুইক সার্ভিস মেনু দেখানোর স্টেট
  const [showQuickServices, setShowQuickServices] = useState(false);
  // মেসেজ স্ক্রল করার জন্য রেফারেন্স
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // চ্যাট স্ক্রল ফাংশন - নতুন মেসেজে অটো স্ক্রল (Mobile Optimized)
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // Mobile-friendly scroll with better performance
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  // মেসেজ পরিবর্তনের সাথে সাথে স্ক্রল করার useEffect - Mobile Optimized
  useEffect(() => {
    // Delay scroll slightly for better mobile performance
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  // কম্পোনেন্ট লোড হওয়ার সময় চ্যাট সেশন ইনিশিয়ালাইজ করার useEffect
  useEffect(() => {
    // যদি sessionId প্রদান করা হয় তাহলে সেই সেশন লোড করা
    if (sessionId) {
      const session = chatHistoryService.getSessionById(sessionId);
      if (session) {
        setCurrentSession(session);
        // সেশনের মেসেজগুলো লোড করা
        const sessionMessages = session.messages.map(msg => ({
          id: msg.id,
          text: msg.content,
          sender: msg.type === 'user' ? 'user' as const : 'bot' as const,
          timestamp: msg.timestamp,
          type: 'text' as const,
          data: msg.metadata
        }));
        setMessages(sessionMessages);
      }
    } else {
      // নতুন সেশন তৈরি করা
      const newSession = chatHistoryService.createSession();
      setCurrentSession(newSession);
      if (onSessionChange) {
        onSessionChange(newSession.id);
      }
    }
    
    // AI conversation memory clear করা যাতে নতুন conversation শুরু হয়
    if (langchainService.isInitialized()) {
      langchainService.clearMemory();
    }
    
    // Check for pending chat message from Medical Test System
    const pendingMessage = localStorage.getItem('pendingChatMessage');
    if (pendingMessage) {
      // Remove from localStorage to prevent duplicate imports
      localStorage.removeItem('pendingChatMessage');
      
      // Add the medical test results as a user message
      const medicalTestMessage: Message = {
        id: Date.now().toString(),
        text: pendingMessage,
        sender: 'user',
        timestamp: new Date(),
        type: 'text'
      };
      
      // Add to messages and process with AI
      setMessages(prev => [...prev, medicalTestMessage]);
      
      // Process the medical test results with AI
      setTimeout(() => {
        handleSendMessage(pendingMessage);
      }, 1000);
    }
  }, [sessionId]); // sessionId পরিবর্তনের সাথে সাথে চালু হবে

  // চ্যাট মেসেজ হিস্টরি সার্ভিসে সংরক্ষণ করার ফাংশন
  const saveChatMessage = (message: Message) => {
    try {
      if (!currentSession) return;
      
      // চ্যাট হিস্টরি সার্ভিসে মেসেজ সংরক্ষণ
      chatHistoryService.saveChatMessage({
        sessionId: currentSession.id,
        type: message.sender,
        content: message.text,
        metadata: {
          reportIds: message.data?.reportIds || [],
          prescriptionIds: message.data?.prescriptionIds || [],
          symptoms: message.data?.symptoms || [],
          diagnosis: message.data?.diagnosis || '',
          recommendations: message.data?.recommendations || []
        }
      });
      
      // পুরানো ডেটা স্টোরেজ সার্ভিসেও সংরক্ষণ (backward compatibility)
      dataStorageService.saveChatMessage({
        userId: userId,
        message: message.text,
        sender: message.sender === 'user' ? 'user' : 'mimu',
        category: message.type === 'medicine' ? 'prescription' : 
                 message.type === 'doctor' ? 'consultation' : 'general',
        metadata: {
          symptoms: message.data?.symptoms || [],
          diagnosis: message.data?.diagnosis || '',
          recommendations: message.data?.recommendations || []
        }
      });
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  };

  // মেসেজ পাঠানোর মূল ফাংশন - ইউজার ইনপুট প্রসেস করে AI রেসপন্স জেনারেট করে
  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputText;
    if (!messageToSend.trim()) return; // খালি মেসেজ পাঠানো বন্ধ করা

    // ইউজারের মেসেজ অবজেক্ট তৈরি
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageToSend,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    // ইউজারের মেসেজ ডেটা স্টোরেজে সংরক্ষণ
    saveChatMessage(userMessage);

    // মেসেজ লিস্টে ইউজারের মেসেজ যোগ করা
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = messageToSend;
    if (!message) setInputText(''); // ইনপুট ফিল্ড খালি করা (শুধুমাত্র যদি ইনপুট থেকে আসে)
    setIsLoading(true); // লোডিং শুরু

    try {
      // AI প্রসেসিং এবং রেসপন্স জেনারেশন - LangChain সার্ভিস ব্যবহার করে
      const response = await processUserMessage(currentMessage);
      
      // AI এর রেসপন্স ডেটা স্টোরেজে সংরক্ষণ
      saveChatMessage(response);
      
      // AI এর রেসপন্স মেসেজ লিস্টে যোগ করা
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Error processing message:', error);
      // এরর হ্যান্ডলিং - ইউজারকে বন্ধুত্বপূর্ণ এরর মেসেজ দেখানো
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'দুঃখিত, কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      // এরর মেসেজও সংরক্ষণ করা
      saveChatMessage(errorMessage);
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false); // লোডিং শেষ
    }
  };

  // SMS শেয়ার হ্যান্ডলার
  const handleSmsShare = (message: string) => {
    try {
      // SMS URL তৈরি করা
      const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
      
      // মোবাইল ডিভাইসে SMS অ্যাপ খোলা
      if (navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i)) {
        window.location.href = smsUrl;
      } else {
        // ডেস্কটপে ক্লিপবোর্ডে কপি করা
        navigator.clipboard.writeText(message).then(() => {
          alert('বার্তাটি ক্লিপবোর্ডে কপি হয়েছে!');
        }).catch(() => {
          // ফলব্যাক: টেক্সট সিলেক্ট করার জন্য মোডাল দেখানো
          setShowSmsModal(true);
        });
      }
    } catch (error) {
      console.error('SMS share error:', error);
      alert('এসএমএস পাঠাতে সমস্যা হয়েছে।');
    }
  };

  // ফাইল আপলোড হ্যান্ডলার
  const handleFileUpload = (file: File) => {
    // ফাইল আপলোড লজিক এখানে যোগ করা যেতে পারে
    console.log('File uploaded:', file.name);
    alert(`ফাইল আপলোড হয়েছে: ${file.name}`);
  };

  // ভয়েস ইনপুট হ্যান্ডলার
  const handleVoiceInput = () => {
    // ভয়েস ইনপুট লজিক এখানে যোগ করা যেতে পারে
    console.log('Voice input activated');
    alert('ভয়েস ইনপুট শীঘ্রই আসছে!');
  };

  // মেনু থেকে ফিচার অ্যাক্সেস হ্যান্ডলার
  const handleFeatureClick = (featureId: string) => {
    switch (featureId) {
      case 'medicine-search':
        setCurrentView('medicine');
        break;
      case 'medicine-order':
        setShowMedicineOrder(true);
        break;
      case 'doctor-search':
        setCurrentView('doctor');
        break;
      case 'doctor-appointment':
        setShowDoctorAppointment(true);
        break;
      case 'prescription-upload':
        setShowPrescriptionUpload(true);
        break;
      case 'health-tips':
        handleSendMessage('স্বাস্থ্য টিপস দিন');
        break;
      case 'medicine-reminder':
        handleSendMessage('ওষুধ খাওয়ার রিমাইন্ডার সেট করুন');
        break;
      case 'symptom-checker':
        handleSendMessage('আমার লক্ষণ পরীক্ষা করুন');
        break;
      case 'emergency-contact':
        handleSendMessage('জরুরি যোগাযোগের তথ্য দিন');
        break;
      case 'ai-chat':
        // AI চ্যাট ইতিমধ্যে খোলা আছে
        break;
      case 'telemedicine':
        handleSendMessage('টেলিমেডিসিন সেবা সম্পর্কে জানান');
        break;
      case 'health-records':
        handleSendMessage('স্বাস্থ্য রেকর্ড দেখান');
        break;
      case 'lab-reports':
        handleSendMessage('ল্যাব রিপোর্ট আপলোড করতে চাই');
        break;
      case 'insurance':
        handleSendMessage('স্বাস্থ্য বীমা সম্পর্কে জানান');
        break;
      case 'ambulance':
        handleSendMessage('অ্যাম্বুলেন্স সেবা প্রয়োজন');
        break;
      case 'blood-bank':
        handleSendMessage('রক্তের ব্যাংক খুঁজে দিন');
        break;
      case 'hospital-finder':
        handleSendMessage('কাছের হাসপাতাল খুঁজে দিন');
        break;
      case 'pharmacy-finder':
        handleSendMessage('কাছের ফার্মেসি খুঁজে দিন');
        break;
      default:
        console.log('অজানা ফিচার:', featureId);
    }
  };

  // ইউজার মেসেজ প্রসেসিং ফাংশন - LangChain AI সার্ভিস ব্যবহার করে context-aware responses
  const processUserMessage = async (message: string): Promise<Message> => {
    try {
      // বর্তমান সেশনের context পাওয়া
      const context = currentSession ? 
        chatHistoryService.getContextForAI(currentSession.id, 10) : 
        { recentMessages: [], relevantHistory: [], reports: [], prescriptions: [] };
      
      // Context তৈরি করা AI এর জন্য
      const contextMessage = [
        // সাম্প্রতিক মেসেজগুলো
        ...context.recentMessages.map(msg => `${msg.type === 'user' ? 'রোগী' : 'ডাক্তার'}: ${msg.content}`),
        // প্রাসঙ্গিক ইতিহাস
        ...(context.relevantHistory.length > 0 ? [
          '\n--- পূর্ববর্তী প্রাসঙ্গিক আলোচনা ---',
          ...context.relevantHistory.map(msg => `${msg.type === 'user' ? 'রোগী' : 'ডাক্তার'}: ${msg.content}`)
        ] : []),
        // রিপোর্টের তথ্য
        ...(context.reports.length > 0 ? [
          '\n--- আপলোড করা রিপোর্ট ---',
          ...context.reports.map(report => `রিপোর্ট: ${report.fileName} (${report.analysis || 'বিশ্লেষণ প্রয়োজন'})`)
        ] : []),
        // প্রেসক্রিপশনের তথ্য
        ...(context.prescriptions.length > 0 ? [
          '\n--- পূর্ববর্তী প্রেসক্রিপশন ---',
          ...context.prescriptions.map(prescription => `ওষুধ: ${prescription.medicines.join(', ')} - ${prescription.instructions}`)
        ] : [])
      ].join('\n');
      
      // Context সহ AI প্রসেসিং
      const fullMessage = contextMessage ? `${contextMessage}\n\n--- বর্তমান প্রশ্ন ---\n${message}` : message;
      const aiResponse = await langchainService.processMessage(fullMessage);
      
      // AI রেসপন্স চেক করে ওষুধ বা ডাক্তার সংক্রান্ত কিনা নির্ধারণ
      if (aiResponse.type === 'medicine') {
        const medicineResponse = await handleMedicineQuery(message);
        
        // যদি রোগের অবস্থা উল্লেখ থাকে তাহলে ডাক্তার সাজেস্টও যোগ করা
        if (aiResponse.suggestDoctor) {
          const doctorSuggestion = await handleDoctorQuery(message);
          medicineResponse.text += '\n\n🩺 **সংশ্লিষ্ট বিশেষজ্ঞ ডাক্তারদের পরামর্শ:**\n' + 
            'আপনার অবস্থার জন্য নিম্নলিখিত বিশেষজ্ঞ ডাক্তারদের সাথে পরামর্শ করতে পারেন:';
          
          // ডাক্তারের তথ্য যোগ করা
          if (doctorSuggestion.data && Array.isArray(doctorSuggestion.data)) {
            medicineResponse.data = {
              medicines: medicineResponse.data || [],
              doctors: doctorSuggestion.data
            };
          }
        }
        
        return medicineResponse;
      } else if (aiResponse.type === 'doctor') {
        return await handleDoctorQuery(message); // ডাক্তার সংক্রান্ত কোয়েরি হ্যান্ডল
      }
      
      // সাধারণ টেক্সট রেসপন্স রিটার্ন
      return {
        id: Date.now().toString(),
        text: aiResponse.text || aiResponse,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
    } catch (error) {
      console.error('Error processing message:', error);
      // এরর হ্যান্ডলিং - ব্যাকআপ রেসপন্স
      return {
        id: Date.now().toString(),
        text: 'দুঃখিত, একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
    }
  };

  // ওষুধ অর্ডার কনফার্মেশন হ্যান্ডলার - অর্ডার সফল হলে কনফার্মেশন মোডাল দেখানো
  const handleOrderConfirmation = (orderId: string) => {
    setConfirmationData({ orderId });
    setShowConfirmation(true);
  };

  // ডাক্তার অ্যাপয়েন্টমেন্ট কনফার্মেশন হ্যান্ডলার - অ্যাপয়েন্টমেন্ট সফল হলে কনফার্মেশন মোডাল দেখানো
  const handleAppointmentConfirmation = (appointmentId: string) => {
    setConfirmationData({ appointmentId });
    setShowConfirmation(true);
  };

  // কনফার্মেশন মোডাল বন্ধ করার ফাংশন
  const closeConfirmation = () => {
    setShowConfirmation(false);
    setConfirmationData({});
  };

  // প্রেসক্রিপশন আপলোড হ্যান্ডলার - প্রেসক্রিপশন থেকে ওষুধের তথ্য বের করে চ্যাটে যোগ করা
  const handlePrescriptionUpload = (data: { medications: any[], diagnosis?: string, doctorName?: string, date?: string }) => {
    // প্রেসক্রিপশন চ্যাট হিস্টরি সার্ভিসে সংরক্ষণ
    const prescription = chatHistoryService.savePrescription({
      doctorName: data.doctorName || 'অজানা ডাক্তার',
      medicines: data.medications.map(med => med.name || 'অজানা ওষুধ'),
      instructions: data.diagnosis || 'প্রেসক্রিপশন অনুযায়ী সেবন করুন',
      date: data.date ? new Date(data.date) : new Date()
    });
    
    // প্রেসক্রিপশন থেকে পাওয়া ওষুধের তথ্য চ্যাটে মেসেজ হিসেবে যোগ করা
    const prescriptionMessage: Message = {
      id: Date.now().toString(),
      text: `প্রেসক্রিপশন আপলোড সফল! ${data.medications.length}টি ওষুধ পাওয়া গেছে:`,
      sender: 'bot',
      timestamp: new Date(),
      type: 'medicine',
      data: {
        ...data.medications.map((med: any, index: number) => ({
          id: (index + 1).toString(),
          name: med.name || 'অজানা ওষুধ',
          brand: med.brand || 'জেনেরিক',
          price: med.price || 10.0,
          description: med.description || 'প্রেসক্রিপশন অনুযায়ী',
          dosage: med.dosage || med.instructions || 'ডাক্তারের পরামর্শ অনুযায়ী',
          sideEffects: med.sideEffects || ['পার্শ্বপ্রতিক্রিয়া সম্পর্কে ডাক্তারের সাথে পরামর্শ করুন']
        })),
        prescriptionIds: [prescription.id]
      }
    };
    
    // মেসেজ সংরক্ষণ
    saveChatMessage(prescriptionMessage);
    setMessages(prev => [...prev, prescriptionMessage]);
    setShowPrescriptionUpload(false);
    
    // যদি রোগ নির্ণয় থাকে তাহলে সংশ্লিষ্ট ডাক্তার সাজেস্ট করা
    if (data.diagnosis) {
      setTimeout(() => {
        const doctorSuggestion = handleDoctorQuery(data.diagnosis);
        doctorSuggestion.then(doctorMsg => {
          saveChatMessage(doctorMsg);
          setMessages(prev => [...prev, doctorMsg]);
        });
      }, 1000);
    }
  };

  // ওষুধ সংক্রান্ত কোয়েরি হ্যান্ডলার - বাংলাদেশি ওষুধের তথ্য প্রদান
  const handleMedicineQuery = async (query: string): Promise<Message> => {
    // বাংলাদেশের জনপ্রিয় ওষুধের নমুনা ডেটা - স্থানীয় ব্র্যান্ড ও দাম সহ
    const medicines: Medicine[] = [
      {
        id: '1',
        name: 'প্যারাসিটামল',
        brand: 'স্কয়ার',
        price: 2.5,
        description: 'জ্বর এবং ব্যথার জন্য',
        dosage: '৫০০ মিগ্রা দিনে ৩ বার',
        sideEffects: ['পেট খারাপ', 'মাথা ঘোরা']
      },
      {
        id: '2',
        name: 'অ্যামোক্সিসিলিন',
        brand: 'বেক্সিমকো',
        price: 8.0,
        description: 'ব্যাকটেরিয়া সংক্রমণের জন্য',
        dosage: '২৫০ মিগ্রা দিনে ৩ বার',
        sideEffects: ['ডায়রিয়া', 'বমি ভাব']
      },
      {
        id: '3',
        name: 'ওমিপ্রাজল',
        brand: 'ইনসেপ্টা',
        price: 5.5,
        description: 'গ্যাস্ট্রিক সমস্যার জন্য',
        dosage: '২০ মিগ্রা দিনে ১ বার',
        sideEffects: ['মাথাব্যথা', 'কোষ্ঠকাঠিন্য']
      }
    ];

    return {
      id: Date.now().toString(),
      text: 'এখানে কিছু জনপ্রিয় ওষুধের তালিকা:',
      sender: 'bot',
      timestamp: new Date(),
      type: 'medicine',
      data: medicines
    };
  };

  // ডাক্তার সংক্রান্ত কোয়েরি হ্যান্ডলার - বাংলাদেশি ডাক্তারদের তথ্য প্রদান
  const handleDoctorQuery = async (query: string): Promise<Message> => {
    // বাংলাদেশের অভিজ্ঞ ডাক্তারদের নমুনা ডেটা - বিশেষত্ব ও ফি সহ
    const doctors: Doctor[] = [
      {
        id: '1',
        name: 'ডা. আহমেদ হাসান',
        specialty: 'কার্ডিওলজিস্ট',
        experience: 15,
        rating: 4.8,
        location: 'ধানমন্ডি, ঢাকা',
        fee: 1500,
        availability: ['সোমবার', 'বুধবার', 'শুক্রবার']
      },
      {
        id: '2',
        name: 'ডা. ফাতেমা খাতুন',
        specialty: 'গাইনোকলজিস্ট',
        experience: 12,
        rating: 4.9,
        location: 'গুলশান, ঢাকা',
        fee: 1200,
        availability: ['মঙ্গলবার', 'বৃহস্পতিবার', 'শনিবার']
      },
      {
        id: '3',
        name: 'ডা. রহিম উদ্দিন',
        specialty: 'শিশু বিশেষজ্ঞ',
        experience: 10,
        rating: 4.7,
        location: 'বনানী, ঢাকা',
        fee: 1000,
        availability: ['রবিবার', 'মঙ্গলবার', 'বৃহস্পতিবার']
      }
    ];

    return {
      id: Date.now().toString(),
      text: 'এখানে কিছু অভিজ্ঞ ডাক্তারের তালিকা:',
      sender: 'bot',
      timestamp: new Date(),
      type: 'doctor',
      data: doctors
    };
  };

  // ওষুধ অর্ডার হ্যান্ডলার - নির্দিষ্ট ওষুধ অর্ডারের জন্য কনফার্মেশন মেসেজ
  const handleMedicineOrder = (medicine: Medicine) => {
    const orderMessage: Message = {
      id: Date.now().toString(),
      text: `আপনি "${medicine.name} (${medicine.brand})" অর্ডার করতে চান। দাম: ৳${medicine.price}। অর্ডার কনফার্ম করতে "হ্যাঁ" লিখুন।`,
      sender: 'bot',
      timestamp: new Date(),
      type: 'order',
      data: medicine
    };
    setMessages(prev => [...prev, orderMessage]);
  };

  // ডাক্তার অ্যাপয়েন্টমেন্ট হ্যান্ডলার - নির্দিষ্ট ডাক্তারের সাথে অ্যাপয়েন্টমেন্টের জন্য কনফার্মেশন মেসেজ
  const handleDoctorAppointment = (doctor: Doctor) => {
    const appointmentMessage: Message = {
      id: Date.now().toString(),
      text: `আপনি "${doctor.name}" এর সাথে অ্যাপয়েন্টমেন্ট নিতে চান। ফি: ৳${doctor.fee}। অ্যাপয়েন্টমেন্ট কনফার্ম করতে "হ্যাঁ" লিখুন।`,
      sender: 'bot',
      timestamp: new Date(),
      type: 'appointment',
      data: doctor
    };
    setMessages(prev => [...prev, appointmentMessage]);
  };

  // মেসেজ রেন্ডারিং ফাংশন - বিভিন্ন ধরনের মেসেজ (টেক্সট, ওষুধ, ডাক্তার) প্রদর্শন
  const renderMessage = (message: Message) => {
    // ওষুধের তথ্য সহ মেসেজ রেন্ডার - কার্ড ভিউতে ওষুধের বিস্তারিত তথ্য
    if (message.type === 'medicine' && message.data) {
      const medicines = Array.isArray(message.data) ? message.data : message.data.medicines || [];
      const doctors = message.data.doctors || [];
      
      return (
        <div className="space-y-3">
          <p className="text-gray-700 mb-3">{message.text}</p>
          
          {/* ওষুধের তালিকা */}
          {medicines.map((medicine: Medicine) => (
            <div key={medicine.id} className="border rounded-lg p-4 bg-blue-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-blue-800">{medicine.name}</h4>
                  <p className="text-sm text-gray-600">ব্র্যান্ড: {medicine.brand}</p>
                  <p className="text-sm text-gray-600 mt-1">{medicine.description}</p>
                  <p className="text-sm text-gray-600">ডোজ: {medicine.dosage}</p>
                  <div className="flex items-center mt-2">
                    <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                    <span className="font-semibold text-green-600">৳{medicine.price}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleMedicineOrder(medicine)}
                  className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  অর্ডার করুন
                </button>
              </div>
            </div>
          ))}
          
          {/* ডাক্তারের তালিকা (যদি থাকে) */}
          {doctors.length > 0 && (
            <div className="mt-4">
              <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                <Stethoscope className="h-5 w-5 mr-2 text-green-600" />
                প্রস্তাবিত বিশেষজ্ঞ ডাক্তার:
              </h5>
              {doctors.map((doctor: Doctor) => (
                <div key={doctor.id} className="border rounded-lg p-4 bg-green-50 mt-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-green-800">{doctor.name}</h4>
                      <p className="text-sm text-gray-600">{doctor.specialty}</p>
                      <div className="flex items-center mt-1">
                        <Stethoscope className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-sm text-gray-600">{doctor.experience} বছর অভিজ্ঞতা</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm text-gray-600">{doctor.rating}/5</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-sm text-gray-600">{doctor.location}</span>
                      </div>
                      <div className="flex items-center mt-2">
                        <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                        <span className="font-semibold text-green-600">৳{doctor.fee}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDoctorAppointment(doctor)}
                      className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      অ্যাপয়েন্টমেন্ট
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // ডাক্তারের তথ্য সহ মেসেজ রেন্ডার - কার্ড ভিউতে ডাক্তারের বিস্তারিত তথ্য
    if (message.type === 'doctor' && message.data) {
      return (
        <div className="space-y-3">
          <p className="text-gray-700 mb-3">{message.text}</p>
          {message.data.map((doctor: Doctor) => (
            <div key={doctor.id} className="border rounded-lg p-4 bg-green-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-green-800">{doctor.name}</h4>
                  <p className="text-sm text-gray-600">{doctor.specialty}</p>
                  <div className="flex items-center mt-1">
                    <Stethoscope className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-600">{doctor.experience} বছর অভিজ্ঞতা</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm text-gray-600">{doctor.rating}/5</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-600">{doctor.location}</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                    <span className="font-semibold text-green-600">৳{doctor.fee}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDoctorAppointment(doctor)}
                  className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  অ্যাপয়েন্টমেন্ট
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // সাধারণ টেক্সট মেসেজ রেন্ডার
    return <p className="text-gray-700">{message.text}</p>;
  };

  // ওষুধ অর্ডার ভিউ - সম্পূর্ণ ওষুধ অর্ডার সিস্টেম প্রদর্শন
  if (currentView === 'medicine') {
    return (
      <div className="h-full">
        {/* ওষুধ অর্ডার সিস্টেমের হেডার */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Pill className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-800">ওষুধ অর্ডার সিস্টেম</h1>
                <p className="text-sm text-gray-600">আপনার প্রয়োজনীয় ওষুধ অর্ডার করুন</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('chat')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              চ্যাটে ফিরে যান
            </button>
          </div>
        </div>
        {/* ওষুধ অর্ডার সিস্টেম কম্পোনেন্ট */}
        <MedicineOrderSystem 
          onOrderConfirm={handleOrderConfirmation}
        />
      </div>
    );
  }

  // ডাক্তার অ্যাপয়েন্টমেন্ট ভিউ - সম্পূর্ণ ডাক্তার অ্যাপয়েন্টমেন্ট সিস্টেম প্রদর্শন
  if (currentView === 'doctor') {
    return (
      <div className="h-full">
        {/* ডাক্তার অ্যাপয়েন্টমেন্ট সিস্টেমের হেডার */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-800">ডাক্তার অ্যাপয়েন্টমেন্ট</h1>
                <p className="text-sm text-gray-600">বিশেষজ্ঞ ডাক্তারদের সাথে অ্যাপয়েন্টমেন্ট নিন</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('chat')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              চ্যাটে ফিরে যান
            </button>
          </div>
        </div>
        {/* ডাক্তার অ্যাপয়েন্টমেন্ট সিস্টেম কম্পোনেন্ট */}
        <DoctorAppointmentSystem 
          onAppointmentConfirm={handleAppointmentConfirmation}
        />
      </div>
    );
  }

  // মূল চ্যাট ইন্টারফেস রেন্ডার - ডা. মিমুর প্রধান UI
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* চ্যাট হেডার - AI স্বাস্থ্য সহায়ক ব্র্যান্ডিং ও নেভিগেশন */}
      <div className="bg-white shadow-sm border-b px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-medical-primary to-medical-secondary rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg lg:text-xl font-semibold text-gray-800 truncate">ডা. মিমুর সাথে কথা বলুন</h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate hidden sm:block">আপনার স্বাস্থ্য সমস্যা নিয়ে আলোচনা করুন এবং তাৎক্ষণিক পরামর্শ পান</p>
            </div>
          </div>
          
          {/* ডেস্কটপ অ্যাকশন বাটন */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 flex-shrink-0">
            <button
              onClick={() => setShowPrescriptionUpload(true)}
              className="bg-green-600 text-white px-2 py-1.5 xl:px-3 xl:py-2 rounded-lg hover:bg-green-700 flex items-center text-xs xl:text-sm transition-colors touch-target"
            >
              <Upload className="h-3 w-3 xl:h-4 xl:w-4 mr-1 xl:mr-2" />
              <span className="hidden xl:inline">প্রেসক্রিপশন আপলোড</span>
              <span className="xl:hidden">প্রেসক্রিপশন</span>
            </button>
            <button
              onClick={() => setShowMedicineOrder(true)}
              className="bg-blue-600 text-white px-2 py-1.5 xl:px-3 xl:py-2 rounded-lg hover:bg-blue-700 flex items-center text-xs xl:text-sm transition-colors touch-target"
            >
              <Pill className="h-3 w-3 xl:h-4 xl:w-4 mr-1 xl:mr-2" />
              <span className="hidden xl:inline">ওষুধ অর্ডার</span>
              <span className="xl:hidden">ওষুধ</span>
            </button>
            <button
              onClick={() => setShowDoctorAppointment(true)}
              className="bg-purple-600 text-white px-2 py-1.5 xl:px-3 xl:py-2 rounded-lg hover:bg-purple-700 flex items-center text-xs xl:text-sm transition-colors touch-target"
            >
              <Calendar className="h-3 w-3 xl:h-4 xl:w-4 mr-1 xl:mr-2" />
              <span className="hidden xl:inline">অ্যাপয়েন্টমেন্ট</span>
              <span className="xl:hidden">অ্যাপয়েন্টমেন্ট</span>
            </button>
            <button
              onClick={() => handleSendMessage('জরুরি যোগাযোগের তথ্য দিন')}
              className="bg-red-600 text-white px-2 py-1.5 xl:px-3 xl:py-2 rounded-lg hover:bg-red-700 flex items-center text-xs xl:text-sm transition-colors touch-target"
            >
              <Phone className="h-3 w-3 xl:h-4 xl:w-4 mr-1 xl:mr-2" />
              জরুরি
            </button>
          </div>
          
          {/* মোবাইল মেনু বাটন */}
          <div className="lg:hidden flex-shrink-0">
            <button
              onClick={() => setShowQuickServices(!showQuickServices)}
              className="bg-medical-primary text-white p-1.5 sm:p-2 rounded-lg hover:bg-medical-secondary transition-colors touch-target"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* মোবাইল কুইক সার্ভিস মেনু */}
        {showQuickServices && (
          <div className="lg:hidden mt-3 sm:mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setShowPrescriptionUpload(true);
                setShowQuickServices(false);
              }}
              className="bg-green-600 text-white px-2 py-2 sm:px-3 sm:py-2 rounded-lg hover:bg-green-700 flex items-center text-xs sm:text-sm transition-colors touch-target"
            >
              <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              প্রেসক্রিপশন
            </button>
            <button
              onClick={() => {
                setShowMedicineOrder(true);
                setShowQuickServices(false);
              }}
              className="bg-blue-600 text-white px-2 py-2 sm:px-3 sm:py-2 rounded-lg hover:bg-blue-700 flex items-center text-xs sm:text-sm transition-colors touch-target"
            >
              <Pill className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              ওষুধ অর্ডার
            </button>
            <button
              onClick={() => {
                setShowDoctorAppointment(true);
                setShowQuickServices(false);
              }}
              className="bg-purple-600 text-white px-2 py-2 sm:px-3 sm:py-2 rounded-lg hover:bg-purple-700 flex items-center text-xs sm:text-sm transition-colors touch-target"
            >
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              অ্যাপয়েন্টমেন্ট
            </button>
            <button
              onClick={() => {
                handleSendMessage('জরুরি যোগাযোগের তথ্য দিন');
                setShowQuickServices(false);
              }}
              className="bg-red-600 text-white px-2 py-2 sm:px-3 sm:py-2 rounded-lg hover:bg-red-700 flex items-center text-xs sm:text-sm transition-colors touch-target"
            >
              <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              জরুরি
            </button>
          </div>
        )}
      </div>

      {/* মেসেজ এরিয়া - চ্যাট কনভার্সেশন প্রদর্শন - Mobile Optimized */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4
                      h-full max-h-[calc(100vh-180px)] sm:max-h-[calc(100vh-200px)] lg:max-h-[calc(100vh-220px)]
                      pb-20 sm:pb-24 lg:pb-6 scroll-smooth main-content-scroll
                      touch-pan-y overscroll-contain
                      -webkit-overflow-scrolling-touch
                      will-change-scroll-position">
        
        {/* স্বাগত বার্তা এবং নিরাপত্তা নোটিস */}
        {messages.length === 1 && (
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-3 sm:mb-4">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-neutral-900 mb-2">ডা. মিমুর সাথে কথা বলুন</h2>
            <p className="text-sm sm:text-base text-neutral-600 mb-3 sm:mb-4 px-4">আপনার স্বাস্থ্য সমস্যা নিয়ে আলোচনা করুন এবং তাৎক্ষণিক পরামর্শ পান</p>
            
            {/* নিরাপত্তা ও প্রাইভেসি নোটিস */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 text-left max-w-sm sm:max-w-md mx-auto">
              <div className="flex items-start">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-green-800 mb-1">নিরাপত্তা ও গোপনীয়তা</h3>
                  <p className="text-xs text-green-700 leading-relaxed">
                    🔒 আপনার সকল তথ্য এনক্রিপ্ট করা এবং সুরক্ষিত<br/>
                    🏥 শুধুমাত্র চিকিৎসা পরামর্শের জন্য ব্যবহৃত<br/>
                    🔐 তৃতীয় পক্ষের সাথে শেয়ার করা হয় না
                  </p>
                </div>
              </div>
            </div>
            
            {/* কুইক অ্যাকশন বাটন */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-2xl mx-auto px-2 sm:px-0">
              <button
                onClick={() => setShowPrescriptionUpload(true)}
                className="bg-green-100 hover:bg-green-200 text-green-800 p-2 sm:p-3 rounded-lg transition-colors text-xs sm:text-sm font-medium flex flex-col items-center gap-1 sm:gap-2 touch-target min-h-[60px] sm:min-h-[80px]"
              >
                <Upload className="w-4 h-4 sm:w-6 sm:h-6" />
                <span className="text-center leading-tight">প্রেসক্রিপশন<br/>আপলোড</span>
              </button>
              <button
                onClick={() => setShowMedicineOrder(true)}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-2 sm:p-3 rounded-lg transition-colors text-xs sm:text-sm font-medium flex flex-col items-center gap-1 sm:gap-2 touch-target min-h-[60px] sm:min-h-[80px]"
              >
                <Pill className="w-4 h-4 sm:w-6 sm:h-6" />
                <span className="text-center leading-tight">ওষুধ<br/>অর্ডার</span>
              </button>
              <button
                onClick={() => setShowDoctorAppointment(true)}
                className="bg-purple-100 hover:bg-purple-200 text-purple-800 p-2 sm:p-3 rounded-lg transition-colors text-xs sm:text-sm font-medium flex flex-col items-center gap-1 sm:gap-2 touch-target min-h-[60px] sm:min-h-[80px]"
              >
                <Calendar className="w-4 h-4 sm:w-6 sm:h-6" />
                <span className="text-center leading-tight">ডাক্তার<br/>অ্যাপয়েন্টমেন্ট</span>
              </button>
              <button
                onClick={() => handleSendMessage('জরুরি যোগাযোগের তথ্য দিন')}
                className="bg-red-100 hover:bg-red-200 text-red-800 p-2 sm:p-3 rounded-lg transition-colors text-xs sm:text-sm font-medium flex flex-col items-center gap-1 sm:gap-2 touch-target min-h-[60px] sm:min-h-[80px]"
              >
                <Phone className="w-4 h-4 sm:w-6 sm:h-6" />
                <span className="text-center leading-tight">জরুরি<br/>যোগাযোগ</span>
              </button>
            </div>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4`}
          >
            {/* মেসেজ বাবল - ইউজার ও বটের জন্য আলাদা স্টাইল */}
            <div
              className={`max-w-[280px] sm:max-w-md lg:max-w-2xl xl:max-w-3xl rounded-lg px-3 py-2 sm:px-4 sm:py-3 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border shadow-sm'
              }`}
            >
              <div className="flex items-start">
                {/* বট আইকন */}
                {message.sender === 'bot' && (
                  <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-1 sm:mr-2 mt-0.5 flex-shrink-0" />
                )}
        
        {/* অর্ডার কনফার্মেশন মোডাল - সফল অর্ডার/অ্যাপয়েন্টমেন্টের পর দেখানো হয় */}
        {showConfirmation && (
          <OrderConfirmationSystem
            orderId={confirmationData.orderId}
            appointmentId={confirmationData.appointmentId}
            onClose={closeConfirmation}
          />
        )}
      
      {/* অর্ডার কনফার্মেশন মোডাল - সফল অর্ডার/অ্যাপয়েন্টমেন্টের পর দেখানো হয় */}
      {showConfirmation && (
        <OrderConfirmationSystem
          orderId={confirmationData.orderId}
          appointmentId={confirmationData.appointmentId}
          onClose={closeConfirmation}
        />
      )}
      
      {/* ওষুধ অর্ডার মোডাল */}
      {showMedicineOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b">
              <h2 className="text-lg sm:text-xl font-semibold">ওষুধ অর্ডার সিস্টেম</h2>
              <button
                onClick={() => setShowMedicineOrder(false)}
                className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl touch-target p-1"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(95vh-60px)] sm:max-h-[calc(90vh-80px)]">
              <MedicineOrderSystem onOrderConfirm={handleOrderConfirmation} />
            </div>
          </div>
        </div>
      )}
      
      {/* ডাক্তার অ্যাপয়েন্টমেন্ট মোডাল */}
      {showDoctorAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b">
              <h2 className="text-lg sm:text-xl font-semibold">ডাক্তার অ্যাপয়েন্টমেন্ট</h2>
              <button
                onClick={() => setShowDoctorAppointment(false)}
                className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl touch-target p-1"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(95vh-60px)] sm:max-h-[calc(90vh-80px)]">
              <DoctorAppointmentSystem onAppointmentConfirm={handleAppointmentConfirmation} />
            </div>
          </div>
        </div>
      )}
      
      {/* প্রেসক্রিপশন আপলোড মোডাল */}
      {showPrescriptionUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b">
              <h2 className="text-lg sm:text-xl font-semibold">প্রেসক্রিপশন আপলোড</h2>
              <button
                onClick={() => setShowPrescriptionUpload(false)}
                className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl touch-target p-1"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(95vh-60px)] sm:max-h-[calc(90vh-80px)]">
              <PrescriptionUpload
                language="bn"
                onScheduleCreated={() => {}}
                onClose={() => setShowPrescriptionUpload(false)}
                onMedicalDataExtracted={handlePrescriptionUpload}
                userId="user123"
              />
            </div>
          </div>
        </div>
      )}
                {/* ইউজার আইকন */}
                {message.sender === 'user' && (
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-white mr-1 sm:mr-2 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  {/* মেসেজ কন্টেন্ট রেন্ডার */}
                  {renderMessage(message)}
                  {/* টাইমস্ট্যাম্প - বাংলা ফরম্যাটে */}
                  <p className="text-xs opacity-70 mt-1 sm:mt-2 leading-tight">
                    {message.timestamp.toLocaleTimeString('bn-BD')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* লোডিং ইন্ডিকেটর - AI প্রসেসিং এর সময় দেখানো হয় */}
        {isLoading && (
          <div className="flex justify-start mb-3 sm:mb-4">
            <div className="bg-white border shadow-sm rounded-lg px-3 py-2 sm:px-4 sm:py-3 max-w-[200px] sm:max-w-xs">
              <div className="flex items-center">
                <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-1 sm:mr-2" />
                {/* অ্যানিমেটেড ডট - টাইপিং ইফেক্ট */}
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* অটো স্ক্রল রেফারেন্স */}
        <div ref={messagesEndRef} />
      </div>

      {/* চ্যাট ইনপুট কম্পোনেন্ট - রেস্পন্সিভ ডিজাইন ও SMS ফিচার সহ */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileUpload}
        onVoiceInput={handleVoiceInput}
        onSmsShare={handleSmsShare}
        placeholder="আপনার স্বাস্থ্য সমস্যা লিখুন... (যেমন: 'মাথাব্যথা', 'জ্বর', 'ওষুধ' বা 'ডাক্তার')"
        disabled={isLoading}
        isLoading={isLoading}
        showFileUpload={true}
        showVoiceInput={true}
        showSmsShare={false}
        maxLength={1000}
        quickActions={[
          {
            label: '🤒 জ্বর হয়েছে',
            value: 'আমার জ্বর হয়েছে, কী করবো?',
            icon: <Activity className="w-4 h-4" />
          },
          {
            label: '🤕 মাথাব্যথা',
            value: 'মাথাব্যথার জন্য কোন ওষুধ খাবো?',
            icon: <Heart className="w-4 h-4" />
          },
          {
            label: '🩺 ডায়াবেটিস',
            value: 'ডায়াবেটিস নিয়ন্ত্রণের উপায় জানতে চাই',
            icon: <Stethoscope className="w-4 h-4" />
          },
          {
            label: '💓 উচ্চ রক্তচাপ',
            value: 'উচ্চ রক্তচাপের লক্ষণ কী?',
            icon: <Heart className="w-4 h-4" />
          },
          {
            label: '👶 শিশুর টিকা',
            value: 'শিশুর টিকার সময়সূচী জানতে চাই',
            icon: <Baby className="w-4 h-4" />
          },
          {
            label: '🤰 গর্ভাবস্থা',
            value: 'গর্ভাবস্থায় সতর্কতা সম্পর্কে জানান',
            icon: <Heart className="w-4 h-4" />
          },
          {
            label: '💗 হার্টের সমস্যা',
            value: 'হার্টের সমস্যার লক্ষণ কী?',
            icon: <Heart className="w-4 h-4" />
          },
          {
            label: '🫘 কিডনি সুস্থতা',
            value: 'কিডনি সুস্থ রাখার উপায় জানান',
            icon: <Shield className="w-4 h-4" />
          },
          {
            label: '💊 ওষুধ অর্ডার',
            value: 'আমি ওষুধ অর্ডার করতে চাই',
            icon: <Pill className="w-4 h-4" />
          },
          {
            label: '📅 অ্যাপয়েন্টমেন্ট',
            value: 'ডাক্তারের অ্যাপয়েন্টমেন্ট নিতে চাই',
            icon: <Calendar className="w-4 h-4" />
          },
          {
            label: '🏥 হাসপাতাল খুঁজুন',
            value: 'আমার কাছাকাছি হাসপাতাল খুঁজে দিন',
            icon: <MapPin className="w-4 h-4" />
          },
          {
            label: '📋 রিপোর্ট আপলোড',
            value: 'মেডিকেল রিপোর্ট আপলোড করতে চাই',
            icon: <FileText className="w-4 h-4" />
          }
        ]}
      />

      {/* SMS মোডাল - ডেস্কটপে ক্লিপবোর্ড ফেইল হলে দেখানো হয় */}
      {showSmsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">এসএমএস পাঠান</h3>
              <button
                onClick={() => setShowSmsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              নিচের টেক্সটটি কপি করে আপনার এসএমএস অ্যাপে পেস্ট করুন:
            </p>
            <textarea
              value={inputText}
              readOnly
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={4}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowSmsModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => {
                    navigator.clipboard.writeText(inputText);
                    setShowSmsModal(false);
                    alert('টেক্সট কপি হয়েছে!');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                কপি করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// AI চ্যাট ইন্টারফেস কম্পোনেন্ট এক্সপোর্ট - ডা. মিমুর মূল চ্যাট সিস্টেম
export default AIChatInterface;
export type { AIChatInterfaceProps };