import React, { useState, useEffect } from 'react';
import { Phone, Plus, Edit2, Trash2, MapPin, Clock, AlertTriangle, X } from 'lucide-react';
import { Language } from '../types';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isDefault?: boolean;
}

interface EmergencyContactsProps {
  language: Language;
  onClose: () => void;
}

const EmergencyContacts: React.FC<EmergencyContactsProps> = ({ language, onClose }) => {
  const [personalContacts, setPersonalContacts] = useState<EmergencyContact[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: ''
  });

  // Load personal contacts from localStorage
  useEffect(() => {
    const savedContacts = localStorage.getItem('emergencyContacts');
    if (savedContacts) {
      setPersonalContacts(JSON.parse(savedContacts));
    }
  }, []);

  // Save personal contacts to localStorage
  const saveContacts = (contacts: EmergencyContact[]) => {
    localStorage.setItem('emergencyContacts', JSON.stringify(contacts));
    setPersonalContacts(contacts);
  };

  const texts = {
    bn: {
      title: 'জরুরি যোগাযোগ',
      emergencyServices: 'জরুরি সেবা',
      hospitalEmergency: 'হাসপাতাল জরুরি',
      personalContacts: 'ব্যক্তিগত জরুরি যোগাযোগ',
      addContact: 'যোগাযোগ যোগ করুন',
      editContact: 'যোগাযোগ সম্পাদনা',
      name: 'নাম',
      phone: 'ফোন নম্বর',
      relationship: 'সম্পর্ক',
      save: 'সংরক্ষণ',
      cancel: 'বাতিল',
      edit: 'সম্পাদনা',
      delete: 'মুছুন',
      call: 'কল করুন',
      close: 'বন্ধ',
      noContacts: 'কোন ব্যক্তিগত জরুরি যোগাযোগ নেই',
      addFirst: 'প্রথম যোগাযোগ যোগ করুন',
      confirmDelete: 'আপনি কি এই যোগাযোগ মুছে ফেলতে চান?',
      nationalEmergency: 'জাতীয় জরুরি সেবা',
      fireService: 'ফায়ার সার্ভিস',
      police: 'পুলিশ',
      ambulance: 'অ্যাম্বুলেন্স',
      healthLine: 'স্বাস্থ্য হটলাইন',
      womenHelp: 'নারী ও শিশু সহায়তা',
      available24: '২৪ ঘন্টা উপলব্ধ',
      governmentService: 'সরকারি সেবা'
    },
    en: {
      title: 'Emergency Contacts',
      emergencyServices: 'Emergency Services',
      hospitalEmergency: 'Hospital Emergency',
      personalContacts: 'Personal Emergency Contacts',
      addContact: 'Add Contact',
      editContact: 'Edit Contact',
      name: 'Name',
      phone: 'Phone Number',
      relationship: 'Relationship',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      call: 'Call',
      close: 'Close',
      noContacts: 'No personal emergency contacts',
      addFirst: 'Add your first contact',
      confirmDelete: 'Are you sure you want to delete this contact?',
      nationalEmergency: 'National Emergency Services',
      fireService: 'Fire Service',
      police: 'Police',
      ambulance: 'Ambulance',
      healthLine: 'Health Hotline',
      womenHelp: 'Women & Child Helpline',
      available24: '24/7 Available',
      governmentService: 'Government Service'
    }
  };

  const t = texts[language];

  // Bangladesh Emergency Services
  const emergencyServices = [
    {
      name: language === 'bn' ? 'জাতীয় জরুরি সেবা' : 'National Emergency',
      phone: '999',
      description: language === 'bn' ? 'সব ধরনের জরুরি অবস্থার জন্য' : 'For all types of emergencies',
      icon: '🚨',
      available: t.available24
    },
    {
      name: language === 'bn' ? 'ফায়ার সার্ভিস' : 'Fire Service',
      phone: '16163',
      description: language === 'bn' ? 'আগুন ও উদ্ধার কাজের জন্য' : 'Fire and rescue services',
      icon: '🚒',
      available: t.available24
    },
    {
      name: language === 'bn' ? 'পুলিশ' : 'Police',
      phone: '100',
      description: language === 'bn' ? 'আইন শৃঙ্খলা ও নিরাপত্তা' : 'Law enforcement and security',
      icon: '👮',
      available: t.available24
    },
    {
      name: language === 'bn' ? 'স্বাস্থ্য হটলাইন' : 'Health Hotline',
      phone: '16263',
      description: language === 'bn' ? 'স্বাস্থ্য পরামর্শ ও তথ্য' : 'Health advice and information',
      icon: '🏥',
      available: t.available24
    },
    {
      name: language === 'bn' ? 'নারী ও শিশু সহায়তা' : 'Women & Child Helpline',
      phone: '109',
      description: language === 'bn' ? 'নারী ও শিশু নির্যাতন প্রতিরোধ' : 'Women and child abuse prevention',
      icon: '👩‍👧‍👦',
      available: t.available24
    }
  ];

  // Major Hospitals Emergency Numbers
  const hospitalEmergency = [
    {
      name: language === 'bn' ? 'ঢাকা মেডিকেল কলেজ হাসপাতাল' : 'Dhaka Medical College Hospital',
      phone: '02-55165088',
      location: language === 'bn' ? 'ঢাকা' : 'Dhaka',
      type: language === 'bn' ? 'সরকারি' : 'Government'
    },
    {
      name: language === 'bn' ? 'বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয়' : 'BSMMU',
      phone: '02-9661064',
      location: language === 'bn' ? 'ঢাকা' : 'Dhaka',
      type: language === 'bn' ? 'সরকারি' : 'Government'
    },
    {
      name: language === 'bn' ? 'স্কয়ার হাসপাতাল' : 'Square Hospital',
      phone: '02-8159457',
      location: language === 'bn' ? 'ঢাকা' : 'Dhaka',
      type: language === 'bn' ? 'বেসরকারি' : 'Private'
    },
    {
      name: language === 'bn' ? 'ইউনাইটেড হাসপাতাল' : 'United Hospital',
      phone: '02-8836000',
      location: language === 'bn' ? 'ঢাকা' : 'Dhaka',
      type: language === 'bn' ? 'বেসরকারি' : 'Private'
    },
    {
      name: language === 'bn' ? 'চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল' : 'Chittagong Medical College Hospital',
      phone: '031-2502255',
      location: language === 'bn' ? 'চট্টগ্রাম' : 'Chittagong',
      type: language === 'bn' ? 'সরকারি' : 'Government'
    }
  ];

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleAddContact = () => {
    if (formData.name && formData.phone) {
      const newContact: EmergencyContact = {
        id: Date.now().toString(),
        name: formData.name,
        phone: formData.phone,
        relationship: formData.relationship
      };
      saveContacts([...personalContacts, newContact]);
      setFormData({ name: '', phone: '', relationship: '' });
      setShowAddForm(false);
    }
  };

  const handleEditContact = () => {
    if (editingContact && formData.name && formData.phone) {
      const updatedContacts = personalContacts.map(contact =>
        contact.id === editingContact.id
          ? { ...contact, name: formData.name, phone: formData.phone, relationship: formData.relationship }
          : contact
      );
      saveContacts(updatedContacts);
      setFormData({ name: '', phone: '', relationship: '' });
      setEditingContact(null);
    }
  };

  const handleDeleteContact = (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      const updatedContacts = personalContacts.filter(contact => contact.id !== id);
      saveContacts(updatedContacts);
    }
  };

  const startEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingContact(null);
    setFormData({ name: '', phone: '', relationship: '' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h2 className={`text-xl font-bold text-gray-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
              {t.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-80px)] p-4">
          {/* Emergency Services */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold text-gray-800 mb-4 flex items-center ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
              <Phone className="w-5 h-5 mr-2 text-red-500" />
              {t.emergencyServices}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emergencyServices.map((service, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{service.icon}</span>
                      <h4 className={`font-semibold text-red-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {service.name}
                      </h4>
                    </div>
                    <button
                      onClick={() => handleCall(service.phone)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                    >
                      {service.phone}
                    </button>
                  </div>
                  <p className={`text-sm text-red-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {service.description}
                  </p>
                  <p className={`text-xs text-red-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {service.available}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Hospital Emergency */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold text-gray-800 mb-4 flex items-center ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
              <MapPin className="w-5 h-5 mr-2 text-blue-500" />
              {t.hospitalEmergency}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hospitalEmergency.map((hospital, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold text-blue-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {hospital.name}
                    </h4>
                    <button
                      onClick={() => handleCall(hospital.phone)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                    >
                      {t.call}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`text-blue-700 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      📍 {hospital.location}
                    </span>
                    <span className={`text-blue-600 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {hospital.type}
                    </span>
                  </div>
                  <p className="text-blue-800 font-mono text-sm mt-1">{hospital.phone}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Emergency Contacts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold text-gray-800 flex items-center ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                <Phone className="w-5 h-5 mr-2 text-green-500" />
                {t.personalContacts}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setEditingContact(null);
                  setFormData({ name: '', phone: '', relationship: '' });
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>{t.addContact}</span>
              </button>
            </div>

            {/* Add/Edit Form */}
            {(showAddForm || editingContact) && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <h4 className={`font-semibold text-gray-800 mb-3 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {editingContact ? t.editContact : t.addContact}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {t.name}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder={language === 'bn' ? 'নাম লিখুন' : 'Enter name'}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {t.phone}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder={language === 'bn' ? 'ফোন নম্বর' : 'Phone number'}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {t.relationship}
                    </label>
                    <input
                      type="text"
                      value={formData.relationship}
                      onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder={language === 'bn' ? 'সম্পর্ক' : 'Relationship'}
                    />
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={editingContact ? handleEditContact : handleAddContact}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>{t.save}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      cancelEdit();
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <span className={language === 'bn' ? 'bangla-text' : 'english-text'}>{t.cancel}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Personal Contacts List */}
            {personalContacts.length === 0 ? (
              <div className="text-center py-8">
                <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className={`text-gray-500 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.noContacts}
                </p>
                <p className={`text-sm text-gray-400 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                  {t.addFirst}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personalContacts.map((contact) => (
                  <div key={contact.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-semibold text-green-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                        {contact.name}
                      </h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEdit(contact)}
                          className="text-blue-500 hover:text-blue-700 p-1"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className={`text-sm text-green-700 mb-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {contact.relationship}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-green-800 font-mono text-sm">{contact.phone}</p>
                      <button
                        onClick={() => handleCall(contact.phone)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                      >
                        {t.call}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContacts;