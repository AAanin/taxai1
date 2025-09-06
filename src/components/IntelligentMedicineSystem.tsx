// Intelligent Medicine Suggestion System - বুদ্ধিমত্তাসম্পন্ন ওষুধ সাজেশন সিস্টেম
import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Calculator, 
  Star, 
  DollarSign, 
  Clock, 
  Shield, 
  Zap, 
  Brain, 
  TrendingUp, 
  Filter, 
  MoreVertical, 
  Eye, 
  Heart, 
  Activity,
  Loader
} from 'lucide-react';

interface Medicine {
  id: string;
  name: string;
  genericName: string;
  brandName: string;
  category: string;
  dosageForm: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'drops';
  strength: string;
  manufacturer: string;
  price: {
    brand: number;
    generic: number;
  };
  availability: 'available' | 'limited' | 'unavailable';
  sideEffects: string[];
  contraindications: string[];
  interactions: string[];
  pregnancyCategory: 'A' | 'B' | 'C' | 'D' | 'X';
  ageRestrictions: {
    minAge: number;
    maxAge?: number;
  };
  dosageRecommendations: {
    adult: string;
    child: string;
    elderly: string;
  };
  indications: string[];
  mechanism: string;
  halfLife: string;
  rating: number;
  reviews: number;
}

interface Patient {
  age: number;
  weight: number;
  gender: 'male' | 'female';
  allergies: string[];
  currentMedications: string[];
  medicalConditions: string[];
  pregnancyStatus?: boolean;
  kidneyFunction?: 'normal' | 'mild' | 'moderate' | 'severe';
  liverFunction?: 'normal' | 'mild' | 'moderate' | 'severe';
}

interface DosageCalculation {
  recommendedDose: string;
  frequency: string;
  duration: string;
  maxDailyDose: string;
  adjustments: string[];
  warnings: string[];
}

interface Props {
  symptoms: string[];
  diagnosis: string;
  patient: Patient;
  onMedicineSelect: (medicine: Medicine, dosage: DosageCalculation) => void;
}

const IntelligentMedicineSystem: React.FC<Props> = ({ 
  symptoms, 
  diagnosis, 
  patient, 
  onMedicineSelect 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showGenericOnly, setShowGenericOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'price' | 'rating'>('relevance');
  const [suggestedMedicines, setSuggestedMedicines] = useState<Medicine[]>([]);
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [calculatedDosage, setCalculatedDosage] = useState<DosageCalculation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showInteractionWarning, setShowInteractionWarning] = useState(false);
  const [interactionDetails, setInteractionDetails] = useState<string[]>([]);

  // Mock Medicine Database
  const medicineDatabase: Medicine[] = [
    {
      id: '1',
      name: 'প্যারাসিটামল',
      genericName: 'Paracetamol',
      brandName: 'Napa',
      category: 'Analgesic',
      dosageForm: 'tablet',
      strength: '500mg',
      manufacturer: 'Beximco Pharmaceuticals',
      price: { brand: 2.5, generic: 1.5 },
      availability: 'available',
      sideEffects: ['বমি বমি ভাব', 'পেট ব্যথা', 'অ্যালার্জিক রিঅ্যাকশন'],
      contraindications: ['গুরুতর লিভারের সমস্যা', 'অ্যালকোহল নির্ভরতা'],
      interactions: ['ওয়ারফারিন', 'কার্বামাজেপিন'],
      pregnancyCategory: 'B',
      ageRestrictions: { minAge: 2 },
      dosageRecommendations: {
        adult: '500-1000mg প্রতি ৪-৬ ঘন্টায়',
        child: '10-15mg/kg প্রতি ৪-৬ ঘন্টায়',
        elderly: '500mg প্রতি ৬ ঘন্টায়'
      },
      indications: ['জ্বর', 'ব্যথা', 'মাথাব্যথা'],
      mechanism: 'COX inhibition',
      halfLife: '1-4 hours',
      rating: 4.5,
      reviews: 1250
    },
    {
      id: '2',
      name: 'অ্যামোক্সিসিলিন',
      genericName: 'Amoxicillin',
      brandName: 'Amoxil',
      category: 'Antibiotic',
      dosageForm: 'capsule',
      strength: '250mg',
      manufacturer: 'Square Pharmaceuticals',
      price: { brand: 8.0, generic: 5.0 },
      availability: 'available',
      sideEffects: ['ডায়রিয়া', 'বমি', 'র‍্যাশ'],
      contraindications: ['পেনিসিলিন অ্যালার্জি'],
      interactions: ['মেথোট্রেক্সেট', 'ওয়ারফারিন'],
      pregnancyCategory: 'B',
      ageRestrictions: { minAge: 1 },
      dosageRecommendations: {
        adult: '250-500mg প্রতি ৮ ঘন্টায়',
        child: '20-40mg/kg দৈনিক ৩ ভাগে',
        elderly: '250mg প্রতি ৮ ঘন্টায়'
      },
      indications: ['ব্যাকটেরিয়াল ইনফেকশন', 'শ্বাসযন্ত্রের সংক্রমণ'],
      mechanism: 'Cell wall synthesis inhibition',
      halfLife: '1-1.3 hours',
      rating: 4.2,
      reviews: 890
    },
    {
      id: '3',
      name: 'ওমিপ্রাজল',
      genericName: 'Omeprazole',
      brandName: 'Losec',
      category: 'PPI',
      dosageForm: 'capsule',
      strength: '20mg',
      manufacturer: 'Incepta Pharmaceuticals',
      price: { brand: 12.0, generic: 8.0 },
      availability: 'available',
      sideEffects: ['মাথাব্যথা', 'কোষ্ঠকাঠিন্য', 'ডায়রিয়া'],
      contraindications: ['ওমিপ্রাজল অ্যালার্জি'],
      interactions: ['ক্লোপিডোগ্রেল', 'ডিগক্সিন'],
      pregnancyCategory: 'C',
      ageRestrictions: { minAge: 1 },
      dosageRecommendations: {
        adult: '20-40mg দৈনিক ১ বার',
        child: '0.7-3.3mg/kg দৈনিক',
        elderly: '20mg দৈনিক'
      },
      indications: ['গ্যাস্ট্রিক আলসার', 'GERD', 'অম্লতা'],
      mechanism: 'Proton pump inhibition',
      halfLife: '0.5-1 hour',
      rating: 4.3,
      reviews: 675
    },
    {
      id: '4',
      name: 'মেটফরমিন',
      genericName: 'Metformin',
      brandName: 'Glucophage',
      category: 'Antidiabetic',
      dosageForm: 'tablet',
      strength: '500mg',
      manufacturer: 'Novartis',
      price: { brand: 6.0, generic: 3.5 },
      availability: 'available',
      sideEffects: ['বমি বমি ভাব', 'ডায়রিয়া', 'পেটে গ্যাস'],
      contraindications: ['কিডনি ফেইলিউর', 'লিভার ফেইলিউর'],
      interactions: ['কন্ট্রাস্ট মিডিয়া', 'অ্যালকোহল'],
      pregnancyCategory: 'B',
      ageRestrictions: { minAge: 10 },
      dosageRecommendations: {
        adult: '500mg দিনে ২-৩ বার',
        child: '10-25mg/kg দৈনিক',
        elderly: '500mg দিনে ২ বার'
      },
      indications: ['টাইপ ২ ডায়াবেটিস', 'PCOS'],
      mechanism: 'Glucose production inhibition',
      halfLife: '4-8.7 hours',
      rating: 4.1,
      reviews: 1120
    }
  ];

  const categories = [
    { id: 'all', name: 'সব ক্যাটেগরি' },
    { id: 'Analgesic', name: 'ব্যথানাশক' },
    { id: 'Antibiotic', name: 'অ্যান্টিবায়োটিক' },
    { id: 'PPI', name: 'গ্যাস্ট্রিক' },
    { id: 'Antidiabetic', name: 'ডায়াবেটিস' },
    { id: 'Antihypertensive', name: 'উচ্চ রক্তচাপ' }
  ];

  // AI-based medicine suggestion
  const generateAISuggestions = async () => {
    setIsLoading(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Filter medicines based on symptoms and diagnosis
    let suggestions = medicineDatabase.filter(medicine => {
      // Check if medicine is indicated for the symptoms/diagnosis
      const isIndicated = medicine.indications.some(indication => 
        symptoms.some(symptom => 
          symptom.toLowerCase().includes(indication.toLowerCase()) ||
          indication.toLowerCase().includes(symptom.toLowerCase())
        ) ||
        diagnosis.toLowerCase().includes(indication.toLowerCase())
      );
      
      // Check contraindications
      const hasContraindication = medicine.contraindications.some(contra => 
        patient.medicalConditions.some(condition => 
          condition.toLowerCase().includes(contra.toLowerCase())
        )
      );
      
      // Check allergies
      const hasAllergy = patient.allergies.some(allergy => 
        medicine.name.toLowerCase().includes(allergy.toLowerCase()) ||
        medicine.genericName.toLowerCase().includes(allergy.toLowerCase())
      );
      
      // Check age restrictions
      const ageAppropriate = patient.age >= medicine.ageRestrictions.minAge &&
        (!medicine.ageRestrictions.maxAge || patient.age <= medicine.ageRestrictions.maxAge);
      
      return isIndicated && !hasContraindication && !hasAllergy && ageAppropriate;
    });
    
    // Sort by relevance, safety, and efficacy
    suggestions = suggestions.sort((a, b) => {
      // Prioritize by rating and safety
      const scoreA = a.rating * 0.4 + (5 - a.sideEffects.length) * 0.3 + (a.availability === 'available' ? 1 : 0) * 0.3;
      const scoreB = b.rating * 0.4 + (5 - b.sideEffects.length) * 0.3 + (b.availability === 'available' ? 1 : 0) * 0.3;
      return scoreB - scoreA;
    });
    
    setSuggestedMedicines(suggestions.slice(0, 6));
    setAllMedicines(medicineDatabase);
    setIsLoading(false);
  };

  // Calculate dosage based on patient parameters
  const calculateDosage = (medicine: Medicine): DosageCalculation => {
    let recommendedDose = medicine.dosageRecommendations.adult;
    let adjustments: string[] = [];
    let warnings: string[] = [];
    
    // Age-based adjustments
    if (patient.age < 18) {
      recommendedDose = medicine.dosageRecommendations.child;
      adjustments.push('শিশুদের জন্য ডোজ সমন্বয়');
    } else if (patient.age > 65) {
      recommendedDose = medicine.dosageRecommendations.elderly;
      adjustments.push('বয়স্কদের জন্য ডোজ সমন্বয়');
    }
    
    // Weight-based adjustments for certain medicines
    if (medicine.category === 'Antibiotic' && patient.weight) {
      const weightBasedDose = Math.round((patient.weight * 20) / 250) * 250; // Example calculation
      adjustments.push(`ওজন অনুযায়ী সমন্বয়: ${weightBasedDose}mg`);
    }
    
    // Kidney function adjustments
    if (patient.kidneyFunction && patient.kidneyFunction !== 'normal') {
      adjustments.push('কিডনি ফাংশন অনুযায়ী ডোজ কমানো প্রয়োজন');
      warnings.push('কিডনি ফাংশন মনিটর করুন');
    }
    
    // Liver function adjustments
    if (patient.liverFunction && patient.liverFunction !== 'normal') {
      adjustments.push('লিভার ফাংশন অনুযায়ী ডোজ সমন্বয়');
      warnings.push('লিভার ফাংশন মনিটর করুন');
    }
    
    // Pregnancy considerations
    if (patient.pregnancyStatus && medicine.pregnancyCategory === 'D') {
      warnings.push('গর্ভাবস্থায় ঝুঁকিপূর্ণ - বিকল্প বিবেচনা করুন');
    }
    
    // Drug interactions
    const interactions = medicine.interactions.filter(interaction => 
      patient.currentMedications.some(med => 
        med.toLowerCase().includes(interaction.toLowerCase())
      )
    );
    
    if (interactions.length > 0) {
      warnings.push(`ড্রাগ ইন্টারঅ্যাকশন: ${interactions.join(', ')}`);
    }
    
    return {
      recommendedDose,
      frequency: 'দিনে ২-৩ বার', // Default, should be medicine-specific
      duration: '৫-৭ দিন', // Default, should be condition-specific
      maxDailyDose: '4000mg', // Default, should be medicine-specific
      adjustments,
      warnings
    };
  };

  // Check drug interactions
  const checkInteractions = (medicine: Medicine) => {
    const interactions = medicine.interactions.filter(interaction => 
      patient.currentMedications.some(med => 
        med.toLowerCase().includes(interaction.toLowerCase())
      )
    );
    
    if (interactions.length > 0) {
      setInteractionDetails(interactions);
      setShowInteractionWarning(true);
    }
  };

  // Filter medicines
  const getFilteredMedicines = () => {
    let filtered = allMedicines;
    
    if (searchQuery) {
      filtered = filtered.filter(medicine => 
        medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.brandName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(medicine => medicine.category === selectedCategory);
    }
    
    if (showGenericOnly) {
      filtered = filtered.filter(medicine => medicine.price.generic > 0);
    }
    
    // Sort medicines
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price.brand - b.price.brand;
        case 'rating':
          return b.rating - a.rating;
        default:
          return b.rating - a.rating; // Default to rating
      }
    });
    
    return filtered;
  };

  // Handle medicine selection
  const handleMedicineSelect = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    const dosage = calculateDosage(medicine);
    setCalculatedDosage(dosage);
    checkInteractions(medicine);
  };

  // Add medicine to prescription
  const addToPrescription = () => {
    if (selectedMedicine && calculatedDosage) {
      onMedicineSelect(selectedMedicine, calculatedDosage);
      setSelectedMedicine(null);
      setCalculatedDosage(null);
    }
  };

  useEffect(() => {
    if (symptoms.length > 0 || diagnosis) {
      generateAISuggestions();
    }
  }, [symptoms, diagnosis, patient]);

  return (
    <div className="space-y-6">
      {/* AI Suggestions */}
      {suggestedMedicines.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">এআই প্রস্তাবিত ওষুধ</h3>
            {isLoading && <Loader className="h-5 w-5 animate-spin text-blue-600" />}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedMedicines.map((medicine) => (
              <div key={medicine.id} className="bg-white rounded-lg border border-blue-200 p-4 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{medicine.name}</h4>
                    <p className="text-sm text-gray-600">{medicine.genericName} • {medicine.strength}</p>
                    <p className="text-xs text-gray-500">{medicine.manufacturer}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{medicine.rating}</span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">ব্র্যান্ড:</span>
                    <span className="font-medium">৳{medicine.price.brand}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">জেনেরিক:</span>
                    <span className="font-medium text-green-600">৳{medicine.price.generic}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      medicine.availability === 'available'
                        ? 'bg-green-100 text-green-800'
                        : medicine.availability === 'limited'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {medicine.availability === 'available' ? 'উপলব্ধ' : 
                       medicine.availability === 'limited' ? 'সীমিত' : 'অনুপলব্ধ'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      medicine.pregnancyCategory === 'A' || medicine.pregnancyCategory === 'B'
                        ? 'bg-green-100 text-green-800'
                        : medicine.pregnancyCategory === 'C'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      গর্ভাবস্থা: {medicine.pregnancyCategory}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleMedicineSelect(medicine)}
                    className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    <Calculator className="h-4 w-4 inline mr-1" />
                    ডোজ ক্যালকুলেট
                  </button>
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ওষুধের নাম, জেনেরিক নাম বা ব্র্যান্ড খুঁজুন..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'relevance' | 'price' | 'rating')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="relevance">প্রাসঙ্গিকতা</option>
            <option value="price">মূল্য</option>
            <option value="rating">রেটিং</option>
          </select>
          
          {/* Generic Only Toggle */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showGenericOnly}
              onChange={(e) => setShowGenericOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">শুধু জেনেরিক</span>
          </label>
        </div>
      </div>

      {/* Medicine List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">সব ওষুধ ({getFilteredMedicines().length}টি)</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {getFilteredMedicines().map((medicine) => (
            <div key={medicine.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{medicine.name}</h4>
                      <p className="text-sm text-gray-600">{medicine.genericName} • {medicine.strength}</p>
                      <p className="text-xs text-gray-500 mb-2">{medicine.manufacturer}</p>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>{medicine.rating}</span>
                          <span className="text-gray-500">({medicine.reviews})</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span>৳{medicine.price.brand}</span>
                          <span className="text-gray-500">(জেনেরিক: ৳{medicine.price.generic})</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          medicine.availability === 'available'
                            ? 'bg-green-100 text-green-800'
                            : medicine.availability === 'limited'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {medicine.availability === 'available' ? 'উপলব্ধ' : 
                           medicine.availability === 'limited' ? 'সীমিত' : 'অনুপলব্ধ'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleMedicineSelect(medicine)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        <Calculator className="h-4 w-4 inline mr-1" />
                        ডোজ ক্যালকুলেট
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dosage Calculator Modal */}
      {selectedMedicine && calculatedDosage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setSelectedMedicine(null)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">ডোজ ক্যালকুলেশন</h2>
                <button
                  onClick={() => setSelectedMedicine(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Medicine Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">{selectedMedicine.name}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">জেনেরিক:</span>
                      <span className="ml-2 font-medium">{selectedMedicine.genericName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">শক্তি:</span>
                      <span className="ml-2 font-medium">{selectedMedicine.strength}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">ক্যাটেগরি:</span>
                      <span className="ml-2 font-medium">{selectedMedicine.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">গর্ভাবস্থা:</span>
                      <span className="ml-2 font-medium">{selectedMedicine.pregnancyCategory}</span>
                    </div>
                  </div>
                </div>

                {/* Calculated Dosage */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">প্রস্তাবিত ডোজ</h4>
                  <div className="bg-green-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">ডোজ:</span>
                        <p className="font-medium">{calculatedDosage.recommendedDose}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">ফ্রিকোয়েন্সি:</span>
                        <p className="font-medium">{calculatedDosage.frequency}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">সময়কাল:</span>
                        <p className="font-medium">{calculatedDosage.duration}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">সর্বোচ্চ দৈনিক ডোজ:</span>
                        <p className="font-medium">{calculatedDosage.maxDailyDose}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Adjustments */}
                {calculatedDosage.adjustments.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">ডোজ সমন্বয়</h4>
                    <div className="space-y-2">
                      {calculatedDosage.adjustments.map((adjustment, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <Info className="h-4 w-4 text-blue-500" />
                          <span>{adjustment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {calculatedDosage.warnings.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">সতর্কতা</h4>
                    <div className="space-y-2">
                      {calculatedDosage.warnings.map((warning, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span>{warning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Side Effects */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">পার্শ্বপ্রতিক্রিয়া</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMedicine.sideEffects.map((effect, index) => (
                      <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                        {effect}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedMedicine(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  onClick={addToPrescription}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  প্রেসক্রিপশনে যোগ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interaction Warning Modal */}
      {showInteractionWarning && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowInteractionWarning(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                  <h3 className="text-lg font-semibold text-gray-900">ড্রাগ ইন্টারঅ্যাকশন সতর্কতা</h3>
                </div>
                
                <p className="text-gray-600 mb-4">
                  এই ওষুধটি রোগীর বর্তমান ওষুধের সাথে ইন্টারঅ্যাকশন করতে পারে:
                </p>
                
                <div className="space-y-2 mb-6">
                  {interactionDetails.map((interaction, index) => (
                    <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <span className="text-red-800 font-medium">{interaction}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowInteractionWarning(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    বুঝেছি
                  </button>
                  <button
                    onClick={() => {
                      setShowInteractionWarning(false);
                      addToPrescription();
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    তবুও যোগ করুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntelligentMedicineSystem;