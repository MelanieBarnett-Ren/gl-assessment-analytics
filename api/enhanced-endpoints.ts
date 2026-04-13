/**
 * Enhanced API Endpoints - New Features
 * Misconception detection, prerequisite analysis, trends, focus groups
 */

import { FocusGroup, FocusGroupProgress } from '../engine/focus-group-identifier';
import { PrerequisiteAnalysis } from '../engine/prerequisite-analyzer';
import { MisconceptionAnalysis } from '../engine/misconception-detector';
import { CohortTrendReport, SkillTrend } from '../engine/trend-analyzer';

// ============================================================================
// MISCONCEPTION DETECTION
// ============================================================================

/**
 * GET /api/analysis/misconceptions/:cohortId/:assessmentId
 * Analyze error patterns to identify common misconceptions
 */
export interface GetMisconceptionsRequest {
  cohortId: string;
  assessmentId: string;
  skills?: string[];              // Filter to specific skills
  minAffectedPercentage?: number; // Default 20
}

export interface GetMisconceptionsResponse {
  success: boolean;
  data: {
    misconceptions: MisconceptionAnalysis[];
    summary: {
      totalMisconceptions: number;
      studentsAffected: number;
      topMisconception: string;
    };
    interventionPriorities: string[];
  };
}

// ============================================================================
// PREREQUISITE CHAIN ANALYSIS
// ============================================================================

/**
 * GET /api/analysis/prerequisites/:cohortId/:assessmentId
 * Identify foundation skill gaps from earlier years
 */
export interface GetPrerequisitesRequest {
  cohortId: string;
  assessmentId: string;
  yearGroup: number;
  includeHistorical?: boolean;  // Include historical assessment data
}

export interface GetPrerequisitesResponse {
  success: boolean;
  data: {
    analysis: PrerequisiteAnalysis;
    visualLadders: Array<{
      skill: string;
      ladder: string[];  // ASCII art skill progression
    }>;
  };
}

// ============================================================================
// TREND ANALYSIS
// ============================================================================

/**
 * GET /api/trends/:cohortId
 * Get historical performance trends
 */
export interface GetTrendsRequest {
  cohortId: string;
  startDate?: string;  // ISO date
  endDate?: string;    // ISO date
  skills?: string[];   // Filter to specific skills
}

export interface GetTrendsResponse {
  success: boolean;
  data: {
    report: CohortTrendReport;
    charts: Array<{
      skill: string;
      asciiChart: string[];
    }>;
    projections: Array<{
      skill: string;
      currentScore: number;
      projectedIn3Months: number;
      daysToTarget?: number;
    }>;
  };
}

/**
 * GET /api/trends/:cohortId/intervention-impact
 * Measure impact of interventions
 */
export interface GetInterventionImpactRequest {
  cohortId: string;
  interventionDate: string;  // ISO date
  skillsTargeted: string[];
}

export interface GetInterventionImpactResponse {
  success: boolean;
  data: {
    skillsImproved: string[];
    skillsNotImproved: string[];
    averageImpact: number;
    effectSize: number;
    verdict: 'highly_effective' | 'effective' | 'minimal_impact' | 'no_impact';
  };
}

// ============================================================================
// FOCUS GROUPS (Student/Class View)
// ============================================================================

/**
 * GET /api/focus-groups/:classId/:assessmentId
 * Identify focus groups for targeted intervention
 */
export interface GetFocusGroupsRequest {
  classId: string;
  assessmentId: string;
  includePriorAttainment?: boolean;
}

export interface GetFocusGroupsResponse {
  success: boolean;
  data: {
    classId: string;
    totalStudents: number;
    groups: FocusGroup[];
    ungroupedStudents: string[];
    recommendations: string[];
    timetableSuggestion?: {
      schedule: Array<{
        day: string;
        teacherFocus: string;
        taSupport?: string;
        independent: string[];
      }>;
      notes: string[];
    };
  };
}

/**
 * GET /api/focus-groups/:groupId/progress
 * Track progress of a specific focus group
 */
export interface GetFocusGroupProgressRequest {
  groupId: string;
  targetScore?: number;  // Default 75
}

export interface GetFocusGroupProgressResponse {
  success: boolean;
  data: FocusGroupProgress & {
    recommendations: string[];
    visualization: string[];  // ASCII progress chart
  };
}

// ============================================================================
// ENHANCED INSIGHT GENERATION (WITH NEW FEATURES)
// ============================================================================

/**
 * POST /api/insights/generate-enhanced
 * Generate insights with full feature set:
 * - Misconception detection
 * - Prerequisite analysis
 * - Trend analysis
 * - Focus group recommendations
 */
export interface GenerateEnhancedInsightsRequest {
  viewLevel: 'mat' | 'school' | 'student';
  cohortId: string;
  assessmentId: string;
  options?: {
    includeMisconceptions?: boolean;
    includePrerequisites?: boolean;
    includeTrends?: boolean;
    includeFocusGroups?: boolean;  // Only for student view
    historicalMonths?: number;     // How many months of history to analyze
  };
}

export interface GenerateEnhancedInsightsResponse {
  success: boolean;
  data: {
    // Standard insights
    insights: any[];  // From original InsightPanel

    // New enhanced features
    misconceptions?: MisconceptionAnalysis[];
    prerequisiteGaps?: PrerequisiteAnalysis;
    trends?: CohortTrendReport;
    focusGroups?: FocusGroup[];

    // Meta
    generatedAt: string;
    processingTime: number;
    featuresIncluded: string[];
  };
}

// ============================================================================
// COMPARISON & BENCHMARKING
// ============================================================================

/**
 * GET /api/benchmarks/:cohortId
 * Get benchmark data and see where cohort stands
 */
export interface GetBenchmarksRequest {
  cohortId: string;
  assessmentId: string;
  comparisonType: 'national' | 'mat' | 'similar_demographics';
}

export interface GetBenchmarksResponse {
  success: boolean;
  data: {
    cohort: {
      cohortId: string;
      avgSAS: number;
      percentile: number;  // Where they sit (0-100)
    };
    benchmark: {
      type: string;
      avgSAS: number;
      distribution: Array<{ range: string; percentage: number }>;
    };
    gap: {
      points: number;
      percentagePoints: number;
      direction: 'above' | 'below' | 'at';
    };
    skillComparison: Array<{
      skill: string;
      cohortScore: number;
      benchmarkScore: number;
      gap: number;
    }>;
  };
}

// ============================================================================
// EXPORT & REPORTING
// ============================================================================

/**
 * POST /api/reports/generate
 * Generate exportable report (PDF/Excel/JSON)
 */
export interface GenerateReportRequest {
  cohortId: string;
  assessmentId: string;
  format: 'pdf' | 'excel' | 'json' | 'markdown';
  sections: Array<'insights' | 'trends' | 'misconceptions' | 'prerequisites' | 'focus_groups' | 'benchmarks'>;
  includeStudentData?: boolean;  // Include individual student details
}

export interface GenerateReportResponse {
  success: boolean;
  data: {
    reportId: string;
    downloadUrl: string;
    expiresAt: string;
  };
}

// ============================================================================
// ACTION TRACKING
// ============================================================================

/**
 * POST /api/actions/create
 * Create an action from an insight recommendation
 */
export interface CreateActionRequest {
  insightId: string;
  recommendationId: string;
  actionType: 'investigate' | 'create_plan' | 'contact_peer' | 'focus_group' | 'intervention';
  assignedTo?: string;
  dueDate?: string;
  targetMetric?: {
    metric: string;
    currentValue: number;
    targetValue: number;
  };
}

export interface CreateActionResponse {
  success: boolean;
  data: {
    actionId: string;
    status: 'pending' | 'in_progress' | 'completed';
    createdAt: string;
  };
}

/**
 * GET /api/actions/:cohortId
 * Get all actions for a cohort
 */
export interface GetActionsRequest {
  cohortId: string;
  status?: 'pending' | 'in_progress' | 'completed';
}

export interface GetActionsResponse {
  success: boolean;
  data: {
    actions: Array<{
      actionId: string;
      insightTitle: string;
      recommendationTitle: string;
      actionType: string;
      status: string;
      assignedTo?: string;
      dueDate?: string;
      createdAt: string;
      completedAt?: string;
    }>;
  };
}
