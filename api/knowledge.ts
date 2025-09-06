import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { MedicalKnowledgeService } from '../src/services/medicalKnowledgeService';
import { SemanticSearchService, HybridSearchQuery } from '../src/services/semanticSearchService';
import { SymptomAnalysisService, Symptom, PatientProfile } from '../src/services/symptomAnalysisService';
import { DrugInteractionService, InteractionCheckRequest } from '../src/services/drugInteractionService';
import { createClient } from 'redis';

const router = Router();

// Initialize Redis client
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Initialize services
let knowledgeService: MedicalKnowledgeService;
let searchService: SemanticSearchService;
let symptomService: SymptomAnalysisService;
let drugService: DrugInteractionService;

// Initialize services on startup
async function initializeServices() {
  try {
    await redis.connect();
    
    const knowledgeConfig = {
      milvus: {
        address: process.env.MILVUS_ADDRESS || 'localhost:19530',
        username: process.env.MILVUS_USERNAME,
        password: process.env.MILVUS_PASSWORD,
        collection: 'medical_knowledge',
      },
      weaviate: {
        scheme: process.env.WEAVIATE_SCHEME || 'http',
        host: process.env.WEAVIATE_HOST || 'localhost:8080',
        apiKey: process.env.WEAVIATE_API_KEY,
        className: 'MedicalDocument',
      },
      redis,
      cacheConfig: {
        searchTTL: 300, // 5 minutes
        embeddingTTL: 3600, // 1 hour
        analysisTTL: 1800, // 30 minutes
      },
      embeddingModel: {
        provider: 'openai' as const,
        model: 'text-embedding-ada-002',
        apiKey: process.env.OPENAI_API_KEY,
        dimensions: 1536,
      },
    };
    
    knowledgeService = new MedicalKnowledgeService(knowledgeConfig);
    await knowledgeService.initialize();
    
    searchService = new SemanticSearchService(knowledgeService, redis);
    symptomService = new SymptomAnalysisService(knowledgeService, searchService, redis);
    drugService = new DrugInteractionService(knowledgeService, searchService, redis);
    
    console.log('Knowledge API services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize knowledge services:', error);
    throw error;
  }
}

// Rate limiting
const searchRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many search requests, please try again later.',
});

const analysisRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 analysis requests per windowMs
  message: 'Too many analysis requests, please try again later.',
});

// Authentication middleware (placeholder)
const authenticate = (req: Request, res: Response, next: any) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  // In production, validate API key against database
  if (apiKey !== process.env.API_KEY && apiKey !== 'demo-key') {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
};

// Validation middleware
const handleValidationErrors = (req: Request, res: Response, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Error handling middleware
const handleErrors = (error: any, req: Request, res: Response, next: any) => {
  console.error('API Error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: 'Invalid request data', details: error.message });
  }
  
  if (error.name === 'ServiceUnavailableError') {
    return res.status(503).json({ error: 'Service temporarily unavailable' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
};

// Health check endpoint
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        redis: redis.isReady ? 'connected' : 'disconnected',
        knowledge: knowledgeService ? 'initialized' : 'not_initialized',
        search: searchService ? 'initialized' : 'not_initialized',
        symptom: symptomService ? 'initialized' : 'not_initialized',
        drug: drugService ? 'initialized' : 'not_initialized',
      },
      version: '1.0.0',
    };
    
    res.json(health);
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// Semantic Search Endpoints

/**
 * @route POST /api/knowledge/search
 * @desc Perform semantic search on medical knowledge
 * @access Private
 */
router.post('/search',
  searchRateLimit,
  authenticate,
  [
    body('text').notEmpty().withMessage('Search text is required'),
    body('language').optional().isIn(['en', 'bn']).withMessage('Language must be en or bn'),
    body('searchType').optional().isIn(['semantic', 'keyword', 'hybrid']).withMessage('Invalid search type'),
    body('category').optional().isArray().withMessage('Category must be an array'),
    body('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    body('threshold').optional().isFloat({ min: 0, max: 1 }).withMessage('Threshold must be between 0 and 1'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: any) => {
    try {
      const query: HybridSearchQuery = {
        text: req.body.text,
        language: req.body.language || 'en',
        searchType: req.body.searchType || 'hybrid',
        category: req.body.category,
        limit: req.body.limit || 10,
        threshold: req.body.threshold || 0.5,
        weights: req.body.weights,
        boost: req.body.boost,
        synonyms: req.body.synonyms,
        fuzzyMatch: req.body.fuzzyMatch,
      };
      
      const results = await searchService.hybridSearch(query);
      
      res.json({
        success: true,
        query: {
          text: query.text,
          language: query.language,
          searchType: query.searchType,
        },
        results: results.map(result => ({
          document: {
            id: result.document.id,
            title: result.document.title,
            content: result.document.content.substring(0, 500), // Truncate for API response
            category: result.document.category,
            language: result.document.language,
            metadata: result.document.metadata,
          },
          score: result.score,
          relevance: result.relevance,
          rankingFactors: result.rankingFactors,
        })),
        metadata: {
          totalResults: results.length,
          searchTime: Date.now(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/knowledge/suggestions
 * @desc Get search suggestions for autocomplete
 * @access Private
 */
router.get('/suggestions',
  searchRateLimit,
  authenticate,
  [
    query('q').notEmpty().withMessage('Query parameter q is required'),
    query('language').optional().isIn(['en', 'bn']).withMessage('Language must be en or bn'),
    query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: any) => {
    try {
      const partialQuery = req.query.q as string;
      const language = (req.query.language as 'en' | 'bn') || 'en';
      const limit = parseInt(req.query.limit as string) || 10;
      
      const suggestions = await searchService.getSearchSuggestions(partialQuery, language);
      
      res.json({
        success: true,
        query: partialQuery,
        suggestions: suggestions.slice(0, limit),
      });
    } catch (error) {
      next(error);
    }
  }
);

// Symptom Analysis Endpoints

/**
 * @route POST /api/knowledge/analyze-symptoms
 * @desc Analyze symptoms and provide diagnostic insights
 * @access Private
 */
router.post('/analyze-symptoms',
  analysisRateLimit,
  authenticate,
  [
    body('symptoms').isArray({ min: 1 }).withMessage('At least one symptom is required'),
    body('symptoms.*.name').notEmpty().withMessage('Symptom name is required'),
    body('symptoms.*.severity').optional().isIn(['mild', 'moderate', 'severe', 'critical']),
    body('symptoms.*.duration').optional().isString(),
    body('symptoms.*.frequency').optional().isIn(['rare', 'occasional', 'frequent', 'constant']),
    body('patientProfile.age').optional().isInt({ min: 0, max: 150 }),
    body('patientProfile.gender').optional().isIn(['male', 'female', 'other']),
    body('language').optional().isIn(['en', 'bn']),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: any) => {
    try {
      const symptoms: Symptom[] = req.body.symptoms.map((symptom: any, index: number) => ({
        id: `symptom_${index}`,
        name: symptom.name,
        description: symptom.description || '',
        severity: symptom.severity || 'moderate',
        duration: symptom.duration || 'unknown',
        frequency: symptom.frequency || 'occasional',
        location: symptom.location,
        triggers: symptom.triggers || [],
        relievingFactors: symptom.relievingFactors || [],
        associatedSymptoms: symptom.associatedSymptoms || [],
        language: req.body.language || 'en',
      }));
      
      const patientProfile: PatientProfile | undefined = req.body.patientProfile ? {
        age: req.body.patientProfile.age || 30,
        gender: req.body.patientProfile.gender || 'other',
        medicalHistory: req.body.patientProfile.medicalHistory || [],
        currentMedications: req.body.patientProfile.currentMedications || [],
        allergies: req.body.patientProfile.allergies || [],
        lifestyle: {
          smoking: req.body.patientProfile.lifestyle?.smoking || false,
          alcohol: req.body.patientProfile.lifestyle?.alcohol || false,
          exercise: req.body.patientProfile.lifestyle?.exercise || 'moderate',
          diet: req.body.patientProfile.lifestyle?.diet || 'balanced',
        },
        familyHistory: req.body.patientProfile.familyHistory || [],
        vitalSigns: req.body.patientProfile.vitalSigns,
      } : undefined;
      
      const language = (req.body.language as 'en' | 'bn') || 'en';
      
      const analysis = await symptomService.analyzeSymptoms(symptoms, patientProfile, language);
      
      res.json({
        success: true,
        analysis: {
          symptoms: analysis.symptoms,
          possibleConditions: analysis.possibleConditions,
          recommendations: analysis.recommendations,
          urgency: analysis.urgency,
          diagnosticConfidence: analysis.diagnosticConfidence,
          differentialDiagnosis: {
            primary: analysis.differentialDiagnosis.primary.map(condition => ({
              id: condition.id,
              name: condition.name,
              description: condition.description,
              category: condition.category,
              urgencyLevel: condition.urgencyLevel,
            })),
            secondary: analysis.differentialDiagnosis.secondary.map(condition => ({
              id: condition.id,
              name: condition.name,
              description: condition.description,
              category: condition.category,
              urgencyLevel: condition.urgencyLevel,
            })),
          },
          redFlags: analysis.redFlags,
          followUpRecommendations: analysis.followUpRecommendations,
          riskAssessment: analysis.riskAssessment,
          treatmentSuggestions: analysis.treatmentSuggestions,
        },
        metadata: {
          analysisTime: Date.now(),
          language,
          symptomsCount: symptoms.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Drug Interaction Endpoints

/**
 * @route POST /api/knowledge/check-drug-interactions
 * @desc Check for drug interactions and safety alerts
 * @access Private
 */
router.post('/check-drug-interactions',
  analysisRateLimit,
  authenticate,
  [
    body('drugs').isArray({ min: 1 }).withMessage('At least one drug is required'),
    body('drugs.*').isString().notEmpty().withMessage('Drug names must be non-empty strings'),
    body('patientProfile.age').optional().isInt({ min: 0, max: 150 }),
    body('patientProfile.weight').optional().isFloat({ min: 1, max: 500 }),
    body('patientProfile.kidneyFunction').optional().isIn(['normal', 'mild', 'moderate', 'severe']),
    body('patientProfile.liverFunction').optional().isIn(['normal', 'mild', 'moderate', 'severe']),
    body('includeFood').optional().isBoolean(),
    body('includeConditions').optional().isBoolean(),
    body('language').optional().isIn(['en', 'bn']),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: any) => {
    try {
      const request: InteractionCheckRequest = {
        drugs: req.body.drugs,
        patientProfile: req.body.patientProfile ? {
          age: req.body.patientProfile.age || 30,
          weight: req.body.patientProfile.weight,
          kidneyFunction: req.body.patientProfile.kidneyFunction || 'normal',
          liverFunction: req.body.patientProfile.liverFunction || 'normal',
          allergies: req.body.patientProfile.allergies || [],
          conditions: req.body.patientProfile.conditions || [],
        } : undefined,
        includeFood: req.body.includeFood || false,
        includeConditions: req.body.includeConditions || false,
        language: req.body.language || 'en',
      };
      
      const result = await drugService.checkInteractions(request);
      
      res.json({
        success: true,
        result: {
          interactions: result.interactions.map(interaction => ({
            id: interaction.id,
            drug1: interaction.drug1,
            drug2: interaction.drug2,
            severity: interaction.severity,
            description: interaction.description,
            mechanism: interaction.mechanism,
            onset: interaction.onset,
            probability: interaction.probability,
            clinicalSignificance: interaction.clinicalSignificance,
            managementStrategy: interaction.managementStrategy,
            monitoringParameters: interaction.monitoringParameters,
            recommendations: interaction.recommendations,
            patientEducation: interaction.patientEducation,
          })),
          alerts: result.alerts,
          recommendations: result.recommendations,
          riskScore: result.riskScore,
          safetyProfile: result.safetyProfile,
        },
        metadata: {
          checkTime: Date.now(),
          drugsCount: request.drugs.length,
          language: request.language,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/knowledge/drug-info/:drugName
 * @desc Get detailed information about a specific drug
 * @access Private
 */
router.get('/drug-info/:drugName',
  searchRateLimit,
  authenticate,
  [
    query('language').optional().isIn(['en', 'bn']).withMessage('Language must be en or bn'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: any) => {
    try {
      const drugName = req.params.drugName;
      const language = (req.query.language as 'en' | 'bn') || 'en';
      
      // Search for drug information
      const searchResults = await searchService.hybridSearch({
        text: `${drugName} drug information pharmacology`,
        language,
        searchType: 'hybrid',
        category: ['drug'],
        limit: 5,
        threshold: 0.6,
      });
      
      if (searchResults.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Drug information not found',
          drugName,
        });
      }
      
      const drugInfo = searchResults[0];
      
      res.json({
        success: true,
        drugName,
        information: {
          id: drugInfo.document.id,
          title: drugInfo.document.title,
          content: drugInfo.document.content,
          category: drugInfo.document.category,
          metadata: drugInfo.document.metadata,
          relevanceScore: drugInfo.relevance,
        },
        relatedDocuments: searchResults.slice(1).map(result => ({
          id: result.document.id,
          title: result.document.title,
          content: result.document.content.substring(0, 200),
          relevanceScore: result.relevance,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
);

// Analytics and Statistics Endpoints

/**
 * @route GET /api/knowledge/analytics
 * @desc Get search and analysis analytics
 * @access Private
 */
router.get('/analytics',
  authenticate,
  [
    query('timeRange').optional().isIn(['1h', '24h', '7d', '30d']).withMessage('Invalid time range'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: any) => {
    try {
      const timeRange = req.query.timeRange as string || '24h';
      
      // Calculate time range
      const now = new Date();
      let startTime: Date;
      
      switch (timeRange) {
        case '1h':
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }
      
      // Get analytics from search service
      const searchAnalytics = await searchService.getSearchAnalytics({
        start: startTime,
        end: now,
      });
      
      // Get knowledge service stats
      const knowledgeStats = await knowledgeService.getStats();
      
      res.json({
        success: true,
        timeRange,
        analytics: {
          search: {
            totalQueries: searchAnalytics.length,
            averageResultCount: searchAnalytics.reduce((sum, a) => sum + a.resultCount, 0) / searchAnalytics.length || 0,
            averageSearchTime: searchAnalytics.reduce((sum, a) => sum + a.searchTime, 0) / searchAnalytics.length || 0,
            languageDistribution: this.calculateLanguageDistribution(searchAnalytics),
            searchTypeDistribution: this.calculateSearchTypeDistribution(searchAnalytics),
          },
          knowledge: knowledgeStats,
        },
        generatedAt: now.toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/knowledge/feedback
 * @desc Submit feedback on search results or analysis
 * @access Private
 */
router.post('/feedback',
  authenticate,
  [
    body('type').isIn(['search', 'symptom_analysis', 'drug_interaction']).withMessage('Invalid feedback type'),
    body('queryId').optional().isString(),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString(),
    body('helpful').optional().isBoolean(),
  ],
  handleValidationErrors,
  async (req: Request, res: Response, next: any) => {
    try {
      const feedback = {
        id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: req.body.type,
        queryId: req.body.queryId,
        rating: req.body.rating,
        comment: req.body.comment,
        helpful: req.body.helpful,
        timestamp: new Date(),
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      };
      
      // Store feedback in Redis for later processing
      await redis.lPush('feedback_queue', JSON.stringify(feedback));
      
      res.json({
        success: true,
        message: 'Feedback submitted successfully',
        feedbackId: feedback.id,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Utility functions
function calculateLanguageDistribution(analytics: any[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  
  for (const item of analytics) {
    distribution[item.language] = (distribution[item.language] || 0) + 1;
  }
  
  return distribution;
}

function calculateSearchTypeDistribution(analytics: any[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  
  for (const item of analytics) {
    distribution[item.searchType] = (distribution[item.searchType] || 0) + 1;
  }
  
  return distribution;
}

// Error handling
router.use(handleErrors);

// Initialize services when module is loaded
initializeServices().catch(console.error);

export default router;
export { initializeServices };