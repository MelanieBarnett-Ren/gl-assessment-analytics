/**
 * Statistical outlier detection for identifying performance gaps
 */

import { SkillDomainScore } from '../models/assessment-data';

export interface OutlierConfig {
  minEffectSize: number;        // Minimum Cohen's d (default: 0.5 = medium)
  minZScore: number;             // Minimum z-score (default: 1.5)
  significanceLevel: number;     // Alpha level (default: 0.05)
}

export const DEFAULT_OUTLIER_CONFIG: OutlierConfig = {
  minEffectSize: 0.5,   // Medium effect size
  minZScore: 1.5,       // ~93rd percentile
  significanceLevel: 0.05,
};

export type OutlierSeverity = 'critical' | 'high' | 'moderate' | 'low';

export interface OutlierResult {
  skill: string;
  contentDomain: string;

  // Performance metrics
  currentScore: number;
  expectedScore: number;        // Mean of comparison cohorts
  gap: number;                  // currentScore - expectedScore
  gapPercentage: number;        // gap as % of expected

  // Statistical measures
  zScore: number;
  effectSize: number;           // Cohen's d
  standardDeviation: number;

  // Metadata
  severity: OutlierSeverity;
  isSignificant: boolean;
  comparisonCount: number;      // Number of cohorts compared against
}

/**
 * Calculate mean of an array
 */
function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calculate standard deviation
 */
function standardDeviation(values: number[], populationMean?: number): number {
  if (values.length === 0) return 0;
  const avg = populationMean ?? mean(values);
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
  const variance = mean(squaredDiffs);
  return Math.sqrt(variance);
}

/**
 * Calculate Cohen's d effect size
 * https://en.wikipedia.org/wiki/Effect_size#Cohen's_d
 */
function calculateEffectSize(
  targetScore: number,
  comparisonScores: number[]
): number {
  const comparisonMean = mean(comparisonScores);
  const comparisonSD = standardDeviation(comparisonScores);

  if (comparisonSD === 0) return 0;

  // Cohen's d = (M1 - M2) / SD_pooled
  // For single observation vs. group, use group SD
  return (targetScore - comparisonMean) / comparisonSD;
}

/**
 * Calculate z-score
 */
function calculateZScore(
  value: number,
  populationMean: number,
  populationSD: number
): number {
  if (populationSD === 0) return 0;
  return (value - populationMean) / populationSD;
}

/**
 * Determine severity based on effect size and z-score
 */
function determineSeverity(effectSize: number, zScore: number): OutlierSeverity {
  const absEffect = Math.abs(effectSize);
  const absZ = Math.abs(zScore);

  // Critical: Large effect size (>0.8) OR very high z-score (>2.5)
  if (absEffect > 0.8 || absZ > 2.5) return 'critical';

  // High: Medium-large effect (>0.65) OR high z-score (>2.0)
  if (absEffect > 0.65 || absZ > 2.0) return 'high';

  // Moderate: Medium effect (>0.5) OR moderate z-score (>1.5)
  if (absEffect > 0.5 || absZ > 1.5) return 'moderate';

  return 'low';
}

/**
 * Detect outliers for a single skill/domain
 */
export function detectOutlier(
  skill: string,
  contentDomain: string,
  targetScore: number,
  comparisonScores: number[],
  config: OutlierConfig = DEFAULT_OUTLIER_CONFIG
): OutlierResult | null {
  if (comparisonScores.length === 0) return null;

  const expectedScore = mean(comparisonScores);
  const sd = standardDeviation(comparisonScores);
  const gap = targetScore - expectedScore;
  const gapPercentage = expectedScore !== 0 ? (gap / expectedScore) * 100 : 0;

  const zScore = calculateZScore(targetScore, expectedScore, sd);
  const effectSize = calculateEffectSize(targetScore, comparisonScores);

  // Check if significant
  const isSignificant =
    Math.abs(effectSize) >= config.minEffectSize &&
    Math.abs(zScore) >= config.minZScore;

  const severity = determineSeverity(effectSize, zScore);

  return {
    skill,
    contentDomain,
    currentScore: targetScore,
    expectedScore,
    gap,
    gapPercentage,
    zScore,
    effectSize,
    standardDeviation: sd,
    severity,
    isSignificant,
    comparisonCount: comparisonScores.length,
  };
}

/**
 * Detect outliers across multiple skills/domains
 */
export function detectOutliers(
  targetSkills: SkillDomainScore[],
  comparisonCohorts: Array<{ skills: SkillDomainScore[] }>,
  config: OutlierConfig = DEFAULT_OUTLIER_CONFIG
): OutlierResult[] {
  const outliers: OutlierResult[] = [];

  // For each skill in target, compare against comparison cohorts
  targetSkills.forEach(targetSkill => {
    // Domain-level outlier
    const domainScores = comparisonCohorts
      .map(cohort => {
        const skill = cohort.skills.find(s => s.domain === targetSkill.domain);
        return skill ? skill.score : null;
      })
      .filter((s): s is number => s !== null);

    if (domainScores.length > 0) {
      const domainOutlier = detectOutlier(
        'Overall',
        targetSkill.domain,
        targetSkill.score,
        domainScores,
        config
      );

      if (domainOutlier && domainOutlier.isSignificant) {
        outliers.push(domainOutlier);
      }
    }

    // Skill-level outliers (within domain)
    targetSkill.skillBreakdown.forEach(targetSkillDetail => {
      const skillScores = comparisonCohorts
        .map(cohort => {
          const domain = cohort.skills.find(s => s.domain === targetSkill.domain);
          if (!domain) return null;
          const skill = domain.skillBreakdown.find(s => s.skill === targetSkillDetail.skill);
          return skill ? skill.score : null;
        })
        .filter((s): s is number => s !== null);

      if (skillScores.length > 0) {
        const skillOutlier = detectOutlier(
          targetSkillDetail.skill,
          targetSkill.domain,
          targetSkillDetail.score,
          skillScores,
          config
        );

        if (skillOutlier && skillOutlier.isSignificant) {
          outliers.push(skillOutlier);
        }
      }
    });
  });

  // Sort by severity (critical first) then by effect size
  return outliers.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, moderate: 2, low: 3 };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return Math.abs(b.effectSize) - Math.abs(a.effectSize);
  });
}

/**
 * Detect trend changes over time
 */
export interface TrendAnalysis {
  direction: 'improving' | 'stable' | 'declining';
  changeRate: number;            // Percentage change per period
  isSignificantTrend: boolean;
  confidence: number;            // 0-1
}

export function analyzeTrend(
  historicalScores: Array<{ date: Date; score: number }>,
  minDataPoints: number = 3
): TrendAnalysis | null {
  if (historicalScores.length < minDataPoints) return null;

  // Sort by date
  const sorted = [...historicalScores].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Calculate linear regression
  const n = sorted.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  const scores = sorted.map(s => s.score);

  const meanX = mean(indices);
  const meanY = mean(scores);

  // Calculate slope (β1)
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (indices[i] - meanX) * (scores[i] - meanY);
    denominator += Math.pow(indices[i] - meanX, 2);
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;

  // Calculate R² (coefficient of determination)
  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    const predicted = meanY + slope * (indices[i] - meanX);
    ssTot += Math.pow(scores[i] - meanY, 2);
    ssRes += Math.pow(scores[i] - predicted, 2);
  }

  const rSquared = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;

  // Determine direction
  let direction: 'improving' | 'stable' | 'declining';
  if (Math.abs(slope) < 0.5) {
    direction = 'stable';
  } else if (slope > 0) {
    direction = 'improving';
  } else {
    direction = 'declining';
  }

  // Change rate as percentage per period
  const changeRate = meanY !== 0 ? (slope / meanY) * 100 : 0;

  // Significant if R² > 0.5 and absolute slope > 1
  const isSignificantTrend = rSquared > 0.5 && Math.abs(slope) > 1;

  return {
    direction,
    changeRate,
    isSignificantTrend,
    confidence: rSquared,
  };
}
