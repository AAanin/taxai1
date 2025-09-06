// Firebase SDK থেকে প্রয়োজনীয় ফাংশনগুলো ইমপোর্ট
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
// TODO: Firebase এর অন্যান্য প্রোডাক্টের জন্য SDK যোগ করুন
// https://firebase.google.com/docs/web/setup#available-libraries

// ওয়েব অ্যাপের Firebase কনফিগারেশন
// Firebase JS SDK v7.20.0 এবং পরবর্তী সংস্করণের জন্য measurementId ঐচ্ছিক
const firebaseConfig = {
  apiKey: "AIzaSyDeEL62IgpFrg8uebR96tbfPkbFF1tM_Tc",           // API কী
  authDomain: "beaming-sunset-380221.firebaseapp.com",          // অথেন্টিকেশন ডোমেইন
  projectId: "beaming-sunset-380221",                          // প্রজেক্ট আইডি
  storageBucket: "beaming-sunset-380221.firebasestorage.app",  // স্টোরেজ বাকেট
  messagingSenderId: "692487079885",                           // মেসেজিং সেন্ডার আইডি
  appId: "1:692487079885:web:deeecc7868b759a533a684",          // অ্যাপ আইডি
  measurementId: "G-3DWQZ4KPX6"                               // অ্যানালিটিক্স মেজারমেন্ট আইডি
};

// Firebase ইনিশিয়ালাইজ করা
const app = initializeApp(firebaseConfig);     // মূল Firebase অ্যাপ
const analytics = getAnalytics(app);           // অ্যানালিটিক্স সার্ভিস
const messaging = getMessaging(app);           // মেসেজিং সার্ভিস (পুশ নোটিফিকেশনের জন্য)

// নোটিফিকেশনের অনুমতি চাওয়া এবং টোকেন পাওয়া
export const requestNotificationPermission = async () => {
  try {
    // ব্রাউজার থেকে নোটিফিকেশনের অনুমতি চাওয়া
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // অনুমতি পেলে FCM টোকেন পাওয়া
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY' // Firebase Console থেকে এটি জেনারেট করতে হবে
      });
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Notification permission denied');  // অনুমতি প্রত্যাখ্যান
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);  // ত্রুটি হ্যান্ডলিং
    return null;
  }
};

// ফোরগ্রাউন্ডে মেসেজ শোনার জন্য লিসেনার
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);  // ফোরগ্রাউন্ডে মেসেজ পাওয়া
      resolve(payload);  // প্রমিস রিজলভ করা
    });
  });

// Firebase সার্ভিসগুলো এক্সপোর্ট করা
export { app, analytics, messaging };
export default app;  // ডিফল্ট এক্সপোর্ট হিসেবে মূল অ্যাপ