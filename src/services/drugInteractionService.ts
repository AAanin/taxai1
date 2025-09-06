import { MedicalKnowledgeService, DrugInteraction } from './medicalKnowledgeService';
import { SemanticSearchService } from './semanticSearchService';
import { RedisClientType } from 'redis';
import { createHash } from 'crypto';

// Enhanced Drug Interaction Interfaces
export interface Drug {
  id: string;
  name: string;
  genericName: string;
  brandNames: string[];
  category: string;
  activeIngredients: string[];
  dosage?: {
    amount: number;
    unit: string;
    frequency: string;
  };
  route: 'oral' | 'injection' | 'topical' | 'inhalation' | 'other';
  therapeuticClass: string;
  mechanism: string;
  halfLife?: number; // in hours
  metabolism: string[];
  contraindications: string[];
  sideEffects: string[];
  language: 'en' | 'bn';
}

export interface EnhancedDrugInteraction extends DrugInteraction {
  id: string;
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
  mechanism: string;
  onset: 'rapid' | 'delayed' | 'variable';
  documentation: 'excellent' | 'good' | 'fair' | 'poor';
  probability: number; // 0-1
  clinicalSignificance: number; // 0-10
  managementStrategy: {
    avoidCombination: boolean;
    monitoringRequired: boolean;
    dosageAdjustment: boolean;
    timingAdjustment: boolean;
    alternativeRecommended: boolean;
  };
  monitoringParameters: string[];
  timeframe: string;
  patientEducation: string[];
  references: string[];
  language: 'en' | 'bn';
}

export interface DrugAllergy {
  drugName: string;
  allergen: string;
  reactionType: 'mild' | 'moderate' | 'severe' | 'anaphylaxis';
  symptoms: string[];
  crossReactivity: string[];
}

export interface PatientMedication {
  drug: Drug;
  startDate: Date;
  endDate?: Date;
  prescribedBy: string;
  indication: string;
  adherence: 'excellent' | 'good' | 'fair' | 'poor';
  sideEffectsExperienced: string[];
}

export interface InteractionAlert {
  id: string;
  type: 'drug-drug' | 'drug-food' | 'drug-condition' | 'drug-allergy';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  urgency: 'routine' | 'urgent' | 'immediate';
  dismissible: boolean;
  timestamp: Date;
  acknowledged: boolean;
}

export interface DrugDatabase {
  drugs: Map<string, Drug>;
  interactions: Map<string, EnhancedDrugInteraction[]>;
  allergies: Map<string, DrugAllergy[]>;
  foodInteractions: Map<string, string[]>;
  conditionInteractions: Map<string, string[]>;
}

export interface InteractionCheckRequest {
  drugs: string[];
  patientProfile?: {
    age: number;
    weight?: number;
    kidneyFunction?: 'normal' | 'mild' | 'moderate' | 'severe';
    liverFunction?: 'normal' | 'mild' | 'moderate' | 'severe';
    allergies: DrugAllergy[];
    conditions: string[];
  };
  includeFood?: boolean;
  includeConditions?: boolean;
  language?: 'en' | 'bn';
}

export interface InteractionCheckResult {
  interactions: EnhancedDrugInteraction[];
  alerts: InteractionAlert[];
  recommendations: {
    immediate: string[];
    monitoring: string[];
    alternatives: string[];
    patientEducation: string[];
  };
  riskScore: {
    overall: number; // 0-100
    breakdown: {
      drugDrug: number;
      drugFood: number;
      drugCondition: number;
      drugAllergy: number;
    };
  };
  safetyProfile: {
    level: 'safe' | 'caution' | 'warning' | 'contraindicated';
    factors: string[];
  };
}

export class DrugInteractionService {
  private knowledgeService: MedicalKnowledgeService;
  private searchService: SemanticSearchService;
  private redis: RedisClientType;
  private drugDatabase: DrugDatabase;
  private interactionCache = new Map<string, EnhancedDrugInteraction[]>();

  constructor(
    knowledgeService: MedicalKnowledgeService,
    searchService: SemanticSearchService,
    redis: RedisClientType
  ) {
    this.knowledgeService = knowledgeService;
    this.searchService = searchService;
    this.redis = redis;
    this.drugDatabase = {
      drugs: new Map(),
      interactions: new Map(),
      allergies: new Map(),
      foodInteractions: new Map(),
      conditionInteractions: new Map(),
    };
    this.initializeDrugDatabase();
  }

  async checkInteractions(request: InteractionCheckRequest): Promise<InteractionCheckResult> {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(request);
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Normalize drug names
      const normalizedDrugs = await this.normalizeDrugNames(request.drugs, request.language || 'en');
      
      // Get drug information
      const drugs = await this.getDrugInformation(normalizedDrugs);
      
      // Check drug-drug interactions
      const drugDrugInteractions = await this.checkDrugDrugInteractions(drugs);
      
      // Check drug-food interactions if requested
      const drugFoodInteractions = request.includeFood ? 
        await this.checkDrugFoodInteractions(drugs) : [];
      
      // Check drug-condition interactions if requested
      const drugConditionInteractions = request.includeConditions && request.patientProfile?.conditions ? 
        await this.checkDrugConditionInteractions(drugs, request.patientProfile.conditions) : [];
      
      // Check drug allergies
      const drugAllergyInteractions = request.patientProfile?.allergies ? 
        await this.checkDrugAllergies(drugs, request.patientProfile.allergies) : [];
      
      // Combine all interactions
      const allInteractions = [
        ...drugDrugInteractions,
        ...drugFoodInteractions,
        ...drugConditionInteractions,
        ...drugAllergyInteractions,
      ];
      
      // Generate alerts
      const alerts = await this.generateAlerts(allInteractions, request.patientProfile);
      
      // Calculate risk score
      const riskScore = this.calculateRiskScore(allInteractions, request.patientProfile);
      
      // Generate recommendations
      const recommendations = await this.generateRecommendations(
        allInteractions,
        drugs,
        request.patientProfile,
        request.language || 'en'
      );
      
      // Determine safety profile
      const safetyProfile = this.determineSafetyProfile(allInteractions, riskScore);
      
      const result: InteractionCheckResult = {
        interactions: allInteractions,
        alerts,
        recommendations,
        riskScore,
        safetyProfile,
      };
      
      // Cache result
      await this.redis.setEx(cacheKey, 3600, JSON.stringify(result)); // 1 hour cache
      
      return result;
    } catch (error) {
      console.error('Drug interaction check failed:', error);
      throw error;
    }
  }

  private async normalizeDrugNames(drugNames: string[], language: 'en' | 'bn'): Promise<string[]> {
    const normalized: string[] = [];
    
    for (const drugName of drugNames) {
      // First check local database
      const localMatch = this.findDrugInDatabase(drugName);
      if (localMatch) {
        normalized.push(localMatch.name);
        continue;
      }
      
      // Use semantic search to find the correct drug name
      const searchResults = await this.searchService.hybridSearch({
        text: drugName,
        language,
        searchType: 'semantic',
        category: ['drug'],
        limit: 1,
        threshold: 0.8,
      });
      
      if (searchResults.length > 0) {
        normalized.push(searchResults[0].document.title);
      } else {
        // If not found, use original name but flag for manual review
        normalized.push(drugName);
        console.warn(`Drug not found in database: ${drugName}`);
      }
    }
    
    return normalized;
  }

  private findDrugInDatabase(drugName: string): Drug | null {
    const lowerName = drugName.toLowerCase();
    
    for (const [key, drug] of this.drugDatabase.drugs) {
      if (drug.name.toLowerCase() === lowerName ||
          drug.genericName.toLowerCase() === lowerName ||
          drug.brandNames.some(brand => brand.toLowerCase() === lowerName)) {
        return drug;
      }
    }
    
    return null;
  }

  private async getDrugInformation(drugNames: string[]): Promise<Drug[]> {
    const drugs: Drug[] = [];
    
    for (const drugName of drugNames) {
      const drug = this.drugDatabase.drugs.get(drugName) || 
                  await this.fetchDrugInformation(drugName);
      
      if (drug) {
        drugs.push(drug);
      }
    }
    
    return drugs;
  }

  private async fetchDrugInformation(drugName: string): Promise<Drug | null> {
    try {
      // Search for drug information using knowledge service
      const searchResults = await this.searchService.hybridSearch({
        text: `${drugName} drug information pharmacology`,
        language: 'en',
        searchType: 'hybrid',
        category: ['drug'],
        limit: 3,
      });
      
      if (searchResults.length > 0) {
        const drugInfo = this.extractDrugInformation(searchResults[0].document);
        
        // Cache the drug information
        if (drugInfo) {
          this.drugDatabase.drugs.set(drugName, drugInfo);
        }
        
        return drugInfo;
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to fetch drug information for ${drugName}:`, error);
      return null;
    }
  }

  private extractDrugInformation(document: any): Drug | null {
    try {
      // Extract drug information from document content
      const content = document.content;
      
      return {
        id: document.id,
        name: document.title,
        genericName: this.extractGenericName(content),
        brandNames: this.extractBrandNames(content),
        category: this.extractDrugCategory(content),
        activeIngredients: this.extractActiveIngredients(content),
        route: this.extractRoute(content),
        therapeuticClass: this.extractTherapeuticClass(content),
        mechanism: this.extractMechanism(content),
        metabolism: this.extractMetabolism(content),
        contraindications: this.extractContraindications(content),
        sideEffects: this.extractSideEffects(content),
        language: 'en',
      };
    } catch (error) {
      console.error('Failed to extract drug information:', error);
      return null;
    }
  }

  private async checkDrugDrugInteractions(drugs: Drug[]): Promise<EnhancedDrugInteraction[]> {
    const interactions: EnhancedDrugInteraction[] = [];
    
    // Check all drug pairs
    for (let i = 0; i < drugs.length; i++) {
      for (let j = i + 1; j < drugs.length; j++) {
        const drug1 = drugs[i];
        const drug2 = drugs[j];
        
        // Check local database first
        const localInteraction = this.findLocalInteraction(drug1.name, drug2.name);
        if (localInteraction) {
          interactions.push(...localInteraction);
          continue;
        }
        
        // Search for interaction information
        const searchInteraction = await this.searchForInteraction(drug1, drug2);
        if (searchInteraction) {
          interactions.push(searchInteraction);
          
          // Cache the interaction
          const key = this.getInteractionKey(drug1.name, drug2.name);
          this.interactionCache.set(key, [searchInteraction]);
        }
      }
    }
    
    return interactions;
  }

  private findLocalInteraction(drug1: string, drug2: string): EnhancedDrugInteraction[] | null {
    const key1 = this.getInteractionKey(drug1, drug2);
    const key2 = this.getInteractionKey(drug2, drug1);
    
    return this.drugDatabase.interactions.get(key1) || 
           this.drugDatabase.interactions.get(key2) || 
           this.interactionCache.get(key1) || 
           this.interactionCache.get(key2) || 
           null;
  }

  private async searchForInteraction(drug1: Drug, drug2: Drug): Promise<EnhancedDrugInteraction | null> {
    try {
      const searchQuery = `${drug1.name} ${drug2.name} drug interaction contraindication`;
      
      const searchResults = await this.searchService.hybridSearch({
        text: searchQuery,
        language: 'en',
        searchType: 'hybrid',
        category: ['drug'],
        limit: 3,
        threshold: 0.7,
      });
      
      if (searchResults.length > 0) {
        return this.extractInteractionFromSearchResult(drug1, drug2, searchResults[0]);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to search for drug interaction:', error);
      return null;
    }
  }

  private extractInteractionFromSearchResult(
    drug1: Drug,
    drug2: Drug,
    searchResult: any
  ): EnhancedDrugInteraction {
    const content = searchResult.document.content.toLowerCase();
    
    // Determine severity
    let severity: 'minor' | 'moderate' | 'major' | 'contraindicated' = 'minor';
    if (content.includes('contraindicated') || content.includes('avoid')) {
      severity = 'contraindicated';
    } else if (content.includes('major') || content.includes('serious')) {
      severity = 'major';
    } else if (content.includes('moderate')) {
      severity = 'moderate';
    }
    
    // Determine mechanism
    const mechanism = this.extractInteractionMechanism(content);
    
    // Determine onset
    let onset: 'rapid' | 'delayed' | 'variable' = 'variable';
    if (content.includes('rapid') || content.includes('immediate')) {
      onset = 'rapid';
    } else if (content.includes('delayed') || content.includes('gradual')) {
      onset = 'delayed';
    }
    
    return {
      id: `${drug1.id}_${drug2.id}_interaction`,
      drug1: drug1.name,
      drug2: drug2.name,
      interactionType: severity,
      severity,
      description: searchResult.document.content.substring(0, 300),
      mechanism,
      onset,
      documentation: this.assessDocumentationQuality(searchResult),
      probability: searchResult.relevance,
      clinicalSignificance: this.calculateClinicalSignificance(severity),
      managementStrategy: this.generateManagementStrategy(severity),
      monitoringParameters: this.extractMonitoringParameters(content),
      timeframe: this.extractTimeframe(content),
      effects: this.extractEffects(content),
      recommendations: this.extractRecommendations(content),
      patientEducation: this.generatePatientEducation(drug1, drug2, severity),
      references: [searchResult.document.metadata?.source || 'Unknown'],
      language: 'en',
    };
  }

  private async checkDrugFoodInteractions(drugs: Drug[]): Promise<EnhancedDrugInteraction[]> {
    const interactions: EnhancedDrugInteraction[] = [];
    
    for (const drug of drugs) {
      const foodInteractions = this.drugDatabase.foodInteractions.get(drug.name);
      if (foodInteractions) {
        for (const food of foodInteractions) {
          const interaction = await this.createFoodInteraction(drug, food);
          if (interaction) {
            interactions.push(interaction);
          }
        }
      }
    }
    
    return interactions;
  }

  private async checkDrugConditionInteractions(
    drugs: Drug[],
    conditions: string[]
  ): Promise<EnhancedDrugInteraction[]> {
    const interactions: EnhancedDrugInteraction[] = [];
    
    for (const drug of drugs) {
      for (const condition of conditions) {
        // Check if drug is contraindicated for this condition
        if (drug.contraindications.some(contra => 
          contra.toLowerCase().includes(condition.toLowerCase())
        )) {
          const interaction = await this.createConditionInteraction(drug, condition);
          if (interaction) {
            interactions.push(interaction);
          }
        }
      }
    }
    
    return interactions;
  }

  private async checkDrugAllergies(
    drugs: Drug[],
    allergies: DrugAllergy[]
  ): Promise<EnhancedDrugInteraction[]> {
    const interactions: EnhancedDrugInteraction[] = [];
    
    for (const drug of drugs) {
      for (const allergy of allergies) {
        // Check direct allergy match
        if (drug.name.toLowerCase().includes(allergy.drugName.toLowerCase()) ||
            drug.activeIngredients.some(ingredient => 
              ingredient.toLowerCase().includes(allergy.allergen.toLowerCase())
            )) {
          const interaction = await this.createAllergyInteraction(drug, allergy);
          if (interaction) {
            interactions.push(interaction);
          }
        }
        
        // Check cross-reactivity
        if (allergy.crossReactivity.some(cross => 
          drug.name.toLowerCase().includes(cross.toLowerCase())
        )) {
          const interaction = await this.createCrossReactivityInteraction(drug, allergy);
          if (interaction) {
            interactions.push(interaction);
          }
        }
      }
    }
    
    return interactions;
  }

  private async generateAlerts(
    interactions: EnhancedDrugInteraction[],
    patientProfile?: InteractionCheckRequest['patientProfile']
  ): Promise<InteractionAlert[]> {
    const alerts: InteractionAlert[] = [];
    
    for (const interaction of interactions) {
      const alert: InteractionAlert = {
        id: `alert_${interaction.id}`,
        type: this.determineAlertType(interaction),
        severity: this.mapSeverityToAlertLevel(interaction.severity),
        title: `${interaction.drug1} - ${interaction.drug2} Interaction`,
        description: interaction.description,
        recommendation: interaction.recommendations[0] || 'Consult healthcare provider',
        urgency: this.determineUrgency(interaction.severity),
        dismissible: interaction.severity !== 'contraindicated',
        timestamp: new Date(),
        acknowledged: false,
      };
      
      alerts.push(alert);
    }
    
    return alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  private calculateRiskScore(
    interactions: EnhancedDrugInteraction[],
    patientProfile?: InteractionCheckRequest['patientProfile']
  ): InteractionCheckResult['riskScore'] {
    let drugDrugScore = 0;
    let drugFoodScore = 0;
    let drugConditionScore = 0;
    let drugAllergyScore = 0;
    
    const severityScores = { minor: 1, moderate: 2, major: 3, contraindicated: 4 };
    
    for (const interaction of interactions) {
      const score = severityScores[interaction.severity] * 25; // Max 100 per interaction
      
      if (interaction.drug2 && !interaction.drug2.includes('food') && !interaction.drug2.includes('condition')) {
        drugDrugScore = Math.max(drugDrugScore, score);
      } else if (interaction.drug2?.includes('food')) {
        drugFoodScore = Math.max(drugFoodScore, score);
      } else if (interaction.drug2?.includes('condition')) {
        drugConditionScore = Math.max(drugConditionScore, score);
      } else {
        drugAllergyScore = Math.max(drugAllergyScore, score);
      }
    }
    
    // Apply patient-specific risk factors
    if (patientProfile) {
      if (patientProfile.age > 65) {
        drugDrugScore *= 1.2;
        drugConditionScore *= 1.3;
      }
      
      if (patientProfile.kidneyFunction === 'moderate' || patientProfile.kidneyFunction === 'severe') {
        drugDrugScore *= 1.3;
      }
      
      if (patientProfile.liverFunction === 'moderate' || patientProfile.liverFunction === 'severe') {
        drugDrugScore *= 1.3;
      }
    }
    
    const overall = Math.min(
      Math.max(drugDrugScore, drugFoodScore, drugConditionScore, drugAllergyScore),
      100
    );
    
    return {
      overall,
      breakdown: {
        drugDrug: Math.min(drugDrugScore, 100),
        drugFood: Math.min(drugFoodScore, 100),
        drugCondition: Math.min(drugConditionScore, 100),
        drugAllergy: Math.min(drugAllergyScore, 100),
      },
    };
  }

  private async generateRecommendations(
    interactions: EnhancedDrugInteraction[],
    drugs: Drug[],
    patientProfile?: InteractionCheckRequest['patientProfile'],
    language: 'en' | 'bn' = 'en'
  ): Promise<InteractionCheckResult['recommendations']> {
    const recommendations: InteractionCheckResult['recommendations'] = {
      immediate: [],
      monitoring: [],
      alternatives: [],
      patientEducation: [],
    };
    
    // Process each interaction
    for (const interaction of interactions) {
      if (interaction.severity === 'contraindicated') {
        recommendations.immediate.push(
          language === 'bn' 
            ? `${interaction.drug1} এবং ${interaction.drug2} একসাথে ব্যবহার করবেন না`
            : `Avoid combination of ${interaction.drug1} and ${interaction.drug2}`
        );
      } else if (interaction.severity === 'major') {
        recommendations.immediate.push(
          language === 'bn'
            ? `${interaction.drug1} এবং ${interaction.drug2} এর জন্য ডাক্তারের পরামর্শ নিন`
            : `Consult healthcare provider about ${interaction.drug1} and ${interaction.drug2} combination`
        );
      }
      
      // Add monitoring recommendations
      if (interaction.managementStrategy.monitoringRequired) {
        recommendations.monitoring.push(...interaction.monitoringParameters);
      }
      
      // Add patient education
      recommendations.patientEducation.push(...interaction.patientEducation);
    }
    
    // Generate alternative recommendations
    for (const drug of drugs) {
      const hasContraindication = interactions.some(i => 
        (i.drug1 === drug.name || i.drug2 === drug.name) && i.severity === 'contraindicated'
      );
      
      if (hasContraindication) {
        const alternatives = await this.findAlternativeDrugs(drug, language);
        recommendations.alternatives.push(...alternatives);
      }
    }
    
    // Remove duplicates
    Object.keys(recommendations).forEach(key => {
      recommendations[key as keyof typeof recommendations] = [
        ...new Set(recommendations[key as keyof typeof recommendations])
      ];
    });
    
    return recommendations;
  }

  private determineSafetyProfile(
    interactions: EnhancedDrugInteraction[],
    riskScore: InteractionCheckResult['riskScore']
  ): InteractionCheckResult['safetyProfile'] {
    const factors: string[] = [];
    let level: 'safe' | 'caution' | 'warning' | 'contraindicated' = 'safe';
    
    const hasContraindicated = interactions.some(i => i.severity === 'contraindicated');
    const hasMajor = interactions.some(i => i.severity === 'major');
    const hasModerate = interactions.some(i => i.severity === 'moderate');
    
    if (hasContraindicated) {
      level = 'contraindicated';
      factors.push('Contraindicated drug combinations detected');
    } else if (hasMajor || riskScore.overall >= 75) {
      level = 'warning';
      factors.push('Major interactions or high risk score');
    } else if (hasModerate || riskScore.overall >= 50) {
      level = 'caution';
      factors.push('Moderate interactions detected');
    }
    
    if (riskScore.breakdown.drugAllergy > 0) {
      factors.push('Potential allergic reactions');
    }
    
    return { level, factors };
  }

  // Helper methods for extraction and processing
  private extractGenericName(content: string): string {
    const patterns = [
      /generic name[:\s]+([^\n\.]+)/i,
      /active ingredient[:\s]+([^\n\.]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) return match[1].trim();
    }
    
    return '';
  }

  private extractBrandNames(content: string): string[] {
    const patterns = [
      /brand names?[:\s]+([^\n\.]+)/i,
      /trade names?[:\s]+([^\n\.]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].split(',').map(name => name.trim());
      }
    }
    
    return [];
  }

  private extractDrugCategory(content: string): string {
    const patterns = [
      /drug class[:\s]+([^\n\.]+)/i,
      /category[:\s]+([^\n\.]+)/i,
      /classification[:\s]+([^\n\.]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) return match[1].trim();
    }
    
    return 'Unknown';
  }

  private extractActiveIngredients(content: string): string[] {
    const patterns = [
      /active ingredients?[:\s]+([^\n\.]+)/i,
      /contains[:\s]+([^\n\.]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].split(',').map(ingredient => ingredient.trim());
      }
    }
    
    return [];
  }

  private extractRoute(content: string): 'oral' | 'injection' | 'topical' | 'inhalation' | 'other' {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('oral') || lowerContent.includes('tablet') || lowerContent.includes('capsule')) {
      return 'oral';
    }
    if (lowerContent.includes('injection') || lowerContent.includes('intravenous') || lowerContent.includes('intramuscular')) {
      return 'injection';
    }
    if (lowerContent.includes('topical') || lowerContent.includes('cream') || lowerContent.includes('ointment')) {
      return 'topical';
    }
    if (lowerContent.includes('inhalation') || lowerContent.includes('inhaler')) {
      return 'inhalation';
    }
    
    return 'other';
  }

  private extractTherapeuticClass(content: string): string {
    const patterns = [
      /therapeutic class[:\s]+([^\n\.]+)/i,
      /used for[:\s]+([^\n\.]+)/i,
      /indication[:\s]+([^\n\.]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) return match[1].trim();
    }
    
    return 'Unknown';
  }

  private extractMechanism(content: string): string {
    const patterns = [
      /mechanism of action[:\s]+([^\n\.]+)/i,
      /works by[:\s]+([^\n\.]+)/i,
      /acts by[:\s]+([^\n\.]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) return match[1].trim();
    }
    
    return 'Unknown';
  }

  private extractMetabolism(content: string): string[] {
    const patterns = [
      /metabolized by[:\s]+([^\n\.]+)/i,
      /metabolism[:\s]+([^\n\.]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].split(',').map(item => item.trim());
      }
    }
    
    return [];
  }

  private extractContraindications(content: string): string[] {
    const patterns = [
      /contraindications?[:\s]+([^\n\.]+)/i,
      /should not be used[:\s]+([^\n\.]+)/i,
      /avoid in[:\s]+([^\n\.]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].split(',').map(item => item.trim());
      }
    }
    
    return [];
  }

  private extractSideEffects(content: string): string[] {
    const patterns = [
      /side effects?[:\s]+([^\n\.]+)/i,
      /adverse effects?[:\s]+([^\n\.]+)/i,
      /may cause[:\s]+([^\n\.]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].split(',').map(item => item.trim());
      }
    }
    
    return [];
  }

  private extractInteractionMechanism(content: string): string {
    const patterns = [
      /mechanism[:\s]+([^\n\.]+)/i,
      /due to[:\s]+([^\n\.]+)/i,
      /caused by[:\s]+([^\n\.]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) return match[1].trim();
    }
    
    return 'Unknown mechanism';
  }

  private assessDocumentationQuality(searchResult: any): 'excellent' | 'good' | 'fair' | 'poor' {
    const reliability = searchResult.document.metadata?.reliability || 0;
    
    if (reliability >= 0.9) return 'excellent';
    if (reliability >= 0.7) return 'good';
    if (reliability >= 0.5) return 'fair';
    return 'poor';
  }

  private calculateClinicalSignificance(severity: string): number {
    const scores = { minor: 3, moderate: 6, major: 8, contraindicated: 10 };
    return scores[severity as keyof typeof scores] || 1;
  }

  private generateManagementStrategy(severity: string): EnhancedDrugInteraction['managementStrategy'] {
    switch (severity) {
      case 'contraindicated':
        return {
          avoidCombination: true,
          monitoringRequired: false,
          dosageAdjustment: false,
          timingAdjustment: false,
          alternativeRecommended: true,
        };
      case 'major':
        return {
          avoidCombination: false,
          monitoringRequired: true,
          dosageAdjustment: true,
          timingAdjustment: true,
          alternativeRecommended: true,
        };
      case 'moderate':
        return {
          avoidCombination: false,
          monitoringRequired: true,
          dosageAdjustment: false,
          timingAdjustment: true,
          alternativeRecommended: false,
        };
      default:
        return {
          avoidCombination: false,
          monitoringRequired: false,
          dosageAdjustment: false,
          timingAdjustment: false,
          alternativeRecommended: false,
        };
    }
  }

  private extractMonitoringParameters(content: string): string[] {
    const patterns = [
      /monitor[:\s]+([^\n\.]+)/gi,
      /watch for[:\s]+([^\n\.]+)/gi,
      /check[:\s]+([^\n\.]+)/gi,
    ];
    
    const parameters: string[] = [];
    for (const pattern of patterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        parameters.push(match[1].trim());
      }
    }
    
    return parameters.slice(0, 3);
  }

  private extractTimeframe(content: string): string {
    const patterns = [
      /(\d+\s*(?:hours?|days?|weeks?))/gi,
      /within\s+(\d+\s*(?:hours?|days?))/gi,
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) return match[1];
    }
    
    return 'Variable';
  }

  private extractEffects(content: string): string[] {
    const patterns = [
      /effects?[:\s]+([^\n\.]+)/gi,
      /may cause[:\s]+([^\n\.]+)/gi,
      /results in[:\s]+([^\n\.]+)/gi,
    ];
    
    const effects: string[] = [];
    for (const pattern of patterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        effects.push(match[1].trim());
      }
    }
    
    return effects.slice(0, 3);
  }

  private extractRecommendations(content: string): string[] {
    const patterns = [
      /recommend[:\s]+([^\n\.]+)/gi,
      /should[:\s]+([^\n\.]+)/gi,
      /advise[:\s]+([^\n\.]+)/gi,
    ];
    
    const recommendations: string[] = [];
    for (const pattern of patterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        recommendations.push(match[1].trim());
      }
    }
    
    return recommendations.slice(0, 2);
  }

  private generatePatientEducation(
    drug1: Drug,
    drug2: Drug,
    severity: string
  ): string[] {
    const education: string[] = [];
    
    if (severity === 'contraindicated') {
      education.push(`Never take ${drug1.name} and ${drug2.name} together`);
      education.push('Contact your healthcare provider immediately if you have taken both');
    } else if (severity === 'major') {
      education.push(`Be aware of potential interactions between ${drug1.name} and ${drug2.name}`);
      education.push('Report any unusual symptoms to your healthcare provider');
    }
    
    education.push('Always inform healthcare providers of all medications you are taking');
    
    return education;
  }

  private async createFoodInteraction(drug: Drug, food: string): Promise<EnhancedDrugInteraction | null> {
    // Create a food interaction object
    return {
      id: `${drug.id}_${food}_food_interaction`,
      drug1: drug.name,
      drug2: `food: ${food}`,
      interactionType: 'moderate',
      severity: 'moderate',
      description: `${drug.name} may interact with ${food}`,
      mechanism: 'Food interaction',
      onset: 'variable',
      documentation: 'fair',
      probability: 0.6,
      clinicalSignificance: 5,
      managementStrategy: this.generateManagementStrategy('moderate'),
      monitoringParameters: ['Monitor for reduced efficacy'],
      timeframe: '1-2 hours',
      effects: ['Reduced absorption', 'Altered effectiveness'],
      recommendations: [`Take ${drug.name} away from ${food}`],
      patientEducation: [`Avoid ${food} when taking ${drug.name}`],
      references: ['Food interaction database'],
      language: 'en',
    };
  }

  private async createConditionInteraction(drug: Drug, condition: string): Promise<EnhancedDrugInteraction | null> {
    return {
      id: `${drug.id}_${condition}_condition_interaction`,
      drug1: drug.name,
      drug2: `condition: ${condition}`,
      interactionType: 'major',
      severity: 'major',
      description: `${drug.name} is contraindicated in ${condition}`,
      mechanism: 'Disease contraindication',
      onset: 'variable',
      documentation: 'good',
      probability: 0.8,
      clinicalSignificance: 8,
      managementStrategy: this.generateManagementStrategy('major'),
      monitoringParameters: ['Monitor disease progression'],
      timeframe: 'Ongoing',
      effects: ['Disease exacerbation', 'Reduced safety'],
      recommendations: ['Consider alternative therapy'],
      patientEducation: [`Inform healthcare providers about ${condition}`],
      references: ['Contraindication database'],
      language: 'en',
    };
  }

  private async createAllergyInteraction(drug: Drug, allergy: DrugAllergy): Promise<EnhancedDrugInteraction | null> {
    return {
      id: `${drug.id}_${allergy.drugName}_allergy_interaction`,
      drug1: drug.name,
      drug2: `allergy: ${allergy.drugName}`,
      interactionType: 'contraindicated',
      severity: 'contraindicated',
      description: `Patient is allergic to ${allergy.drugName}`,
      mechanism: 'Allergic reaction',
      onset: 'rapid',
      documentation: 'excellent',
      probability: 1.0,
      clinicalSignificance: 10,
      managementStrategy: this.generateManagementStrategy('contraindicated'),
      monitoringParameters: ['Monitor for allergic reactions'],
      timeframe: 'Immediate',
      effects: allergy.symptoms,
      recommendations: ['Avoid completely', 'Use alternative medication'],
      patientEducation: ['Never take this medication', 'Inform all healthcare providers of allergy'],
      references: ['Patient allergy history'],
      language: 'en',
    };
  }

  private async createCrossReactivityInteraction(drug: Drug, allergy: DrugAllergy): Promise<EnhancedDrugInteraction | null> {
    return {
      id: `${drug.id}_${allergy.drugName}_cross_reactivity`,
      drug1: drug.name,
      drug2: `cross-reactivity: ${allergy.drugName}`,
      interactionType: 'major',
      severity: 'major',
      description: `Potential cross-reactivity with ${allergy.drugName}`,
      mechanism: 'Cross-reactivity',
      onset: 'rapid',
      documentation: 'good',
      probability: 0.7,
      clinicalSignificance: 8,
      managementStrategy: this.generateManagementStrategy('major'),
      monitoringParameters: ['Monitor for allergic reactions'],
      timeframe: 'Immediate to 1 hour',
      effects: ['Potential allergic reaction'],
      recommendations: ['Use with extreme caution', 'Consider alternative'],
      patientEducation: ['Be aware of potential cross-reactivity'],
      references: ['Cross-reactivity database'],
      language: 'en',
    };
  }

  private determineAlertType(interaction: EnhancedDrugInteraction): InteractionAlert['type'] {
    if (interaction.drug2?.includes('food')) return 'drug-food';
    if (interaction.drug2?.includes('condition')) return 'drug-condition';
    if (interaction.drug2?.includes('allergy')) return 'drug-allergy';
    return 'drug-drug';
  }

  private mapSeverityToAlertLevel(severity: string): InteractionAlert['severity'] {
    const mapping = {
      minor: 'low' as const,
      moderate: 'medium' as const,
      major: 'high' as const,
      contraindicated: 'critical' as const,
    };
    return mapping[severity as keyof typeof mapping] || 'low';
  }

  private determineUrgency(severity: string): InteractionAlert['urgency'] {
    if (severity === 'contraindicated') return 'immediate';
    if (severity === 'major') return 'urgent';
    return 'routine';
  }

  private async findAlternativeDrugs(drug: Drug, language: 'en' | 'bn'): Promise<string[]> {
    // Search for alternative drugs in the same therapeutic class
    const searchResults = await this.searchService.hybridSearch({
      text: `${drug.therapeuticClass} alternative drugs`,
      language,
      searchType: 'semantic',
      category: ['drug'],
      limit: 3,
    });
    
    return searchResults
      .map(result => result.document.title)
      .filter(title => title !== drug.name)
      .slice(0, 2);
  }

  private getInteractionKey(drug1: string, drug2: string): string {
    const sorted = [drug1, drug2].sort();
    return `${sorted[0]}_${sorted[1]}`;
  }

  private generateCacheKey(request: InteractionCheckRequest): string {
    const keyData = {
      drugs: request.drugs.sort(),
      patientAge: request.patientProfile?.age,
      conditions: request.patientProfile?.conditions?.sort(),
      allergies: request.patientProfile?.allergies?.map(a => a.drugName).sort(),
      includeFood: request.includeFood,
      includeConditions: request.includeConditions,
    };
    
    return `drug_interaction:${createHash('md5').update(JSON.stringify(keyData)).digest('hex')}`;
  }

  private initializeDrugDatabase(): void {
    // Initialize with some basic drug information
    // In a real implementation, this would be loaded from a comprehensive drug database
    
    const sampleDrug: Drug = {
      id: 'aspirin_001',
      name: 'Aspirin',
      genericName: 'Acetylsalicylic acid',
      brandNames: ['Bayer', 'Bufferin'],
      category: 'NSAID',
      activeIngredients: ['Acetylsalicylic acid'],
      route: 'oral',
      therapeuticClass: 'Analgesic, Anti-inflammatory',
      mechanism: 'COX inhibition',
      metabolism: ['Liver'],
      contraindications: ['Bleeding disorders', 'Severe kidney disease'],
      sideEffects: ['Stomach upset', 'Bleeding risk'],
      language: 'en',
    };
    
    this.drugDatabase.drugs.set('Aspirin', sampleDrug);
    
    // Add some sample interactions
    const sampleInteraction: EnhancedDrugInteraction = {
      id: 'aspirin_warfarin_interaction',
      drug1: 'Aspirin',
      drug2: 'Warfarin',
      interactionType: 'major',
      severity: 'major',
      description: 'Increased bleeding risk',
      mechanism: 'Additive anticoagulant effects',
      onset: 'rapid',
      documentation: 'excellent',
      probability: 0.9,
      clinicalSignificance: 8,
      managementStrategy: this.generateManagementStrategy('major'),
      monitoringParameters: ['INR', 'Bleeding signs'],
      timeframe: '1-2 days',
      effects: ['Increased bleeding risk'],
      recommendations: ['Monitor INR closely', 'Watch for bleeding'],
      patientEducation: ['Report any unusual bleeding'],
      references: ['Drug interaction database'],
      language: 'en',
    };
    
    this.drugDatabase.interactions.set('Aspirin_Warfarin', [sampleInteraction]);
    
    // Add food interactions
    this.drugDatabase.foodInteractions.set('Aspirin', ['alcohol']);
  }
}