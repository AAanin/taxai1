import { Language } from '../types';

export const bangladeshMedicalData = {
  bn: {
    hospitals: [
      {
        name: 'ঢাকা মেডিকেল কলেজ হাসপাতাল',
        location: 'বকশী বাজার, ঢাকা',
        contact: '02-9661064',
        type: 'সরকারি'
      },
      {
        name: 'বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয়',
        location: 'শাহবাগ, ঢাকা',
        contact: '02-9661064',
        type: 'সরকারি'
      },
      {
        name: 'স্কয়ার হাসপাতাল',
        location: 'পান্থপথ, ঢাকা',
        contact: '02-8159457',
        type: 'বেসরকারি'
      }
    ],
    emergency: [
      {
        service: 'জাতীয় জরুরি সেবা',
        number: '999'
      },
      {
        service: 'অ্যাম্বুলেন্স সেবা',
        number: '199'
      },
      {
        service: 'ফায়ার সার্ভিস',
        number: '102'
      }
    ],
    diseases: [
      {
        name: 'জ্বর',
        symptoms: ['শরীরের তাপমাত্রা বৃদ্ধি', 'মাথাব্যথা', 'দুর্বলতা'],
        treatment: 'বিশ্রাম নিন, প্রচুর পানি পান করুন, প্যারাসিটামল সেবন করুন'
      },
      {
        name: 'সর্দি-কাশি',
        symptoms: ['নাক দিয়ে পানি পড়া', 'কাশি', 'গলা ব্যথা'],
        treatment: 'গরম পানি পান করুন, বিশ্রাম নিন, লবণ পানি দিয়ে গড়গড়া করুন'
      }
    ],
    medicines: [
      {
        name: 'প্যারাসিটামল',
        uses: 'জ্বর ও ব্যথা কমানোর জন্য',
        dosage: 'প্রাপ্তবয়স্কদের জন্য ৫০০মিগ্রা দিনে ৩ বার',
        sideEffects: 'সাধারণত নিরাপদ, অতিরিক্ত সেবনে লিভারের ক্ষতি হতে পারে'
      }
    ],
    healthTips: [
      'নিয়মিত হাত ধুয়ে নিন',
      'প্রতিদিন কমপক্ষে ৮ গ্লাস পানি পান করুন',
      'সুষম খাবার খান',
      'নিয়মিত ব্যায়াম করুন',
      'পর্যাপ্ত ঘুমান'
    ]
  },
  en: {
    hospitals: [
      {
        name: 'Dhaka Medical College Hospital',
        location: 'Bakshi Bazar, Dhaka',
        contact: '02-9661064',
        type: 'Government'
      },
      {
        name: 'Bangabandhu Sheikh Mujib Medical University',
        location: 'Shahbag, Dhaka',
        contact: '02-9661064',
        type: 'Government'
      },
      {
        name: 'Square Hospital',
        location: 'Panthapath, Dhaka',
        contact: '02-8159457',
        type: 'Private'
      }
    ],
    emergency: [
      {
        service: 'National Emergency Service',
        number: '999'
      },
      {
        service: 'Ambulance Service',
        number: '199'
      },
      {
        service: 'Fire Service',
        number: '102'
      }
    ],
    diseases: [
      {
        name: 'Fever',
        symptoms: ['High body temperature', 'Headache', 'Weakness'],
        treatment: 'Take rest, drink plenty of water, take paracetamol'
      },
      {
        name: 'Cold & Cough',
        symptoms: ['Runny nose', 'Cough', 'Sore throat'],
        treatment: 'Drink warm water, take rest, gargle with salt water'
      }
    ],
    medicines: [
      {
        name: 'Paracetamol',
        uses: 'For fever and pain relief',
        dosage: '500mg three times daily for adults',
        sideEffects: 'Generally safe, liver damage with overdose'
      }
    ],
    healthTips: [
      'Wash your hands regularly',
      'Drink at least 8 glasses of water daily',
      'Eat balanced diet',
      'Exercise regularly',
      'Get adequate sleep'
    ]
  }
};