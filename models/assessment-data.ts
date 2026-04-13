/**
 * Core data models for assessment data and student information
 */

export interface AssessmentItem {
  itemId: string;
  questionText: string;
  contentDomain: string;        // e.g., "Fractions", "Number Operations"
  skillTags: string[];           // e.g., ["converting", "fractions_to_decimals"]
  questionType: string;          // e.g., "multiple_choice", "short_answer"
  difficultyLevel: number;       // 1-5
  maxScore: number;
  prerequisiteSkills?: string[]; // Skills needed before this one
}

export interface StudentResponse {
  studentId: string;
  itemId: string;
  score: number;
  maxScore: number;
  responseText?: string;         // For error pattern analysis
  isCorrect: boolean;
  timestamp: Date;
}

export interface AssessmentOverall {
  assessmentId: string;
  assessmentName: string;
  assessmentDate: Date;
  yearGroup: number;
  subject: string;               // e.g., "Maths", "Reading"
  assessmentType: string;        // e.g., "Termly", "Baseline"
}

export interface StudentAssessment {
  studentId: string;
  assessmentId: string;
  schoolId: string;
  yearGroup: number;
  classId: string;

  // Overall scores
  rawScore: number;
  maxScore: number;
  percentageScore: number;
  sas: number;                   // Standard Age Score
  stanine: number;               // 1-9
  progressMeasure?: number;

  // Item-level data
  responses: StudentResponse[];

  // Metadata
  completedAt: Date;
}

export interface SkillDomainScore {
  domain: string;
  score: number;                 // Percentage
  itemsAttempted: number;
  itemsCorrect: number;
  skillBreakdown: {
    skill: string;
    score: number;
  }[];
}

export interface CohortAssessment {
  cohortId: string;
  cohortType: 'school' | 'year_group' | 'class' | 'mat';
  assessmentId: string;

  // Aggregated scores
  avgSAS: number;
  avgStanine: number;
  avgPercentage: number;
  avgProgressMeasure?: number;

  // Skill domain aggregations
  skillDomainScores: SkillDomainScore[];

  // Distribution
  studentCount: number;
  scoreTrend?: 'improving' | 'stable' | 'declining';
}

export interface Demographics {
  cohortId: string;
  cohortType: 'school' | 'year_group' | 'class' | 'mat';

  fsmPercentage: number;         // Free School Meals
  ealPercentage: number;         // English as Additional Language
  sendPercentage: number;        // Special Educational Needs

  priorAttainment?: {
    low: number;                 // Percentage in each band
    middle: number;
    high: number;
  };

  studentCount: number;
}

export interface HistoricalTrend {
  cohortId: string;
  assessmentId: string;
  date: Date;
  avgSAS: number;
  avgPercentage: number;
  skillDomainScores: SkillDomainScore[];
}
