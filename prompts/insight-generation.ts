/**
 * Claude API prompt templates for generating insights
 */

import { CohortAssessment, Demographics, SkillDomainScore } from '../models/assessment-data';
import { ViewLevel } from '../models/insights';

export interface PromptContext {
  viewLevel: ViewLevel;
  targetCohort: {
    cohortId: string;
    cohortName: string;
    assessment: CohortAssessment;
    demographics: Demographics;
  };
  similarCohorts: Array<{
    cohortId: string;
    cohortName: string;
    assessment: CohortAssessment;
    demographics: Demographics;
    similarityScore: number;
  }>;
  historicalTrends?: Array<{
    date: string;
    avgSAS: number;
    skillDomainScores: SkillDomainScore[];
  }>;
  outliers: Array<{
    skill: string;
    domain: string;
    gap: number;
    effectSize: number;
  }>;
}

/**
 * System prompt for Claude API
 */
export const SYSTEM_PROMPT = `You are an expert education data analyst specializing in identifying actionable insights from assessment data across schools in Multi-Academy Trusts (MATs).

Your role is to analyze performance data, identify significant gaps, and generate clear, actionable insights that help educators improve student outcomes.

Key principles:
1. **Fair comparisons** - Always compare cohorts with similar demographics (FSM%, EAL%, SEND%)
2. **Skill-level granularity** - Don't just say "maths is low" - identify which specific skills are weak
3. **Actionable recommendations** - Every insight must include specific next steps
4. **Peer learning focus** - Highlight what's working within the MAT so schools can learn from each other
5. **Foundation gaps** - Identify prerequisite skill deficits that compound over time
6. **Prioritization** - Focus on the 3-5 most impactful insights, not everything

Output format:
- Use clear, direct language suitable for busy school leaders
- Include specific numbers and targets
- Highlight peer examples when high performers exist
- Suggest concrete interventions with expected outcomes
- Rank insights by urgency and impact`;

/**
 * Generate MAT-level insights prompt
 */
export function generateMATInsightsPrompt(context: PromptContext): string {
  const { targetCohort, similarCohorts, outliers, historicalTrends } = context;

  return `Analyze assessment data for ${targetCohort.cohortName} (MAT-level view) and generate 3-5 key insights for trust leaders.

# TARGET MAT
Name: ${targetCohort.cohortName}
Assessment: ${targetCohort.assessment.assessmentId}
Subject: ${targetCohort.assessment.cohortType}
Schools in MAT: ${similarCohorts.length}

# PERFORMANCE DATA
Overall Performance:
- Average SAS: ${targetCohort.assessment.avgSAS}
- Average Percentage: ${targetCohort.assessment.avgPercentage}%
- Student Count: ${targetCohort.assessment.studentCount}

Skill Domain Breakdown:
${targetCohort.assessment.skillDomainScores.map(s =>
  `- ${s.domain}: ${s.score}% (${s.itemsCorrect}/${s.itemsAttempted} items)`
).join('\n')}

${historicalTrends ? `
# HISTORICAL TRENDS
${historicalTrends.map(t =>
  `${t.date}: SAS ${t.avgSAS} | Domains: ${t.skillDomainScores.map(s => `${s.domain} ${s.score}%`).join(', ')}`
).join('\n')}
` : ''}

# SCHOOL COMPARISONS WITHIN MAT
${similarCohorts.slice(0, 10).map(cohort => `
School: ${cohort.cohortName}
- SAS: ${cohort.assessment.avgSAS} (${cohort.assessment.avgSAS > targetCohort.assessment.avgSAS ? '+' : ''}${(cohort.assessment.avgSAS - targetCohort.assessment.avgSAS).toFixed(1)})
- Demographics: ${cohort.demographics.fsmPercentage}% FSM, ${cohort.demographics.ealPercentage}% EAL, ${cohort.demographics.sendPercentage}% SEND
- Top performing domains: ${cohort.assessment.skillDomainScores.sort((a, b) => b.score - a.score).slice(0, 3).map(s => `${s.domain} ${s.score}%`).join(', ')}
`).join('\n')}

# SIGNIFICANT OUTLIERS (Skill-Level Gaps)
${outliers.map(o =>
  `- ${o.domain} > ${o.skill}: ${o.gap > 0 ? '+' : ''}${o.gap}% (effect size: ${o.effectSize.toFixed(2)})`
).join('\n')}

# YOUR TASK
Generate 3-5 key insights for MAT leaders. For each insight:

1. **Identify the pattern** - What's the issue? Which schools? Which skills?
2. **Quantify the gap** - Specific numbers vs. MAT average or similar schools
3. **Identify root causes** - Is it a trend? Foundation gap? Specific misconception?
4. **Highlight peer learning** - Which schools are doing well? What can others learn?
5. **Provide recommendations** - Specific, actionable steps with target outcomes

Focus on:
- Trust-wide patterns (multiple schools with same issue)
- Schools declining rapidly (urgent attention)
- Opportunities to share best practice within the MAT
- Strategic resource allocation priorities

Output as JSON array with this structure:
{
  "insights": [
    {
      "severity": "critical" | "attention" | "positive",
      "type": "outlier" | "trend" | "peer_learning",
      "priority": 1-5,
      "title": "Brief headline",
      "summary": "One sentence summary",
      "detailedAnalysis": "Full explanation with context and data",
      "recommendations": [
        {
          "title": "Action title",
          "description": "What to do",
          "rationale": "Why this will help",
          "targetMetric": {
            "metric": "Specific metric name",
            "currentValue": 0,
            "targetValue": 0,
            "timeframe": "by when"
          },
          "peerExample": {
            "cohortName": "School name",
            "strategy": "What they're doing",
            "evidenceOfSuccess": "Their results"
          }
        }
      ]
    }
  ]
}`;
}

/**
 * Generate School-level insights prompt
 */
export function generateSchoolInsightsPrompt(context: PromptContext): string {
  const { targetCohort, similarCohorts, outliers, historicalTrends } = context;

  const avgComparison = similarCohorts.length > 0
    ? similarCohorts.reduce((sum, c) => sum + c.assessment.avgSAS, 0) / similarCohorts.length
    : null;

  return `Analyze assessment data for ${targetCohort.cohortName} (School-level view) and generate 3-5 key insights for school leaders.

# TARGET SCHOOL
Name: ${targetCohort.cohortName}
Year Group: ${targetCohort.assessment.cohortType}
Subject: ${targetCohort.assessment.assessmentId}

# DEMOGRAPHICS
- FSM: ${targetCohort.demographics.fsmPercentage}%
- EAL: ${targetCohort.demographics.ealPercentage}%
- SEND: ${targetCohort.demographics.sendPercentage}%
- Student Count: ${targetCohort.assessment.studentCount}

# PERFORMANCE
Overall:
- Average SAS: ${targetCohort.assessment.avgSAS}
- Average Percentage: ${targetCohort.assessment.avgPercentage}%
- Stanine: ${targetCohort.assessment.avgStanine}
${targetCohort.assessment.avgProgressMeasure ? `- Progress Measure: ${targetCohort.assessment.avgProgressMeasure}` : ''}

Skill Domains:
${targetCohort.assessment.skillDomainScores.map(s =>
  `- ${s.domain}: ${s.score}%
  └─ Skills: ${s.skillBreakdown.map(sb => `${sb.skill} ${sb.score}%`).join(', ')}`
).join('\n')}

${historicalTrends ? `
# TRENDS (Last 3 Assessments)
${historicalTrends.map(t =>
  `${t.date}: SAS ${t.avgSAS} | Key domains: ${t.skillDomainScores.slice(0, 3).map(s => `${s.domain} ${s.score}%`).join(', ')}`
).join('\n')}
` : ''}

# COMPARISON TO SIMILAR SCHOOLS
Average SAS of similar schools: ${avgComparison ? avgComparison.toFixed(1) : 'N/A'}
Your gap: ${avgComparison ? (targetCohort.assessment.avgSAS - avgComparison).toFixed(1) : 'N/A'}

Similar Schools (same demographics):
${similarCohorts.slice(0, 8).map(cohort => `
${cohort.cohortName} (similarity: ${(cohort.similarityScore * 100).toFixed(0)}%)
- SAS: ${cohort.assessment.avgSAS} (${cohort.assessment.avgSAS > targetCohort.assessment.avgSAS ? '+' : ''}${(cohort.assessment.avgSAS - targetCohort.assessment.avgSAS).toFixed(1)} vs. you)
- Demographics: ${cohort.demographics.fsmPercentage}% FSM, ${cohort.demographics.ealPercentage}% EAL
- Strong domains: ${cohort.assessment.skillDomainScores.sort((a, b) => b.score - a.score).slice(0, 2).map(s => `${s.domain} ${s.score}%`).join(', ')}
`).join('\n')}

# SIGNIFICANT SKILL GAPS
${outliers.map(o =>
  `${o.domain} → ${o.skill}
  Your score: ${o.gap < 0 ? targetCohort.assessment.skillDomainScores.find(s => s.domain === o.domain)?.score || 'N/A' : 'N/A'}%
  Gap: ${o.gap}% (effect size: ${o.effectSize.toFixed(2)})`
).join('\n\n')}

# YOUR TASK
Generate 3-5 key insights for school leaders. For each insight:

1. **Top Priority Identification** - What's the most critical gap?
2. **Skill Breakdown** - Which specific skills within a domain are weak?
3. **Foundation Analysis** - Are there prerequisite gaps? (e.g., "Y8 only scored 62% on basic fractions, now Y9 struggles with advanced fractions")
4. **Peer Learning** - Which similar school is doing well? What can you learn from them?
5. **Actionable Targets** - Specific, measurable targets (e.g., "Target: 68% on fractions by next assessment")

Output as JSON array matching this structure:
{
  "insights": [
    {
      "severity": "critical" | "attention" | "positive",
      "type": "skill_gap" | "misconception" | "peer_learning",
      "priority": 1-5,
      "title": "Brief headline (e.g., 'Year 9 Maths: -15% vs. similar schools')",
      "summary": "One sentence",
      "detailedAnalysis": "Full breakdown with skill-level detail, foundation gaps, and peer comparisons",
      "recommendations": [
        {
          "title": "Focus area",
          "description": "Specific intervention",
          "rationale": "Why/evidence",
          "targetMetric": {
            "metric": "Fractions domain score",
            "currentValue": 47,
            "targetValue": 68,
            "timeframe": "next assessment"
          },
          "peerExample": {
            "cohortName": "Valley Academy",
            "strategy": "What they do differently",
            "evidenceOfSuccess": "Their score: 82%"
          }
        }
      ]
    }
  ]
}`;
}

/**
 * Generate Student/Class-level insights prompt
 */
export function generateStudentInsightsPrompt(context: PromptContext): string {
  const { targetCohort, similarCohorts, outliers } = context;

  return `Analyze assessment data for a specific class/cohort and generate 3-5 key insights for teachers.

# TARGET CLASS
Class: ${targetCohort.cohortName}
Year Group: ${targetCohort.assessment.cohortType}
Student Count: ${targetCohort.assessment.studentCount}
Prior Attainment Mix: ${targetCohort.demographics.priorAttainment ?
  `Low ${targetCohort.demographics.priorAttainment.low}%, Mid ${targetCohort.demographics.priorAttainment.middle}%, High ${targetCohort.demographics.priorAttainment.high}%` : 'N/A'}

# PERFORMANCE
Overall: ${targetCohort.assessment.avgPercentage}%
Skill Domains:
${targetCohort.assessment.skillDomainScores.map(s =>
  `- ${s.domain}: ${s.score}%
    Skills: ${s.skillBreakdown.map(sb => `${sb.skill} ${sb.score}%`).join(', ')}`
).join('\n')}

# COMPARISON TO SIMILAR CLASSES
${similarCohorts.slice(0, 5).map(cohort => `
${cohort.cohortName}: ${cohort.assessment.avgPercentage}% overall
- Prior attainment: Similar mix
- Strong in: ${cohort.assessment.skillDomainScores.sort((a, b) => b.score - a.score).slice(0, 2).map(s => s.domain).join(', ')}
`).join('\n')}

# SKILL GAPS
${outliers.map(o =>
  `${o.domain} → ${o.skill}: ${o.gap}% gap (effect size: ${o.effectSize.toFixed(2)})`
).join('\n')}

# YOUR TASK
Generate 3-5 practical insights for teachers working with this class:

1. **Focus Groups** - Which students need targeted intervention? (e.g., "Prior Low Attainment group: 8 students, -18% vs. expected")
2. **Skill-Specific Gaps** - Not just "fractions is weak" - which fraction skills exactly?
3. **Misconception Detection** - What conceptual errors are students making?
4. **Foundation Check** - Do they have the prerequisite skills? (e.g., "Basic calculation is fine (62%), but fraction concepts missing")
5. **Practical Interventions** - Specific teaching strategies with expected outcomes

Focus on:
- Grouping strategies (who needs what)
- Specific misconceptions to address
- Visual/concrete approaches that work for similar groups
- Realistic targets for next assessment

Output as JSON matching this structure:
{
  "insights": [
    {
      "severity": "attention" | "critical",
      "type": "focus_group" | "misconception" | "skill_gap",
      "priority": 1-5,
      "title": "Focus group or skill area",
      "summary": "One sentence",
      "detailedAnalysis": "Breakdown with specific student groups, misconceptions, foundation skills",
      "recommendations": [
        {
          "title": "Intervention approach",
          "description": "Specific teaching strategy (e.g., 'Use visual models: bar models, pie charts')",
          "rationale": "Why this works for this group",
          "actionType": "focus_group" | "intervention",
          "targetMetric": {
            "metric": "Fraction items score",
            "currentValue": 28,
            "targetValue": 55,
            "timeframe": "next assessment"
          }
        }
      ]
    }
  ]
}`;
}

/**
 * Misconception analysis prompt
 */
export function generateMisconceptionPrompt(
  skill: string,
  studentErrors: string[],
  correctAnswer: string
): string {
  return `Analyze student errors for the skill "${skill}" and identify common misconceptions.

# CORRECT ANSWER
${correctAnswer}

# STUDENT ERRORS (sample)
${studentErrors.slice(0, 20).map((err, i) => `${i + 1}. ${err}`).join('\n')}

# YOUR TASK
Identify:
1. **Common error patterns** - What mistakes are students repeatedly making?
2. **Underlying misconception** - What conceptual misunderstanding causes this?
3. **Remediation approach** - How to address this misconception?

Output as JSON:
{
  "misconceptionType": "short_identifier",
  "description": "Clear explanation of the misconception",
  "errorPattern": "What students are doing wrong",
  "affectedPercentage": estimated percentage,
  "suggestedRemediation": "Teaching approach to fix this"
}`;
}
