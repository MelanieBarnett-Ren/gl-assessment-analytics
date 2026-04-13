/**
 * Prerequisite Chain Analyzer
 * Identifies foundation skill gaps that compound over time
 */

import { SkillDomainScore } from '../models/assessment-data';
import { CurriculumObjective, getPrerequisiteChain } from '../models/curriculum-mappings';

export interface PrerequisiteGap {
  currentSkill: string;
  currentScore: number;
  expectedScore: number;
  gap: number;

  // Foundation issues
  prerequisiteSkill: string;
  prerequisiteScore: number;
  prerequisiteExpected: number;
  prerequisiteGap: number;

  // Analysis
  isFoundationIssue: boolean;  // true if prerequisite gap is causing current gap
  yearGroupBehind: number;      // How many years behind (0 = on track)
  compoundingEffect: number;    // How much the prereq gap contributes to current gap

  // Recommendations
  interventionFocus: 'prerequisite' | 'current' | 'both';
  explanation: string;
}

export interface PrerequisiteAnalysis {
  gaps: PrerequisiteGap[];
  summary: {
    totalGaps: number;
    foundationIssues: number;
    averageYearsBehind: number;
    criticalPrerequisites: string[];
  };
  recommendations: string[];
}

/**
 * Analyze prerequisite chains to identify foundation gaps
 */
export function analyzePrerequisiteChains(
  currentSkills: SkillDomainScore[],
  historicalSkills: Array<{ yearGroup: number; skills: SkillDomainScore[] }>,
  currentYearGroup: number,
  allObjectives: CurriculumObjective[]
): PrerequisiteAnalysis {
  const gaps: PrerequisiteGap[] = [];

  // For each current skill that's below expected
  currentSkills.forEach(domain => {
    domain.skillBreakdown.forEach(skill => {
      // Find the curriculum objective for this skill
      const objective = allObjectives.find(obj =>
        obj.statement.toLowerCase().includes(skill.skill.toLowerCase()) &&
        obj.domain === domain.domain
      );

      if (!objective) return;

      const expectedScore = objective.expectedMastery.passRate;
      const gap = skill.score - expectedScore;

      // Only analyze if there's a significant gap (below expected)
      if (gap < -10) {
        // Check prerequisites
        objective.prerequisiteObjectives.forEach(prereqId => {
          const prereqObjective = allObjectives.find(o => o.objectiveId === prereqId);
          if (!prereqObjective) return;

          // Find the prerequisite skill score from historical data
          const prereqYearGroup = prereqObjective.yearGroup;
          const historicalData = historicalSkills.find(h => h.yearGroup === prereqYearGroup);

          if (historicalData) {
            // Find the prerequisite skill score
            const prereqDomain = historicalData.skills.find(s => s.domain === prereqObjective.domain);
            const prereqSkill = prereqDomain?.skillBreakdown.find(s =>
              prereqObjective.statement.toLowerCase().includes(s.skill.toLowerCase())
            );

            if (prereqSkill) {
              const prereqExpected = prereqObjective.expectedMastery.passRate;
              const prereqGap = prereqSkill.score - prereqExpected;

              // Is the prerequisite gap causing the current gap?
              const isFoundationIssue = prereqGap < -10; // Prerequisite also weak
              const compoundingEffect = isFoundationIssue ? Math.abs(prereqGap) * 0.7 : 0;

              const yearGroupBehind = currentYearGroup - prereqObjective.yearGroup;

              gaps.push({
                currentSkill: skill.skill,
                currentScore: skill.score,
                expectedScore,
                gap,
                prerequisiteSkill: prereqObjective.statement.substring(0, 100), // Truncate
                prerequisiteScore: prereqSkill.score,
                prerequisiteExpected: prereqExpected,
                prerequisiteGap: prereqGap,
                isFoundationIssue,
                yearGroupBehind,
                compoundingEffect,
                interventionFocus: determineInterventionFocus(prereqGap, gap),
                explanation: generateExplanation(
                  skill.skill,
                  skill.score,
                  expectedScore,
                  prereqObjective.statement,
                  prereqSkill.score,
                  prereqExpected,
                  currentYearGroup,
                  prereqYearGroup
                ),
              });
            }
          }
        });
      }
    });
  });

  // Generate summary
  const foundationIssues = gaps.filter(g => g.isFoundationIssue).length;
  const avgYearsBehind = gaps.length > 0
    ? gaps.reduce((sum, g) => sum + g.yearGroupBehind, 0) / gaps.length
    : 0;

  const criticalPrerequisites = gaps
    .filter(g => g.isFoundationIssue && Math.abs(g.prerequisiteGap) > 20)
    .map(g => g.prerequisiteSkill)
    .filter((v, i, a) => a.indexOf(v) === i) // unique
    .slice(0, 5);

  // Generate recommendations
  const recommendations = generateRecommendations(gaps);

  return {
    gaps,
    summary: {
      totalGaps: gaps.length,
      foundationIssues,
      averageYearsBehind: avgYearsBehind,
      criticalPrerequisites,
    },
    recommendations,
  };
}

/**
 * Determine where intervention should focus
 */
function determineInterventionFocus(
  prereqGap: number,
  currentGap: number
): 'prerequisite' | 'current' | 'both' {
  const prereqWeak = prereqGap < -15;
  const currentWeak = currentGap < -15;

  if (prereqWeak && currentWeak) return 'both';
  if (prereqWeak) return 'prerequisite';
  return 'current';
}

/**
 * Generate human-readable explanation
 */
function generateExplanation(
  currentSkill: string,
  currentScore: number,
  currentExpected: number,
  prereqSkill: string,
  prereqScore: number,
  prereqExpected: number,
  currentYear: number,
  prereqYear: number
): string {
  const currentGap = currentScore - currentExpected;
  const prereqGap = prereqScore - prereqExpected;

  if (prereqGap < -15) {
    return `Students are struggling with ${currentSkill} (${currentScore}%, expected ${currentExpected}%). ` +
      `This is a foundation gap: Year ${prereqYear} prerequisite "${prereqSkill.substring(0, 60)}..." ` +
      `was only ${prereqScore}% (expected ${prereqExpected}%). The Year ${prereqYear} gap has compounded into ` +
      `Year ${currentYear}. **Priority: Re-teach Year ${prereqYear} foundations first.**`;
  } else {
    return `Students are struggling with ${currentSkill} (${currentScore}%, expected ${currentExpected}%). ` +
      `Prerequisite skills from Year ${prereqYear} are mostly secure (${prereqScore}%), so this is likely a ` +
      `Year ${currentYear} teaching/learning issue rather than a foundation problem.`;
  }
}

/**
 * Generate intervention recommendations based on gaps
 */
function generateRecommendations(gaps: PrerequisiteGap[]): string[] {
  const recommendations: string[] = [];

  // Group by intervention focus
  const prereqFocus = gaps.filter(g => g.interventionFocus === 'prerequisite');
  const bothFocus = gaps.filter(g => g.interventionFocus === 'both');

  // Critical foundation gaps (biggest impact)
  const critical = [...prereqFocus, ...bothFocus]
    .filter(g => Math.abs(g.prerequisiteGap) > 20)
    .sort((a, b) => Math.abs(b.prerequisiteGap) - Math.abs(a.prerequisiteGap))
    .slice(0, 3);

  if (critical.length > 0) {
    recommendations.push(
      `🚨 FOUNDATION CRISIS: ${critical.length} critical prerequisite gaps detected. ` +
      `Students are ${critical[0].yearGroupBehind} year(s) behind on essential foundations. ` +
      `You MUST address Year ${critical[0].yearGroupBehind} skills before teaching current year content.`
    );

    critical.forEach(gap => {
      recommendations.push(
        `📚 Re-teach: "${gap.prerequisiteSkill.substring(0, 80)}..." ` +
        `(only ${gap.prerequisiteScore}%, need ${gap.prerequisiteExpected}%). ` +
        `This foundation gap is causing ${gap.currentSkill} to fail.`
      );
    });
  }

  // Sequential teaching order
  const ordered = gaps
    .filter(g => g.isFoundationIssue)
    .sort((a, b) => a.yearGroupBehind - b.yearGroupBehind); // Earliest year first

  if (ordered.length > 0) {
    recommendations.push(
      `📋 TEACHING ORDER: Start with Year ${ordered[0].yearGroupBehind} foundations, ` +
      `then progress sequentially. Don't skip ahead until foundations are secure (80%+).`
    );
  }

  // Differentiation suggestion
  const multiYear = gaps.some(g => g.yearGroupBehind >= 2);
  if (multiYear) {
    recommendations.push(
      `👥 DIFFERENTIATION NEEDED: Some students are 2+ years behind. ` +
      `Consider creating focus groups: ` +
      `(1) Foundation group (Year ${ordered[0]?.yearGroupBehind} catch-up), ` +
      `(2) Current year group (age-appropriate content).`
    );
  }

  // Positive message if only minor gaps
  if (gaps.length > 0 && prereqFocus.length === 0) {
    recommendations.push(
      `✅ GOOD NEWS: Prerequisites are mostly secure. Current gaps are likely due to ` +
      `recent teaching rather than foundation issues. Focus interventions on current year objectives.`
    );
  }

  return recommendations.slice(0, 5); // Max 5 recommendations
}

/**
 * Identify "compound gaps" - where multiple prerequisites are all weak
 */
export function identifyCompoundGaps(
  gaps: PrerequisiteGap[]
): Array<{
  currentSkill: string;
  compoundPrerequisites: string[];
  totalCompoundEffect: number;
  severity: 'critical' | 'high' | 'moderate';
}> {
  // Group gaps by current skill
  const bySkill = new Map<string, PrerequisiteGap[]>();
  gaps.forEach(gap => {
    const existing = bySkill.get(gap.currentSkill) || [];
    existing.push(gap);
    bySkill.set(gap.currentSkill, existing);
  });

  const compoundGaps: Array<{
    currentSkill: string;
    compoundPrerequisites: string[];
    totalCompoundEffect: number;
    severity: 'critical' | 'high' | 'moderate';
  }> = [];

  bySkill.forEach((gapsForSkill, skill) => {
    // Only consider if multiple prerequisites are weak
    const foundationIssues = gapsForSkill.filter(g => g.isFoundationIssue);

    if (foundationIssues.length >= 2) {
      const totalEffect = foundationIssues.reduce((sum, g) => sum + g.compoundingEffect, 0);

      let severity: 'critical' | 'high' | 'moderate';
      if (totalEffect > 40) severity = 'critical';
      else if (totalEffect > 25) severity = 'high';
      else severity = 'moderate';

      compoundGaps.push({
        currentSkill: skill,
        compoundPrerequisites: foundationIssues.map(g => g.prerequisiteSkill),
        totalCompoundEffect: totalEffect,
        severity,
      });
    }
  });

  return compoundGaps.sort((a, b) => b.totalCompoundEffect - a.totalCompoundEffect);
}

/**
 * Generate a visual "skill ladder" showing progression
 */
export function generateSkillLadder(
  currentSkill: string,
  gaps: PrerequisiteGap[]
): string[] {
  const relevantGaps = gaps
    .filter(g => g.currentSkill === currentSkill)
    .sort((a, b) => a.yearGroupBehind - b.yearGroupBehind);

  const ladder: string[] = [];

  relevantGaps.forEach((gap, index) => {
    const status = gap.prerequisiteScore >= gap.prerequisiteExpected ? '✅' : '❌';
    const indent = '  '.repeat(index);
    ladder.push(
      `${indent}${status} Year ${gap.yearGroupBehind}: ${gap.prerequisiteSkill.substring(0, 60)}... ` +
      `(${gap.prerequisiteScore}%)`
    );
  });

  // Add current skill at top
  const currentGap = gaps.find(g => g.currentSkill === currentSkill);
  if (currentGap) {
    const status = currentGap.currentScore >= currentGap.expectedScore ? '✅' : '❌';
    const indent = '  '.repeat(relevantGaps.length);
    ladder.push(
      `${indent}${status} Current: ${currentSkill} (${currentGap.currentScore}%)`
    );
  }

  return ladder;
}
