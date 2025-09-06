import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, User, Pill, Activity, X, Printer } from 'lucide-react';

interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  doctor: string;
  hospital: string;
  notes: string;
  createdAt: string;
}

interface MedicineRecord {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  startDate: string;
  endDate: string;
  prescribedBy: string;
  purpose: string;
  sideEffects: string;
  notes: string;
  status: 'active' | 'completed' | 'discontinued';
  createdAt: string;
}

interface MedicalReportProps {
  language: 'bn' | 'en';
  onClose: () => void;
}

const MedicalReport: React.FC<MedicalReportProps> = ({ language, onClose }) => {
  const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>([]);
  const [medicineHistory, setMedicineHistory] = useState<MedicineRecord[]>([]);
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: '',
    gender: '',
    bloodGroup: '',
    contactNumber: '',
    emergencyContact: ''
  });
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load medical history
    const savedMedical = localStorage.getItem('medicalHistory');
    if (savedMedical) {
      setMedicalHistory(JSON.parse(savedMedical));
    }

    // Load medicine history
    const savedMedicine = localStorage.getItem('medicineHistory');
    if (savedMedicine) {
      setMedicineHistory(JSON.parse(savedMedicine));
    }

    // Load patient info
    const savedPatient = localStorage.getItem('patientInfo');
    if (savedPatient) {
      setPatientInfo(JSON.parse(savedPatient));
    }
  };

  const savePatientInfo = () => {
    localStorage.setItem('patientInfo', JSON.stringify(patientInfo));
    setShowPatientForm(false);
  };

  const generateReport = () => {
    setReportGenerated(true);
  };

  const printReport = () => {
    window.print();
  };

  const downloadReport = () => {
    const reportContent = document.getElementById('medical-report');
    if (reportContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Medical Report</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .bangla-text { font-family: 'SolaimanLipi', 'Kalpurush', Arial, sans-serif; }
                .english-text { font-family: 'Inter', Arial, sans-serif; }
                .report-header { text-align: center; margin-bottom: 30px; }
                .section { margin-bottom: 25px; }
                .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #333; padding-bottom: 5px; }
                .record { margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; }
                .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
                .field { margin-bottom: 8px; }
                .field-label { font-weight: bold; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              ${reportContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const getActiveMedicines = () => {
    return medicineHistory.filter(med => med.status === 'active');
  };

  const getRecentMedicalRecords = () => {
    return medicalHistory
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  const texts = {
    bn: {
      title: 'চিকিৎসা রিপোর্ট',
      patientInfo: 'রোগীর তথ্য',
      medicalHistory: 'চিকিৎসা ইতিহাস',
      medicineHistory: 'ওষুধের ইতিহাস',
      activeMedicines: 'বর্তমান ওষুধসমূহ',
      recentRecords: 'সাম্প্রতিক চিকিৎসা রেকর্ড',
      generateReport: 'রিপোর্ট তৈরি করুন',
      printReport: 'প্রিন্ট করুন',
      downloadReport: 'ডাউনলোড করুন',
      editPatientInfo: 'রোগীর তথ্য সম্পাদনা',
      name: 'নাম',
      age: 'বয়স',
      gender: 'লিঙ্গ',
      bloodGroup: 'রক্তের গ্রুপ',
      contactNumber: 'যোগাযোগ নম্বর',
      emergencyContact: 'জরুরি যোগাযোগ',
      male: 'পুরুষ',
      female: 'মহিলা',
      other: 'অন্যান্য',
      save: 'সংরক্ষণ করুন',
      cancel: 'বাতিল',
      date: 'তারিখ',
      diagnosis: 'রোগ নির্ণয়',
      treatment: 'চিকিৎসা',
      doctor: 'ডাক্তার',
      medicineName: 'ওষুধের নাম',
      dosage: 'ডোজ',
      frequency: 'সেবনের নিয়ম',
      duration: 'সময়কাল',
      purpose: 'ব্যবহারের কারণ',
      noData: 'কোন তথ্য পাওয়া যায়নি',
      reportSummary: 'রিপোর্ট সারসংক্ষেপ',
      totalMedicalRecords: 'মোট চিকিৎসা রেকর্ড',
      totalMedicines: 'মোট ওষুধ',
      activeMedicineCount: 'বর্তমান ওষুধ',
      lastVisit: 'শেষ ভিজিট'
    },
    en: {
      title: 'Medical Report',
      patientInfo: 'Patient Information',
      medicalHistory: 'Medical History',
      medicineHistory: 'Medicine History',
      activeMedicines: 'Current Medications',
      recentRecords: 'Recent Medical Records',
      generateReport: 'Generate Report',
      printReport: 'Print Report',
      downloadReport: 'Download Report',
      editPatientInfo: 'Edit Patient Info',
      name: 'Name',
      age: 'Age',
      gender: 'Gender',
      bloodGroup: 'Blood Group',
      contactNumber: 'Contact Number',
      emergencyContact: 'Emergency Contact',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      save: 'Save',
      cancel: 'Cancel',
      date: 'Date',
      diagnosis: 'Diagnosis',
      treatment: 'Treatment',
      doctor: 'Doctor',
      medicineName: 'Medicine Name',
      dosage: 'Dosage',
      frequency: 'Frequency',
      duration: 'Duration',
      purpose: 'Purpose',
      noData: 'No data available',
      reportSummary: 'Report Summary',
      totalMedicalRecords: 'Total Medical Records',
      totalMedicines: 'Total Medicines',
      activeMedicineCount: 'Active Medicines',
      lastVisit: 'Last Visit'
    }
  };

  const t = texts[language];

  return (
    <div className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b print:hidden">
        <h2 className={`text-xl font-semibold ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
          {t.title}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={printReport}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>
              {t.printReport}
            </span>
          </button>
          <button
            onClick={downloadReport}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>
              {t.downloadReport}
            </span>
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[calc(95vh-80px)] p-4">
        {/* Patient Info Form */}
        {showPatientForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 print:hidden">
            <h3 className={`text-lg font-semibold mb-4 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
              {t.editPatientInfo}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.name}
                </label>
                <input
                  type="text"
                  value={patientInfo.name}
                  onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.age}
                </label>
                <input
                  type="number"
                  value={patientInfo.age}
                  onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.gender}
                </label>
                <select
                  value={patientInfo.gender}
                  onChange={(e) => setPatientInfo({...patientInfo, gender: e.target.value})}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
                >
                  <option value="">{language === 'bn' ? 'নির্বাচন করুন' : 'Select'}</option>
                  <option value="male">{t.male}</option>
                  <option value="female">{t.female}</option>
                  <option value="other">{t.other}</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.bloodGroup}
                </label>
                <input
                  type="text"
                  value={patientInfo.bloodGroup}
                  onChange={(e) => setPatientInfo({...patientInfo, bloodGroup: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="A+, B+, O+, AB+, etc."
                />
              </div>
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.contactNumber}
                </label>
                <input
                  type="tel"
                  value={patientInfo.contactNumber}
                  onChange={(e) => setPatientInfo({...patientInfo, contactNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.emergencyContact}
                </label>
                <input
                  type="tel"
                  value={patientInfo.emergencyContact}
                  onChange={(e) => setPatientInfo({...patientInfo, emergencyContact: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <button
                onClick={savePatientInfo}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>
                  {t.save}
                </span>
              </button>
              <button
                onClick={() => setShowPatientForm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>
                  {t.cancel}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-6 print:hidden">
          <button
            onClick={() => setShowPatientForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <User className="w-4 h-4" />
            <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>
              {t.editPatientInfo}
            </span>
          </button>
          <button
            onClick={generateReport}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>
              {t.generateReport}
            </span>
          </button>
        </div>

        {/* Report Content */}
        <div id="medical-report" className="space-y-6">
          {/* Report Header */}
          <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
            <h1 className={`text-2xl font-bold text-gray-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
              {t.title}
            </h1>
            <p className="text-gray-600 mt-2">
              {language === 'bn' ? 'তৈরি হয়েছে:' : 'Generated on:'} {new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
            </p>
          </div>

          {/* Patient Information */}
          <div className="section">
            <h2 className={`text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
              <User className="w-5 h-5" />
              <span>{t.patientInfo}</span>
            </h2>
            {patientInfo.name ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="field">
                  <span className={`field-label ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{t.name}:</span>
                  <span className={`ml-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{patientInfo.name}</span>
                </div>
                <div className="field">
                  <span className={`field-label ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{t.age}:</span>
                  <span className="ml-2">{patientInfo.age}</span>
                </div>
                <div className="field">
                  <span className={`field-label ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{t.gender}:</span>
                  <span className={`ml-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{patientInfo.gender ? t[patientInfo.gender as keyof typeof t] : ''}</span>
                </div>
                <div className="field">
                  <span className={`field-label ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{t.bloodGroup}:</span>
                  <span className="ml-2">{patientInfo.bloodGroup}</span>
                </div>
                <div className="field">
                  <span className={`field-label ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{t.contactNumber}:</span>
                  <span className="ml-2">{patientInfo.contactNumber}</span>
                </div>
                <div className="field">
                  <span className={`field-label ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{t.emergencyContact}:</span>
                  <span className="ml-2">{patientInfo.emergencyContact}</span>
                </div>
              </div>
            ) : (
              <p className={`text-gray-500 italic ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                {t.noData}
              </p>
            )}
          </div>

          {/* Report Summary */}
          <div className="section">
            <h2 className={`text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
              <Activity className="w-5 h-5" />
              <span>{t.reportSummary}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{medicalHistory.length}</div>
                <div className={`text-sm text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{t.totalMedicalRecords}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{medicineHistory.length}</div>
                <div className={`text-sm text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{t.totalMedicines}</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{getActiveMedicines().length}</div>
                <div className={`text-sm text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{t.activeMedicineCount}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {medicalHistory.length > 0 ? medicalHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date : '-'}
                </div>
                <div className={`text-sm text-gray-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{t.lastVisit}</div>
              </div>
            </div>
          </div>

          {/* Active Medicines */}
          <div className="section">
            <h2 className={`text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
              <Pill className="w-5 h-5" />
              <span>{t.activeMedicines}</span>
            </h2>
            {getActiveMedicines().length > 0 ? (
              <div className="space-y-3">
                {getActiveMedicines().map((medicine) => (
                  <div key={medicine.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <span className={`font-semibold ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{t.medicineName}:</span>
                        <div className={`${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{medicine.medicineName}</div>
                      </div>
                      <div>
                        <span className={`font-semibold ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{t.dosage}:</span>
                        <div className={`${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{medicine.dosage}</div>
                      </div>
                      <div>
                        <span className={`font-semibold ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{t.frequency}:</span>
                        <div className={`${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{medicine.frequency}</div>
                      </div>
                      <div>
                        <span className={`font-semibold ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{t.purpose}:</span>
                        <div className={`${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{medicine.purpose}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-gray-500 italic ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                {t.noData}
              </p>
            )}
          </div>

          {/* Recent Medical Records */}
          <div className="section">
            <h2 className={`text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
              <Calendar className="w-5 h-5" />
              <span>{t.recentRecords}</span>
            </h2>
            {getRecentMedicalRecords().length > 0 ? (
              <div className="space-y-4">
                {getRecentMedicalRecords().map((record) => (
                  <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className={`font-semibold ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{t.date}:</span>
                        <div>{record.date}</div>
                      </div>
                      <div>
                        <span className={`font-semibold ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{t.doctor}:</span>
                        <div className={`${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{record.doctor}</div>
                      </div>
                      <div>
                        <span className={`font-semibold ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{t.diagnosis}:</span>
                        <div className={`${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{record.diagnosis}</div>
                      </div>
                      <div>
                        <span className={`font-semibold ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{t.treatment}:</span>
                        <div className={`${language === 'bn' ? 'bangla-text' : 'english-text'}`}>{record.treatment}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-gray-500 italic ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                {t.noData}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalReport;