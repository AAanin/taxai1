// Search Interface Component - সার্চ ইন্টারফেস কম্পোনেন্ট
// Provides comprehensive search functionality for medical services and information

import React, { useState, useEffect } from 'react';
import { Search, X, Clock, TrendingUp, FileText, User, Calendar, Pill, Bot, Loader } from 'lucide-react';
import langchainService from '../services/langchainService';

export interface SearchInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (query: string) => void;
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({
  isOpen,
  onClose,
  onSearch
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentSearches] = useState([
    'ডায়াবেটিস চিকিৎসা',
    'হার্টের সমস্যা',
    'রক্তচাপ নিয়ন্ত্রণ',
    'ওজন কমানোর উপায়'
  ]);

  const [popularSearches] = useState([
    'জ্বর ও সর্দি',
    'পেটের সমস্যা',
    'মাথাব্যথা',
    'ত্বকের রোগ',
    'চোখের সমস্যা'
  ]);

  const [searchCategories] = useState([
    { icon: User, name: 'ডাক্তার খুঁজুন', description: 'বিশেষজ্ঞ ডাক্তার খুঁজে নিন' },
    { icon: Calendar, name: 'অ্যাপয়েন্টমেন্ট', description: 'দ্রুত অ্যাপয়েন্টমেন্ট বুক করুন' },
    { icon: Pill, name: 'ওষুধের তথ্য', description: 'ওষুধের বিস্তারিত জানুন' },
    { icon: FileText, name: 'স্বাস্থ্য তথ্য', description: 'রোগ ও চিকিৎসার তথ্য' }
  ]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      setIsSearching(true);
      try {
        // Get AI-powered search suggestions
        const aiResponse = await langchainService.generateMedicalResponse(
          `আমি "${query}" সম্পর্কে জানতে চাই। এই বিষয়ে সংক্ষিপ্ত এবং সহায়ক তথ্য দিন।`,
          'bn'
        );
        
        // Generate search results based on AI response
        const results = [
          {
            type: 'ai_suggestion',
            title: 'AI পরামর্শ',
            content: aiResponse,
            icon: Bot
          },
          {
            type: 'doctor_consultation',
            title: 'ডাক্তারের পরামর্শ নিন',
            content: `"${query}" সম্পর্কে বিশেষজ্ঞ ডাক্তারের সাথে কথা বলুন`,
            icon: User
          },
          {
            type: 'appointment',
            title: 'অ্যাপয়েন্টমেন্ট বুক করুন',
            content: `"${query}" সংক্রান্ত সমস্যার জন্য অ্যাপয়েন্টমেন্ট নিন`,
            icon: Calendar
          }
        ];
        
        setSearchResults(results);
        
        if (onSearch) {
          onSearch(query);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([
          {
            type: 'error',
            title: 'অনুসন্ধানে সমস্যা',
            content: 'দুঃখিত, এই মুহূর্তে অনুসন্ধান করা যাচ্ছে না। পরে আবার চেষ্টা করুন।',
            icon: X
          }
        ]);
      } finally {
        setIsSearching(false);
      }
    }
  };

  // Generate AI suggestions based on search query
  const generateAISuggestions = async (query: string) => {
    if (query.length > 2) {
      try {
        const suggestions = [
          `${query} এর লক্ষণ`,
          `${query} এর চিকিৎসা`,
          `${query} প্রতিরোধের উপায়`,
          `${query} সংক্রান্ত ডাক্তার`
        ];
        setAiSuggestions(suggestions);
      } catch (error) {
        console.error('AI suggestion error:', error);
      }
    } else {
      setAiSuggestions([]);
    }
  };

  // Debounced AI suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        generateAISuggestions(searchQuery);
      } else {
        setAiSuggestions([]);
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="flex items-start justify-center min-h-screen pt-16 px-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">খুঁজুন</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              {isSearching ? (
                <Loader className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5 animate-spin" />
              ) : (
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              )}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="আপনি কি খুঁজছেন? (AI সহায়তা সহ)"
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                autoFocus
                disabled={isSearching}
              />
              {searchQuery && !isSearching && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setAiSuggestions([]);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && (
              <div className="mt-3 space-y-1">
                <div className="flex items-center text-xs text-blue-600 mb-2">
                  <Bot className="w-3 h-3 mr-1" />
                  AI পরামর্শ
                </div>
                {aiSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(suggestion);
                      handleSearch(suggestion);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            
            {searchQuery && (
              <button
                onClick={() => handleSearch(searchQuery)}
                disabled={isSearching}
                className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
              >
                {isSearching ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    অনুসন্ধান করা হচ্ছে...
                  </>
                ) : (
                  'খুঁজুন'
                )}
              </button>
            )}
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                <Search className="w-4 h-4 mr-2" />
                অনুসন্ধানের ফলাফল
              </h3>
              <div className="space-y-3">
                {searchResults.map((result, index) => {
                  const IconComponent = result.icon;
                  return (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                    >
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{result.title}</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{result.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search Categories */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              বিভাগসমূহ
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {searchCategories.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleSearch(category.name)}
                    className="p-4 text-left border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center mb-2">
                      <IconComponent className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium text-gray-900 group-hover:text-blue-600">
                        {category.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent and Popular Searches */}
          <div className="p-6 space-y-6">
            {/* Recent Searches */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                সাম্প্রতিক অনুসন্ধান
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Searches */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                জনপ্রিয় অনুসন্ধান
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchInterface;