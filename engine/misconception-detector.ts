/**
 * Misconception Detection Engine
 * Analyzes student error patterns to identify common conceptual misunderstandings
 */

import { StudentResponse, AssessmentItem } from '../models/assessment-data';
import { MisconductionPattern } from '../models/insights';

export interface ErrorPattern {
  itemId: string;
  skill: string;
  contentDomain: string;
  correctAnswer: string;
  incorrectResponses: Array<{
    response: string;
    frequency: number;
    studentIds: string[];
  }>;
}

export interface MisconceptionAnalysis {
  misconception: MisconductionPattern;
  confidence: number;  // 0-1, how confident we are this is a real misconception
  recommendedIntervention: string;
}

/**
 * Group student responses by item to identify error patterns
 */
export function groupResponsesByItem(
  responses: StudentResponse[],
  items: AssessmentItem[]
): ErrorPattern[] {
  const errorPatterns: ErrorPattern[] = [];

  // Group by itemId
  const itemGroups = new Map<string, StudentResponse[]>();
  responses.forEach(response => {
    if (!response.isCorrect && response.responseText) {
      const group = itemGroups.get(response.itemId) || [];
      group.push(response);
      itemGroups.set(response.itemId, group);
    }
  });

  // Analyze each item's errors
  itemGroups.forEach((itemResponses, itemId) => {
    const item = items.find(i => i.itemId === itemId);
    if (!item) return;

    // Count frequency of each incorrect response
    const responseCounts = new Map<string, { count: number; studentIds: string[] }>();
    itemResponses.forEach(resp => {
      if (resp.responseText) {
        const existing = responseCounts.get(resp.responseText) || { count: 0, studentIds: [] };
        existing.count++;
        existing.studentIds.push(resp.studentId);
        responseCounts.set(resp.responseText, existing);
      }
    });

    // Create error pattern
    const incorrectResponses = Array.from(responseCounts.entries())
      .map(([response, data]) => ({
        response,
        frequency: data.count,
        studentIds: data.studentIds,
      }))
      .sort((a, b) => b.frequency - a.frequency);

    errorPatterns.push({
      itemId,
      skill: item.skillTags[0] || 'Unknown',
      contentDomain: item.contentDomain,
      correctAnswer: '', // Would come from item data
      incorrectResponses,
    });
  });

  return errorPatterns;
}

/**
 * Detect common misconceptions from error patterns
 */
export function detectMisconceptions(
  errorPatterns: ErrorPattern[],
  minAffectedPercentage: number = 20
): MisconceptionAnalysis[] {
  const misconceptions: MisconceptionAnalysis[] = [];

  errorPatterns.forEach(pattern => {
    // Check if any error appears frequently (systematic error)
    const totalErrors = pattern.incorrectResponses.reduce((sum, r) => sum + r.frequency, 0);

    pattern.incorrectResponses.forEach(errorResponse => {
      const affectedPercentage = (errorResponse.frequency / totalErrors) * 100;

      if (affectedPercentage >= minAffectedPercentage) {
        // This is a common error - likely a misconception
        const misconception = identifyMisconception(
          pattern.skill,
          pattern.contentDomain,
          errorResponse.response,
          pattern.correctAnswer
        );

        misconceptions.push({
          misconception: {
            skill: pattern.skill,
            contentDomain: pattern.contentDomain,
            misconceptionType: misconception.type,
            description: misconception.description,
            affectedStudents: errorResponse.studentIds.length,
            affectedPercentage,
            exampleErrors: [errorResponse.response],
            scoreImpact: 0, // Would need to calculate
            suggestedApproach: misconception.intervention,
          },
          confidence: calculateConfidence(affectedPercentage, errorResponse.frequency),
          recommendedIntervention: misconception.intervention,
        });
      }
    });
  });

  return misconceptions;
}

/**
 * Identify the type of misconception based on the error
 */
function identifyMisconception(
  skill: string,
  domain: string,
  incorrectAnswer: string,
  correctAnswer: string
): { type: string; description: string; intervention: string } {
  // Common fraction misconceptions
  if (domain.toLowerCase().includes('fraction')) {
    if (skill.includes('equivalent') || skill.includes('comparing')) {
      return {
        type: 'larger_denominator_larger_fraction',
        description: 'Students believe that a larger denominator means a larger fraction (e.g., thinking 1/8 > 1/4)',
        intervention: 'Use visual models (fraction walls, circles) to show that more pieces means smaller pieces. Focus on "same whole" concept.',
      };
    }

    if (skill.includes('adding') || skill.includes('operations')) {
      return {
        type: 'add_denominators',
        description: 'Students add numerators AND denominators (e.g., 1/4 + 1/4 = 2/8 instead of 2/4)',
        intervention: 'Use visual models to show that quarters + quarters = quarters. Emphasize "same-sized pieces" concept.',
      };
    }

    if (skill.includes('decimal')) {
      return {
        type: 'decimal_place_value_confusion',
        description: 'Students confuse tenths and hundredths when converting (e.g., 0.45 = 45/10 instead of 45/100)',
        intervention: 'Use place value charts extended to decimal places. Link to money (£0.45 = 45p = 45/100 of a pound).',
      };
    }
  }

  // Multiplication misconceptions
  if (domain.toLowerCase().includes('multiplication')) {
    if (skill.includes('by 10') || skill.includes('by 100')) {
      return {
        type: 'just_add_zeros',
        description: 'Students think "multiply by 10 means add a zero" without understanding place value shifts',
        intervention: 'Use place value charts to show digits moving left. Emphasize it doesn\'t work with decimals.',
      };
    }

    if (skill.includes('times tables') || skill.includes('recall')) {
      return {
        type: 'confusion_similar_facts',
        description: 'Students confuse similar multiplication facts (e.g., 6×7 and 6×8, or 7×8 and 8×8)',
        intervention: 'Use pattern recognition and derived facts (e.g., 6×8 = 6×7 + 6). Targeted practice on commonly confused facts.',
      };
    }
  }

  // Place value misconceptions
  if (domain.toLowerCase().includes('place value')) {
    if (skill.includes('reading') || skill.includes('writing')) {
      return {
        type: 'reading_numbers_incorrectly',
        description: 'Students read large numbers as if they were smaller (e.g., 1,304 as "one hundred and thirty-four")',
        intervention: 'Use place value charts with clear headings. Practice partitioning (1,304 = 1,000 + 300 + 4).',
      };
    }
  }

  // Generic fallback
  return {
    type: 'conceptual_misunderstanding',
    description: `Students show a pattern of errors in ${skill} indicating incomplete conceptual understanding`,
    intervention: 'Re-teach the concept using concrete materials and visual models. Check prerequisite understanding.',
  };
}

/**
 * Calculate confidence that this is a genuine misconception
 */
function calculateConfidence(affectedPercentage: number, frequency: number): number {
  // Higher percentage and higher frequency = higher confidence
  let confidence = 0;

  // Percentage component (0-0.6)
  if (affectedPercentage >= 50) confidence += 0.6;
  else if (affectedPercentage >= 40) confidence += 0.5;
  else if (affectedPercentage >= 30) confidence += 0.4;
  else if (affectedPercentage >= 20) confidence += 0.3;

  // Frequency component (0-0.4)
  if (frequency >= 20) confidence += 0.4;
  else if (frequency >= 15) confidence += 0.3;
  else if (frequency >= 10) confidence += 0.2;
  else if (frequency >= 5) confidence += 0.1;

  return Math.min(confidence, 1.0);
}

/**
 * Common fraction misconceptions library
 */
export const FRACTION_MISCONCEPTIONS = [
  {
    type: 'larger_denominator_larger_fraction',
    description: 'Believing larger denominator = larger fraction',
    symptoms: ['Choosing 1/8 > 1/4', 'Ordering fractions incorrectly'],
    intervention: 'Fraction walls, visual models, real-world contexts (sharing pizza)',
    prerequisite: 'Understanding that fractions represent parts of a whole',
  },
  {
    type: 'add_denominators',
    description: 'Adding numerators AND denominators',
    symptoms: ['1/4 + 1/4 = 2/8', 'Not recognizing same-sized pieces'],
    intervention: 'Visual addition with models, emphasize "quarters + quarters = quarters"',
    prerequisite: 'Equivalent fractions understanding',
  },
  {
    type: 'multiply_straight_across_always',
    description: 'Multiplying numerators and denominators for all operations',
    symptoms: ['Trying to multiply denominators when adding', 'Over-applying multiplication rule'],
    intervention: 'Clear distinction between operations, visual models for each',
    prerequisite: 'Understanding when to use common denominators',
  },
  {
    type: 'fraction_equals_division_confusion',
    description: 'Not understanding that 3/4 means 3 ÷ 4',
    symptoms: ['Difficulty with fraction to decimal conversion', 'Word problem struggles'],
    intervention: 'Explicit teaching of fraction as division, use calculators to verify',
    prerequisite: 'Division fluency',
  },
];

/**
 * Common multiplication misconceptions library
 */
export const MULTIPLICATION_MISCONCEPTIONS = [
  {
    type: 'multiply_makes_bigger',
    description: 'Believing multiplication always makes numbers bigger',
    symptoms: ['Surprise when 0.5 × 10 = 5', 'Confusion with fractions/decimals'],
    intervention: 'Use contexts: "half of 10", "quarter of 20". Show scaling both ways.',
    prerequisite: 'Understanding multiplication as scaling',
  },
  {
    type: 'just_add_zero',
    description: 'Multiply by 10/100 means "add zeros"',
    symptoms: ['4.5 × 10 = 4.50 or 45.0', 'Place value errors'],
    intervention: 'Place value charts showing digit movement. Test with decimals.',
    prerequisite: 'Place value understanding',
  },
  {
    type: 'times_tables_no_application',
    description: 'Can recite tables but can\'t apply in context',
    symptoms: ['6×7=42 but can\'t solve "6 groups of 7"', 'Word problem difficulties'],
    intervention: 'Varied problem types, bar models, real-world applications',
    prerequisite: 'Understanding multiplication as repeated addition/grouping',
  },
];

/**
 * Generate a misconception report for a cohort
 */
export function generateMisconceptionReport(
  misconceptions: MisconceptionAnalysis[]
): {
  summary: string;
  topMisconceptions: MisconceptionAnalysis[];
  interventionPriorities: string[];
} {
  // Sort by confidence and affected percentage
  const sorted = [...misconceptions].sort((a, b) => {
    const scoreA = a.confidence * a.misconception.affectedPercentage;
    const scoreB = b.confidence * b.misconception.affectedPercentage;
    return scoreB - scoreA;
  });

  const top = sorted.slice(0, 5);

  // Generate intervention priorities
  const interventions = top
    .filter(m => m.confidence > 0.6) // High confidence only
    .map(m => `${m.misconception.contentDomain} - ${m.misconception.skill}: ${m.recommendedIntervention}`);

  const summary = `Detected ${misconceptions.length} potential misconceptions affecting ${
    misconceptions.reduce((sum, m) => sum + m.misconception.affectedStudents, 0)
  } students. Top priority: ${top[0]?.misconception.description || 'None identified'}`;

  return {
    summary,
    topMisconceptions: top,
    interventionPriorities: interventions,
  };
}
