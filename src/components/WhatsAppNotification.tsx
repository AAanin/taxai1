import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Users, Clock, CheckCircle, XCircle, Plus, Edit, Trash2, Eye, Calendar } from 'lucide-react';

interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  category: 'reminder' | 'appointment' | 'general' | 'emergency';
  variables: string[];
  createdAt: Date;
  isActive: boolean;
}

interface NotificationHistory {
  id: string;
  templateId: string;
  templateName: string;
  recipients: number;
  sentAt: Date;
  status: 'sent' | 'failed' | 'pending';
  successCount: number;
  failureCount: number;
}

interface ScheduledNotification {
  id: string;
  templateId: string;
  templateName: string;
  scheduledFor: Date;
  recipients: string[];
  status: 'scheduled' | 'sent' | 'cancelled';
}

const WhatsAppNotification: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'send' | 'templates' | 'history' | 'scheduled'>('send');
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>([]);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [recipients, setRecipients] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock data - Replace with actual API calls
  useEffect(() => {
    const mockTemplates: WhatsAppTemplate[] = [
      {
        id: '1',
        name: 'ওষুধ রিমাইন্ডার',
        content: 'প্রিয় {name}, আপনার {medicine} খাওয়ার সময় হয়েছে। সময়: {time}',
        category: 'reminder',
        variables: ['name', 'medicine', 'time'],
        createdAt: new Date(),
        isActive: true
      },
      {
        id: '2',
        name: 'অ্যাপয়েন্টমেন্ট রিমাইন্ডার',
        content: 'প্রিয় {name}, আগামীকাল {time} এ ডা. {doctor} এর সাথে আপনার অ্যাপয়েন্টমেন্ট রয়েছে।',
        category: 'appointment',
        variables: ['name', 'time', 'doctor'],
        createdAt: new Date(),
        isActive: true
      },
      {
        id: '3',
        name: 'স্বাস্থ্য টিপস',
        content: 'প্রিয় {name}, আজকের স্বাস্থ্য টিপস: {tip}',
        category: 'general',
        variables: ['name', 'tip'],
        createdAt: new Date(),
        isActive: true
      }
    ];

    const mockHistory: NotificationHistory[] = [
      {
        id: '1',
        templateId: '1',
        templateName: 'ওষুধ রিমাইন্ডার',
        recipients: 150,
        sentAt: new Date(),
        status: 'sent',
        successCount: 145,
        failureCount: 5
      },
      {
        id: '2',
        templateId: '2',
        templateName: 'অ্যাপয়েন্টমেন্ট রিমাইন্ডার',
        recipients: 25,
        sentAt: new Date(Date.now() - 60 * 60 * 1000),
        status: 'sent',
        successCount: 24,
        failureCount: 1
      }
    ];

    const mockScheduled: ScheduledNotification[] = [
      {
        id: '1',
        templateId: '1',
        templateName: 'ওষুধ রিমাইন্ডার',
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
        recipients: ['user1', 'user2', 'user3'],
        status: 'scheduled'
      }
    ];

    setTemplates(mockTemplates);
    setNotificationHistory(mockHistory);
    setScheduledNotifications(mockScheduled);
  }, []);

  const handleSendNotification = async () => {
    if (!selectedTemplate && !customMessage) {
      alert('অনুগ্রহ করে একটি টেমপ্লেট নির্বাচন করুন বা কাস্টম মেসেজ লিখুন।');
      return;
    }

    if (!recipients) {
      alert('অনুগ্রহ করে প্রাপকদের তথ্য দিন।');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newHistory: NotificationHistory = {
        id: Date.now().toString(),
        templateId: selectedTemplate || 'custom',
        templateName: selectedTemplate ? templates.find(t => t.id === selectedTemplate)?.name || 'কাস্টম' : 'কাস্টম মেসেজ',
        recipients: recipients.split(',').length,
        sentAt: new Date(),
        status: 'sent',
        successCount: recipients.split(',').length - 1,
        failureCount: 1
      };
      
      setNotificationHistory(prev => [newHistory, ...prev]);
      setSelectedTemplate('');
      setCustomMessage('');
      setRecipients('');
      setLoading(false);
      alert('নোটিফিকেশন সফলভাবে পাঠানো হয়েছে!');
    }, 2000);
  };

  const handleScheduleNotification = () => {
    if (!selectedTemplate && !customMessage) {
      alert('অনুগ্রহ করে একটি টেমপ্লেট নির্বাচন করুন বা কাস্টম মেসেজ লিখুন।');
      return;
    }

    if (!scheduleDate || !scheduleTime) {
      alert('অনুগ্রহ করে তারিখ এবং সময় নির্বাচন করুন।');
      return;
    }

    const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`);
    
    const newScheduled: ScheduledNotification = {
      id: Date.now().toString(),
      templateId: selectedTemplate || 'custom',
      templateName: selectedTemplate ? templates.find(t => t.id === selectedTemplate)?.name || 'কাস্টম' : 'কাস্টম মেসেজ',
      scheduledFor,
      recipients: recipients.split(','),
      status: 'scheduled'
    };
    
    setScheduledNotifications(prev => [newScheduled, ...prev]);
    setSelectedTemplate('');
    setCustomMessage('');
    setRecipients('');
    setScheduleDate('');
    setScheduleTime('');
    alert('নোটিফিকেশন সফলভাবে শিডিউল করা হয়েছে!');
  };

  const handleSaveTemplate = (template: Omit<WhatsAppTemplate, 'id' | 'createdAt'>) => {
    if (editingTemplate) {
      setTemplates(prev => prev.map(t => 
        t.id === editingTemplate.id 
          ? { ...template, id: editingTemplate.id, createdAt: editingTemplate.createdAt }
          : t
      ));
    } else {
      const newTemplate: WhatsAppTemplate = {
        ...template,
        id: Date.now().toString(),
        createdAt: new Date()
      };
      setTemplates(prev => [newTemplate, ...prev]);
    }
    
    setShowTemplateModal(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('আপনি কি এই টেমপ্লেটটি মুছে ফেলতে চান?')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const renderSendTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">নোটিফিকেশন পাঠান</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              টেমপ্লেট নির্বাচন করুন
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">টেমপ্লেট নির্বাচন করুন</option>
              {templates.filter(t => t.isActive).map(template => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.category})
                </option>
              ))}
            </select>
          </div>

          {selectedTemplate && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">টেমপ্লেট প্রিভিউ:</h4>
              <p className="text-blue-800">
                {templates.find(t => t.id === selectedTemplate)?.content}
              </p>
              {templates.find(t => t.id === selectedTemplate)?.variables.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-blue-700">
                    ভেরিয়েবল: {templates.find(t => t.id === selectedTemplate)?.variables.join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              অথবা কাস্টম মেসেজ লিখুন
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="আপনার কাস্টম মেসেজ এখানে লিখুন..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              প্রাপকদের ফোন নম্বর (কমা দিয়ে আলাদা করুন)
            </label>
            <textarea
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="+8801XXXXXXXXX, +8801YYYYYYYYY"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                শিডিউল তারিখ (ঐচ্ছিক)
              </label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                শিডিউল সময় (ঐচ্ছিক)
              </label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleSendNotification}
              disabled={loading || (scheduleDate && scheduleTime)}
              className="flex items-center bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'পাঠানো হচ্ছে...' : 'এখনই পাঠান'}
            </button>
            
            {scheduleDate && scheduleTime && (
              <button
                onClick={handleScheduleNotification}
                className="flex items-center bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Calendar className="h-4 w-4 mr-2" />
                শিডিউল করুন
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">মেসেজ টেমপ্লেট</h3>
        <button
          onClick={() => setShowTemplateModal(true)}
          className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          নতুন টেমপ্লেট
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <div key={template.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">{template.name}</h4>
              <span className={`px-2 py-1 rounded-full text-xs ${
                template.category === 'reminder' ? 'bg-blue-100 text-blue-800' :
                template.category === 'appointment' ? 'bg-green-100 text-green-800' :
                template.category === 'general' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }`}>
                {template.category}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">{template.content}</p>
            
            {template.variables.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500">ভেরিয়েবল:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {template.variables.map(variable => (
                    <span key={variable} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {variable}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className={`text-xs ${
                template.isActive ? 'text-green-600' : 'text-red-600'
              }`}>
                {template.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
              </span>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingTemplate(template);
                    setShowTemplateModal(true);
                  }}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">নোটিফিকেশন ইতিহাস</h3>
      
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  টেমপ্লেট
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  প্রাপক
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  পাঠানোর সময়
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  স্ট্যাটাস
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  সফল/ব্যর্থ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notificationHistory.map(history => (
                <tr key={history.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {history.templateName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {history.recipients}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {history.sentAt.toLocaleString('bn-BD')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      history.status === 'sent' ? 'bg-green-100 text-green-800' :
                      history.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {history.status === 'sent' ? 'পাঠানো হয়েছে' :
                       history.status === 'failed' ? 'ব্যর্থ' : 'অপেক্ষমাণ'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="text-green-600">{history.successCount}</span> / 
                    <span className="text-red-600">{history.failureCount}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderScheduledTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">শিডিউল করা নোটিফিকেশন</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scheduledNotifications.map(scheduled => (
          <div key={scheduled.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">{scheduled.templateName}</h4>
              <span className={`px-2 py-1 rounded-full text-xs ${
                scheduled.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                scheduled.status === 'sent' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {scheduled.status === 'scheduled' ? 'শিডিউল করা' :
                 scheduled.status === 'sent' ? 'পাঠানো হয়েছে' : 'বাতিল'}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{scheduled.scheduledFor.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                <span>{scheduled.recipients.length} জন প্রাপক</span>
              </div>
            </div>
            
            {scheduled.status === 'scheduled' && (
              <div className="mt-4 flex space-x-2">
                <button className="text-blue-500 hover:text-blue-700 text-sm">
                  সম্পাদনা
                </button>
                <button className="text-red-500 hover:text-red-700 text-sm">
                  বাতিল
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">হোয়াটসঅ্যাপ নোটিফিকেশন</h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'send', label: 'পাঠান', icon: Send },
            { id: 'templates', label: 'টেমপ্লেট', icon: MessageSquare },
            { id: 'history', label: 'ইতিহাস', icon: Clock },
            { id: 'scheduled', label: 'শিডিউল', icon: Calendar }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'send' && renderSendTab()}
      {activeTab === 'templates' && renderTemplatesTab()}
      {activeTab === 'history' && renderHistoryTab()}
      {activeTab === 'scheduled' && renderScheduledTab()}

      {/* Template Modal */}
      {showTemplateModal && (
        <TemplateModal
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onClose={() => {
            setShowTemplateModal(false);
            setEditingTemplate(null);
          }}
        />
      )}
    </div>
  );
};

// Template Modal Component
interface TemplateModalProps {
  template: WhatsAppTemplate | null;
  onSave: (template: Omit<WhatsAppTemplate, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({ template, onSave, onClose }) => {
  const [name, setName] = useState(template?.name || '');
  const [content, setContent] = useState(template?.content || '');
  const [category, setCategory] = useState<WhatsAppTemplate['category']>(template?.category || 'general');
  const [isActive, setIsActive] = useState(template?.isActive ?? true);

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  const handleSave = () => {
    if (!name.trim() || !content.trim()) {
      alert('অনুগ্রহ করে নাম এবং কন্টেন্ট পূরণ করুন।');
      return;
    }

    const variables = extractVariables(content);
    
    onSave({
      name: name.trim(),
      content: content.trim(),
      category,
      variables,
      isActive
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {template ? 'টেমপ্লেট সম্পাদনা' : 'নতুন টেমপ্লেট'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              টেমপ্লেটের নাম
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="টেমপ্লেটের নাম লিখুন"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ক্যাটাগরি
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as WhatsAppTemplate['category'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="general">সাধারণ</option>
              <option value="reminder">রিমাইন্ডার</option>
              <option value="appointment">অ্যাপয়েন্টমেন্ট</option>
              <option value="emergency">জরুরি</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              মেসেজ কন্টেন্ট
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="মেসেজ লিখুন... ভেরিয়েবলের জন্য {variable_name} ব্যবহার করুন"
            />
            <p className="text-xs text-gray-500 mt-1">
              ভেরিয়েবল ব্যবহার করতে {'{'}variable_name{'}'} ফরম্যাট ব্যবহার করুন
            </p>
          </div>

          {extractVariables(content).length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">সনাক্তকৃত ভেরিয়েবল:</p>
              <div className="flex flex-wrap gap-2">
                {extractVariables(content).map(variable => (
                  <span key={variable} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {variable}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              টেমপ্লেট সক্রিয় রাখুন
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            বাতিল
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            সংরক্ষণ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppNotification;