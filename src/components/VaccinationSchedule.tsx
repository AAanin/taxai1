import React, { useState, useEffect } from 'react';
import { Shield, Calendar, Clock, CheckCircle, AlertCircle, Plus, X, Baby, User } from 'lucide-react';
import { Language } from '../types';

interface VaccineRecord {
  id: string;
  vaccineName: string;
  dateGiven: string;
  nextDue?: string;
  ageGiven: string;
  location: string;
  notes?: string;
  status: 'completed' | 'pending' | 'overdue';
}

interface VaccineSchedule {
  name: string;
  ageGroup: string;
  description: string;
  doses: number;
  interval?: string;
  mandatory: boolean;
  category: 'child' | 'adult' | 'covid' | 'seasonal';
}

interface VaccinationScheduleProps {
  language: Language;
  onClose: () => void;
}

const VaccinationSchedule: React.FC<VaccinationScheduleProps> = ({ language, onClose }) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'records' | 'reminders'>('schedule');
  const [selectedCategory, setSelectedCategory] = useState<'child' | 'adult' | 'covid' | 'seasonal'>('child');
  const [vaccineRecords, setVaccineRecords] = useState<VaccineRecord[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    vaccineName: '',
    dateGiven: '',
    nextDue: '',
    ageGiven: '',
    location: '',
    notes: ''
  });

  // Load vaccine records from localStorage
  useEffect(() => {
    const savedRecords = localStorage.getItem('vaccineRecords');
    if (savedRecords) {
      setVaccineRecords(JSON.parse(savedRecords));
    }
  }, []);

  // Save vaccine records to localStorage
  const saveRecords = (records: VaccineRecord[]) => {
    localStorage.setItem('vaccineRecords', JSON.stringify(records));
    setVaccineRecords(records);
  };

  const texts = {
    bn: {
      title: 'টিকাদান সূচি',
      schedule: 'টিকার সূচি',
      records: 'টিকার রেকর্ড',
      reminders: 'রিমাইন্ডার',
      childVaccines: 'শিশু টিকা',
      adultVaccines: 'প্রাপ্তবয়স্ক টিকা',
      covidVaccines: 'কোভিড টিকা',
      seasonalVaccines: 'মৌসুমি টিকা',
      addRecord: 'রেকর্ড যোগ করুন',
      vaccineName: 'টিকার নাম',
      dateGiven: 'প্রদানের তারিখ',
      nextDue: 'পরবর্তী ডোজ',
      ageGiven: 'বয়স',
      location: 'স্থান',
      notes: 'নোট',
      save: 'সংরক্ষণ',
      cancel: 'বাতিল',
      close: 'বন্ধ',
      mandatory: 'বাধ্যতামূলক',
      optional: 'ঐচ্ছিক',
      completed: 'সম্পন্ন',
      pending: 'বাকি',
      overdue: 'বিলম্বিত',
      doses: 'ডোজ',
      interval: 'ব্যবধান',
      noRecords: 'কোন টিকার রেকর্ড নেই',
      addFirst: 'প্রথম টিকার রেকর্ড যোগ করুন',
      upcomingVaccines: 'আসন্ন টিকা',
      overdueVaccines: 'বিলম্বিত টিকা',
      vaccineInfo: 'টিকার তথ্য',
      ageGroup: 'বয়সের গ্রুপ',
      description: 'বিবরণ',
      birthTo6Weeks: 'জন্ম থেকে ৬ সপ্তাহ',
      weeks6To10: '৬-১০ সপ্তাহ',
      weeks10To14: '১০-১৪ সপ্তাহ',
      months9To15: '৯-১৫ মাস',
      years18Plus: '১৮+ বছর',
      annually: 'বার্ষিক',
      every10Years: 'প্রতি ১০ বছর'
    },
    en: {
      title: 'Vaccination Schedule',
      schedule: 'Schedule',
      records: 'Records',
      reminders: 'Reminders',
      childVaccines: 'Child Vaccines',
      adultVaccines: 'Adult Vaccines',
      covidVaccines: 'COVID Vaccines',
      seasonalVaccines: 'Seasonal Vaccines',
      addRecord: 'Add Record',
      vaccineName: 'Vaccine Name',
      dateGiven: 'Date Given',
      nextDue: 'Next Due',
      ageGiven: 'Age Given',
      location: 'Location',
      notes: 'Notes',
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      mandatory: 'Mandatory',
      optional: 'Optional',
      completed: 'Completed',
      pending: 'Pending',
      overdue: 'Overdue',
      doses: 'Doses',
      interval: 'Interval',
      noRecords: 'No vaccine records',
      addFirst: 'Add your first vaccine record',
      upcomingVaccines: 'Upcoming Vaccines',
      overdueVaccines: 'Overdue Vaccines',
      vaccineInfo: 'Vaccine Information',
      ageGroup: 'Age Group',
      description: 'Description',
      birthTo6Weeks: 'Birth to 6 weeks',
      weeks6To10: '6-10 weeks',
      weeks10To14: '10-14 weeks',
      months9To15: '9-15 months',
      years18Plus: '18+ years',
      annually: 'Annually',
      every10Years: 'Every 10 years'
    }
  };

  const t = texts[language];

  // Bangladesh Vaccination Schedule
  const vaccineSchedules: VaccineSchedule[] = [
    // Child Vaccines
    {
      name: language === 'bn' ? 'বিসিজি (BCG)' : 'BCG',
      ageGroup: t.birthTo6Weeks,
      description: language === 'bn' ? 'যক্ষ্মা প্রতিরোধের জন্য' : 'Protection against tuberculosis',
      doses: 1,
      mandatory: true,
      category: 'child'
    },
    {
      name: language === 'bn' ? 'পোলিও (OPV)' : 'Polio (OPV)',
      ageGroup: t.weeks6To10,
      description: language === 'bn' ? 'পোলিও প্রতিরোধের জন্য' : 'Protection against polio',
      doses: 4,
      interval: language === 'bn' ? '৪ সপ্তাহ ব্যবধানে' : '4 weeks apart',
      mandatory: true,
      category: 'child'
    },
    {
      name: language === 'bn' ? 'পেন্টাভ্যালেন্ট' : 'Pentavalent',
      ageGroup: t.weeks6To10,
      description: language === 'bn' ? 'ডিপথেরিয়া, হুপিং কাশি, ধনুষ্টংকার, হেপাটাইটিস বি ও হিব' : 'DPT, Hepatitis B, and Hib',
      doses: 3,
      interval: language === 'bn' ? '৪ সপ্তাহ ব্যবধানে' : '4 weeks apart',
      mandatory: true,
      category: 'child'
    },
    {
      name: language === 'bn' ? 'নিউমোকক্কাল (PCV)' : 'Pneumococcal (PCV)',
      ageGroup: t.weeks6To10,
      description: language === 'bn' ? 'নিউমোনিয়া ও মেনিনজাইটিস প্রতিরোধ' : 'Protection against pneumonia and meningitis',
      doses: 3,
      interval: language === 'bn' ? '৪ সপ্তাহ ব্যবধানে' : '4 weeks apart',
      mandatory: true,
      category: 'child'
    },
    {
      name: language === 'bn' ? 'হাম-রুবেলা (MR)' : 'Measles-Rubella (MR)',
      ageGroup: t.months9To15,
      description: language === 'bn' ? 'হাম ও রুবেলা প্রতিরোধ' : 'Protection against measles and rubella',
      doses: 2,
      interval: language === 'bn' ? '৬ মাস ব্যবধানে' : '6 months apart',
      mandatory: true,
      category: 'child'
    },
    
    // Adult Vaccines
    {
      name: language === 'bn' ? 'ইনফ্লুয়েঞ্জা' : 'Influenza',
      ageGroup: t.years18Plus,
      description: language === 'bn' ? 'মৌসুমি ফ্লু প্রতিরোধ' : 'Protection against seasonal flu',
      doses: 1,
      interval: t.annually,
      mandatory: false,
      category: 'seasonal'
    },
    {
      name: language === 'bn' ? 'টিটেনাস-ডিপথেরিয়া (Td)' : 'Tetanus-Diphtheria (Td)',
      ageGroup: t.years18Plus,
      description: language === 'bn' ? 'ধনুষ্টংকার ও ডিপথেরিয়া প্রতিরোধ' : 'Protection against tetanus and diphtheria',
      doses: 1,
      interval: t.every10Years,
      mandatory: true,
      category: 'adult'
    },
    {
      name: language === 'bn' ? 'হেপাটাইটিস বি' : 'Hepatitis B',
      ageGroup: t.years18Plus,
      description: language === 'bn' ? 'হেপাটাইটিস বি প্রতিরোধ' : 'Protection against Hepatitis B',
      doses: 3,
      interval: language === 'bn' ? '০, ১, ৬ মাস' : '0, 1, 6 months',
      mandatory: false,
      category: 'adult'
    },
    
    // COVID Vaccines
    {
      name: language === 'bn' ? 'কোভিড-১৯ (প্রাথমিক)' : 'COVID-19 (Primary)',
      ageGroup: language === 'bn' ? '১২+ বছর' : '12+ years',
      description: language === 'bn' ? 'কোভিড-১৯ প্রতিরোধের প্রাথমিক ডোজ' : 'Primary COVID-19 protection',
      doses: 2,
      interval: language === 'bn' ? '৪-৮ সপ্তাহ ব্যবধানে' : '4-8 weeks apart',
      mandatory: true,
      category: 'covid'
    },
    {
      name: language === 'bn' ? 'কোভিড-১৯ (বুস্টার)' : 'COVID-19 (Booster)',
      ageGroup: language === 'bn' ? '১৮+ বছর' : '18+ years',
      description: language === 'bn' ? 'কোভিড-১৯ বুস্টার ডোজ' : 'COVID-19 booster dose',
      doses: 1,
      interval: language === 'bn' ? '৬ মাস পর' : 'After 6 months',
      mandatory: false,
      category: 'covid'
    }
  ];

  const filteredSchedules = vaccineSchedules.filter(vaccine => vaccine.category === selectedCategory);

  const handleAddRecord = () => {
    if (formData.vaccineName && formData.dateGiven) {
      const newRecord: VaccineRecord = {
        id: Date.now().toString(),
        vaccineName: formData.vaccineName,
        dateGiven: formData.dateGiven,
        nextDue: formData.nextDue,
        ageGiven: formData.ageGiven,
        location: formData.location,
        notes: formData.notes,
        status: formData.nextDue && new Date(formData.nextDue) < new Date() ? 'overdue' : 'completed'
      };
      saveRecords([...vaccineRecords, newRecord]);
      setFormData({
        vaccineName: '',
        dateGiven: '',
        nextDue: '',
        ageGiven: '',
        location: '',
        notes: ''
      });
      setShowAddForm(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUpcomingVaccines = () => {
    return vaccineRecords.filter(record => 
      record.nextDue && new Date(record.nextDue) > new Date()
    ).sort((a, b) => new Date(a.nextDue!).getTime() - new Date(b.nextDue!).getTime());
  };

  const getOverdueVaccines = () => {
    return vaccineRecords.filter(record => 
      record.nextDue && new Date(record.nextDue) < new Date()
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-blue-500" />
            <h2 className={`text-xl font-bold text-gray-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
              {t.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'schedule'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            } ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
          >
            {t.schedule}
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'records'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            } ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
          >
            {t.records}
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'reminders'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            } ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
          >
            {t.reminders}
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-140px)] p-4">
          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div>
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setSelectedCategory('child')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                    selectedCategory === 'child'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Baby className="w-4 h-4" />
                  <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>{t.childVaccines}</span>
                </button>
                <button
                  onClick={() => setSelectedCategory('adult')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                    selectedCategory === 'adult'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>{t.adultVaccines}</span>
                </button>
                <button
                  onClick={() => setSelectedCategory('covid')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                    selectedCategory === 'covid'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>{t.covidVaccines}</span>
                </button>
                <button
                  onClick={() => setSelectedCategory('seasonal')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                    selectedCategory === 'seasonal'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>{t.seasonalVaccines}</span>
                </button>
              </div>

              {/* Vaccine Schedule Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSchedules.map((vaccine, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`font-semibold text-gray-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {vaccine.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        vaccine.mandatory ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      } ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {vaccine.mandatory ? t.mandatory : t.optional}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                          {t.ageGroup}: {vaccine.ageGroup}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-gray-500" />
                        <span className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                          {t.doses}: {vaccine.doses}
                        </span>
                      </div>
                      {vaccine.interval && (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                            {t.interval}: {vaccine.interval}
                          </span>
                        </div>
                      )}
                      <p className={`text-gray-700 mt-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {vaccine.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Records Tab */}
          {activeTab === 'records' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold text-gray-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.records}
                </h3>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>{t.addRecord}</span>
                </button>
              </div>

              {/* Add Record Form */}
              {showAddForm && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <h4 className={`font-semibold text-gray-800 mb-4 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {t.addRecord}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {t.vaccineName}
                      </label>
                      <input
                        type="text"
                        value={formData.vaccineName}
                        onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={language === 'bn' ? 'টিকার নাম' : 'Vaccine name'}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {t.dateGiven}
                      </label>
                      <input
                        type="date"
                        value={formData.dateGiven}
                        onChange={(e) => setFormData({ ...formData, dateGiven: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {t.nextDue}
                      </label>
                      <input
                        type="date"
                        value={formData.nextDue}
                        onChange={(e) => setFormData({ ...formData, nextDue: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {t.ageGiven}
                      </label>
                      <input
                        type="text"
                        value={formData.ageGiven}
                        onChange={(e) => setFormData({ ...formData, ageGiven: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={language === 'bn' ? 'বয়স' : 'Age'}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {t.location}
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={language === 'bn' ? 'হাসপাতাল/ক্লিনিক' : 'Hospital/Clinic'}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {t.notes}
                      </label>
                      <input
                        type="text"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={language === 'bn' ? 'অতিরিক্ত নোট' : 'Additional notes'}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={handleAddRecord}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>{t.save}</span>
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>{t.cancel}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Vaccine Records List */}
              {vaccineRecords.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className={`text-gray-500 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {t.noRecords}
                  </p>
                  <p className={`text-sm text-gray-400 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {t.addFirst}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vaccineRecords.map((record) => (
                    <div key={record.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className={`font-semibold text-gray-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                          {record.vaccineName}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)} ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                          {t[record.status as keyof typeof t]}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                            {t.dateGiven}: {new Date(record.dateGiven).toLocaleDateString()}
                          </span>
                        </div>
                        {record.nextDue && (
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                              {t.nextDue}: {new Date(record.nextDue).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                            {t.ageGiven}: {record.ageGiven}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className={`text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                            {record.location}
                          </span>
                        </div>
                        {record.notes && (
                          <p className={`text-gray-700 mt-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                            {record.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reminders Tab */}
          {activeTab === 'reminders' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upcoming Vaccines */}
                <div>
                  <h3 className={`text-lg font-semibold text-gray-800 mb-4 flex items-center ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    <Clock className="w-5 h-5 mr-2 text-blue-500" />
                    {t.upcomingVaccines}
                  </h3>
                  {getUpcomingVaccines().length === 0 ? (
                    <p className={`text-gray-500 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {language === 'bn' ? 'কোন আসন্ন টিকা নেই' : 'No upcoming vaccines'}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {getUpcomingVaccines().map((record) => (
                        <div key={record.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h4 className={`font-medium text-blue-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                            {record.vaccineName}
                          </h4>
                          <p className={`text-sm text-blue-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                            {t.nextDue}: {new Date(record.nextDue!).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Overdue Vaccines */}
                <div>
                  <h3 className={`text-lg font-semibold text-gray-800 mb-4 flex items-center ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                    {t.overdueVaccines}
                  </h3>
                  {getOverdueVaccines().length === 0 ? (
                    <p className={`text-gray-500 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {language === 'bn' ? 'কোন বিলম্বিত টিকা নেই' : 'No overdue vaccines'}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {getOverdueVaccines().map((record) => (
                        <div key={record.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <h4 className={`font-medium text-red-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                            {record.vaccineName}
                          </h4>
                          <p className={`text-sm text-red-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                            {t.nextDue}: {new Date(record.nextDue!).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VaccinationSchedule;