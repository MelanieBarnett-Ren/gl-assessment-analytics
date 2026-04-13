/**
 * REST API endpoint definitions for Insights feature
 */

import { InsightPanel, Insight, ViewLevel } from '../models/insights';
import { CohortAssessment, Demographics } from '../models/assessment-data';

/**
 * GET /api/insights/:viewLevel/:cohortId/:assessmentId
 *
 * Retrieve AI-generated insights panel for a specific cohort
 *
 * Path Parameters:
 * - viewLevel: 'mat' | 'school' | 'student'
 * - cohortId: ID of the MAT, school, or class
 * - assessmentId: ID of the assessment
 *
 * Query Parameters:
 * - forceRefresh: boolean (bypass cache)
 * - maxInsights: number (default 5)
 *
 * Response: InsightPanel
 */
export interface GetInsightsPanelRequest {
  viewLevel: ViewLevel;
  cohortId: string;
  assessmentId: string;
  forceRefresh?: boolean;
  maxInsights?: number;
}

export interface GetInsightsPanelResponse {
  success: boolean;
  data: InsightPanel;
  cached: boolean;
  generatedAt: string;
  expiresAt: string;
}

/**
 * GET /api/insights/:insightId
 *
 * Retrieve detailed view of a specific insight
 *
 * Response: Detailed Insight with full evidence and recommendations
 */
export interface GetInsightDetailRequest {
  insightId: string;
}

export interface GetInsightDetailResponse {
  success: boolean;
  data: Insight;
}

/**
 * POST /api/insights/generate
 *
 * Manually trigger insight generation (admin/debug)
 *
 * Request Body: GetInsightsPanelRequest
 * Response: InsightPanel
 */
export interface GenerateInsightsRequest {
  viewLevel: ViewLevel;
  cohortId: string;
  assessmentId: string;
  options?: {
    includeMinorInsights?: boolean;
    focusAreas?: string[];       // Filter to specific domains
  };
}

export interface GenerateInsightsResponse {
  success: boolean;
  data: InsightPanel;
  processingTime: number;        // ms
  aiTokensUsed: number;
}

/**
 * GET /api/cohorts/:cohortId/similar
 *
 * Find similar cohorts for comparison
 *
 * Query Parameters:
 * - cohortType: 'school' | 'year_group' | 'class'
 * - maxResults: number (default 10)
 * - minSimilarity: number (0-1, default 0.7)
 */
export interface FindSimilarCohortsRequest {
  cohortId: string;
  cohortType: 'school' | 'year_group' | 'class';
  maxResults?: number;
  minSimilarity?: number;
}

export interface FindSimilarCohortsResponse {
  success: boolean;
  data: {
    targetCohort: {
      cohortId: string;
      demographics: Demographics;
    };
    similarCohorts: Array<{
      cohortId: string;
      cohortName: string;
      demographics: Demographics;
      similarityScore: number;
      performance?: CohortAssessment;
    }>;
  };
}

/**
 * GET /api/analysis/outliers/:cohortId/:assessmentId
 *
 * Get outlier analysis (skill-level gaps)
 *
 * Query Parameters:
 * - minEffectSize: number (default 0.5)
 * - skillLevel: boolean (true for skill-level, false for domain-level)
 */
export interface GetOutliersRequest {
  cohortId: string;
  assessmentId: string;
  minEffectSize?: number;
  skillLevel?: boolean;
}

export interface OutlierResult {
  skill: string;
  contentDomain: string;
  currentScore: number;
  expectedScore: number;
  gap: number;
  effectSize: number;
  zScore: number;
  severity: 'critical' | 'high' | 'moderate' | 'low';
}

export interface GetOutliersResponse {
  success: boolean;
  data: {
    cohortId: string;
    assessmentId: string;
    outliers: OutlierResult[];
    summary: {
      totalSkillsAnalyzed: number;
      significantGaps: number;
      criticalGaps: number;
    };
  };
}

/**
 * GET /api/analysis/misconceptions/:cohortId/:assessmentId
 *
 * Analyze error patterns to identify misconceptions
 *
 * Query Parameters:
 * - skills: string[] (optional, filter to specific skills)
 * - minAffectedPercentage: number (default 20)
 */
export interface GetMisconceptionsRequest {
  cohortId: string;
  assessmentId: string;
  skills?: string[];
  minAffectedPercentage?: number;
}

export interface GetMisconceptionsResponse {
  success: boolean;
  data: {
    misconceptions: Array<{
      skill: string;
      misconceptionType: string;
      description: string;
      affectedStudents: number;
      affectedPercentage: number;
      exampleErrors: string[];
      suggestedRemediation: string;
    }>;
  };
}

/**
 * POST /api/cache/clear
 *
 * Clear cached insights (admin only)
 */
export interface ClearCacheRequest {
  cohortId?: string;             // Optional: clear specific cohort
  viewLevel?: ViewLevel;         // Optional: clear specific view level
}

export interface ClearCacheResponse {
  success: boolean;
  itemsCleared: number;
}

// Error responses
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Common error codes
export enum ErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',
  CACHE_ERROR = 'CACHE_ERROR',
}
