/**
 * GL Assessment Integrated Analyzer
 * Combines NGMT, PTM, and CAT4 data for comprehensive insights
 */

import { NGMTAssessment, PTMAssessment, CAT4Assessment, GLAssessmentScore } from '../server/gl-assessment-data';

export interface ValueAddedAnalysis {
  schoolId: string;

  // CAT4 Baseline (Potential)
  cat4MeanSAS: number;
  cat4Stanine: number;
  predictedAttainment: string;  // e.g., "Expected: SAS 102-106"

  // Actual Attainment (NGMT/PTM)
  actualMathsSAS: number;
  actualStanine: number;

  // Value Added
  valueAdded: number;           // Actual - Expected
  valueAddedCategory: 'significantly_above' | 'above' | 'as_expected' | 'below' | 'significantly_below';
  verdict: string;

  // Implications
  implications: string[];
}

export interface GLIntegratedInsight {
  schoolId: string;
  schoolName: string;

  // Summary
  overallVerdict: 'crisis' | 'concern' | 'satisfactory' | 'good' | 'excellent';
  headline: string;

  // All assessments
  ngmt: NGMTAssessment;
  ptm: PTMAssessment;
  cat4: CAT4Assessment;
  valueAdded: ValueAddedAnalysis;

  // Key insights
  keyInsights: Array<{
    priority: 'urgent' | 'high' | 'medium';
    title: string;
    finding: string;
    evidence: string[];
    recommendation: string;
  }>;

  // Specific skill gaps (item-level from PTM)
  skillGaps: Array<{
    skill: string;
    yourScore: number;
    nationalAverage: number;
    gap: number;
    severity: 'critical' | 'high' | 'moderate';
  }>;

  // Progress trajectory
  progressTrajectory: {
    direction: 'improving' | 'stable' | 'declining';
    rate: string;
    projection: string;
  };
}

/**
 * Analyze value-added (CAT4 baseline vs actual attainment)
 */
export function analyzeValueAdded(
  cat4: CAT4Assessment,
  ngmt: NGMTAssessment
): ValueAddedAnalysis {
  const cat4SAS = cat4.meanCAT4.sas;
  const actualSAS = ngmt.overall.sas;
  const valueAdded = actualSAS - cat4SAS;

  // Categorize
  let category: 'significantly_above' | 'above' | 'as_expected' | 'below' | 'significantly_below';
  if (valueAdded > 5) category = 'significantly_above';
  else if (valueAdded > 2) category = 'above';
  else if (valueAdded >= -2) category = 'as_expected';
  else if (valueAdded >= -5) category = 'below';
  else category = 'significantly_below';

  // Verdict
  let verdict: string;
  switch (category) {
    case 'significantly_above':
      verdict = '🌟 OUTSTANDING: Students achieving well above cognitive potential';
      break;
    case 'above':
      verdict = '✅ GOOD: Students exceeding expectations based on ability';
      break;
    case 'as_expected':
      verdict = '➡️ AS EXPECTED: Students working to potential';
      break;
    case 'below':
      verdict = '⚠️ CONCERN: Students underachieving vs. ability';
      break;
    case 'significantly_below':
      verdict = '🚨 CRISIS: Students significantly underachieving';
      break;
  }

  // Implications
  const implications: string[] = [];
  if (category === 'below' || category === 'significantly_below') {
    implications.push('Students have the ABILITY but not achieving it - teaching issue, not ability issue');
    implications.push('CAT4 shows potential for higher performance - gap is closeable');
    implications.push('Focus: Identify barriers (teaching quality, curriculum gaps, behavior, attendance)');
  } else if (category === 'significantly_above' || category === 'above') {
    implications.push('Excellent teaching effectiveness - students exceeding cognitive potential');
    implications.push('Share best practice: What are you doing that works?');
    implications.push('Consider: Is CAT4 understating ability, or is teaching exceptional?');
  } else {
    implications.push('Students working broadly to potential - satisfactory progress');
    implications.push('Focus: Maintain standards, look for specific skill gaps to target');
  }

  return {
    schoolId: ngmt.schoolId,
    cat4MeanSAS: cat4SAS,
    cat4Stanine: cat4.meanCAT4.stanine,
    predictedAttainment: `Expected: SAS ${cat4SAS - 2} to ${cat4SAS + 2}`,
    actualMathsSAS: actualSAS,
    actualStanine: ngmt.overall.stanine,
    valueAdded,
    valueAddedCategory: category,
    verdict,
    implications,
  };
}

/**
 * Generate comprehensive GL Assessment insights
 */
export function generateGLIntegratedInsights(
  schoolId: string,
  schoolName: string,
  ngmt: NGMTAssessment,
  ptm: PTMAssessment,
  cat4: CAT4Assessment
): GLIntegratedInsight {
  const valueAdded = analyzeValueAdded(cat4, ngmt);

  // Determine overall verdict
  let overallVerdict: 'crisis' | 'concern' | 'satisfactory' | 'good' | 'excellent';
  if (valueAdded.valueAddedCategory === 'significantly_below' || ngmt.overall.stanine <= 2) {
    overallVerdict = 'crisis';
  } else if (valueAdded.valueAddedCategory === 'below' || ngmt.overall.stanine === 3) {
    overallVerdict = 'concern';
  } else if (valueAdded.valueAddedCategory === 'above' || ngmt.overall.stanine >= 7) {
    overallVerdict = 'excellent';
  } else if (valueAdded.valueAddedCategory === 'as_expected' && ngmt.overall.stanine >= 5) {
    overallVerdict = 'good';
  } else {
    overallVerdict = 'satisfactory';
  }

  // Headline
  const headline = generateHeadline(schoolName, ngmt, ptm, valueAdded);

  // Key insights
  const keyInsights = generateKeyInsights(ngmt, ptm, cat4, valueAdded);

  // Skill gaps (from PTM item-level data)
  const skillGaps = identifySkillGaps(ptm);

  // Progress trajectory
  const progressTrajectory = analyzeProgressTrajectory(ptm);

  return {
    schoolId,
    schoolName,
    overallVerdict,
    headline,
    ngmt,
    ptm,
    cat4,
    valueAdded,
    keyInsights,
    skillGaps,
    progressTrajectory,
  };
}

function generateHeadline(
  schoolName: string,
  ngmt: NGMTAssessment,
  ptm: PTMAssessment,
  valueAdded: ValueAddedAnalysis
): string {
  if (valueAdded.valueAddedCategory === 'significantly_below') {
    return `🚨 ${schoolName}: Students underachieving by ${Math.abs(valueAdded.valueAdded)} SAS points - URGENT ACTION NEEDED`;
  } else if (ptm.progress.progressIndicator === 'below' && valueAdded.valueAddedCategory === 'below') {
    return `⚠️ ${schoolName}: Declining progress AND underachieving vs. ability - Intervention required`;
  } else if (valueAdded.valueAddedCategory === 'significantly_above') {
    return `🌟 ${schoolName}: Outstanding value-added (+${valueAdded.valueAdded} SAS) - Peer learning opportunity`;
  } else if (ptm.progress.progressIndicator === 'above') {
    return `📈 ${schoolName}: Accelerating progress (+${ptm.progress.actualProgress} SAS this term)`;
  } else {
    return `${schoolName}: SAS ${ngmt.overall.sas} (Stanine ${ngmt.overall.stanine}) - ${valueAdded.verdict.split(':')[1].trim()}`;
  }
}

function generateKeyInsights(
  ngmt: NGMTAssessment,
  ptm: PTMAssessment,
  cat4: CAT4Assessment,
  valueAdded: ValueAddedAnalysis
): Array<{
  priority: 'urgent' | 'high' | 'medium';
  title: string;
  finding: string;
  evidence: string[];
  recommendation: string;
}> {
  const insights: Array<{
    priority: 'urgent' | 'high' | 'medium';
    title: string;
    finding: string;
    evidence: string[];
    recommendation: string;
  }> = [];

  // Insight 1: Value-added analysis
  if (valueAdded.valueAddedCategory === 'significantly_below' || valueAdded.valueAddedCategory === 'below') {
    insights.push({
      priority: valueAdded.valueAddedCategory === 'significantly_below' ? 'urgent' : 'high',
      title: 'Underachievement vs. Cognitive Ability',
      finding: `Students are underachieving by ${Math.abs(valueAdded.valueAdded)} SAS points compared to their CAT4 baseline.`,
      evidence: [
        `CAT4 Mean: ${cat4.meanCAT4.sas} (Stanine ${cat4.meanCAT4.stanine}) - Shows cognitive potential`,
        `Actual Maths (NGMT): ${ngmt.overall.sas} (Stanine ${ngmt.overall.stanine})`,
        `Gap: ${valueAdded.valueAdded} points below expected`,
        `CAT4 predicts GCSE ${cat4.predictions.gcseMaths} but current trajectory suggests lower`,
      ],
      recommendation: `This is NOT an ability issue - students have the cognitive capacity. Focus on: (1) Teaching quality review, (2) Curriculum gaps from previous years, (3) Behavior/attendance barriers, (4) Assessment technique. The gap IS closeable.`,
    });
  }

  // Insight 2: Specific domain weaknesses
  const weakestDomain = Object.entries(ngmt.domains)
    .sort(([, a], [, b]) => a.score.sas - b.score.sas)[0];

  if (weakestDomain) {
    const [domainName, domainData] = weakestDomain;
    const domainSAS = domainData.score.sas;
    const skillsArray = Object.entries(domainData.skills as Record<string, number>);
    const weakestSkill = skillsArray.sort(([, a], [, b]) => a - b)[0];

    if (domainSAS < ngmt.overall.sas - 3) {
      insights.push({
        priority: domainSAS < 85 ? 'urgent' : 'high',
        title: `Critical Gap: ${formatDomainName(domainName)}`,
        finding: `${formatDomainName(domainName)} is ${ngmt.overall.sas - domainSAS} SAS points below overall score.`,
        evidence: [
          `${formatDomainName(domainName)} SAS: ${domainSAS} (Stanine ${domainData.score.stanine})`,
          `Weakest skill: ${formatSkillName(weakestSkill[0])} at ${weakestSkill[1]}%`,
          `All ${formatDomainName(domainName)} skills: ${skillsArray.map(([name, score]) => `${formatSkillName(name)}: ${score}%`).join(', ')}`,
        ],
        recommendation: `Focus intervention on ${formatDomainName(domainName)}, specifically ${formatSkillName(weakestSkill[0])}. Target: Bring to ${domainSAS + 8} SAS (Stanine ${domainData.score.stanine + 1}) by next term.`,
      });
    }
  }

  // Insight 3: Progress trajectory
  if (ptm.progress.progressIndicator === 'below') {
    insights.push({
      priority: 'high',
      title: 'Declining Progress Trajectory',
      finding: `Students made ${ptm.progress.actualProgress > 0 ? '+' : ''}${ptm.progress.actualProgress} SAS progress (expected: +${ptm.progress.expectedProgress}).`,
      evidence: [
        `Previous term: SAS ${ngmt.overall.sas - ptm.progress.actualProgress}`,
        `Current term: SAS ${ngmt.overall.sas}`,
        `Change: ${ptm.progress.actualProgress} (should be +${ptm.progress.expectedProgress})`,
        `Trajectory: If continues, will reach SAS ${ngmt.overall.sas + (ptm.progress.actualProgress * 2)} by end of year`,
      ],
      recommendation: `Urgent intervention needed to reverse declining trend. Review: (1) What changed this term? (2) Staff changes? (3) Behavior incidents? (4) Attendance issues? Act now before gap widens further.`,
    });
  }

  return insights.slice(0, 3);  // Top 3
}

function identifySkillGaps(ptm: PTMAssessment): Array<{
  skill: string;
  yourScore: number;
  nationalAverage: number;
  gap: number;
  severity: 'critical' | 'high' | 'moderate';
}> {
  const allItems = [
    ...ptm.domains.number.itemLevelData,
    ...ptm.domains.algebra.itemLevelData,
    ...ptm.domains.shapeSpaceMeasures.itemLevelData,
    ...ptm.domains.handlingData.itemLevelData,
  ];

  const gaps = allItems.map(item => {
    const gap = item.percentCorrect - item.nationalAverage;
    let severity: 'critical' | 'high' | 'moderate';
    if (gap < -20) severity = 'critical';
    else if (gap < -10) severity = 'high';
    else severity = 'moderate';

    return {
      skill: item.skill,
      yourScore: item.percentCorrect,
      nationalAverage: item.nationalAverage,
      gap,
      severity,
    };
  });

  return gaps
    .filter(g => g.gap < -10)  // Only significant gaps
    .sort((a, b) => a.gap - b.gap)
    .slice(0, 5);  // Top 5 worst
}

function analyzeProgressTrajectory(ptm: PTMAssessment): {
  direction: 'improving' | 'stable' | 'declining';
  rate: string;
  projection: string;
} {
  const direction = ptm.progress.progressIndicator === 'above' ? 'improving' :
                   ptm.progress.progressIndicator === 'below' ? 'declining' : 'stable';

  const rate = `${ptm.progress.actualProgress > 0 ? '+' : ''}${ptm.progress.actualProgress} SAS per term (expected: +${ptm.progress.expectedProgress})`;

  const projectedYearEnd = ptm.overall.sas + (ptm.progress.actualProgress * 2);  // 2 more terms
  const projection = `If trend continues: SAS ${projectedYearEnd} by end of year`;

  return { direction, rate, projection };
}

function formatDomainName(name: string): string {
  const map: Record<string, string> = {
    number: 'Number',
    algebra: 'Algebra',
    shapeSpaceMeasures: 'Shape, Space & Measures',
    handlingData: 'Handling Data',
  };
  return map[name] || name;
}

function formatSkillName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}
