import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Search, Plus, Minus, MapPin, Clock, Phone, Star, Filter, Package, Truck, CreditCard } from 'lucide-react';

interface MedicineOrderSystemProps {
  language: 'bn' | 'en';
  onClose: () => void;
}

interface Medicine {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  strength: string;
  form: string;
  price: number;
  discount?: number;
  inStock: boolean;
  prescription: boolean;
  rating: number;
  reviews: number;
  image?: string;
  description: string;
}

interface CartItem extends Medicine {
  quantity: number;
}

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
}

const MedicineOrderSystem: React.FC<MedicineOrderSystemProps> = ({ language, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentStep, setCurrentStep] = useState(1); // 1: Browse, 2: Cart, 3: Checkout
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderHistory, setOrderHistory] = useState<any[]>([]);

  const text = {
    title: language === 'bn' ? 'অনলাইন মেডিসিন অর্ডার' : 'Online Medicine Order',
    subtitle: language === 'bn' ? 'ঘরে বসে ওষুধ অর্ডার করুন' : 'Order medicines from home',
    search: language === 'bn' ? 'ওষুধ খুঁজুন...' : 'Search medicines...',
    categories: language === 'bn' ? 'বিভাগ' : 'Categories',
    all: language === 'bn' ? 'সব' : 'All',
    tablets: language === 'bn' ? 'ট্যাবলেট' : 'Tablets',
    capsules: language === 'bn' ? 'ক্যাপসুল' : 'Capsules',
    syrups: language === 'bn' ? 'সিরাপ' : 'Syrups',
    injections: language === 'bn' ? 'ইনজেকশন' : 'Injections',
    ointments: language === 'bn' ? 'মলম' : 'Ointments',
    addToCart: language === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart',
    cart: language === 'bn' ? 'কার্ট' : 'Cart',
    checkout: language === 'bn' ? 'চেকআউট' : 'Checkout',
    total: language === 'bn' ? 'মোট' : 'Total',
    delivery: language === 'bn' ? 'ডেলিভারি' : 'Delivery',
    grandTotal: language === 'bn' ? 'সর্বমোট' : 'Grand Total',
    selectPharmacy: language === 'bn' ? 'ফার্মেসি নির্বাচন করুন' : 'Select Pharmacy',
    deliveryAddress: language === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Delivery Address',
    paymentMethod: language === 'bn' ? 'পেমেন্ট পদ্ধতি' : 'Payment Method',
    cod: language === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery',
    card: language === 'bn' ? 'কার্ড পেমেন্ট' : 'Card Payment',
    mobile: language === 'bn' ? 'মোবাইল ব্যাংকিং' : 'Mobile Banking',
    placeOrder: language === 'bn' ? 'অর্ডার করুন' : 'Place Order',
    inStock: language === 'bn' ? 'স্টকে আছে' : 'In Stock',
    outOfStock: language === 'bn' ? 'স্টকে নেই' : 'Out of Stock',
    prescription: language === 'bn' ? 'প্রেসক্রিপশন প্রয়োজন' : 'Prescription Required',
    generic: language === 'bn' ? 'জেনেরিক' : 'Generic',
    manufacturer: language === 'bn' ? 'প্রস্তুতকারক' : 'Manufacturer',
    strength: language === 'bn' ? 'শক্তি' : 'Strength',
    form: language === 'bn' ? 'ধরন' : 'Form',
    price: language === 'bn' ? 'দাম' : 'Price',
    quantity: language === 'bn' ? 'পরিমাণ' : 'Quantity',
    remove: language === 'bn' ? 'সরান' : 'Remove',
    continue: language === 'bn' ? 'চালিয়ে যান' : 'Continue',
    back: language === 'bn' ? 'পিছনে' : 'Back',
    orderHistory: language === 'bn' ? 'অর্ডার ইতিহাস' : 'Order History',
    reorder: language === 'bn' ? 'পুনরায় অর্ডার' : 'Reorder',
    trackOrder: language === 'bn' ? 'অর্ডার ট্র্যাক করুন' : 'Track Order'
  };

  const sampleMedicines: Medicine[] = [
    {
      id: '1',
      name: 'Paracetamol 500mg',
      genericName: 'Paracetamol',
      manufacturer: 'Square Pharmaceuticals',
      strength: '500mg',
      form: 'Tablet',
      price: 2.5,
      inStock: true,
      prescription: false,
      rating: 4.5,
      reviews: 120,
      description: language === 'bn' ? 'জ্বর ও ব্যথার জন্য কার্যকর ওষুধ' : 'Effective for fever and pain relief'
    },
    {
      id: '2',
      name: 'Omeprazole 20mg',
      genericName: 'Omeprazole',
      manufacturer: 'Beximco Pharmaceuticals',
      strength: '20mg',
      form: 'Capsule',
      price: 8.0,
      discount: 10,
      inStock: true,
      prescription: true,
      rating: 4.7,
      reviews: 85,
      description: language === 'bn' ? 'গ্যাস্ট্রিক সমস্যার জন্য' : 'For gastric problems'
    },
    {
      id: '3',
      name: 'Cough Syrup 100ml',
      genericName: 'Dextromethorphan',
      manufacturer: 'Incepta Pharmaceuticals',
      strength: '100ml',
      form: 'Syrup',
      price: 45.0,
      inStock: true,
      prescription: false,
      rating: 4.2,
      reviews: 65,
      description: language === 'bn' ? 'কাশির জন্য কার্যকর সিরাপ' : 'Effective cough syrup'
    },
    {
      id: '4',
      name: 'Vitamin D3 1000IU',
      genericName: 'Cholecalciferol',
      manufacturer: 'ACI Limited',
      strength: '1000IU',
      form: 'Tablet',
      price: 12.0,
      inStock: false,
      prescription: false,
      rating: 4.6,
      reviews: 95,
      description: language === 'bn' ? 'ভিটামিন ডি এর অভাব পূরণে' : 'For Vitamin D deficiency'
    }
  ];

  const samplePharmacies: Pharmacy[] = [
    {
      id: '1',
      name: 'Lazz Pharma',
      address: 'Dhanmondi, Dhaka',
      phone: '+880-1700-000000',
      rating: 4.8,
      deliveryTime: '30-45 min',
      deliveryFee: 50,
      minOrder: 200
    },
    {
      id: '2',
      name: 'Pharmacy Plus',
      address: 'Gulshan, Dhaka',
      phone: '+880-1800-000000',
      rating: 4.6,
      deliveryTime: '45-60 min',
      deliveryFee: 60,
      minOrder: 300
    },
    {
      id: '3',
      name: 'MediCare Pharmacy',
      address: 'Uttara, Dhaka',
      phone: '+880-1900-000000',
      rating: 4.7,
      deliveryTime: '25-40 min',
      deliveryFee: 40,
      minOrder: 150
    }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('medicineOrders');
    if (saved) {
      setOrderHistory(JSON.parse(saved));
    }
  }, []);

  const addToCart = (medicine: Medicine) => {
    const existingItem = cart.find(item => item.id === medicine.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === medicine.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...medicine, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => {
      const itemPrice = item.discount 
        ? item.price * (1 - item.discount / 100)
        : item.price;
      return sum + (itemPrice * item.quantity);
    }, 0);
  };

  const placeOrder = () => {
    const order = {
      id: Date.now().toString(),
      items: cart,
      pharmacy: selectedPharmacy,
      deliveryAddress,
      paymentMethod,
      subtotal: getSubtotal(),
      deliveryFee: selectedPharmacy?.deliveryFee || 0,
      total: getSubtotal() + (selectedPharmacy?.deliveryFee || 0),
      status: 'confirmed',
      orderDate: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
    };
    
    const updatedHistory = [order, ...orderHistory];
    setOrderHistory(updatedHistory);
    localStorage.setItem('medicineOrders', JSON.stringify(updatedHistory));
    
    setCart([]);
    setCurrentStep(1);
    alert(language === 'bn' ? 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!' : 'Order placed successfully!');
  };

  const filteredMedicines = sampleMedicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         medicine.genericName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           medicine.form.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderBrowse = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={text.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">{text.all}</option>
          <option value="tablet">{text.tablets}</option>
          <option value="capsule">{text.capsules}</option>
          <option value="syrup">{text.syrups}</option>
          <option value="injection">{text.injections}</option>
          <option value="ointment">{text.ointments}</option>
        </select>
      </div>

      {/* Medicine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMedicines.map((medicine) => (
          <div key={medicine.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{medicine.name}</h3>
                <p className="text-sm text-gray-600">{medicine.genericName}</p>
                <p className="text-xs text-gray-500">{medicine.manufacturer}</p>
              </div>
              <div className="flex items-center space-x-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm text-gray-600">{medicine.rating}</span>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{text.strength}:</span>
                <span className="font-medium">{medicine.strength}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{text.form}:</span>
                <span className="font-medium">{medicine.form}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{text.price}:</span>
                <div className="flex items-center space-x-2">
                  {medicine.discount && (
                    <span className="text-sm text-gray-500 line-through">৳{medicine.price}</span>
                  )}
                  <span className="font-bold text-green-600">
                    ৳{medicine.discount ? (medicine.price * (1 - medicine.discount / 100)).toFixed(2) : medicine.price}
                  </span>
                  {medicine.discount && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                      {medicine.discount}% OFF
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs px-2 py-1 rounded ${
                medicine.inStock 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                {medicine.inStock ? text.inStock : text.outOfStock}
              </span>
              {medicine.prescription && (
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                  {text.prescription}
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{medicine.description}</p>
            
            <button
              onClick={() => addToCart(medicine)}
              disabled={!medicine.inStock}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{text.addToCart}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCart = () => (
    <div className="space-y-6">
      {cart.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {language === 'bn' ? 'আপনার কার্ট খালি' : 'Your cart is empty'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.genericName}</p>
                    <p className="text-sm font-medium text-green-600">
                      ৳{item.discount ? (item.price * (1 - item.discount / 100)).toFixed(2) : item.price} each
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-2 text-right">
                  <span className="font-bold text-gray-800">
                    ৳{((item.discount ? item.price * (1 - item.discount / 100) : item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>{text.total}:</span>
              <span>৳{getSubtotal().toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderCheckout = () => (
    <div className="space-y-6">
      {/* Pharmacy Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{text.selectPharmacy}</h3>
        <div className="space-y-3">
          {samplePharmacies.map((pharmacy) => (
            <div
              key={pharmacy.id}
              onClick={() => setSelectedPharmacy(pharmacy)}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                selectedPharmacy?.id === pharmacy.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-800">{pharmacy.name}</h4>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {pharmacy.address}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <Phone className="w-4 h-4 mr-1" />
                    {pharmacy.phone}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-yellow-500 mb-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm text-gray-600">{pharmacy.rating}</span>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {pharmacy.deliveryTime}
                  </p>
                  <p className="text-sm font-medium text-green-600">
                    {text.delivery}: ৳{pharmacy.deliveryFee}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Delivery Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{text.deliveryAddress}</label>
        <textarea
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={language === 'bn' ? 'আপনার সম্পূর্ণ ঠিকানা লিখুন...' : 'Enter your complete address...'}
        />
      </div>
      
      {/* Payment Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{text.paymentMethod}</label>
        <div className="space-y-2">
          {[
            { value: 'cod', label: text.cod, icon: Package },
            { value: 'card', label: text.card, icon: CreditCard },
            { value: 'mobile', label: text.mobile, icon: Phone }
          ].map((method) => (
            <label key={method.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value={method.value}
                checked={paymentMethod === method.value}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-blue-600"
              />
              <method.icon className="w-5 h-5 text-gray-600" />
              <span className="text-gray-800">{method.label}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Order Summary */}
      {selectedPharmacy && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">
            {language === 'bn' ? 'অর্ডার সারসংক্ষেপ' : 'Order Summary'}
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>{text.total}:</span>
              <span>৳{getSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>{text.delivery}:</span>
              <span>৳{selectedPharmacy.deliveryFee}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>{text.grandTotal}:</span>
              <span>৳{(getSubtotal() + selectedPharmacy.deliveryFee).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">{text.title}</h2>
                <p className="text-blue-100">{text.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {cart.length > 0 && (
                <div className="relative">
                  <ShoppingCart className="w-6 h-6" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
              )}
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex space-x-4 mt-6">
            {[
              { step: 1, label: language === 'bn' ? 'ব্রাউজ' : 'Browse' },
              { step: 2, label: text.cart },
              { step: 3, label: text.checkout }
            ].map((tab) => (
              <button
                key={tab.step}
                onClick={() => setCurrentStep(tab.step)}
                disabled={tab.step === 2 && cart.length === 0}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentStep === tab.step
                    ? 'bg-white text-blue-600'
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {tab.label}
                {tab.step === 2 && cart.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {currentStep === 1 && renderBrowse()}
          {currentStep === 2 && renderCart()}
          {currentStep === 3 && renderCheckout()}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between">
          <button
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            {currentStep === 1 ? (language === 'bn' ? 'বন্ধ করুন' : 'Close') : text.back}
          </button>
          
          {currentStep === 2 && cart.length > 0 && (
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {text.checkout}
            </button>
          )}
          
          {currentStep === 3 && (
            <button
              onClick={placeOrder}
              disabled={!selectedPharmacy || !deliveryAddress}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {text.placeOrder}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicineOrderSystem;