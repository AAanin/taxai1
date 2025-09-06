// Comprehensive Medicine System - সম্পূর্ণ ওষুধ ব্যবস্থাপনা সিস্টেম
import React, { useState, useEffect } from 'react';
import {
  Pill, Search, ShoppingCart, MapPin, Clock, Star, AlertTriangle,
  CheckCircle, Plus, Minus, Filter, SortAsc, Heart, Info,
  Phone, Navigation, Truck, Package, CreditCard, User,
  Calendar, Bell, History, Bookmark, Share2, Download,
  Eye, Edit3, Trash2, RefreshCw, X, ChevronRight,
  Building, Shield, Award, Zap, Target, Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

// Types
interface Medicine {
  id: string;
  name: string;
  genericName: string;
  brandName: string;
  manufacturer: string;
  category: string;
  dosageForm: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'drops' | 'inhaler';
  strength: string;
  price: number;
  discountPrice?: number;
  availability: boolean;
  stockQuantity: number;
  description: string;
  sideEffects: string[];
  contraindications: string[];
  interactions: string[];
  pregnancyCategory: 'A' | 'B' | 'C' | 'D' | 'X';
  prescriptionRequired: boolean;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  expiryDate: Date;
  batchNumber: string;
  composition: string;
  indications: string[];
  dosageInstructions: string;
  storageInstructions: string;
}

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  phone: string;
  email?: string;
  website?: string;
  openingHours: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
  services: string[];
  rating: number;
  reviewCount: number;
  distance?: number;
  deliveryAvailable: boolean;
  deliveryFee: number;
  minimumOrderAmount: number;
  estimatedDeliveryTime: string;
  verified: boolean;
  licenseNumber: string;
  pharmacistName: string;
  emergencyContact?: string;
}

interface CartItem {
  id: string;
  medicine: Medicine;
  quantity: number;
  pharmacy: Pharmacy;
  prescriptionRequired: boolean;
  prescriptionUploaded?: boolean;
  notes?: string;
}

interface Order {
  id: string;
  items: CartItem[];
  pharmacy: Pharmacy;
  totalAmount: number;
  deliveryFee: number;
  discountAmount: number;
  finalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  orderDate: Date;
  estimatedDeliveryDate: Date;
  deliveryAddress: string;
  paymentMethod: 'cash' | 'card' | 'mobile_banking' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed';
  trackingNumber?: string;
  notes?: string;
}

interface MedicineReminder {
  id: string;
  medicine: Medicine;
  dosage: string;
  frequency: string;
  times: string[];
  duration: number; // days
  startDate: Date;
  endDate: Date;
  instructions: string;
  beforeFood: boolean;
  active: boolean;
  completedDoses: Date[];
  missedDoses: Date[];
  nextDoseTime?: Date;
}

interface PriceComparison {
  medicine: Medicine;
  pharmacies: {
    pharmacy: Pharmacy;
    price: number;
    availability: boolean;
    deliveryTime: string;
  }[];
}

const ComprehensiveMedicineSystem: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reminders, setReminders] = useState<MedicineReminder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating'>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [showMedicineDetails, setShowMedicineDetails] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [showPriceComparison, setShowPriceComparison] = useState(false);
  const [priceComparison, setPriceComparison] = useState<PriceComparison | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'cart' | 'orders' | 'reminders'>('browse');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // Initialize data
  useEffect(() => {
    loadMedicineData();
    loadPharmacyData();
    getUserLocation();
  }, []);

  const loadMedicineData = () => {
    // Sample medicine data
    const sampleMedicines: Medicine[] = [
      {
        id: '1',
        name: 'নাপা',
        genericName: 'Paracetamol',
        brandName: 'Napa',
        manufacturer: 'Beximco Pharmaceuticals',
        category: 'Pain Relief',
        dosageForm: 'tablet',
        strength: '500mg',
        price: 2.5,
        discountPrice: 2.0,
        availability: true,
        stockQuantity: 500,
        description: 'ব্যথানাশক ও জ্বর কমানোর ওষুধ',
        sideEffects: ['বমি বমি ভাব', 'চামড়ায় র‍্যাশ'],
        contraindications: ['লিভারের গুরুতর রোগ'],
        interactions: ['ওয়ারফারিন', 'অ্যালকোহল'],
        pregnancyCategory: 'B',
        prescriptionRequired: false,
        rating: 4.5,
        reviewCount: 1250,
        expiryDate: new Date('2025-12-31'),
        batchNumber: 'NP2024001',
        composition: 'Paracetamol 500mg',
        indications: ['জ্বর', 'মাথাব্যথা', 'দাঁতের ব্যথা'],
        dosageInstructions: 'দিনে ৩ বার, খাবারের পর',
        storageInstructions: 'ঠান্ডা ও শুকনো স্থানে রাখুন'
      },
      {
        id: '2',
        name: 'অ্যামক্সি',
        genericName: 'Amoxicillin',
        brandName: 'Amoxi',
        manufacturer: 'Square Pharmaceuticals',
        category: 'Antibiotic',
        dosageForm: 'capsule',
        strength: '250mg',
        price: 8.0,
        availability: true,
        stockQuantity: 200,
        description: 'ব্যাকটেরিয়া সংক্রমণের জন্য অ্যান্টিবায়োটিক',
        sideEffects: ['ডায়রিয়া', 'বমি বমি ভাব', 'চামড়ায় র‍্যাশ'],
        contraindications: ['পেনিসিলিন এলার্জি'],
        interactions: ['মেথোট্রেক্সেট', 'জন্মনিয়ন্ত্রণ পিল'],
        pregnancyCategory: 'B',
        prescriptionRequired: true,
        rating: 4.2,
        reviewCount: 890,
        expiryDate: new Date('2025-08-15'),
        batchNumber: 'AM2024002',
        composition: 'Amoxicillin 250mg',
        indications: ['শ্বাসযন্ত্রের সংক্রমণ', 'মূত্রনালীর সংক্রমণ'],
        dosageInstructions: 'দিনে ৩ বার, ৮ ঘন্টা অন্তর',
        storageInstructions: 'ফ্রিজে রাখুন'
      },
      {
        id: '3',
        name: 'ওমি',
        genericName: 'Omeprazole',
        brandName: 'Omi',
        manufacturer: 'Incepta Pharmaceuticals',
        category: 'Gastric',
        dosageForm: 'capsule',
        strength: '20mg',
        price: 6.0,
        availability: true,
        stockQuantity: 300,
        description: 'পেটের অ্যাসিড কমানোর ওষুধ',
        sideEffects: ['মাথাব্যথা', 'ডায়রিয়া', 'পেটে ব্যথা'],
        contraindications: ['ওমিপ্রাজলে এলার্জি'],
        interactions: ['ক্লোপিডোগ্রেল', 'ওয়ারফারিন'],
        pregnancyCategory: 'C',
        prescriptionRequired: false,
        rating: 4.3,
        reviewCount: 650,
        expiryDate: new Date('2025-10-20'),
        batchNumber: 'OM2024003',
        composition: 'Omeprazole 20mg',
        indications: ['গ্যাস্ট্রিক আলসার', 'অ্যাসিডিটি'],
        dosageInstructions: 'দিনে ১ বার, খাবারের আগে',
        storageInstructions: 'সাধারণ তাপমাত্রায় রাখুন'
      },
      {
        id: '4',
        name: 'গ্লুকোফেজ',
        genericName: 'Metformin',
        brandName: 'Glucophage',
        manufacturer: 'Aristopharma',
        category: 'Diabetes',
        dosageForm: 'tablet',
        strength: '500mg',
        price: 4.5,
        availability: true,
        stockQuantity: 400,
        description: 'ডায়াবেটিস নিয়ন্ত্রণের ওষুধ',
        sideEffects: ['বমি বমি ভাব', 'ডায়রিয়া', 'মুখে ধাতব স্বাদ'],
        contraindications: ['কিডনি রোগ', 'লিভার রোগ'],
        interactions: ['অ্যালকোহল', 'কনট্রাস্ট ডাই'],
        pregnancyCategory: 'B',
        prescriptionRequired: true,
        rating: 4.4,
        reviewCount: 1100,
        expiryDate: new Date('2025-06-30'),
        batchNumber: 'GL2024004',
        composition: 'Metformin HCl 500mg',
        indications: ['টাইপ ২ ডায়াবেটিস'],
        dosageInstructions: 'দিনে ২ বার, খাবারের সাথে',
        storageInstructions: 'ঠান্ডা ও শুকনো স্থানে রাখুন'
      },
      {
        id: '5',
        name: 'অ্যামলো',
        genericName: 'Amlodipine',
        brandName: 'Amlo',
        manufacturer: 'Novartis',
        category: 'Hypertension',
        dosageForm: 'tablet',
        strength: '5mg',
        price: 7.5,
        availability: true,
        stockQuantity: 250,
        description: 'উচ্চ রক্তচাপ নিয়ন্ত্রণের ওষুধ',
        sideEffects: ['পায়ে ফোলা', 'মাথা ঘোরা', 'ক্লান্তি'],
        contraindications: ['কার্ডিওজেনিক শক'],
        interactions: ['সিমভাস্ট্যাটিন', 'সাইক্লোস্পোরিন'],
        pregnancyCategory: 'C',
        prescriptionRequired: true,
        rating: 4.1,
        reviewCount: 780,
        expiryDate: new Date('2025-09-15'),
        batchNumber: 'AM2024005',
        composition: 'Amlodipine Besylate 5mg',
        indications: ['উচ্চ রক্তচাপ', 'এনজাইনা'],
        dosageInstructions: 'দিনে ১ বার, যেকোনো সময়',
        storageInstructions: 'সাধারণ তাপমাত্রায় রাখুন'
      }
    ];

    setMedicines(sampleMedicines);
  };

  const loadPharmacyData = () => {
    // Sample pharmacy data
    const samplePharmacies: Pharmacy[] = [
      {
        id: '1',
        name: 'লাজুর ফার্মেসি',
        address: 'ধানমন্ডি ২৭, ঢাকা-১২০৫',
        location: { lat: 23.7461, lng: 90.3742 },
        phone: '01711-123456',
        email: 'info@lazurpharmacy.com',
        openingHours: {
          'সোমবার': { open: '08:00', close: '22:00' },
          'মঙ্গলবার': { open: '08:00', close: '22:00' },
          'বুধবার': { open: '08:00', close: '22:00' },
          'বৃহস্পতিবার': { open: '08:00', close: '22:00' },
          'শুক্রবার': { open: '08:00', close: '22:00' },
          'শনিবার': { open: '08:00', close: '22:00' },
          'রবিবার': { open: '10:00', close: '20:00' }
        },
        services: ['হোম ডেলিভারি', '২৪/৭ জরুরি সেবা', 'অনলাইন অর্ডার', 'প্রেসক্রিপশন আপলোড'],
        rating: 4.6,
        reviewCount: 1250,
        distance: 1.2,
        deliveryAvailable: true,
        deliveryFee: 50,
        minimumOrderAmount: 200,
        estimatedDeliveryTime: '৩০-৪৫ মিনিট',
        verified: true,
        licenseNumber: 'DH-2024-001',
        pharmacistName: 'ডা. রহিমা খাতুন',
        emergencyContact: '01711-123457'
      },
      {
        id: '2',
        name: 'সিটি ফার্মেসি',
        address: 'গুলশান ২, ঢাকা-১২১২',
        location: { lat: 23.7925, lng: 90.4078 },
        phone: '01811-234567',
        openingHours: {
          'সোমবার': { open: '09:00', close: '21:00' },
          'মঙ্গলবার': { open: '09:00', close: '21:00' },
          'বুধবার': { open: '09:00', close: '21:00' },
          'বৃহস্পতিবার': { open: '09:00', close: '21:00' },
          'শুক্রবার': { open: '09:00', close: '21:00' },
          'শনিবার': { open: '09:00', close: '21:00' },
          'রবিবার': { open: '10:00', close: '18:00' }
        },
        services: ['হোম ডেলিভারি', 'অনলাইন অর্ডার', 'স্বাস্থ্য পরামর্শ'],
        rating: 4.3,
        reviewCount: 890,
        distance: 2.8,
        deliveryAvailable: true,
        deliveryFee: 60,
        minimumOrderAmount: 300,
        estimatedDeliveryTime: '৪৫-৬০ মিনিট',
        verified: true,
        licenseNumber: 'DH-2024-002',
        pharmacistName: 'ডা. করিম উদ্দিন'
      },
      {
        id: '3',
        name: 'হেলথ প্লাস ফার্মেসি',
        address: 'উত্তরা সেক্টর ৭, ঢাকা-১২৩০',
        location: { lat: 23.8759, lng: 90.3795 },
        phone: '01911-345678',
        openingHours: {
          'সোমবার': { open: '08:30', close: '22:30' },
          'মঙ্গলবার': { open: '08:30', close: '22:30' },
          'বুধবার': { open: '08:30', close: '22:30' },
          'বৃহস্পতিবার': { open: '08:30', close: '22:30' },
          'শুক্রবার': { open: '08:30', close: '22:30' },
          'শনিবার': { open: '08:30', close: '22:30' },
          'রবিবার': { open: '09:00', close: '21:00' }
        },
        services: ['২৪/৭ সেবা', 'হোম ডেলিভারি', 'জরুরি ওষুধ', 'বিশেষজ্ঞ পরামর্শ'],
        rating: 4.8,
        reviewCount: 1580,
        distance: 5.1,
        deliveryAvailable: true,
        deliveryFee: 80,
        minimumOrderAmount: 250,
        estimatedDeliveryTime: '৬০-৯০ মিনিট',
        verified: true,
        licenseNumber: 'DH-2024-003',
        pharmacistName: 'ডা. ফাতেমা বেগম',
        emergencyContact: '01911-345679'
      }
    ];

    setPharmacies(samplePharmacies);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Default to Dhaka location
          setUserLocation({ lat: 23.8103, lng: 90.4125 });
        }
      );
    }
  };

  // Filter and sort medicines
  const filteredMedicines = medicines
    .filter(medicine => {
      const matchesSearch = medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           medicine.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           medicine.brandName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || medicine.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (a.discountPrice || a.price) - (b.discountPrice || b.price);
        case 'rating':
          return b.rating - a.rating;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // Add to cart
  const addToCart = (medicine: Medicine, pharmacy: Pharmacy, quantity: number = 1) => {
    const existingItem = cart.find(item => 
      item.medicine.id === medicine.id && item.pharmacy.id === pharmacy.id
    );

    if (existingItem) {
      setCart(cart.map(item => 
        item.id === existingItem.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        medicine,
        quantity,
        pharmacy,
        prescriptionRequired: medicine.prescriptionRequired,
        prescriptionUploaded: false
      };
      setCart([...cart, newItem]);
    }

    showNotification(`${medicine.name} কার্টে যোগ করা হয়েছে`, 'success');
  };

  // Remove from cart
  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
    showNotification('পণ্য কার্ট থেকে সরানো হয়েছে', 'info');
  };

  // Update cart quantity
  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(cart.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  // Calculate cart total
  const calculateCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.medicine.discountPrice || item.medicine.price;
      return total + (price * item.quantity);
    }, 0);
  };

  // Place order
  const placeOrder = (pharmacy: Pharmacy, items: CartItem[]) => {
    const totalAmount = items.reduce((total, item) => {
      const price = item.medicine.discountPrice || item.medicine.price;
      return total + (price * item.quantity);
    }, 0);

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      items,
      pharmacy,
      totalAmount,
      deliveryFee: pharmacy.deliveryFee,
      discountAmount: 0,
      finalAmount: totalAmount + pharmacy.deliveryFee,
      status: 'pending',
      orderDate: new Date(),
      estimatedDeliveryDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      deliveryAddress: 'ব্যবহারকারীর ঠিকানা',
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      trackingNumber: `TRK${Date.now()}`
    };

    setOrders([newOrder, ...orders]);
    
    // Remove ordered items from cart
    const orderedItemIds = items.map(item => item.id);
    setCart(cart.filter(item => !orderedItemIds.includes(item.id)));
    
    showNotification('অর্ডার সফলভাবে দেওয়া হয়েছে', 'success');
    setShowCart(false);
    setActiveTab('orders');
  };

  // Compare prices
  const comparePrices = (medicine: Medicine) => {
    const comparison: PriceComparison = {
      medicine,
      pharmacies: pharmacies.map(pharmacy => ({
        pharmacy,
        price: medicine.discountPrice || medicine.price,
        availability: medicine.availability,
        deliveryTime: pharmacy.estimatedDeliveryTime
      })).sort((a, b) => a.price - b.price)
    };
    
    setPriceComparison(comparison);
    setShowPriceComparison(true);
  };

  // Add reminder
  const addReminder = (medicine: Medicine, dosage: string, frequency: string, duration: number) => {
    const newReminder: MedicineReminder = {
      id: `reminder-${Date.now()}`,
      medicine,
      dosage,
      frequency,
      times: ['08:00', '14:00', '20:00'], // Default times
      duration,
      startDate: new Date(),
      endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
      instructions: 'খাবারের পর সেবন করুন',
      beforeFood: false,
      active: true,
      completedDoses: [],
      missedDoses: [],
      nextDoseTime: new Date(Date.now() + 60 * 60 * 1000) // Next hour
    };

    setReminders([newReminder, ...reminders]);
    showNotification('ওষুধের রিমাইন্ডার যোগ করা হয়েছে', 'success');
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'pain relief': return <Zap className="w-4 h-4" />;
      case 'antibiotic': return <Shield className="w-4 h-4" />;
      case 'gastric': return <Activity className="w-4 h-4" />;
      case 'diabetes': return <Target className="w-4 h-4" />;
      case 'hypertension': return <Heart className="w-4 h-4" />;
      default: return <Pill className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ওষুধের দোকান</h1>
                <p className="text-sm text-gray-600">সম্পূর্ণ ওষুধ ব্যবস্থাপনা সিস্টেম</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
              
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Bell className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'browse', label: 'ওষুধ খুঁজুন', icon: Search },
              { id: 'cart', label: 'কার্ট', icon: ShoppingCart, count: cart.length },
              { id: 'orders', label: 'অর্ডার', icon: Package, count: orders.length },
              { id: 'reminders', label: 'রিমাইন্ডার', icon: Bell, count: reminders.filter(r => r.active).length }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'browse' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="ওষুধের নাম খুঁজুন..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">সব ক্যাটেগরি</option>
                    <option value="Pain Relief">ব্যথানাশক</option>
                    <option value="Antibiotic">অ্যান্টিবায়োটিক</option>
                    <option value="Gastric">গ্যাস্ট্রিক</option>
                    <option value="Diabetes">ডায়াবেটিস</option>
                    <option value="Hypertension">উচ্চ রক্তচাপ</option>
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="name">নাম অনুযায়ী</option>
                    <option value="price">দাম অনুযায়ী</option>
                    <option value="rating">রেটিং অনুযায়ী</option>
                  </select>
                  
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Filter className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Medicine Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMedicines.map(medicine => (
                <div key={medicine.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        {getCategoryIcon(medicine.category)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{medicine.name}</h3>
                        <p className="text-sm text-gray-600">{medicine.genericName}</p>
                      </div>
                    </div>
                    
                    {medicine.prescriptionRequired && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        প্রেসক্রিপশন প্রয়োজন
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">শক্তি:</span>
                      <span className="text-sm font-medium">{medicine.strength}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">প্রস্তুতকারক:</span>
                      <span className="text-sm font-medium">{medicine.manufacturer}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">দাম:</span>
                      <div className="flex items-center space-x-2">
                        {medicine.discountPrice && (
                          <span className="text-sm text-gray-500 line-through">{medicine.price} ৳</span>
                        )}
                        <span className="text-lg font-bold text-green-600">
                          {medicine.discountPrice || medicine.price} ৳
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(medicine.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({medicine.reviewCount})</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${
                        medicine.availability ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      <span className="text-sm text-gray-600">
                        {medicine.availability ? 'স্টকে আছে' : 'স্টকে নেই'}
                      </span>
                      {medicine.availability && (
                        <span className="text-xs text-gray-500">({medicine.stockQuantity}টি)</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedMedicine(medicine);
                        setShowMedicineDetails(true);
                      }}
                      className="flex-1 px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      বিস্তারিত
                    </button>
                    
                    <button
                      onClick={() => comparePrices(medicine)}
                      className="px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                    >
                      দাম তুলনা
                    </button>
                    
                    <button
                      onClick={() => addToCart(medicine, pharmacies[0])}
                      disabled={!medicine.availability}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      কার্টে যোগ করুন
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'cart' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">শপিং কার্ট</h2>
            
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">আপনার কার্ট খালি</p>
                <p className="text-sm text-gray-500">ওষুধ যোগ করতে ব্রাউজ ট্যাবে যান</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Pill className="w-6 h-6 text-green-600" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{item.medicine.name}</h3>
                        <p className="text-sm text-gray-600">{item.medicine.genericName} • {item.medicine.strength}</p>
                        <p className="text-sm text-gray-500">{item.pharmacy.name}</p>
                        
                        {item.prescriptionRequired && !item.prescriptionUploaded && (
                          <div className="flex items-center space-x-2 mt-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-600">প্রেসক্রিপশন আপলোড করুন</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {((item.medicine.discountPrice || item.medicine.price) * item.quantity).toFixed(2)} ৳
                        </p>
                        <p className="text-sm text-gray-600">
                          {(item.medicine.discountPrice || item.medicine.price)} ৳ প্রতিটি
                        </p>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-gray-900">মোট:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {calculateCartTotal().toFixed(2)} ৳
                    </span>
                  </div>
                  
                  <button
                    onClick={() => placeOrder(pharmacies[0], cart)}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    অর্ডার করুন
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">আমার অর্ডার</h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">কোনো অর্ডার নেই</p>
                <p className="text-sm text-gray-500">প্রথম অর্ডার দিন</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">অর্ডার #{order.id.slice(-8)}</h3>
                        <p className="text-sm text-gray-600">{order.orderDate.toLocaleDateString('bn-BD')}</p>
                      </div>
                      
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'preparing' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'out_for_delivery' ? 'bg-orange-100 text-orange-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status === 'pending' ? 'অপেক্ষমান' :
                         order.status === 'confirmed' ? 'নিশ্চিত' :
                         order.status === 'preparing' ? 'প্রস্তুত হচ্ছে' :
                         order.status === 'out_for_delivery' ? 'ডেলিভারির পথে' :
                         order.status === 'delivered' ? 'ডেলিভার হয়েছে' :
                         'বাতিল'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{item.medicine.name} x {item.quantity}</span>
                          <span>{((item.medicine.discountPrice || item.medicine.price) * item.quantity).toFixed(2)} ৳</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>সাবটোটাল:</span>
                        <span>{order.totalAmount.toFixed(2)} ৳</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>ডেলিভারি চার্জ:</span>
                        <span>{order.deliveryFee.toFixed(2)} ৳</span>
                      </div>
                      <div className="flex items-center justify-between text-lg font-bold text-gray-900">
                        <span>মোট:</span>
                        <span>{order.finalAmount.toFixed(2)} ৳</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-600">
                        <p>ফার্মেসি: {order.pharmacy.name}</p>
                        <p>ট্র্যাকিং: {order.trackingNumber}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition-colors text-sm">
                          ট্র্যাক করুন
                        </button>
                        <button className="px-3 py-1 text-green-600 border border-green-300 rounded hover:bg-green-50 transition-colors text-sm">
                          আবার অর্ডার করুন
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'reminders' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">ওষুধের রিমাইন্ডার</h2>
            
            {reminders.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">কোনো রিমাইন্ডার নেই</p>
                <p className="text-sm text-gray-500">ওষুধের রিমাইন্ডার যোগ করুন</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reminders.map(reminder => (
                  <div key={reminder.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Pill className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{reminder.medicine.name}</h3>
                          <p className="text-sm text-gray-600">{reminder.dosage} • {reminder.frequency}</p>
                        </div>
                      </div>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        reminder.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {reminder.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">শুরুর তারিখ:</span>
                        <p>{reminder.startDate.toLocaleDateString('bn-BD')}</p>
                      </div>
                      <div>
                        <span className="font-medium">শেষ তারিখ:</span>
                        <p>{reminder.endDate.toLocaleDateString('bn-BD')}</p>
                      </div>
                      <div>
                        <span className="font-medium">সম্পন্ন ডোজ:</span>
                        <p>{reminder.completedDoses.length}</p>
                      </div>
                      <div>
                        <span className="font-medium">মিস করা ডোজ:</span>
                        <p>{reminder.missedDoses.length}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <p>পরবর্তী ডোজ: {reminder.nextDoseTime?.toLocaleString('bn-BD')}</p>
                        <p>নির্দেশনা: {reminder.instructions}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition-colors text-sm">
                          সম্পাদনা
                        </button>
                        <button className="px-3 py-1 text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors text-sm">
                          মুছুন
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Medicine Details Modal */}
      {showMedicineDetails && selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl max-h-[90vh] w-full mx-4 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedMedicine.name}</h2>
                <button
                  onClick={() => setShowMedicineDetails(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">জেনেরিক নাম</h3>
                    <p className="text-gray-900">{selectedMedicine.genericName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">ব্র্যান্ড নাম</h3>
                    <p className="text-gray-900">{selectedMedicine.brandName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">প্রস্তুতকারক</h3>
                    <p className="text-gray-900">{selectedMedicine.manufacturer}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">শক্তি</h3>
                    <p className="text-gray-900">{selectedMedicine.strength}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">বিবরণ</h3>
                  <p className="text-gray-900">{selectedMedicine.description}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">উপাদান</h3>
                  <p className="text-gray-900">{selectedMedicine.composition}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">ব্যবহার</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedMedicine.indications.map((indication, index) => (
                      <li key={index} className="text-gray-900">{indication}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">সেবনবিধি</h3>
                  <p className="text-gray-900">{selectedMedicine.dosageInstructions}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">সংরক্ষণ</h3>
                  <p className="text-gray-900">{selectedMedicine.storageInstructions}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">পার্শ্বপ্রতিক্রিয়া</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedMedicine.sideEffects.map((effect, index) => (
                      <li key={index} className="text-gray-900">{effect}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">সতর্কতা</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedMedicine.contraindications.map((contraindication, index) => (
                      <li key={index} className="text-gray-900">{contraindication}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      addToCart(selectedMedicine, pharmacies[0]);
                      setShowMedicineDetails(false);
                    }}
                    disabled={!selectedMedicine.availability}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    কার্টে যোগ করুন
                  </button>
                  
                  <button
                    onClick={() => {
                      addReminder(selectedMedicine, '1 tablet', 'দিনে ২ বার', 7);
                      setShowMedicineDetails(false);
                    }}
                    className="px-6 py-3 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    রিমাইন্ডার যোগ করুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Comparison Modal */}
      {showPriceComparison && priceComparison && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full mx-4 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">দাম তুলনা - {priceComparison.medicine.name}</h2>
                <button
                  onClick={() => setShowPriceComparison(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {priceComparison.pharmacies.map((item, index) => (
                  <div key={item.pharmacy.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Building className="w-5 h-5 text-gray-600" />
                          <h3 className="text-lg font-semibold text-gray-900">{item.pharmacy.name}</h3>
                          {item.pharmacy.verified && (
                            <CheckCircle className="w-5 h-5 text-green-600" title="যাচাইকৃত" />
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">ঠিকানা:</span>
                            <p>{item.pharmacy.address}</p>
                          </div>
                          <div>
                            <span className="font-medium">ডেলিভারি সময়:</span>
                            <p>{item.deliveryTime}</p>
                          </div>
                          <div>
                            <span className="font-medium">রেটিং:</span>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span>{item.pharmacy.rating}</span>
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">স্ট্যাটাস:</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.availability ? 'স্টকে আছে' : 'স্টকে নেই'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right ml-6">
                        <div className="text-2xl font-bold text-green-600 mb-2">{item.price} ৳</div>
                        {index === 0 && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            সবচেয়ে কম দাম
                          </span>
                        )}
                        
                        <div className="mt-3">
                          <button
                            onClick={() => {
                              addToCart(priceComparison.medicine, item.pharmacy);
                              setShowPriceComparison(false);
                            }}
                            disabled={!item.availability}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            কার্টে যোগ করুন
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveMedicineSystem;