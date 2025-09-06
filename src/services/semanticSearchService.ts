import { MedicalKnowledgeService, SearchQuery, SearchResult, MedicalDocument } from './medicalKnowledgeService';
import { RedisClientType } from 'redis';
import { createHash } from 'crypto';

// Enhanced Search Interfaces
export interface HybridSearchQuery extends SearchQuery {
  searchType: 'semantic' | 'keyword' | 'hybrid';
  weights?: {
    semantic: number;
    keyword: number;
    metadata: number;
  };
  boost?: {
    recency: number;
    reliability: number;
    category: number;
  };
  synonyms?: boolean;
  fuzzyMatch?: boolean;
  contextWindow?: number;
}

export interface SearchAnalytics {
  query: string;
  resultCount: number;
  searchTime: number;
  searchType: string;
  language: string;
  timestamp: Date;
  userId?: string;
  clickedResults?: string[];
}

export interface BengaliLanguageConfig {
  stemmer: boolean;
  stopWords: string[];
  synonyms: Map<string, string[]>;
  transliteration: boolean;
  phoneticMatching: boolean;
}

export interface SearchSuggestion {
  text: string;
  type: 'completion' | 'correction' | 'synonym';
  confidence: number;
  category?: string;
}

export interface RankedResult extends SearchResult {
  rankingFactors: {
    semanticScore: number;
    keywordScore: number;
    metadataScore: number;
    recencyScore: number;
    reliabilityScore: number;
    finalScore: number;
  };
  explanation?: string;
}

export class SemanticSearchService {
  private knowledgeService: MedicalKnowledgeService;
  private redis: RedisClientType;
  private bengaliConfig: BengaliLanguageConfig;
  private searchAnalytics: SearchAnalytics[] = [];
  private queryCache = new Map<string, RankedResult[]>();
  private suggestionCache = new Map<string, SearchSuggestion[]>();

  constructor(
    knowledgeService: MedicalKnowledgeService,
    redis: RedisClientType,
    bengaliConfig?: Partial<BengaliLanguageConfig>
  ) {
    this.knowledgeService = knowledgeService;
    this.redis = redis;
    this.bengaliConfig = {
      stemmer: true,
      stopWords: this.getDefaultBengaliStopWords(),
      synonyms: this.getDefaultBengaliSynonyms(),
      transliteration: true,
      phoneticMatching: true,
      ...bengaliConfig,
    };
  }

  async hybridSearch(query: HybridSearchQuery): Promise<RankedResult[]> {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cacheKey = this.generateSearchCacheKey(query);
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        const results = JSON.parse(cached) as RankedResult[];
        this.recordAnalytics(query, results, Date.now() - startTime);
        return results;
      }

      // Preprocess query based on language
      const processedQuery = await this.preprocessQuery(query);
      
      let results: RankedResult[] = [];

      switch (query.searchType) {
        case 'semantic':
          results = await this.performSemanticSearch(processedQuery);
          break;
        case 'keyword':
          results = await this.performKeywordSearch(processedQuery);
          break;
        case 'hybrid':
        default:
          results = await this.performHybridSearch(processedQuery);
          break;
      }

      // Apply ranking and filtering
      results = await this.rankAndFilterResults(results, query);

      // Cache results
      await this.redis.setEx(cacheKey, 300, JSON.stringify(results)); // 5 minutes cache

      // Record analytics
      this.recordAnalytics(query, results, Date.now() - startTime);

      return results;
    } catch (error) {
      console.error('Hybrid search failed:', error);
      throw error;
    }
  }

  private async preprocessQuery(query: HybridSearchQuery): Promise<HybridSearchQuery> {
    let processedText = query.text;

    if (query.language === 'bn') {
      // Bengali text preprocessing
      processedText = await this.preprocessBengaliText(processedText);
    } else {
      // English text preprocessing
      processedText = await this.preprocessEnglishText(processedText);
    }

    return {
      ...query,
      text: processedText,
    };
  }

  private async preprocessBengaliText(text: string): Promise<string> {
    let processed = text;

    // Remove Bengali stop words
    if (this.bengaliConfig.stopWords.length > 0) {
      const words = processed.split(/\s+/);
      const filteredWords = words.filter(word => 
        !this.bengaliConfig.stopWords.includes(word.toLowerCase())
      );
      processed = filteredWords.join(' ');
    }

    // Apply Bengali stemming (simplified)
    if (this.bengaliConfig.stemmer) {
      processed = this.appleBengaliStemming(processed);
    }

    // Handle transliteration if enabled
    if (this.bengaliConfig.transliteration) {
      processed = await this.handleTransliteration(processed);
    }

    return processed;
  }

  private async preprocessEnglishText(text: string): Promise<string> {
    let processed = text.toLowerCase();

    // Remove common English stop words
    const englishStopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = processed.split(/\s+/);
    const filteredWords = words.filter(word => !englishStopWords.includes(word));
    processed = filteredWords.join(' ');

    // Apply basic stemming
    processed = this.applyEnglishStemming(processed);

    return processed;
  }

  private async performSemanticSearch(query: HybridSearchQuery): Promise<RankedResult[]> {
    // Use the knowledge service for semantic search
    const searchResults = await this.knowledgeService.search({
      text: query.text,
      language: query.language,
      category: query.category,
      limit: query.limit || 20,
      threshold: query.threshold || 0.5,
    });

    return searchResults.map(result => this.convertToRankedResult(result, 'semantic'));
  }

  private async performKeywordSearch(query: HybridSearchQuery): Promise<RankedResult[]> {
    // Implement keyword-based search
    const keywords = query.text.split(/\s+/);
    const results: RankedResult[] = [];

    // This is a simplified keyword search - in practice, you'd use a proper text search engine
    const searchResults = await this.knowledgeService.search({
      text: query.text,
      language: query.language,
      category: query.category,
      limit: query.limit || 20,
      threshold: 0.3, // Lower threshold for keyword search
    });

    for (const result of searchResults) {
      const keywordScore = this.calculateKeywordScore(result.document, keywords);
      const rankedResult = this.convertToRankedResult(result, 'keyword');
      rankedResult.rankingFactors.keywordScore = keywordScore;
      rankedResult.rankingFactors.finalScore = keywordScore;
      results.push(rankedResult);
    }

    return results.sort((a, b) => b.rankingFactors.finalScore - a.rankingFactors.finalScore);
  }

  private async performHybridSearch(query: HybridSearchQuery): Promise<RankedResult[]> {
    // Combine semantic and keyword search results
    const [semanticResults, keywordResults] = await Promise.all([
      this.performSemanticSearch({ ...query, searchType: 'semantic' }),
      this.performKeywordSearch({ ...query, searchType: 'keyword' }),
    ]);

    // Merge and deduplicate results
    const mergedResults = new Map<string, RankedResult>();
    
    // Add semantic results
    for (const result of semanticResults) {
      mergedResults.set(result.document.id, result);
    }

    // Merge keyword results
    for (const keywordResult of keywordResults) {
      const existing = mergedResults.get(keywordResult.document.id);
      if (existing) {
        // Combine scores
        existing.rankingFactors.keywordScore = keywordResult.rankingFactors.keywordScore;
        existing.rankingFactors.finalScore = this.calculateHybridScore(existing, query.weights);
      } else {
        mergedResults.set(keywordResult.document.id, keywordResult);
      }
    }

    return Array.from(mergedResults.values());
  }

  private async rankAndFilterResults(results: RankedResult[], query: HybridSearchQuery): Promise<RankedResult[]> {
    // Apply additional ranking factors
    for (const result of results) {
      // Calculate recency score
      result.rankingFactors.recencyScore = this.calculateRecencyScore(result.document);
      
      // Calculate reliability score
      result.rankingFactors.reliabilityScore = result.document.metadata.reliability;
      
      // Calculate metadata score
      result.rankingFactors.metadataScore = this.calculateMetadataScore(result.document, query);
      
      // Calculate final score with boosts
      result.rankingFactors.finalScore = this.calculateFinalScore(result, query.boost);
    }

    // Sort by final score
    results.sort((a, b) => b.rankingFactors.finalScore - a.rankingFactors.finalScore);

    // Apply limit
    return results.slice(0, query.limit || 10);
  }

  private convertToRankedResult(result: SearchResult, searchType: string): RankedResult {
    return {
      ...result,
      rankingFactors: {
        semanticScore: searchType === 'semantic' ? result.relevance : 0,
        keywordScore: searchType === 'keyword' ? result.relevance : 0,
        metadataScore: 0,
        recencyScore: 0,
        reliabilityScore: 0,
        finalScore: result.relevance,
      },
    };
  }

  private calculateKeywordScore(document: MedicalDocument, keywords: string[]): number {
    const text = (document.title + ' ' + document.content).toLowerCase();
    let score = 0;
    let totalKeywords = keywords.length;

    for (const keyword of keywords) {
      const regex = new RegExp(keyword.toLowerCase(), 'gi');
      const matches = text.match(regex);
      if (matches) {
        score += matches.length / text.length * 1000; // Normalize by text length
      }
    }

    return Math.min(score / totalKeywords, 1); // Normalize to 0-1
  }

  private calculateHybridScore(result: RankedResult, weights?: HybridSearchQuery['weights']): number {
    const defaultWeights = { semantic: 0.6, keyword: 0.3, metadata: 0.1 };
    const w = weights || defaultWeights;

    return (
      result.rankingFactors.semanticScore * w.semantic +
      result.rankingFactors.keywordScore * w.keyword +
      result.rankingFactors.metadataScore * w.metadata
    );
  }

  private calculateRecencyScore(document: MedicalDocument): number {
    if (!document.metadata.publishedDate) return 0.5; // Default score for unknown dates

    const now = new Date();
    const publishedDate = new Date(document.metadata.publishedDate);
    const daysDiff = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);

    // Exponential decay: newer documents get higher scores
    return Math.exp(-daysDiff / 365); // Half-life of 1 year
  }

  private calculateMetadataScore(document: MedicalDocument, query: HybridSearchQuery): number {
    let score = 0;

    // Category match bonus
    if (query.category && query.category.includes(document.category)) {
      score += 0.3;
    }

    // Language match bonus
    if (document.language === query.language) {
      score += 0.2;
    }

    // Tag relevance
    if (document.metadata.tags.length > 0) {
      const queryWords = query.text.toLowerCase().split(/\s+/);
      const tagMatches = document.metadata.tags.filter(tag => 
        queryWords.some(word => tag.toLowerCase().includes(word))
      );
      score += (tagMatches.length / document.metadata.tags.length) * 0.3;
    }

    // Source reliability
    score += document.metadata.reliability * 0.2;

    return Math.min(score, 1);
  }

  private calculateFinalScore(result: RankedResult, boost?: HybridSearchQuery['boost']): number {
    const defaultBoost = { recency: 0.1, reliability: 0.2, category: 0.1 };
    const b = boost || defaultBoost;

    let finalScore = result.rankingFactors.semanticScore * 0.4 + 
                    result.rankingFactors.keywordScore * 0.3 + 
                    result.rankingFactors.metadataScore * 0.3;

    // Apply boosts
    finalScore += result.rankingFactors.recencyScore * b.recency;
    finalScore += result.rankingFactors.reliabilityScore * b.reliability;
    finalScore += result.rankingFactors.metadataScore * b.category;

    return Math.min(finalScore, 1);
  }

  async getSearchSuggestions(partialQuery: string, language: 'en' | 'bn' = 'en'): Promise<SearchSuggestion[]> {
    const cacheKey = `suggestions:${language}:${createHash('md5').update(partialQuery).digest('hex')}`;
    
    // Check cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const suggestions: SearchSuggestion[] = [];

    // Auto-completion suggestions
    const completions = await this.generateCompletions(partialQuery, language);
    suggestions.push(...completions);

    // Spelling corrections
    const corrections = await this.generateCorrections(partialQuery, language);
    suggestions.push(...corrections);

    // Synonym suggestions
    if (language === 'bn' && this.bengaliConfig.synonyms.has(partialQuery)) {
      const synonyms = this.bengaliConfig.synonyms.get(partialQuery) || [];
      for (const synonym of synonyms) {
        suggestions.push({
          text: synonym,
          type: 'synonym',
          confidence: 0.8,
        });
      }
    }

    // Cache suggestions
    await this.redis.setEx(cacheKey, 3600, JSON.stringify(suggestions)); // 1 hour cache

    return suggestions.slice(0, 10); // Limit to 10 suggestions
  }

  private async generateCompletions(partialQuery: string, language: 'en' | 'bn'): Promise<SearchSuggestion[]> {
    // This is a simplified implementation
    // In practice, you'd use a proper auto-completion service or trie data structure
    const commonMedicalTerms = language === 'bn' ? 
      ['জ্বর', 'মাথাব্যথা', 'কাশি', 'পেটব্যথা', 'বমি'] :
      ['fever', 'headache', 'cough', 'stomach pain', 'nausea'];

    return commonMedicalTerms
      .filter(term => term.toLowerCase().startsWith(partialQuery.toLowerCase()))
      .map(term => ({
        text: term,
        type: 'completion' as const,
        confidence: 0.9,
        category: 'symptom',
      }));
  }

  private async generateCorrections(query: string, language: 'en' | 'bn'): Promise<SearchSuggestion[]> {
    // Simplified spell checking - in practice, use a proper spell checker
    const corrections: SearchSuggestion[] = [];
    
    // Basic Levenshtein distance-based corrections
    const commonTerms = language === 'bn' ? 
      ['জ্বর', 'মাথাব্যথা', 'কাশি'] :
      ['fever', 'headache', 'cough'];

    for (const term of commonTerms) {
      const distance = this.levenshteinDistance(query.toLowerCase(), term.toLowerCase());
      if (distance <= 2 && distance > 0) {
        corrections.push({
          text: term,
          type: 'correction',
          confidence: 1 - (distance / Math.max(query.length, term.length)),
        });
      }
    }

    return corrections;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private appleBengaliStemming(text: string): string {
    // Simplified Bengali stemming - remove common suffixes
    const suffixes = ['গুলো', 'গুলি', 'দের', 'রা', 'েদর', 'ের', 'ে', 'তে', 'য়', 'ি'];
    
    let stemmed = text;
    for (const suffix of suffixes) {
      if (stemmed.endsWith(suffix)) {
        stemmed = stemmed.slice(0, -suffix.length);
        break;
      }
    }
    
    return stemmed;
  }

  private applyEnglishStemming(text: string): string {
    // Simplified English stemming - remove common suffixes
    const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 's'];
    
    return text.split(' ').map(word => {
      for (const suffix of suffixes) {
        if (word.endsWith(suffix) && word.length > suffix.length + 2) {
          return word.slice(0, -suffix.length);
        }
      }
      return word;
    }).join(' ');
  }

  private async handleTransliteration(text: string): Promise<string> {
    // Simplified transliteration handling
    // In practice, use a proper transliteration library
    const transliterationMap: Record<string, string> = {
      'jor': 'জ্বর',
      'mathabytha': 'মাথাব্যথা',
      'kashi': 'কাশি',
      // Add more mappings as needed
    };

    let transliterated = text;
    for (const [roman, bengali] of Object.entries(transliterationMap)) {
      transliterated = transliterated.replace(new RegExp(roman, 'gi'), bengali);
    }

    return transliterated;
  }

  private getDefaultBengaliStopWords(): string[] {
    return [
      'এবং', 'বা', 'কিন্তু', 'তবে', 'যদি', 'তাহলে', 'কারণ', 'যেহেতু',
      'এর', 'এই', 'সেই', 'ওই', 'যে', 'যা', 'কি', 'কে', 'কাকে',
      'আমি', 'তুমি', 'সে', 'আমরা', 'তোমরা', 'তারা', 'আমার', 'তোমার', 'তার'
    ];
  }

  private getDefaultBengaliSynonyms(): Map<string, string[]> {
    const synonyms = new Map<string, string[]>();
    
    synonyms.set('জ্বর', ['তাপমাত্রা', 'গরম', 'উত্তাপ']);
    synonyms.set('মাথাব্যথা', ['মাথা ধরা', 'মাথার যন্ত্রণা', 'শিরঃপীড়া']);
    synonyms.set('কাশি', ['খুসখুসানি', 'কফ']);
    synonyms.set('পেটব্যথা', ['পেট ধরা', 'উদরশূল', 'পেটের যন্ত্রণা']);
    
    return synonyms;
  }

  private generateSearchCacheKey(query: HybridSearchQuery): string {
    const keyData = {
      text: query.text,
      language: query.language,
      searchType: query.searchType,
      category: query.category,
      limit: query.limit,
      threshold: query.threshold,
    };
    
    return `search:${createHash('md5').update(JSON.stringify(keyData)).digest('hex')}`;
  }

  private recordAnalytics(query: HybridSearchQuery, results: RankedResult[], searchTime: number): void {
    const analytics: SearchAnalytics = {
      query: query.text,
      resultCount: results.length,
      searchTime,
      searchType: query.searchType,
      language: query.language,
      timestamp: new Date(),
    };

    this.searchAnalytics.push(analytics);
    
    // Keep only last 1000 analytics entries
    if (this.searchAnalytics.length > 1000) {
      this.searchAnalytics = this.searchAnalytics.slice(-1000);
    }
  }

  async getSearchAnalytics(timeRange?: { start: Date; end: Date }): Promise<SearchAnalytics[]> {
    let analytics = this.searchAnalytics;
    
    if (timeRange) {
      analytics = analytics.filter(a => 
        a.timestamp >= timeRange.start && a.timestamp <= timeRange.end
      );
    }
    
    return analytics;
  }

  async clearCache(): Promise<void> {
    this.queryCache.clear();
    this.suggestionCache.clear();
    
    // Clear Redis cache with pattern
    const keys = await this.redis.keys('search:*');
    if (keys.length > 0) {
      await this.redis.del(keys);
    }
  }
}