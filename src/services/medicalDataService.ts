// Medical Data Service for handling medicine and doctor database

export interface Medicine {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  description: string;
  category: string;
  inStock: boolean;
  dosage: string;
  sideEffects: string[];
  manufacturer: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  location: string;
  cost: number;
  image: string;
  education: string;
  hospital: string;
  availableSlots: string[];
  languages: string[];
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'medicine' | 'doctor' | 'order' | 'appointment';
  data?: any;
}

export interface Order {
  id: string;
  userId: string;
  medicines: { medicineId: string; quantity: number }[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  orderDate: Date;
  deliveryAddress: string;
  paymentMethod: string;
}

export interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  symptoms: string;
  appointmentType: 'online' | 'offline';
  cost: number;
}

class MedicalDataService {
  private medicines: Medicine[] = [
    {
      id: '1',
      name: 'প্যারাসিটামল',
      brand: 'স্কয়ার',
      price: 2.5,
      image: '/images/paracetamol.jpg',
      description: 'জ্বর এবং ব্যথার জন্য কার্যকর ওষুধ',
      category: 'ব্যথানাশক',
      inStock: true,
      dosage: '৫০০ মিগ্রা দিনে ৩ বার',
      sideEffects: ['পেট ব্যথা', 'বমি বমি ভাব'],
      manufacturer: 'স্কয়ার ফার্মাসিউটিক্যালস'
    },
    {
      id: '2',
      name: 'অ্যামোক্সিসিলিন',
      brand: 'বেক্সিমকো',
      price: 15.0,
      image: '/images/amoxicillin.jpg',
      description: 'ব্যাকটেরিয়া সংক্রমণের জন্য অ্যান্টিবায়োটিক',
      category: 'অ্যান্টিবায়োটিক',
      inStock: true,
      dosage: '২৫০ মিগ্রা দিনে ৩ বার',
      sideEffects: ['ডায়রিয়া', 'অ্যালার্জি'],
      manufacturer: 'বেক্সিমকো ফার্মা'
    },
    {
      id: '3',
      name: 'ওমিপ্রাজল',
      brand: 'ইনসেপ্টা',
      price: 8.0,
      image: '/images/omeprazole.jpg',
      description: 'গ্যাস্ট্রিক এবং অম্লতার জন্য',
      category: 'গ্যাস্ট্রিক',
      inStock: true,
      dosage: '২০ মিগ্রা দিনে ১ বার',
      sideEffects: ['মাথা ব্যথা', 'কোষ্ঠকাঠিন্য'],
      manufacturer: 'ইনসেপ্টা ফার্মাসিউটিক্যালস'
    },
    {
      id: '4',
      name: 'সিপ্রোফ্লক্সাসিন',
      brand: 'অরিয়ন',
      price: 12.0,
      image: '/images/ciprofloxacin.jpg',
      description: 'মূত্রনালীর সংক্রমণের জন্য অ্যান্টিবায়োটিক',
      category: 'অ্যান্টিবায়োটিক',
      inStock: true,
      dosage: '৫০০ মিগ্রা দিনে ২ বার',
      sideEffects: ['বমি', 'ডায়রিয়া', 'মাথা ঘোরা'],
      manufacturer: 'অরিয়ন ফার্মা'
    },
    {
      id: '5',
      name: 'লোরাটাডিন',
      brand: 'এসিআই',
      price: 6.0,
      image: '/images/loratadine.jpg',
      description: 'অ্যালার্জি এবং চুলকানির জন্য',
      category: 'অ্যান্টিহিস্টামিন',
      inStock: true,
      dosage: '১০ মিগ্রা দিনে ১ বার',
      sideEffects: ['ঘুম ঘুম ভাব', 'মুখ শুকিয়ে যাওয়া'],
      manufacturer: 'এসিআই লিমিটেড'
    }
  ];

  private doctors: Doctor[] = [
    {
      id: '1',
      name: 'ডা. মোহাম্মদ রহমান',
      specialization: 'কার্ডিওলজিস্ট',
      experience: 15,
      rating: 4.8,
      location: 'ধানমন্ডি, ঢাকা',
      cost: 1500,
      image: '/images/doctor1.jpg',
      education: 'এমবিবিএস, এমডি (কার্ডিওলজি)',
      hospital: 'স্কয়ার হাসপাতাল',
      availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
      languages: ['বাংলা', 'ইংরেজি']
    },
    {
      id: '2',
      name: 'ডা. ফাতেমা খাতুন',
      specialization: 'গাইনোকোলজিস্ট',
      experience: 12,
      rating: 4.9,
      location: 'গুলশান, ঢাকা',
      cost: 1200,
      image: '/images/doctor2.jpg',
      education: 'এমবিবিএস, এফসিপিএস (গাইনি)',
      hospital: 'ইউনাইটেড হাসপাতাল',
      availableSlots: ['10:00', '11:00', '16:00', '17:00'],
      languages: ['বাংলা', 'ইংরেজি']
    },
    {
      id: '3',
      name: 'ডা. আহমেদ হাসান',
      specialization: 'পেডিয়াট্রিশিয়ান',
      experience: 10,
      rating: 4.7,
      location: 'বনানী, ঢাকা',
      cost: 1000,
      image: '/images/doctor3.jpg',
      education: 'এমবিবিএস, এমডি (পেডিয়াট্রিক্স)',
      hospital: 'ল্যাব এইড হাসপাতাল',
      availableSlots: ['09:00', '10:00', '15:00', '16:00', '17:00'],
      languages: ['বাংলা', 'ইংরেজি', 'হিন্দি']
    },
    {
      id: '4',
      name: 'ডা. নাসির উদ্দিন',
      specialization: 'অর্থোপেডিক সার্জন',
      experience: 18,
      rating: 4.6,
      location: 'উত্তরা, ঢাকা',
      cost: 1800,
      image: '/images/doctor4.jpg',
      education: 'এমবিবিএস, এমএস (অর্থোপেডিক্স)',
      hospital: 'এভারকেয়ার হাসপাতাল',
      availableSlots: ['08:00', '09:00', '14:00', '15:00'],
      languages: ['বাংলা', 'ইংরেজি']
    },
    {
      id: '5',
      name: 'ডা. রাশিদা বেগম',
      specialization: 'ডার্মাটোলজিস্ট',
      experience: 8,
      rating: 4.5,
      location: 'মিরপুর, ঢাকা',
      cost: 800,
      image: '/images/doctor5.jpg',
      education: 'এমবিবিএস, ডিডিভি (ডার্মাটোলজি)',
      hospital: 'পপুলার হাসপাতাল',
      availableSlots: ['10:00', '11:00', '15:00', '16:00', '17:00'],
      languages: ['বাংলা', 'ইংরেজি', 'উর্দু']
    }
  ];

  // Medicine related methods
  async searchMedicines(query: string): Promise<Medicine[]> {
    const lowercaseQuery = query.toLowerCase();
    return this.medicines.filter(medicine => 
      medicine.name.toLowerCase().includes(lowercaseQuery) ||
      medicine.brand.toLowerCase().includes(lowercaseQuery) ||
      medicine.category.toLowerCase().includes(lowercaseQuery) ||
      medicine.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getMedicineById(id: string): Promise<Medicine | null> {
    return this.medicines.find(medicine => medicine.id === id) || null;
  }

  async getAllMedicines(): Promise<Medicine[]> {
    return this.medicines;
  }

  async getMedicinesByCategory(category: string): Promise<Medicine[]> {
    return this.medicines.filter(medicine => medicine.category === category);
  }

  async getMedicineCategories(): Promise<string[]> {
    const categories = [...new Set(this.medicines.map(medicine => medicine.category))];
    return categories;
  }

  // Doctor related methods
  async searchDoctors(query: string): Promise<Doctor[]> {
    const lowercaseQuery = query.toLowerCase();
    return this.doctors.filter(doctor => 
      doctor.name.toLowerCase().includes(lowercaseQuery) ||
      doctor.specialization.toLowerCase().includes(lowercaseQuery) ||
      doctor.location.toLowerCase().includes(lowercaseQuery) ||
      doctor.hospital.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getDoctorById(id: string): Promise<Doctor | null> {
    return this.doctors.find(doctor => doctor.id === id) || null;
  }

  async getAllDoctors(): Promise<Doctor[]> {
    return this.doctors;
  }

  async getDoctorsBySpecialization(specialization: string): Promise<Doctor[]> {
    return this.doctors.filter(doctor => doctor.specialization === specialization);
  }

  async getDoctorSpecializations(): Promise<string[]> {
    const specializations = [...new Set(this.doctors.map(doctor => doctor.specialization))];
    return specializations;
  }

  // AI Chat processing
  async processUserMessage(message: string): Promise<ChatMessage> {
    const lowercaseMessage = message.toLowerCase();
    
    // Medicine related queries
    if (lowercaseMessage.includes('ওষুধ') || lowercaseMessage.includes('মেডিসিন')) {
      if (lowercaseMessage.includes('জ্বর') || lowercaseMessage.includes('ব্যথা')) {
        const medicines = await this.searchMedicines('প্যারাসিটামল');
        return {
          id: Date.now().toString(),
          text: 'জ্বর এবং ব্যথার জন্য প্যারাসিটামল একটি কার্যকর ওষুধ। এখানে বিস্তারিত তথ্য:',
          sender: 'ai',
          timestamp: new Date(),
          type: 'medicine',
          data: medicines[0]
        };
      }
      
      if (lowercaseMessage.includes('গ্যাস্ট্রিক') || lowercaseMessage.includes('অম্লতা')) {
        const medicines = await this.searchMedicines('ওমিপ্রাজল');
        return {
          id: Date.now().toString(),
          text: 'গ্যাস্ট্রিক এবং অম্লতার জন্য ওমিপ্রাজল ব্যবহার করতে পারেন:',
          sender: 'ai',
          timestamp: new Date(),
          type: 'medicine',
          data: medicines[0]
        };
      }
      
      if (lowercaseMessage.includes('অ্যালার্জি') || lowercaseMessage.includes('চুলকানি')) {
        const medicines = await this.searchMedicines('লোরাটাডিন');
        return {
          id: Date.now().toString(),
          text: 'অ্যালার্জি এবং চুলকানির জন্য লোরাটাডিন ব্যবহার করতে পারেন:',
          sender: 'ai',
          timestamp: new Date(),
          type: 'medicine',
          data: medicines[0]
        };
      }
    }
    
    // Doctor related queries
    if (lowercaseMessage.includes('ডাক্তার') || lowercaseMessage.includes('চিকিৎসক')) {
      if (lowercaseMessage.includes('হৃদরোগ') || lowercaseMessage.includes('কার্ডিও')) {
        const doctors = await this.searchDoctors('কার্ডিওলজিস্ট');
        return {
          id: Date.now().toString(),
          text: 'হৃদরোগের জন্য এই বিশেষজ্ঞ ডাক্তারের সাথে যোগাযোগ করতে পারেন:',
          sender: 'ai',
          timestamp: new Date(),
          type: 'doctor',
          data: doctors[0]
        };
      }
      
      if (lowercaseMessage.includes('শিশু') || lowercaseMessage.includes('বাচ্চা')) {
        const doctors = await this.searchDoctors('পেডিয়াট্রিশিয়ান');
        return {
          id: Date.now().toString(),
          text: 'শিশুদের চিকিৎসার জন্য এই বিশেষজ্ঞ ডাক্তারের কাছে যেতে পারেন:',
          sender: 'ai',
          timestamp: new Date(),
          type: 'doctor',
          data: doctors[0]
        };
      }
      
      if (lowercaseMessage.includes('চর্মরোগ') || lowercaseMessage.includes('ত্বক')) {
        const doctors = await this.searchDoctors('ডার্মাটোলজিস্ট');
        return {
          id: Date.now().toString(),
          text: 'চর্মরোগের জন্য এই বিশেষজ্ঞ ডাক্তারের সাথে যোগাযোগ করতে পারেন:',
          sender: 'ai',
          timestamp: new Date(),
          type: 'doctor',
          data: doctors[0]
        };
      }
    }
    
    // Default response
    return {
      id: Date.now().toString(),
      text: 'আমি আপনাকে ওষুধ এবং ডাক্তারের তথ্য দিতে পারি। আপনার সমস্যা সম্পর্কে আরো বিস্তারিত বলুন। উদাহরণ: "জ্বরের ওষুধ চাই" বা "হৃদরোগের ডাক্তার দরকার"',
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    };
  }



  // Order management
  async createOrder(order: Omit<Order, 'id' | 'orderDate'>): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      orderDate: new Date()
    };
    
    // In a real app, this would save to database
    console.log('Order created:', newOrder);
    return newOrder;
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    // In a real app, this would fetch from database
    // For now, return a mock order
    return {
      id: orderId,
      userId: 'user123',
      medicines: [{ medicineId: '1', quantity: 2 }],
      totalAmount: 5.0,
      status: 'pending',
      orderDate: new Date(),
      deliveryAddress: 'ঢাকা, বাংলাদেশ',
      paymentMethod: 'cash_on_delivery'
    };
  }

  // Appointment management
  async createAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString()
    };
    
    // In a real app, this would save to database
    console.log('Appointment created:', newAppointment);
    return newAppointment;
  }

  async getAppointmentById(appointmentId: string): Promise<Appointment | null> {
    // In a real app, this would fetch from database
    // For now, return a mock appointment
    return {
      id: appointmentId,
      userId: 'user123',
      doctorId: '1',
      date: '2024-01-20',
      time: '10:00',
      status: 'pending',
      symptoms: 'জ্বর এবং কাশি',
      appointmentType: 'offline',
      cost: 1500
    };
  }

  // Order tracking methods
  async trackOrder(orderId: string): Promise<Order | null> {
    return await this.getOrderById(orderId);
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order | null> {
    // In a real app, this would update the database
    const order = await this.getOrderById(orderId);
    if (order) {
      order.status = status;
      console.log('Order status updated:', order);
    }
    return order;
  }

  // Appointment tracking methods
  async trackAppointment(appointmentId: string): Promise<Appointment | null> {
    return await this.getAppointmentById(appointmentId);
  }

  async updateAppointmentStatus(appointmentId: string, status: Appointment['status']): Promise<Appointment | null> {
    // In a real app, this would update the database
    const appointment = await this.getAppointmentById(appointmentId);
    if (appointment) {
      appointment.status = status;
      console.log('Appointment status updated:', appointment);
    }
    return appointment;
  }
}

export const medicalDataService = new MedicalDataService();
export default medicalDataService;