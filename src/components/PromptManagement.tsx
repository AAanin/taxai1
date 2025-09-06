import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Copy, Tag, FolderPlus, Save, X, Eye, Download, Upload, Star, Clock, User } from 'lucide-react';

// Interfaces
interface PromptCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: Date;
  promptCount: number;
}

interface PromptTag {
  id: string;
  name: string;
  color: string;
  usageCount: number;
}

interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  variables: string[];
  isPublic: boolean;
  isFavorite: boolean;
  usageCount: number;
  rating: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: string;
}

interface PromptManagementProps {
  language: 'en' | 'bn';
}

const PromptManagement: React.FC<PromptManagementProps> = ({ language }) => {
  // State management
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [tags, setTags] = useState<PromptTag[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'usage' | 'rating'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Form states
  const [promptForm, setPromptForm] = useState<Partial<PromptTemplate>>({
    title: '',
    description: '',
    content: '',
    category: '',
    tags: [],
    variables: [],
    isPublic: true,
    isFavorite: false
  });
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  // Multi-language support
  const t = {
    en: {
      title: 'Prompt Management System',
      createPrompt: 'Create New Prompt',
      createCategory: 'Create Category',
      searchPlaceholder: 'Search prompts...',
      allCategories: 'All Categories',
      sortBy: 'Sort By',
      name: 'Name',
      date: 'Date',
      usage: 'Usage',
      rating: 'Rating',
      gridView: 'Grid View',
      listView: 'List View',
      promptTitle: 'Prompt Title',
      description: 'Description',
      content: 'Prompt Content',
      category: 'Category',
      tags: 'Tags',
      variables: 'Variables',
      isPublic: 'Public',
      isFavorite: 'Favorite',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      copy: 'Copy',
      preview: 'Preview',
      export: 'Export',
      import: 'Import',
      categoryName: 'Category Name',
      categoryDescription: 'Category Description',
      color: 'Color',
      create: 'Create',
      update: 'Update',
      confirmDelete: 'Are you sure you want to delete this prompt?',
      noPrompts: 'No prompts found',
      createdBy: 'Created by',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
      version: 'Version',
      usageCount: 'Usage Count',
      addVariable: 'Add Variable',
      variableName: 'Variable Name',
      enterTags: 'Enter tags (comma separated)',
      selectCategory: 'Select Category',
      promptPreview: 'Prompt Preview',
      variablePreview: 'Variables will be highlighted in preview'
    },
    bn: {
      title: 'প্রমট ম্যানেজমেন্ট সিস্টেম',
      createPrompt: 'নতুন প্রমট তৈরি করুন',
      createCategory: 'ক্যাটাগরি তৈরি করুন',
      searchPlaceholder: 'প্রমট অনুসন্ধান করুন...',
      allCategories: 'সব ক্যাটাগরি',
      sortBy: 'সাজান',
      name: 'নাম',
      date: 'তারিখ',
      usage: 'ব্যবহার',
      rating: 'রেটিং',
      gridView: 'গ্রিড ভিউ',
      listView: 'লিস্ট ভিউ',
      promptTitle: 'প্রমট শিরোনাম',
      description: 'বিবরণ',
      content: 'প্রমট কন্টেন্ট',
      category: 'ক্যাটাগরি',
      tags: 'ট্যাগ',
      variables: 'ভেরিয়েবল',
      isPublic: 'পাবলিক',
      isFavorite: 'পছন্দের',
      save: 'সংরক্ষণ',
      cancel: 'বাতিল',
      edit: 'সম্পাদনা',
      delete: 'মুছে ফেলুন',
      copy: 'কপি',
      preview: 'প্রিভিউ',
      export: 'এক্সপোর্ট',
      import: 'ইমপোর্ট',
      categoryName: 'ক্যাটাগরির নাম',
      categoryDescription: 'ক্যাটাগরির বিবরণ',
      color: 'রঙ',
      create: 'তৈরি করুন',
      update: 'আপডেট',
      confirmDelete: 'আপনি কি নিশ্চিত যে এই প্রমটটি মুছে ফেলতে চান?',
      noPrompts: 'কোন প্রমট পাওয়া যায়নি',
      createdBy: 'তৈরি করেছেন',
      createdAt: 'তৈরির তারিখ',
      updatedAt: 'আপডেটের তারিখ',
      version: 'সংস্করণ',
      usageCount: 'ব্যবহারের সংখ্যা',
      addVariable: 'ভেরিয়েবল যোগ করুন',
      variableName: 'ভেরিয়েবলের নাম',
      enterTags: 'ট্যাগ লিখুন (কমা দিয়ে আলাদা করুন)',
      selectCategory: 'ক্যাটাগরি নির্বাচন করুন',
      promptPreview: 'প্রমট প্রিভিউ',
      variablePreview: 'ভেরিয়েবলগুলি প্রিভিউতে হাইলাইট হবে'
    }
  }[language];

  // Sample data
  useEffect(() => {
    const sampleCategories: PromptCategory[] = [
      {
        id: '1',
        name: 'Medical Consultation',
        description: 'Prompts for medical consultations and diagnosis',
        color: '#10B981',
        createdAt: new Date('2024-01-15'),
        promptCount: 15
      },
      {
        id: '2',
        name: 'Legal Advice',
        description: 'Legal consultation and advice prompts',
        color: '#3B82F6',
        createdAt: new Date('2024-01-20'),
        promptCount: 8
      },
      {
        id: '3',
        name: 'General AI',
        description: 'General purpose AI assistant prompts',
        color: '#8B5CF6',
        createdAt: new Date('2024-01-25'),
        promptCount: 12
      }
    ];

    const sampleTags: PromptTag[] = [
      { id: '1', name: 'diagnosis', color: '#EF4444', usageCount: 25 },
      { id: '2', name: 'consultation', color: '#F59E0B', usageCount: 18 },
      { id: '3', name: 'emergency', color: '#DC2626', usageCount: 12 },
      { id: '4', name: 'prescription', color: '#059669', usageCount: 20 },
      { id: '5', name: 'legal-advice', color: '#7C3AED', usageCount: 15 }
    ];

    const samplePrompts: PromptTemplate[] = [
      {
        id: '1',
        title: 'Medical Symptom Analysis',
        description: 'Analyze patient symptoms and provide preliminary assessment',
        content: 'You are a medical AI assistant. A patient presents with the following symptoms: {symptoms}. Patient age: {age}, Gender: {gender}. Please provide a preliminary analysis including possible conditions, recommended tests, and when to seek immediate medical attention. Always remind that this is not a substitute for professional medical advice.',
        category: '1',
        tags: ['diagnosis', 'consultation'],
        variables: ['symptoms', 'age', 'gender'],
        isPublic: true,
        isFavorite: true,
        usageCount: 45,
        rating: 4.8,
        createdBy: 'Dr. Rahman',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        version: '1.2'
      },
      {
        id: '2',
        title: 'Legal Contract Review',
        description: 'Review and analyze legal contracts',
        content: 'You are a legal AI assistant specializing in contract law. Please review the following contract: {contract_text}. Focus on: 1) Key terms and conditions, 2) Potential risks or unfavorable clauses, 3) Missing important provisions, 4) Recommendations for negotiation. Contract type: {contract_type}.',
        category: '2',
        tags: ['legal-advice', 'contract'],
        variables: ['contract_text', 'contract_type'],
        isPublic: true,
        isFavorite: false,
        usageCount: 28,
        rating: 4.5,
        createdBy: 'Advocate Karim',
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-22'),
        version: '1.0'
      },
      {
        id: '3',
        title: 'Emergency Medical Triage',
        description: 'Triage emergency medical situations',
        content: 'EMERGENCY MEDICAL TRIAGE: Patient presents with: {chief_complaint}. Vital signs: {vital_signs}. Current medications: {medications}. Medical history: {medical_history}. Based on this information, provide: 1) Urgency level (1-5), 2) Immediate actions needed, 3) Specialist referral if required, 4) Red flags to watch for. ALWAYS advise immediate medical attention for emergencies.',
        category: '1',
        tags: ['emergency', 'diagnosis', 'consultation'],
        variables: ['chief_complaint', 'vital_signs', 'medications', 'medical_history'],
        isPublic: true,
        isFavorite: true,
        usageCount: 67,
        rating: 4.9,
        createdBy: 'Dr. Fatima',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-25'),
        version: '2.1'
      }
    ];

    setCategories(sampleCategories);
    setTags(sampleTags);
    setPrompts(samplePrompts);
  }, []);

  // Filter and search logic
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => prompt.tags.includes(tag));
    
    return matchesSearch && matchesCategory && matchesTags;
  }).sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'date':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case 'usage':
        comparison = a.usageCount - b.usageCount;
        break;
      case 'rating':
        comparison = a.rating - b.rating;
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Event handlers
  const handleCreatePrompt = () => {
    if (!promptForm.title || !promptForm.content) return;
    
    const newPrompt: PromptTemplate = {
      id: Date.now().toString(),
      title: promptForm.title,
      description: promptForm.description || '',
      content: promptForm.content,
      category: promptForm.category || '',
      tags: promptForm.tags || [],
      variables: promptForm.variables || [],
      isPublic: promptForm.isPublic ?? true,
      isFavorite: promptForm.isFavorite ?? false,
      usageCount: 0,
      rating: 0,
      createdBy: 'Current User',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0'
    };
    
    setPrompts(prev => [...prev, newPrompt]);
    setPromptForm({
      title: '',
      description: '',
      content: '',
      category: '',
      tags: [],
      variables: [],
      isPublic: true,
      isFavorite: false
    });
    setShowCreateModal(false);
  };

  const handleUpdatePrompt = () => {
    if (!selectedPrompt || !promptForm.title || !promptForm.content) return;
    
    const updatedPrompt: PromptTemplate = {
      ...selectedPrompt,
      title: promptForm.title,
      description: promptForm.description || '',
      content: promptForm.content,
      category: promptForm.category || '',
      tags: promptForm.tags || [],
      variables: promptForm.variables || [],
      isPublic: promptForm.isPublic ?? true,
      isFavorite: promptForm.isFavorite ?? false,
      updatedAt: new Date(),
      version: `${parseFloat(selectedPrompt.version) + 0.1}`.substring(0, 3)
    };
    
    setPrompts(prev => prev.map(p => p.id === selectedPrompt.id ? updatedPrompt : p));
    setSelectedPrompt(null);
    setIsEditing(false);
    setPromptForm({
      title: '',
      description: '',
      content: '',
      category: '',
      tags: [],
      variables: [],
      isPublic: true,
      isFavorite: false
    });
  };

  const handleDeletePrompt = (promptId: string) => {
    if (window.confirm(t.confirmDelete)) {
      setPrompts(prev => prev.filter(p => p.id !== promptId));
    }
  };

  const handleCreateCategory = () => {
    if (!categoryForm.name) return;
    
    const newCategory: PromptCategory = {
      id: Date.now().toString(),
      name: categoryForm.name,
      description: categoryForm.description,
      color: categoryForm.color,
      createdAt: new Date(),
      promptCount: 0
    };
    
    setCategories(prev => [...prev, newCategory]);
    setCategoryForm({ name: '', description: '', color: '#3B82F6' });
    setShowCategoryModal(false);
  };

  const handleCopyPrompt = (prompt: PromptTemplate) => {
    navigator.clipboard.writeText(prompt.content);
  };

  const handleToggleFavorite = (promptId: string) => {
    setPrompts(prev => prev.map(p => 
      p.id === promptId ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  const renderVariablePreview = (content: string, variables: string[]) => {
    let preview = content;
    variables.forEach(variable => {
      const regex = new RegExp(`\\{${variable}\\}`, 'g');
      preview = preview.replace(regex, `<span class="bg-yellow-200 px-1 rounded">{${variable}}</span>`);
    });
    return preview;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <FolderPlus className="h-4 w-4" />
            <span>{t.createCategory}</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>{t.createPrompt}</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{t.allCategories}</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          
          {/* Sort */}
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">{t.date}</option>
              <option value="name">{t.name}</option>
              <option value="usage">{t.usage}</option>
              <option value="rating">{t.rating}</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          
          {/* View Mode */}
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t.gridView}
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t.listView}
            </button>
          </div>
        </div>
        
        {/* Tag Filter */}
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => {
                  setSelectedTags(prev => 
                    prev.includes(tag.name) 
                      ? prev.filter(t => t !== tag.name)
                      : [...prev, tag.name]
                  );
                }}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag.name)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: selectedTags.includes(tag.name) ? tag.color : undefined
                }}
              >
                <Tag className="h-3 w-3 inline mr-1" />
                {tag.name} ({tag.usageCount})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prompts Display */}
      {filteredPrompts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">{t.noPrompts}</div>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredPrompts.map(prompt => {
            const category = categories.find(c => c.id === prompt.category);
            
            return (
              <div
                key={prompt.id}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
                  viewMode === 'list' ? 'p-4' : 'p-6'
                }`}
              >
                {viewMode === 'grid' ? (
                  // Grid View
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{prompt.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{prompt.description}</p>
                        {category && (
                          <span
                            className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.name}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleToggleFavorite(prompt.id)}
                        className={`p-1 rounded-full transition-colors ${
                          prompt.isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                        }`}
                      >
                        <Star className={`h-4 w-4 ${prompt.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {prompt.tags.map(tag => {
                        const tagInfo = tags.find(t => t.name === tag);
                        return (
                          <span
                            key={tag}
                            className="px-2 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: tagInfo?.color || '#6B7280' }}
                          >
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {prompt.createdBy}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {prompt.updatedAt.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>⭐ {prompt.rating}</span>
                        <span>📊 {prompt.usageCount}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPrompt(prompt);
                            setShowPreviewModal(true);
                          }}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t.preview}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleCopyPrompt(prompt)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title={t.copy}
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPrompt(prompt);
                            setPromptForm({
                              title: prompt.title,
                              description: prompt.description,
                              content: prompt.content,
                              category: prompt.category,
                              tags: prompt.tags,
                              variables: prompt.variables,
                              isPublic: prompt.isPublic,
                              isFavorite: prompt.isFavorite
                            });
                            setIsEditing(true);
                          }}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t.edit}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePrompt(prompt.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={t.delete}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  // List View
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">{prompt.title}</h3>
                        {prompt.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        {category && (
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{prompt.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{t.createdBy}: {prompt.createdBy}</span>
                        <span>{t.updatedAt}: {prompt.updatedAt.toLocaleDateString()}</span>
                        <span>⭐ {prompt.rating}</span>
                        <span>📊 {prompt.usageCount}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPrompt(prompt);
                          setShowPreviewModal(true);
                        }}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={t.preview}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleCopyPrompt(prompt)}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title={t.copy}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPrompt(prompt);
                          setPromptForm({
                            title: prompt.title,
                            description: prompt.description,
                            content: prompt.content,
                            category: prompt.category,
                            tags: prompt.tags,
                            variables: prompt.variables,
                            isPublic: prompt.isPublic,
                            isFavorite: prompt.isFavorite
                          });
                          setIsEditing(true);
                        }}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={t.edit}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePrompt(prompt.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={t.delete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Prompt Modal */}
      {(showCreateModal || isEditing) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditing ? t.update : t.create} {t.title.split(' ')[0]}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setIsEditing(false);
                    setSelectedPrompt(null);
                    setPromptForm({
                      title: '',
                      description: '',
                      content: '',
                      category: '',
                      tags: [],
                      variables: [],
                      isPublic: true,
                      isFavorite: false
                    });
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.promptTitle}</label>
                    <input
                      type="text"
                      value={promptForm.title || ''}
                      onChange={(e) => setPromptForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter prompt title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.description}</label>
                    <textarea
                      value={promptForm.description || ''}
                      onChange={(e) => setPromptForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter prompt description"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.content}</label>
                    <textarea
                      value={promptForm.content || ''}
                      onChange={(e) => {
                        const content = e.target.value;
                        const variables = extractVariables(content);
                        setPromptForm(prev => ({ ...prev, content, variables }));
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={8}
                      placeholder="Enter prompt content. Use {variable_name} for variables."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.category}</label>
                      <select
                        value={promptForm.category || ''}
                        onChange={(e) => setPromptForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">{t.selectCategory}</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.tags}</label>
                      <input
                        type="text"
                        value={promptForm.tags?.join(', ') || ''}
                        onChange={(e) => {
                          const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                          setPromptForm(prev => ({ ...prev, tags }));
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t.enterTags}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={promptForm.isPublic ?? true}
                        onChange={(e) => setPromptForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">{t.isPublic}</label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isFavorite"
                        checked={promptForm.isFavorite ?? false}
                        onChange={(e) => setPromptForm(prev => ({ ...prev, isFavorite: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="isFavorite" className="text-sm font-medium text-gray-700">{t.isFavorite}</label>
                    </div>
                  </div>
                  
                  {promptForm.variables && promptForm.variables.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.variables}</label>
                      <div className="flex flex-wrap gap-2">
                        {promptForm.variables.map((variable, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                          >
                            {variable}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.promptPreview}</label>
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 h-96 overflow-y-auto">
                    {promptForm.content ? (
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: renderVariablePreview(promptForm.content, promptForm.variables || [])
                        }}
                      />
                    ) : (
                      <div className="text-gray-500 italic">{t.variablePreview}</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setIsEditing(false);
                    setSelectedPrompt(null);
                    setPromptForm({
                      title: '',
                      description: '',
                      content: '',
                      category: '',
                      tags: [],
                      variables: [],
                      isPublic: true,
                      isFavorite: false
                    });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={isEditing ? handleUpdatePrompt : handleCreatePrompt}
                  disabled={!promptForm.title || !promptForm.content}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{isEditing ? t.update : t.save}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t.createCategory}</h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.categoryName}</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter category name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.categoryDescription}</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter category description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.color}</label>
                <input
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={!categoryForm.name}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {t.create}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t.promptPreview}</h2>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setSelectedPrompt(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedPrompt.title}</h3>
                  <p className="text-gray-600 mb-4">{selectedPrompt.description}</p>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    {categories.find(c => c.id === selectedPrompt.category) && (
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: categories.find(c => c.id === selectedPrompt.category)?.color }}
                      >
                        {categories.find(c => c.id === selectedPrompt.category)?.name}
                      </span>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {selectedPrompt.tags.map(tag => {
                        const tagInfo = tags.find(t => t.name === tag);
                        return (
                          <span
                            key={tag}
                            className="px-2 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: tagInfo?.color || '#6B7280' }}
                          >
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">{t.createdBy}:</span>
                      <div>{selectedPrompt.createdBy}</div>
                    </div>
                    <div>
                      <span className="font-medium">{t.version}:</span>
                      <div>{selectedPrompt.version}</div>
                    </div>
                    <div>
                      <span className="font-medium">{t.usageCount}:</span>
                      <div>{selectedPrompt.usageCount}</div>
                    </div>
                    <div>
                      <span className="font-medium">{t.rating}:</span>
                      <div>⭐ {selectedPrompt.rating}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">{t.content}</h4>
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div
                      className="prose prose-sm max-w-none whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: renderVariablePreview(selectedPrompt.content, selectedPrompt.variables)
                      }}
                    />
                  </div>
                </div>
                
                {selectedPrompt.variables.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">{t.variables}</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPrompt.variables.map((variable, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                        >
                          {variable}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => handleCopyPrompt(selectedPrompt)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                >
                  <Copy className="h-4 w-4" />
                  <span>{t.copy}</span>
                </button>
                <button
                  onClick={() => {
                    setPromptForm({
                      title: selectedPrompt.title,
                      description: selectedPrompt.description,
                      content: selectedPrompt.content,
                      category: selectedPrompt.category,
                      tags: selectedPrompt.tags,
                      variables: selectedPrompt.variables,
                      isPublic: selectedPrompt.isPublic,
                      isFavorite: selectedPrompt.isFavorite
                    });
                    setIsEditing(true);
                    setShowPreviewModal(false);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>{t.edit}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptManagement;