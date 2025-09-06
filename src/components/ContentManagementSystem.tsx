// Content Management System - কন্টেন্ট ম্যানেজমেন্ট সিস্টেম
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Calendar, Globe, BarChart3, Save, X, Image, Video, FileText, Layout } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

interface ContentItem {
  id: string;
  title: string;
  content: string;
  type: 'article' | 'announcement' | 'health-tip' | 'news' | 'service';
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  language: 'bn' | 'en';
  author: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  scheduledAt?: Date;
  tags: string[];
  category: string;
  featured: boolean;
  views: number;
  likes: number;
  shares: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  thumbnail?: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    alt?: string;
  }[];
}

interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  structure: {
    sections: {
      id: string;
      type: 'text' | 'image' | 'video' | 'list' | 'quote' | 'button';
      label: string;
      required: boolean;
    }[];
  };
}

const ContentManagementSystem: React.FC = () => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'editor' | 'analytics' | 'templates'>('list');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    language: 'all',
    category: 'all'
  });
  
  const { showNotification } = useNotification();

  // Content types and categories
  const contentTypes = [
    { id: 'article', label: 'নিবন্ধ', icon: FileText, color: 'bg-blue-100 text-blue-600' },
    { id: 'announcement', label: 'ঘোষণা', icon: Globe, color: 'bg-green-100 text-green-600' },
    { id: 'health-tip', label: 'স্বাস্থ্য টিপস', icon: BarChart3, color: 'bg-purple-100 text-purple-600' },
    { id: 'news', label: 'সংবাদ', icon: Calendar, color: 'bg-red-100 text-red-600' },
    { id: 'service', label: 'সেবা', icon: Layout, color: 'bg-yellow-100 text-yellow-600' }
  ];

  const categories = [
    'সাধারণ স্বাস্থ্য', 'হৃদরোগ', 'ডায়াবেটিস', 'শিশু স্বাস্থ্য', 'মানসিক স্বাস্থ্য',
    'পুষ্টি', 'ব্যায়াম', 'প্রতিরোধ', 'চিকিৎসা সেবা', 'জরুরি সেবা'
  ];

  const statusOptions = [
    { id: 'draft', label: 'খসড়া', color: 'bg-gray-100 text-gray-600' },
    { id: 'published', label: 'প্রকাশিত', color: 'bg-green-100 text-green-600' },
    { id: 'scheduled', label: 'নির্ধারিত', color: 'bg-blue-100 text-blue-600' },
    { id: 'archived', label: 'সংরক্ষিত', color: 'bg-yellow-100 text-yellow-600' }
  ];

  // Load content from localStorage
  useEffect(() => {
    const savedContent = localStorage.getItem('cms_content');
    const savedTemplates = localStorage.getItem('cms_templates');
    
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        setContents(parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          publishedAt: item.publishedAt ? new Date(item.publishedAt) : undefined,
          scheduledAt: item.scheduledAt ? new Date(item.scheduledAt) : undefined
        })));
      } catch (error) {
        console.error('Error loading content:', error);
      }
    } else {
      // Initialize with sample content
      const sampleContent: ContentItem[] = [
        {
          id: '1',
          title: 'ডায়াবেটিস নিয়ন্ত্রণের ১০টি কার্যকর উপায়',
          content: 'ডায়াবেটিস একটি দীর্ঘমেয়াদী রোগ যা সঠিক নিয়ন্ত্রণে রাখা সম্ভব...',
          type: 'health-tip',
          status: 'published',
          language: 'bn',
          author: 'ডা. রহিম উদ্দিন',
          createdAt: new Date(),
          updatedAt: new Date(),
          publishedAt: new Date(),
          tags: ['ডায়াবেটিস', 'স্বাস্থ্য', 'নিয়ন্ত্রণ'],
          category: 'ডায়াবেটিস',
          featured: true,
          views: 1250,
          likes: 89,
          shares: 23
        }
      ];
      setContents(sampleContent);
    }
    
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    } else {
      // Initialize with sample templates
      const sampleTemplates: ContentTemplate[] = [
        {
          id: '1',
          name: 'স্বাস্থ্য টিপস টেমপ্লেট',
          description: 'স্বাস্থ্য সংক্রান্ত টিপস এবং পরামর্শের জন্য',
          structure: {
            sections: [
              { id: '1', type: 'text', label: 'শিরোনাম', required: true },
              { id: '2', type: 'image', label: 'প্রধান ছবি', required: false },
              { id: '3', type: 'text', label: 'ভূমিকা', required: true },
              { id: '4', type: 'list', label: 'টিপস তালিকা', required: true },
              { id: '5', type: 'text', label: 'উপসংহার', required: false }
            ]
          }
        }
      ];
      setTemplates(sampleTemplates);
    }
  }, []);

  // Save content to localStorage
  useEffect(() => {
    localStorage.setItem('cms_content', JSON.stringify(contents));
  }, [contents]);

  useEffect(() => {
    localStorage.setItem('cms_templates', JSON.stringify(templates));
  }, [templates]);

  // Filter content
  const getFilteredContent = () => {
    return contents.filter(content => {
      const matchesStatus = filters.status === 'all' || content.status === filters.status;
      const matchesType = filters.type === 'all' || content.type === filters.type;
      const matchesLanguage = filters.language === 'all' || content.language === filters.language;
      const matchesCategory = filters.category === 'all' || content.category === filters.category;
      
      return matchesStatus && matchesType && matchesLanguage && matchesCategory;
    });
  };

  // Create new content
  const createNewContent = () => {
    const newContent: ContentItem = {
      id: Date.now().toString(),
      title: '',
      content: '',
      type: 'article',
      status: 'draft',
      language: 'bn',
      author: 'বর্তমান ব্যবহারকারী',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      category: categories[0],
      featured: false,
      views: 0,
      likes: 0,
      shares: 0
    };
    
    setSelectedContent(newContent);
    setIsEditing(true);
    setCurrentView('editor');
  };

  // Save content
  const saveContent = () => {
    if (!selectedContent) return;
    
    const updatedContent = {
      ...selectedContent,
      updatedAt: new Date()
    };
    
    if (isEditing && contents.find(c => c.id === selectedContent.id)) {
      setContents(prev => prev.map(c => c.id === selectedContent.id ? updatedContent : c));
    } else {
      setContents(prev => [updatedContent, ...prev]);
    }
    
    showNotification({
      type: 'success',
      title: 'সফল',
      message: 'কন্টেন্ট সংরক্ষিত হয়েছে'
    });
    
    setCurrentView('list');
    setSelectedContent(null);
    setIsEditing(false);
  };

  // Delete content
  const deleteContent = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই কন্টেন্টটি মুছে ফেলতে চান?')) {
      setContents(prev => prev.filter(c => c.id !== id));
      showNotification({
        type: 'success',
        title: 'মুছে ফেলা হয়েছে',
        message: 'কন্টেন্ট সফলভাবে মুছে ফেলা হয়েছে'
      });
    }
  };

  // Publish content
  const publishContent = (id: string) => {
    setContents(prev => prev.map(c => 
      c.id === id 
        ? { ...c, status: 'published', publishedAt: new Date() }
        : c
    ));
    
    showNotification({
      type: 'success',
      title: 'প্রকাশিত',
      message: 'কন্টেন্ট সফলভাবে প্রকাশিত হয়েছে'
    });
  };

  // Get content type info
  const getContentTypeInfo = (type: string) => {
    return contentTypes.find(t => t.id === type) || contentTypes[0];
  };

  // Get status info
  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.id === status) || statusOptions[0];
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">কন্টেন্ট ম্যানেজমেন্ট</h1>
              <div className="flex space-x-1">
                {[
                  { id: 'list', label: 'তালিকা', icon: Layout },
                  { id: 'analytics', label: 'বিশ্লেষণ', icon: BarChart3 },
                  { id: 'templates', label: 'টেমপ্লেট', icon: FileText }
                ].map((view) => {
                  const Icon = view.icon;
                  return (
                    <button
                      key={view.id}
                      onClick={() => setCurrentView(view.id as any)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
                        currentView === view.id
                          ? 'bg-medical-primary text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{view.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <button
              onClick={createNewContent}
              className="flex items-center space-x-2 bg-medical-primary text-white px-4 py-2 rounded-lg hover:bg-medical-secondary transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন কন্টেন্ট</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Content List View */}
        {currentView === 'list' && (
          <div>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">অবস্থা</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  >
                    <option value="all">সব অবস্থা</option>
                    {statusOptions.map(status => (
                      <option key={status.id} value={status.id}>{status.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ধরন</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  >
                    <option value="all">সব ধরন</option>
                    {contentTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ভাষা</label>
                  <select
                    value={filters.language}
                    onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  >
                    <option value="all">সব ভাষা</option>
                    <option value="bn">বাংলা</option>
                    <option value="en">ইংরেজি</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">বিভাগ</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  >
                    <option value="all">সব বিভাগ</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredContent().map((content) => {
                const typeInfo = getContentTypeInfo(content.type);
                const statusInfo = getStatusInfo(content.status);
                const TypeIcon = typeInfo.icon;
                
                return (
                  <div key={content.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Content Header */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                          <TypeIcon className="w-4 h-4" />
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => {
                              setSelectedContent(content);
                              setIsEditing(true);
                              setCurrentView('editor');
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="সম্পাদনা"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteContent(content.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{content.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {content.content.substring(0, 150)}...
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>{content.author}</span>
                        <span>{formatDate(content.updatedAt)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                          <span className="text-xs text-gray-500">{content.category}</span>
                        </div>
                        
                        {content.status === 'draft' && (
                          <button
                            onClick={() => publishContent(content.id)}
                            className="text-xs text-green-600 hover:text-green-700 transition-colors"
                          >
                            প্রকাশ করুন
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Content Stats */}
                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{content.views}</span>
                          </span>
                          <span>👍 {content.likes}</span>
                          <span>📤 {content.shares}</span>
                        </div>
                        {content.featured && (
                          <span className="text-yellow-600">⭐ ফিচার্ড</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {getFilteredContent().length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">কোনো কন্টেন্ট পাওয়া যায়নি</h3>
                <p className="text-gray-600 mb-4">নতুন কন্টেন্ট তৈরি করুন বা ফিল্টার পরিবর্তন করুন</p>
                <button
                  onClick={createNewContent}
                  className="bg-medical-primary text-white px-4 py-2 rounded-lg hover:bg-medical-secondary transition-colors"
                >
                  প্রথম কন্টেন্ট তৈরি করুন
                </button>
              </div>
            )}
          </div>
        )}

        {/* Content Editor */}
        {currentView === 'editor' && selectedContent && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {isEditing ? 'কন্টেন্ট সম্পাদনা' : 'নতুন কন্টেন্ট'}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={saveContent}
                  className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>সংরক্ষণ</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentView('list');
                    setSelectedContent(null);
                    setIsEditing(false);
                  }}
                  className="flex items-center space-x-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>বাতিল</span>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">শিরোনাম *</label>
                  <input
                    type="text"
                    value={selectedContent.title}
                    onChange={(e) => setSelectedContent({ ...selectedContent, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-medical-primary"
                    placeholder="কন্টেন্টের শিরোনাম লিখুন"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ধরন *</label>
                  <select
                    value={selectedContent.type}
                    onChange={(e) => setSelectedContent({ ...selectedContent, type: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  >
                    {contentTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">বিভাগ *</label>
                  <select
                    value={selectedContent.category}
                    onChange={(e) => setSelectedContent({ ...selectedContent, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ভাষা *</label>
                  <select
                    value={selectedContent.language}
                    onChange={(e) => setSelectedContent({ ...selectedContent, language: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  >
                    <option value="bn">বাংলা</option>
                    <option value="en">ইংরেজি</option>
                  </select>
                </div>
              </div>
              
              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">কন্টেন্ট *</label>
                <textarea
                  value={selectedContent.content}
                  onChange={(e) => setSelectedContent({ ...selectedContent, content: e.target.value })}
                  rows={12}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  placeholder="আপনার কন্টেন্ট এখানে লিখুন..."
                />
              </div>
              
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ট্যাগ</label>
                <input
                  type="text"
                  value={selectedContent.tags.join(', ')}
                  onChange={(e) => setSelectedContent({ 
                    ...selectedContent, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  placeholder="ট্যাগ কমা দিয়ে আলাদা করুন"
                />
              </div>
              
              {/* SEO */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">SEO সেটিংস</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SEO শিরোনাম</label>
                    <input
                      type="text"
                      value={selectedContent.seoTitle || ''}
                      onChange={(e) => setSelectedContent({ ...selectedContent, seoTitle: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-medical-primary"
                      placeholder="SEO এর জন্য শিরোনাম"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SEO বিবরণ</label>
                    <textarea
                      value={selectedContent.seoDescription || ''}
                      onChange={(e) => setSelectedContent({ ...selectedContent, seoDescription: e.target.value })}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-medical-primary"
                      placeholder="SEO এর জন্য বিবরণ"
                    />
                  </div>
                </div>
              </div>
              
              {/* Options */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedContent.featured}
                      onChange={(e) => setSelectedContent({ ...selectedContent, featured: e.target.checked })}
                      className="rounded border-gray-300 text-medical-primary focus:ring-medical-primary"
                    />
                    <span className="text-sm text-gray-700">ফিচার্ড কন্টেন্ট</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics View */}
        {currentView === 'analytics' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'মোট কন্টেন্ট', value: contents.length, color: 'bg-blue-500' },
                { label: 'প্রকাশিত', value: contents.filter(c => c.status === 'published').length, color: 'bg-green-500' },
                { label: 'খসড়া', value: contents.filter(c => c.status === 'draft').length, color: 'bg-yellow-500' },
                { label: 'মোট ভিউ', value: contents.reduce((sum, c) => sum + c.views, 0), color: 'bg-purple-500' }
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${stat.color} text-white mr-4`}>
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Top Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">জনপ্রিয় কন্টেন্ট</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {contents
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 10)
                  .map((content) => (
                    <div key={content.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{content.title}</h4>
                          <p className="text-sm text-gray-600">{content.category} • {formatDate(content.updatedAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">{content.views}</p>
                          <p className="text-sm text-gray-600">ভিউ</p>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* Templates View */}
        {currentView === 'templates' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  <div className="space-y-2 mb-4">
                    {template.structure.sections.slice(0, 3).map((section) => (
                      <div key={section.id} className="flex items-center space-x-2 text-xs text-gray-500">
                        <div className="w-2 h-2 bg-gray-300 rounded-full" />
                        <span>{section.label}</span>
                        {section.required && <span className="text-red-500">*</span>}
                      </div>
                    ))}
                    {template.structure.sections.length > 3 && (
                      <div className="text-xs text-gray-400">+{template.structure.sections.length - 3} আরো</div>
                    )}
                  </div>
                  <button className="w-full bg-medical-primary text-white py-2 rounded-lg hover:bg-medical-secondary transition-colors">
                    ব্যবহার করুন
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentManagementSystem;