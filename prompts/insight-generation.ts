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

Your role is to analyze performance data, identify improvement opportunities, and generate clear, actionable insights that help educators improve student outcomes.

Key principles:
1. **Always generate recommendations** - Even high-performing schools have areas for improvement. Focus on continuous growth, maintaining strengths, and marginal gains
2. **Skill-level granularity** - CRITICAL: Every insight must be about specific skills, not broad domains. Don't say "maths is low" - identify exactly which calculation skills, fraction concepts, or problem-solving strategies need attention
3. **Fair comparisons** - Always compare cohorts with similar demographics (FSM%, EAL%, SEND%)
4. **Actionable recommendations** - Every insight must include specific, practical next steps teachers can implement
5. **Peer learning focus** - Highlight what's working within the MAT so schools can learn from each other
6. **Foundation gaps** - Identify prerequisite skill deficits that compound over time
7. **Continuous improvement mindset** - For high performers: identify next-level stretch goals. For low performers: prioritize foundational recovery

Output format:
- Use clear, direct language suitable for busy school leaders
- Include specific numbers and targets
- Highlight peer examples when high performers exist
- Suggest concrete interventions with expected outcomes
- Rank insights by urgency and impact
- ALWAYS generate 3-5 skill-level insights, regardless of overall performance`;

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
Generate 3-5 key insights for MAT leaders. CRITICAL: Focus on SKILL-LEVEL patterns across schools.

**Always analyze**:
- Which SPECIFIC SKILLS (not just domains) show variation across schools
- Where consistent weak areas exist trust-wide
- Which schools excel at specific skills others struggle with
- Opportunities for peer-to-peer learning on specific teaching approaches

For each insight:

1. **Skill-Level Pattern** - Which SPECIFIC SKILLS show issues? (e.g., "5 schools underperform on fraction division", not "maths is weak")
2. **Quantify the gap** - Specific numbers vs. MAT average for that skill
3. **Identify root causes** - Is it curriculum sequencing? Teaching approach? Assessment timing?
4. **Highlight peer learning** - Which schools excel at this specific skill? What's their approach?
5. **Provide recommendations** - Concrete interventions with target outcomes

Focus on:
- Trust-wide skill-level patterns (multiple schools with same specific skill gap)
- Schools declining rapidly on specific skills (urgent attention)
- Opportunities to share best practice within the MAT on specific teaching strategies
- Strategic resource allocation for specific curriculum areas

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
Generate 3-5 key insights for school leaders. CRITICAL: Always generate skill-level insights regardless of overall performance.

**For high-performing schools**: Focus on:
- Relative weaknesses (even if not statistically significant)
- Stretch goals for strongest areas
- Maintaining excellence strategies
- Skills where peers slightly outperform
- Next-level mastery opportunities

**For all schools**, each insight must include:

1. **Skill-Level Focus** - NEVER generic domain-level only. Identify SPECIFIC skills (e.g., "multiplying fractions", "calculating perimeter", "interpreting graphs")
2. **Foundation Analysis** - Are there prerequisite gaps? (e.g., "Y8 only scored 62% on basic fractions, now Y9 struggles with advanced fractions")
3. **Peer Learning** - Which similar school is doing well? What can you learn from them?
4. **Actionable Targets** - Specific, measurable targets (e.g., "Target: 68% on multiplying fractions by next assessment")
5. **Practical Interventions** - Concrete teaching strategies, not vague advice

**IMPORTANT**: Output VALID JSON only. Ensure all strings are properly quoted, all commas are in place, and all brackets/braces are closed. Keep detailedAnalysis concise (max 300 words) to ensure valid JSON structure.

Output as JSON array matching this structure:
{
  "insights": [
    {
      "severity": "critical" | "attention" | "positive",
      "type": "skill_gap" | "misconception" | "peer_learning",
      "priority": 1-5,
      "title": "Brief headline (e.g., 'Year 9 Maths: -15% vs. similar schools')",
      "summary": "One sentence",
      "detailedAnalysis": "Full breakdown with skill-level detail, foundation gaps, and peer comparisons (max 300 words)",
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
Generate 3-5 practical, skill-level insights for teachers working with this class.

CRITICAL: Every insight must identify SPECIFIC SKILLS and SPECIFIC STUDENTS/GROUPS.

For each insight:

1. **Skill-Specific Focus** - Name the exact skill (e.g., "converting improper fractions to mixed numbers", not "fractions")
2. **Student Groups** - Which students? Foundation group? Prior low attainment? Specific names if available
3. **Misconception Detection** - What SPECIFIC conceptual errors are students making? (e.g., "students adding numerators AND denominators")
4. **Foundation Check** - Do they have prerequisite skills? (e.g., "Basic calculation is fine (62%), but fraction equivalence missing")
5. **Practical Interventions** - Specific teaching strategies (e.g., "use bar models for visual representation", "practice with concrete manipulatives")

Focus on:
- Actionable grouping strategies with student names/counts
- Specific misconceptions to address in next lesson
- Visual/concrete approaches that work
- Realistic skill-level targets for next assessment

Always generate insights even if class is high-performing - focus on stretch goals and maintaining excellence.

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
