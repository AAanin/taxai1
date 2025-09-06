// AI Prescription System - এআই প্রেসক্রিপশন সিস্টেম
import React, { useState, useEffect } from 'react';
import {
  Brain, Pill, AlertTriangle, CheckCircle, Search, Plus,
  Trash2, Edit3, Save, X, Info, Clock, User, Calendar,
  FileText, Download, Share2, Copy, Zap, Target,
  Shield, Heart, Activity, Thermometer, Droplets
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

// Types
interface Medicine {
  id: string;
  name: string;
  genericName: string;
  brandNames: string[];
  category: string;
  dosageForm: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'drops';
  strength: string;
  manufacturer: string;
  price: number;
  availability: boolean;
  contraindications: string[];
  sideEffects: string[];
  interactions: string[];
  pregnancyCategory: 'A' | 'B' | 'C' | 'D' | 'X';
  description: string;
}

interface PrescriptionItem {
  id: string;
  medicine: Medicine;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  beforeFood: boolean;
  quantity: number;
  refills: number;
  urgent: boolean;
  notes?: string;
}

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  doctorId: string;
  doctorName: string;
  diagnosis: string;
  symptoms: string[];
  vitalSigns: {
    bloodPressure?: string;
    temperature?: number;
    pulse?: number;
    weight?: number;
    height?: number;
  };
  items: PrescriptionItem[];
  instructions: string;
  followUpDate?: Date;
  createdDate: Date;
  status: 'draft' | 'finalized' | 'dispensed';
  aiRecommendations: AIRecommendation[];
  warnings: DrugWarning[];
}

interface AIRecommendation {
  id: string;
  type: 'dosage' | 'alternative' | 'interaction' | 'contraindication' | 'optimization';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  suggestion: string;
  confidence: number;
  source: string;
}

interface DrugWarning {
  id: string;
  type: 'interaction' | 'allergy' | 'contraindication' | 'overdose' | 'pregnancy';
  severity: 'low' | 'medium' | 'high' | 'critical';
  medicines: string[];
  description: string;
  recommendation: string;
}

interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number;
  height: number;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  medicalHistory: string[];
  pregnancyStatus?: boolean;
  breastfeedingStatus?: boolean;
}

const AIPrescriptionSystem: React.FC = () => {
  const [currentPrescription, setCurrentPrescription] = useState<Prescription | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [availableMedicines, setAvailableMedicines] = useState<Medicine[]>([]);
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [showWarnings, setShowWarnings] = useState(true);
  const [activeTab, setActiveTab] = useState<'prescription' | 'recommendations' | 'warnings'>('prescription');
  
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // Initialize data
  useEffect(() => {
    loadMedicineDatabase();
    initializeNewPrescription();
  }, []);

  // Search medicines when query changes
  useEffect(() => {
    if (medicineSearch.length > 2) {
      const results = availableMedicines.filter(medicine =>
        medicine.name.toLowerCase().includes(medicineSearch.toLowerCase()) ||
        medicine.genericName.toLowerCase().includes(medicineSearch.toLowerCase()) ||
        medicine.brandNames.some(brand => brand.toLowerCase().includes(medicineSearch.toLowerCase()))
      ).slice(0, 10);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [medicineSearch, availableMedicines]);

  const loadMedicineDatabase = () => {
    // Sample medicine database
    const sampleMedicines: Medicine[] = [
      {
        id: '1',
        name: 'প্যারাসিটামল',
        genericName: 'Paracetamol',
        brandNames: ['নাপা', 'এস', 'ফেভার', 'প্যারা'],
        category: 'Analgesic/Antipyretic',
        dosageForm: 'tablet',
        strength: '500mg',
        manufacturer: 'Beximco Pharmaceuticals',
        price: 2.5,
        availability: true,
        contraindications: ['Severe liver disease', 'Hypersensitivity'],
        sideEffects: ['Nausea', 'Skin rash', 'Liver toxicity (overdose)'],
        interactions: ['Warfarin', 'Alcohol'],
        pregnancyCategory: 'B',
        description: 'ব্যথানাশক ও জ্বর কমানোর ওষুধ'
      },
      {
        id: '2',
        name: 'অ্যামোক্সিসিলিন',
        genericName: 'Amoxicillin',
        brandNames: ['অ্যামক্সি', 'মক্সাসিল', 'অ্যামোক্স'],
        category: 'Antibiotic',
        dosageForm: 'capsule',
        strength: '250mg',
        manufacturer: 'Square Pharmaceuticals',
        price: 8.0,
        availability: true,
        contraindications: ['Penicillin allergy', 'Mononucleosis'],
        sideEffects: ['Diarrhea', 'Nausea', 'Skin rash', 'Allergic reactions'],
        interactions: ['Methotrexate', 'Oral contraceptives'],
        pregnancyCategory: 'B',
        description: 'ব্যাকটেরিয়া সংক্রমণের জন্য অ্যান্টিবায়োটিক'
      },
      {
        id: '3',
        name: 'ওমিপ্রাজল',
        genericName: 'Omeprazole',
        brandNames: ['ওমি', 'প্রোটন', 'গ্যাস্ট্রো'],
        category: 'Proton Pump Inhibitor',
        dosageForm: 'capsule',
        strength: '20mg',
        manufacturer: 'Incepta Pharmaceuticals',
        price: 6.0,
        availability: true,
        contraindications: ['Hypersensitivity to omeprazole'],
        sideEffects: ['Headache', 'Diarrhea', 'Abdominal pain'],
        interactions: ['Clopidogrel', 'Warfarin', 'Digoxin'],
        pregnancyCategory: 'C',
        description: 'পেটের অ্যাসিড কমানোর ওষুধ'
      },
      {
        id: '4',
        name: 'মেটফরমিন',
        genericName: 'Metformin',
        brandNames: ['গ্লুকোফেজ', 'ডায়াবেক্স', 'মেট'],
        category: 'Antidiabetic',
        dosageForm: 'tablet',
        strength: '500mg',
        manufacturer: 'Aristopharma',
        price: 4.5,
        availability: true,
        contraindications: ['Kidney disease', 'Liver disease', 'Heart failure'],
        sideEffects: ['Nausea', 'Diarrhea', 'Metallic taste', 'Lactic acidosis (rare)'],
        interactions: ['Alcohol', 'Contrast dyes', 'Diuretics'],
        pregnancyCategory: 'B',
        description: 'ডায়াবেটিস নিয়ন্ত্রণের ওষুধ'
      },
      {
        id: '5',
        name: 'এমলোডিপিন',
        genericName: 'Amlodipine',
        brandNames: ['অ্যামলো', 'নরভাস্ক', 'কার্ডিলো'],
        category: 'Calcium Channel Blocker',
        dosageForm: 'tablet',
        strength: '5mg',
        manufacturer: 'Novartis',
        price: 7.5,
        availability: true,
        contraindications: ['Cardiogenic shock', 'Severe aortic stenosis'],
        sideEffects: ['Ankle swelling', 'Dizziness', 'Flushing', 'Fatigue'],
        interactions: ['Simvastatin', 'Cyclosporine', 'Tacrolimus'],
        pregnancyCategory: 'C',
        description: 'উচ্চ রক্তচাপ নিয়ন্ত্রণের ওষুধ'
      }
    ];

    setAvailableMedicines(sampleMedicines);
  };

  const initializeNewPrescription = () => {
    // Sample patient for demo
    const samplePatient: PatientProfile = {
      id: 'patient-1',
      name: 'মোহাম্মদ রহিম',
      age: 45,
      gender: 'male',
      weight: 70,
      height: 170,
      allergies: ['Penicillin'],
      chronicConditions: ['Diabetes', 'Hypertension'],
      currentMedications: ['Metformin 500mg'],
      medicalHistory: ['Heart disease family history']
    };

    const newPrescription: Prescription = {
      id: `rx-${Date.now()}`,
      patientId: samplePatient.id,
      patientName: samplePatient.name,
      patientAge: samplePatient.age,
      patientGender: samplePatient.gender,
      doctorId: user?.id || 'doctor-1',
      doctorName: user?.name || 'ডা. আব্দুল করিম',
      diagnosis: '',
      symptoms: [],
      vitalSigns: {},
      items: [],
      instructions: '',
      createdDate: new Date(),
      status: 'draft',
      aiRecommendations: [],
      warnings: []
    };

    setSelectedPatient(samplePatient);
    setCurrentPrescription(newPrescription);
  };

  // Add medicine to prescription
  const addMedicineToPrescription = (medicine: Medicine) => {
    if (!currentPrescription) return;

    const newItem: PrescriptionItem = {
      id: `item-${Date.now()}`,
      medicine,
      dosage: '1 tablet',
      frequency: 'দিনে ২ বার',
      duration: '৭ দিন',
      instructions: 'খাবারের পর সেবন করুন',
      beforeFood: false,
      quantity: 14,
      refills: 0,
      urgent: false
    };

    const updatedPrescription = {
      ...currentPrescription,
      items: [...currentPrescription.items, newItem]
    };

    setCurrentPrescription(updatedPrescription);
    setMedicineSearch('');
    setSearchResults([]);
    
    // Trigger AI analysis
    analyzeWithAI(updatedPrescription);
    
    showNotification(`${medicine.name} প্রেসক্রিপশনে যোগ করা হয়েছে`, 'success');
  };

  // Remove medicine from prescription
  const removeMedicineFromPrescription = (itemId: string) => {
    if (!currentPrescription) return;

    const updatedPrescription = {
      ...currentPrescription,
      items: currentPrescription.items.filter(item => item.id !== itemId)
    };

    setCurrentPrescription(updatedPrescription);
    analyzeWithAI(updatedPrescription);
  };

  // Update prescription item
  const updatePrescriptionItem = (itemId: string, updates: Partial<PrescriptionItem>) => {
    if (!currentPrescription) return;

    const updatedPrescription = {
      ...currentPrescription,
      items: currentPrescription.items.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    };

    setCurrentPrescription(updatedPrescription);
    analyzeWithAI(updatedPrescription);
  };

  // AI Analysis simulation
  const analyzeWithAI = async (prescription: Prescription) => {
    setAiProcessing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const recommendations: AIRecommendation[] = [];
    const warnings: DrugWarning[] = [];
    
    // Check for drug interactions
    for (let i = 0; i < prescription.items.length; i++) {
      for (let j = i + 1; j < prescription.items.length; j++) {
        const med1 = prescription.items[i].medicine;
        const med2 = prescription.items[j].medicine;
        
        // Simulate interaction detection
        if (med1.interactions.some(interaction => 
          med2.name.includes(interaction) || med2.genericName.includes(interaction)
        )) {
          warnings.push({
            id: `warning-${Date.now()}-${i}-${j}`,
            type: 'interaction',
            severity: 'medium',
            medicines: [med1.name, med2.name],
            description: `${med1.name} এবং ${med2.name} এর মধ্যে ইন্টারঅ্যাকশন হতে পারে`,
            recommendation: 'ডোজ সমন্বয় করুন বা বিকল্প ওষুধ বিবেচনা করুন'
          });
        }
      }
    }
    
    // Check allergies
    if (selectedPatient) {
      prescription.items.forEach(item => {
        selectedPatient.allergies.forEach(allergy => {
          if (item.medicine.name.includes(allergy) || 
              item.medicine.genericName.includes(allergy) ||
              item.medicine.category.includes(allergy)) {
            warnings.push({
              id: `allergy-${Date.now()}-${item.id}`,
              type: 'allergy',
              severity: 'critical',
              medicines: [item.medicine.name],
              description: `রোগীর ${allergy} এলার্জি রয়েছে`,
              recommendation: 'এই ওষুধ ব্যবহার করবেন না, বিকল্প খুঁজুন'
            });
          }
        });
      });
    }
    
    // Generate dosage recommendations
    prescription.items.forEach(item => {
      if (selectedPatient) {
        // Age-based dosage adjustment
        if (selectedPatient.age > 65) {
          recommendations.push({
            id: `dosage-${Date.now()}-${item.id}`,
            type: 'dosage',
            severity: 'warning',
            title: 'বয়স্ক রোগীর জন্য ডোজ সমন্বয়',
            description: `${item.medicine.name} এর ডোজ কমানো প্রয়োজন হতে পারে`,
            suggestion: 'স্ট্যান্ডার্ড ডোজের ৫০-৭৫% ব্যবহার করুন',
            confidence: 85,
            source: 'Geriatric Dosing Guidelines'
          });
        }
        
        // Weight-based dosage
        if (selectedPatient.weight < 50) {
          recommendations.push({
            id: `weight-${Date.now()}-${item.id}`,
            type: 'dosage',
            severity: 'info',
            title: 'ওজন অনুযায়ী ডোজ সমন্বয়',
            description: `কম ওজনের জন্য ${item.medicine.name} এর ডোজ সমন্বয় করুন`,
            suggestion: 'ওজন অনুপাতে ডোজ গণনা করুন',
            confidence: 90,
            source: 'Weight-based Dosing'
          });
        }
      }
    });
    
    // Alternative medicine suggestions
    prescription.items.forEach(item => {
      if (item.medicine.price > 10) {
        const alternatives = availableMedicines.filter(med => 
          med.genericName === item.medicine.genericName && 
          med.id !== item.medicine.id &&
          med.price < item.medicine.price
        );
        
        if (alternatives.length > 0) {
          recommendations.push({
            id: `alternative-${Date.now()}-${item.id}`,
            type: 'alternative',
            severity: 'info',
            title: 'সাশ্রয়ী বিকল্প',
            description: `${item.medicine.name} এর সাশ্রয়ী বিকল্প উপলব্ধ`,
            suggestion: `${alternatives[0].name} ব্যবহার করুন (${alternatives[0].price} টাকা)`,
            confidence: 95,
            source: 'Cost Optimization'
          });
        }
      }
    });
    
    const updatedPrescription = {
      ...prescription,
      aiRecommendations: recommendations,
      warnings: warnings
    };
    
    setCurrentPrescription(updatedPrescription);
    setAiProcessing(false);
    
    if (warnings.length > 0) {
      showNotification(`${warnings.length}টি সতর্কতা পাওয়া গেছে`, 'warning');
    }
  };

  // Finalize prescription
  const finalizePrescription = () => {
    if (!currentPrescription) return;
    
    const finalizedPrescription = {
      ...currentPrescription,
      status: 'finalized' as const
    };
    
    setCurrentPrescription(finalizedPrescription);
    showNotification('প্রেসক্রিপশন চূড়ান্ত করা হয়েছে', 'success');
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'warning': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'low': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  if (!currentPrescription || !selectedPatient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">প্রেসক্রিপশন সিস্টেম লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">এআই প্রেসক্রিপশন সিস্টেম</h1>
                <p className="text-sm text-gray-600">বুদ্ধিমত্তা সহায়তায় প্রেসক্রিপশন লেখা</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {aiProcessing && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <Zap className="w-4 h-4 animate-pulse" />
                  <span className="text-sm">এআই বিশ্লেষণ চলছে...</span>
                </div>
              )}
              
              <button
                onClick={finalizePrescription}
                disabled={currentPrescription.items.length === 0 || currentPrescription.status === 'finalized'}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>চূড়ান্ত করুন</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Info */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedPatient.name}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedPatient.age} বছর • {selectedPatient.gender === 'male' ? 'পুরুষ' : 'মহিলা'} • 
                    {selectedPatient.weight}kg • {selectedPatient.height}cm
                  </p>
                </div>
              </div>
              
              {selectedPatient.allergies.length > 0 && (
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600 font-medium">
                    এলার্জি: {selectedPatient.allergies.join(', ')}
                  </span>
                </div>
              )}
              
              {selectedPatient.chronicConditions.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-600 font-medium">
                    দীর্ঘমেয়াদী রোগ: {selectedPatient.chronicConditions.join(', ')}
                  </span>
                </div>
              )}
            </div>
            
            <div className="text-sm text-gray-600">
              প্রেসক্রিপশন ID: {currentPrescription.id}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'prescription', label: 'প্রেসক্রিপশন', icon: FileText },
              { id: 'recommendations', label: 'এআই সুপারিশ', icon: Brain, count: currentPrescription.aiRecommendations.length },
              { id: 'warnings', label: 'সতর্কতা', icon: AlertTriangle, count: currentPrescription.warnings.length }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tab.id === 'warnings' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'prescription' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Medicine Search & Add */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ওষুধ খুঁজুন ও যোগ করুন</h3>
                
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="ওষুধের নাম লিখুন..."
                    value={medicineSearch}
                    onChange={(e) => setMedicineSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {searchResults.map(medicine => (
                      <div
                        key={medicine.id}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => addMedicineToPrescription(medicine)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{medicine.name}</h4>
                            <p className="text-xs text-gray-600">{medicine.genericName} • {medicine.strength}</p>
                            <p className="text-xs text-gray-500">{medicine.manufacturer}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{medicine.price} ৳</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              medicine.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {medicine.availability ? 'স্টকে আছে' : 'স্টকে নেই'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Current Prescription */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">বর্তমান প্রেসক্রিপশন</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentPrescription.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    currentPrescription.status === 'finalized' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {currentPrescription.status === 'draft' ? 'খসড়া' :
                     currentPrescription.status === 'finalized' ? 'চূড়ান্ত' : 'বিতরণ করা হয়েছে'}
                  </span>
                </div>
                
                {/* Diagnosis & Symptoms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">রোগ নির্ণয়</label>
                    <input
                      type="text"
                      value={currentPrescription.diagnosis}
                      onChange={(e) => setCurrentPrescription(prev => prev ? {...prev, diagnosis: e.target.value} : null)}
                      placeholder="রোগের নাম লিখুন..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">লক্ষণসমূহ</label>
                    <input
                      type="text"
                      placeholder="লক্ষণগুলো কমা দিয়ে আলাদা করুন..."
                      onChange={(e) => {
                        const symptoms = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                        setCurrentPrescription(prev => prev ? {...prev, symptoms} : null);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* Prescription Items */}
                <div className="space-y-4">
                  {currentPrescription.items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p>এখনো কোনো ওষুধ যোগ করা হয়নি</p>
                      <p className="text-sm">বাম দিক থেকে ওষুধ খুঁজে যোগ করুন</p>
                    </div>
                  ) : (
                    currentPrescription.items.map((item, index) => (
                      <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {index + 1}. {item.medicine.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {item.medicine.genericName} • {item.medicine.strength} • {item.medicine.dosageForm}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => removeMedicineFromPrescription(item.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">ডোজ</label>
                            <input
                              type="text"
                              value={item.dosage}
                              onChange={(e) => updatePrescriptionItem(item.id, { dosage: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">ফ্রিকোয়েন্সি</label>
                            <select
                              value={item.frequency}
                              onChange={(e) => updatePrescriptionItem(item.id, { frequency: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="দিনে ১ বার">দিনে ১ বার</option>
                              <option value="দিনে ২ বার">দিনে ২ বার</option>
                              <option value="দিনে ৩ বার">দিনে ৩ বার</option>
                              <option value="দিনে ৪ বার">দিনে ৪ বার</option>
                              <option value="প্রয়োজনে">প্রয়োজনে</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">সময়কাল</label>
                            <select
                              value={item.duration}
                              onChange={(e) => updatePrescriptionItem(item.id, { duration: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="৩ দিন">৩ দিন</option>
                              <option value="৫ দিন">৫ দিন</option>
                              <option value="৭ দিন">৭ দিন</option>
                              <option value="১০ দিন">১০ দিন</option>
                              <option value="১৪ দিন">১৪ দিন</option>
                              <option value="২১ দিন">২১ দিন</option>
                              <option value="৩০ দিন">৩০ দিন</option>
                              <option value="চলমান">চলমান</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">পরিমাণ</label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updatePrescriptionItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">নির্দেশনা</label>
                          <input
                            type="text"
                            value={item.instructions}
                            onChange={(e) => updatePrescriptionItem(item.id, { instructions: e.target.value })}
                            placeholder="সেবনের নির্দেশনা..."
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="mt-2 flex items-center space-x-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={item.beforeFood}
                              onChange={(e) => updatePrescriptionItem(item.id, { beforeFood: e.target.checked })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs text-gray-700">খাবারের আগে</span>
                          </label>
                          
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={item.urgent}
                              onChange={(e) => updatePrescriptionItem(item.id, { urgent: e.target.checked })}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-xs text-gray-700">জরুরি</span>
                          </label>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* General Instructions */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">সাধারণ নির্দেশনা</label>
                  <textarea
                    value={currentPrescription.instructions}
                    onChange={(e) => setCurrentPrescription(prev => prev ? {...prev, instructions: e.target.value} : null)}
                    placeholder="রোগীর জন্য সাধারণ পরামর্শ ও নির্দেশনা..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'recommendations' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">এআই সুপারিশসমূহ</h2>
            
            {currentPrescription.aiRecommendations.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">এখনো কোনো এআই সুপারিশ নেই</p>
                <p className="text-sm text-gray-500">ওষুধ যোগ করলে এআই সুপারিশ পাবেন</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentPrescription.aiRecommendations.map(recommendation => (
                  <div key={recommendation.id} className={`p-4 rounded-lg border-l-4 ${getSeverityColor(recommendation.severity)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{recommendation.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
                        <p className="text-sm font-medium text-gray-800">
                          সুপারিশ: {recommendation.suggestion}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(recommendation.severity)}`}>
                          {recommendation.type === 'dosage' ? 'ডোজ' :
                           recommendation.type === 'alternative' ? 'বিকল্প' :
                           recommendation.type === 'interaction' ? 'ইন্টারঅ্যাকশন' :
                           recommendation.type === 'contraindication' ? 'প্রতিনির্দেশনা' :
                           'অপ্টিমাইজেশন'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          নির্ভরযোগ্যতা: {recommendation.confidence}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>সূত্র: {recommendation.source}</span>
                      <div className="flex items-center space-x-2">
                        <Target className="w-3 h-3" />
                        <span>{recommendation.confidence}% নির্ভুল</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'warnings' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">সতর্কতা ও সাবধানতা</h2>
            
            {currentPrescription.warnings.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-600">কোনো সতর্কতা পাওয়া যায়নি</p>
                <p className="text-sm text-gray-500">বর্তমান প্রেসক্রিপশন নিরাপদ বলে মনে হচ্ছে</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentPrescription.warnings.map(warning => (
                  <div key={warning.id} className={`p-4 rounded-lg border-l-4 ${getSeverityColor(warning.severity)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className={`w-5 h-5 ${
                            warning.severity === 'critical' ? 'text-red-600' :
                            warning.severity === 'high' ? 'text-red-500' :
                            warning.severity === 'medium' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {warning.type === 'interaction' ? 'ড্রাগ ইন্টারঅ্যাকশন' :
                             warning.type === 'allergy' ? 'এলার্জি সতর্কতা' :
                             warning.type === 'contraindication' ? 'প্রতিনির্দেশনা' :
                             warning.type === 'overdose' ? 'অতিরিক্ত ডোজ' :
                             'গর্ভাবস্থা সতর্কতা'}
                          </h3>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{warning.description}</p>
                        <p className="text-sm font-medium text-gray-800">
                          সুপারিশ: {warning.recommendation}
                        </p>
                        
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">প্রভাবিত ওষুধ: </span>
                          <span className="text-xs font-medium text-gray-700">
                            {warning.medicines.join(', ')}
                          </span>
                        </div>
                      </div>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(warning.severity)}`}>
                        {warning.severity === 'critical' ? 'অত্যন্ত গুরুত্বপূর্ণ' :
                         warning.severity === 'high' ? 'উচ্চ' :
                         warning.severity === 'medium' ? 'মাঝারি' : 'নিম্ন'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPrescriptionSystem;