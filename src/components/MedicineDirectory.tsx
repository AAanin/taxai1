import React, { useState, useMemo } from 'react';
import { Search, Filter, Pill, AlertTriangle, CheckCircle, MapPin, Clock, Star, ShoppingCart, Info } from 'lucide-react';
import { Medicine, Language } from '../types';

interface MedicineDirectoryProps {
  language: Language;
}

// Sample medicine data
const sampleMedicines: Medicine[] = [
  {
    id: '1',
    name: 'প্যারাসিটামল',
    nameEn: 'Paracetamol',
    genericName: 'Acetaminophen',
    brandNames: ['Napa', 'Ace', 'Fast'],
    category: 'ব্যথানাশক',
    categoryEn: 'Analgesic',
    uses: ['জ্বর কমানো', 'ব্যথা উপশম', 'মাথাব্যথা'],
    usesEn: ['Fever reduction', 'Pain relief', 'Headache'],
    dosage: {
      adult: '500mg প্রতি 6 ঘন্টায়',
      adultEn: '500mg every 6 hours',
      child: '10-15mg/kg প্রতি 6 ঘন্টায়',
      childEn: '10-15mg/kg every 6 hours',
      maxDaily: '4000mg',
      maxDailyEn: '4000mg'
    },
    sideEffects: ['বমি বমি ভাব', 'পেট খারাপ'],
    sideEffectsEn: ['Nausea', 'Stomach upset'],
    contraindications: ['লিভারের সমস্যা', 'অ্যালকোহল সেবন'],
    contraindicationsEn: ['Liver problems', 'Alcohol consumption'],
    availability: {
      prescription: false,
      pharmacies: ['স্কয়ার ফার্মেসি', 'লাজুর ফার্মেসি', 'এসিআই ফার্মেসি'],
      pharmaciesEn: ['Square Pharmacy', 'Lazz Pharma', 'ACI Pharmacy'],
      price: '2-5 টাকা',
      priceEn: '2-5 BDT',
      inStock: true
    },
    manufacturer: 'স্কয়ার ফার্মাসিউটিক্যালস',
    manufacturerEn: 'Square Pharmaceuticals',
    warnings: ['দৈনিক সর্বোচ্চ ডোজ অতিক্রম করবেন না'],
    warningsEn: ['Do not exceed maximum daily dose']
  },
  {
    id: '2',
    name: 'অ্যামোক্সিসিলিন',
    nameEn: 'Amoxicillin',
    genericName: 'Amoxicillin',
    brandNames: ['Amoxil', 'Novamox', 'Polymox'],
    category: 'অ্যান্টিবায়োটিক',
    categoryEn: 'Antibiotic',
    uses: ['ব্যাকটেরিয়াল সংক্রমণ', 'শ্বাসযন্ত্রের সংক্রমণ', 'মূত্রনালীর সংক্রমণ'],
    usesEn: ['Bacterial infections', 'Respiratory infections', 'Urinary tract infections'],
    dosage: {
      adult: '500mg প্রতি 8 ঘন্টায়',
      adultEn: '500mg every 8 hours',
      child: '20-40mg/kg দৈনিক 3 ভাগে',
      childEn: '20-40mg/kg daily in 3 divided doses',
      maxDaily: '3000mg',
      maxDailyEn: '3000mg'
    },
    sideEffects: ['ডায়রিয়া', 'বমি', 'র‍্যাশ'],
    sideEffectsEn: ['Diarrhea', 'Vomiting', 'Rash'],
    contraindications: ['পেনিসিলিন অ্যালার্জি'],
    contraindicationsEn: ['Penicillin allergy'],
    availability: {
      prescription: true,
      pharmacies: ['স্কয়ার ফার্মেসি', 'ইনসেপ্টা ফার্মেসি'],
      pharmaciesEn: ['Square Pharmacy', 'Incepta Pharmacy'],
      price: '50-80 টাকা',
      priceEn: '50-80 BDT',
      inStock: true
    },
    manufacturer: 'ইনসেপ্টা ফার্মাসিউটিক্যালস',
    manufacturerEn: 'Incepta Pharmaceuticals',
    warnings: ['সম্পূর্ণ কোর্স শেষ করুন', 'ডাক্তারের পরামর্শ ছাড়া বন্ধ করবেন না'],
    warningsEn: ['Complete the full course', 'Do not stop without doctor advice']
  },
  {
    id: '3',
    name: 'ওমিপ্রাজল',
    nameEn: 'Omeprazole',
    genericName: 'Omeprazole',
    brandNames: ['Losec', 'Prilosec', 'Zegerid'],
    category: 'গ্যাস্ট্রিক',
    categoryEn: 'Gastric',
    uses: ['পেপটিক আলসার', 'গ্যাস্ট্রিক', 'অম্লতা'],
    usesEn: ['Peptic ulcer', 'Gastric problems', 'Acidity'],
    dosage: {
      adult: '20mg দৈনিক একবার',
      adultEn: '20mg once daily',
      child: '1mg/kg দৈনিক',
      childEn: '1mg/kg daily',
      maxDaily: '40mg',
      maxDailyEn: '40mg'
    },
    sideEffects: ['মাথাব্যথা', 'ডায়রিয়া', 'পেট ব্যথা'],
    sideEffectsEn: ['Headache', 'Diarrhea', 'Stomach pain'],
    contraindications: ['লিভারের গুরুতর সমস্যা'],
    contraindicationsEn: ['Severe liver problems'],
    availability: {
      prescription: true,
      pharmacies: ['এসিআই ফার্মেসি', 'বেক্সিমকো ফার্মেসি'],
      pharmaciesEn: ['ACI Pharmacy', 'Beximco Pharmacy'],
      price: '8-15 টাকা',
      priceEn: '8-15 BDT',
      inStock: true
    },
    manufacturer: 'এসিআই লিমিটেড',
    manufacturerEn: 'ACI Limited',
    warnings: ['খালি পেটে সেবন করুন'],
    warningsEn: ['Take on empty stomach']
  },
  {
    id: '4',
    name: 'মেটফরমিন',
    nameEn: 'Metformin',
    genericName: 'Metformin HCl',
    brandNames: ['Glucophage', 'Diabex', 'Metfo'],
    category: 'ডায়াবেটিস',
    categoryEn: 'Diabetes',
    uses: ['টাইপ ২ ডায়াবেটিস', 'রক্তে চিনির মাত্রা নিয়ন্ত্রণ'],
    usesEn: ['Type 2 diabetes', 'Blood sugar control'],
    dosage: {
      adult: '500mg দৈনিক দুইবার',
      adultEn: '500mg twice daily',
      child: 'শিশুদের জন্য প্রযোজ্য নয়',
      childEn: 'Not applicable for children',
      maxDaily: '2000mg',
      maxDailyEn: '2000mg'
    },
    sideEffects: ['বমি বমি ভাব', 'ডায়রিয়া', 'পেটে গ্যাস'],
    sideEffectsEn: ['Nausea', 'Diarrhea', 'Stomach gas'],
    contraindications: ['কিডনির সমস্যা', 'হার্টের সমস্যা'],
    contraindicationsEn: ['Kidney problems', 'Heart problems'],
    availability: {
      prescription: true,
      pharmacies: ['স্কয়ার ফার্মেসি', 'ইনসেপ্টা ফার্মেসি', 'এসিআই ফার্মেসি'],
      pharmaciesEn: ['Square Pharmacy', 'Incepta Pharmacy', 'ACI Pharmacy'],
      price: '3-8 টাকা',
      priceEn: '3-8 BDT',
      inStock: true
    },
    manufacturer: 'স্কয়ার ফার্মাসিউটিক্যালস',
    manufacturerEn: 'Square Pharmaceuticals',
    warnings: ['খাবারের সাথে সেবন করুন', 'নিয়মিত রক্ত পরীক্ষা করান'],
    warningsEn: ['Take with food', 'Regular blood tests required']
  },
  {
    id: '5',
    name: 'সিপ্রোফ্লক্সাসিন',
    nameEn: 'Ciprofloxacin',
    genericName: 'Ciprofloxacin HCl',
    brandNames: ['Cipro', 'Ciproxin', 'Ciplox'],
    category: 'অ্যান্টিবায়োটিক',
    categoryEn: 'Antibiotic',
    uses: ['মূত্রনালীর সংক্রমণ', 'শ্বাসযন্ত্রের সংক্রমণ', 'চর্মরোগ'],
    usesEn: ['Urinary tract infections', 'Respiratory infections', 'Skin infections'],
    dosage: {
      adult: '500mg প্রতি 12 ঘন্টায়',
      adultEn: '500mg every 12 hours',
      child: '10-20mg/kg প্রতি 12 ঘন্টায়',
      childEn: '10-20mg/kg every 12 hours',
      maxDaily: '1500mg',
      maxDailyEn: '1500mg'
    },
    sideEffects: ['বমি বমি ভাব', 'মাথা ঘোরা', 'ডায়রিয়া'],
    sideEffectsEn: ['Nausea', 'Dizziness', 'Diarrhea'],
    contraindications: ['গর্ভাবস্থা', 'স্তন্যদান'],
    contraindicationsEn: ['Pregnancy', 'Breastfeeding'],
    availability: {
      prescription: true,
      pharmacies: ['বেক্সিমকো ফার্মেসি', 'এসিআই ফার্মেসি'],
      pharmaciesEn: ['Beximco Pharmacy', 'ACI Pharmacy'],
      price: '15-25 টাকা',
      priceEn: '15-25 BDT',
      inStock: false
    },
    manufacturer: 'বেক্সিমকো ফার্মাসিউটিক্যালস',
    manufacturerEn: 'Beximco Pharmaceuticals',
    warnings: ['সূর্যের আলো এড়িয়ে চলুন', 'দুধ ও দুগ্ধজাত খাবার এড়িয়ে চলুন'],
    warningsEn: ['Avoid sunlight', 'Avoid dairy products']
  }
];

const MedicineDirectory: React.FC<MedicineDirectoryProps> = ({ language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [prescriptionFilter, setPrescriptionFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(() => {
    const cats = sampleMedicines.map(med => language === 'bn' ? med.category : med.categoryEn);
    return [...new Set(cats)];
  }, [language]);

  const filteredMedicines = useMemo(() => {
    return sampleMedicines.filter(medicine => {
      const nameMatch = (language === 'bn' ? medicine.name : medicine.nameEn)
        .toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.brandNames.some(brand => brand.toLowerCase().includes(searchTerm.toLowerCase()));

      const categoryMatch = !selectedCategory || 
        (language === 'bn' ? medicine.category : medicine.categoryEn) === selectedCategory;

      const prescriptionMatch = !prescriptionFilter || 
        (prescriptionFilter === 'prescription' && medicine.availability.prescription) ||
        (prescriptionFilter === 'otc' && !medicine.availability.prescription);

      const availabilityMatch = !availabilityFilter ||
        (availabilityFilter === 'available' && medicine.availability.inStock) ||
        (availabilityFilter === 'unavailable' && !medicine.availability.inStock);

      return nameMatch && categoryMatch && prescriptionMatch && availabilityMatch;
    });
  }, [searchTerm, selectedCategory, prescriptionFilter, availabilityFilter, language]);

  const MedicineCard: React.FC<{ medicine: Medicine }> = ({ medicine }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-1">
            {language === 'bn' ? medicine.name : medicine.nameEn}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {language === 'bn' ? 'জেনেরিক:' : 'Generic:'} {medicine.genericName}
          </p>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              language === 'bn' ? medicine.category : medicine.categoryEn === 'অ্যান্টিবায়োটিক' || medicine.categoryEn === 'Antibiotic'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {language === 'bn' ? medicine.category : medicine.categoryEn}
            </span>
            {medicine.availability.prescription ? (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                {language === 'bn' ? 'প্রেসক্রিপশন প্রয়োজন' : 'Prescription Required'}
              </span>
            ) : (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                {language === 'bn' ? 'প্রেসক্রিপশন ছাড়াই' : 'Over the Counter'}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {medicine.availability.inStock ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-red-500" />
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-gray-700 mb-1">
            {language === 'bn' ? 'ব্যবহার:' : 'Uses:'}
          </h4>
          <div className="flex flex-wrap gap-1">
            {(language === 'bn' ? medicine.uses : medicine.usesEn).slice(0, 3).map((use, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                {use}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">
              {language === 'bn' ? 'প্রাপ্যতা:' : 'Availability:'}
            </span>
            <p className={`${medicine.availability.inStock ? 'text-green-600' : 'text-red-600'}`}>
              {medicine.availability.inStock 
                ? (language === 'bn' ? 'স্টকে আছে' : 'In Stock')
                : (language === 'bn' ? 'স্টকে নেই' : 'Out of Stock')
              }
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">
              {language === 'bn' ? 'দাম:' : 'Price:'}
            </span>
            <p className="text-green-600 font-medium">
              {language === 'bn' ? medicine.availability.price : medicine.availability.priceEn}
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => setSelectedMedicine(medicine)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Info className="w-4 h-4" />
            {language === 'bn' ? 'বিস্তারিত' : 'Details'}
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4" />
            {language === 'bn' ? 'ফার্মেসি' : 'Pharmacy'}
          </button>
        </div>
      </div>
    </div>
  );

  const MedicineDetailModal: React.FC<{ medicine: Medicine }> = ({ medicine }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {language === 'bn' ? medicine.name : medicine.nameEn}
          </h2>
          <button
            onClick={() => setSelectedMedicine(null)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {language === 'bn' ? 'মৌলিক তথ্য' : 'Basic Information'}
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>{language === 'bn' ? 'জেনেরিক নাম:' : 'Generic Name:'}</strong> {medicine.genericName}</p>
                  <p><strong>{language === 'bn' ? 'ব্র্যান্ড নাম:' : 'Brand Names:'}</strong> {medicine.brandNames.join(', ')}</p>
                  <p><strong>{language === 'bn' ? 'ক্যাটেগরি:' : 'Category:'}</strong> {language === 'bn' ? medicine.category : medicine.categoryEn}</p>
                  <p><strong>{language === 'bn' ? 'প্রস্তুতকারক:' : 'Manufacturer:'}</strong> {language === 'bn' ? medicine.manufacturer : medicine.manufacturerEn}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {language === 'bn' ? 'ব্যবহার' : 'Uses'}
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {(language === 'bn' ? medicine.uses : medicine.usesEn).map((use, index) => (
                    <li key={index}>{use}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {language === 'bn' ? 'ডোজ' : 'Dosage'}
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>{language === 'bn' ? 'প্রাপ্তবয়স্ক:' : 'Adult:'}</strong> {language === 'bn' ? medicine.dosage.adult : medicine.dosage.adultEn}</p>
                  <p><strong>{language === 'bn' ? 'শিশু:' : 'Child:'}</strong> {language === 'bn' ? medicine.dosage.child : medicine.dosage.childEn}</p>
                  <p><strong>{language === 'bn' ? 'দৈনিক সর্বোচ্চ:' : 'Max Daily:'}</strong> {language === 'bn' ? medicine.dosage.maxDaily : medicine.dosage.maxDailyEn}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {language === 'bn' ? 'প্রাপ্যতা' : 'Availability'}
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>{language === 'bn' ? 'প্রেসক্রিপশন:' : 'Prescription:'}</strong> 
                    <span className={medicine.availability.prescription ? 'text-orange-600' : 'text-green-600'}>
                      {medicine.availability.prescription 
                        ? (language === 'bn' ? ' প্রয়োজন' : ' Required')
                        : (language === 'bn' ? ' প্রয়োজন নেই' : ' Not Required')
                      }
                    </span>
                  </p>
                  <p><strong>{language === 'bn' ? 'দাম:' : 'Price:'}</strong> 
                    <span className="text-green-600 font-medium">
                      {language === 'bn' ? medicine.availability.price : medicine.availability.priceEn}
                    </span>
                  </p>
                  <p><strong>{language === 'bn' ? 'স্টক:' : 'Stock:'}</strong> 
                    <span className={medicine.availability.inStock ? 'text-green-600' : 'text-red-600'}>
                      {medicine.availability.inStock 
                        ? (language === 'bn' ? ' উপলব্ধ' : ' Available')
                        : (language === 'bn' ? ' অনুপলব্ধ' : ' Unavailable')
                      }
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Side Effects & Warnings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {language === 'bn' ? 'পার্শ্বপ্রতিক্রিয়া' : 'Side Effects'}
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {(language === 'bn' ? medicine.sideEffects : medicine.sideEffectsEn).map((effect, index) => (
                  <li key={index}>{effect}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {language === 'bn' ? 'প্রতিনির্দেশনা' : 'Contraindications'}
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {(language === 'bn' ? medicine.contraindications : medicine.contraindicationsEn).map((contra, index) => (
                  <li key={index}>{contra}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Warnings */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {language === 'bn' ? 'সতর্কতা' : 'Warnings'}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
              {(language === 'bn' ? medicine.warnings : medicine.warningsEn).map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>

          {/* Pharmacies */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {language === 'bn' ? 'উপলব্ধ ফার্মেসি' : 'Available Pharmacies'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(language === 'bn' ? medicine.availability.pharmacies : medicine.availability.pharmaciesEn).map((pharmacy, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">{pharmacy}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {language === 'bn' ? 'মেডিসিন ডিরেক্টরি' : 'Medicine Directory'}
        </h1>
        <p className="text-gray-600">
          {language === 'bn' 
            ? 'ওষুধের সম্পূর্ণ তথ্য, ডোজ, পার্শ্বপ্রতিক্রিয়া এবং প্রাপ্যতা জানুন'
            : 'Complete information about medicines, dosage, side effects and availability'
          }
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-gradient-to-br from-white via-green-50 to-emerald-50 rounded-2xl shadow-xl border border-green-100 p-8 mb-8">
        <div className="flex flex-col gap-6">
          <div className="flex-1">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400 group-focus-within:text-green-600 transition-colors w-5 h-5" />
              <input
                type="text"
                placeholder={language === 'bn' ? 'ওষুধের নাম, জেনেরিক বা ব্র্যান্ড নাম খুঁজুন...' : 'Search by medicine name, generic or brand name...'}
                className="w-full pl-12 pr-4 py-4 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl text-gray-700 placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filter Options - Always Visible */}
        <div className="mt-6 pt-6 border-t-2 border-green-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-green-600" />
            {language === 'bn' ? 'ফিল্টার অপশন' : 'Filter Options'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Pill className="w-4 h-4 text-green-600" />
                {language === 'bn' ? 'ক্যাটেগরি' : 'Category'}
              </label>
              <select
                className="w-full p-3 border-2 border-green-200 rounded-lg focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg text-gray-700"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">{language === 'bn' ? 'সব ক্যাটেগরি' : 'All Categories'}</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                {language === 'bn' ? 'প্রেসক্রিপশন' : 'Prescription'}
              </label>
              <select
                className="w-full p-3 border-2 border-green-200 rounded-lg focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg text-gray-700"
                value={prescriptionFilter}
                onChange={(e) => setPrescriptionFilter(e.target.value)}
              >
                <option value="">{language === 'bn' ? 'সব ধরনের' : 'All Types'}</option>
                <option value="prescription">{language === 'bn' ? 'প্রেসক্রিপশন প্রয়োজন' : 'Prescription Required'}</option>
                <option value="otc">{language === 'bn' ? 'প্রেসক্রিপশন ছাড়াই' : 'Over the Counter'}</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                {language === 'bn' ? 'প্রাপ্যতা' : 'Availability'}
              </label>
              <select
                className="w-full p-3 border-2 border-green-200 rounded-lg focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg text-gray-700"
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
              >
                <option value="">{language === 'bn' ? 'সব ধরনের' : 'All Types'}</option>
                <option value="available">{language === 'bn' ? 'স্টকে আছে' : 'In Stock'}</option>
                <option value="unavailable">{language === 'bn' ? 'স্টকে নেই' : 'Out of Stock'}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-600">
          {language === 'bn' 
            ? `${filteredMedicines.length}টি ওষুধ পাওয়া গেছে`
            : `${filteredMedicines.length} medicines found`
          }
        </p>
      </div>

      {/* Medicine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedicines.map((medicine) => (
          <MedicineCard key={medicine.id} medicine={medicine} />
        ))}
      </div>

      {filteredMedicines.length === 0 && (
        <div className="text-center py-12">
          <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            {language === 'bn' ? 'কোনো ওষুধ পাওয়া যায়নি' : 'No medicines found'}
          </h3>
          <p className="text-gray-400">
            {language === 'bn' 
              ? 'অন্য কিওয়ার্ড দিয়ে খোঁজ করুন বা ফিল্টার পরিবর্তন করুন'
              : 'Try different keywords or change filters'
            }
          </p>
        </div>
      )}

      {/* Medicine Detail Modal */}
      {selectedMedicine && (
        <MedicineDetailModal medicine={selectedMedicine} />
      )}
    </div>
  );
};

export default MedicineDirectory;