import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, Calendar, Pill, Bell, X, Plus } from 'lucide-react';
import { MedicationSchedule, MedicationDose, MedicationInfo, getUpcomingDoses, markDoseAsTaken, checkMissedDoses, generateReminderMessage, getMissedDoseGuidance, isScheduleCompleted, moveToHistory, getMedicationCompletionStatus } from '../utils/medicineTracker';
import { getAntibioticEducationMessage, getEarlyStopWarning } from '../utils/antibioticDetector';
import PrescriptionUpload from './PrescriptionUpload';

interface MedicineReminderProps {
  language: 'bn' | 'en';
  schedules: MedicationSchedule[];
  onScheduleUpdate: (schedules: MedicationSchedule[]) => void;
  userId?: string;
}

const MedicineReminder: React.FC<MedicineReminderProps> = ({ language, schedules, onScheduleUpdate, userId }) => {
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'history'>('today');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<MedicationSchedule | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const texts = {
    bn: {
      title: 'ওষুধের রিমাইন্ডার',
      addPrescription: 'নতুন প্রেসক্রিপশন যোগ করুন',
      today: 'আজ',
      upcoming: 'আগামী',
      history: 'ইতিহাস',
      noSchedules: 'কোনো ওষুধের সময়সূচি নেই',
      addFirst: 'প্রথম প্রেসক্রিপশন যোগ করুন',
      takeMedicine: 'ওষুধ নিয়েছি',
      missed: 'মিস হয়েছে',
      taken: 'নেওয়া হয়েছে',
      due: 'নেওয়ার সময়',
      overdue: 'দেরি হয়েছে',
      nextDose: 'পরবর্তী ডোজ',
      dosesLeft: 'বাকি ডোজ',
      completed: 'সম্পূর্ণ',
      markTaken: 'নেওয়া হয়েছে বলে চিহ্নিত করুন',
      missedDoseGuidance: 'মিস হওয়া ডোজের নির্দেশনা',
      antibioticWarning: 'অ্যান্টিবায়োটিক সতর্কতা',
      scheduleDetails: 'সময়সূচির বিস্তারিত',
      close: 'বন্ধ করুন',
      delete: 'মুছে ফেলুন',
      confirm: 'নিশ্চিত করুন',
      cancel: 'বাতিল',
      deleteConfirm: 'এই সময়সূচি মুছে ফেলতে চান?',
      noUpcomingDoses: 'আগামী ২৪ ঘন্টায় কোনো ডোজ নেই',
      noDosesToday: 'আজ কোনো ডোজ নেই',
      time: 'সময়',
      medication: 'ওষুধ',
      status: 'অবস্থা'
    },
    en: {
      title: 'Medicine Reminders',
      addPrescription: 'Add New Prescription',
      today: 'Today',
      upcoming: 'Upcoming',
      history: 'History',
      noSchedules: 'No medication schedules',
      addFirst: 'Add your first prescription',
      takeMedicine: 'Take Medicine',
      missed: 'Missed',
      taken: 'Taken',
      due: 'Due',
      overdue: 'Overdue',
      nextDose: 'Next Dose',
      dosesLeft: 'Doses Left',
      completed: 'Completed',
      markTaken: 'Mark as Taken',
      missedDoseGuidance: 'Missed Dose Guidance',
      antibioticWarning: 'Antibiotic Warning',
      scheduleDetails: 'Schedule Details',
      close: 'Close',
      delete: 'Delete',
      confirm: 'Confirm',
      cancel: 'Cancel',
      deleteConfirm: 'Delete this schedule?',
      noUpcomingDoses: 'No doses in the next 24 hours',
      noDosesToday: 'No doses today',
      time: 'Time',
      medication: 'Medication',
      status: 'Status'
    }
  };

  const t = texts[language];

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Check for missed doses periodically
  useEffect(() => {
    const checkMissed = () => {
      const updatedSchedules = schedules.map(schedule => {
        const missedDoses = checkMissedDoses(schedule);
        return schedule;
      });
      if (JSON.stringify(updatedSchedules) !== JSON.stringify(schedules)) {
        onScheduleUpdate(updatedSchedules);
      }
    };

    const timer = setInterval(checkMissed, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(timer);
  }, [schedules, onScheduleUpdate]);

  const handleScheduleCreated = (newSchedule: MedicationSchedule) => {
    onScheduleUpdate([...schedules, newSchedule]);
    setShowUpload(false);
  };

  const handleMarkTaken = (scheduleId: string, doseId: string) => {
    const updatedSchedules = schedules.map(schedule => {
      if (schedule.id === scheduleId) {
        markDoseAsTaken(schedule, doseId);
        
        // Check if schedule is completed after marking dose as taken
        if (userId && isScheduleCompleted(schedule)) {
          // Move to history
          moveToHistory(schedule, userId);
          
          // Show completion message
          const medicationNames = schedule.medications.map(m => m.name).join(', ');
          const message = language === 'bn' 
            ? `🎉 অভিনন্দন! ${medicationNames} এর কোর্স সম্পূর্ণ হয়েছে এবং ইতিহাসে যোগ করা হয়েছে।`
            : `🎉 Congratulations! ${medicationNames} course completed and added to history.`;
          
          // You can show this message in a toast or alert
          alert(message);
          
          // Remove completed schedule from active schedules
          return null;
        }
      }
      return schedule;
    }).filter(schedule => schedule !== null) as MedicationSchedule[];
    
    onScheduleUpdate(updatedSchedules);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    if (confirm(t.deleteConfirm)) {
      const updatedSchedules = schedules.filter(s => s.id !== scheduleId);
      onScheduleUpdate(updatedSchedules);
    }
  };

  const getTodaysDoses = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysDoses: Array<{ dose: MedicationDose; medication: MedicationInfo; schedule: MedicationSchedule }> = [];

    schedules.forEach(schedule => {
      schedule.doses.forEach(dose => {
        if (dose.scheduledTime >= today && dose.scheduledTime < tomorrow) {
          const medication = schedule.medications.find(m => m.id === dose.medicationId);
          if (medication) {
            todaysDoses.push({ dose, medication, schedule });
          }
        }
      });
    });

    return todaysDoses.sort((a, b) => a.dose.scheduledTime.getTime() - b.dose.scheduledTime.getTime());
  };

  const getUpcomingDosesAll = () => {
    const upcoming: Array<{ dose: MedicationDose; medication: MedicationInfo; schedule: MedicationSchedule }> = [];

    schedules.forEach(schedule => {
      const doses = getUpcomingDoses(schedule, 168); // Next 7 days
      doses.forEach(dose => {
        const medication = schedule.medications.find(m => m.id === dose.medicationId);
        if (medication) {
          upcoming.push({ dose, medication, schedule });
        }
      });
    });

    return upcoming.sort((a, b) => a.dose.scheduledTime.getTime() - b.dose.scheduledTime.getTime());
  };

  const getDoseStatus = (dose: MedicationDose) => {
    const now = currentTime;
    const scheduledTime = dose.scheduledTime;
    const timeDiff = now.getTime() - scheduledTime.getTime();

    if (dose.status === 'taken') return 'taken';
    if (dose.status === 'missed') return 'missed';
    if (timeDiff > 30 * 60 * 1000) return 'overdue'; // 30 minutes late
    if (timeDiff > 0) return 'due';
    return 'upcoming';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken': return 'text-green-600 bg-green-50';
      case 'missed': return 'text-red-600 bg-red-50';
      case 'overdue': return 'text-orange-600 bg-orange-50';
      case 'due': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'taken': return <CheckCircle size={16} />;
      case 'missed': case 'overdue': return <AlertCircle size={16} />;
      case 'due': return <Clock size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderDoseCard = (item: { dose: MedicationDose; medication: MedicationInfo; schedule: MedicationSchedule }) => {
    const { dose, medication, schedule } = item;
    const status = getDoseStatus(dose);
    const statusColor = getStatusColor(status);
    const statusIcon = getStatusIcon(status);

    return (
      <div key={dose.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Pill className="text-blue-500" size={20} />
            <div>
              <h4 className="font-medium">{medication.name} {medication.strength}</h4>
              <p className="text-sm text-gray-600">{formatTime(dose.scheduledTime)}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusColor}`}>
            {statusIcon}
            <span>{t[status as keyof typeof t] || status}</span>
          </div>
        </div>

        {medication.isAntibiotic && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
            <div className="flex items-center gap-2 text-yellow-800 text-xs">
              <AlertCircle size={14} />
              <span>{getAntibioticEducationMessage(language)}</span>
            </div>
          </div>
        )}

        {(status === 'due' || status === 'overdue') && (
          <button
            onClick={() => handleMarkTaken(schedule.id, dose.id)}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <CheckCircle size={16} />
            {t.markTaken}
          </button>
        )}

        {status === 'missed' && (
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <p className="text-xs text-red-800">{getMissedDoseGuidance(language)}</p>
          </div>
        )}
      </div>
    );
  };

  const renderTodayTab = () => {
    const todaysDoses = getTodaysDoses();

    if (todaysDoses.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Clock size={48} className="mx-auto mb-4 opacity-50" />
          <p>{t.noDosesToday}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {todaysDoses.map(renderDoseCard)}
      </div>
    );
  };

  const renderUpcomingTab = () => {
    const upcomingDoses = getUpcomingDosesAll().slice(0, 20); // Limit to 20 items

    if (upcomingDoses.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Calendar size={48} className="mx-auto mb-4 opacity-50" />
          <p>{t.noUpcomingDoses}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {upcomingDoses.map((item, index) => {
          const showDate = index === 0 || 
            formatDate(item.dose.scheduledTime) !== formatDate(upcomingDoses[index - 1].dose.scheduledTime);
          
          return (
            <div key={item.dose.id}>
              {showDate && (
                <div className="sticky top-0 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 rounded">
                  {formatDate(item.dose.scheduledTime)}
                </div>
              )}
              {renderDoseCard(item)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderHistoryTab = () => {
    const allDoses: Array<{ dose: MedicationDose; medication: MedicationInfo; schedule: MedicationSchedule }> = [];

    schedules.forEach(schedule => {
      schedule.doses.forEach(dose => {
        if (dose.status === 'taken' || dose.status === 'missed') {
          const medication = schedule.medications.find(m => m.id === dose.medicationId);
          if (medication) {
            allDoses.push({ dose, medication, schedule });
          }
        }
      });
    });

    const sortedDoses = allDoses.sort((a, b) => b.dose.scheduledTime.getTime() - a.dose.scheduledTime.getTime());

    if (sortedDoses.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
          <p>No history available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {sortedDoses.slice(0, 50).map(renderDoseCard)}
      </div>
    );
  };

  if (schedules.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <Pill size={64} className="mx-auto mb-6 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">{t.noSchedules}</h2>
          <p className="text-gray-600 mb-6">{t.addFirst}</p>
          <button
            onClick={() => setShowUpload(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            {t.addPrescription}
          </button>
        </div>

        {showUpload && (
          <PrescriptionUpload
            language={language}
            onScheduleCreated={handleScheduleCreated}
            onClose={() => setShowUpload(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <button
          onClick={() => setShowUpload(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={16} />
          {t.addPrescription}
        </button>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        {[
          { key: 'today' as const, label: t.today, icon: Clock },
          { key: 'upcoming' as const, label: t.upcoming, icon: Calendar },
          { key: 'history' as const, label: t.history, icon: CheckCircle }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'today' && renderTodayTab()}
        {activeTab === 'upcoming' && renderUpcomingTab()}
        {activeTab === 'history' && renderHistoryTab()}
      </div>

      {showUpload && (
        <PrescriptionUpload
          language={language}
          onScheduleCreated={handleScheduleCreated}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
};

export default MedicineReminder;