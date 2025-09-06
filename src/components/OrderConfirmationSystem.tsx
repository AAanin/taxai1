import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Package, Truck, MapPin, Phone, CreditCard, Calendar, User, AlertCircle } from 'lucide-react';
import { medicalDataService } from '../services/medicalDataService';

interface Order {
  id: string;
  userId: string;
  medicines: { medicineId: string; quantity: number; name: string; price: number }[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  orderDate: Date;
  deliveryAddress: string;
  paymentMethod: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  symptoms: string;
  appointmentType: 'online' | 'offline';
  cost: number;
  hospital?: string;
  location?: string;
}

interface OrderConfirmationSystemProps {
  orderId?: string;
  appointmentId?: string;
  onClose: () => void;
}

const OrderConfirmationSystem: React.FC<OrderConfirmationSystemProps> = ({
  orderId,
  appointmentId,
  onClose
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        if (orderId) {
          const orderData = await medicalDataService.getOrderById(orderId);
          if (orderData) {
            // Enhance order data with medicine details
            const enhancedMedicines = await Promise.all(
              orderData.medicines.map(async (item) => {
                const medicine = await medicalDataService.getMedicineById(item.medicineId);
                return {
                  ...item,
                  name: medicine?.name || 'Unknown Medicine',
                  price: medicine?.price || 0
                };
              })
            );
            
            setOrder({
              ...orderData,
              medicines: enhancedMedicines,
              estimatedDelivery: '২-৩ কার্যদিবস',
              trackingNumber: `TRK${orderData.id.slice(-6).toUpperCase()}`
            });
          }
        }
        
        if (appointmentId) {
          const appointmentData = await medicalDataService.getAppointmentById(appointmentId);
          if (appointmentData) {
            const doctor = await medicalDataService.getDoctorById(appointmentData.doctorId);
            setAppointment({
              ...appointmentData,
              doctorName: doctor?.name || 'Unknown Doctor',
              hospital: doctor?.hospital,
              location: doctor?.location
            });
          }
        }
      } catch (err) {
        setError('তথ্য লোড করতে সমস্যা হয়েছে');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [orderId, appointmentId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'delivered':
        return <Package className="w-5 h-5 text-green-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'অপেক্ষমান';
      case 'confirmed':
        return 'নিশ্চিত';
      case 'shipped':
        return 'পাঠানো হয়েছে';
      case 'delivered':
        return 'ডেলিভার হয়েছে';
      case 'completed':
        return 'সম্পন্ন';
      case 'cancelled':
        return 'বাতিল';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">তথ্য লোড হচ্ছে...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">সমস্যা হয়েছে</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-green-50 p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {order ? 'অর্ডার কনফার্মেশন' : 'অ্যাপয়েন্টমেন্ট কনফার্মেশন'}
                </h2>
                <p className="text-green-600">
                  {order ? 'আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে' : 'আপনার অ্যাপয়েন্টমেন্ট বুক করা হয়েছে'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Order Details */}
          {order && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">অর্ডার নম্বর</p>
                    <p className="font-semibold">#{order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">অর্ডারের তারিখ</p>
                    <p className="font-semibold">{order.orderDate.toLocaleDateString('bn-BD')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">স্ট্যাটাস</p>
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <span className="ml-2 font-semibold">{getStatusText(order.status)}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ট্র্যাকিং নম্বর</p>
                    <p className="font-semibold">{order.trackingNumber}</p>
                  </div>
                </div>
              </div>

              {/* Medicine List */}
              <div>
                <h3 className="text-lg font-semibold mb-3">অর্ডারকৃত ওষুধ</h3>
                <div className="space-y-3">
                  {order.medicines.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">পরিমাণ: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">৳{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">মোট</span>
                    <span className="text-lg font-bold text-green-600">৳{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  ডেলিভারি তথ্য
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-600" />
                    <span>{order.deliveryAddress}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-600" />
                    <span>আনুমানিক ডেলিভারি: {order.estimatedDelivery}</span>
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 mr-2 text-gray-600" />
                    <span>পেমেন্ট: {order.paymentMethod === 'cash_on_delivery' ? 'ক্যাশ অন ডেলিভারি' : order.paymentMethod}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appointment Details */}
          {appointment && (
            <div className="space-y-6">
              {/* Appointment Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">অ্যাপয়েন্টমেন্ট নম্বর</p>
                    <p className="font-semibold">#{appointment.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">স্ট্যাটাস</p>
                    <div className="flex items-center">
                      {getStatusIcon(appointment.status)}
                      <span className="ml-2 font-semibold">{getStatusText(appointment.status)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Doctor Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  ডাক্তারের তথ্য
                </h3>
                <div className="bg-white border rounded-lg p-4">
                  <p className="font-semibold text-lg">{appointment.doctorName}</p>
                  {appointment.hospital && (
                    <p className="text-gray-600">{appointment.hospital}</p>
                  )}
                  {appointment.location && (
                    <div className="flex items-center mt-2">
                      <MapPin className="w-4 h-4 mr-2 text-gray-600" />
                      <span>{appointment.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Appointment Details */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  অ্যাপয়েন্টমেন্টের বিস্তারিত
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-600" />
                    <span>তারিখ: {appointment.date}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-600" />
                    <span>সময়: {appointment.time}</span>
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 mr-2 text-gray-600" />
                    <span>ফি: ৳{appointment.cost}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">লক্ষণ</p>
                    <p>{appointment.symptoms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ধরন</p>
                    <p>{appointment.appointmentType === 'online' ? 'অনলাইন' : 'অফলাইন'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              বন্ধ করুন
            </button>
            {order && (
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                ট্র্যাক করুন
              </button>
            )}
            {appointment && (
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                ক্যালেন্ডারে যোগ করুন
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationSystem;