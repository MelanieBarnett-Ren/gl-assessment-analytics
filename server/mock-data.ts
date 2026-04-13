/**
 * Mock data for local development and testing
 */

import { CohortAssessment, Demographics, SkillDomainScore } from '../models/assessment-data';

export interface MockCohort {
  cohortId: string;
  cohortName: string;
  demographics: Demographics;
  assessment: CohortAssessment;
}

export function getMockData(): { cohorts: MockCohort[]; mat: { matId: string; matName: string; schoolIds: string[] } } {
  return {
    // MAT Information
    mat: {
      matId: 'mat001',
      matName: 'Horizon Academy Trust',
      schoolIds: ['school1', 'school2', 'school3', 'school6', 'school7', 'school8', 'school9'],
    },

    cohorts: [
      // ====================================================================
      // HORIZON ACADEMY TRUST - 4 Anonymous Schools
      // ====================================================================

      // SCHOOL 6: "School A" - Declining rapidly, high deprivation
      {
        cohortId: 'school6',
        cohortName: 'School A', // Anonymous
        demographics: {
          cohortId: 'school6',
          cohortType: 'school',
          fsmPercentage: 52, // Very high FSM
          ealPercentage: 28,
          sendPercentage: 21,
          studentCount: 145,
        },
        assessment: {
          cohortId: 'school6',
          cohortType: 'school',
          assessmentId: 'assessment123',
          avgSAS: 92, // Below national average
          avgStanine: 3,
          avgPercentage: 55,
          studentCount: 145,
          scoreTrend: 'declining', // Getting worse
          skillDomainScores: [
            {
              domain: 'Number - multiplication and division',
              score: 48, // Critical gap
              itemsAttempted: 25,
              itemsCorrect: 12,
              skillBreakdown: [
                { skill: '3, 4, 8 times tables', score: 62 },
                { skill: 'Up to 12×12 recall', score: 42 }, // MTC baseline failure
                { skill: 'Mental calculation', score: 38 },
                { skill: 'Written methods', score: 50 },
              ],
            },
            {
              domain: 'Number - fractions',
              score: 41,
              itemsAttempted: 20,
              itemsCorrect: 8,
              skillBreakdown: [
                { skill: 'Equivalent fractions', score: 45 },
                { skill: 'Converting fractions to decimals', score: 32 },
                { skill: 'Fraction word problems', score: 38 },
                { skill: 'Simplifying fractions', score: 48 },
              ],
            },
            {
              domain: 'Number - place value',
              score: 62,
              itemsAttempted: 15,
              itemsCorrect: 9,
              skillBreakdown: [
                { skill: 'Reading large numbers', score: 65 },
                { skill: 'Ordering numbers', score: 58 },
                { skill: 'Rounding', score: 63 },
              ],
            },
            {
              domain: 'Measurement',
              score: 58,
              itemsAttempted: 12,
              itemsCorrect: 7,
              skillBreakdown: [
                { skill: 'Length/distance', score: 62 },
                { skill: 'Time', score: 54 },
                { skill: 'Money', score: 58 },
              ],
            },
          ],
        },
      },

      // SCHOOL 7: "School B" - Stable, average performance, medium deprivation
      {
        cohortId: 'school7',
        cohortName: 'School B', // Anonymous
        demographics: {
          cohortId: 'school7',
          cohortType: 'school',
          fsmPercentage: 32,
          ealPercentage: 14,
          sendPercentage: 15,
          studentCount: 198,
        },
        assessment: {
          cohortId: 'school7',
          cohortType: 'school',
          assessmentId: 'assessment123',
          avgSAS: 100, // National average
          avgStanine: 5,
          avgPercentage: 70,
          studentCount: 198,
          scoreTrend: 'stable',
          skillDomainScores: [
            {
              domain: 'Number - multiplication and division',
              score: 72,
              itemsAttempted: 25,
              itemsCorrect: 18,
              skillBreakdown: [
                { skill: '3, 4, 8 times tables', score: 80 },
                { skill: 'Up to 12×12 recall', score: 74 },
                { skill: 'Mental calculation', score: 66 },
                { skill: 'Written methods', score: 68 },
              ],
            },
            {
              domain: 'Number - fractions',
              score: 66,
              itemsAttempted: 20,
              itemsCorrect: 13,
              skillBreakdown: [
                { skill: 'Equivalent fractions', score: 70 },
                { skill: 'Converting fractions to decimals', score: 62 },
                { skill: 'Fraction word problems', score: 64 },
                { skill: 'Simplifying fractions', score: 68 },
              ],
            },
            {
              domain: 'Number - place value',
              score: 74,
              itemsAttempted: 15,
              itemsCorrect: 11,
              skillBreakdown: [
                { skill: 'Reading large numbers', score: 76 },
                { skill: 'Ordering numbers', score: 72 },
                { skill: 'Rounding', score: 74 },
              ],
            },
            {
              domain: 'Measurement',
              score: 71,
              itemsAttempted: 12,
              itemsCorrect: 8,
              skillBreakdown: [
                { skill: 'Length/distance', score: 74 },
                { skill: 'Time', score: 68 },
                { skill: 'Money', score: 71 },
              ],
            },
          ],
        },
      },

      // SCHOOL 8: "School C" - Improving rapidly, similar FSM to School A but much better
      {
        cohortId: 'school8',
        cohortName: 'School C', // Anonymous
        demographics: {
          cohortId: 'school8',
          cohortType: 'school',
          fsmPercentage: 48, // Similar to School A
          ealPercentage: 25,
          sendPercentage: 19,
          studentCount: 156,
        },
        assessment: {
          cohortId: 'school8',
          cohortType: 'school',
          assessmentId: 'assessment123',
          avgSAS: 105, // Well above School A despite similar demographics!
          avgStanine: 6,
          avgPercentage: 78,
          studentCount: 156,
          scoreTrend: 'improving', // Getting better
          skillDomainScores: [
            {
              domain: 'Number - multiplication and division',
              score: 82, // Strong - peer learning opportunity
              itemsAttempted: 25,
              itemsCorrect: 20,
              skillBreakdown: [
                { skill: '3, 4, 8 times tables', score: 88 },
                { skill: 'Up to 12×12 recall', score: 84 }, // Good MTC performance
                { skill: 'Mental calculation', score: 78 },
                { skill: 'Written methods', score: 76 },
              ],
            },
            {
              domain: 'Number - fractions',
              score: 76,
              itemsAttempted: 20,
              itemsCorrect: 15,
              skillBreakdown: [
                { skill: 'Equivalent fractions', score: 80 },
                { skill: 'Converting fractions to decimals', score: 72 },
                { skill: 'Fraction word problems', score: 74 },
                { skill: 'Simplifying fractions', score: 78 },
              ],
            },
            {
              domain: 'Number - place value',
              score: 80,
              itemsAttempted: 15,
              itemsCorrect: 12,
              skillBreakdown: [
                { skill: 'Reading large numbers', score: 82 },
                { skill: 'Ordering numbers', score: 78 },
                { skill: 'Rounding', score: 80 },
              ],
            },
            {
              domain: 'Measurement',
              score: 76,
              itemsAttempted: 12,
              itemsCorrect: 9,
              skillBreakdown: [
                { skill: 'Length/distance', score: 78 },
                { skill: 'Time', score: 74 },
                { skill: 'Money', score: 76 },
              ],
            },
          ],
        },
      },

      // SCHOOL 9: "School D" - Low deprivation, consistently high
      {
        cohortId: 'school9',
        cohortName: 'School D', // Anonymous
        demographics: {
          cohortId: 'school9',
          cohortType: 'school',
          fsmPercentage: 12,
          ealPercentage: 6,
          sendPercentage: 10,
          studentCount: 210,
        },
        assessment: {
          cohortId: 'school9',
          cohortType: 'school',
          assessmentId: 'assessment123',
          avgSAS: 110,
          avgStanine: 7,
          avgPercentage: 86,
          studentCount: 210,
          scoreTrend: 'stable',
          skillDomainScores: [
            {
              domain: 'Number - multiplication and division',
              score: 88,
              itemsAttempted: 25,
              itemsCorrect: 22,
              skillBreakdown: [
                { skill: '3, 4, 8 times tables', score: 94 },
                { skill: 'Up to 12×12 recall', score: 90 },
                { skill: 'Mental calculation', score: 85 },
                { skill: 'Written methods', score: 83 },
              ],
            },
            {
              domain: 'Number - fractions',
              score: 85,
              itemsAttempted: 20,
              itemsCorrect: 17,
              skillBreakdown: [
                { skill: 'Equivalent fractions', score: 88 },
                { skill: 'Converting fractions to decimals', score: 82 },
                { skill: 'Fraction word problems', score: 84 },
                { skill: 'Simplifying fractions', score: 86 },
              ],
            },
            {
              domain: 'Number - place value',
              score: 87,
              itemsAttempted: 15,
              itemsCorrect: 13,
              skillBreakdown: [
                { skill: 'Reading large numbers', score: 89 },
                { skill: 'Ordering numbers', score: 85 },
                { skill: 'Rounding', score: 87 },
              ],
            },
            {
              domain: 'Measurement',
              score: 84,
              itemsAttempted: 12,
              itemsCorrect: 10,
              skillBreakdown: [
                { skill: 'Length/distance', score: 86 },
                { skill: 'Time', score: 82 },
                { skill: 'Money', score: 84 },
              ],
            },
          ],
        },
      },

      // ====================================================================
      // ORIGINAL SAMPLE SCHOOLS (for comparison, not in MAT)
      // ====================================================================

      // SCHOOL 1: Oakwood Primary (Below average, high FSM)
      {
        cohortId: 'school1',
        cohortName: 'Oakwood Primary',
        demographics: {
          cohortId: 'school1',
          cohortType: 'school',
          fsmPercentage: 45,
          ealPercentage: 15,
          sendPercentage: 18,
          studentCount: 180,
        },
        assessment: {
          cohortId: 'school1',
          cohortType: 'school',
          assessmentId: 'assessment123',
          avgSAS: 96,
          avgStanine: 4,
          avgPercentage: 62,
          studentCount: 180,
          skillDomainScores: [
            {
              domain: 'Number - multiplication and division',
              score: 58,
              itemsAttempted: 25,
              itemsCorrect: 15,
              skillBreakdown: [
                { skill: '3, 4, 8 times tables', score: 72 },
                { skill: 'Up to 12×12 recall', score: 54 },
                { skill: 'Mental calculation', score: 48 },
                { skill: 'Written methods', score: 62 },
              ],
            },
            {
              domain: 'Number - fractions',
              score: 47,
              itemsAttempted: 20,
              itemsCorrect: 9,
              skillBreakdown: [
                { skill: 'Equivalent fractions', score: 52 },
                { skill: 'Converting fractions to decimals', score: 38 },
                { skill: 'Fraction word problems', score: 42 },
                { skill: 'Simplifying fractions', score: 55 },
              ],
            },
            {
              domain: 'Number - place value',
              score: 68,
              itemsAttempted: 15,
              itemsCorrect: 10,
              skillBreakdown: [
                { skill: 'Reading large numbers', score: 72 },
                { skill: 'Ordering numbers', score: 65 },
                { skill: 'Rounding', score: 67 },
              ],
            },
            {
              domain: 'Measurement',
              score: 71,
              itemsAttempted: 12,
              itemsCorrect: 8,
              skillBreakdown: [
                { skill: 'Length/distance', score: 75 },
                { skill: 'Time', score: 68 },
                { skill: 'Money', score: 70 },
              ],
            },
          ],
        },
      },

      // SCHOOL 2: Riverside Academy (Average, medium FSM)
      {
        cohortId: 'school2',
        cohortName: 'Riverside Academy',
        demographics: {
          cohortId: 'school2',
          cohortType: 'school',
          fsmPercentage: 28,
          ealPercentage: 12,
          sendPercentage: 14,
          studentCount: 210,
        },
        assessment: {
          cohortId: 'school2',
          cohortType: 'school',
          assessmentId: 'assessment123',
          avgSAS: 102,
          avgStanine: 5,
          avgPercentage: 72,
          studentCount: 210,
          skillDomainScores: [
            {
              domain: 'Number - multiplication and division',
              score: 74,
              itemsAttempted: 25,
              itemsCorrect: 18,
              skillBreakdown: [
                { skill: '3, 4, 8 times tables', score: 82 },
                { skill: 'Up to 12×12 recall', score: 76 },
                { skill: 'Mental calculation', score: 68 },
                { skill: 'Written methods', score: 72 },
              ],
            },
            {
              domain: 'Number - fractions',
              score: 68,
              itemsAttempted: 20,
              itemsCorrect: 13,
              skillBreakdown: [
                { skill: 'Equivalent fractions', score: 72 },
                { skill: 'Converting fractions to decimals', score: 65 },
                { skill: 'Fraction word problems', score: 64 },
                { skill: 'Simplifying fractions', score: 71 },
              ],
            },
            {
              domain: 'Number - place value',
              score: 76,
              itemsAttempted: 15,
              itemsCorrect: 11,
              skillBreakdown: [
                { skill: 'Reading large numbers', score: 78 },
                { skill: 'Ordering numbers', score: 74 },
                { skill: 'Rounding', score: 76 },
              ],
            },
            {
              domain: 'Measurement',
              score: 73,
              itemsAttempted: 12,
              itemsCorrect: 9,
              skillBreakdown: [
                { skill: 'Length/distance', score: 76 },
                { skill: 'Time', score: 70 },
                { skill: 'Money', score: 73 },
              ],
            },
          ],
        },
      },

      // SCHOOL 3: Valley School (High performing, similar FSM to School 1)
      {
        cohortId: 'school3',
        cohortName: 'Valley School',
        demographics: {
          cohortId: 'school3',
          cohortType: 'school',
          fsmPercentage: 42,
          ealPercentage: 18,
          sendPercentage: 16,
          studentCount: 165,
        },
        assessment: {
          cohortId: 'school3',
          cohortType: 'school',
          assessmentId: 'assessment123',
          avgSAS: 108,
          avgStanine: 6,
          avgPercentage: 82,
          studentCount: 165,
          skillDomainScores: [
            {
              domain: 'Number - multiplication and division',
              score: 85,
              itemsAttempted: 25,
              itemsCorrect: 21,
              skillBreakdown: [
                { skill: '3, 4, 8 times tables', score: 92 },
                { skill: 'Up to 12×12 recall', score: 88 },
                { skill: 'Mental calculation', score: 82 },
                { skill: 'Written methods', score: 78 },
              ],
            },
            {
              domain: 'Number - fractions',
              score: 82,
              itemsAttempted: 20,
              itemsCorrect: 16,
              skillBreakdown: [
                { skill: 'Equivalent fractions', score: 85 },
                { skill: 'Converting fractions to decimals', score: 78 },
                { skill: 'Fraction word problems', score: 80 },
                { skill: 'Simplifying fractions', score: 84 },
              ],
            },
            {
              domain: 'Number - place value',
              score: 84,
              itemsAttempted: 15,
              itemsCorrect: 13,
              skillBreakdown: [
                { skill: 'Reading large numbers', score: 86 },
                { skill: 'Ordering numbers', score: 82 },
                { skill: 'Rounding', score: 84 },
              ],
            },
            {
              domain: 'Measurement',
              score: 79,
              itemsAttempted: 12,
              itemsCorrect: 9,
              skillBreakdown: [
                { skill: 'Length/distance', score: 82 },
                { skill: 'Time', score: 76 },
                { skill: 'Money', score: 79 },
              ],
            },
          ],
        },
      },

      // SCHOOL 4: Hillside Primary (Low FSM, high performing)
      {
        cohortId: 'school4',
        cohortName: 'Hillside Primary',
        demographics: {
          cohortId: 'school4',
          cohortType: 'school',
          fsmPercentage: 8,
          ealPercentage: 5,
          sendPercentage: 9,
          studentCount: 195,
        },
        assessment: {
          cohortId: 'school4',
          cohortType: 'school',
          assessmentId: 'assessment123',
          avgSAS: 112,
          avgStanine: 7,
          avgPercentage: 88,
          studentCount: 195,
          skillDomainScores: [
            {
              domain: 'Number - multiplication and division',
              score: 90,
              itemsAttempted: 25,
              itemsCorrect: 22,
              skillBreakdown: [
                { skill: '3, 4, 8 times tables', score: 95 },
                { skill: 'Up to 12×12 recall', score: 92 },
                { skill: 'Mental calculation', score: 88 },
                { skill: 'Written methods', score: 85 },
              ],
            },
            {
              domain: 'Number - fractions',
              score: 87,
              itemsAttempted: 20,
              itemsCorrect: 17,
              skillBreakdown: [
                { skill: 'Equivalent fractions', score: 90 },
                { skill: 'Converting fractions to decimals', score: 85 },
                { skill: 'Fraction word problems', score: 84 },
                { skill: 'Simplifying fractions', score: 89 },
              ],
            },
            {
              domain: 'Number - place value',
              score: 89,
              itemsAttempted: 15,
              itemsCorrect: 13,
              skillBreakdown: [
                { skill: 'Reading large numbers', score: 91 },
                { skill: 'Ordering numbers', score: 88 },
                { skill: 'Rounding', score: 88 },
              ],
            },
            {
              domain: 'Measurement',
              score: 86,
              itemsAttempted: 12,
              itemsCorrect: 10,
              skillBreakdown: [
                { skill: 'Length/distance', score: 88 },
                { skill: 'Time', score: 84 },
                { skill: 'Money', score: 86 },
              ],
            },
          ],
        },
      },

      // SCHOOL 5: Meadow View (Medium FSM, mixed performance)
      {
        cohortId: 'school5',
        cohortName: 'Meadow View School',
        demographics: {
          cohortId: 'school5',
          cohortType: 'school',
          fsmPercentage: 35,
          ealPercentage: 22,
          sendPercentage: 15,
          studentCount: 172,
        },
        assessment: {
          cohortId: 'school5',
          cohortType: 'school',
          assessmentId: 'assessment123',
          avgSAS: 99,
          avgStanine: 5,
          avgPercentage: 68,
          studentCount: 172,
          skillDomainScores: [
            {
              domain: 'Number - multiplication and division',
              score: 70,
              itemsAttempted: 25,
              itemsCorrect: 17,
              skillBreakdown: [
                { skill: '3, 4, 8 times tables', score: 78 },
                { skill: 'Up to 12×12 recall', score: 68 },
                { skill: 'Mental calculation', score: 64 },
                { skill: 'Written methods', score: 70 },
              ],
            },
            {
              domain: 'Number - fractions',
              score: 64,
              itemsAttempted: 20,
              itemsCorrect: 12,
              skillBreakdown: [
                { skill: 'Equivalent fractions', score: 68 },
                { skill: 'Converting fractions to decimals', score: 58 },
                { skill: 'Fraction word problems', score: 62 },
                { skill: 'Simplifying fractions', score: 67 },
              ],
            },
            {
              domain: 'Number - place value',
              score: 72,
              itemsAttempted: 15,
              itemsCorrect: 11,
              skillBreakdown: [
                { skill: 'Reading large numbers', score: 75 },
                { skill: 'Ordering numbers', score: 70 },
                { skill: 'Rounding', score: 71 },
              ],
            },
            {
              domain: 'Measurement',
              score: 69,
              itemsAttempted: 12,
              itemsCorrect: 8,
              skillBreakdown: [
                { skill: 'Length/distance', score: 72 },
                { skill: 'Time', score: 66 },
                { skill: 'Money', score: 69 },
              ],
            },
          ],
        },
      },
    ],
  };
}
