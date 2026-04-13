/**
 * Data models for AI-generated insights and recommendations
 */

export type InsightSeverity = 'critical' | 'attention' | 'positive' | 'neutral';
export type InsightType = 'outlier' | 'trend' | 'skill_gap' | 'misconception' | 'peer_learning';
export type ViewLevel = 'mat' | 'school' | 'student';

export interface Insight {
  insightId: string;
  viewLevel: ViewLevel;
  cohortId: string;              // MAT, school, or class ID
  assessmentId: string;

  severity: InsightSeverity;
  type: InsightType;
  priority: number;              // 1-5, for ranking

  // Core insight content
  title: string;                 // e.g., "Year 9 Maths: -15% vs. similar schools"
  summary: string;               // One-sentence headline
  detailedAnalysis: string;      // Full explanation with context

  // Data backing the insight
  evidence: InsightEvidence;

  // Recommendations
  recommendations: Recommendation[];

  // Generated timestamp
  generatedAt: Date;
  expiresAt: Date;               // For caching
}

export interface InsightEvidence {
  // Performance metrics
  currentPerformance: number;    // Percentage or SAS
  comparisonPerformance: number; // Average of similar cohorts
  gap: number;                   // Difference (+ or -)
  gapPercentage: number;         // Relative difference

  // Statistical significance
  effectSize?: number;           // Cohen's d
  zScore?: number;
  isSignificant: boolean;

  // Skill-level breakdown
  skillBreakdown?: SkillGapDetail[];

  // Historical context
  trend?: {
    direction: 'improving' | 'stable' | 'declining';
    previousGap: number;
    changeRate: number;          // Percentage change
  };

  // Similar cohorts used for comparison
  comparisonCohorts: ComparisonCohort[];
}

export interface SkillGapDetail {
  skill: string;
  contentDomain: string;
  currentScore: number;
  comparisonScore: number;
  gap: number;
  impactLevel: 'high' | 'medium' | 'low';

  // Misconception analysis
  commonErrors?: string[];
  errorPatterns?: string[];

  // Prerequisites
  prerequisiteIssues?: {
    skill: string;
    score: number;
    expectedScore: number;
  }[];
}

export interface ComparisonCohort {
  cohortId: string;
  cohortName: string;
  cohortType: string;

  // Demographic similarity
  demographics: {
    fsmPercentage: number;
    ealPercentage: number;
    sendPercentage: number;
  };
  similarityScore: number;       // 0-1, how similar to target

  // Performance
  performance: number;
  gap: number;                   // vs. target cohort
}

export interface Recommendation {
  recommendationId: string;
  title: string;
  description: string;
  rationale: string;             // Why this recommendation

  // Action type
  actionType: 'investigate' | 'create_plan' | 'contact_peer' | 'focus_group' | 'intervention';

  // Specific targets
  targetMetric?: {
    metric: string;              // e.g., "Fractions domain score"
    currentValue: number;
    targetValue: number;
    timeframe: string;           // e.g., "by next assessment"
  };

  // Peer learning opportunity
  peerExample?: {
    cohortId: string;
    cohortName: string;
    strategy: string;            // What they're doing that works
    evidenceOfSuccess: string;   // Their results
    contactInfo?: string;
  };

  // Dashboard integration
  dashboardActions?: DashboardAction[];

  priority: number;              // 1-5
}

export interface DashboardAction {
  label: string;                 // Button text
  actionType: string;            // e.g., "navigate", "create_report", "export"
  targetUrl?: string;
  parameters?: Record<string, any>;
}

export interface InsightPanel {
  panelId: string;
  viewLevel: ViewLevel;
  cohortId: string;
  assessmentId: string;

  // Top insights (3-5)
  insights: Insight[];

  // Summary stats
  summary: {
    totalComparisons: number;
    significantGaps: number;
    peerLearningOpportunities: number;
  };

  generatedAt: Date;
  expiresAt: Date;
}

export interface MisconductionPattern {
  skill: string;
  contentDomain: string;

  // Pattern description
  misconceptionType: string;     // e.g., "treating_denominators_separately"
  description: string;           // Human-readable explanation

  // Evidence
  affectedStudents: number;
  affectedPercentage: number;
  exampleErrors: string[];

  // Impact
  scoreImpact: number;           // How many points lost due to this

  // Remediation
  suggestedApproach: string;
}
