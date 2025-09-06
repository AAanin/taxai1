import React, { useState } from 'react';
import { Building2, Phone, MapPin, Clock, AlertTriangle, Heart, Thermometer, Shield } from 'lucide-react';
import { Language } from '../types';
import { bangladeshMedicalData } from '../data/bangladeshMedicalData';

interface BangladeshMedicalInfoProps {
  language: Language;
  onClose: () => void;
}

const BangladeshMedicalInfo: React.FC<BangladeshMedicalInfoProps> = ({ language, onClose }) => {
  const [activeTab, setActiveTab] = useState<'hospitals' | 'emergency' | 'diseases' | 'medicines' | 'tips'>('hospitals');
  const data = bangladeshMedicalData[language];

  const texts = {
    bn: {
      title: 'বাংলাদেশের চিকিৎসা তথ্য',
      hospitals: 'হাসপাতাল',
      emergency: 'জরুরি নম্বর',
      diseases: 'সাধারণ রোগ',
      medicines: 'ওষুধ',
      healthTips: 'স্বাস্থ্য টিপস',
      close: 'বন্ধ করুন',
      location: 'ঠিকানা',
      contact: 'যোগাযোগ',
      symptoms: 'লক্ষণ',
      treatment: 'চিকিৎসা',
      uses: 'ব্যবহার',
      dosage: 'মাত্রা',
      sideEffects: 'পার্শ্বপ্রতিক্রিয়া',
      season: 'ঋতু',
      tips: 'টিপস'
    },
    en: {
      title: 'Bangladesh Medical Information',
      hospitals: 'Hospitals',
      emergency: 'Emergency Numbers',
      diseases: 'Common Diseases',
      medicines: 'Medicines',
      healthTips: 'Health Tips',
      close: 'Close',
      location: 'Location',
      contact: 'Contact',
      symptoms: 'Symptoms',
      treatment: 'Treatment',
      uses: 'Uses',
      dosage: 'Dosage',
      sideEffects: 'Side Effects',
      season: 'Season',
      tips: 'Tips'
    }
  };

  const t = texts[language];

  const TabButton = ({ id, icon: Icon, label }: { id: string; icon: any; label: string }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
        activeTab === id
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className={`text-sm ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-bold text-gray-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
              {t.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <TabButton id="hospitals" icon={Building2} label={t.hospitals} />
            <TabButton id="emergency" icon={Phone} label={t.emergency} />
            <TabButton id="diseases" icon={AlertTriangle} label={t.diseases} />
            <TabButton id="medicines" icon={Heart} label={t.medicines} />
            <TabButton id="tips" icon={Shield} label={t.healthTips} />
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'hospitals' && (
            <div className="grid gap-4">
              {data.hospitals.map((hospital, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className={`font-bold text-lg text-gray-800 mb-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {hospital.name}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                      <span className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {hospital.location}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">{hospital.contact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'emergency' && (
            <div className="grid gap-4">
              {data.emergencyNumbers.map((emergency, index) => (
                <div key={index} className="border rounded-lg p-4 bg-red-50 border-red-200">
                  <h3 className={`font-bold text-lg text-red-800 mb-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {emergency.service}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-5 h-5 text-red-600" />
                    <span className="text-xl font-bold text-red-600">{emergency.number}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'diseases' && (
            <div className="grid gap-4">
              {data.commonDiseases.map((disease, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className={`font-bold text-lg text-gray-800 mb-3 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {disease.name}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className={`font-semibold text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {t.symptoms}:
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {disease.symptoms.map((symptom, idx) => (
                          <li key={idx} className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                            {symptom}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className={`font-semibold text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {t.treatment}:
                      </h4>
                      <p className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {disease.treatment}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'medicines' && (
            <div className="grid gap-4">
              {data.commonMedicines.map((medicine, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className={`font-bold text-lg text-gray-800 mb-3 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {medicine.name}
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className={`font-semibold text-gray-700 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {t.uses}: 
                      </span>
                      <span className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {medicine.uses}
                      </span>
                    </div>
                    <div>
                      <span className={`font-semibold text-gray-700 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {t.dosage}: 
                      </span>
                      <span className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {medicine.dosage}
                      </span>
                    </div>
                    <div>
                      <span className={`font-semibold text-gray-700 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {t.sideEffects}: 
                      </span>
                      <span className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {medicine.sideEffects}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="grid gap-4">
              {data.healthTips.map((tip, index) => (
                <div key={index} className="border rounded-lg p-4 bg-green-50 border-green-200">
                  <h3 className={`font-bold text-lg text-green-800 mb-3 flex items-center space-x-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    <Thermometer className="w-5 h-5" />
                    <span>{tip.season}</span>
                  </h3>
                  <ul className="space-y-2">
                    {tip.tips.map((tipItem, idx) => (
                      <li key={idx} className={`text-green-700 flex items-start space-x-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        <span className="text-green-500 mt-1">•</span>
                        <span>{tipItem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className={`w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors duration-200 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BangladeshMedicalInfo;