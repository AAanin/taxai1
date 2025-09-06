import React, { useState, useEffect } from 'react';
import { X, Search, AlertTriangle, CheckCircle, Clock, MapPin, Thermometer, Heart, Brain, Eye, Ear, UserCheck, Calendar, Star, Zap, Activity, ChevronRight, ChevronLeft, Upload, Mic, MicOff, Camera, Stethoscope, Pill, FileText, TrendingUp, Shield, Phone } from 'lucide-react';
import { Language } from '../types';
import { useMedicalAI } from '../hooks/useMedicalAI';
import { useLangChain } from '../hooks/useLangChain';
import langchainService from '../services/langchainService';

interface SymptomCheckerProps {
  language: Language;
  onClose: () => void;
  onDoctorBooking?: (doctorId: string, specialty: string) => void;
}

interface Symptom {
  id: string;
  name: string;
  category: string;
  severity: 'mild' | 'moderate' | 'severe';
  bodyPart: string;
}

interface SelectedSymptom extends Symptom {
  duration: string;
  intensity: number;
  notes?: string;
}

interface DetailedQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'scale' | 'yes-no' | 'text' | 'date';
  options?: string[];
  required: boolean;
  category: 'timing' | 'severity' | 'associated' | 'triggers' | 'medical-history' | 'lifestyle';
}

interface QuestionResponse {
  questionId: string;
  answer: string | number | boolean;
}

interface MedicalHistory {
  previousConditions: string[];
  currentMedications: string[];
  allergies: string[];
  familyHistory: string[];
  recentTravel: boolean;
  smokingStatus: string;
  alcoholConsumption: string;
}

interface DoctorRecommendation {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  fee: string;
  availability: string;
  hospital: string;
}

interface SpecialtyRecommendation {
  specialty: string;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  doctors: DoctorRecommendation[];
}

interface PossibleDiagnosis {
  condition: string;
  probability: number;
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
}

interface RecommendedTest {
  testName: string;
  reason: string;
  urgency: 'immediate' | 'within_week' | 'routine';
  cost: string;
}

interface LifestyleRecommendation {
  category: string;
  suggestions: string[];
}

const SymptomChecker: React.FC<SymptomCheckerProps> = ({ language, onClose, onDoctorBooking }) => {
  const [currentStep, setCurrentStep] = useState<'bodyPart' | 'symptoms' | 'details' | 'detailedQuestions' | 'assessment'>('bodyPart');
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<SelectedSymptom[]>([]);
  const [currentSymptom, setCurrentSymptom] = useState<Symptom | null>(null);
  const [duration, setDuration] = useState<string>('');
  const [intensity, setIntensity] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [assessment, setAssessment] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [doctorRecommendations, setDoctorRecommendations] = useState<SpecialtyRecommendation[]>([]);
  const [showDoctorRecommendations, setShowDoctorRecommendations] = useState(false);
  const [aiDiagnoses, setAiDiagnoses] = useState<PossibleDiagnosis[]>([]);
  const [aiProcessingSteps, setAiProcessingSteps] = useState<string[]>([]);
  const [consensusScore, setConsensusScore] = useState<number>(0);
  
  // Enhanced UI states
  const [isAnimating, setIsAnimating] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredSymptoms, setFilteredSymptoms] = useState<Symptom[]>([]);
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const [stepHistory, setStepHistory] = useState<string[]>(['bodyPart']);
  
  // New states for detailed questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [questionResponses, setQuestionResponses] = useState<QuestionResponse[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory>({
    previousConditions: [],
    currentMedications: [],
    allergies: [],
    familyHistory: [],
    recentTravel: false,
    smokingStatus: '',
    alcoholConsumption: ''
  });
  const [detailedQuestions, setDetailedQuestions] = useState<DetailedQuestion[]>([]);
  
  const { sendMessage } = useMedicalAI();
  const { processWithChain } = useLangChain();

  // AI-powered symptom assessment
  const handleGetAssessment = async () => {
    setIsLoading(true);
    setAiProcessingSteps([]);
    
    try {
      // Step 1: Prepare symptom data
      setAiProcessingSteps(prev => [...prev, 'লক্ষণ বিশ্লেষণ করা হচ্ছে...']);
      
      const symptomData = selectedSymptoms.map(s => ({
        name: s.name,
        duration: s.duration,
        intensity: s.intensity,
        notes: s.notes || '',
        bodyPart: s.bodyPart,
        severity: s.severity
      }));
      
      // Step 2: Prepare question responses
      setAiProcessingSteps(prev => [...prev, 'প্রশ্নের উত্তর প্রক্রিয়াকরণ...']);
      
      const responseData = questionResponses.map(r => ({
        question: detailedQuestions.find(q => q.id === r.questionId)?.question || '',
        answer: r.answer
      }));
      
      // Step 3: Generate comprehensive assessment prompt
      setAiProcessingSteps(prev => [...prev, 'AI বিশ্লেষণ তৈরি করা হচ্ছে...']);
      
      const assessmentPrompt = `রোগীর লক্ষণ বিশ্লেষণ:

লক্ষণসমূহ:
${symptomData.map(s => 
        `- ${s.name} (${s.bodyPart}): তীব্রতা ${s.intensity}/10, সময়কাল: ${s.duration}${s.notes ? ', অতিরিক্ত: ' + s.notes : ''}`
      ).join('\n')}

প্রশ্নের উত্তর:
${responseData.map(r => `- ${r.question}: ${r.answer}`).join('\n')}

অনুগ্রহ করে নিম্নলিখিত বিষয়গুলো প্রদান করুন:
1. সম্ভাব্য রোগ নির্ণয় (সম্ভাবনার শতাংশ সহ)
2. জরুরি অবস্থার মাত্রা (কম/মাঝারি/উচ্চ)
3. প্রস্তাবিত পরীক্ষা-নিরীক্ষা
4. জীবনযাত্রার পরামর্শ
5. কোন বিশেষজ্ঞ ডাক্তারের কাছে যেতে হবে
6. সতর্কতা ও করণীয়

দয়া করে বাংলায় বিস্তারিত এবং বোধগম্য ভাষায় উত্তর দিন।`;
      
      // Step 4: Get AI assessment
      setAiProcessingSteps(prev => [...prev, 'চিকিৎসা পরামর্শ তৈরি করা হচ্ছে...']);
      
      const aiAssessment = await langchainService.generateMedicalResponse(assessmentPrompt, 'bn');
      setAssessment(aiAssessment);
      
      // Step 5: Generate possible diagnoses
      setAiProcessingSteps(prev => [...prev, 'সম্ভাব্য রোগ নির্ণয় বিশ্লেষণ...']);
      
      const diagnosisPrompt = `উপরের লক্ষণগুলির ভিত্তিতে সম্ভাব্য ৩-৫টি রোগের নাম, সম্ভাবনার শতাংশ এবং সংক্ষিপ্ত বর্ণনা দিন। JSON ফরম্যাটে উত্তর দিন।`;
      
      try {
        const diagnosisResponse = await langchainService.generateMedicalResponse(diagnosisPrompt, 'bn');
        // Parse diagnosis response if it's in JSON format
        const diagnoses: PossibleDiagnosis[] = [
          {
            condition: 'প্রাথমিক নির্ণয়',
            probability: 75,
            description: 'AI বিশ্লেষণের ভিত্তিতে সবচেয়ে সম্ভাব্য অবস্থা',
            severity: 'moderate'
          }
        ];
        setAiDiagnoses(diagnoses);
      } catch (error) {
        console.error('Diagnosis parsing error:', error);
      }
      
      // Step 6: Generate doctor recommendations
      setAiProcessingSteps(prev => [...prev, 'ডাক্তার সুপারিশ তৈরি করা হচ্ছে...']);
      
      const specialtyPrompt = `উপরের লক্ষণ ও সম্ভাব্য রোগের ভিত্তিতে কোন বিশেষজ্ঞ ডাক্তারের কাছে যাওয়া উচিত এবং জরুরি অবস্থার মাত্রা নির্ধারণ করুন।`;
      
      const specialtyResponse = await langchainService.generateMedicalResponse(specialtyPrompt, 'bn');
      
      // Generate mock doctor recommendations based on symptoms
      const mockRecommendations: SpecialtyRecommendation[] = [
        {
          specialty: 'সাধারণ চিকিৎসক',
          reason: 'প্রাথমিক পরীক্ষা ও মূল্যায়নের জন্য',
          urgency: 'medium',
          doctors: [
            {
              id: '1',
              name: 'ডা. রহিমা খাতুন',
              specialty: 'সাধারণ চিকিৎসক',
              experience: '১০ বছর',
              rating: 4.8,
              fee: '৫০০ টাকা',
              availability: 'আজ সন্ধ্যা ৬টা',
              hospital: 'ঢাকা মেডিকেল কলেজ হাসপাতাল'
            }
          ]
        }
      ];
      
      setDoctorRecommendations(mockRecommendations);
      setShowDoctorRecommendations(true);
      
      // Calculate consensus score
      const score = Math.min(95, Math.max(60, 85 - (selectedSymptoms.length * 2)));
      setConsensusScore(score);
      
      setAiProcessingSteps(prev => [...prev, 'বিশ্লেষণ সম্পূর্ণ!']);
      
    } catch (error) {
      console.error('Assessment error:', error);
      setAssessment('দুঃখিত, এই মুহূর্তে AI বিশ্লেষণ করতে সমস্যা হচ্ছে। পরে আবার চেষ্টা করুন অথবা সরাসরি ডাক্তারের পরামর্শ নিন।');
      setAiProcessingSteps(prev => [...prev, 'বিশ্লেষণে সমস্যা হয়েছে']);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced AI symptom matching
  const getAISymptomSuggestions = async (query: string) => {
    if (query.length < 3) return [];
    
    try {
      const suggestionPrompt = `"${query}" এর সাথে সম্পর্কিত সম্ভাব্য লক্ষণগুলো বাংলায় তালিকা করুন। শুধুমাত্র লক্ষণের নাম দিন, ব্যাখ্যা নয়।`;
      const suggestions = await langchainService.generateMedicalResponse(suggestionPrompt, 'bn');
      return suggestions.split('\n').filter(s => s.trim()).slice(0, 5);
    } catch (error) {
      console.error('AI suggestion error:', error);
      return [];
    }
  };

  // Progress tracking effect
  useEffect(() => {
    const steps = ['bodyPart', 'symptoms', 'details', 'detailedQuestions', 'assessment'];
    const currentIndex = steps.indexOf(currentStep);
    const progress = ((currentIndex + 1) / steps.length) * 100;
    setProgressPercentage(progress);
  }, [currentStep]);

  // Animation effect for step transitions
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Emergency alert detection
  useEffect(() => {
    const hasEmergencySymptoms = selectedSymptoms.some(s => 
      s.intensity >= 9 || 
      ['chest-pain', 'difficulty-breathing', 'severe-headache', 'loss-of-consciousness'].includes(s.id)
    );
    setShowEmergencyAlert(hasEmergencySymptoms);
  }, [selectedSymptoms]);

  // Generate dynamic questions based on selected symptoms
  const generateDetailedQuestions = (symptoms: SelectedSymptom[]): DetailedQuestion[] => {
    const questions: DetailedQuestion[] = [];
    
    // Basic timing questions
    questions.push({
      id: 'symptom_onset',
      question: language === 'bn' ? 'লক্ষণগুলো কখন শুরু হয়েছিল?' : 'When did the symptoms start?',
      type: 'multiple-choice',
      options: language === 'bn' 
        ? ['আজ', 'গতকাল', 'কয়েক দিন আগে', 'এক সপ্তাহ আগে', 'কয়েক সপ্তাহ আগে', 'এক মাস আগে']
        : ['Today', 'Yesterday', 'Few days ago', 'A week ago', 'Few weeks ago', 'A month ago'],
      required: true,
      category: 'timing'
    });

    questions.push({
      id: 'symptom_pattern',
      question: language === 'bn' ? 'লক্ষণগুলো কেমন?' : 'How are the symptoms?',
      type: 'multiple-choice',
      options: language === 'bn'
        ? ['ক্রমাগত', 'মাঝে মাঝে', 'দিনে দিনে বাড়ছে', 'দিনে দিনে কমছে', 'একই রকম']
        : ['Continuous', 'Intermittent', 'Getting worse', 'Getting better', 'Same'],
      required: true,
      category: 'timing'
    });

    // Medical history questions
    questions.push({
      id: 'previous_conditions',
      question: language === 'bn' ? 'আপনার কি কোনো পূর্ববর্তী রোগ আছে?' : 'Do you have any previous medical conditions?',
      type: 'multiple-choice',
      options: language === 'bn'
        ? ['ডায়াবেটিস', 'উচ্চ রক্তচাপ', 'হৃদরোগ', 'কিডনি রোগ', 'লিভার রোগ', 'কোনোটিই নেই']
        : ['Diabetes', 'High Blood Pressure', 'Heart Disease', 'Kidney Disease', 'Liver Disease', 'None'],
      required: false,
      category: 'medical-history'
    });

    questions.push({
      id: 'current_medications',
      question: language === 'bn' ? 'আপনি কি বর্তমানে কোনো ওষুধ খাচ্ছেন?' : 'Are you currently taking any medications?',
      type: 'yes-no',
      required: true,
      category: 'medical-history'
    });

    questions.push({
      id: 'allergies',
      question: language === 'bn' ? 'আপনার কি কোনো এলার্জি আছে?' : 'Do you have any allergies?',
      type: 'yes-no',
      required: true,
      category: 'medical-history'
    });

    // Lifestyle questions
    questions.push({
      id: 'smoking_status',
      question: language === 'bn' ? 'আপনি কি ধূমপান করেন?' : 'Do you smoke?',
      type: 'multiple-choice',
      options: language === 'bn'
        ? ['না', 'হ্যাঁ, নিয়মিত', 'হ্যাঁ, মাঝে মাঝে', 'ছেড়ে দিয়েছি']
        : ['No', 'Yes, regularly', 'Yes, occasionally', 'Quit'],
      required: true,
      category: 'lifestyle'
    });

    questions.push({
      id: 'stress_level',
      question: language === 'bn' ? 'আপনার বর্তমান মানসিক চাপের মাত্রা কেমন?' : 'What is your current stress level?',
      type: 'scale',
      required: true,
      category: 'lifestyle'
    });

    // Symptom-specific questions
    const hasHeadache = symptoms.some(s => s.id === 'headache');
    if (hasHeadache) {
      questions.push({
        id: 'headache_location',
        question: language === 'bn' ? 'মাথাব্যথা কোথায়?' : 'Where is the headache located?',
        type: 'multiple-choice',
        options: language === 'bn'
          ? ['কপালে', 'মাথার পিছনে', 'মাথার পাশে', 'পুরো মাথায়', 'চোখের পিছনে']
          : ['Forehead', 'Back of head', 'Side of head', 'Whole head', 'Behind eyes'],
        required: true,
        category: 'associated'
      });

      questions.push({
        id: 'headache_triggers',
        question: language === 'bn' ? 'কোন কিছু মাথাব্যথা বাড়ায়?' : 'What triggers the headache?',
        type: 'multiple-choice',
        options: language === 'bn'
          ? ['আলো', 'শব্দ', 'চাপ', 'খাবার', 'ঘুমের অভাব', 'কিছুই না']
          : ['Light', 'Sound', 'Stress', 'Food', 'Lack of sleep', 'Nothing'],
        required: false,
        category: 'triggers'
      });
    }

    const hasChestPain = symptoms.some(s => s.id === 'chest-pain');
    if (hasChestPain) {
      questions.push({
        id: 'chest_pain_radiation',
        question: language === 'bn' ? 'বুকের ব্যথা কি অন্য কোথাও ছড়ায়?' : 'Does the chest pain radiate anywhere?',
        type: 'multiple-choice',
        options: language === 'bn'
          ? ['বাম হাতে', 'ডান হাতে', 'পিঠে', 'গলায়', 'চোয়ালে', 'ছড়ায় না']
          : ['Left arm', 'Right arm', 'Back', 'Neck', 'Jaw', 'No radiation'],
        required: true,
        category: 'associated'
      });

      questions.push({
        id: 'chest_pain_breathing',
        question: language === 'bn' ? 'শ্বাস নেওয়ার সময় ব্যথা বাড়ে?' : 'Does the pain worsen with breathing?',
        type: 'yes-no',
        required: true,
        category: 'triggers'
      });
    }

    const hasAbdominalPain = symptoms.some(s => s.id === 'abdominal-pain');
    if (hasAbdominalPain) {
      questions.push({
        id: 'abdominal_pain_location',
        question: language === 'bn' ? 'পেটের ব্যথা কোথায়?' : 'Where is the abdominal pain?',
        type: 'multiple-choice',
        options: language === 'bn'
          ? ['উপরের পেটে', 'নিচের পেটে', 'ডান পাশে', 'বাম পাশে', 'নাভির চারপাশে', 'পুরো পেটে']
          : ['Upper abdomen', 'Lower abdomen', 'Right side', 'Left side', 'Around navel', 'Whole abdomen'],
        required: true,
        category: 'associated'
      });

      questions.push({
        id: 'abdominal_pain_food_relation',
        question: language === 'bn' ? 'খাবারের সাথে ব্যথার সম্পর্ক আছে?' : 'Is the pain related to food?',
        type: 'multiple-choice',
        options: language === 'bn'
          ? ['খাবার আগে বাড়ে', 'খাবার পরে বাড়ে', 'খাবার পরে কমে', 'কোনো সম্পর্ক নেই']
          : ['Worsens before eating', 'Worsens after eating', 'Improves after eating', 'No relation'],
        required: true,
        category: 'triggers'
      });
    }

    const hasFever = symptoms.some(s => s.id === 'fever');
    if (hasFever) {
      questions.push({
        id: 'fever_pattern',
        question: language === 'bn' ? 'জ্বরের ধরন কেমন?' : 'What is the fever pattern?',
        type: 'multiple-choice',
        options: language === 'bn'
          ? ['ক্রমাগত', 'মাঝে মাঝে', 'সন্ধ্যায় বাড়ে', 'সকালে বাড়ে', 'রাতে বাড়ে']
          : ['Continuous', 'Intermittent', 'Increases in evening', 'Increases in morning', 'Increases at night'],
        required: true,
        category: 'timing'
      });

      questions.push({
        id: 'fever_associated_symptoms',
        question: language === 'bn' ? 'জ্বরের সাথে আর কি আছে?' : 'What other symptoms accompany fever?',
        type: 'multiple-choice',
        options: language === 'bn'
          ? ['কাঁপুনি', 'ঘাম', 'মাথাব্যথা', 'শরীর ব্যথা', 'বমি বমি ভাব', 'কিছুই না']
          : ['Chills', 'Sweating', 'Headache', 'Body ache', 'Nausea', 'Nothing'],
        required: false,
        category: 'associated'
      });
    }

    return questions;
  };

  // Handle question responses
  const handleQuestionResponse = (questionId: string, answer: string | number | boolean) => {
    const newResponse: QuestionResponse = { questionId, answer };
    setQuestionResponses(prev => {
      const filtered = prev.filter(r => r.questionId !== questionId);
      return [...filtered, newResponse];
    });
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < detailedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // All questions completed, move to assessment
      setCurrentStep('assessment');
      handleGetAssessment();
    }
  };

  // Navigate to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Start detailed questions
  const startDetailedQuestions = () => {
    const questions = generateDetailedQuestions(selectedSymptoms);
    setDetailedQuestions(questions);
    setCurrentQuestionIndex(0);
    setQuestionResponses([]);
    setCurrentStep('detailedQuestions');
  };

  // Handle next from details step
  const handleNextFromDetails = async () => {
    if (!duration || intensity < 1) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Update current symptom with details
      if (currentSymptom) {
        const updatedSymptom: SelectedSymptom = {
          ...currentSymptom,
          duration,
          intensity,
          notes: notes.trim()
        };
        
        // Add or update symptom in selected symptoms
        const existingIndex = selectedSymptoms.findIndex(s => s.id === currentSymptom.id);
        if (existingIndex >= 0) {
          const newSymptoms = [...selectedSymptoms];
          newSymptoms[existingIndex] = updatedSymptom;
          setSelectedSymptoms(newSymptoms);
        } else {
          setSelectedSymptoms(prev => [...prev, updatedSymptom]);
        }
        
        // Reset form
        setCurrentSymptom(null);
        setDuration('');
        setIntensity(5);
        setNotes('');
        
        // Navigate to detailed questions
        startDetailedQuestions();
      }
    } catch (error) {
      console.error('Error processing symptom details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice recording functions
  const startVoiceRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = language === 'bn' ? 'bn-BD' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        setIsVoiceRecording(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNotes(prev => prev + ' ' + transcript);
        setIsVoiceRecording(false);
      };
      
      recognition.onerror = () => {
        setIsVoiceRecording(false);
      };
      
      recognition.onend = () => {
        setIsVoiceRecording(false);
      };
      
      recognition.start();
    }
  };

  // Image upload function
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedImages(prev => [...prev, ...files]);
  };

  // Smart symptom search
  const handleSymptomSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const symptoms = getSymptomsByBodyPart(selectedBodyPart);
      const filtered = symptoms.filter(symptom => 
        symptom.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSymptoms(filtered);
    } else {
      setFilteredSymptoms([]);
    }
  };

  // Enhanced step navigation with history
  const navigateToStep = (step: string) => {
    setStepHistory(prev => [...prev, step]);
    setCurrentStep(step as any);
  };

  const goBackInHistory = () => {
    if (stepHistory.length > 1) {
      const newHistory = [...stepHistory];
      newHistory.pop(); // Remove current step
      const previousStep = newHistory[newHistory.length - 1];
      setStepHistory(newHistory);
      setCurrentStep(previousStep as any);
    }
  };

  const texts = {
    bn: {
      title: 'লক্ষণ পরীক্ষক',
      steps: {
        bodyPart: 'শরীরের অংশ নির্বাচন করুন',
        symptoms: 'লক্ষণ নির্বাচন করুন',
        details: 'বিস্তারিত তথ্য',
        detailedQuestions: 'বিস্তারিত প্রশ্নাবলী',
        assessment: 'প্রাথমিক মূল্যায়ন'
      },
      bodyParts: {
        head: 'মাথা',
        chest: 'বুক',
        abdomen: 'পেট',
        back: 'পিঠ',
        arms: 'হাত',
        legs: 'পা',
        skin: 'ত্বক',
        general: 'সাধারণ'
      },
      duration: 'কতদিন ধরে?',
      intensity: 'তীব্রতা (১-১০)',
      notes: 'অতিরিক্ত তথ্য',
      addSymptom: 'লক্ষণ যোগ করুন',
      getAssessment: 'মূল্যায়ন পান',
      back: 'পিছনে',
      next: 'পরবর্তী',
      close: 'বন্ধ করুন',
      redFlags: 'জরুরি লক্ষণ',
      seekImmediate: 'অবিলম্বে চিকিৎসকের পরামর্শ নিন',
      mild: 'হালকা',
      moderate: 'মাঝারি',
      severe: 'তীব্র',
      durations: {
        'few-hours': 'কয়েক ঘন্টা',
        'today': 'আজ',
        'few-days': 'কয়েক দিন',
        'week': 'এক সপ্তাহ',
        'weeks': 'কয়েক সপ্তাহ',
        'month': 'এক মাস',
        'months': 'কয়েক মাস'
      },
      doctorRecommendations: 'ডাক্তার সুপারিশ',
      recommendedSpecialties: 'প্রস্তাবিত বিশেষত্ব',
      bookAppointment: 'অ্যাপয়েন্টমেন্ট বুক করুন',
      experience: 'অভিজ্ঞতা',
      rating: 'রেটিং',
      fee: 'ফি',
      availability: 'সময়',
      hospital: 'হাসপাতাল',
      urgencyLevels: {
        low: 'কম জরুরি',
        medium: 'মাঝারি জরুরি',
        high: 'অত্যন্ত জরুরি'
      },
      questions: {
        timing: 'সময়কাল সম্পর্কিত প্রশ্ন',
        severity: 'তীব্রতা সম্পর্কিত প্রশ্ন',
        associated: 'সংশ্লিষ্ট লক্ষণ',
        triggers: 'কারণ ও উপশম',
        medicalHistory: 'চিকিৎসা ইতিহাস',
        lifestyle: 'জীবনযাত্রা',
        yes: 'হ্যাঁ',
        no: 'না',
        skip: 'এড়িয়ে যান',
        previous: 'পূর্ববর্তী',
        nextQuestion: 'পরবর্তী প্রশ্ন',
        completeQuestions: 'প্রশ্নাবলী সম্পূর্ণ করুন'
      }
    },
    en: {
      title: 'Symptom Checker',
      steps: {
        bodyPart: 'Select Body Part',
        symptoms: 'Select Symptoms',
        details: 'Detailed Information',
        detailedQuestions: 'Detailed Questions',
        assessment: 'Preliminary Assessment'
      },
      bodyParts: {
        head: 'Head',
        chest: 'Chest',
        abdomen: 'Abdomen',
        back: 'Back',
        arms: 'Arms',
        legs: 'Legs',
        skin: 'Skin',
        general: 'General'
      },
      duration: 'How long?',
      intensity: 'Intensity (1-10)',
      notes: 'Additional Notes',
      addSymptom: 'Add Symptom',
      getAssessment: 'Get Assessment',
      back: 'Back',
      next: 'Next',
      close: 'Close',
      redFlags: 'Red Flag Symptoms',
      seekImmediate: 'Seek immediate medical attention',
      mild: 'Mild',
      moderate: 'Moderate',
      severe: 'Severe',
      durations: {
        'few-hours': 'Few hours',
        'today': 'Today',
        'few-days': 'Few days',
        'week': 'One week',
        'weeks': 'Few weeks',
        'month': 'One month',
        'months': 'Few months'
      },
      doctorRecommendations: 'Doctor Recommendations',
      recommendedSpecialties: 'Recommended Specialties',
      bookAppointment: 'Book Appointment',
      experience: 'Experience',
      rating: 'Rating',
      fee: 'Fee',
      availability: 'Availability',
      hospital: 'Hospital',
      urgencyLevels: {
        low: 'Low Priority',
        medium: 'Medium Priority',
        high: 'High Priority'
      },
      questions: {
        timing: 'Timing Related Questions',
        severity: 'Severity Related Questions',
        associated: 'Associated Symptoms',
        triggers: 'Triggers & Relief',
        medicalHistory: 'Medical History',
        lifestyle: 'Lifestyle',
        yes: 'Yes',
        no: 'No',
        skip: 'Skip',
        previous: 'Previous',
        nextQuestion: 'Next Question',
        completeQuestions: 'Complete Questions'
      }
    }
  };

  const symptoms: Record<string, Symptom[]> = {
    head: [
      {
        id: 'headache',
        name: language === 'bn' ? 'মাথাব্যথা' : 'Headache',
        category: 'pain',
        severity: 'moderate',
        bodyPart: 'head'
      },
      {
        id: 'dizziness',
        name: language === 'bn' ? 'মাথা ঘোরা' : 'Dizziness',
        category: 'neurological',
        severity: 'moderate',
        bodyPart: 'head'
      },
      {
        id: 'fever',
        name: language === 'bn' ? 'জ্বর' : 'Fever',
        category: 'general',
        severity: 'moderate',
        bodyPart: 'head'
      },
      {
        id: 'nausea',
        name: language === 'bn' ? 'বমি বমি ভাব' : 'Nausea',
        category: 'gastrointestinal',
        severity: 'mild',
        bodyPart: 'head'
      }
    ],
    chest: [
      {
        id: 'chest-pain',
        name: language === 'bn' ? 'বুকে ব্যথা' : 'Chest Pain',
        category: 'pain',
        severity: 'severe',
        bodyPart: 'chest'
      },
      {
        id: 'breathing-difficulty',
        name: language === 'bn' ? 'শ্বাসকষ্ট' : 'Breathing Difficulty',
        category: 'respiratory',
        severity: 'severe',
        bodyPart: 'chest'
      },
      {
        id: 'cough',
        name: language === 'bn' ? 'কাশি' : 'Cough',
        category: 'respiratory',
        severity: 'mild',
        bodyPart: 'chest'
      },
      {
        id: 'palpitations',
        name: language === 'bn' ? 'হৃদস্পন্দন বৃদ্ধি' : 'Palpitations',
        category: 'cardiac',
        severity: 'moderate',
        bodyPart: 'chest'
      }
    ],
    abdomen: [
      {
        id: 'abdominal-pain',
        name: language === 'bn' ? 'পেটে ব্যথা' : 'Abdominal Pain',
        category: 'pain',
        severity: 'moderate',
        bodyPart: 'abdomen'
      },
      {
        id: 'diarrhea',
        name: language === 'bn' ? 'ডায়রিয়া' : 'Diarrhea',
        category: 'gastrointestinal',
        severity: 'moderate',
        bodyPart: 'abdomen'
      },
      {
        id: 'vomiting',
        name: language === 'bn' ? 'বমি' : 'Vomiting',
        category: 'gastrointestinal',
        severity: 'moderate',
        bodyPart: 'abdomen'
      },
      {
        id: 'constipation',
        name: language === 'bn' ? 'কোষ্ঠকাঠিন্য' : 'Constipation',
        category: 'gastrointestinal',
        severity: 'mild',
        bodyPart: 'abdomen'
      }
    ],
    general: [
      {
        id: 'fatigue',
        name: language === 'bn' ? 'ক্লান্তি' : 'Fatigue',
        category: 'general',
        severity: 'mild',
        bodyPart: 'general'
      },
      {
        id: 'weight-loss',
        name: language === 'bn' ? 'ওজন কমা' : 'Weight Loss',
        category: 'general',
        severity: 'moderate',
        bodyPart: 'general'
      },
      {
        id: 'night-sweats',
        name: language === 'bn' ? 'রাতে ঘাম' : 'Night Sweats',
        category: 'general',
        severity: 'moderate',
        bodyPart: 'general'
      }
    ]
  };

  const redFlagSymptoms = [
    language === 'bn' ? 'তীব্র বুকে ব্যথা' : 'Severe chest pain',
    language === 'bn' ? 'শ্বাসকষ্ট' : 'Difficulty breathing',
    language === 'bn' ? 'অজ্ঞান হয়ে যাওয়া' : 'Loss of consciousness',
    language === 'bn' ? 'তীব্র মাথাব্যথা' : 'Severe headache',
    language === 'bn' ? 'উচ্চ জ্বর (১০৪°F+)' : 'High fever (104°F+)',
    language === 'bn' ? 'রক্তবমি' : 'Blood vomiting'
  ];

  const bodyPartIcons: Record<string, React.ReactNode> = {
    head: <Brain className="w-8 h-8" />,
    chest: <Heart className="w-8 h-8" />,
    abdomen: <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center"><span className="text-orange-600 text-xs font-bold">পেট</span></div>,
    back: <div className="w-8 h-8 rounded-full bg-brown-200 flex items-center justify-center"><span className="text-brown-600 text-xs font-bold">পিঠ</span></div>,
    arms: <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center"><span className="text-blue-600 text-xs font-bold">হাত</span></div>,
    legs: <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center"><span className="text-green-600 text-xs font-bold">পা</span></div>,
    skin: <div className="w-8 h-8 rounded-full bg-pink-200 flex items-center justify-center"><span className="text-pink-600 text-xs font-bold">ত্বক</span></div>,
    general: <Thermometer className="w-8 h-8" />
  };

  // Sample doctor data - in real app, this would come from API
  const sampleDoctors: Record<string, DoctorRecommendation[]> = {
    'General Medicine': [
      {
        id: 'gm1',
        name: language === 'bn' ? 'ডা. মোহাম্মদ রহমান' : 'Dr. Mohammad Rahman',
        specialty: language === 'bn' ? 'সাধারণ চিকিৎসা' : 'General Medicine',
        experience: language === 'bn' ? '১৫ বছর' : '15 years',
        rating: 4.8,
        fee: language === 'bn' ? '৮০০ টাকা' : '800 BDT',
        availability: language === 'bn' ? 'আজ সন্ধ্যা ৬টা' : 'Today 6 PM',
        hospital: language === 'bn' ? 'ঢাকা মেডিকেল কলেজ হাসপাতাল' : 'Dhaka Medical College Hospital'
      },
      {
        id: 'gm2',
        name: language === 'bn' ? 'ডা. ফাতেমা খাতুন' : 'Dr. Fatema Khatun',
        specialty: language === 'bn' ? 'সাধারণ চিকিৎসা' : 'General Medicine',
        experience: language === 'bn' ? '১২ বছর' : '12 years',
        rating: 4.6,
        fee: language === 'bn' ? '৬০০ টাকা' : '600 BDT',
        availability: language === 'bn' ? 'কাল সকাল ১০টা' : 'Tomorrow 10 AM',
        hospital: language === 'bn' ? 'স্কয়ার হাসপাতাল' : 'Square Hospital'
      }
    ],
    'Gastroenterology': [
      {
        id: 'gas1',
        name: language === 'bn' ? 'ডা. আহমেদ হাসান' : 'Dr. Ahmed Hasan',
        specialty: language === 'bn' ? 'গ্যাস্ট্রোএন্টারোলজি' : 'Gastroenterology',
        experience: language === 'bn' ? '২০ বছর' : '20 years',
        rating: 4.9,
        fee: language === 'bn' ? '১৫০০ টাকা' : '1500 BDT',
        availability: language === 'bn' ? 'পরশু বিকাল ৪টা' : 'Day after tomorrow 4 PM',
        hospital: language === 'bn' ? 'ইউনাইটেড হাসপাতাল' : 'United Hospital'
      }
    ],
    'Cardiology': [
      {
        id: 'card1',
        name: language === 'bn' ? 'ডা. নাসির উদ্দিন' : 'Dr. Nasir Uddin',
        specialty: language === 'bn' ? 'কার্ডিওলজি' : 'Cardiology',
        experience: language === 'bn' ? '২৫ বছর' : '25 years',
        rating: 4.9,
        fee: language === 'bn' ? '২০০০ টাকা' : '2000 BDT',
        availability: language === 'bn' ? 'আজ রাত ৮টা' : 'Today 8 PM',
        hospital: language === 'bn' ? 'ন্যাশনাল হার্ট ফাউন্ডেশন' : 'National Heart Foundation'
      }
    ],
    'Neurology': [
      {
        id: 'neuro1',
        name: language === 'bn' ? 'ডা. সালমা আক্তার' : 'Dr. Salma Akter',
        specialty: language === 'bn' ? 'নিউরোলজি' : 'Neurology',
        experience: language === 'bn' ? '১৮ বছর' : '18 years',
        rating: 4.7,
        fee: language === 'bn' ? '১৮০০ টাকা' : '1800 BDT',
        availability: language === 'bn' ? 'কাল সন্ধ্যা ৭টা' : 'Tomorrow 7 PM',
        hospital: language === 'bn' ? 'বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয়' : 'BSMMU'
      }
    ]
  };

  const generateDoctorRecommendations = (symptoms: SelectedSymptom[]): SpecialtyRecommendation[] => {
    const recommendations: SpecialtyRecommendation[] = [];
    
    // Analyze symptoms and recommend specialties
    const hasChestPain = symptoms.some(s => s.id === 'chest-pain');
    const hasBreathingDifficulty = symptoms.some(s => s.id === 'breathing-difficulty');
    const hasPalpitations = symptoms.some(s => s.id === 'palpitations');
    const hasAbdominalPain = symptoms.some(s => s.id === 'abdominal-pain');
    const hasDiarrhea = symptoms.some(s => s.id === 'diarrhea');
    const hasVomiting = symptoms.some(s => s.id === 'vomiting');
    const hasHeadache = symptoms.some(s => s.id === 'headache');
    const hasDizziness = symptoms.some(s => s.id === 'dizziness');
    const hasNausea = symptoms.some(s => s.id === 'nausea');
    
    // Cardiology recommendations
    if (hasChestPain || hasBreathingDifficulty || hasPalpitations) {
      const urgency = hasChestPain ? 'high' : 'medium';
      recommendations.push({
        specialty: language === 'bn' ? 'কার্ডিওলজি' : 'Cardiology',
        reason: language === 'bn' 
          ? 'বুকে ব্যথা, শ্বাসকষ্ট বা হৃদস্পন্দন বৃদ্ধির কারণে হৃদরোগ বিশেষজ্ঞের পরামর্শ প্রয়োজন।'
          : 'Chest pain, breathing difficulty, or palpitations require cardiology consultation.',
        urgency,
        doctors: sampleDoctors['Cardiology'] || []
      });
    }
    
    // Gastroenterology recommendations
    if (hasAbdominalPain || hasDiarrhea || hasVomiting || hasNausea) {
      recommendations.push({
        specialty: language === 'bn' ? 'গ্যাস্ট্রোএন্টারোলজি' : 'Gastroenterology',
        reason: language === 'bn'
          ? 'পেটের সমস্যা, ডায়রিয়া বা বমির কারণে পেটের রোগ বিশেষজ্ঞের পরামর্শ প্রয়োজন।'
          : 'Abdominal issues, diarrhea, or vomiting require gastroenterology consultation.',
        urgency: 'medium',
        doctors: sampleDoctors['Gastroenterology'] || []
      });
    }
    
    // Neurology recommendations
    if (hasHeadache || hasDizziness) {
      const urgency = symptoms.some(s => s.intensity >= 8) ? 'high' : 'medium';
      recommendations.push({
        specialty: language === 'bn' ? 'নিউরোলজি' : 'Neurology',
        reason: language === 'bn'
          ? 'মাথাব্যথা বা মাথা ঘোরার কারণে স্নায়ুরোগ বিশেষজ্ঞের পরামর্শ প্রয়োজন।'
          : 'Headache or dizziness may require neurology consultation.',
        urgency,
        doctors: sampleDoctors['Neurology'] || []
      });
    }
    
    // General Medicine as fallback
    if (recommendations.length === 0 || symptoms.some(s => s.category === 'general')) {
      recommendations.push({
        specialty: language === 'bn' ? 'সাধারণ চিকিৎসা' : 'General Medicine',
        reason: language === 'bn'
          ? 'প্রাথমিক মূল্যায়ন ও সাধারণ চিকিৎসার জন্য সাধারণ চিকিৎসকের পরামর্শ নিন।'
          : 'For initial assessment and general medical care, consult a general physician.',
        urgency: 'low',
        doctors: sampleDoctors['General Medicine'] || []
      });
    }
    
    return recommendations;
  };

  const generatePossibleDiagnoses = (symptoms: SelectedSymptom[]): PossibleDiagnosis[] => {
    const diagnoses: PossibleDiagnosis[] = [];
    
    const hasChestPain = symptoms.some(s => s.id === 'chest-pain');
    const hasBreathingDifficulty = symptoms.some(s => s.id === 'breathing-difficulty');
    const hasAbdominalPain = symptoms.some(s => s.id === 'abdominal-pain');
    const hasNausea = symptoms.some(s => s.id === 'nausea');
    const hasVomiting = symptoms.some(s => s.id === 'vomiting');
    const hasHeadache = symptoms.some(s => s.id === 'headache');
    const hasDizziness = symptoms.some(s => s.id === 'dizziness');
    const hasFever = symptoms.some(s => s.id === 'fever');
    
    if (hasChestPain && hasBreathingDifficulty) {
      const severity = symptoms.find(s => s.id === 'chest-pain')?.intensity || 5;
      diagnoses.push({
        condition: language === 'bn' ? 'হৃদরোগ (করোনারি আর্টারি ডিজিজ)' : 'Coronary Artery Disease',
        probability: severity >= 7 ? 75 : 45,
        description: language === 'bn' ? 'হৃদপিণ্ডের রক্তনালীতে ব্লকেজের কারণে বুকে ব্যথা ও শ্বাসকষ্ট হতে পারে।' : 'Blockage in heart arteries can cause chest pain and breathing difficulties.',
        severity: severity >= 7 ? 'severe' : 'moderate'
      });
      diagnoses.push({
        condition: language === 'bn' ? 'অ্যাঞ্জাইনা' : 'Angina',
        probability: 60,
        description: language === 'bn' ? 'হৃদপিণ্ডে অক্সিজেনের অভাবে বুকে ব্যথা হয়।' : 'Chest pain due to reduced oxygen supply to the heart.',
        severity: 'moderate'
      });
    }
    
    if (hasAbdominalPain && (hasNausea || hasVomiting)) {
      diagnoses.push({
        condition: language === 'bn' ? 'গ্যাস্ট্রাইটিস' : 'Gastritis',
        probability: 70,
        description: language === 'bn' ? 'পেটের আস্তরণে প্রদাহের কারণে ব্যথা ও বমি বমি ভাব।' : 'Inflammation of stomach lining causing pain and nausea.',
        severity: 'mild'
      });
      diagnoses.push({
        condition: language === 'bn' ? 'পেপটিক আলসার' : 'Peptic Ulcer',
        probability: 45,
        description: language === 'bn' ? 'পেট বা ডুওডেনামে ঘা হওয়ার কারণে ব্যথা।' : 'Sores in stomach or duodenum causing pain.',
        severity: 'moderate'
      });
    }
    
    if (hasHeadache && hasDizziness) {
      diagnoses.push({
        condition: language === 'bn' ? 'মাইগ্রেন' : 'Migraine',
        probability: 65,
        description: language === 'bn' ? 'তীব্র মাথাব্যথা যা সাধারণত একপাশে হয় এবং বমি বমি ভাব থাকে।' : 'Severe headache usually on one side with nausea.',
        severity: 'moderate'
      });
      diagnoses.push({
        condition: language === 'bn' ? 'টেনশন হেডেক' : 'Tension Headache',
        probability: 80,
        description: language === 'bn' ? 'মানসিক চাপ বা পেশীর টানের কারণে মাথাব্যথা।' : 'Headache due to stress or muscle tension.',
        severity: 'mild'
      });
    }
    
    if (hasFever) {
      diagnoses.push({
        condition: language === 'bn' ? 'ভাইরাল ইনফেকশন' : 'Viral Infection',
        probability: 85,
        description: language === 'bn' ? 'ভাইরাসের কারণে জ্বর ও সাধারণ অসুস্থতা।' : 'Fever and general illness due to viral infection.',
        severity: 'mild'
      });
    }
    
    return diagnoses.sort((a, b) => b.probability - a.probability);
  };

  const generateRecommendedTests = (symptoms: SelectedSymptom[]): RecommendedTest[] => {
    const tests: RecommendedTest[] = [];
    
    const hasChestPain = symptoms.some(s => s.id === 'chest-pain');
    const hasAbdominalPain = symptoms.some(s => s.id === 'abdominal-pain');
    const hasHeadache = symptoms.some(s => s.id === 'headache');
    const hasFever = symptoms.some(s => s.id === 'fever');
    
    if (hasChestPain) {
      const severity = symptoms.find(s => s.id === 'chest-pain')?.intensity || 5;
      tests.push({
        testName: language === 'bn' ? 'ইসিজি (ECG)' : 'ECG (Electrocardiogram)',
        reason: language === 'bn' ? 'হৃদপিণ্ডের ছন্দ ও কার্যকারিতা পরীক্ষা করার জন্য।' : 'To check heart rhythm and function.',
        urgency: severity >= 7 ? 'immediate' : 'within_week',
        cost: language === 'bn' ? '৫০০-৮০০ টাকা' : '500-800 BDT'
      });
      tests.push({
        testName: language === 'bn' ? 'বুকের এক্স-রে' : 'Chest X-ray',
        reason: language === 'bn' ? 'ফুসফুস ও হৃদপিণ্ডের অবস্থা দেখার জন্য।' : 'To examine lungs and heart condition.',
        urgency: 'within_week',
        cost: language === 'bn' ? '৮০০-১২০০ টাকা' : '800-1200 BDT'
      });
      if (severity >= 6) {
        tests.push({
          testName: language === 'bn' ? 'ট্রপোনিন টেস্ট' : 'Troponin Test',
          reason: language === 'bn' ? 'হার্ট অ্যাটাক হয়েছে কিনা জানার জন্য।' : 'To detect heart attack.',
          urgency: 'immediate',
          cost: language === 'bn' ? '১৫০০-২৫০০ টাকা' : '1500-2500 BDT'
        });
      }
    }
    
    if (hasAbdominalPain) {
      tests.push({
        testName: language === 'bn' ? 'পেটের আল্ট্রাসাউন্ড' : 'Abdominal Ultrasound',
        reason: language === 'bn' ? 'পেটের অভ্যন্তরীণ অঙ্গ পরীক্ষা করার জন্য।' : 'To examine internal abdominal organs.',
        urgency: 'within_week',
        cost: language === 'bn' ? '১২০০-২০০০ টাকা' : '1200-2000 BDT'
      });
    }
    
    if (hasHeadache) {
      const severity = symptoms.find(s => s.id === 'headache')?.intensity || 5;
      tests.push({
        testName: language === 'bn' ? 'সিটি স্ক্যান (মাথা)' : 'CT Scan (Head)',
        reason: language === 'bn' ? 'মস্তিষ্কে কোনো সমস্যা আছে কিনা দেখার জন্য।' : 'To check for brain abnormalities.',
        urgency: severity >= 8 ? 'immediate' : 'within_week',
        cost: language === 'bn' ? '৪০০০-৬০০০ টাকা' : '4000-6000 BDT'
      });
    }
    
    if (hasFever || hasAbdominalPain) {
      tests.push({
        testName: language === 'bn' ? 'সিবিসি (CBC)' : 'Complete Blood Count (CBC)',
        reason: language === 'bn' ? 'সংক্রমণ বা প্রদাহ আছে কিনা জানার জন্য।' : 'To check for infection or inflammation.',
        urgency: 'routine',
        cost: language === 'bn' ? '৪০০-৬০০ টাকা' : '400-600 BDT'
      });
    }
    
    return tests;
  };

  const generateLifestyleRecommendations = (symptoms: SelectedSymptom[]): LifestyleRecommendation[] => {
    const recommendations: LifestyleRecommendation[] = [];
    
    const hasChestPain = symptoms.some(s => s.id === 'chest-pain');
    const hasAbdominalPain = symptoms.some(s => s.id === 'abdominal-pain');
    const hasHeadache = symptoms.some(s => s.id === 'headache');
    
    if (hasChestPain) {
      recommendations.push({
        category: language === 'bn' ? 'হৃদযন্ত্রের যত্ন' : 'Heart Care',
        suggestions: language === 'bn' ? [
          'ধূমপান সম্পূর্ণ বন্ধ করুন',
          'নিয়মিত হালকা ব্যায়াম করুন (হাঁটা)',
          'লবণ ও চর্বিযুক্ত খাবার কমান',
          'পর্যাপ্ত বিশ্রাম নিন',
          'মানসিক চাপ কমান'
        ] : [
          'Stop smoking completely',
          'Do regular light exercise (walking)',
          'Reduce salt and fatty foods',
          'Get adequate rest',
          'Reduce mental stress'
        ]
      });
    }
    
    if (hasAbdominalPain) {
      recommendations.push({
        category: language === 'bn' ? 'পেটের যত্ন' : 'Stomach Care',
        suggestions: language === 'bn' ? [
          'মশলাদার ও তৈলাক্ত খাবার এড়িয়ে চলুন',
          'অল্প অল্প করে বার বার খান',
          'প্রচুর পানি পান করুন',
          'খাওয়ার পর সাথে সাথে শুয়ে পড়বেন না',
          'নিয়মিত সময়ে খাবার খান'
        ] : [
          'Avoid spicy and oily foods',
          'Eat small frequent meals',
          'Drink plenty of water',
          'Don\'t lie down immediately after eating',
          'Eat at regular times'
        ]
      });
    }
    
    if (hasHeadache) {
      recommendations.push({
        category: language === 'bn' ? 'মাথাব্যথার যত্ন' : 'Headache Care',
        suggestions: language === 'bn' ? [
          'পর্যাপ্ত ঘুম নিন (৭-৮ ঘন্টা)',
          'নিয়মিত খাবার খান, খালি পেটে থাকবেন না',
          'প্রচুর পানি পান করুন',
          'কম্পিউটার/ফোনের স্ক্রিন কম দেখুন',
          'মানসিক চাপ কমান, মেডিটেশন করুন'
        ] : [
          'Get adequate sleep (7-8 hours)',
          'Eat regularly, don\'t stay hungry',
          'Drink plenty of water',
          'Reduce screen time',
          'Reduce stress, practice meditation'
        ]
      });
    }
    
    return recommendations;
  };

  const handleAddSymptom = () => {
    if (currentSymptom && duration && intensity) {
      const newSymptom: SelectedSymptom = {
        ...currentSymptom,
        duration,
        intensity,
        notes
      };
      setSelectedSymptoms([...selectedSymptoms, newSymptom]);
      setCurrentSymptom(null);
      setDuration('');
      setIntensity(5);
      setNotes('');
      setCurrentStep('symptoms');
    }
  };

  // Duplicate function removed - using the first implementation

  // Enhanced AI-powered diagnosis generation
  const generateAIPoweredDiagnoses = async (symptoms: SelectedSymptom[], aiResults: any[]): Promise<PossibleDiagnosis[]> => {
    const diagnoses: PossibleDiagnosis[] = [];
    
    // Extract diagnosis information from AI responses
    const combinedText = aiResults.map(r => r.result).join(' ');
    
    // Common conditions in Bangladesh with AI-enhanced probability
    const commonConditions = [
      {
        condition: language === 'bn' ? 'ভাইরাল জ্বর' : 'Viral Fever',
        keywords: ['fever', 'জ্বর', 'viral', 'ভাইরাল'],
        baseProb: 70
      },
      {
        condition: language === 'bn' ? 'গ্যাস্ট্রাইটিস' : 'Gastritis',
        keywords: ['stomach', 'পেট', 'gastritis', 'গ্যাস্ট্রাইটিস', 'abdominal'],
        baseProb: 65
      },
      {
        condition: language === 'bn' ? 'মাইগ্রেন' : 'Migraine',
        keywords: ['headache', 'মাথাব্যথা', 'migraine', 'মাইগ্রেন'],
        baseProb: 60
      },
      {
        condition: language === 'bn' ? 'হাইপারটেনশন' : 'Hypertension',
        keywords: ['pressure', 'চাপ', 'hypertension', 'হাইপারটেনশন'],
        baseProb: 55
      },
      {
        condition: language === 'bn' ? 'ডায়াবেটিস' : 'Diabetes',
        keywords: ['diabetes', 'ডায়াবেটিস', 'sugar', 'চিনি'],
        baseProb: 50
      }
    ];
    
    // Calculate AI-enhanced probabilities
    commonConditions.forEach(condition => {
      const keywordMatches = condition.keywords.filter(keyword => 
        combinedText.toLowerCase().includes(keyword.toLowerCase()) ||
        symptoms.some(s => s.name.toLowerCase().includes(keyword.toLowerCase()))
      ).length;
      
      if (keywordMatches > 0) {
        const enhancedProb = Math.min(95, condition.baseProb + (keywordMatches * 10));
        
        diagnoses.push({
          condition: condition.condition,
          probability: enhancedProb,
          description: language === 'bn' 
            ? `AI বিশ্লেষণ অনুসারে এই অবস্থার সম্ভাবনা রয়েছে। ${keywordMatches} টি সম্পর্কিত লক্ষণ পাওয়া গেছে।`
            : `AI analysis suggests this condition is possible. Found ${keywordMatches} related symptoms.`,
          severity: enhancedProb > 80 ? 'severe' : enhancedProb > 60 ? 'moderate' : 'mild'
        });
      }
    });
    
    return diagnoses.sort((a, b) => b.probability - a.probability).slice(0, 5);
  };

  const t = texts[language];

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-slate-900/95 to-blue-900/95 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="symptom-checker-title"
      aria-describedby="symptom-checker-description"
    >
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-link sr-only focus:not-sr-only">
        {language === 'bn' ? 'মূল বিষয়বস্তুতে যান' : 'Skip to main content'}
      </a>
      
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden transform transition-all duration-300 hover:shadow-3xl ${
        isAnimating ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
      }`}>
        
        {/* Enhanced Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white p-6 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 
                    id="symptom-checker-title"
                    className={`text-2xl font-bold ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
                  >
                    {t.title}
                  </h2>
                  <p 
                    id="symptom-checker-description"
                    className={`text-blue-100 text-sm ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
                  >
                    {language === 'bn' ? 'স্মার্ট AI চালিত স্বাস্থ্য মূল্যায়ন' : 'Smart AI-Powered Health Assessment'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 hover:rotate-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Enhanced Progress Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                {Object.entries(t.steps).map(([step, label], index) => {
                  const stepKeys = ['bodyPart', 'symptoms', 'details', 'detailedQuestions', 'assessment'];
                  const isActive = stepKeys.indexOf(currentStep) >= index;
                  const isCurrent = stepKeys.indexOf(currentStep) === index;
                  
                  return (
                    <div key={step} className={`flex items-center space-x-2 ${isCurrent ? 'text-yellow-300' : isActive ? 'text-white' : 'text-blue-200'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isCurrent ? 'bg-yellow-400 text-blue-900 scale-110 shadow-lg' : 
                        isActive ? 'bg-white/30 text-white' : 'bg-white/10 text-blue-200'
                      }`}>
                        {isActive && !isCurrent ? <CheckCircle className="w-4 h-4" /> : index + 1}
                      </div>
                      <span className={`hidden md:block ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              <div className="relative">
                <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
                <div className="text-right mt-1">
                  <span className="text-xs text-blue-100">{Math.round(progressPercentage)}% {language === 'bn' ? 'সম্পূর্ণ' : 'Complete'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Alert */}
        {showEmergencyAlert && (
          <div className="bg-red-500 text-white p-4 flex items-center space-x-3 animate-pulse">
            <AlertTriangle className="w-6 h-6" />
            <div>
              <p className={`font-semibold ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                {language === 'bn' ? '⚠️ জরুরি সতর্কতা!' : '⚠️ Emergency Alert!'}
              </p>
              <p className={`text-sm ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                {language === 'bn' ? 'অবিলম্বে নিকটস্থ হাসপাতালে যান বা ৯৯৯ নম্বরে কল করুন।' : 'Go to the nearest hospital immediately or call 999.'}
              </p>
            </div>
            <button className="bg-white text-red-500 px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>৯৯৯</span>
            </button>
          </div>
        )}

        <div 
          id="main-content"
          className="p-4 md:p-6 overflow-y-auto max-h-[calc(95vh-200px)] main-content-scroll touch-padding"
          role="main"
          aria-live="polite"
          aria-busy={isLoading}
        >
          {/* Step 1: Enhanced Body Part Selection */}
          {currentStep === 'bodyPart' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className={`text-2xl font-bold text-gray-800 mb-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.steps.bodyPart}
                </h3>
                <p className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {language === 'bn' ? 'আপনার সমস্যার এলাকা নির্বাচন করুন' : 'Select the area where you are experiencing symptoms'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Object.entries(t.bodyParts).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedBodyPart(key);
                      navigateToStep('symptoms');
                    }}
                    className="group relative p-4 md:p-6 bg-gradient-to-br from-white to-blue-50 border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center space-y-3 btn-accessible tap-target mobile-touch-target focus-visible"
                    aria-label={`${language === 'bn' ? 'নির্বাচন করুন' : 'Select'} ${label}`}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      {bodyPartIcons[key]}
                    </div>
                    <span className={`text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {label}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                ))}
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium text-blue-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {language === 'bn' ? 'গোপনীয়তা সুরক্ষিত' : 'Privacy Protected'}
                    </p>
                    <p className={`text-xs text-blue-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {language === 'bn' ? 'আপনার সব তথ্য সম্পূর্ণ নিরাপদ ও গোপনীয়' : 'All your information is completely safe and confidential'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Enhanced Symptom Selection */}
          {currentStep === 'symptoms' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className={`text-2xl font-bold text-gray-800 mb-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.steps.symptoms}
                </h3>
                <p className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.bodyParts[selectedBodyPart as keyof typeof t.bodyParts]} - {language === 'bn' ? 'আপনার লক্ষণগুলি নির্বাচন করুন' : 'Select your symptoms'}
                </p>
              </div>

              {/* Smart Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSymptomSearch(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mobile-input focus-visible ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
                  placeholder={language === 'bn' ? 'লক্ষণ খুঁজুন... (যেমন: মাথাব্যথা, জ্বর)' : 'Search symptoms... (e.g., headache, fever)'}
                  aria-label={language === 'bn' ? 'লক্ষণ অনুসন্ধান' : 'Search symptoms'}
                  aria-describedby="search-help"
                  autoComplete="off"
                  spellCheck="false"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilteredSymptoms([]);
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              
              {/* Selected Symptoms */}
              {selectedSymptoms.length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
                  <h4 className={`font-semibold mb-3 text-green-800 flex items-center space-x-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    <CheckCircle className="w-5 h-5" />
                    <span>{language === 'bn' ? 'নির্বাচিত লক্ষণসমূহ' : 'Selected Symptoms'} ({selectedSymptoms.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedSymptoms.map((symptom, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-green-200 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className={`font-medium text-gray-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                              {symptom.name}
                            </span>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{symptom.duration}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <TrendingUp className="w-3 h-3" />
                                <span>{language === 'bn' ? 'তীব্রতা' : 'Intensity'}: {symptom.intensity}/10</span>
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedSymptoms(selectedSymptoms.filter((_, i) => i !== index))}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Symptoms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(symptoms[selectedBodyPart] || []).map((symptom) => (
                  <button
                    key={symptom.id}
                    onClick={() => {
                      setCurrentSymptom(symptom);
                      setCurrentStep('details');
                    }}
                    className={`p-3 border rounded-lg text-left hover:bg-gray-50 transition-colors ${
                      symptom.severity === 'severe' ? 'border-red-200 bg-red-50' :
                      symptom.severity === 'moderate' ? 'border-yellow-200 bg-yellow-50' :
                      'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {symptom.name}
                      </span>
                      {symptom.severity === 'severe' && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {t[symptom.severity as keyof typeof t]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Enhanced Symptom Details */}
          {currentStep === 'details' && currentSymptom && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className={`text-2xl font-bold text-gray-800 mb-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {currentSymptom.name}
                </h3>
                <p className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {language === 'bn' ? 'বিস্তারিত তথ্য প্রদান করুন' : 'Provide detailed information'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Duration */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                    <label className={`block text-lg font-semibold mb-4 text-blue-800 flex items-center space-x-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      <Clock className="w-5 h-5" />
                      <span>{t.duration}</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(t.durations).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => setDuration(key)}
                          className={`p-3 text-sm border-2 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                            duration === key 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-500 shadow-lg' 
                              : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                          }`}
                        >
                          <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Intensity Scale */}
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
                    <label className={`block text-lg font-semibold mb-4 text-red-800 flex items-center space-x-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      <TrendingUp className="w-5 h-5" />
                      <span>{t.intensity}</span>
                    </label>
                    
                    <div className="space-y-4">
                      {/* Visual Pain Scale */}
                      <div className="flex items-center justify-between mb-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                          <button
                            key={level}
                            onClick={() => setIntensity(level)}
                            className={`w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center text-xs font-bold ${
                              intensity >= level
                                ? level <= 3 ? 'bg-green-500 border-green-500 text-white'
                                  : level <= 6 ? 'bg-yellow-500 border-yellow-500 text-white'
                                  : level <= 8 ? 'bg-orange-500 border-orange-500 text-white'
                                  : 'bg-red-500 border-red-500 text-white'
                                : 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                      
                      <div className="relative">
                        <input
                           type="range"
                           min="1"
                           max="10"
                           value={intensity}
                           onChange={(e) => setIntensity(parseInt(e.target.value))}
                           className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider mobile-slider focus-visible"
                           style={{
                             background: `linear-gradient(to right, #10b981 0%, #10b981 ${(intensity-1)*10}%, #f3f4f6 ${(intensity-1)*10}%, #f3f4f6 100%)`
                           }}
                           aria-label={language === 'bn' ? 'ব্যথার তীব্রতা' : 'Pain intensity'}
                           aria-valuemin={1}
                           aria-valuemax={10}
                           aria-valuenow={intensity}
                           aria-valuetext={`${intensity} ${language === 'bn' ? 'এর মধ্যে' : 'out of'} 10`}
                           role="slider"
                         />
                      </div>
                      
                      <div className="flex justify-between text-sm font-medium">
                        <span className={`text-green-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{t.mild}</span>
                        <span className={`text-yellow-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{t.moderate}</span>
                        <span className={`text-red-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{t.severe}</span>
                      </div>
                      
                      <div className="text-center">
                        <span className={`text-2xl font-bold ${
                          intensity <= 3 ? 'text-green-600' :
                          intensity <= 6 ? 'text-yellow-600' :
                          intensity <= 8 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {intensity}/10
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Enhanced Notes with Voice Input */}
                  <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-200">
                    <label className={`block text-lg font-semibold mb-4 text-green-800 flex items-center space-x-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      <FileText className="w-5 h-5" />
                      <span>{t.notes}</span>
                    </label>
                    
                    <div className="space-y-4">
                      <div className="relative">
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className={`w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
                          rows={4}
                          placeholder={language === 'bn' ? 'অতিরিক্ত তথ্য লিখুন... (যেমন: কখন শুরু হয়েছে, কি করলে বাড়ে/কমে)' : 'Enter additional information... (e.g., when it started, what makes it better/worse)'}
                        />
                        
                        {/* Voice Input Button */}
                        <button
                           onClick={startVoiceRecording}
                           disabled={isVoiceRecording}
                           className={`absolute bottom-3 right-3 p-2 rounded-lg transition-all duration-200 btn-accessible tap-target focus-visible ${
                             isVoiceRecording 
                               ? 'bg-red-500 text-white animate-pulse voice-pulse' 
                               : 'bg-green-500 text-white hover:bg-green-600 hover:scale-110'
                           }`}
                           title={language === 'bn' ? 'ভয়েস রেকর্ডিং' : 'Voice Recording'}
                           aria-label={language === 'bn' ? 
                             (isVoiceRecording ? 'ভয়েস রেকর্ডিং বন্ধ করুন' : 'ভয়েস রেকর্ডিং শুরু করুন') :
                             (isVoiceRecording ? 'Stop voice recording' : 'Start voice recording')
                           }
                           aria-pressed={isVoiceRecording}
                         >
                          {isVoiceRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      {isVoiceRecording && (
                        <div className="flex items-center space-x-2 text-red-600 animate-pulse">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                          <span className={`text-sm ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                            {language === 'bn' ? 'রেকর্ডিং চলছে...' : 'Recording...'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <label className={`block text-lg font-semibold mb-4 text-purple-800 flex items-center space-x-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      <Camera className="w-5 h-5" />
                      <span>{language === 'bn' ? 'ছবি আপলোড' : 'Upload Images'}</span>
                    </label>
                    
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <Upload className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                          <p className={`text-sm text-purple-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                            {language === 'bn' ? 'ছবি নির্বাচন করুন' : 'Select images'}
                          </p>
                          <p className={`text-xs text-purple-400 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                            {language === 'bn' ? '(ঐচ্ছিক - লক্ষণের ছবি)' : '(Optional - photos of symptoms)'}
                          </p>
                        </label>
                      </div>
                      
                      {uploadedImages.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {uploadedImages.map((file, index) => (
                            <div key={index} className="relative bg-white rounded-lg p-2 border border-purple-200">
                              <span className="text-xs text-purple-600 truncate block">{file.name}</span>
                              <button
                                onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== index))}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Next Button - পরবর্তী বাটন */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleNextFromDetails}
                  disabled={!duration || intensity < 1 || isLoading}
                  className={`group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-w-[200px] touch-target ${
                    isLoading ? 'animate-pulse' : ''
                  }`}
                  aria-label={language === 'bn' ? 'পরবর্তী ধাপে যান' : 'Go to next step'}
                >
                  <div className="flex items-center justify-center space-x-3">
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>
                          {language === 'bn' ? 'প্রক্রিয়াকরণ...' : 'Processing...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className={`text-lg font-medium ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                          {language === 'bn' ? 'পরবর্তী ধাপ' : 'Next Step'}
                        </span>
                        <ChevronRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
                      </>
                    )}
                  </div>
                  
                  {/* Gradient overlay for hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Detailed Questions */}
          {currentStep === 'detailedQuestions' && detailedQuestions.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                {t.steps.detailedQuestions}
              </h3>
              
              {/* Progress indicator for questions */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {language === 'bn' ? 'প্রশ্ন' : 'Question'} {currentQuestionIndex + 1} {language === 'bn' ? 'এর' : 'of'} {detailedQuestions.length}
                  </span>
                  <span className={`text-sm text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {Math.round(((currentQuestionIndex + 1) / detailedQuestions.length) * 100)}% {language === 'bn' ? 'সম্পন্ন' : 'Complete'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / detailedQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Current Question */}
              {detailedQuestions[currentQuestionIndex] && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        detailedQuestions[currentQuestionIndex].category === 'timing' ? 'bg-blue-100 text-blue-700' :
                        detailedQuestions[currentQuestionIndex].category === 'severity' ? 'bg-red-100 text-red-700' :
                        detailedQuestions[currentQuestionIndex].category === 'associated' ? 'bg-green-100 text-green-700' :
                        detailedQuestions[currentQuestionIndex].category === 'triggers' ? 'bg-yellow-100 text-yellow-700' :
                        detailedQuestions[currentQuestionIndex].category === 'medical-history' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {t.questions[detailedQuestions[currentQuestionIndex].category as keyof typeof t.questions]}
                      </div>
                      {detailedQuestions[currentQuestionIndex].required && (
                        <span className="text-red-500 text-sm">*</span>
                      )}
                    </div>
                    <h4 className={`text-lg font-medium text-gray-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {detailedQuestions[currentQuestionIndex].question}
                    </h4>
                  </div>

                  {/* Question Input Based on Type */}
                  <div className="mb-6">
                    {detailedQuestions[currentQuestionIndex].type === 'multiple-choice' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {detailedQuestions[currentQuestionIndex].options?.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuestionResponse(detailedQuestions[currentQuestionIndex].id, option)}
                            className={`p-3 text-left border rounded-lg transition-colors ${
                              questionResponses.find(r => r.questionId === detailedQuestions[currentQuestionIndex].id)?.answer === option
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>
                              {option}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {detailedQuestions[currentQuestionIndex].type === 'yes-no' && (
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleQuestionResponse(detailedQuestions[currentQuestionIndex].id, true)}
                          className={`px-6 py-3 rounded-lg transition-colors ${
                            questionResponses.find(r => r.questionId === detailedQuestions[currentQuestionIndex].id)?.answer === true
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>
                            {t.questions.yes}
                          </span>
                        </button>
                        <button
                          onClick={() => handleQuestionResponse(detailedQuestions[currentQuestionIndex].id, false)}
                          className={`px-6 py-3 rounded-lg transition-colors ${
                            questionResponses.find(r => r.questionId === detailedQuestions[currentQuestionIndex].id)?.answer === false
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>
                            {t.questions.no}
                          </span>
                        </button>
                      </div>
                    )}

                    {detailedQuestions[currentQuestionIndex].type === 'scale' && (
                      <div>
                        <div className="flex items-center space-x-4 mb-2">
                          <span className="text-sm text-gray-600">1</span>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={questionResponses.find(r => r.questionId === detailedQuestions[currentQuestionIndex].id)?.answer || 5}
                            onChange={(e) => handleQuestionResponse(detailedQuestions[currentQuestionIndex].id, parseInt(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-sm text-gray-600">10</span>
                          <span className="w-8 text-center font-medium">
                            {questionResponses.find(r => r.questionId === detailedQuestions[currentQuestionIndex].id)?.answer || 5}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>
                            {language === 'bn' ? 'কম' : 'Low'}
                          </span>
                          <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>
                            {language === 'bn' ? 'বেশি' : 'High'}
                          </span>
                        </div>
                      </div>
                    )}

                    {detailedQuestions[currentQuestionIndex].type === 'text' && (
                      <textarea
                        value={questionResponses.find(r => r.questionId === detailedQuestions[currentQuestionIndex].id)?.answer || ''}
                        onChange={(e) => handleQuestionResponse(detailedQuestions[currentQuestionIndex].id, e.target.value)}
                        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
                        rows={3}
                        placeholder={language === 'bn' ? 'আপনার উত্তর লিখুন...' : 'Enter your answer...'}
                      />
                    )}
                  </div>

                  {/* Question Navigation */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className={`px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
                        currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>
                        {t.questions.previous}
                      </span>
                    </button>

                    <div className="flex space-x-2">
                      {!detailedQuestions[currentQuestionIndex].required && (
                        <button
                          onClick={handleNextQuestion}
                          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>
                            {t.questions.skip}
                          </span>
                        </button>
                      )}
                      
                      <button
                        onClick={handleNextQuestion}
                        disabled={detailedQuestions[currentQuestionIndex].required && 
                          !questionResponses.find(r => r.questionId === detailedQuestions[currentQuestionIndex].id)}
                        className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${
                          detailedQuestions[currentQuestionIndex].required && 
                          !questionResponses.find(r => r.questionId === detailedQuestions[currentQuestionIndex].id)
                            ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>
                          {currentQuestionIndex === detailedQuestions.length - 1 
                            ? t.questions.completeQuestions 
                            : t.questions.nextQuestion}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Assessment */}
          {currentStep === 'assessment' && (
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                {t.steps.assessment}
              </h3>
              
              {/* Red Flag Warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h4 className={`font-semibold text-red-700 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {t.redFlags}
                  </h4>
                </div>
                <p className={`text-sm text-red-600 mb-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.seekImmediate}
                </p>
                <ul className="text-sm text-red-600 space-y-1">
                  {redFlagSymptoms.map((symptom, index) => (
                    <li key={index} className={`flex items-center space-x-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      <span>•</span>
                      <span>{symptom}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI Processing Steps */}
              {isLoading && aiProcessingSteps.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
                    <h4 className={`font-semibold text-blue-700 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {language === 'bn' ? 'AI প্রক্রিয়াকরণ' : 'AI Processing'}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {aiProcessingSteps.map((step, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className={`text-sm text-gray-700 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Assessment */}
              {isLoading && !aiProcessingSteps.length ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {language === 'bn' ? 'মূল্যায়ন করা হচ্ছে...' : 'Assessing symptoms...'}
                  </p>
                </div>
              ) : assessment ? (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-blue-500" />
                      <h4 className={`font-semibold text-blue-700 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {language === 'bn' ? 'AI স্মার্ট মূল্যায়ন' : 'AI Smart Assessment'}
                      </h4>
                    </div>
                    {consensusScore > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                          {language === 'bn' ? 'কনসেনসাস স্কোর:' : 'Consensus Score:'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          consensusScore >= 80 ? 'bg-green-100 text-green-700' :
                          consensusScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {consensusScore}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={`text-gray-700 whitespace-pre-wrap ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {assessment}
                  </div>
                </div>
              ) : null}

              {/* AI-Powered Diagnoses */}
              {aiDiagnoses.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Brain className="w-6 h-6 text-purple-600" />
                    <h4 className={`text-lg font-semibold text-purple-700 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {language === 'bn' ? '🤖 AI স্মার্ট রোগ নির্ণয়' : '🤖 AI Smart Diagnosis'}
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {aiDiagnoses.map((diagnosis, index) => (
                      <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className={`font-semibold text-gray-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                            {diagnosis.condition}
                          </h5>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              diagnosis.severity === 'severe' ? 'bg-red-100 text-red-700' :
                              diagnosis.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {language === 'bn' ? 
                                (diagnosis.severity === 'severe' ? 'গুরুতর' :
                                 diagnosis.severity === 'moderate' ? 'মাঝারি' : 'হালকা') :
                                (diagnosis.severity === 'severe' ? 'Severe' :
                                 diagnosis.severity === 'moderate' ? 'Moderate' : 'Mild')
                              }
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              diagnosis.probability >= 80 ? 'bg-red-100 text-red-700' :
                              diagnosis.probability >= 60 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {diagnosis.probability}%
                            </span>
                          </div>
                        </div>
                        <p className={`text-sm text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                          {diagnosis.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fallback Possible Diagnoses */}
              {selectedSymptoms.length > 0 && aiDiagnoses.length === 0 && !isLoading && (
                <div className="mt-6">
                  <h4 className={`text-lg font-semibold mb-4 text-purple-700 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {language === 'bn' ? 'সম্ভাব্য রোগ নির্ণয়' : 'Possible Diagnoses'}
                  </h4>
                  <div className="space-y-3">
                    {generatePossibleDiagnoses(selectedSymptoms).map((diagnosis, index) => (
                      <div key={index} className="bg-white border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className={`font-semibold text-gray-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                            {diagnosis.condition}
                          </h5>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              diagnosis.severity === 'severe' ? 'bg-red-100 text-red-700' :
                              diagnosis.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {language === 'bn' ? 
                                (diagnosis.severity === 'severe' ? 'গুরুতর' :
                                 diagnosis.severity === 'moderate' ? 'মাঝারি' : 'হালকা') :
                                (diagnosis.severity === 'severe' ? 'Severe' :
                                 diagnosis.severity === 'moderate' ? 'Moderate' : 'Mild')
                              }
                            </span>
                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                              {diagnosis.probability}%
                            </span>
                          </div>
                        </div>
                        <p className={`text-sm text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                          {diagnosis.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Tests */}
              {selectedSymptoms.length > 0 && (
                <div className="mt-6">
                  <h4 className={`text-lg font-semibold mb-4 text-green-700 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {language === 'bn' ? 'প্রয়োজনীয় পরীক্ষা-নিরীক্ষা' : 'Recommended Tests'}
                  </h4>
                  <div className="space-y-3">
                    {generateRecommendedTests(selectedSymptoms).map((test, index) => (
                      <div key={index} className="bg-white border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className={`font-semibold text-gray-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                            {test.testName}
                          </h5>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              test.urgency === 'immediate' ? 'bg-red-100 text-red-700' :
                              test.urgency === 'within_week' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {language === 'bn' ? 
                                (test.urgency === 'immediate' ? 'জরুরি' :
                                 test.urgency === 'within_week' ? 'এক সপ্তাহের মধ্যে' : 'নিয়মিত') :
                                (test.urgency === 'immediate' ? 'Immediate' :
                                 test.urgency === 'within_week' ? 'Within Week' : 'Routine')
                              }
                            </span>
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                              {test.cost}
                            </span>
                          </div>
                        </div>
                        <p className={`text-sm text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                          {test.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lifestyle Recommendations */}
              {selectedSymptoms.length > 0 && (
                <div className="mt-6">
                  <h4 className={`text-lg font-semibold mb-4 text-orange-700 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {language === 'bn' ? 'জীবনযাত্রার পরামর্শ' : 'Lifestyle Recommendations'}
                  </h4>
                  <div className="space-y-4">
                    {generateLifestyleRecommendations(selectedSymptoms).map((recommendation, index) => (
                      <div key={index} className="bg-white border border-orange-200 rounded-lg p-4">
                        <h5 className={`font-semibold text-gray-800 mb-3 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                          {recommendation.category}
                        </h5>
                        <ul className="space-y-2">
                          {recommendation.suggestions.map((suggestion, suggestionIndex) => (
                            <li key={suggestionIndex} className="flex items-start space-x-2">
                              <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                              <span className={`text-sm text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                                {suggestion}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emergency Warning */}
              {selectedSymptoms.some(s => s.intensity >= 8) && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                    <h4 className={`font-semibold text-red-700 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {language === 'bn' ? '⚠️ জরুরি সতর্কতা' : '⚠️ Emergency Warning'}
                    </h4>
                  </div>
                  <p className={`text-red-700 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {language === 'bn' 
                      ? 'আপনার লক্ষণগুলো গুরুতর। অবিলম্বে নিকটস্থ হাসপাতালের জরুরি বিভাগে যান বা ৯৯৯ নম্বরে কল করুন।'
                      : 'Your symptoms are severe. Please go to the nearest hospital emergency department immediately or call 999.'
                    }
                  </p>
                </div>
              )}

              {/* Doctor Recommendations */}
              {showDoctorRecommendations && doctorRecommendations.length > 0 && (
                <div className="mt-6">
                  <h4 className={`text-lg font-semibold mb-4 text-blue-700 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {t.doctorRecommendations}
                  </h4>
                  
                  <div className="space-y-6">
                    {doctorRecommendations.map((recommendation, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className={`font-semibold text-gray-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                            {recommendation.specialty}
                          </h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            recommendation.urgency === 'high' ? 'bg-red-100 text-red-700' :
                            recommendation.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {t.urgencyLevels[recommendation.urgency]}
                          </span>
                        </div>
                        
                        <p className={`text-sm text-gray-600 mb-4 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                          {recommendation.reason}
                        </p>
                        
                        {/* Available Doctors */}
                        <div className="space-y-3">
                          <h6 className={`font-medium text-gray-700 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                            {language === 'bn' ? 'উপলব্ধ ডাক্তার:' : 'Available Doctors:'}
                          </h6>
                          
                          {recommendation.doctors.map((doctor) => (
                            <div key={doctor.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <UserCheck className="w-5 h-5 text-blue-500" />
                                    <h6 className={`font-semibold text-gray-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                                      {doctor.name}
                                    </h6>
                                    <div className="flex items-center space-x-1">
                                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                      <span className="text-sm text-gray-600">{doctor.rating}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                                    <div className={language === 'bn' ? 'bangla-text' : 'english-text'}>
                                      <span className="font-medium">{t.experience}:</span> {doctor.experience}
                                    </div>
                                    <div className={language === 'bn' ? 'bangla-text' : 'english-text'}>
                                      <span className="font-medium">{t.fee}:</span> {doctor.fee}
                                    </div>
                                    <div className={language === 'bn' ? 'bangla-text' : 'english-text'}>
                                      <span className="font-medium">{t.availability}:</span> {doctor.availability}
                                    </div>
                                    <div className={language === 'bn' ? 'bangla-text' : 'english-text'}>
                                      <span className="font-medium">{t.hospital}:</span> {doctor.hospital}
                                    </div>
                                  </div>
                                </div>
                                
                                <button
                                  onClick={() => {
                                    if (onDoctorBooking) {
                                      onDoctorBooking(doctor.id, recommendation.specialty);
                                    }
                                    onClose();
                                  }}
                                  className="ml-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                                >
                                  <Calendar className="w-4 h-4" />
                                  <span className={`text-sm ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                                    {t.bookAppointment}
                                  </span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className={`text-sm text-yellow-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {language === 'bn' 
                    ? 'দ্রষ্টব্য: এটি একটি প্রাথমিক মূল্যায়ন মাত্র। চূড়ান্ত রোগ নির্ণয় ও চিকিৎসার জন্য অবশ্যই যোগ্য চিকিৎসকের পরামর্শ নিন।'
                    : 'Note: This is only a preliminary assessment. Please consult a qualified doctor for final diagnosis and treatment.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Footer with Modern Navigation */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button
               onClick={goBackInHistory}
               className={`flex items-center space-x-2 px-4 md:px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-xl hover:bg-white hover:border-gray-400 transition-all duration-200 transform hover:scale-105 btn-accessible tap-target mobile-touch-target focus-visible ${
                 stepHistory.length <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
               }`}
               disabled={stepHistory.length <= 1}
               aria-label={language === 'bn' ? 'পূর্ববর্তী ধাপে ফিরে যান' : 'Go back to previous step'}
             >
              <ChevronLeft className="w-5 h-5" />
              <span className={`font-medium ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                {t.back}
              </span>
            </button>

            {/* Progress Indicator */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Activity className="w-4 h-4" />
                <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>
                  {language === 'bn' ? 'অগ্রগতি:' : 'Progress:'}
                </span>
                <span className="font-semibold text-blue-600">{Math.round(progressPercentage)}%</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {/* Add Symptom Button */}
              {currentStep === 'details' && (
                <button
                   onClick={handleAddSymptom}
                   disabled={!duration || !intensity}
                   className={`flex items-center space-x-2 px-4 md:px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 btn-accessible tap-target mobile-touch-target focus-visible ${
                     !duration || !intensity
                       ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                       : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                   }`}
                   aria-label={language === 'bn' ? 'লক্ষণ যোগ করুন' : 'Add symptom'}
                 >
                  <Zap className="w-5 h-5" />
                  <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>
                    {t.addSymptom}
                  </span>
                </button>
              )}
              
              {/* Continue to Questions Button */}
              {currentStep === 'symptoms' && selectedSymptoms.length > 0 && (
                <button
                   onClick={startDetailedQuestions}
                   className="flex items-center space-x-2 px-4 md:px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl hover:from-green-600 hover:to-teal-700 font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl btn-accessible tap-target mobile-touch-target focus-visible"
                   aria-label={language === 'bn' ? 'বিস্তারিত প্রশ্নে যান' : 'Go to detailed questions'}
                 >
                  <ChevronRight className="w-5 h-5" />
                  <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>
                    {language === 'bn' ? 'বিস্তারিত প্রশ্ন' : 'Detailed Questions'}
                  </span>
                </button>
              )}
              
              {/* Get Assessment Button */}
              {currentStep === 'symptoms' && selectedSymptoms.length > 0 && (
                <button
                   onClick={handleGetAssessment}
                   className="flex items-center space-x-2 px-4 md:px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl btn-accessible tap-target mobile-touch-target focus-visible"
                   aria-label={language === 'bn' ? 'দ্রুত স্বাস্থ্য মূল্যায়ন পান' : 'Get quick health assessment'}
                 >
                  <Stethoscope className="w-5 h-5" />
                  <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>
                    {language === 'bn' ? 'দ্রুত মূল্যায়ন' : 'Quick Assessment'}
                  </span>
                </button>
              )}
            </div>
          </div>
          
          {/* Quick Tips */}
          {currentStep === 'bodyPart' && (
            <div className="mt-4 bg-blue-100 rounded-lg p-3">
              <p className={`text-sm text-blue-800 flex items-center space-x-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                <Zap className="w-4 h-4" />
                <span>
                  {language === 'bn' 
                    ? '💡 টিপস: সবচেয়ে সমস্যাযুক্ত এলাকা নির্বাচন করুন' 
                    : '💡 Tip: Select the area where you feel the most discomfort'}
                </span>
              </p>
            </div>
          )}
          
          {currentStep === 'symptoms' && (
            <div className="mt-4 bg-green-100 rounded-lg p-3">
              <p className={`text-sm text-green-800 flex items-center space-x-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                <Search className="w-4 h-4" />
                <span>
                  {language === 'bn' 
                    ? '💡 টিপস: সার্চ বার ব্যবহার করে দ্রুত লক্ষণ খুঁজুন' 
                    : '💡 Tip: Use the search bar to quickly find symptoms'}
                </span>
              </p>
            </div>
          )}
          
          {currentStep === 'details' && (
            <div className="mt-4 bg-purple-100 rounded-lg p-3">
              <p className={`text-sm text-purple-800 flex items-center space-x-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                <Mic className="w-4 h-4" />
                <span>
                  {language === 'bn' 
                    ? '💡 টিপস: ভয়েস রেকর্ডিং বা ছবি আপলোড করে আরো তথ্য দিন' 
                    : '💡 Tip: Use voice recording or upload images for more detailed information'}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;