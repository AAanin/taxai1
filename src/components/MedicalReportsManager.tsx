// Medical Reports Manager Component - মেডিকেল রিপোর্ট ব্যবস্থাপনা কম্পোনেন্ট
import React, { useState, useEffect } from 'react';
import { Upload, FileText, Calendar, User, Building2, Download, Search, Filter, Eye, Trash2, Edit, Plus } from 'lucide-react';
import dataStorageService, { MedicalReport } from '../services/dataStorageService';

interface MedicalReportsManagerProps {
  userId?: string;
  onClose?: () => void;
}

const MedicalReportsManager: React.FC<MedicalReportsManagerProps> = ({ 
  userId = 'default-user-id', 
  onClose 
}) => {
  // States
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<MedicalReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showReportDetails, setShowReportDetails] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // New Report Form State
  const [newReport, setNewReport] = useState({
    reportType: 'blood_test' as const,
    title: '',
    description: '',
    doctorName: '',
    hospitalName: '',
    timestamp: new Date().toISOString().split('T')[0],
    parameters: [{ name: '', value: '', unit: '', normalRange: '', status: 'normal' as const }],
    summary: '',
    recommendations: [''],
    fileUrl: ''
  });

  // Load reports on component mount
  useEffect(() => {
    loadReports();
  }, [userId]);

  // Filter reports when search term or filter type changes
  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, filterType]);

  // Load reports from storage
  const loadReports = () => {
    try {
      const userReports = dataStorageService.getMedicalReports(userId);
      setReports(userReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  // Filter reports based on search and filter criteria
  const filterReports = () => {
    let filtered = reports;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(report => report.reportType === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  };

  // Add parameter to new report
  const addParameter = () => {
    setNewReport(prev => ({
      ...prev,
      parameters: [...prev.parameters, { name: '', value: '', unit: '', normalRange: '', status: 'normal' }]
    }));
  };

  // Remove parameter from new report
  const removeParameter = (index: number) => {
    setNewReport(prev => ({
      ...prev,
      parameters: prev.parameters.filter((_, i) => i !== index)
    }));
  };

  // Update parameter
  const updateParameter = (index: number, field: string, value: string) => {
    setNewReport(prev => ({
      ...prev,
      parameters: prev.parameters.map((param, i) => 
        i === index ? { ...param, [field]: value } : param
      )
    }));
  };

  // Add recommendation
  const addRecommendation = () => {
    setNewReport(prev => ({
      ...prev,
      recommendations: [...prev.recommendations, '']
    }));
  };

  // Update recommendation
  const updateRecommendation = (index: number, value: string) => {
    setNewReport(prev => ({
      ...prev,
      recommendations: prev.recommendations.map((rec, i) => 
        i === index ? value : rec
      )
    }));
  };

  // Remove recommendation
  const removeRecommendation = (index: number) => {
    setNewReport(prev => ({
      ...prev,
      recommendations: prev.recommendations.filter((_, i) => i !== index)
    }));
  };

  // Save new report
  const saveReport = async () => {
    setIsLoading(true);
    try {
      const reportData = {
        ...newReport,
        userId,
        timestamp: new Date(newReport.timestamp),
        results: {
          parameters: newReport.parameters.filter(p => p.name && p.value),
          summary: newReport.summary,
          recommendations: newReport.recommendations.filter(r => r.trim())
        }
      };

      dataStorageService.saveMedicalReport(reportData);
      loadReports();
      setShowUploadForm(false);
      resetForm();
      alert('রিপোর্ট সফলভাবে সংরক্ষিত হয়েছে!');
    } catch (error) {
      console.error('Error saving report:', error);
      alert('রিপোর্ট সংরক্ষণে সমস্যা হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setNewReport({
      reportType: 'blood_test',
      title: '',
      description: '',
      doctorName: '',
      hospitalName: '',
      timestamp: new Date().toISOString().split('T')[0],
      parameters: [{ name: '', value: '', unit: '', normalRange: '', status: 'normal' }],
      summary: '',
      recommendations: [''],
      fileUrl: ''
    });
  };

  // Delete report
  const deleteReport = (reportId: string) => {
    if (window.confirm('আপনি কি এই রিপোর্টটি মুছে ফেলতে চান?')) {
      // Note: We need to implement delete functionality in dataStorageService
      console.log('Delete report:', reportId);
      alert('ডিলিট ফিচার শীঘ্রই যোগ করা হবে।');
    }
  };

  // Export report data
  const exportReport = (report: MedicalReport) => {
    const reportData = JSON.stringify(report, null, 2);
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-report-${report.title}-${new Date(report.timestamp).toLocaleDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'abnormal': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Report type options
  const reportTypes = [
    { value: 'blood_test', label: 'রক্ত পরীক্ষা' },
    { value: 'x_ray', label: 'এক্স-রে' },
    { value: 'mri', label: 'এমআরআই' },
    { value: 'ct_scan', label: 'সিটি স্ক্যান' },
    { value: 'ecg', label: 'ইসিজি' },
    { value: 'other', label: 'অন্যান্য' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          মেডিকেল রিপোর্ট ব্যবস্থাপনা
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUploadForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            নতুন রিপোর্ট
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              বন্ধ করুন
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="রিপোর্ট খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">সব ধরনের রিপোর্ট</option>
            {reportTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="grid gap-4 mb-6">
        {filteredReports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>কোনো রিপোর্ট পাওয়া যায়নি।</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{report.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{report.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(report.timestamp)}
                    </span>
                    {report.doctorName && (
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {report.doctorName}
                      </span>
                    )}
                    {report.hospitalName && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {report.hospitalName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => setShowReportDetails(report.id)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="বিস্তারিত দেখুন"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => exportReport(report)}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                    title="ডাউনলোড করুন"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteReport(report.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Quick Summary */}
              {report.results.parameters.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">মূল ফলাফল:</p>
                  <div className="flex flex-wrap gap-2">
                    {report.results.parameters.slice(0, 3).map((param, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(param.status)}`}
                      >
                        {param.name}: {param.value} {param.unit}
                      </span>
                    ))}
                    {report.results.parameters.length > 3 && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{report.results.parameters.length - 3} আরো
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">নতুন মেডিকেল রিপোর্ট যোগ করুন</h3>
              
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">রিপোর্টের ধরন</label>
                  <select
                    value={newReport.reportType}
                    onChange={(e) => setNewReport(prev => ({ ...prev, reportType: e.target.value as any }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {reportTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">তারিখ</label>
                  <input
                    type="date"
                    value={newReport.timestamp}
                    onChange={(e) => setNewReport(prev => ({ ...prev, timestamp: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">রিপোর্টের শিরোনাম</label>
                  <input
                    type="text"
                    value={newReport.title}
                    onChange={(e) => setNewReport(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="যেমন: রক্ত পরীক্ষার রিপোর্ট"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ডাক্তারের নাম</label>
                  <input
                    type="text"
                    value={newReport.doctorName}
                    onChange={(e) => setNewReport(prev => ({ ...prev, doctorName: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="ডাক্তারের নাম"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">হাসপাতাল/ক্লিনিকের নাম</label>
                  <input
                    type="text"
                    value={newReport.hospitalName}
                    onChange={(e) => setNewReport(prev => ({ ...prev, hospitalName: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="হাসপাতাল বা ক্লিনিকের নাম"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">বিবরণ</label>
                  <textarea
                    value={newReport.description}
                    onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="রিপোর্টের সংক্ষিপ্ত বিবরণ"
                  />
                </div>
              </div>

              {/* Parameters */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold">পরীক্ষার ফলাফল</h4>
                  <button
                    onClick={addParameter}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    + প্যারামিটার যোগ করুন
                  </button>
                </div>
                {newReport.parameters.map((param, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3 p-3 border border-gray-200 rounded">
                    <input
                      type="text"
                      placeholder="পরীক্ষার নাম"
                      value={param.name}
                      onChange={(e) => updateParameter(index, 'name', e.target.value)}
                      className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="মান"
                      value={param.value}
                      onChange={(e) => updateParameter(index, 'value', e.target.value)}
                      className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="একক"
                      value={param.unit}
                      onChange={(e) => updateParameter(index, 'unit', e.target.value)}
                      className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="স্বাভাবিক মাত্রা"
                      value={param.normalRange}
                      onChange={(e) => updateParameter(index, 'normalRange', e.target.value)}
                      className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-1">
                      <select
                        value={param.status}
                        onChange={(e) => updateParameter(index, 'status', e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="normal">স্বাভাবিক</option>
                        <option value="abnormal">অস্বাভাবিক</option>
                        <option value="critical">গুরুতর</option>
                      </select>
                      {newReport.parameters.length > 1 && (
                        <button
                          onClick={() => removeParameter(index)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">সারসংক্ষেপ</label>
                <textarea
                  value={newReport.summary}
                  onChange={(e) => setNewReport(prev => ({ ...prev, summary: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="রিপোর্টের সারসংক্ষেপ লিখুন"
                />
              </div>

              {/* Recommendations */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold">সুপারিশ</h4>
                  <button
                    onClick={addRecommendation}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    + সুপারিশ যোগ করুন
                  </button>
                </div>
                {newReport.recommendations.map((rec, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="সুপারিশ লিখুন"
                      value={rec}
                      onChange={(e) => updateRecommendation(index, e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    {newReport.recommendations.length > 1 && (
                      <button
                        onClick={() => removeRecommendation(index)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowUploadForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={isLoading}
                >
                  বাতিল
                </button>
                <button
                  onClick={saveReport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={isLoading || !newReport.title || !newReport.description}
                >
                  {isLoading ? 'সংরক্ষণ করা হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {showReportDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {(() => {
              const report = reports.find(r => r.id === showReportDetails);
              if (!report) return null;
              
              return (
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{report.title}</h3>
                      <p className="text-gray-600">{report.description}</p>
                    </div>
                    <button
                      onClick={() => setShowReportDetails(null)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  {/* Report Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">তারিখ</p>
                      <p className="font-medium">{formatDate(report.timestamp)}</p>
                    </div>
                    {report.doctorName && (
                      <div>
                        <p className="text-sm text-gray-500">ডাক্তার</p>
                        <p className="font-medium">{report.doctorName}</p>
                      </div>
                    )}
                    {report.hospitalName && (
                      <div>
                        <p className="text-sm text-gray-500">হাসপাতাল</p>
                        <p className="font-medium">{report.hospitalName}</p>
                      </div>
                    )}
                  </div>

                  {/* Parameters */}
                  {report.results.parameters.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-4">পরীক্ষার ফলাফল</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="p-3 text-left border-b">পরীক্ষার নাম</th>
                              <th className="p-3 text-left border-b">মান</th>
                              <th className="p-3 text-left border-b">একক</th>
                              <th className="p-3 text-left border-b">স্বাভাবিক মাত্রা</th>
                              <th className="p-3 text-left border-b">অবস্থা</th>
                            </tr>
                          </thead>
                          <tbody>
                            {report.results.parameters.map((param, index) => (
                              <tr key={index} className="border-b last:border-b-0">
                                <td className="p-3 font-medium">{param.name}</td>
                                <td className="p-3">{param.value}</td>
                                <td className="p-3">{param.unit}</td>
                                <td className="p-3">{param.normalRange}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(param.status)}`}>
                                    {param.status === 'normal' ? 'স্বাভাবিক' : 
                                     param.status === 'abnormal' ? 'অস্বাভাবিক' : 'গুরুতর'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {report.results.summary && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">সারসংক্ষেপ</h4>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{report.results.summary}</p>
                    </div>
                  )}

                  {/* Recommendations */}
                  {report.results.recommendations.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">সুপারিশ</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {report.results.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-4 pt-4 border-t">
                    <button
                      onClick={() => exportReport(report)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      ডাউনলোড
                    </button>
                    <button
                      onClick={() => setShowReportDetails(null)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      বন্ধ করুন
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalReportsManager;