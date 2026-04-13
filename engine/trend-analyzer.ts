/**
 * Historical Trend Analysis
 * Tracks performance over time and predicts future trajectory
 */

import { SkillDomainScore } from '../models/assessment-data';
import { analyzeTrend, TrendAnalysis } from './outlier-detector';

export interface HistoricalDataPoint {
  date: Date;
  assessmentId: string;
  overallScore: number;
  skillDomainScores: SkillDomainScore[];
}

export interface SkillTrend {
  skill: string;
  domain: string;
  trend: TrendAnalysis;
  dataPoints: Array<{ date: Date; score: number }>;
  currentScore: number;
  projectedNextScore: number;  // Based on trend
  daysToTarget?: number;        // If we have a target
}

export interface CohortTrendReport {
  cohortId: string;
  timespan: string;  // e.g., "Last 6 months", "Academic year 2024-25"

  overallTrend: {
    direction: 'improving' | 'stable' | 'declining';
    changeRate: number;  // Points per month
    projection: number;   // Where we'll be in 3 months
  };

  skillTrends: SkillTrend[];

  concerns: string[];   // Skills declining or not improving fast enough
  successes: string[];  // Skills improving rapidly

  interventionImpact?: {
    interventionDate: Date;
    skillsTargeted: string[];
    beforeAverage: number;
    afterAverage: number;
    effectSize: number;
  }[];
}

/**
 * Analyze trends across multiple assessments
 */
export function analyzeCohortTrends(
  cohortId: string,
  historicalData: HistoricalDataPoint[],
  targetScores?: Map<string, number>
): CohortTrendReport {
  // Sort by date
  const sorted = [...historicalData].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Overall trend
  const overallScores = sorted.map(d => ({ date: d.date, score: d.overallScore }));
  const overallTrend = analyzeTrend(overallScores, 2);

  let overallDirection: 'improving' | 'stable' | 'declining' = 'stable';
  let changeRate = 0;
  let projection = sorted[sorted.length - 1]?.overallScore || 0;

  if (overallTrend) {
    overallDirection = overallTrend.direction;
    changeRate = overallTrend.changeRate;

    // Project 3 months forward (assuming monthly assessments)
    const currentScore = sorted[sorted.length - 1]?.overallScore || 0;
    projection = currentScore + (changeRate * 3);
  }

  // Skill-level trends
  const skillTrends: SkillTrend[] = [];
  const allSkills = new Set<string>();

  // Collect all unique skills
  sorted.forEach(d => {
    d.skillDomainScores.forEach(domain => {
      domain.skillBreakdown.forEach(skill => {
        allSkills.add(`${domain.domain}::${skill.skill}`);
      });
    });
  });

  // Analyze each skill's trend
  allSkills.forEach(skillKey => {
    const [domain, skill] = skillKey.split('::');

    const dataPoints: Array<{ date: Date; score: number }> = [];
    sorted.forEach(d => {
      const domainData = d.skillDomainScores.find(ds => ds.domain === domain);
      const skillData = domainData?.skillBreakdown.find(s => s.skill === skill);
      if (skillData) {
        dataPoints.push({ date: d.date, score: skillData.score });
      }
    });

    if (dataPoints.length >= 2) {
      const trend = analyzeTrend(dataPoints, 2);
      const currentScore = dataPoints[dataPoints.length - 1]?.score || 0;

      let projectedNextScore = currentScore;
      let daysToTarget: number | undefined;

      if (trend) {
        // Project next assessment (assume 1 unit = 1 assessment)
        projectedNextScore = currentScore + trend.changeRate;

        // Calculate days to target if we have one
        const target = targetScores?.get(skillKey);
        if (target && trend.changeRate > 0) {
          const pointsNeeded = target - currentScore;
          const assessmentsNeeded = pointsNeeded / trend.changeRate;
          daysToTarget = Math.round(assessmentsNeeded * 30); // Assume monthly assessments
        }
      }

      skillTrends.push({
        skill,
        domain,
        trend: trend || { direction: 'stable', changeRate: 0, isSignificantTrend: false, confidence: 0 },
        dataPoints,
        currentScore,
        projectedNextScore,
        daysToTarget,
      });
    }
  });

  // Identify concerns and successes
  const concerns: string[] = [];
  const successes: string[] = [];

  skillTrends.forEach(st => {
    if (st.trend.direction === 'declining' && st.trend.isSignificantTrend) {
      concerns.push(
        `${st.domain} - ${st.skill}: Declining at ${Math.abs(st.trend.changeRate).toFixed(1)}% per assessment`
      );
    }

    if (st.trend.direction === 'improving' && st.trend.isSignificantTrend && st.trend.changeRate > 5) {
      successes.push(
        `${st.domain} - ${st.skill}: Improving at +${st.trend.changeRate.toFixed(1)}% per assessment`
      );
    }
  });

  // Timespan
  const firstDate = sorted[0]?.date;
  const lastDate = sorted[sorted.length - 1]?.date;
  const timespan = firstDate && lastDate
    ? `${firstDate.toLocaleDateString()} - ${lastDate.toLocaleDateString()}`
    : 'Unknown';

  return {
    cohortId,
    timespan,
    overallTrend: {
      direction: overallDirection,
      changeRate,
      projection,
    },
    skillTrends,
    concerns: concerns.slice(0, 5),
    successes: successes.slice(0, 5),
  };
}

/**
 * Detect intervention impact by looking for sudden changes
 */
export function detectInterventionImpact(
  skillTrends: SkillTrend[],
  interventionDate: Date,
  skillsTargeted: string[]
): {
  skillsImproved: string[];
  skillsNotImproved: string[];
  averageImpact: number;
  effectSize: number;
} {
  const results = {
    skillsImproved: [] as string[],
    skillsNotImproved: [] as string[],
    averageImpact: 0,
    effectSize: 0,
  };

  const impacts: number[] = [];

  skillsTargeted.forEach(targetSkill => {
    const trend = skillTrends.find(st => st.skill === targetSkill);
    if (!trend) return;

    // Split data points into before and after intervention
    const before = trend.dataPoints.filter(dp => dp.date < interventionDate);
    const after = trend.dataPoints.filter(dp => dp.date >= interventionDate);

    if (before.length >= 2 && after.length >= 1) {
      const avgBefore = before.reduce((sum, dp) => sum + dp.score, 0) / before.length;
      const avgAfter = after.reduce((sum, dp) => sum + dp.score, 0) / after.length;
      const impact = avgAfter - avgBefore;

      impacts.push(impact);

      if (impact > 5) {
        results.skillsImproved.push(`${trend.skill}: +${impact.toFixed(1)}%`);
      } else {
        results.skillsNotImproved.push(`${trend.skill}: ${impact >= 0 ? '+' : ''}${impact.toFixed(1)}%`);
      }
    }
  });

  if (impacts.length > 0) {
    results.averageImpact = impacts.reduce((sum, i) => sum + i, 0) / impacts.length;

    // Calculate effect size (rough Cohen's d)
    const sd = Math.sqrt(impacts.reduce((sum, i) => sum + Math.pow(i - results.averageImpact, 2), 0) / impacts.length);
    results.effectSize = sd > 0 ? results.averageImpact / sd : 0;
  }

  return results;
}

/**
 * Generate a progress chart (ASCII art for terminal/reports)
 */
export function generateProgressChart(
  skillTrend: SkillTrend,
  width: number = 50,
  height: number = 10
): string[] {
  const lines: string[] = [];
  const scores = skillTrend.dataPoints.map(dp => dp.score);
  const minScore = Math.min(...scores, 0);
  const maxScore = Math.max(...scores, 100);

  // Title
  lines.push(`📈 ${skillTrend.skill} (${skillTrend.domain})`);
  lines.push('─'.repeat(width + 10));

  // Chart
  for (let h = height; h >= 0; h--) {
    const value = minScore + ((maxScore - minScore) * (h / height));
    let line = `${value.toFixed(0).padStart(4)}% │`;

    for (let w = 0; w < width; w++) {
      const dataIndex = Math.floor((w / width) * skillTrend.dataPoints.length);
      const score = skillTrend.dataPoints[dataIndex]?.score || 0;

      const normalizedScore = (score - minScore) / (maxScore - minScore);
      const scoreHeight = normalizedScore * height;

      if (Math.abs(scoreHeight - h) < 0.5) {
        line += '●';
      } else {
        line += ' ';
      }
    }

    lines.push(line);
  }

  // X-axis
  lines.push('     └' + '─'.repeat(width));

  // Dates
  const firstDate = skillTrend.dataPoints[0]?.date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
  const lastDate = skillTrend.dataPoints[skillTrend.dataPoints.length - 1]?.date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
  lines.push(`      ${firstDate}${' '.repeat(width - firstDate.length - lastDate.length)}${lastDate}`);

  // Trend info
  const arrow = skillTrend.trend.direction === 'improving' ? '📈' :
                skillTrend.trend.direction === 'declining' ? '📉' : '➡️';
  lines.push('');
  lines.push(`${arrow} ${skillTrend.trend.direction.toUpperCase()} at ${skillTrend.trend.changeRate > 0 ? '+' : ''}${skillTrend.trend.changeRate.toFixed(1)}% per assessment`);
  lines.push(`   Current: ${skillTrend.currentScore}% | Projected: ${skillTrend.projectedNextScore.toFixed(0)}%`);

  if (skillTrend.daysToTarget) {
    lines.push(`   ⏱️  ${skillTrend.daysToTarget} days to target at current rate`);
  }

  return lines;
}

/**
 * Compare two cohorts' trends (e.g., this year vs. last year)
 */
export function compareCohortTrends(
  cohort1: CohortTrendReport,
  cohort2: CohortTrendReport
): {
  summary: string;
  skillsImprovedMoreInCohort1: string[];
  skillsImprovedMoreInCohort2: string[];
  overallComparison: string;
} {
  const skills1 = new Map(cohort1.skillTrends.map(st => [`${st.domain}::${st.skill}`, st]));
  const skills2 = new Map(cohort2.skillTrends.map(st => [`${st.domain}::${st.skill}`, st]));

  const improvedMore1: string[] = [];
  const improvedMore2: string[] = [];

  skills1.forEach((trend1, key) => {
    const trend2 = skills2.get(key);
    if (trend2) {
      const diff = trend1.trend.changeRate - trend2.trend.changeRate;
      if (diff > 3) {
        improvedMore1.push(`${trend1.skill}: ${trend1.trend.changeRate.toFixed(1)}% vs ${trend2.trend.changeRate.toFixed(1)}%`);
      } else if (diff < -3) {
        improvedMore2.push(`${trend2.skill}: ${trend2.trend.changeRate.toFixed(1)}% vs ${trend1.trend.changeRate.toFixed(1)}%`);
      }
    }
  });

  const overall1 = cohort1.overallTrend.changeRate;
  const overall2 = cohort2.overallTrend.changeRate;
  const overallComparison = overall1 > overall2
    ? `Cohort 1 improving faster (+${overall1.toFixed(1)}% vs +${overall2.toFixed(1)}% per assessment)`
    : overall2 > overall1
    ? `Cohort 2 improving faster (+${overall2.toFixed(1)}% vs +${overall1.toFixed(1)}% per assessment)`
    : 'Both cohorts progressing at similar rates';

  const summary = `Compared ${cohort1.cohortId} vs ${cohort2.cohortId}. ` +
    `${improvedMore1.length} skills better in cohort 1, ${improvedMore2.length} better in cohort 2. ` +
    overallComparison;

  return {
    summary,
    skillsImprovedMoreInCohort1: improvedMore1.slice(0, 5),
    skillsImprovedMoreInCohort2: improvedMore2.slice(0, 5),
    overallComparison,
  };
}
