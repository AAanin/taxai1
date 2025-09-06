import React, { useState, useEffect } from 'react';
import { X, Apple, Utensils, Clock, Droplets, AlertTriangle, CheckCircle, Heart, User, Scale, Activity, FileText, Calculator, TrendingUp, Star, Phone, MapPin, Calendar, Award, DollarSign } from 'lucide-react';
import { Language } from '../types';

interface DietSuggestionProps {
  language: Language;
  onClose: () => void;
}

interface PersonalInfo {
  age: number;
  gender: 'male' | 'female';
  weight: number;
  height: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  bloodSugar: number;
  bloodPressure: { systolic: number; diastolic: number };
  cholesterol: number;
  allergies: string[];
  currentMedications: string[];
  dietaryPreferences: string[];
  healthGoals: string[];
}

interface MedicalReport {
  id: string;
  date: string;
  type: string;
  values: { [key: string]: number | string };
}

interface Nutritionist {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  consultationFee: number;
  location: string;
  phone: string;
  availableSlots: string[];
  qualifications: string[];
  languages: string[];
}

interface SmartDietPlan {
  personalInfo: PersonalInfo;
  bmi: number;
  bmiCategory: string;
  dailyCalories: number;
  macronutrients: {
    protein: number;
    carbs: number;
    fats: number;
  };
  mealPlan: {
    breakfast: MealItem[];
    lunch: MealItem[];
    dinner: MealItem[];
    snacks: MealItem[];
  };
  nutritionalAnalysis: {
    vitamins: string[];
    minerals: string[];
    fiber: number;
    water: number;
  };
  healthRecommendations: string[];
  progressTracking: {
    weeklyGoals: string[];
    measurements: string[];
  };
  shoppingList: string[];
  recipes: Recipe[];
}

interface MealItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  portion: string;
}

interface Recipe {
  name: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number;
  servings: number;
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

const DietSuggestion: React.FC<DietSuggestionProps> = ({ language, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [personalInfo, setPersonalInfo] = useState<Partial<PersonalInfo>>({});
  const [medicalReports, setMedicalReports] = useState<MedicalReport[]>([]);
  const [dietPlan, setDietPlan] = useState<SmartDietPlan | null>(null);
  const [nutritionists, setNutritionists] = useState<Nutritionist[]>([]);
  const [selectedNutritionist, setSelectedNutritionist] = useState<Nutritionist | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNutritionists, setShowNutritionists] = useState(false);
  const [bmi, setBmi] = useState<number>(0);
  const [bmiCategory, setBmiCategory] = useState<string>('');

  // Load medical reports from localStorage
  useEffect(() => {
    console.log('DietSuggestion component mounted');
    alert('DietSuggestion component loaded successfully!');
    const savedReports = localStorage.getItem('medicalReports');
    if (savedReports) {
      setMedicalReports(JSON.parse(savedReports));
    }
  }, []);
  
  // Debug current step changes
  useEffect(() => {
    console.log('Current step changed to:', currentStep);
  }, [currentStep]);

  // Calculate BMI when weight and height change
  useEffect(() => {
    if (personalInfo.weight && personalInfo.height) {
      const heightInMeters = personalInfo.height / 100;
      const calculatedBmi = personalInfo.weight / (heightInMeters * heightInMeters);
      setBmi(Math.round(calculatedBmi * 10) / 10);
      
      if (calculatedBmi < 18.5) setBmiCategory('কম ওজন');
      else if (calculatedBmi < 25) setBmiCategory('স্বাভাবিক');
      else if (calculatedBmi < 30) setBmiCategory('অতিরিক্ত ওজন');
      else setBmiCategory('স্থূলতা');
    }
  }, [personalInfo.weight, personalInfo.height]);

  const activityLevels = [
    { id: 'sedentary', name: 'বসে থাকা কাজ', nameEn: 'Sedentary', multiplier: 1.2 },
    { id: 'light', name: 'হালকা কাজ', nameEn: 'Light Activity', multiplier: 1.375 },
    { id: 'moderate', name: 'মাঝারি কাজ', nameEn: 'Moderate Activity', multiplier: 1.55 },
    { id: 'active', name: 'সক্রিয় কাজ', nameEn: 'Active', multiplier: 1.725 },
    { id: 'very_active', name: 'অতি সক্রিয়', nameEn: 'Very Active', multiplier: 1.9 }
  ];

  const healthGoals = [
    { id: 'weight_loss', name: 'ওজন কমানো', nameEn: 'Weight Loss' },
    { id: 'weight_gain', name: 'ওজন বাড়ানো', nameEn: 'Weight Gain' },
    { id: 'maintain_weight', name: 'ওজন বজায় রাখা', nameEn: 'Maintain Weight' },
    { id: 'muscle_gain', name: 'পেশী বৃদ্ধি', nameEn: 'Muscle Gain' },
    { id: 'diabetes_control', name: 'ডায়াবেটিস নিয়ন্ত্রণ', nameEn: 'Diabetes Control' },
    { id: 'heart_health', name: 'হৃদযন্ত্রের স্বাস্থ্য', nameEn: 'Heart Health' },
    { id: 'digestive_health', name: 'পাচনতন্ত্রের স্বাস্থ্য', nameEn: 'Digestive Health' }
  ];

  const commonAllergies = [
    'দুধ/দুগ্ধজাত', 'ডিম', 'চিংড়ি/মাছ', 'বাদাম', 'গম/গ্লুটেন', 'সয়া', 'তিল'
  ];

  const dietaryPreferences = [
    'নিরামিষ', 'মাংসাশী', 'হালাল', 'কম লবণ', 'কম চিনি', 'কম তেল', 'ঐতিহ্যবাহী বাংলা খাবার'
  ];

  const nutritionistsData: Nutritionist[] = [
    {
      id: '1',
      name: 'ডা. ফাতেমা খাতুন',
      specialty: 'ডায়াবেটিস ও ওজন ব্যবস্থাপনা',
      experience: 12,
      rating: 4.8,
      consultationFee: 1500,
      location: 'ধানমন্ডি, ঢাকা',
      phone: '01711-123456',
      availableSlots: ['সকাল ৯-১২টা', 'বিকাল ৪-৭টা'],
      qualifications: ['এমবিবিএস', 'এমডি (এন্ডোক্রাইনোলজি)', 'ডিপ্লোমা ইন নিউট্রিশন'],
      languages: ['বাংলা', 'ইংরেজি']
    },
    {
      id: '2',
      name: 'ডা. মোহাম্মদ রহিম',
      specialty: 'হৃদরোগ ও কোলেস্টেরল ব্যবস্থাপনা',
      experience: 15,
      rating: 4.9,
      consultationFee: 2000,
      location: 'গুলশান, ঢাকা',
      phone: '01711-234567',
      availableSlots: ['সকাল ৮-১১টা', 'সন্ধ্যা ৬-৮টা'],
      qualifications: ['এমবিবিএস', 'এমডি (কার্ডিওলজি)', 'সার্টিফাইড নিউট্রিশনিস্ট'],
      languages: ['বাংলা', 'ইংরেজি', 'হিন্দি']
    },
    {
      id: '3',
      name: 'ডা. সালমা আক্তার',
      specialty: 'মাতৃত্বকালীন পুষ্টি ও শিশু পুষ্টি',
      experience: 10,
      rating: 4.7,
      consultationFee: 1200,
      location: 'উত্তরা, ঢাকা',
      phone: '01711-345678',
      availableSlots: ['সকাল ১০-১টা', 'বিকাল ৩-৬টা'],
      qualifications: ['এমবিবিএস', 'এমএস (গাইনি)', 'ডিপ্লোমা ইন চাইল্ড নিউট্রিশন'],
      languages: ['বাংলা', 'ইংরেজি']
    },
    {
      id: '4',
      name: 'ডা. আব্দুল করিম',
      specialty: 'কিডনি রোগ ও ডায়ালাইসিস পুষ্টি',
      experience: 18,
      rating: 4.9,
      consultationFee: 2500,
      location: 'বনানী, ঢাকা',
      phone: '01711-456789',
      availableSlots: ['সকাল ৯-১২টা', 'বিকাল ৫-৭টা'],
      qualifications: ['এমবিবিএস', 'এমডি (নেফ্রোলজি)', 'ফেলোশিপ ইন রেনাল নিউট্রিশন'],
      languages: ['বাংলা', 'ইংরেজি', 'আরবি']
    },
    {
      id: '5',
      name: 'ডা. নাসরিন সুলতানা',
      specialty: 'ক্রীড়া পুষ্টি ও ফিটনেস',
      experience: 8,
      rating: 4.6,
      consultationFee: 1800,
      location: 'বসুন্ধরা, ঢাকা',
      phone: '01711-567890',
      availableSlots: ['সকাল ৭-১০টা', 'সন্ধ্যা ৬-৯টা'],
      qualifications: ['এমবিবিএস', 'ডিপ্লোমা ইন স্পোর্টস নিউট্রিশন', 'সার্টিফাইড ফিটনেস ট্রেইনার'],
      languages: ['বাংলা', 'ইংরেজি']
    }
  ];

  // Helper functions
  const calculateBMR = (weight: number, height: number, age: number, gender: 'male' | 'female') => {
    if (gender === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  };

  const calculateDailyCalories = (bmr: number, activityLevel: string) => {
    const multiplier = activityLevels.find(level => level.id === activityLevel)?.multiplier || 1.2;
    return Math.round(bmr * multiplier);
  };

  const analyzeMedicalReports = (reports: MedicalReport[]) => {
    const analysis = {
      diabetesRisk: false,
      hypertensionRisk: false,
      cholesterolRisk: false,
      kidneyRisk: false,
      anemiaRisk: false,
      recommendations: [] as string[]
    };

    reports.forEach(report => {
      if (report.type === 'blood_sugar' && typeof report.values.fasting === 'number') {
        if (report.values.fasting > 126) {
          analysis.diabetesRisk = true;
          analysis.recommendations.push('ডায়াবেটিস নিয়ন্ত্রণের জন্য কম চিনি ও কার্বোহাইড্রেট খান');
        }
      }
      if (report.type === 'lipid_profile' && typeof report.values.total_cholesterol === 'number') {
        if (report.values.total_cholesterol > 240) {
          analysis.cholesterolRisk = true;
          analysis.recommendations.push('কোলেস্টেরল কমানোর জন্য ওমেগা-৩ সমৃদ্ধ মাছ খান');
        }
      }
    });

    return analysis;
  };

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: any) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayFieldChange = (field: keyof PersonalInfo, value: string, checked: boolean) => {
    setPersonalInfo(prev => {
      const currentArray = (prev[field] as string[]) || [];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter(item => item !== value) };
      }
    });
  };

  const generateSmartDietPlan = async () => {
    console.log('generateSmartDietPlan called with personalInfo:', personalInfo);
    
    // Enhanced validation with specific field checking
    const missingFields = [];
    if (!personalInfo.weight) missingFields.push('ওজন');
    if (!personalInfo.height) missingFields.push('উচ্চতা');
    if (!personalInfo.age) missingFields.push('বয়স');
    if (!personalInfo.gender) missingFields.push('লিঙ্গ');
    if (!personalInfo.activityLevel) missingFields.push('কার্যকলাপের মাত্রা');
    
    if (missingFields.length > 0) {
      alert(`অনুগ্রহ করে নিম্নলিখিত তথ্য পূরণ করুন: ${missingFields.join(', ')}`);
      console.log('Missing fields:', missingFields);
      return;
    }

    console.log('All required fields present, starting generation...');
    setIsGenerating(true);
    
    try {
      // Calculate BMR and daily calories
      console.log('Calculating BMR with:', {
        weight: personalInfo.weight,
        height: personalInfo.height,
        age: personalInfo.age,
        gender: personalInfo.gender
      });
      
      const bmr = calculateBMR(
        personalInfo.weight!,
        personalInfo.height!,
        personalInfo.age!,
        personalInfo.gender!
      );
      console.log('BMR calculated:', bmr);
      
      const dailyCalories = calculateDailyCalories(bmr, personalInfo.activityLevel || 'moderate');
      console.log('Daily calories calculated:', dailyCalories);
      
      // Analyze medical reports
      console.log('Analyzing medical reports:', medicalReports);
      const medicalAnalysis = analyzeMedicalReports(medicalReports);
      console.log('Medical analysis completed:', medicalAnalysis);
      
      // Generate meal plan based on health conditions and goals
      console.log('Generating meal plan...');
      const mealPlan = generateMealPlan(dailyCalories, personalInfo, medicalAnalysis);
      console.log('Meal plan generated:', mealPlan);
      
      const smartPlan: SmartDietPlan = {
        personalInfo: personalInfo as PersonalInfo,
        bmi,
        bmiCategory,
        dailyCalories,
        macronutrients: {
          protein: Math.round(dailyCalories * 0.25 / 4), // 25% protein
          carbs: Math.round(dailyCalories * 0.45 / 4),   // 45% carbs
          fats: Math.round(dailyCalories * 0.30 / 9)     // 30% fats
        },
        mealPlan,
        nutritionalAnalysis: {
          vitamins: ['ভিটামিন ডি', 'ভিটামিন বি১২', 'ফলিক এসিড'],
          minerals: ['আয়রন', 'ক্যালসিয়াম', 'জিংক'],
          fiber: 25,
          water: 8
        },
        healthRecommendations: [
          ...medicalAnalysis.recommendations,
          'নিয়মিত ব্যায়াম করুন',
          'পর্যাপ্ত ঘুম নিন',
          'স্ট্রেস কম নিন'
        ],
        progressTracking: {
          weeklyGoals: ['সাপ্তাহিক ওজন পরিমাপ', 'দৈনিক পানি পান ট্র্যাক করা'],
          measurements: ['ওজন', 'কোমরের মাপ', 'রক্তচাপ']
        },
        shoppingList: generateShoppingList(mealPlan),
        recipes: generateRecipes(personalInfo)
      };
      
      console.log('Smart plan created:', smartPlan);
      
      setDietPlan(smartPlan);
      console.log('Diet plan set in state');
      
      setNutritionists(nutritionistsData);
      console.log('Nutritionists set in state');
      
      console.log('Changing step from', currentStep, 'to 4');
      setCurrentStep(4);
      console.log('Step changed to 4 successfully');
      
    } catch (error) {
      console.error('Error generating diet plan:', error);
      alert(`ডায়েট প্ল্যান তৈরিতে সমস্যা হয়েছে: ${error instanceof Error ? error.message : 'অজানা ত্রুটি'}। আবার চেষ্টা করুন।`);
    } finally {
      console.log('Setting isGenerating to false');
      setIsGenerating(false);
    }
  };

  const generateMealPlan = (calories: number, info: Partial<PersonalInfo>, analysis: any) => {
    // This is a simplified meal plan generator
    // In a real app, this would be much more sophisticated
    const breakfastCalories = Math.round(calories * 0.25);
    const lunchCalories = Math.round(calories * 0.35);
    const dinnerCalories = Math.round(calories * 0.30);
    const snackCalories = Math.round(calories * 0.10);
    
    return {
      breakfast: [
        { name: 'ওটস', calories: breakfastCalories * 0.4, protein: 8, carbs: 30, fats: 3, portion: '১ কাপ' },
        { name: 'কলা', calories: breakfastCalories * 0.3, protein: 1, carbs: 25, fats: 0, portion: '১টি মাঝারি' },
        { name: 'বাদাম', calories: breakfastCalories * 0.3, protein: 6, carbs: 3, fats: 14, portion: '১০-১৫টি' }
      ],
      lunch: [
        { name: 'ভাত', calories: lunchCalories * 0.4, protein: 4, carbs: 45, fats: 1, portion: '১ কাপ' },
        { name: 'মাছ', calories: lunchCalories * 0.35, protein: 25, carbs: 0, fats: 8, portion: '১০০ গ্রাম' },
        { name: 'সবজি', calories: lunchCalories * 0.25, protein: 3, carbs: 10, fats: 2, portion: '১ কাপ' }
      ],
      dinner: [
        { name: 'রুটি', calories: dinnerCalories * 0.4, protein: 6, carbs: 30, fats: 2, portion: '২টি' },
        { name: 'ডাল', calories: dinnerCalories * 0.35, protein: 12, carbs: 20, fats: 1, portion: '১/২ কাপ' },
        { name: 'সালাদ', calories: dinnerCalories * 0.25, protein: 2, carbs: 8, fats: 0, portion: '১ বাটি' }
      ],
      snacks: [
        { name: 'ফল', calories: snackCalories * 0.6, protein: 1, carbs: 20, fats: 0, portion: '১টি' },
        { name: 'গ্রিন টি', calories: snackCalories * 0.4, protein: 0, carbs: 0, fats: 0, portion: '১ কাপ' }
      ]
    };
  };

  const generateShoppingList = (mealPlan: any) => {
    return [
      'ওটস - ১ কেজি',
      'কলা - ১ ডজন',
      'বাদাম মিশ্রণ - ৫০০ গ্রাম',
      'চাল - ২ কেজি',
      'মাছ - ১ কেজি',
      'মিশ্র সবজি - ২ কেজি',
      'আটা - ১ কেজি',
      'ডাল - ৫০০ গ্রাম',
      'সালাদের সবজি - ১ কেজি',
      'মৌসুমি ফল - ২ কেজি'
    ];
  };

  const generateRecipes = (info: Partial<PersonalInfo>) => {
    return [
      {
        name: 'স্বাস্থ্যকর ওটস',
        ingredients: ['ওটস ১ কাপ', 'দুধ ১ কাপ', 'কলা ১টি', 'বাদাম ১০টি', 'মধু ১ চামচ'],
        instructions: [
          'ওটস পানিতে সিদ্ধ করুন',
          'দুধ মিশিয়ে দিন',
          'কলা ও বাদাম কুচি করে দিন',
          'মধু মিশিয়ে পরিবেশন করুন'
        ],
        cookingTime: 10,
        servings: 1,
        nutritionalInfo: { calories: 350, protein: 12, carbs: 45, fats: 8 }
      }
    ];
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const bookNutritionist = (nutritionist: Nutritionist) => {
    setSelectedNutritionist(nutritionist);
    alert(`${nutritionist.name} এর সাথে অ্যাপয়েন্টমেন্ট বুক করা হয়েছে!`);
  };

  const texts = {
    bn: {
      title: 'স্মার্ট ডায়েট সাজেশন',
      subtitle: 'AI চালিত ব্যক্তিগত পুষ্টি পরামর্শ ও নিউট্রিশনিস্ট রেকমেন্ডেশন',
      step1Title: 'ব্যক্তিগত তথ্য',
      step2Title: 'স্বাস্থ্য তথ্য',
      step3Title: 'খাদ্যাভ্যাস ও লক্ষ্য',
      step4Title: 'আপনার ডায়েট প্ল্যান',
      step5Title: 'নিউট্রিশনিস্ট রেকমেন্ডেশন',
      age: 'বয়স',
      gender: 'লিঙ্গ',
      male: 'পুরুষ',
      female: 'মহিলা',
      weight: 'ওজন (কেজি)',
      height: 'উচ্চতা (সেমি / ইঞ্চি / ফিট)',
      activityLevel: 'কার্যকলাপের মাত্রা',
      bloodSugar: 'রক্তে চিনির পরিমাণ (mg/dl)',
      bloodPressure: 'রক্তচাপ',
      systolic: 'সিস্টোলিক',
      diastolic: 'ডায়াস্টোলিক',
      cholesterol: 'কোলেস্টেরল (mg/dl)',
      allergies: 'খাদ্য এলার্জি',
      medications: 'বর্তমান ওষুধ',
      dietaryPreferences: 'খাদ্য পছন্দ',
      healthGoals: 'স্বাস্থ্য লক্ষ্য',
      bmi: 'বিএমআই',
      bmiCategory: 'বিএমআই ক্যাটেগরি',
      dailyCalories: 'দৈনিক ক্যালোরি',
      protein: 'প্রোটিন',
      carbs: 'কার্বোহাইড্রেট',
      fats: 'চর্বি',
      breakfast: 'সকালের নাস্তা',
      lunch: 'দুপুরের খাবার',
      dinner: 'রাতের খাবার',
      snacks: 'নাস্তা',
      shoppingList: 'কেনাকাটার তালিকা',
      recipes: 'রেসিপি',
      nutritionists: 'নিউট্রিশনিস্ট',
      experience: 'অভিজ্ঞতা',
      rating: 'রেটিং',
      consultationFee: 'পরামর্শ ফি',
      location: 'অবস্থান',
      phone: 'ফোন',
      availableSlots: 'উপলব্ধ সময়',
      qualifications: 'যোগ্যতা',
      languages: 'ভাষা',
      bookAppointment: 'অ্যাপয়েন্টমেন্ট বুক করুন',
      nextStep: 'পরবর্তী ধাপ',
      prevStep: 'পূর্ববর্তী ধাপ',
      generatePlan: 'ডায়েট প্ল্যান তৈরি করুন',
      generating: 'তৈরি করা হচ্ছে...',
      closeButton: 'বন্ধ করুন',
      progressTracking: 'অগ্রগতি ট্র্যাকিং',
      weeklyGoals: 'সাপ্তাহিক লক্ষ্য',
      measurements: 'পরিমাপ',
      healthRecommendations: 'স্বাস্থ্য পরামর্শ',
      nutritionalAnalysis: 'পুষ্টি বিশ্লেষণ',
      vitamins: 'ভিটামিন',
      minerals: 'খনিজ',
      fiber: 'ফাইবার',
      water: 'পানি',
      medicalReports: 'মেডিকেল রিপোর্ট',
      noReports: 'কোন রিপোর্ট পাওয়া যায়নি'
    },
    en: {
      title: 'Smart Diet Suggestion',
      subtitle: 'AI-powered personalized nutrition advice & nutritionist recommendations',
      step1Title: 'Personal Information',
      step2Title: 'Health Information',
      step3Title: 'Diet Preferences & Goals',
      step4Title: 'Your Diet Plan',
      step5Title: 'Nutritionist Recommendations',
      age: 'Age',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      weight: 'Weight (kg)',
      height: 'Height (cm / inch / ft)',
      activityLevel: 'Activity Level',
      bloodSugar: 'Blood Sugar (mg/dl)',
      bloodPressure: 'Blood Pressure',
      systolic: 'Systolic',
      diastolic: 'Diastolic',
      cholesterol: 'Cholesterol (mg/dl)',
      allergies: 'Food Allergies',
      medications: 'Current Medications',
      dietaryPreferences: 'Dietary Preferences',
      healthGoals: 'Health Goals',
      bmi: 'BMI',
      bmiCategory: 'BMI Category',
      dailyCalories: 'Daily Calories',
      protein: 'Protein',
      carbs: 'Carbohydrates',
      fats: 'Fats',
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      snacks: 'Snacks',
      shoppingList: 'Shopping List',
      recipes: 'Recipes',
      nutritionists: 'Nutritionists',
      experience: 'Experience',
      rating: 'Rating',
      consultationFee: 'Consultation Fee',
      location: 'Location',
      phone: 'Phone',
      availableSlots: 'Available Slots',
      qualifications: 'Qualifications',
      languages: 'Languages',
      bookAppointment: 'Book Appointment',
      nextStep: 'Next Step',
      prevStep: 'Previous Step',
      generatePlan: 'Generate Diet Plan',
      generating: 'Generating...',
      closeButton: 'Close',
      progressTracking: 'Progress Tracking',
      weeklyGoals: 'Weekly Goals',
      measurements: 'Measurements',
      healthRecommendations: 'Health Recommendations',
      nutritionalAnalysis: 'Nutritional Analysis',
      vitamins: 'Vitamins',
      minerals: 'Minerals',
      fiber: 'Fiber',
      water: 'Water',
      medicalReports: 'Medical Reports',
      noReports: 'No reports found'
    }
  };

  const t = texts[language];

  const renderProgressBar = () => {
    const steps = ['ব্যক্তিগত তথ্য', 'স্বাস্থ্য তথ্য', 'খাদ্যাভ্যাস', 'ডায়েট প্ল্যান', 'নিউট্রিশনিস্ট'];
    return (
      <div className="flex items-center justify-center mb-6">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              index + 1 <= currentStep ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {index + 1}
            </div>
            <div className={`ml-2 text-sm ${index + 1 <= currentStep ? 'text-green-600' : 'text-gray-400'} bangla-text`}>
              {step}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-4 ${index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <Apple className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold text-gray-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                {t.title}
              </h2>
              <p className={`text-sm text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                {t.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="p-6 bg-gray-50">
          {renderProgressBar()}
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-200px)] p-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className={`text-xl font-bold text-gray-800 mb-6 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                {t.step1Title}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Age */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {t.age}
                  </label>
                  <input
                    type="number"
                    value={personalInfo.age || ''}
                    onChange={(e) => handlePersonalInfoChange('age', parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="25"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {t.gender}
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={personalInfo.gender === 'male'}
                        onChange={(e) => handlePersonalInfoChange('gender', e.target.value)}
                        className="mr-2"
                      />
                      <span className={`${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{t.male}</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={personalInfo.gender === 'female'}
                        onChange={(e) => handlePersonalInfoChange('gender', e.target.value)}
                        className="mr-2"
                      />
                      <span className={`${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{t.female}</span>
                    </label>
                  </div>
                </div>

                {/* Weight */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {t.weight}
                  </label>
                  <input
                    type="number"
                    value={personalInfo.weight || ''}
                    onChange={(e) => handlePersonalInfoChange('weight', parseFloat(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="65"
                  />
                </div>

                {/* Height */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {t.height}
                  </label>
                  <input
                    type="number"
                    value={personalInfo.height || ''}
                    onChange={(e) => handlePersonalInfoChange('height', parseFloat(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="170"
                  />
                </div>
              </div>

              {/* BMI Display */}
              {personalInfo.weight && personalInfo.height && (
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-4">
                    <Calculator className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className={`text-lg font-semibold text-blue-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {t.bmi}: {bmi}
                      </p>
                      <p className={`text-sm text-blue-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {t.bmiCategory}: {bmiCategory}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Level */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-3 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.activityLevel}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activityLevels.map((level) => (
                    <label
                      key={level.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        personalInfo.activityLevel === level.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="activityLevel"
                        value={level.id}
                        checked={personalInfo.activityLevel === level.id}
                        onChange={(e) => handlePersonalInfoChange('activityLevel', e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <p className={`font-medium ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                          {language === 'bn' ? level.name : level.nameEn}
                        </p>
                        <p className="text-xs text-gray-500">x{level.multiplier}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Health Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className={`text-xl font-bold text-gray-800 mb-6 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                {t.step2Title}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Blood Sugar */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {t.bloodSugar}
                  </label>
                  <input
                    type="number"
                    value={personalInfo.bloodSugar || ''}
                    onChange={(e) => handlePersonalInfoChange('bloodSugar', parseFloat(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>

                {/* Blood Pressure */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {t.bloodPressure}
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={personalInfo.bloodPressure?.systolic || ''}
                      onChange={(e) => handlePersonalInfoChange('bloodPressure', {
                        ...personalInfo.bloodPressure,
                        systolic: parseInt(e.target.value)
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder={t.systolic}
                    />
                    <span className="flex items-center text-gray-500">/</span>
                    <input
                      type="number"
                      value={personalInfo.bloodPressure?.diastolic || ''}
                      onChange={(e) => handlePersonalInfoChange('bloodPressure', {
                        ...personalInfo.bloodPressure,
                        diastolic: parseInt(e.target.value)
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder={t.diastolic}
                    />
                  </div>
                </div>

                {/* Cholesterol */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {t.cholesterol}
                  </label>
                  <input
                    type="number"
                    value={personalInfo.cholesterol || ''}
                    onChange={(e) => handlePersonalInfoChange('cholesterol', parseFloat(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="200"
                  />
                </div>

                {/* Current Medications */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {t.medications}
                  </label>
                  <input
                    type="text"
                    value={(personalInfo.currentMedications || []).join(', ')}
                    onChange={(e) => handlePersonalInfoChange('currentMedications', e.target.value.split(', ').filter(Boolean))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="মেটফরমিন, লিসিনোপ্রিল"
                  />
                </div>
              </div>

              {/* Medical Reports */}
              <div>
                <h4 className={`text-lg font-semibold text-gray-800 mb-4 flex items-center ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  <FileText className="w-5 h-5 mr-2" />
                  {t.medicalReports}
                </h4>
                {medicalReports.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {medicalReports.map((report) => (
                      <div key={report.id} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h5 className="font-semibold text-blue-800">{report.type}</h5>
                        <p className="text-sm text-blue-600">{report.date}</p>
                        <div className="mt-2 text-xs text-blue-700">
                          {Object.entries(report.values).map(([key, value]) => (
                            <div key={key}>{key}: {value}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-gray-500 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {t.noReports}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Diet Preferences & Goals */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className={`text-xl font-bold text-gray-800 mb-6 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                {t.step3Title}
              </h3>

              {/* Food Allergies */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-3 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.allergies}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {commonAllergies.map((allergy) => (
                    <label key={allergy} className="flex items-center p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(personalInfo.allergies || []).includes(allergy)}
                        onChange={(e) => handleArrayFieldChange('allergies', allergy, e.target.checked)}
                        className="mr-2"
                      />
                      <span className={`text-sm ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{allergy}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dietary Preferences */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-3 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.dietaryPreferences}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {dietaryPreferences.map((preference) => (
                    <label key={preference} className="flex items-center p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(personalInfo.dietaryPreferences || []).includes(preference)}
                        onChange={(e) => handleArrayFieldChange('dietaryPreferences', preference, e.target.checked)}
                        className="mr-2"
                      />
                      <span className={`text-sm ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{preference}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Health Goals */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-3 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.healthGoals}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {healthGoals.map((goal) => (
                    <label key={goal.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(personalInfo.healthGoals || []).includes(goal.id)}
                        onChange={(e) => handleArrayFieldChange('healthGoals', goal.id, e.target.checked)}
                        className="mr-3"
                      />
                      <span className={`${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {language === 'bn' ? goal.name : goal.nameEn}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Diet Plan */}
          {currentStep === 4 && dietPlan && (
            <div className="space-y-6">
              <h3 className={`text-xl font-bold text-gray-800 mb-6 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                {t.step4Title}
              </h3>

              {/* BMI & Calorie Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                  <Scale className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className={`font-semibold text-blue-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{t.bmi}</h4>
                  <p className="text-2xl font-bold text-blue-900">{dietPlan.bmi}</p>
                  <p className={`text-sm text-blue-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{dietPlan.bmiCategory}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className={`font-semibold text-green-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{t.dailyCalories}</h4>
                  <p className="text-2xl font-bold text-green-900">{dietPlan.dailyCalories}</p>
                  <p className="text-sm text-green-600">kcal/day</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
                  <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className={`font-semibold text-purple-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>Macros</h4>
                  <div className="text-xs text-purple-700">
                    <div>P: {dietPlan.macronutrients.protein}g</div>
                    <div>C: {dietPlan.macronutrients.carbs}g</div>
                    <div>F: {dietPlan.macronutrients.fats}g</div>
                  </div>
                </div>
              </div>

              {/* Meal Plan */}
              <div className="bg-white rounded-lg border border-gray-200">
                <h4 className={`text-lg font-semibold p-4 border-b border-gray-200 flex items-center ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  <Utensils className="w-5 h-5 mr-2" />
                  দৈনিক খাবার পরিকল্পনা
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                  {Object.entries(dietPlan.mealPlan).map(([mealType, meals]) => (
                    <div key={mealType} className="bg-gray-50 p-3 rounded-lg">
                      <h5 className={`font-medium mb-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {t[mealType as keyof typeof t]}
                      </h5>
                      <ul className="space-y-1">
                        {meals.map((meal, idx) => (
                          <li key={idx} className={`text-sm text-gray-700 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                            • {meal.name} ({meal.portion})
                            <div className="text-xs text-gray-500">{Math.round(meal.calories)} cal</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Recommendations */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className={`font-semibold text-yellow-800 mb-3 flex items-center ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  <Heart className="w-5 h-5 mr-2" />
                  {t.healthRecommendations}
                </h4>
                <ul className="space-y-2">
                  {dietPlan.healthRecommendations.map((rec, idx) => (
                    <li key={idx} className={`text-sm text-yellow-700 flex items-start ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Shopping List */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className={`font-semibold text-green-800 mb-3 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.shoppingList}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {dietPlan.shoppingList.map((item, idx) => (
                    <div key={idx} className={`text-sm text-green-700 bg-white p-2 rounded ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      • {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recipes */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className={`font-semibold text-orange-800 mb-3 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.recipes}
                </h4>
                {dietPlan.recipes.map((recipe, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg mb-3">
                    <h5 className={`font-medium text-orange-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{recipe.name}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className={`text-sm font-medium text-gray-700 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>উপকরণ:</p>
                        <ul className="text-xs text-gray-600 ml-4">
                          {recipe.ingredients.map((ingredient, i) => (
                            <li key={i} className={`${language === 'bn' ? 'bangla-text' : 'english-text'}`}>• {ingredient}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className={`text-sm font-medium text-gray-700 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>পুষ্টিগুণ:</p>
                        <div className="text-xs text-gray-600">
                          <div>ক্যালোরি: {recipe.nutritionalInfo.calories}</div>
                          <div>প্রোটিন: {recipe.nutritionalInfo.protein}g</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Nutritionist Recommendations */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className={`text-xl font-bold text-gray-800 mb-6 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                {t.step5Title}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {nutritionists.map((nutritionist) => (
                  <div key={nutritionist.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className={`text-lg font-semibold text-gray-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                          {nutritionist.name}
                        </h4>
                        <p className={`text-sm text-blue-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                          {nutritionist.specialty}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{nutritionist.rating}</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Award className="w-4 h-4 mr-2" />
                        <span className={`${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                          {t.experience}: {nutritionist.experience} বছর
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className={`${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{nutritionist.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{nutritionist.phone}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span className={`${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                          {t.consultationFee}: ৳{nutritionist.consultationFee}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className={`text-sm font-medium text-gray-700 mb-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {t.availableSlots}:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {nutritionist.availableSlots.map((slot, idx) => (
                          <span key={idx} className={`text-xs bg-green-100 text-green-800 px-2 py-1 rounded ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className={`text-sm font-medium text-gray-700 mb-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {t.qualifications}:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {nutritionist.qualifications.map((qual, idx) => (
                          <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {qual}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => bookNutritionist(nutritionist)}
                      className={`w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:shadow-md transition-all ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
                    >
                      {t.bookAppointment}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
            >
              {t.prevStep}
            </button>

            <div className="flex space-x-3">
              {currentStep === 3 && (
                <button
                  onClick={() => {
                    console.log('Debug - Current personalInfo:', personalInfo);
                    console.log('Debug - Current step:', currentStep);
                    console.log('Debug - Diet plan exists:', !!dietPlan);
                  }}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm"
                >
                  Debug Info
                </button>
              )}
              
              {currentStep === 3 && !dietPlan && (
                <button
                  onClick={generateSmartDietPlan}
                  disabled={isGenerating}
                  className={`px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:shadow-md transition-all disabled:opacity-50 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
                >
                  {isGenerating ? t.generating : t.generatePlan}
                </button>
              )}
              
              {currentStep === 3 && dietPlan && (
                <button
                  onClick={nextStep}
                  className={`px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:shadow-md transition-all ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
                >
                  {t.nextStep}
                </button>
              )}
              
              {currentStep === 4 && (
                <button
                  onClick={nextStep}
                  className={`px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-md transition-all ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
                >
                  {t.nutritionists} দেখুন
                </button>
              )}
              
              {currentStep < 3 && (
                <button
                  onClick={nextStep}
                  className={`px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:shadow-md transition-all ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
                >
                  {t.nextStep}
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className={`px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
            >
              {t.closeButton}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietSuggestion;