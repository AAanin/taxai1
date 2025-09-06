import React, { useState } from 'react';
import { X, Heart, Sun, Cloud, Droplets, Baby, Brain, Apple, Dumbbell, Shield, AlertTriangle } from 'lucide-react';
import { Language } from '../types';

interface HealthTipsProps {
  language: Language;
  onClose: () => void;
}

interface HealthTip {
  id: string;
  title: string;
  content: string;
  category: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
}

const HealthTips: React.FC<HealthTipsProps> = ({ language, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('daily');

  const texts = {
    bn: {
      title: 'স্বাস্থ্য টিপস ও পরামর্শ',
      categories: {
        daily: 'দৈনিক টিপস',
        seasonal: 'মৌসুমি পরামর্শ',
        prevention: 'রোগ প্রতিরোধ',
        maternal: 'মা ও শিশু',
        mental: 'মানসিক স্বাস্থ্য',
        nutrition: 'পুষ্টি',
        exercise: 'ব্যায়াম',
        emergency: 'জরুরি সতর্কতা'
      },
      close: 'বন্ধ করুন'
    },
    en: {
      title: 'Health Tips & Advice',
      categories: {
        daily: 'Daily Tips',
        seasonal: 'Seasonal Advice',
        prevention: 'Disease Prevention',
        maternal: 'Maternal & Child',
        mental: 'Mental Health',
        nutrition: 'Nutrition',
        exercise: 'Exercise',
        emergency: 'Emergency Alerts'
      },
      close: 'Close'
    }
  };

  const healthTips: Record<string, HealthTip[]> = {
    daily: [
      {
        id: 'daily1',
        title: language === 'bn' ? 'পর্যাপ্ত পানি পান করুন' : 'Drink Adequate Water',
        content: language === 'bn' 
          ? 'দিনে কমপক্ষে ৮-১০ গ্লাস পানি পান করুন। গরমে আরও বেশি পানি পান করুন। পানিশূন্যতা এড়াতে নিয়মিত বিরতিতে পানি পান করুন।'
          : 'Drink at least 8-10 glasses of water daily. Increase intake during hot weather. Drink water at regular intervals to avoid dehydration.',
        category: 'daily',
        icon: <Droplets className="w-5 h-5 text-blue-500" />,
        priority: 'high'
      },
      {
        id: 'daily2',
        title: language === 'bn' ? 'নিয়মিত হাত ধোয়া' : 'Regular Hand Washing',
        content: language === 'bn'
          ? 'খাওয়ার আগে ও পরে, বাথরুম ব্যবহারের পরে এবং বাইরে থেকে এসে সাবান দিয়ে কমপক্ষে ২০ সেকেন্ড হাত ধুয়ে নিন।'
          : 'Wash hands with soap for at least 20 seconds before and after eating, after using bathroom, and after coming from outside.',
        category: 'daily',
        icon: <Shield className="w-5 h-5 text-green-500" />,
        priority: 'high'
      },
      {
        id: 'daily3',
        title: language === 'bn' ? 'পর্যাপ্ত ঘুম' : 'Adequate Sleep',
        content: language === 'bn'
          ? 'প্রাপ্তবয়স্কদের দিনে ৭-৮ ঘন্টা ঘুম প্রয়োজন। নিয়মিত ঘুমের সময়সূচি মেনে চলুন। ঘুমানোর আগে মোবাইল ব্যবহার এড়িয়ে চলুন।'
          : 'Adults need 7-8 hours of sleep daily. Maintain a regular sleep schedule. Avoid mobile use before bedtime.',
        category: 'daily',
        icon: <Heart className="w-5 h-5 text-purple-500" />,
        priority: 'high'
      }
    ],
    seasonal: [
      {
        id: 'seasonal1',
        title: language === 'bn' ? 'গ্রীষ্মকালীন সতর্কতা' : 'Summer Precautions',
        content: language === 'bn'
          ? 'রোদে বের হওয়ার সময় টুপি ও ছাতা ব্যবহার করুন। হালকা রঙের সুতির কাপড় পরুন। বেশি পানি ও তরল খাবার খান। দুপুর ১২টা থেকে ৩টা পর্যন্ত রোদে বের হওয়া এড়িয়ে চলুন।'
          : 'Use hat and umbrella when going out in sun. Wear light-colored cotton clothes. Consume more water and liquids. Avoid going out in sun from 12 PM to 3 PM.',
        category: 'seasonal',
        icon: <Sun className="w-5 h-5 text-yellow-500" />,
        priority: 'high'
      },
      {
        id: 'seasonal2',
        title: language === 'bn' ? 'বর্ষাকালীন স্বাস্থ্য' : 'Monsoon Health',
        content: language === 'bn'
          ? 'বৃষ্টির পানিতে ভেজা এড়িয়ে চলুন। মশার কামড় থেকে বাঁচতে মশারি ব্যবহার করুন। ডেঙ্গু প্রতিরোধে জমা পানি পরিষ্কার রাখুন। ভেজা কাপড় দ্রুত শুকিয়ে নিন।'
          : 'Avoid getting wet in rain water. Use mosquito nets to prevent mosquito bites. Keep stagnant water clean to prevent dengue. Dry wet clothes quickly.',
        category: 'seasonal',
        icon: <Cloud className="w-5 h-5 text-gray-500" />,
        priority: 'high'
      },
      {
        id: 'seasonal3',
        title: language === 'bn' ? 'শীতকালীন যত্ন' : 'Winter Care',
        content: language === 'bn'
          ? 'গরম কাপড় পরুন। ঠান্ডা লাগা এড়াতে মাথা ঢেকে রাখুন। গরম পানি পান করুন। ভিটামিন সি সমৃদ্ধ খাবার খান। শুষ্ক ত্বকের জন্য ময়েশ্চারাইজার ব্যবহার করুন।'
          : 'Wear warm clothes. Cover head to avoid cold. Drink warm water. Eat vitamin C rich foods. Use moisturizer for dry skin.',
        category: 'seasonal',
        icon: <Droplets className="w-5 h-5 text-blue-300" />,
        priority: 'medium'
      }
    ],
    prevention: [
      {
        id: 'prevention1',
        title: language === 'bn' ? 'ডেঙ্গু প্রতিরোধ' : 'Dengue Prevention',
        content: language === 'bn'
          ? 'ঘরের চারপাশে জমা পানি পরিষ্কার করুন। ফুলের টব, পানির ট্যাংক নিয়মিত পরিষ্কার করুন। মশার কামড় এড়াতে পূর্ণ হাতা কাপড় পরুন। মশারি ব্যবহার করুন।'
          : 'Clean stagnant water around house. Regularly clean flower pots and water tanks. Wear full-sleeve clothes to avoid mosquito bites. Use mosquito nets.',
        category: 'prevention',
        icon: <Shield className="w-5 h-5 text-red-500" />,
        priority: 'high'
      },
      {
        id: 'prevention2',
        title: language === 'bn' ? 'ডায়রিয়া প্রতিরোধ' : 'Diarrhea Prevention',
        content: language === 'bn'
          ? 'নিরাপদ পানি পান করুন। খাবার ভালোভাবে রান্না করে খান। কাঁচা সালাদ এড়িয়ে চলুন। খাবার খাওয়ার আগে হাত ধুয়ে নিন। রাস্তার খোলা খাবার এড়িয়ে চলুন।'
          : 'Drink safe water. Eat well-cooked food. Avoid raw salads. Wash hands before eating. Avoid street food.',
        category: 'prevention',
        icon: <Shield className="w-5 h-5 text-blue-500" />,
        priority: 'high'
      },
      {
        id: 'prevention3',
        title: language === 'bn' ? 'টাইফয়েড প্রতিরোধ' : 'Typhoid Prevention',
        content: language === 'bn'
          ? 'ফুটানো পানি পান করুন। খাবার গরম অবস্থায় খান। ব্যক্তিগত পরিচ্ছন্নতা বজায় রাখুন। টিকা নিন। দূষিত খাবার ও পানি এড়িয়ে চলুন।'
          : 'Drink boiled water. Eat food while hot. Maintain personal hygiene. Get vaccinated. Avoid contaminated food and water.',
        category: 'prevention',
        icon: <Shield className="w-5 h-5 text-orange-500" />,
        priority: 'high'
      }
    ],
    maternal: [
      {
        id: 'maternal1',
        title: language === 'bn' ? 'গর্ভকালীন যত্ন' : 'Pregnancy Care',
        content: language === 'bn'
          ? 'নিয়মিত ডাক্তারের কাছে চেকআপ করান। পুষ্টিকর খাবার খান। ফলিক এসিড ও আয়রন ট্যাবলেট নিন। পর্যাপ্ত বিশ্রাম নিন। ধূমপান ও মদ্যপান এড়িয়ে চলুন।'
          : 'Regular doctor checkups. Eat nutritious food. Take folic acid and iron tablets. Get adequate rest. Avoid smoking and alcohol.',
        category: 'maternal',
        icon: <Baby className="w-5 h-5 text-pink-500" />,
        priority: 'high'
      },
      {
        id: 'maternal2',
        title: language === 'bn' ? 'শিশুর টিকাদান' : 'Child Vaccination',
        content: language === 'bn'
          ? 'জন্মের পর থেকে নিয়মিত টিকা দিন। টিকার কার্ড সংরক্ষণ করুন। নির্ধারিত সময়ে টিকা দিতে ভুলবেন না। পোলিও, হাম, ডিপিটি টিকা অবশ্যই দিন।'
          : 'Regular vaccination from birth. Keep vaccination card safe. Don\'t miss scheduled vaccines. Must give polio, measles, DPT vaccines.',
        category: 'maternal',
        icon: <Shield className="w-5 h-5 text-green-500" />,
        priority: 'high'
      },
      {
        id: 'maternal3',
        title: language === 'bn' ? 'মায়ের দুধ খাওয়ানো' : 'Breastfeeding',
        content: language === 'bn'
          ? 'জন্মের পর প্রথম ৬ মাস শুধু মায়ের দুধ খাওয়ান। ২ বছর পর্যন্ত মায়ের দুধ চালিয়ে যান। মায়ের পুষ্টিকর খাবার খাওয়া জরুরি। পর্যাপ্ত পানি পান করুন।'
          : 'Exclusive breastfeeding for first 6 months. Continue breastfeeding up to 2 years. Mother needs nutritious food. Drink adequate water.',
        category: 'maternal',
        icon: <Heart className="w-5 h-5 text-red-500" />,
        priority: 'high'
      }
    ],
    mental: [
      {
        id: 'mental1',
        title: language === 'bn' ? 'মানসিক চাপ কমানো' : 'Stress Reduction',
        content: language === 'bn'
          ? 'নিয়মিত ব্যায়াম করুন। গভীর শ্বাস নিন। পর্যাপ্ত ঘুমান। পরিবার ও বন্ধুদের সাথে সময় কাটান। প্রয়োজনে পেশাদার সাহায্য নিন।'
          : 'Exercise regularly. Take deep breaths. Sleep adequately. Spend time with family and friends. Seek professional help if needed.',
        category: 'mental',
        icon: <Brain className="w-5 h-5 text-purple-500" />,
        priority: 'high'
      },
      {
        id: 'mental2',
        title: language === 'bn' ? 'ইতিবাচক চিন্তা' : 'Positive Thinking',
        content: language === 'bn'
          ? 'কৃতজ্ঞতা প্রকাশ করুন। ইতিবাচক মানুষদের সাথে থাকুন। নেতিবাচক চিন্তা এড়িয়ে চলুন। নিজের সাফল্য উদযাপন করুন। ধ্যান ও যোগব্যায়াম করুন।'
          : 'Express gratitude. Stay with positive people. Avoid negative thoughts. Celebrate your success. Practice meditation and yoga.',
        category: 'mental',
        icon: <Heart className="w-5 h-5 text-green-500" />,
        priority: 'medium'
      }
    ],
    nutrition: [
      {
        id: 'nutrition1',
        title: language === 'bn' ? 'সুষম খাবার' : 'Balanced Diet',
        content: language === 'bn'
          ? 'প্রতিদিন ভাত, ডাল, সবজি, মাছ/মাংস খান। ফল খান। তেল-চিনি কম খান। প্রক্রিয়াজাত খাবার এড়িয়ে চলুন। বেশি করে শাকসবজি খান।'
          : 'Daily eat rice, lentils, vegetables, fish/meat. Eat fruits. Reduce oil and sugar. Avoid processed foods. Eat more vegetables.',
        category: 'nutrition',
        icon: <Apple className="w-5 h-5 text-red-500" />,
        priority: 'high'
      },
      {
        id: 'nutrition2',
        title: language === 'bn' ? 'ভিটামিন ও খনিজ' : 'Vitamins & Minerals',
        content: language === 'bn'
          ? 'ভিটামিন সি এর জন্য লেবু, আমলকী খান। ক্যালসিয়ামের জন্য দুধ, দই খান। আয়রনের জন্য কলিজা, পালং শাক খান। ভিটামিন ডি এর জন্য রোদে থাকুন।'
          : 'Eat lemon, amla for vitamin C. Milk, yogurt for calcium. Liver, spinach for iron. Stay in sunlight for vitamin D.',
        category: 'nutrition',
        icon: <Apple className="w-5 h-5 text-green-500" />,
        priority: 'medium'
      }
    ],
    exercise: [
      {
        id: 'exercise1',
        title: language === 'bn' ? 'দৈনিক ব্যায়াম' : 'Daily Exercise',
        content: language === 'bn'
          ? 'দিনে কমপক্ষে ৩০ মিনিট হাঁটুন। সিঁড়ি ব্যবহার করুন। ঘরে বসে হালকা ব্যায়াম করুন। যোগব্যায়াম করুন। নিয়মিত ব্যায়ামের অভ্যাস গড়ুন।'
          : 'Walk at least 30 minutes daily. Use stairs. Do light exercises at home. Practice yoga. Develop regular exercise habits.',
        category: 'exercise',
        icon: <Dumbbell className="w-5 h-5 text-blue-500" />,
        priority: 'high'
      },
      {
        id: 'exercise2',
        title: language === 'bn' ? 'বয়স অনুযায়ী ব্যায়াম' : 'Age-appropriate Exercise',
        content: language === 'bn'
          ? 'শিশুদের জন্য খেলাধুলা। তরুণদের জন্য দৌড়, সাঁতার। প্রাপ্তবয়স্কদের জন্য হাঁটা, যোগব্যায়াম। বয়স্কদের জন্য হালকা ব্যায়াম।'
          : 'Sports for children. Running, swimming for youth. Walking, yoga for adults. Light exercises for elderly.',
        category: 'exercise',
        icon: <Dumbbell className="w-5 h-5 text-green-500" />,
        priority: 'medium'
      }
    ],
    emergency: [
      {
        id: 'emergency1',
        title: language === 'bn' ? 'জরুরি লক্ষণ' : 'Emergency Symptoms',
        content: language === 'bn'
          ? 'বুকে ব্যথা, শ্বাসকষ্ট, অজ্ঞান হয়ে যাওয়া, তীব্র মাথাব্যথা, উচ্চ জ্বর (১০৪°F+), রক্তবমি - এই লক্ষণগুলো দেখা দিলে তৎক্ষণাত হাসপাতালে যান।'
          : 'Chest pain, breathing difficulty, unconsciousness, severe headache, high fever (104°F+), blood vomiting - go to hospital immediately if these symptoms appear.',
        category: 'emergency',
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        priority: 'high'
      },
      {
        id: 'emergency2',
        title: language === 'bn' ? 'প্রাথমিক চিকিৎসা' : 'First Aid',
        content: language === 'bn'
          ? 'কাটা-ছেঁড়ায় পরিষ্কার কাপড় দিয়ে চাপ দিন। পোড়ায় ঠান্ডা পানি দিন। অজ্ঞান ব্যক্তিকে পাশ ফিরিয়ে শোয়ান। শ্বাসকষ্টে বসিয়ে রাখুন।'
          : 'Apply pressure with clean cloth on cuts. Use cold water on burns. Turn unconscious person to side. Keep breathing difficulty patient sitting.',
        category: 'emergency',
        icon: <Heart className="w-5 h-5 text-red-500" />,
        priority: 'high'
      }
    ]
  };

  const t = texts[language];
  const currentTips = healthTips[activeCategory] || [];

  const categories = [
    { id: 'daily', icon: <Heart className="w-4 h-4" /> },
    { id: 'seasonal', icon: <Sun className="w-4 h-4" /> },
    { id: 'prevention', icon: <Shield className="w-4 h-4" /> },
    { id: 'maternal', icon: <Baby className="w-4 h-4" /> },
    { id: 'mental', icon: <Brain className="w-4 h-4" /> },
    { id: 'nutrition', icon: <Apple className="w-4 h-4" /> },
    { id: 'exercise', icon: <Dumbbell className="w-4 h-4" /> },
    { id: 'emergency', icon: <AlertTriangle className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className={`text-xl font-bold text-gray-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
            {t.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(95vh-80px)]">
          {/* Category Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      activeCategory === category.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category.icon}
                    <span className={`text-sm font-medium ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                      {t.categories[category.id as keyof typeof t.categories]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tips Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {currentTips.map((tip) => (
                  <div
                    key={tip.id}
                    className={`bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
                      tip.priority === 'high' ? 'border-red-200 bg-red-50' :
                      tip.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                      'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {tip.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold text-gray-800 mb-2 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                          {tip.title}
                        </h3>
                        <p className={`text-gray-600 text-sm leading-relaxed ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                          {tip.content}
                        </p>
                        {tip.priority === 'high' && (
                          <div className="mt-2 flex items-center space-x-1">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-xs text-red-600 font-medium">
                              {language === 'bn' ? 'গুরুত্বপূর্ণ' : 'Important'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {currentTips.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Heart className="w-12 h-12 mx-auto" />
                  </div>
                  <p className={`text-gray-500 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                    {language === 'bn' ? 'এই বিভাগে কোনো টিপস নেই' : 'No tips available in this category'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthTips;