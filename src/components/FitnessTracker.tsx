import React, { useState, useEffect } from 'react';
import { X, Activity, Heart, Target, TrendingUp, Calendar, Plus, Minus, Play, Pause, RotateCcw, Award, Zap } from 'lucide-react';

interface FitnessTrackerProps {
  language: 'bn' | 'en';
  onClose: () => void;
}

interface WorkoutSession {
  id: string;
  type: string;
  duration: number; // in minutes
  calories: number;
  date: string;
  notes?: string;
}

interface HealthMetric {
  id: string;
  type: 'weight' | 'height' | 'bmi' | 'blood_pressure' | 'heart_rate' | 'steps';
  value: number;
  unit: string;
  date: string;
  time?: string;
}

interface Goal {
  id: string;
  type: 'weight_loss' | 'weight_gain' | 'steps' | 'calories' | 'workout_days';
  target: number;
  current: number;
  unit: string;
  deadline: string;
  achieved: boolean;
}

const FitnessTracker: React.FC<FitnessTrackerProps> = ({ language, onClose }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<{
    type: string;
    startTime: Date | null;
    isActive: boolean;
    duration: number;
  }>({ type: '', startTime: null, isActive: false, duration: 0 });
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const text = {
    title: language === 'bn' ? 'ফিটনেস ট্র্যাকার' : 'Fitness Tracker',
    subtitle: language === 'bn' ? 'আপনার স্বাস্থ্য ও ফিটনেস পর্যবেক্ষণ করুন' : 'Monitor your health and fitness',
    dashboard: language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard',
    workouts: language === 'bn' ? 'ওয়ার্কআউট' : 'Workouts',
    metrics: language === 'bn' ? 'স্বাস্থ্য মেট্রিক্স' : 'Health Metrics',
    goals: language === 'bn' ? 'লক্ষ্য' : 'Goals',
    todayStats: language === 'bn' ? 'আজকের পরিসংখ্যান' : 'Today\'s Stats',
    totalWorkouts: language === 'bn' ? 'মোট ওয়ার্কআউট' : 'Total Workouts',
    caloriesBurned: language === 'bn' ? 'ক্যালোরি পোড়ানো' : 'Calories Burned',
    activeMinutes: language === 'bn' ? 'সক্রিয় মিনিট' : 'Active Minutes',
    steps: language === 'bn' ? 'পদক্ষেপ' : 'Steps',
    startWorkout: language === 'bn' ? 'ওয়ার্কআউট শুরু করুন' : 'Start Workout',
    stopWorkout: language === 'bn' ? 'ওয়ার্কআউট বন্ধ করুন' : 'Stop Workout',
    pauseWorkout: language === 'bn' ? 'বিরতি' : 'Pause',
    resumeWorkout: language === 'bn' ? 'চালিয়ে যান' : 'Resume',
    workoutType: language === 'bn' ? 'ওয়ার্কআউটের ধরন' : 'Workout Type',
    running: language === 'bn' ? 'দৌড়ানো' : 'Running',
    walking: language === 'bn' ? 'হাঁটা' : 'Walking',
    cycling: language === 'bn' ? 'সাইক্লিং' : 'Cycling',
    swimming: language === 'bn' ? 'সাঁতার' : 'Swimming',
    yoga: language === 'bn' ? 'যোগব্যায়াম' : 'Yoga',
    gym: language === 'bn' ? 'জিম' : 'Gym',
    duration: language === 'bn' ? 'সময়কাল' : 'Duration',
    calories: language === 'bn' ? 'ক্যালোরি' : 'Calories',
    date: language === 'bn' ? 'তারিখ' : 'Date',
    time: language === 'bn' ? 'সময়' : 'Time',
    notes: language === 'bn' ? 'নোট' : 'Notes',
    addMetric: language === 'bn' ? 'মেট্রিক যোগ করুন' : 'Add Metric',
    weight: language === 'bn' ? 'ওজন' : 'Weight',
    height: language === 'bn' ? 'উচ্চতা' : 'Height',
    bmi: language === 'bn' ? 'বিএমআই' : 'BMI',
    bloodPressure: language === 'bn' ? 'রক্তচাপ' : 'Blood Pressure',
    heartRate: language === 'bn' ? 'হৃদস্পন্দন' : 'Heart Rate',
    value: language === 'bn' ? 'মান' : 'Value',
    unit: language === 'bn' ? 'একক' : 'Unit',
    kg: language === 'bn' ? 'কেজি' : 'kg',
    cm: language === 'bn' ? 'সেমি' : 'cm',
    bpm: language === 'bn' ? 'বিপিএম' : 'bpm',
    mmHg: language === 'bn' ? 'mmHg' : 'mmHg',
    addGoal: language === 'bn' ? 'লক্ষ্য যোগ করুন' : 'Add Goal',
    weightLoss: language === 'bn' ? 'ওজন কমানো' : 'Weight Loss',
    weightGain: language === 'bn' ? 'ওজন বাড়ানো' : 'Weight Gain',
    dailySteps: language === 'bn' ? 'দৈনিক পদক্ষেপ' : 'Daily Steps',
    dailyCalories: language === 'bn' ? 'দৈনিক ক্যালোরি' : 'Daily Calories',
    workoutDays: language === 'bn' ? 'ওয়ার্কআউট দিন' : 'Workout Days',
    target: language === 'bn' ? 'লক্ষ্য' : 'Target',
    current: language === 'bn' ? 'বর্তমান' : 'Current',
    deadline: language === 'bn' ? 'সময়সীমা' : 'Deadline',
    progress: language === 'bn' ? 'অগ্রগতি' : 'Progress',
    achieved: language === 'bn' ? 'অর্জিত' : 'Achieved',
    save: language === 'bn' ? 'সংরক্ষণ করুন' : 'Save',
    cancel: language === 'bn' ? 'বাতিল' : 'Cancel',
    edit: language === 'bn' ? 'সম্পাদনা' : 'Edit',
    delete: language === 'bn' ? 'মুছুন' : 'Delete',
    weeklyProgress: language === 'bn' ? 'সাপ্তাহিক অগ্রগতি' : 'Weekly Progress',
    monthlyProgress: language === 'bn' ? 'মাসিক অগ্রগতি' : 'Monthly Progress',
    recentActivities: language === 'bn' ? 'সাম্প্রতিক কার্যকলাপ' : 'Recent Activities',
    noData: language === 'bn' ? 'কোন তথ্য নেই' : 'No data available'
  };

  useEffect(() => {
    // Load data from localStorage
    const savedWorkouts = localStorage.getItem('fitnessWorkouts');
    const savedMetrics = localStorage.getItem('fitnessMetrics');
    const savedGoals = localStorage.getItem('fitnessGoals');
    
    if (savedWorkouts) setWorkoutSessions(JSON.parse(savedWorkouts));
    if (savedMetrics) setHealthMetrics(JSON.parse(savedMetrics));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
  }, []);

  useEffect(() => {
    // Timer for active workout
    if (currentWorkout.isActive && currentWorkout.startTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const duration = Math.floor((now.getTime() - currentWorkout.startTime!.getTime()) / 1000 / 60);
        setCurrentWorkout(prev => ({ ...prev, duration }));
      }, 1000);
      setTimer(interval);
      return () => clearInterval(interval);
    } else if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
  }, [currentWorkout.isActive, currentWorkout.startTime]);

  const startWorkout = (type: string) => {
    setCurrentWorkout({
      type,
      startTime: new Date(),
      isActive: true,
      duration: 0
    });
  };

  const pauseWorkout = () => {
    setCurrentWorkout(prev => ({ ...prev, isActive: false }));
  };

  const resumeWorkout = () => {
    setCurrentWorkout(prev => ({ ...prev, isActive: true }));
  };

  const stopWorkout = () => {
    if (currentWorkout.duration > 0) {
      const newSession: WorkoutSession = {
        id: Date.now().toString(),
        type: currentWorkout.type,
        duration: currentWorkout.duration,
        calories: Math.round(currentWorkout.duration * 8), // Rough estimate
        date: new Date().toISOString().split('T')[0],
        notes: ''
      };
      
      const updatedSessions = [newSession, ...workoutSessions];
      setWorkoutSessions(updatedSessions);
      localStorage.setItem('fitnessWorkouts', JSON.stringify(updatedSessions));
    }
    
    setCurrentWorkout({ type: '', startTime: null, isActive: false, duration: 0 });
  };

  const addHealthMetric = (metric: Omit<HealthMetric, 'id'>) => {
    const newMetric: HealthMetric = {
      ...metric,
      id: Date.now().toString()
    };
    
    const updatedMetrics = [newMetric, ...healthMetrics];
    setHealthMetrics(updatedMetrics);
    localStorage.setItem('fitnessMetrics', JSON.stringify(updatedMetrics));
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'achieved'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      achieved: false
    };
    
    const updatedGoals = [newGoal, ...goals];
    setGoals(updatedGoals);
    localStorage.setItem('fitnessGoals', JSON.stringify(updatedGoals));
  };

  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayWorkouts = workoutSessions.filter(w => w.date === today);
    
    return {
      workouts: todayWorkouts.length,
      calories: todayWorkouts.reduce((sum, w) => sum + w.calories, 0),
      minutes: todayWorkouts.reduce((sum, w) => sum + w.duration, 0),
      steps: 0 // Would be integrated with step counter
    };
  };

  const renderDashboard = () => {
    const stats = getTodayStats();
    
    return (
      <div className="space-y-6">
        {/* Today's Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700">{stats.workouts}</div>
            <div className="text-sm text-blue-600">{text.totalWorkouts}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <Zap className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-700">{stats.calories}</div>
            <div className="text-sm text-red-600">{text.caloriesBurned}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <Heart className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-700">{stats.minutes}</div>
            <div className="text-sm text-green-600">{text.activeMinutes}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">{stats.steps}</div>
            <div className="text-sm text-purple-600">{text.steps}</div>
          </div>
        </div>

        {/* Current Workout */}
        {currentWorkout.startTime && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">{currentWorkout.type}</h3>
                <p className="text-blue-100">
                  {text.duration}: {Math.floor(currentWorkout.duration / 60)}:{(currentWorkout.duration % 60).toString().padStart(2, '0')}
                </p>
              </div>
              <div className="flex space-x-2">
                {currentWorkout.isActive ? (
                  <button
                    onClick={pauseWorkout}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-3 transition-colors"
                  >
                    <Pause className="w-6 h-6" />
                  </button>
                ) : (
                  <button
                    onClick={resumeWorkout}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-3 transition-colors"
                  >
                    <Play className="w-6 h-6" />
                  </button>
                )}
                <button
                  onClick={stopWorkout}
                  className="bg-red-500 hover:bg-red-600 rounded-full p-3 transition-colors"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Start Workout */}
        {!currentWorkout.startTime && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{text.startWorkout}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { type: text.running, icon: '🏃' },
                { type: text.walking, icon: '🚶' },
                { type: text.cycling, icon: '🚴' },
                { type: text.swimming, icon: '🏊' },
                { type: text.yoga, icon: '🧘' },
                { type: text.gym, icon: '🏋️' }
              ].map((workout) => (
                <button
                  key={workout.type}
                  onClick={() => startWorkout(workout.type)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">{workout.icon}</div>
                  <div className="text-sm font-medium text-gray-700">{workout.type}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activities */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{text.recentActivities}</h3>
          {workoutSessions.length === 0 ? (
            <p className="text-gray-600 text-center py-4">{text.noData}</p>
          ) : (
            <div className="space-y-3">
              {workoutSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">{session.type}</div>
                    <div className="text-sm text-gray-600">{session.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-800">{session.duration} min</div>
                    <div className="text-sm text-gray-600">{session.calories} cal</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Goals Progress */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{text.goals}</h3>
          {goals.length === 0 ? (
            <p className="text-gray-600 text-center py-4">{text.noData}</p>
          ) : (
            <div className="space-y-4">
              {goals.slice(0, 3).map((goal) => {
                const progressPercentage = Math.min((goal.current / goal.target) * 100, 100);
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">
                        {goal.type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {progressPercentage.toFixed(1)}% {text.progress}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWorkouts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">{text.workouts}</h3>
      </div>
      
      {workoutSessions.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{text.noData}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {workoutSessions.map((session) => (
            <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-800">{session.type}</h4>
                  <p className="text-sm text-gray-600">{session.date}</p>
                  {session.notes && (
                    <p className="text-sm text-gray-500 mt-1">{session.notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-800">{session.duration} min</div>
                  <div className="text-sm text-gray-600">{session.calories} cal</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMetrics = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">{text.metrics}</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          {text.addMetric}
        </button>
      </div>
      
      {healthMetrics.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{text.noData}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {healthMetrics.map((metric) => (
            <div key={metric.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-800 capitalize">
                    {metric.type.replace('_', ' ')}
                  </h4>
                  <p className="text-sm text-gray-600">{metric.date} {metric.time}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-blue-600">
                    {metric.value} {metric.unit}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderGoals = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">{text.goals}</h3>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          {text.addGoal}
        </button>
      </div>
      
      {goals.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{text.noData}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => {
            const progressPercentage = Math.min((goal.current / goal.target) * 100, 100);
            return (
              <div key={goal.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800 capitalize">
                      {goal.type.replace('_', ' ')}
                    </h4>
                    <p className="text-sm text-gray-600">{text.deadline}: {goal.deadline}</p>
                  </div>
                  {goal.achieved && (
                    <Award className="w-6 h-6 text-yellow-500" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{text.current}: {goal.current} {goal.unit}</span>
                    <span>{text.target}: {goal.target} {goal.unit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        goal.achieved ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {progressPercentage.toFixed(1)}% {text.progress}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">{text.title}</h2>
                <p className="text-purple-100">{text.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex space-x-4 mt-6">
            {[
              { id: 'dashboard', label: text.dashboard, icon: TrendingUp },
              { id: 'workouts', label: text.workouts, icon: Activity },
              { id: 'metrics', label: text.metrics, icon: Heart },
              { id: 'goals', label: text.goals, icon: Target }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-purple-600'
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'workouts' && renderWorkouts()}
          {activeTab === 'metrics' && renderMetrics()}
          {activeTab === 'goals' && renderGoals()}
        </div>
      </div>
    </div>
  );
};

export default FitnessTracker;