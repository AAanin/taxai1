import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Save, X, User, Phone, Mail, MapPin, Calendar, Shield, Eye, EyeOff, UserCheck, UserX } from 'lucide-react';

interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  role: 'user' | 'premium' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastLogin: string;
  totalAppointments: number;
  totalConsultations: number;
  subscriptionStatus: 'free' | 'premium' | 'expired';
  emergencyContact: string;
}

interface UserManagementProps {
  language: 'en' | 'bn';
}

const UserManagement: React.FC<UserManagementProps> = ({ language }) => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [viewingUser, setViewingUser] = useState<AppUser | null>(null);

  const translations = {
    en: {
      title: 'User Management',
      addUser: 'Add New User',
      search: 'Search users...',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      dateOfBirth: 'Date of Birth',
      gender: 'Gender',
      role: 'Role',
      status: 'Status',
      joinDate: 'Join Date',
      lastLogin: 'Last Login',
      totalAppointments: 'Total Appointments',
      totalConsultations: 'Total Consultations',
      subscriptionStatus: 'Subscription',
      emergencyContact: 'Emergency Contact',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      save: 'Save',
      cancel: 'Cancel',
      active: 'Active',
      inactive: 'Inactive',
      suspended: 'Suspended',
      all: 'All',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      user: 'User',
      premium: 'Premium',
      admin: 'Admin',
      free: 'Free',
      expired: 'Expired',
      filterByRole: 'Filter by Role',
      filterByStatus: 'Filter by Status',
      confirmDelete: 'Are you sure you want to delete this user?',
      confirmSuspend: 'Are you sure you want to suspend this user?',
      confirmActivate: 'Are you sure you want to activate this user?',
      userAdded: 'User added successfully!',
      userUpdated: 'User updated successfully!',
      userDeleted: 'User deleted successfully!',
      userSuspended: 'User suspended successfully!',
      userActivated: 'User activated successfully!',
      noResults: 'No users found',
      page: 'Page',
      of: 'of',
      showing: 'Showing',
      to: 'to',
      entries: 'entries',
      userDetails: 'User Details',
      suspend: 'Suspend',
      activate: 'Activate',
      close: 'Close'
    },
    bn: {
      title: 'ইউজার ম্যানেজমেন্ট',
      addUser: 'নতুন ইউজার যোগ করুন',
      search: 'ইউজার খুঁজুন...',
      name: 'নাম',
      email: 'ইমেইল',
      phone: 'ফোন',
      address: 'ঠিকানা',
      dateOfBirth: 'জন্ম তারিখ',
      gender: 'লিঙ্গ',
      role: 'ভূমিকা',
      status: 'অবস্থা',
      joinDate: 'যোগদানের তারিখ',
      lastLogin: 'শেষ লগইন',
      totalAppointments: 'মোট অ্যাপয়েন্টমেন্ট',
      totalConsultations: 'মোট পরামর্শ',
      subscriptionStatus: 'সাবস্ক্রিপশন',
      emergencyContact: 'জরুরি যোগাযোগ',
      actions: 'কার্যক্রম',
      edit: 'সম্পাদনা',
      delete: 'মুছুন',
      view: 'দেখুন',
      save: 'সংরক্ষণ',
      cancel: 'বাতিল',
      active: 'সক্রিয়',
      inactive: 'নিষ্ক্রিয়',
      suspended: 'স্থগিত',
      all: 'সব',
      male: 'পুরুষ',
      female: 'মহিলা',
      other: 'অন্যান্য',
      user: 'ইউজার',
      premium: 'প্রিমিয়াম',
      admin: 'অ্যাডমিন',
      free: 'ফ্রি',
      expired: 'মেয়াদ শেষ',
      filterByRole: 'ভূমিকা অনুযায়ী ফিল্টার',
      filterByStatus: 'অবস্থা অনুযায়ী ফিল্টার',
      confirmDelete: 'আপনি কি নিশ্চিত এই ইউজারকে মুছে ফেলতে চান?',
      confirmSuspend: 'আপনি কি নিশ্চিত এই ইউজারকে স্থগিত করতে চান?',
      confirmActivate: 'আপনি কি নিশ্চিত এই ইউজারকে সক্রিয় করতে চান?',
      userAdded: 'ইউজার সফলভাবে যোগ করা হয়েছে!',
      userUpdated: 'ইউজারের তথ্য সফলভাবে আপডেট করা হয়েছে!',
      userDeleted: 'ইউজার সফলভাবে মুছে ফেলা হয়েছে!',
      userSuspended: 'ইউজার সফলভাবে স্থগিত করা হয়েছে!',
      userActivated: 'ইউজার সফলভাবে সক্রিয় করা হয়েছে!',
      noResults: 'কোন ইউজার পাওয়া যায়নি',
      page: 'পৃষ্ঠা',
      of: 'এর',
      showing: 'দেখানো হচ্ছে',
      to: 'থেকে',
      entries: 'এন্ট্রি',
      userDetails: 'ইউজারের বিস্তারিত',
      suspend: 'স্থগিত করুন',
      activate: 'সক্রিয় করুন',
      close: 'বন্ধ করুন'
    }
  };

  const t = translations[language];

  // Load users from localStorage on component mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('appUsers');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Initialize with sample data
      const sampleUsers: AppUser[] = [
        {
          id: '1',
          name: 'রহিম উদ্দিন',
          email: 'rahim@example.com',
          phone: '+8801712345678',
          address: 'ঢাকা, বাংলাদেশ',
          dateOfBirth: '1985-05-15',
          gender: 'male',
          role: 'premium',
          status: 'active',
          joinDate: '2023-01-15',
          lastLogin: '2024-01-20',
          totalAppointments: 15,
          totalConsultations: 12,
          subscriptionStatus: 'premium',
          emergencyContact: '+8801812345678'
        },
        {
          id: '2',
          name: 'ফাতিমা খাতুন',
          email: 'fatima@example.com',
          phone: '+8801812345679',
          address: 'চট্টগ্রাম, বাংলাদেশ',
          dateOfBirth: '1990-08-22',
          gender: 'female',
          role: 'user',
          status: 'active',
          joinDate: '2023-03-20',
          lastLogin: '2024-01-19',
          totalAppointments: 8,
          totalConsultations: 6,
          subscriptionStatus: 'free',
          emergencyContact: '+8801912345678'
        },
        {
          id: '3',
          name: 'করিম আহমেদ',
          email: 'karim@example.com',
          phone: '+8801612345678',
          address: 'সিলেট, বাংলাদেশ',
          dateOfBirth: '1988-12-10',
          gender: 'male',
          role: 'user',
          status: 'suspended',
          joinDate: '2023-06-10',
          lastLogin: '2024-01-10',
          totalAppointments: 3,
          totalConsultations: 2,
          subscriptionStatus: 'expired',
          emergencyContact: '+8801512345678'
        }
      ];
      setUsers(sampleUsers);
      localStorage.setItem('appUsers', JSON.stringify(sampleUsers));
    }
  }, []);

  // Save users to localStorage whenever users array changes
  useEffect(() => {
    localStorage.setItem('appUsers', JSON.stringify(users));
  }, [users]);

  const [newUser, setNewUser] = useState<Omit<AppUser, 'id'>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: 'male',
    role: 'user',
    status: 'active',
    joinDate: new Date().toISOString().split('T')[0],
    lastLogin: '',
    totalAppointments: 0,
    totalConsultations: 0,
    subscriptionStatus: 'free',
    emergencyContact: ''
  });

  // Filter and search logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    
    const matchesRole = filterRole === '' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handleAddUser = () => {
    if (newUser.name && newUser.email && newUser.phone) {
      const user: AppUser = {
        ...newUser,
        id: Date.now().toString(),
        lastLogin: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, user]);
      setNewUser({
        name: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        gender: 'male',
        role: 'user',
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        lastLogin: '',
        totalAppointments: 0,
        totalConsultations: 0,
        subscriptionStatus: 'free',
        emergencyContact: ''
      });
      setIsAddingUser(false);
      alert(t.userAdded);
    }
  };

  const handleEditUser = (user: AppUser) => {
    setEditingUser({ ...user });
  };

  const handleUpdateUser = () => {
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      setEditingUser(null);
      alert(t.userUpdated);
    }
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      setUsers(users.filter(u => u.id !== id));
      alert(t.userDeleted);
    }
  };

  const handleSuspendUser = (id: string) => {
    if (window.confirm(t.confirmSuspend)) {
      setUsers(users.map(u => u.id === id ? { ...u, status: 'suspended' as const } : u));
      alert(t.userSuspended);
    }
  };

  const handleActivateUser = (id: string) => {
    if (window.confirm(t.confirmActivate)) {
      setUsers(users.map(u => u.id === id ? { ...u, status: 'active' as const } : u));
      alert(t.userActivated);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionColor = (subscription: string) => {
    switch (subscription) {
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'free': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const UserForm = ({ user, onChange, isEditing = false }: {
    user: Omit<AppUser, 'id'> | AppUser;
    onChange: (field: string, value: any) => void;
    isEditing?: boolean;
  }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-gray-50 rounded-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <User className="inline w-4 h-4 mr-1" />
          {t.name} *
        </label>
        <input
          type="text"
          value={user.name}
          onChange={(e) => onChange('name', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Mail className="inline w-4 h-4 mr-1" />
          {t.email} *
        </label>
        <input
          type="email"
          value={user.email}
          onChange={(e) => onChange('email', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Phone className="inline w-4 h-4 mr-1" />
          {t.phone} *
        </label>
        <input
          type="tel"
          value={user.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <MapPin className="inline w-4 h-4 mr-1" />
          {t.address}
        </label>
        <input
          type="text"
          value={user.address}
          onChange={(e) => onChange('address', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Calendar className="inline w-4 h-4 mr-1" />
          {t.dateOfBirth}
        </label>
        <input
          type="date"
          value={user.dateOfBirth}
          onChange={(e) => onChange('dateOfBirth', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.gender}
        </label>
        <select
          value={user.gender}
          onChange={(e) => onChange('gender', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="male">{t.male}</option>
          <option value="female">{t.female}</option>
          <option value="other">{t.other}</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Shield className="inline w-4 h-4 mr-1" />
          {t.role}
        </label>
        <select
          value={user.role}
          onChange={(e) => onChange('role', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="user">{t.user}</option>
          <option value="premium">{t.premium}</option>
          <option value="admin">{t.admin}</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.status}
        </label>
        <select
          value={user.status}
          onChange={(e) => onChange('status', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="active">{t.active}</option>
          <option value="inactive">{t.inactive}</option>
          <option value="suspended">{t.suspended}</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.subscriptionStatus}
        </label>
        <select
          value={user.subscriptionStatus}
          onChange={(e) => onChange('subscriptionStatus', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="free">{t.free}</option>
          <option value="premium">{t.premium}</option>
          <option value="expired">{t.expired}</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.emergencyContact}
        </label>
        <input
          type="tel"
          value={user.emergencyContact}
          onChange={(e) => onChange('emergencyContact', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {isEditing && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.totalAppointments}
            </label>
            <input
              type="number"
              value={user.totalAppointments}
              onChange={(e) => onChange('totalAppointments', parseInt(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.totalConsultations}
            </label>
            <input
              type="number"
              value={user.totalConsultations}
              onChange={(e) => onChange('totalConsultations', parseInt(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t.title}</h1>
        <button
          onClick={() => setIsAddingUser(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t.addUser}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">{t.filterByRole}</option>
          <option value="user">{t.user}</option>
          <option value="premium">{t.premium}</option>
          <option value="admin">{t.admin}</option>
        </select>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive' | 'suspended')}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">{t.all}</option>
          <option value="active">{t.active}</option>
          <option value="inactive">{t.inactive}</option>
          <option value="suspended">{t.suspended}</option>
        </select>
      </div>

      {/* Add User Form */}
      {isAddingUser && (
        <div className="mb-6 bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">{t.addUser}</h2>
          </div>
          <UserForm
            user={newUser}
            onChange={(field, value) => setNewUser({ ...newUser, [field]: value })}
          />
          <div className="p-4 border-t border-gray-200 flex gap-2">
            <button
              onClick={handleAddUser}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              {t.save}
            </button>
            <button
              onClick={() => setIsAddingUser(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <X className="w-4 h-4" />
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      {/* Edit User Form */}
      {editingUser && (
        <div className="mb-6 bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">{t.edit} - {editingUser.name}</h2>
          </div>
          <UserForm
            user={editingUser}
            onChange={(field, value) => setEditingUser({ ...editingUser, [field]: value })}
            isEditing={true}
          />
          <div className="p-4 border-t border-gray-200 flex gap-2">
            <button
              onClick={handleUpdateUser}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              {t.save}
            </button>
            <button
              onClick={() => setEditingUser(null)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <X className="w-4 h-4" />
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">{t.userDetails}</h2>
              <button
                onClick={() => setViewingUser(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t.name}</label>
                  <p className="text-gray-900">{viewingUser.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t.email}</label>
                  <p className="text-gray-900">{viewingUser.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t.phone}</label>
                  <p className="text-gray-900">{viewingUser.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t.address}</label>
                  <p className="text-gray-900">{viewingUser.address}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t.dateOfBirth}</label>
                  <p className="text-gray-900">{viewingUser.dateOfBirth}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t.gender}</label>
                  <p className="text-gray-900">{t[viewingUser.gender as keyof typeof t]}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t.role}</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(viewingUser.role)}`}>
                    {t[viewingUser.role as keyof typeof t]}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t.status}</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(viewingUser.status)}`}>
                    {t[viewingUser.status as keyof typeof t]}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t.subscriptionStatus}</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSubscriptionColor(viewingUser.subscriptionStatus)}`}>
                    {t[viewingUser.subscriptionStatus as keyof typeof t]}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t.joinDate}</label>
                  <p className="text-gray-900">{viewingUser.joinDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t.lastLogin}</label>
                  <p className="text-gray-900">{viewingUser.lastLogin}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t.emergencyContact}</label>
                  <p className="text-gray-900">{viewingUser.emergencyContact}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t.totalAppointments}</label>
                  <p className="text-gray-900">{viewingUser.totalAppointments}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">{t.totalConsultations}</label>
                  <p className="text-gray-900">{viewingUser.totalConsultations}</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setViewingUser(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.name}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.role}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.status}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.subscriptionStatus}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.totalAppointments}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.lastLogin}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {t[user.role as keyof typeof t]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {t[user.status as keyof typeof t]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSubscriptionColor(user.subscriptionStatus)}`}>
                        {t[user.subscriptionStatus as keyof typeof t]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.totalAppointments}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.lastLogin}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewingUser(user)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title={t.view}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                          title={t.edit}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {user.status === 'active' ? (
                          <button
                            onClick={() => handleSuspendUser(user.id)}
                            className="text-orange-600 hover:text-orange-900 p-1 rounded transition-colors"
                            title={t.suspend}
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateUser(user.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                            title={t.activate}
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          title={t.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    {t.noResults}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    {t.showing} <span className="font-medium">{startIndex + 1}</span> {t.to}{' '}
                    <span className="font-medium">{Math.min(endIndex, filteredUsers.length)}</span> {t.of}{' '}
                    <span className="font-medium">{filteredUsers.length}</span> {t.entries}
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;