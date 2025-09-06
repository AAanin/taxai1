// Emergency Services System - জরুরি সেবা সিস্টেম
import React, { useState, useEffect } from 'react';
import {
  Phone, MapPin, Clock, AlertTriangle, Heart, Truck,
   Building2, Shield, Navigation, Users, Star, ExternalLink,
  PhoneCall, MessageCircle, Share2, Bookmark, Filter,
  Search, RefreshCw, Info, CheckCircle, X, Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

// Types
interface EmergencyContact {
  id: string;
  name: string;
  category: 'ambulance' | 'hospital' | 'police' | 'fire' | 'doctor' | 'pharmacy' | 'blood_bank' | 'poison_control';
  phone: string;
  alternatePhone?: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  distance?: number;
  availability: '24/7' | 'limited' | 'emergency_only';
  rating: number;
  verified: boolean;
  services: string[];
  description: string;
  lastUpdated: Date;
}

interface EmergencyAlert {
  id: string;
  type: 'medical' | 'accident' | 'fire' | 'crime' | 'natural_disaster';
  title: string;
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  status: 'active' | 'resolved' | 'investigating';
  affectedArea: string;
  instructions: string[];
}

interface UserLocation {
  lat: number;
  lng: number;
  address: string;
  accuracy: number;
}

interface EmergencyHistory {
  id: string;
  type: string;
  contactId: string;
  timestamp: Date;
  duration?: number;
  notes?: string;
  resolved: boolean;
}

const EmergencyServicesSystem: React.FC = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([]);
  const [emergencyHistory, setEmergencyHistory] = useState<EmergencyHistory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);
  const [activeTab, setActiveTab] = useState<'contacts' | 'alerts' | 'history'>('contacts');
  const [locationLoading, setLocationLoading] = useState(false);
  
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // Initialize data
  useEffect(() => {
    loadEmergencyData();
    getCurrentLocation();
  }, []);

  const loadEmergencyData = () => {
    // Sample emergency contacts
    const sampleContacts: EmergencyContact[] = [
      {
        id: '1',
        name: 'জাতীয় জরুরি সেবা',
        category: 'ambulance',
        phone: '999',
        address: 'সারাদেশব্যাপী',
        location: { lat: 23.8103, lng: 90.4125 },
        availability: '24/7',
        rating: 4.8,
        verified: true,
        services: ['অ্যাম্বুলেন্স', 'ফায়ার সার্ভিস', 'পুলিশ'],
        description: 'বাংলাদেশের জাতীয় জরুরি হটলাইন নম্বর',
        lastUpdated: new Date()
      },
      {
        id: '2',
        name: 'ঢাকা মেডিকেল কলেজ হাসপাতাল',
        category: 'hospital',
        phone: '02-55165088',
        alternatePhone: '02-55165089',
        address: 'বক্সী বাজার, ঢাকা-১০০০',
        location: { lat: 23.7272, lng: 90.3969 },
        distance: 2.5,
        availability: '24/7',
        rating: 4.5,
        verified: true,
        services: ['জরুরি চিকিৎসা', 'অপারেশন', 'আইসিইউ', 'ট্রমা সেন্টার'],
        description: 'দেশের অন্যতম বৃহত্তম সরকারি হাসপাতাল',
        lastUpdated: new Date()
      },
      {
        id: '3',
        name: 'স্কয়ার হাসপাতাল',
        category: 'hospital',
        phone: '02-8159457',
        alternatePhone: '02-9661721',
        address: '১৮/এফ বীরউত্তম কাজী নজরুল ইসলাম এভিনিউ, ঢাকা',
        location: { lat: 23.7516, lng: 90.3876 },
        distance: 3.2,
        availability: '24/7',
        rating: 4.7,
        verified: true,
        services: ['জরুরি চিকিৎসা', 'কার্ডিয়াক কেয়ার', 'নিউরো সার্জারি', 'ক্যান্সার চিকিৎসা'],
        description: 'আধুনিক সুবিধাসহ বেসরকারি হাসপাতাল',
        lastUpdated: new Date()
      },
      {
        id: '4',
        name: 'ঢাকা মেট্রোপলিটন পুলিশ',
        category: 'police',
        phone: '02-9555555',
        address: 'রমনা, ঢাকা',
        location: { lat: 23.7465, lng: 90.3918 },
        distance: 1.8,
        availability: '24/7',
        rating: 4.2,
        verified: true,
        services: ['আইন শৃঙ্খলা', 'ট্রাফিক নিয়ন্ত্রণ', 'অপরাধ তদন্ত'],
        description: 'ঢাকা মহানগর পুলিশ সদর দপ্তর',
        lastUpdated: new Date()
      },
      {
        id: '5',
        name: 'ফায়ার সার্ভিস ও সিভিল ডিফেন্স',
        category: 'fire',
        phone: '02-9555555',
        address: 'মিরপুর, ঢাকা',
        location: { lat: 23.8223, lng: 90.3654 },
        distance: 5.1,
        availability: '24/7',
        rating: 4.6,
        verified: true,
        services: ['অগ্নিনির্বাপণ', 'উদ্ধার কাজ', 'দুর্ঘটনা ব্যবস্থাপনা'],
        description: 'জরুরি অগ্নিনির্বাপণ ও উদ্ধার সেবা',
        lastUpdated: new Date()
      },
      {
        id: '6',
        name: 'কোয়ান্টাম ফাউন্ডেশন অ্যাম্বুলেন্স',
        category: 'ambulance',
        phone: '01713-055555',
        address: 'ধানমন্ডি, ঢাকা',
        location: { lat: 23.7461, lng: 90.3742 },
        distance: 2.1,
        availability: '24/7',
        rating: 4.9,
        verified: true,
        services: ['ফ্রি অ্যাম্বুলেন্স', 'জরুরি পরিবহন', 'প্রাথমিক চিকিৎসা'],
        description: 'বিনামূল্যে অ্যাম্বুলেন্স সেবা',
        lastUpdated: new Date()
      },
      {
        id: '7',
        name: 'পয়জন কন্ট্রোল সেন্টার',
        category: 'poison_control',
        phone: '02-8616384',
        address: 'ঢাকা মেডিকেল কলেজ হাসপাতাল',
        location: { lat: 23.7272, lng: 90.3969 },
        distance: 2.5,
        availability: '24/7',
        rating: 4.4,
        verified: true,
        services: ['বিষক্রিয়া চিকিৎসা', 'জরুরি পরামর্শ', 'অ্যান্টিডোট'],
        description: 'বিষক্রিয়া জনিত জরুরি চিকিৎসা সেবা',
        lastUpdated: new Date()
      },
      {
        id: '8',
        name: 'সন্ধানী ব্লাড ব্যাংক',
        category: 'blood_bank',
        phone: '01713-055555',
        address: 'ঢাকা বিশ্ববিদ্যালয়',
        location: { lat: 23.7286, lng: 90.3854 },
        distance: 1.9,
        availability: '24/7',
        rating: 4.8,
        verified: true,
        services: ['রক্তদান', 'রক্ত সংগ্রহ', 'জরুরি রক্ত সরবরাহ'],
        description: 'স্বেচ্ছাসেবী রক্তদান সংস্থা',
        lastUpdated: new Date()
      }
    ];

    // Sample emergency alerts
    const sampleAlerts: EmergencyAlert[] = [
      {
        id: '1',
        type: 'medical',
        title: 'ডেঙ্গু প্রাদুর্ভাব সতর্কতা',
        description: 'ঢাকা শহরে ডেঙ্গু রোগীর সংখ্যা বৃদ্ধি পেয়েছে',
        location: 'ঢাকা মহানগর',
        severity: 'medium',
        timestamp: new Date('2024-01-20T10:00:00'),
        status: 'active',
        affectedArea: 'ঢাকা উত্তর ও দক্ষিণ সিটি কর্পোরেশন',
        instructions: [
          'মশার কামড় থেকে বাঁচুন',
          'জমে থাকা পানি পরিষ্কার করুন',
          'জ্বর হলে দ্রুত ডাক্তারের পরামর্শ নিন'
        ]
      },
      {
        id: '2',
        type: 'natural_disaster',
        title: 'ভারী বৃষ্টিপাত ও জলাবদ্ধতার সম্ভাবনা',
        description: 'আগামী ২৪ ঘন্টায় ভারী বৃষ্টিপাত ও জলাবদ্ধতার সম্ভাবনা',
        location: 'ঢাকা ও আশপাশের এলাকা',
        severity: 'high',
        timestamp: new Date('2024-01-20T08:00:00'),
        status: 'active',
        affectedArea: 'ঢাকা, গাজীপুর, নারায়ণগঞ্জ',
        instructions: [
          'অপ্রয়োজনে বাইরে যাবেন না',
          'জরুরি প্রয়োজনীয় জিনিস প্রস্তুত রাখুন',
          'বিদ্যুৎ সংযোগ নিরাপদ রাখুন'
        ]
      }
    ];

    setEmergencyContacts(sampleContacts);
    setEmergencyAlerts(sampleAlerts);
  };

  // Get current location
  const getCurrentLocation = () => {
    setLocationLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'বর্তমান অবস্থান',
            accuracy: position.coords.accuracy
          };
          
          setUserLocation(location);
          updateDistances(location);
          setLocationLoading(false);
          showNotification('অবস্থান সফলভাবে নির্ধারণ করা হয়েছে', 'success');
        },
        (error) => {
          console.error('Location error:', error);
          setLocationLoading(false);
          
          // Use default Dhaka location
          const defaultLocation: UserLocation = {
            lat: 23.8103,
            lng: 90.4125,
            address: 'ঢাকা, বাংলাদেশ (ডিফল্ট)',
            accuracy: 1000
          };
          
          setUserLocation(defaultLocation);
          updateDistances(defaultLocation);
          showNotification('ডিফল্ট অবস্থান ব্যবহার করা হচ্ছে', 'info');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setLocationLoading(false);
      showNotification('জিওলোকেশন সাপোর্ট করে না', 'error');
    }
  };

  // Calculate and update distances
  const updateDistances = (location: UserLocation) => {
    setEmergencyContacts(prev => 
      prev.map(contact => ({
        ...contact,
        distance: calculateDistance(
          location.lat,
          location.lng,
          contact.location.lat,
          contact.location.lng
        )
      }))
    );
  };

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Make emergency call
  const makeEmergencyCall = (contact: EmergencyContact) => {
    const historyEntry: EmergencyHistory = {
      id: `call-${Date.now()}`,
      type: 'call',
      contactId: contact.id,
      timestamp: new Date(),
      resolved: false
    };
    
    setEmergencyHistory(prev => [historyEntry, ...prev]);
    
    // Simulate call
    window.open(`tel:${contact.phone}`);
    showNotification(`${contact.name} এ কল করা হচ্ছে`, 'info');
  };

  // Send emergency SMS
  const sendEmergencySMS = (contact: EmergencyContact) => {
    const message = `জরুরি সাহায্য প্রয়োজন। আমার অবস্থান: ${userLocation?.address || 'অজানা'}। অনুগ্রহ করে দ্রুত সাহায্য পাঠান।`;
    window.open(`sms:${contact.phone}?body=${encodeURIComponent(message)}`);
    showNotification('জরুরি SMS পাঠানো হয়েছে', 'success');
  };

  // Share location
  const shareLocation = (contact: EmergencyContact) => {
    if (userLocation) {
      const locationUrl = `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`;
      const message = `আমার বর্তমান অবস্থান: ${locationUrl}`;
      
      if (navigator.share) {
        navigator.share({
          title: 'জরুরি অবস্থান শেয়ার',
          text: message,
          url: locationUrl
        });
      } else {
        navigator.clipboard.writeText(message);
        showNotification('অবস্থান কপি করা হয়েছে', 'success');
      }
    }
  };

  // Filter contacts
  const filteredContacts = emergencyContacts.filter(contact => {
    const matchesCategory = selectedCategory === 'all' || contact.category === selectedCategory;
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.services.some(service => service.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  }).sort((a, b) => (a.distance || 0) - (b.distance || 0));

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ambulance': return <Truck className="w-5 h-5" />;
      case 'hospital': return <Building2 className="w-5 h-5" />;
      case 'police': return <Shield className="w-5 h-5" />;
      case 'fire': return <AlertTriangle className="w-5 h-5" />;
      case 'doctor': return <Heart className="w-5 h-5" />;
      case 'pharmacy': return <Plus className="w-5 h-5" />;
      case 'blood_bank': return <Heart className="w-5 h-5" />;
      case 'poison_control': return <AlertTriangle className="w-5 h-5" />;
      default: return <Phone className="w-5 h-5" />;
    }
  };

  // Get category name
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'ambulance': return 'অ্যাম্বুলেন্স';
      case 'hospital': return 'হাসপাতাল';
      case 'police': return 'পুলিশ';
      case 'fire': return 'ফায়ার সার্ভিস';
      case 'doctor': return 'ডাক্তার';
      case 'pharmacy': return 'ফার্মেসি';
      case 'blood_bank': return 'ব্লাড ব্যাংক';
      case 'poison_control': return 'পয়জন কন্ট্রোল';
      default: return category;
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">জরুরি সেবা</h1>
                <p className="text-sm text-red-100">২৪/৭ জরুরি সাহায্য</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {userLocation && (
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span className="hidden md:inline">{userLocation.address}</span>
                </div>
              )}
              
              <button
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors disabled:opacity-50"
                title="অবস্থান আপডেট করুন"
              >
                <RefreshCw className={`w-5 h-5 ${locationLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Emergency Actions */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => makeEmergencyCall({ id: 'emergency', name: 'জাতীয় জরুরি সেবা', phone: '999' } as EmergencyContact)}
              className="flex flex-col items-center p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Phone className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">৯৯৯</span>
              <span className="text-xs">জরুরি কল</span>
            </button>
            
            <button
              onClick={() => makeEmergencyCall({ id: 'ambulance', name: 'অ্যাম্বুলেন্স', phone: '01713055555' } as EmergencyContact)}
              className="flex flex-col items-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Truck className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">অ্যাম্বুলেন্স</span>
              <span className="text-xs">দ্রুত সেবা</span>
            </button>
            
            <button
              onClick={() => makeEmergencyCall({ id: 'hospital', name: 'নিকটতম হাসপাতাল', phone: '02-55165088' } as EmergencyContact)}
              className="flex flex-col items-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Building2 className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">হাসপাতাল</span>
              <span className="text-xs">জরুরি চিকিৎসা</span>
            </button>
            
            <button
              onClick={() => shareLocation({ id: 'share', name: 'অবস্থান শেয়ার', phone: '' } as EmergencyContact)}
              className="flex flex-col items-center p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Share2 className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">অবস্থান</span>
              <span className="text-xs">শেয়ার করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'contacts', label: 'জরুরি যোগাযোগ', icon: Phone },
              { id: 'alerts', label: 'সতর্কতা', icon: AlertTriangle },
              { id: 'history', label: 'ইতিহাস', icon: Clock }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="সেবা বা প্রতিষ্ঠান খুঁজুন..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="all">সব ক্যাটেগরি</option>
                    <option value="ambulance">অ্যাম্বুলেন্স</option>
                    <option value="hospital">হাসপাতাল</option>
                    <option value="police">পুলিশ</option>
                    <option value="fire">ফায়ার সার্ভিস</option>
                    <option value="doctor">ডাক্তার</option>
                    <option value="pharmacy">ফার্মেসি</option>
                    <option value="blood_bank">ব্লাড ব্যাংক</option>
                    <option value="poison_control">পয়জন কন্ট্রোল</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Emergency Contacts List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContacts.map(contact => (
                <div key={contact.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        contact.category === 'ambulance' ? 'bg-blue-100 text-blue-600' :
                        contact.category === 'hospital' ? 'bg-green-100 text-green-600' :
                        contact.category === 'police' ? 'bg-purple-100 text-purple-600' :
                        contact.category === 'fire' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {getCategoryIcon(contact.category)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                        <p className="text-sm text-gray-600">{getCategoryName(contact.category)}</p>
                      </div>
                    </div>
                    
                    {contact.verified && (
                      <CheckCircle className="w-5 h-5 text-green-600" title="যাচাইকৃত" />
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="font-medium">{contact.phone}</span>
                    </div>
                    
                    {contact.distance && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{contact.distance.toFixed(1)} কিমি দূরে</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        {contact.availability === '24/7' ? '২৪/৭ সেবা' :
                         contact.availability === 'limited' ? 'সীমিত সময়' : 'শুধু জরুরি'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(contact.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({contact.rating})</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{contact.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {contact.services.slice(0, 3).map((service, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                    {contact.services.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        +{contact.services.length - 3} আরো
                      </span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => makeEmergencyCall(contact)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>কল করুন</span>
                    </button>
                    
                    <button
                      onClick={() => sendEmergencySMS(contact)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="SMS পাঠান"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => shareLocation(contact)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="অবস্থান শেয়ার করুন"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    
                    <button
                      className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="বুকমার্ক করুন"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">জরুরি সতর্কতা</h2>
              
              <div className="space-y-4">
                {emergencyAlerts.map(alert => (
                  <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === 'critical' ? 'bg-red-50 border-red-400' :
                    alert.severity === 'high' ? 'bg-orange-50 border-orange-400' :
                    alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                    'bg-blue-50 border-blue-400'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                            {alert.severity === 'critical' ? 'অত্যন্ত গুরুত্বপূর্ণ' :
                             alert.severity === 'high' ? 'উচ্চ' :
                             alert.severity === 'medium' ? 'মাঝারি' : 'নিম্ন'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>📍 {alert.location}</span>
                          <span>🕒 {alert.timestamp.toLocaleString('bn-BD')}</span>
                          <span className={`px-2 py-1 rounded-full ${
                            alert.status === 'active' ? 'bg-red-100 text-red-800' :
                            alert.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {alert.status === 'active' ? 'সক্রিয়' :
                             alert.status === 'resolved' ? 'সমাধান' : 'তদন্তাধীন'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-800 mb-2">করণীয়:</h4>
                      <ul className="space-y-1">
                        {alert.instructions.map((instruction, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">জরুরি সেবার ইতিহাস</h2>
            
            {emergencyHistory.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">এখনো কোনো জরুরি সেবা ব্যবহার করা হয়নি</p>
              </div>
            ) : (
              <div className="space-y-4">
                {emergencyHistory.map(entry => (
                  <div key={entry.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{entry.type}</h4>
                        <p className="text-sm text-gray-600">{entry.timestamp.toLocaleString('bn-BD')}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.resolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {entry.resolved ? 'সমাধান' : 'চলমান'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyServicesSystem;