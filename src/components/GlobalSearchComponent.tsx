// Global Search Component - গ্লোবাল সার্চ কম্পোনেন্ট
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, Mic, MicOff, X, Clock, TrendingUp, MapPin, Star, User, Pill, Building2, Calendar } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

// Types and interfaces
interface SearchResult {
  id: string;
  type: 'doctor' | 'medicine' | 'hospital' | 'appointment' | 'service';
  title: string;
  subtitle?: string;
  description?: string;
  rating?: number;
  location?: string;
  availability?: string;
  price?: string;
  image?: string;
  tags?: string[];
}

interface SearchFilters {
  type: string[];
  location: string;
  rating: number;
  priceRange: [number, number];
  availability: string;
  specialization: string[];
}

const GlobalSearchComponent: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showNotification } = useNotification();

  const [filters, setFilters] = useState<SearchFilters>({
    type: [],
    location: '',
    rating: 0,
    priceRange: [0, 10000],
    availability: '',
    specialization: []
  });

  // Mock data for demonstration
  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'doctor',
      title: 'ডা. আহমেদ হাসান',
      subtitle: 'হৃদরোগ বিশেষজ্ঞ',
      description: '১৫ বছরের অভিজ্ঞতা, ঢাকা মেডিকেল কলেজ',
      rating: 4.8,
      location: 'ধানমন্ডি, ঢাকা',
      availability: 'আজ উপলব্ধ',
      price: '৮০০ টাকা',
      tags: ['হৃদরোগ', 'বুকে ব্যথা', 'হার্ট অ্যাটাক']
    },
    {
      id: '2',
      type: 'medicine',
      title: 'প্যারাসিটামল ৫০০mg',
      subtitle: 'Square Pharmaceuticals',
      description: 'জ্বর ও ব্যথার জন্য কার্যকর ওষুধ',
      rating: 4.5,
      price: '২০ টাকা',
      tags: ['জ্বর', 'ব্যথা', 'মাথাব্যথা']
    }
  ];

  // Voice search functionality
  const startVoiceSearch = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'bn-BD';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        performSearch(transcript);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
        showNotification({
          type: 'error',
          title: 'ভয়েস সার্চ ত্রুটি',
          message: 'ভয়েস সার্চ কাজ করছে না। আবার চেষ্টা করুন।'
        });
      };
      
      recognition.start();
    } else {
      showNotification({
        type: 'warning',
        title: 'ভয়েস সার্চ সমর্থিত নয়',
        message: 'আপনার ব্রাউজার ভয়েস সার্চ সমর্থন করে না।'
      });
    }
  }, [showNotification]);

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const filteredResults = mockResults.filter(result => 
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      setResults(filteredResults);
      setIsLoading(false);
      
      // Add to search history
      const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('search_history', JSON.stringify(newHistory));
    }, 500);
  }, [searchHistory, showNotification]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <Search className="w-5 h-5 text-gray-400 ml-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              performSearch(e.target.value);
            }}
            placeholder="ডাক্তার, ওষুধ, হাসপাতাল খুঁজুন..."
            className="flex-1 px-3 py-3 text-gray-900 placeholder-gray-500 bg-transparent border-0 rounded-lg focus:outline-none"
            onFocus={() => setIsExpanded(true)}
          />
          
          {/* Voice Search Button */}
          <button
            onClick={startVoiceSearch}
            disabled={isListening}
            className={`p-2 mr-2 rounded-lg transition-colors ${
              isListening 
                ? 'bg-red-100 text-red-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 mr-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Results */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">খুঁজছি...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((result) => (
                <div key={result.id} className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border-b border-gray-100 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{result.title}</h3>
                      {result.subtitle && (
                        <p className="text-sm text-gray-600">{result.subtitle}</p>
                      )}
                      {result.description && (
                        <p className="text-sm text-gray-500 mt-1">{result.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        {result.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{result.rating}</span>
                          </div>
                        )}
                        {result.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{result.location}</span>
                          </div>
                        )}
                        {result.price && (
                          <span className="font-medium text-green-600">{result.price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : query ? (
            <div className="p-4 text-center text-gray-500">
              <p>কোনো ফলাফল পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="p-4">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">জনপ্রিয় সার্চ</h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(search);
                        performSearch(search);
                      }}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
              
              {searchHistory.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">সাম্প্রতিক সার্চ</h3>
                  <div className="space-y-1">
                    {searchHistory.slice(0, 5).map((search, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setQuery(search);
                          performSearch(search);
                        }}
                        className="flex items-center space-x-2 w-full p-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                      >
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearchComponent;