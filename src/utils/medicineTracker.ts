// Medicine Tracker and Reminder System for Dr. Mimu
// Based on ai.md specification

import { detectAntibiotic, AntibioticClassification } from './antibioticDetector';

export interface MedicationInfo {
  id: string;
  name: string;
  generic?: string;
  strength: string;
  form: string; // tablet, capsule, syrup, etc.
  frequency: string; // OD, BD, TID, QID, etc.
  frequencyPerDay: number;
  duration: number; // in days
  instructions: string; // before/after food, etc.
  isAntibiotic: boolean;
  antibioticInfo?: AntibioticClassification;
  startTime?: Date;
  notes?: string;
}

export interface MedicationDose {
  id: string;
  medicationId: string;
  scheduledTime: Date;
  takenAt?: Date;
  status: 'due' | 'taken' | 'missed' | 'skipped';
  reminderSent: boolean;
}

export interface MedicationSchedule {
  id: string;
  userId: string;
  medications: MedicationInfo[];
  doses: MedicationDose[];
  startDate: Date;
  timezone: string;
  reminderChannels: ('app' | 'sms' | 'whatsapp')[];
  consentGiven: boolean;
  createdAt: Date;
}

// Frequency mapping
const FREQUENCY_MAP: Record<string, number> = {
  'od': 1,
  'once daily': 1,
  'daily': 1,
  'bd': 2,
  'twice daily': 2,
  'bid': 2,
  'tid': 3,
  'three times daily': 3,
  'qid': 4,
  'four times daily': 4,
  'q6h': 4,
  'q8h': 3,
  'q12h': 2,
  'prn': 0, // as needed
  'sos': 0, // as needed
  'stat': 1 // single dose
};

// Parse frequency from text
function parseFrequency(frequencyText: string): { frequency: string; perDay: number } {
  const normalized = frequencyText.toLowerCase().trim();
  
  // Check for exact matches first
  for (const [key, value] of Object.entries(FREQUENCY_MAP)) {
    if (normalized.includes(key)) {
      return { frequency: key.toUpperCase(), perDay: value };
    }
  }
  
  // Check for numeric patterns
  const numericMatch = normalized.match(/(\d+)\s*times?\s*(daily|per\s*day|a\s*day)/i);
  if (numericMatch) {
    const times = parseInt(numericMatch[1]);
    return { frequency: `${times}x daily`, perDay: times };
  }
  
  // Check for hourly patterns
  const hourlyMatch = normalized.match(/q(\d+)h/i);
  if (hourlyMatch) {
    const hours = parseInt(hourlyMatch[1]);
    const perDay = Math.floor(24 / hours);
    return { frequency: `Q${hours}H`, perDay };
  }
  
  // Default to once daily if unclear
  return { frequency: 'OD', perDay: 1 };
}

// Parse duration from text
function parseDuration(durationText: string): number {
  const normalized = durationText.toLowerCase();
  
  // Look for patterns like "5 days", "x5d", "for 7 days"
  const dayMatch = normalized.match(/(\d+)\s*(days?|d\b)/i);
  if (dayMatch) {
    return parseInt(dayMatch[1]);
  }
  
  // Look for patterns like "1 week", "2 weeks"
  const weekMatch = normalized.match(/(\d+)\s*(weeks?|w\b)/i);
  if (weekMatch) {
    return parseInt(weekMatch[1]) * 7;
  }
  
  // Look for patterns like "x5", "×5"
  const xMatch = normalized.match(/[x×](\d+)/i);
  if (xMatch) {
    return parseInt(xMatch[1]);
  }
  
  // Default to 5 days if unclear
  return 5;
}

// Parse strength from text
function parseStrength(medicationText: string): string {
  const strengthMatch = medicationText.match(/(\d+(?:\.\d+)?)\s*(mg|ml|g|mcg|iu|tab|cap)/i);
  return strengthMatch ? `${strengthMatch[1]} ${strengthMatch[2].toLowerCase()}` : '500 mg';
}

// Parse form from text
function parseForm(medicationText: string): string {
  const formMatch = medicationText.match(/\b(tablet|tab|capsule|cap|syrup|suspension|injection|drops?)\b/i);
  return formMatch ? formMatch[1].toLowerCase() : 'tablet';
}

// Extract medication information from prescription text
export function extractMedicationInfo(prescriptionText: string): MedicationInfo[] {
  const lines = prescriptionText.split('\n').filter(line => line.trim());
  const medications: MedicationInfo[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.length < 3) continue;
    
    // Skip if it looks like a header or instruction
    if (trimmedLine.match(/^(rx|prescription|medicine|ওষুধ|চিকিৎসা)/i)) continue;
    
    // Extract medication name (first part before dosage)
    const medicationName = trimmedLine.split(/\s+\d/)[0].trim();
    if (!medicationName) continue;
    
    const strength = parseStrength(trimmedLine);
    const form = parseForm(trimmedLine);
    const { frequency, perDay } = parseFrequency(trimmedLine);
    const duration = parseDuration(trimmedLine);
    
    // Detect if it's an antibiotic
    const antibioticInfo = detectAntibiotic(medicationName);
    
    const medication: MedicationInfo = {
      id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: medicationName,
      generic: antibioticInfo.is_antibiotic ? antibioticInfo.canonical_generic : undefined,
      strength,
      form,
      frequency,
      frequencyPerDay: perDay,
      duration,
      instructions: extractInstructions(trimmedLine),
      isAntibiotic: antibioticInfo.is_antibiotic && antibioticInfo.confidence > 0.7,
      antibioticInfo: antibioticInfo.is_antibiotic ? antibioticInfo : undefined
    };
    
    medications.push(medication);
  }
  
  return medications;
}

// Extract special instructions from medication text
function extractInstructions(medicationText: string): string {
  const instructions: string[] = [];
  
  if (medicationText.match(/\b(before|আগে)\s+(food|meal|খাবার)/i)) {
    instructions.push('খাবারের আগে');
  } else if (medicationText.match(/\b(after|পরে)\s+(food|meal|খাবার)/i)) {
    instructions.push('খাবারের পরে');
  }
  
  if (medicationText.match(/\b(empty\s+stomach|খালি\s+পেটে)/i)) {
    instructions.push('খালি পেটে');
  }
  
  if (medicationText.match(/\b(with\s+water|পানি\s+দিয়ে)/i)) {
    instructions.push('পানি দিয়ে');
  }
  
  if (medicationText.match(/\b(prn|sos|প্রয়োজনে)/i)) {
    instructions.push('প্রয়োজনে');
  }
  
  return instructions.join(', ') || 'খাবারের পরে';
}

// Generate medication schedule
export function generateMedicationSchedule(
  medications: MedicationInfo[],
  startTime: Date,
  userId: string,
  reminderChannels: ('app' | 'sms' | 'whatsapp')[] = ['app']
): MedicationSchedule {
  const doses: MedicationDose[] = [];
  
  for (const medication of medications) {
    if (medication.frequencyPerDay === 0) {
      // PRN medications don't get scheduled doses
      continue;
    }
    
    const intervalHours = 24 / medication.frequencyPerDay;
    
    for (let day = 0; day < medication.duration; day++) {
      for (let dose = 0; dose < medication.frequencyPerDay; dose++) {
        const doseTime = new Date(startTime);
        doseTime.setDate(doseTime.getDate() + day);
        doseTime.setHours(startTime.getHours() + (dose * intervalHours));
        
        const medicationDose: MedicationDose = {
          id: `dose_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          medicationId: medication.id,
          scheduledTime: doseTime,
          status: 'due',
          reminderSent: false
        };
        
        doses.push(medicationDose);
      }
    }
  }
  
  return {
    id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    medications,
    doses,
    startDate: startTime,
    timezone: 'Asia/Dhaka',
    reminderChannels,
    consentGiven: false,
    createdAt: new Date()
  };
}

// Get upcoming doses for a schedule
export function getUpcomingDoses(schedule: MedicationSchedule, hoursOrDate: number | Date = 24): MedicationDose[] {
  const now = typeof hoursOrDate === 'number' ? new Date() : hoursOrDate;
  const cutoff = typeof hoursOrDate === 'number' 
    ? new Date(now.getTime() + (hoursOrDate * 60 * 60 * 1000))
    : new Date(now.getTime() + (24 * 60 * 60 * 1000));
  
  return schedule.doses
    .filter(dose => 
      dose.status === 'due' && 
      dose.scheduledTime >= now && 
      dose.scheduledTime <= cutoff
    )
    .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
}

// Mark dose as taken
export function markDoseAsTaken(schedule: MedicationSchedule, doseId: string): boolean {
  const dose = schedule.doses.find(d => d.id === doseId);
  if (dose && dose.status === 'due') {
    dose.status = 'taken';
    dose.takenAt = new Date();
    return true;
  }
  return false;
}

// Check for missed doses
export function checkMissedDoses(schedule: MedicationSchedule): MedicationDose[] {
  const now = new Date();
  const missedDoses = schedule.doses.filter(dose => 
    dose.status === 'due' && 
    dose.scheduledTime < new Date(now.getTime() - (30 * 60 * 1000)) // 30 minutes grace period
  );
  
  // Mark as missed
  missedDoses.forEach(dose => {
    dose.status = 'missed';
  });
  
  return missedDoses;
}

// Get medication summary for display
export function getMedicationSummary(medication: MedicationInfo, language: 'bn' | 'en' = 'bn'): string {
  const name = medication.name;
  const strength = medication.strength;
  const frequency = medication.frequency;
  const duration = medication.duration;
  
  if (language === 'en') {
    return `${name} ${strength} — ${frequency} — ${duration} days`;
  }
  
  return `${name} ${strength} — ${frequency} — ${duration} দিন`;
}

// Get missed dose guidance
export function getMissedDoseGuidance(language: 'bn' | 'en' = 'bn'): string {
  if (language === 'en') {
    return "If you miss a dose: Take it as soon as you remember. If it's close to the next dose time, skip the missed dose. **Never take a double dose.** Consult your pharmacist or doctor if unsure.";
  }
  
  return "ডোজ মিস হলে: মনে পড়ামাত্র নিন। পরের ডোজের সময় খুব কাছে হলে স্কিপ করুন। **ডাবল ডোজ নেবেন না।** সন্দেহ হলে ফার্মাসিস্ট/ডাক্তারের পরামর্শ নিন।";
}

// Generate reminder message
export function generateReminderMessage(
  medication: MedicationInfo, 
  dose: MedicationDose, 
  language: 'bn' | 'en' = 'bn'
): string {
  const time = dose.scheduledTime.toLocaleTimeString('bn-BD', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  if (language === 'en') {
    return `⏰ Medicine Reminder: Time to take ${medication.name} ${medication.strength} at ${time}`;
  }
  
  return `⏰ ওষুধের রিমাইন্ডার: ${time} এ ${medication.name} ${medication.strength} খাওয়ার সময়`;
}

// Check if medication course is completed
export function isMedicationCompleted(schedule: MedicationSchedule, medicationId: string): boolean {
  const medicationDoses = schedule.doses.filter(dose => dose.medicationId === medicationId);
  if (medicationDoses.length === 0) return false;
  
  const completedDoses = medicationDoses.filter(dose => dose.status === 'taken').length;
  const totalDoses = medicationDoses.length;
  
  // Consider completed if 80% or more doses are taken
  return (completedDoses / totalDoses) >= 0.8;
}

// Check if entire schedule is completed
export function isScheduleCompleted(schedule: MedicationSchedule): boolean {
  return schedule.medications.every(medication => 
    isMedicationCompleted(schedule, medication.id)
  );
}

// Move completed medication to history
export function moveToHistory(schedule: MedicationSchedule, userId: string): void {
  const historyKey = `medicineHistory_${userId}`;
  const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
  
  const historyEntry = {
    id: schedule.id,
    medications: schedule.medications,
    startDate: schedule.startDate,
    completedDate: new Date(),
    totalDoses: schedule.doses.length,
    takenDoses: schedule.doses.filter(dose => dose.status === 'taken').length,
    missedDoses: schedule.doses.filter(dose => dose.status === 'missed').length,
    adherenceRate: (schedule.doses.filter(dose => dose.status === 'taken').length / schedule.doses.length) * 100
  };
  
  existingHistory.push(historyEntry);
  localStorage.setItem(historyKey, JSON.stringify(existingHistory));
}

// Get completion status for a medication
export function getMedicationCompletionStatus(schedule: MedicationSchedule, medicationId: string): {
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  remainingDoses: number;
  adherenceRate: number;
  isCompleted: boolean;
} {
  const medicationDoses = schedule.doses.filter(dose => dose.medicationId === medicationId);
  const takenDoses = medicationDoses.filter(dose => dose.status === 'taken').length;
  const missedDoses = medicationDoses.filter(dose => dose.status === 'missed').length;
  const remainingDoses = medicationDoses.filter(dose => dose.status === 'due').length;
  const totalDoses = medicationDoses.length;
  const adherenceRate = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0;
  
  return {
    totalDoses,
    takenDoses,
    missedDoses,
    remainingDoses,
    adherenceRate,
    isCompleted: isMedicationCompleted(schedule, medicationId)
  };
}