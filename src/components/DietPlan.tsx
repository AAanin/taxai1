import React, { useState, useEffect } from 'react';
import { X, Apple, Clock, Users, Target, ChefHat, Calendar, Plus, Minus, Check } from 'lucide-react';

interface DietPlanProps {
  language: 'bn' | 'en';
  onClose: () => void;
}

interface MealPlan {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  servings: number;
}

interface DietGoal {
  type: 'weight_loss' | 'weight_gain' | 'maintain' | 'muscle_gain';
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

const DietPlan: React.FC<DietPlanProps> = ({ language, onClose }) => {
  const [userProfile, setUserProfile] = useState({
    age: '',
    weight: '',
    height: '',
    gender: 'male',
    activityLevel: 'moderate',
    goal: 'maintain' as DietGoal['type'],
    allergies: [] as string[],
    preferences: [] as string[]
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [dietPlan, setDietPlan] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);

  const text = {
    title: language === 'bn' ? 'ব্যক্তিগত ডায়েট প্ল্যান' : 'Personal Diet Plan',
    subtitle: language === 'bn' ? 'AI চালিত স্বাস্থ্যকর খাবারের পরিকল্পনা' : 'AI-powered healthy meal planning',
    step1: language === 'bn' ? 'ব্যক্তিগত তথ্য' : 'Personal Information',
    step2: language === 'bn' ? 'লক্ষ্য ও পছন্দ' : 'Goals & Preferences',
    step3: language === 'bn' ? 'আপনার ডায়েট প্ল্যান' : 'Your Diet Plan',
    age: language === 'bn' ? 'বয়স' : 'Age',
    weight: language === 'bn' ? 'ওজন (কেজি)' : 'Weight (kg)',
    height: language === 'bn' ? 'উচ্চতা (সেমি)' : 'Height (cm)',
    gender: language === 'bn' ? 'লিঙ্গ' : 'Gender',
    male: language === 'bn' ? 'পুরুষ' : 'Male',
    female: language === 'bn' ? 'মহিলা' : 'Female',
    activityLevel: language === 'bn' ? 'কার্যকলাপের মাত্রা' : 'Activity Level',
    sedentary: language === 'bn' ? 'কম সক্রিয়' : 'Sedentary',
    light: language === 'bn' ? 'হালকা সক্রিয়' : 'Light',
    moderate: language === 'bn' ? 'মাঝারি সক্রিয়' : 'Moderate',
    active: language === 'bn' ? 'সক্রিয়' : 'Active',
    veryActive: language === 'bn' ? 'অত্যন্ত সক্রিয়' : 'Very Active',
    goal: language === 'bn' ? 'লক্ষ্য' : 'Goal',
    weightLoss: language === 'bn' ? 'ওজন কমানো' : 'Weight Loss',
    weightGain: language === 'bn' ? 'ওজন বাড়ানো' : 'Weight Gain',
    maintain: language === 'bn' ? 'ওজন বজায় রাখা' : 'Maintain Weight',
    muscleGain: language === 'bn' ? 'পেশী বৃদ্ধি' : 'Muscle Gain',
    allergies: language === 'bn' ? 'খাদ্য অ্যালার্জি' : 'Food Allergies',
    preferences: language === 'bn' ? 'খাদ্য পছন্দ' : 'Food Preferences',
    vegetarian: language === 'bn' ? 'নিরামিষাশী' : 'Vegetarian',
    vegan: language === 'bn' ? 'ভেগান' : 'Vegan',
    glutenFree: language === 'bn' ? 'গ্লুটেন মুক্ত' : 'Gluten Free',
    dairyFree: language === 'bn' ? 'দুগ্ধজাত মুক্ত' : 'Dairy Free',
    next: language === 'bn' ? 'পরবর্তী' : 'Next',
    previous: language === 'bn' ? 'পূর্ববর্তী' : 'Previous',
    generatePlan: language === 'bn' ? 'প্ল্যান তৈরি করুন' : 'Generate Plan',
    calories: language === 'bn' ? 'ক্যালোরি' : 'Calories',
    protein: language === 'bn' ? 'প্রোটিন' : 'Protein',
    carbs: language === 'bn' ? 'কার্বোহাইড্রেট' : 'Carbs',
    fat: language === 'bn' ? 'চর্বি' : 'Fat',
    breakfast: language === 'bn' ? 'সকালের নাস্তা' : 'Breakfast',
    lunch: language === 'bn' ? 'দুপুরের খাবার' : 'Lunch',
    dinner: language === 'bn' ? 'রাতের খাবার' : 'Dinner',
    snack: language === 'bn' ? 'নাস্তা' : 'Snack',
    ingredients: language === 'bn' ? 'উপাদান' : 'Ingredients',
    instructions: language === 'bn' ? 'রান্নার নির্দেশনা' : 'Instructions',
    prepTime: language === 'bn' ? 'প্রস্তুতির সময়' : 'Prep Time',
    servings: language === 'bn' ? 'পরিবেশন' : 'Servings',
    savePlan: language === 'bn' ? 'প্ল্যান সংরক্ষণ করুন' : 'Save Plan',
    savedPlans: language === 'bn' ? 'সংরক্ষিত প্ল্যান' : 'Saved Plans'
  };

  useEffect(() => {
    const saved = localStorage.getItem('dietPlans');
    if (saved) {
      setSavedPlans(JSON.parse(saved));
    }
  }, []);

  const generateDietPlan = async () => {
    setLoading(true);
    try {
      // Simulate AI-generated diet plan
      const samplePlans: MealPlan[] = [
        {
          id: '1',
          name: language === 'bn' ? 'স্বাস্থ্যকর সকালের নাস্তা' : 'Healthy Breakfast',
          calories: 350,
          protein: 15,
          carbs: 45,
          fat: 12,
          ingredients: language === 'bn' 
            ? ['ওটস ১/২ কাপ', 'দুধ ১ কাপ', 'কলা ১টি', 'বাদাম ২ টেবিল চামচ', 'মধু ১ চা চামচ']
            : ['1/2 cup oats', '1 cup milk', '1 banana', '2 tbsp nuts', '1 tsp honey'],
          instructions: language === 'bn'
            ? ['ওটস দুধে সিদ্ধ করুন', 'কলা কেটে যোগ করুন', 'বাদাম ও মধু দিয়ে পরিবেশন করুন']
            : ['Cook oats in milk', 'Add sliced banana', 'Top with nuts and honey'],
          prepTime: 10,
          servings: 1
        },
        {
          id: '2',
          name: language === 'bn' ? 'পুষ্টিকর দুপুরের খাবার' : 'Nutritious Lunch',
          calories: 450,
          protein: 25,
          carbs: 55,
          fat: 15,
          ingredients: language === 'bn'
            ? ['ভাত ১ কাপ', 'মাছ ১০০ গ্রাম', 'সবজি ১ কাপ', 'ডাল ১/২ কাপ', 'সালাদ']
            : ['1 cup rice', '100g fish', '1 cup vegetables', '1/2 cup lentils', 'salad'],
          instructions: language === 'bn'
            ? ['ভাত রান্না করুন', 'মাছ ভাজুন', 'সবজি ও ডাল রান্না করুন', 'সালাদ প্রস্তুত করুন']
            : ['Cook rice', 'Fry fish', 'Cook vegetables and lentils', 'Prepare salad'],
          prepTime: 30,
          servings: 1
        },
        {
          id: '3',
          name: language === 'bn' ? 'হালকা রাতের খাবার' : 'Light Dinner',
          calories: 300,
          protein: 20,
          carbs: 30,
          fat: 10,
          ingredients: language === 'bn'
            ? ['রুটি ২টি', 'সবজি ১ কাপ', 'দই ১/২ কাপ', 'সালাদ']
            : ['2 chapati', '1 cup vegetables', '1/2 cup yogurt', 'salad'],
          instructions: language === 'bn'
            ? ['রুটি তৈরি করুন', 'সবজি রান্না করুন', 'দই ও সালাদ দিয়ে পরিবেশন করুন']
            : ['Make chapati', 'Cook vegetables', 'Serve with yogurt and salad'],
          prepTime: 20,
          servings: 1
        }
      ];
      
      setDietPlan(samplePlans);
      setCurrentStep(3);
    } catch (error) {
      console.error('Error generating diet plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDietPlan = () => {
    const planToSave = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      userProfile,
      meals: dietPlan,
      totalCalories: dietPlan.reduce((sum, meal) => sum + meal.calories, 0),
      createdAt: new Date().toISOString()
    };
    
    const updatedPlans = [planToSave, ...savedPlans];
    setSavedPlans(updatedPlans);
    localStorage.setItem('dietPlans', JSON.stringify(updatedPlans));
    
    alert(language === 'bn' ? 'ডায়েট প্ল্যান সংরক্ষিত হয়েছে!' : 'Diet plan saved successfully!');
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{text.age}</label>
          <input
            type="number"
            value={userProfile.age}
            onChange={(e) => setUserProfile({...userProfile, age: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="25"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{text.weight}</label>
          <input
            type="number"
            value={userProfile.weight}
            onChange={(e) => setUserProfile({...userProfile, weight: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="70"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{text.height}</label>
          <input
            type="number"
            value={userProfile.height}
            onChange={(e) => setUserProfile({...userProfile, height: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="170"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{text.gender}</label>
          <select
            value={userProfile.gender}
            onChange={(e) => setUserProfile({...userProfile, gender: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="male">{text.male}</option>
            <option value="female">{text.female}</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{text.activityLevel}</label>
        <select
          value={userProfile.activityLevel}
          onChange={(e) => setUserProfile({...userProfile, activityLevel: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="sedentary">{text.sedentary}</option>
          <option value="light">{text.light}</option>
          <option value="moderate">{text.moderate}</option>
          <option value="active">{text.active}</option>
          <option value="very_active">{text.veryActive}</option>
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{text.goal}</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'weight_loss', label: text.weightLoss },
            { value: 'weight_gain', label: text.weightGain },
            { value: 'maintain', label: text.maintain },
            { value: 'muscle_gain', label: text.muscleGain }
          ].map((goal) => (
            <button
              key={goal.value}
              onClick={() => setUserProfile({...userProfile, goal: goal.value as DietGoal['type']})}
              className={`p-3 rounded-lg border-2 transition-colors ${
                userProfile.goal === goal.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {goal.label}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{text.preferences}</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'vegetarian', label: text.vegetarian },
            { value: 'vegan', label: text.vegan },
            { value: 'gluten_free', label: text.glutenFree },
            { value: 'dairy_free', label: text.dairyFree }
          ].map((pref) => (
            <button
              key={pref.value}
              onClick={() => {
                const prefs = userProfile.preferences.includes(pref.value)
                  ? userProfile.preferences.filter(p => p !== pref.value)
                  : [...userProfile.preferences, pref.value];
                setUserProfile({...userProfile, preferences: prefs});
              }}
              className={`p-3 rounded-lg border-2 transition-colors ${
                userProfile.preferences.includes(pref.value)
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {pref.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">{text.step3}</h3>
        <button
          onClick={saveDietPlan}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          {text.savePlan}
        </button>
      </div>
      
      <div className="grid gap-4">
        {dietPlan.map((meal, index) => (
          <div key={meal.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">{meal.name}</h4>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{meal.prepTime} {language === 'bn' ? 'মিনিট' : 'min'}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mb-3 text-sm">
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="font-semibold text-blue-700">{meal.calories}</div>
                <div className="text-blue-600">{text.calories}</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="font-semibold text-green-700">{meal.protein}g</div>
                <div className="text-green-600">{text.protein}</div>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded">
                <div className="font-semibold text-yellow-700">{meal.carbs}g</div>
                <div className="text-yellow-600">{text.carbs}</div>
              </div>
              <div className="text-center p-2 bg-red-50 rounded">
                <div className="font-semibold text-red-700">{meal.fat}g</div>
                <div className="text-red-600">{text.fat}</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <h5 className="font-medium text-gray-700 mb-1">{text.ingredients}:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {meal.ingredients.map((ingredient, i) => (
                    <li key={i} className="flex items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-700 mb-1">{text.instructions}:</h5>
                <ol className="text-sm text-gray-600 space-y-1">
                  {meal.instructions.map((instruction, i) => (
                    <li key={i} className="flex items-start">
                      <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-2 mt-0.5">
                        {i + 1}
                      </span>
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">
          {language === 'bn' ? 'দৈনিক পুষ্টি সারসংক্ষেপ' : 'Daily Nutrition Summary'}
        </h4>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {dietPlan.reduce((sum, meal) => sum + meal.calories, 0)}
            </div>
            <div className="text-sm text-gray-600">{text.calories}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {dietPlan.reduce((sum, meal) => sum + meal.protein, 0)}g
            </div>
            <div className="text-sm text-gray-600">{text.protein}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {dietPlan.reduce((sum, meal) => sum + meal.carbs, 0)}g
            </div>
            <div className="text-sm text-gray-600">{text.carbs}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {dietPlan.reduce((sum, meal) => sum + meal.fat, 0)}g
            </div>
            <div className="text-sm text-gray-600">{text.fat}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Apple className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">{text.title}</h2>
                <p className="text-green-100">{text.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-6 space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step ? 'bg-white text-green-600' : 'bg-green-500 text-white'
                }`}>
                  {currentStep > step ? <Check className="w-4 h-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    currentStep > step ? 'bg-white' : 'bg-green-500'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between">
          <button
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            {currentStep === 1 ? (language === 'bn' ? 'বন্ধ করুন' : 'Close') : text.previous}
          </button>
          
          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={currentStep === 1 && (!userProfile.age || !userProfile.weight || !userProfile.height)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {text.next}
            </button>
          ) : (
            <button
              onClick={generateDietPlan}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (language === 'bn' ? 'তৈরি হচ্ছে...' : 'Generating...') : text.generatePlan}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DietPlan;