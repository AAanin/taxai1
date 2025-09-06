import { MedicalKnowledgeService, SymptomAnalysis } from './medicalKnowledgeService';
import { SemanticSearchService, HybridSearchQuery } from './semanticSearchService';
import { RedisClientType } from 'redis';
import { createHash } from 'crypto';

// Enhanced Symptom Analysis Interfaces
export interface Symptom {
  id: string;
  name: string;
  description: string;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  duration: string; // e.g., "2 days", "1 week"
  frequency: 'rare' | 'occasional' | 'frequent' | 'constant';
  location?: string;
  triggers?: string[];
  relievingFactors?: string[];
  associatedSymptoms?: string[];
  language: 'en' | 'bn';
}

export interface MedicalCondition {
  id: string;
  name: string;
  description: string;
  category: 'acute' | 'chronic' | 'emergency' | 'routine';
  commonSymptoms: string[];
  rareSymptoms: string[];
  riskFactors: string[];
  complications: string[];
  prevalence: number; // 0-1 score
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  specialtyRequired?: string;
  language: 'en' | 'bn';
}

export interface DiagnosticRule {
  id: string;
  condition: string;
  requiredSymptoms: string[];
  optionalSymptoms: string[];
  excludingSymptoms: string[];
  minimumSymptoms: number;
  confidenceWeight: number;
  ageRange?: { min: number; max: number };
  gender?: 'male' | 'female' | 'any';
  riskFactors?: string[];
}

export interface PatientProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  medicalHistory: string[];
  currentMedications: string[];
  allergies: string[];
  lifestyle: {
    smoking: boolean;
    alcohol: boolean;
    exercise: 'none' | 'light' | 'moderate' | 'heavy';
    diet: string;
  };
  familyHistory: string[];
  vitalSigns?: {
    temperature?: number;
    bloodPressure?: { systolic: number; diastolic: number };
    heartRate?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };
}

export interface EnhancedSymptomAnalysis extends SymptomAnalysis {
  patientProfile?: PatientProfile;
  diagnosticConfidence: number;
  differentialDiagnosis: {
    primary: MedicalCondition[];
    secondary: MedicalCondition[];
    ruled_out: MedicalCondition[];
  };
  redFlags: {
    present: boolean;
    flags: string[];
    urgencyLevel: 'immediate' | 'urgent' | 'routine';
  };
  followUpRecommendations: {
    timeframe: string;
    tests: string[];
    specialists: string[];
    monitoring: string[];
  };
  riskAssessment: {
    overall: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    score: number; // 0-100
  };
  treatmentSuggestions: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    lifestyle: string[];
  };
  language: 'en' | 'bn';
}

export interface SymptomCluster {
  id: string;
  symptoms: string[];
  commonConditions: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  frequency: number;
  confidence: number;
}

export interface DiagnosticPathway {
  id: string;
  name: string;
  steps: {
    step: number;
    description: string;
    questions: string[];
    expectedAnswers: string[];
    nextSteps: string[];
  }[];
  estimatedTime: string;
  accuracy: number;
}

export class SymptomAnalysisService {
  private knowledgeService: MedicalKnowledgeService;
  private searchService: SemanticSearchService;
  private redis: RedisClientType;
  private diagnosticRules: DiagnosticRule[] = [];
  private symptomClusters: SymptomCluster[] = [];
  private medicalConditions: MedicalCondition[] = [];

  constructor(
    knowledgeService: MedicalKnowledgeService,
    searchService: SemanticSearchService,
    redis: RedisClientType
  ) {
    this.knowledgeService = knowledgeService;
    this.searchService = searchService;
    this.redis = redis;
    this.initializeRulesAndConditions();
  }

  async analyzeSymptoms(
    symptoms: Symptom[],
    patientProfile?: PatientProfile,
    language: 'en' | 'bn' = 'en'
  ): Promise<EnhancedSymptomAnalysis> {
    try {
      // Check cache first
      const cacheKey = this.generateAnalysisCacheKey(symptoms, patientProfile, language);
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Step 1: Preprocess and validate symptoms
      const processedSymptoms = await this.preprocessSymptoms(symptoms, language);
      
      // Step 2: Identify symptom clusters
      const clusters = await this.identifySymptomClusters(processedSymptoms);
      
      // Step 3: Apply diagnostic rules
      const ruleBasedDiagnosis = await this.applyDiagnosticRules(processedSymptoms, patientProfile);
      
      // Step 4: Perform semantic analysis
      const semanticAnalysis = await this.performSemanticAnalysis(processedSymptoms, language);
      
      // Step 5: Calculate differential diagnosis
      const differentialDiagnosis = await this.calculateDifferentialDiagnosis(
        ruleBasedDiagnosis,
        semanticAnalysis,
        clusters,
        patientProfile
      );
      
      // Step 6: Assess red flags and urgency
      const redFlags = await this.assessRedFlags(processedSymptoms, differentialDiagnosis.primary);
      
      // Step 7: Generate recommendations
      const recommendations = await this.generateRecommendations(
        processedSymptoms,
        differentialDiagnosis,
        patientProfile,
        language
      );
      
      // Step 8: Calculate risk assessment
      const riskAssessment = await this.calculateRiskAssessment(
        processedSymptoms,
        differentialDiagnosis,
        patientProfile
      );
      
      // Step 9: Generate treatment suggestions
      const treatmentSuggestions = await this.generateTreatmentSuggestions(
        differentialDiagnosis.primary,
        patientProfile,
        language
      );

      const analysis: EnhancedSymptomAnalysis = {
        symptoms: symptoms.map(s => s.name),
        possibleConditions: differentialDiagnosis.primary.map(condition => ({
          condition: condition.name,
          probability: this.calculateConditionProbability(condition, processedSymptoms),
          description: condition.description,
          severity: this.mapUrgencyToSeverity(condition.urgencyLevel),
        })),
        recommendations: recommendations.immediate,
        urgency: redFlags.urgencyLevel === 'immediate' ? 'emergency' : 
                redFlags.urgencyLevel === 'urgent' ? 'urgent' : 'routine',
        patientProfile,
        diagnosticConfidence: this.calculateDiagnosticConfidence(differentialDiagnosis),
        differentialDiagnosis,
        redFlags,
        followUpRecommendations: recommendations.followUp,
        riskAssessment,
        treatmentSuggestions,
        language,
      };

      // Cache the analysis
      await this.redis.setEx(cacheKey, 1800, JSON.stringify(analysis)); // 30 minutes cache

      return analysis;
    } catch (error) {
      console.error('Symptom analysis failed:', error);
      throw error;
    }
  }

  private async preprocessSymptoms(symptoms: Symptom[], language: 'en' | 'bn'): Promise<Symptom[]> {
    const processed: Symptom[] = [];
    
    for (const symptom of symptoms) {
      // Normalize symptom names
      const normalizedName = await this.normalizeSymptomName(symptom.name, language);
      
      // Validate and enrich symptom data
      const enrichedSymptom = await this.enrichSymptomData({
        ...symptom,
        name: normalizedName,
      });
      
      processed.push(enrichedSymptom);
    }
    
    return processed;
  }

  private async normalizeSymptomName(name: string, language: 'en' | 'bn'): Promise<string> {
    // Use semantic search to find the most appropriate symptom name
    const searchResults = await this.searchService.hybridSearch({
      text: name,
      language,
      searchType: 'semantic',
      category: ['symptom'],
      limit: 1,
      threshold: 0.8,
    });
    
    if (searchResults.length > 0) {
      return searchResults[0].document.title;
    }
    
    return name;
  }

  private async enrichSymptomData(symptom: Symptom): Promise<Symptom> {
    // Search for additional information about the symptom
    const searchResults = await this.searchService.hybridSearch({
      text: symptom.name,
      language: symptom.language,
      searchType: 'hybrid',
      category: ['symptom'],
      limit: 3,
    });
    
    if (searchResults.length > 0) {
      const document = searchResults[0].document;
      
      // Extract additional information from the document
      const associatedSymptoms = this.extractAssociatedSymptoms(document.content);
      const triggers = this.extractTriggers(document.content);
      
      return {
        ...symptom,
        associatedSymptoms: [...(symptom.associatedSymptoms || []), ...associatedSymptoms],
        triggers: [...(symptom.triggers || []), ...triggers],
      };
    }
    
    return symptom;
  }

  private async identifySymptomClusters(symptoms: Symptom[]): Promise<SymptomCluster[]> {
    const clusters: SymptomCluster[] = [];
    const symptomNames = symptoms.map(s => s.name);
    
    // Find predefined clusters that match current symptoms
    for (const cluster of this.symptomClusters) {
      const matchingSymptoms = cluster.symptoms.filter(s => 
        symptomNames.some(symptom => 
          symptom.toLowerCase().includes(s.toLowerCase()) ||
          s.toLowerCase().includes(symptom.toLowerCase())
        )
      );
      
      if (matchingSymptoms.length >= 2) {
        clusters.push({
          ...cluster,
          confidence: matchingSymptoms.length / cluster.symptoms.length,
        });
      }
    }
    
    return clusters.sort((a, b) => b.confidence - a.confidence);
  }

  private async applyDiagnosticRules(
    symptoms: Symptom[],
    patientProfile?: PatientProfile
  ): Promise<MedicalCondition[]> {
    const matchingConditions: Array<{ condition: MedicalCondition; score: number }> = [];
    const symptomNames = symptoms.map(s => s.name.toLowerCase());
    
    for (const rule of this.diagnosticRules) {
      let score = 0;
      
      // Check required symptoms
      const requiredMatches = rule.requiredSymptoms.filter(req => 
        symptomNames.some(symptom => symptom.includes(req.toLowerCase()))
      );
      
      if (requiredMatches.length < rule.requiredSymptoms.length) {
        continue; // Skip if not all required symptoms are present
      }
      
      score += requiredMatches.length * 2;
      
      // Check optional symptoms
      const optionalMatches = rule.optionalSymptoms.filter(opt => 
        symptomNames.some(symptom => symptom.includes(opt.toLowerCase()))
      );
      
      score += optionalMatches.length;
      
      // Check excluding symptoms (negative score)
      const excludingMatches = rule.excludingSymptoms.filter(exc => 
        symptomNames.some(symptom => symptom.includes(exc.toLowerCase()))
      );
      
      if (excludingMatches.length > 0) {
        continue; // Skip if excluding symptoms are present
      }
      
      // Check minimum symptoms requirement
      if ((requiredMatches.length + optionalMatches.length) < rule.minimumSymptoms) {
        continue;
      }
      
      // Apply patient profile filters
      if (patientProfile) {
        if (rule.ageRange && 
            (patientProfile.age < rule.ageRange.min || patientProfile.age > rule.ageRange.max)) {
          score *= 0.5; // Reduce score for age mismatch
        }
        
        if (rule.gender && rule.gender !== 'any' && patientProfile.gender !== rule.gender) {
          score *= 0.7; // Reduce score for gender mismatch
        }
        
        // Check risk factors
        if (rule.riskFactors) {
          const riskFactorMatches = rule.riskFactors.filter(rf => 
            patientProfile.medicalHistory.some(mh => mh.toLowerCase().includes(rf.toLowerCase()))
          );
          score += riskFactorMatches.length * 0.5;
        }
      }
      
      // Apply confidence weight
      score *= rule.confidenceWeight;
      
      // Find the corresponding medical condition
      const condition = this.medicalConditions.find(c => c.name === rule.condition);
      if (condition) {
        matchingConditions.push({ condition, score });
      }
    }
    
    // Sort by score and return top conditions
    return matchingConditions
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(item => item.condition);
  }

  private async performSemanticAnalysis(
    symptoms: Symptom[],
    language: 'en' | 'bn'
  ): Promise<MedicalCondition[]> {
    const symptomText = symptoms.map(s => s.name).join(' ');
    
    // Search for related conditions using semantic search
    const searchResults = await this.searchService.hybridSearch({
      text: symptomText,
      language,
      searchType: 'semantic',
      category: ['disease', 'condition'],
      limit: 15,
      threshold: 0.6,
    });
    
    const conditions: MedicalCondition[] = [];
    
    for (const result of searchResults) {
      // Extract condition information from search results
      const condition = await this.extractConditionFromSearchResult(result, language);
      if (condition) {
        conditions.push(condition);
      }
    }
    
    return conditions;
  }

  private async calculateDifferentialDiagnosis(
    ruleBasedConditions: MedicalCondition[],
    semanticConditions: MedicalCondition[],
    clusters: SymptomCluster[],
    patientProfile?: PatientProfile
  ): Promise<EnhancedSymptomAnalysis['differentialDiagnosis']> {
    // Combine and score all conditions
    const allConditions = new Map<string, { condition: MedicalCondition; sources: string[]; score: number }>();
    
    // Add rule-based conditions
    for (const condition of ruleBasedConditions) {
      allConditions.set(condition.id, {
        condition,
        sources: ['rules'],
        score: 0.8, // High confidence for rule-based
      });
    }
    
    // Add semantic conditions
    for (const condition of semanticConditions) {
      const existing = allConditions.get(condition.id);
      if (existing) {
        existing.sources.push('semantic');
        existing.score += 0.6; // Boost score for multiple sources
      } else {
        allConditions.set(condition.id, {
          condition,
          sources: ['semantic'],
          score: 0.6,
        });
      }
    }
    
    // Add cluster-based conditions
    for (const cluster of clusters) {
      for (const conditionName of cluster.commonConditions) {
        const condition = this.medicalConditions.find(c => c.name === conditionName);
        if (condition) {
          const existing = allConditions.get(condition.id);
          if (existing) {
            existing.sources.push('cluster');
            existing.score += cluster.confidence * 0.4;
          } else {
            allConditions.set(condition.id, {
              condition,
              sources: ['cluster'],
              score: cluster.confidence * 0.4,
            });
          }
        }
      }
    }
    
    // Sort conditions by score
    const sortedConditions = Array.from(allConditions.values())
      .sort((a, b) => b.score - a.score);
    
    return {
      primary: sortedConditions.slice(0, 5).map(item => item.condition),
      secondary: sortedConditions.slice(5, 10).map(item => item.condition),
      ruled_out: [], // Would be populated based on excluding symptoms
    };
  }

  private async assessRedFlags(
    symptoms: Symptom[],
    primaryConditions: MedicalCondition[]
  ): Promise<EnhancedSymptomAnalysis['redFlags']> {
    const redFlags: string[] = [];
    let urgencyLevel: 'immediate' | 'urgent' | 'routine' = 'routine';
    
    // Check for critical symptoms
    const criticalSymptoms = [
      'chest pain', 'difficulty breathing', 'severe headache', 'loss of consciousness',
      'severe abdominal pain', 'high fever', 'seizure', 'stroke symptoms'
    ];
    
    const bengaliCriticalSymptoms = [
      'বুকে ব্যথা', 'শ্বাসকষ্ট', 'তীব্র মাথাব্যথা', 'জ্ঞান হারানো',
      'তীব্র পেটব্যথা', 'উচ্চ জ্বর', 'খিঁচুনি', 'স্ট্রোকের লক্ষণ'
    ];
    
    for (const symptom of symptoms) {
      const symptomName = symptom.name.toLowerCase();
      
      // Check English critical symptoms
      for (const critical of criticalSymptoms) {
        if (symptomName.includes(critical)) {
          redFlags.push(`Critical symptom detected: ${symptom.name}`);
          urgencyLevel = 'immediate';
        }
      }
      
      // Check Bengali critical symptoms
      for (const critical of bengaliCriticalSymptoms) {
        if (symptom.name.includes(critical)) {
          redFlags.push(`Critical symptom detected: ${symptom.name}`);
          urgencyLevel = 'immediate';
        }
      }
      
      // Check severity
      if (symptom.severity === 'critical' || symptom.severity === 'severe') {
        redFlags.push(`Severe symptom: ${symptom.name}`);
        if (urgencyLevel === 'routine') urgencyLevel = 'urgent';
      }
    }
    
    // Check for emergency conditions
    for (const condition of primaryConditions) {
      if (condition.category === 'emergency') {
        redFlags.push(`Emergency condition suspected: ${condition.name}`);
        urgencyLevel = 'immediate';
      } else if (condition.urgencyLevel === 'critical' || condition.urgencyLevel === 'high') {
        redFlags.push(`High-priority condition: ${condition.name}`);
        if (urgencyLevel === 'routine') urgencyLevel = 'urgent';
      }
    }
    
    return {
      present: redFlags.length > 0,
      flags: redFlags,
      urgencyLevel,
    };
  }

  private async generateRecommendations(
    symptoms: Symptom[],
    differentialDiagnosis: EnhancedSymptomAnalysis['differentialDiagnosis'],
    patientProfile?: PatientProfile,
    language: 'en' | 'bn' = 'en'
  ): Promise<{ immediate: string[]; followUp: EnhancedSymptomAnalysis['followUpRecommendations'] }> {
    const immediate: string[] = [];
    const followUp: EnhancedSymptomAnalysis['followUpRecommendations'] = {
      timeframe: '1-2 weeks',
      tests: [],
      specialists: [],
      monitoring: [],
    };
    
    // Generate immediate recommendations
    const hasHighSeverity = symptoms.some(s => s.severity === 'severe' || s.severity === 'critical');
    const hasEmergencyCondition = differentialDiagnosis.primary.some(c => c.category === 'emergency');
    
    if (hasEmergencyCondition || hasHighSeverity) {
      immediate.push(
        language === 'bn' 
          ? 'অবিলম্বে জরুরি বিভাগে যান বা ডাক্তারের সাথে যোগাযোগ করুন'
          : 'Seek immediate medical attention or go to emergency department'
      );
      followUp.timeframe = 'immediate';
    } else {
      immediate.push(
        language === 'bn'
          ? 'একজন ডাক্তারের সাথে পরামর্শ করুন'
          : 'Consult with a healthcare provider'
      );
    }
    
    // Generate follow-up recommendations based on primary conditions
    for (const condition of differentialDiagnosis.primary.slice(0, 3)) {
      // Recommend appropriate specialists
      if (condition.specialtyRequired) {
        followUp.specialists.push(condition.specialtyRequired);
      }
      
      // Recommend relevant tests
      const tests = this.getRecommendedTests(condition, symptoms);
      followUp.tests.push(...tests);
      
      // Recommend monitoring
      const monitoring = this.getMonitoringRecommendations(condition, symptoms, language);
      followUp.monitoring.push(...monitoring);
    }
    
    // Remove duplicates
    followUp.tests = [...new Set(followUp.tests)];
    followUp.specialists = [...new Set(followUp.specialists)];
    followUp.monitoring = [...new Set(followUp.monitoring)];
    
    return { immediate, followUp };
  }

  private async calculateRiskAssessment(
    symptoms: Symptom[],
    differentialDiagnosis: EnhancedSymptomAnalysis['differentialDiagnosis'],
    patientProfile?: PatientProfile
  ): Promise<EnhancedSymptomAnalysis['riskAssessment']> {
    let score = 0;
    const factors: string[] = [];
    
    // Symptom-based risk factors
    const severityScores = { mild: 1, moderate: 2, severe: 3, critical: 4 };
    const avgSeverity = symptoms.reduce((sum, s) => sum + severityScores[s.severity], 0) / symptoms.length;
    score += avgSeverity * 10;
    
    if (avgSeverity >= 3) {
      factors.push('High symptom severity');
    }
    
    // Condition-based risk factors
    const emergencyConditions = differentialDiagnosis.primary.filter(c => c.category === 'emergency');
    score += emergencyConditions.length * 20;
    
    if (emergencyConditions.length > 0) {
      factors.push('Emergency conditions suspected');
    }
    
    // Patient profile risk factors
    if (patientProfile) {
      if (patientProfile.age > 65) {
        score += 10;
        factors.push('Advanced age');
      }
      
      if (patientProfile.medicalHistory.length > 3) {
        score += 5;
        factors.push('Complex medical history');
      }
      
      if (patientProfile.lifestyle.smoking) {
        score += 5;
        factors.push('Smoking history');
      }
    }
    
    // Normalize score to 0-100
    score = Math.min(score, 100);
    
    let overall: 'low' | 'medium' | 'high' | 'critical';
    if (score >= 80) overall = 'critical';
    else if (score >= 60) overall = 'high';
    else if (score >= 30) overall = 'medium';
    else overall = 'low';
    
    return { overall, factors, score };
  }

  private async generateTreatmentSuggestions(
    primaryConditions: MedicalCondition[],
    patientProfile?: PatientProfile,
    language: 'en' | 'bn' = 'en'
  ): Promise<EnhancedSymptomAnalysis['treatmentSuggestions']> {
    const suggestions: EnhancedSymptomAnalysis['treatmentSuggestions'] = {
      immediate: [],
      shortTerm: [],
      longTerm: [],
      lifestyle: [],
    };
    
    // Generate suggestions based on conditions
    for (const condition of primaryConditions.slice(0, 3)) {
      const conditionSuggestions = await this.getConditionTreatmentSuggestions(condition, language);
      
      suggestions.immediate.push(...conditionSuggestions.immediate);
      suggestions.shortTerm.push(...conditionSuggestions.shortTerm);
      suggestions.longTerm.push(...conditionSuggestions.longTerm);
      suggestions.lifestyle.push(...conditionSuggestions.lifestyle);
    }
    
    // Remove duplicates
    Object.keys(suggestions).forEach(key => {
      suggestions[key as keyof typeof suggestions] = [
        ...new Set(suggestions[key as keyof typeof suggestions])
      ];
    });
    
    return suggestions;
  }

  // Helper methods
  private extractAssociatedSymptoms(content: string): string[] {
    // Extract associated symptoms from medical content
    const patterns = [
      /associated with ([^.]+)/gi,
      /accompanied by ([^.]+)/gi,
      /along with ([^.]+)/gi,
    ];
    
    const symptoms: string[] = [];
    for (const pattern of patterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        symptoms.push(match[1].trim());
      }
    }
    
    return symptoms.slice(0, 3); // Limit to 3 associated symptoms
  }

  private extractTriggers(content: string): string[] {
    const patterns = [
      /triggered by ([^.]+)/gi,
      /caused by ([^.]+)/gi,
      /due to ([^.]+)/gi,
    ];
    
    const triggers: string[] = [];
    for (const pattern of patterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        triggers.push(match[1].trim());
      }
    }
    
    return triggers.slice(0, 3);
  }

  private async extractConditionFromSearchResult(
    result: any,
    language: 'en' | 'bn'
  ): Promise<MedicalCondition | null> {
    // Extract condition information from search result
    const document = result.document;
    
    return {
      id: document.id,
      name: document.title,
      description: document.content.substring(0, 200),
      category: this.inferConditionCategory(document.content),
      commonSymptoms: this.extractSymptoms(document.content),
      rareSymptoms: [],
      riskFactors: this.extractRiskFactors(document.content),
      complications: [],
      prevalence: result.relevance,
      urgencyLevel: this.inferUrgencyLevel(document.content),
      language,
    };
  }

  private inferConditionCategory(content: string): 'acute' | 'chronic' | 'emergency' | 'routine' {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('emergency') || lowerContent.includes('urgent')) {
      return 'emergency';
    }
    if (lowerContent.includes('chronic') || lowerContent.includes('long-term')) {
      return 'chronic';
    }
    if (lowerContent.includes('acute') || lowerContent.includes('sudden')) {
      return 'acute';
    }
    
    return 'routine';
  }

  private extractSymptoms(content: string): string[] {
    const patterns = [
      /symptoms include ([^.]+)/gi,
      /presents with ([^.]+)/gi,
      /characterized by ([^.]+)/gi,
    ];
    
    const symptoms: string[] = [];
    for (const pattern of patterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const symptomList = match[1].split(',').map(s => s.trim());
        symptoms.push(...symptomList);
      }
    }
    
    return symptoms.slice(0, 5);
  }

  private extractRiskFactors(content: string): string[] {
    const patterns = [
      /risk factors include ([^.]+)/gi,
      /predisposing factors ([^.]+)/gi,
      /more common in ([^.]+)/gi,
    ];
    
    const riskFactors: string[] = [];
    for (const pattern of patterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const factorList = match[1].split(',').map(f => f.trim());
        riskFactors.push(...factorList);
      }
    }
    
    return riskFactors.slice(0, 3);
  }

  private inferUrgencyLevel(content: string): 'low' | 'medium' | 'high' | 'critical' {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('life-threatening') || lowerContent.includes('critical')) {
      return 'critical';
    }
    if (lowerContent.includes('urgent') || lowerContent.includes('immediate')) {
      return 'high';
    }
    if (lowerContent.includes('moderate') || lowerContent.includes('significant')) {
      return 'medium';
    }
    
    return 'low';
  }

  private calculateConditionProbability(condition: MedicalCondition, symptoms: Symptom[]): number {
    // Calculate probability based on symptom matches and condition prevalence
    const symptomNames = symptoms.map(s => s.name.toLowerCase());
    const commonMatches = condition.commonSymptoms.filter(cs => 
      symptomNames.some(sn => sn.includes(cs.toLowerCase()))
    );
    
    const matchRatio = commonMatches.length / Math.max(condition.commonSymptoms.length, 1);
    return Math.min(matchRatio * condition.prevalence, 1);
  }

  private mapUrgencyToSeverity(urgency: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (urgency) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'medium': return 'medium';
      default: return 'low';
    }
  }

  private calculateDiagnosticConfidence(differentialDiagnosis: EnhancedSymptomAnalysis['differentialDiagnosis']): number {
    if (differentialDiagnosis.primary.length === 0) return 0;
    
    // Higher confidence if fewer primary conditions (more specific)
    const specificity = 1 / differentialDiagnosis.primary.length;
    
    // Higher confidence if primary conditions have high urgency
    const avgUrgency = differentialDiagnosis.primary.reduce((sum, condition) => {
      const urgencyScores = { low: 1, medium: 2, high: 3, critical: 4 };
      return sum + urgencyScores[condition.urgencyLevel];
    }, 0) / differentialDiagnosis.primary.length;
    
    return Math.min(specificity * 0.7 + (avgUrgency / 4) * 0.3, 1);
  }

  private getRecommendedTests(condition: MedicalCondition, symptoms: Symptom[]): string[] {
    // Return recommended tests based on condition and symptoms
    const tests: string[] = [];
    
    // Basic tests for most conditions
    tests.push('Complete Blood Count (CBC)');
    
    // Condition-specific tests
    if (condition.category === 'emergency') {
      tests.push('ECG', 'Chest X-ray', 'Basic Metabolic Panel');
    }
    
    if (symptoms.some(s => s.name.toLowerCase().includes('chest'))) {
      tests.push('ECG', 'Cardiac enzymes');
    }
    
    if (symptoms.some(s => s.name.toLowerCase().includes('fever'))) {
      tests.push('Blood culture', 'Urinalysis');
    }
    
    return tests.slice(0, 5); // Limit to 5 tests
  }

  private getMonitoringRecommendations(
    condition: MedicalCondition,
    symptoms: Symptom[],
    language: 'en' | 'bn'
  ): string[] {
    const monitoring: string[] = [];
    
    if (language === 'bn') {
      monitoring.push('নিয়মিত তাপমাত্রা পরীক্ষা করুন');
      monitoring.push('লক্ষণগুলির পরিবর্তন লক্ষ্য করুন');
      
      if (condition.urgencyLevel === 'high' || condition.urgencyLevel === 'critical') {
        monitoring.push('যেকোনো অবনতির জন্য ঘনিষ্ঠ পর্যবেক্ষণ');
      }
    } else {
      monitoring.push('Monitor temperature regularly');
      monitoring.push('Track symptom changes');
      
      if (condition.urgencyLevel === 'high' || condition.urgencyLevel === 'critical') {
        monitoring.push('Close monitoring for any deterioration');
      }
    }
    
    return monitoring;
  }

  private async getConditionTreatmentSuggestions(
    condition: MedicalCondition,
    language: 'en' | 'bn'
  ): Promise<EnhancedSymptomAnalysis['treatmentSuggestions']> {
    // This would typically query a treatment database
    // For now, return generic suggestions based on condition category
    
    const suggestions: EnhancedSymptomAnalysis['treatmentSuggestions'] = {
      immediate: [],
      shortTerm: [],
      longTerm: [],
      lifestyle: [],
    };
    
    if (language === 'bn') {
      suggestions.immediate.push('পর্যাপ্ত বিশ্রাম নিন');
      suggestions.shortTerm.push('ডাক্তারের পরামর্শ অনুযায়ী ওষুধ সেবন করুন');
      suggestions.lifestyle.push('স্বাস্থ্যকর খাবার খান', 'নিয়মিত ব্যায়াম করুন');
    } else {
      suggestions.immediate.push('Get adequate rest');
      suggestions.shortTerm.push('Follow prescribed medication regimen');
      suggestions.lifestyle.push('Maintain healthy diet', 'Regular exercise');
    }
    
    return suggestions;
  }

  private generateAnalysisCacheKey(
    symptoms: Symptom[],
    patientProfile?: PatientProfile,
    language: 'en' | 'bn' = 'en'
  ): string {
    const keyData = {
      symptoms: symptoms.map(s => ({ name: s.name, severity: s.severity })),
      patientAge: patientProfile?.age,
      patientGender: patientProfile?.gender,
      language,
    };
    
    return `symptom_analysis:${createHash('md5').update(JSON.stringify(keyData)).digest('hex')}`;
  }

  private initializeRulesAndConditions(): void {
    // Initialize with some basic diagnostic rules and conditions
    // In a real implementation, these would be loaded from a database
    
    this.diagnosticRules = [
      {
        id: 'fever_headache_rule',
        condition: 'Viral Infection',
        requiredSymptoms: ['fever'],
        optionalSymptoms: ['headache', 'fatigue', 'body ache'],
        excludingSymptoms: ['severe chest pain'],
        minimumSymptoms: 2,
        confidenceWeight: 0.8,
      },
      // Add more rules...
    ];
    
    this.medicalConditions = [
      {
        id: 'viral_infection',
        name: 'Viral Infection',
        description: 'Common viral infection with systemic symptoms',
        category: 'acute',
        commonSymptoms: ['fever', 'headache', 'fatigue'],
        rareSymptoms: [],
        riskFactors: ['recent exposure', 'weakened immunity'],
        complications: [],
        prevalence: 0.7,
        urgencyLevel: 'low',
        language: 'en',
      },
      // Add more conditions...
    ];
    
    this.symptomClusters = [
      {
        id: 'respiratory_cluster',
        symptoms: ['cough', 'shortness of breath', 'chest pain'],
        commonConditions: ['Respiratory Infection', 'Asthma'],
        severity: 'medium',
        frequency: 0.6,
        confidence: 0.8,
      },
      // Add more clusters...
    ];
  }
}