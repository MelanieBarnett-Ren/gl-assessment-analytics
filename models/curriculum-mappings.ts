/**
 * UK National Curriculum mapping data structures
 */

export type KeyStage = 'KS1' | 'KS2' | 'KS3' | 'KS4';
export type YearGroup = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface CurriculumObjective {
  objectiveId: string;           // e.g., "Y5-F3"
  keyStage: KeyStage;
  yearGroup: YearGroup;
  domain: string;                // e.g., "Number - fractions"
  subdomain?: string;            // e.g., "Equivalent fractions"

  // The actual curriculum statement
  statement: string;

  // Relationships
  prerequisiteObjectives: string[];   // Must master before this
  followsFromObjectives: string[];    // Builds on these
  leadsToObjectives: string[];        // Prepares for these
  relatedObjectives: string[];        // Same domain, parallel learning

  // Expected outcomes
  expectedMastery: {
    passRate: number;            // % of students expected to achieve (e.g., 75)
    byEndOfYear: YearGroup;
  };

  // Common issues
  commonMisconceptions?: string[];
  typicalErrors?: string[];
  interventionStrategies?: string[];
}

export interface DomainProgression {
  domain: string;
  keyStage: KeyStage;

  // Objectives in order of progression
  objectives: CurriculumObjective[];

  // Key milestones within domain
  milestones: Array<{
    yearGroup: YearGroup;
    milestone: string;
    criticalObjectives: string[];  // Must be secure before progressing
  }>;
}

export interface CurriculumMapping {
  itemId: string;                // Assessment item ID

  // Primary objective(s) being assessed
  primaryObjectives: string[];   // objectiveIds

  // Secondary objectives (also required)
  secondaryObjectives?: string[];

  // Difficulty relative to year group
  difficulty: 'below' | 'at' | 'above' | 'exceeding';  // Relative to target year

  // What prerequisite knowledge is required
  prerequisites: Array<{
    objectiveId: string;
    essential: boolean;          // Must have this vs. helpful to have
  }>;
}

// ============================================================================
// SAMPLE DATA: KS2 MULTIPLICATION & DIVISION PROGRESSION
// ============================================================================

export const KS2_MULTIPLICATION_PROGRESSION: DomainProgression = {
  domain: "Number - multiplication and division",
  keyStage: "KS2",
  objectives: [
    // YEAR 3
    {
      objectiveId: "Y3-MD1",
      keyStage: "KS2",
      yearGroup: 3,
      domain: "Number - multiplication and division",
      statement: "Recall and use multiplication and division facts for the 3, 4 and 8 multiplication tables",
      prerequisiteObjectives: ["Y2-MD1", "Y2-MD2"],  // 2, 5, 10 tables
      followsFromObjectives: ["Y2-MD1", "Y2-MD2"],
      leadsToObjectives: ["Y4-MD1"],
      relatedObjectives: ["Y3-MD2"],
      expectedMastery: {
        passRate: 80,
        byEndOfYear: 3,
      },
      commonMisconceptions: [
        "Confusing 3× and 4× tables",
        "Difficulty with 8× table without secure 2× and 4×",
      ],
      interventionStrategies: [
        "Use doubling patterns (4× = double 2×, 8× = double 4×)",
        "Visual arrays and grouping",
        "Regular distributed practice (little and often)",
      ],
    },
    {
      objectiveId: "Y3-MD2",
      keyStage: "KS2",
      yearGroup: 3,
      domain: "Number - multiplication and division",
      statement: "Write and calculate mathematical statements for multiplication and division using the multiplication tables, including for two-digit numbers times one-digit numbers, using mental and progressing to formal written methods",
      prerequisiteObjectives: ["Y3-MD1", "Y2-NPV1"],
      followsFromObjectives: ["Y3-MD1"],
      leadsToObjectives: ["Y4-MD2"],
      relatedObjectives: ["Y3-MD1"],
      expectedMastery: {
        passRate: 75,
        byEndOfYear: 3,
      },
      commonMisconceptions: [
        "Applying tables facts but not understanding multiplication as repeated addition",
        "Difficulty with larger × smaller vs. smaller × larger",
      ],
      interventionStrategies: [
        "Bar models and part-whole diagrams",
        "Concrete materials (arrays, grouping)",
        "Real-world contexts",
      ],
    },

    // YEAR 4
    {
      objectiveId: "Y4-MD1",
      keyStage: "KS2",
      yearGroup: 4,
      domain: "Number - multiplication and division",
      statement: "Recall multiplication and division facts for multiplication tables up to 12 × 12",
      prerequisiteObjectives: ["Y3-MD1"],
      followsFromObjectives: ["Y3-MD1"],
      leadsToObjectives: ["Y5-MD1", "Y6-MD1"],
      relatedObjectives: ["Y4-MD2"],
      expectedMastery: {
        passRate: 85,  // High expectations - this is the MTC baseline
        byEndOfYear: 4,
      },
      commonMisconceptions: [
        "Weakest on 6, 7, 8, 9 tables",
        "Can recite but can't apply in context",
        "Slow recall (>3 seconds) indicates not automatic",
      ],
      typicalErrors: [
        "6×7=42 often confused with 6×8=48",
        "7×8=56 frequently recalled incorrectly",
        "9× table errors if not using finger trick or subtract-from-10× strategy",
      ],
      interventionStrategies: [
        "Times Tables Rock Stars / other gamified practice",
        "Pattern recognition (9× = 10× minus 1×)",
        "Targeted practice on weakest facts",
        "Mixed practice to ensure retention",
        "Apply in varied contexts (not just rote)",
      ],
    },
    {
      objectiveId: "Y4-MD2",
      keyStage: "KS2",
      yearGroup: 4,
      domain: "Number - multiplication and division",
      statement: "Use place value, known and derived facts to multiply and divide mentally, including: multiplying by 0 and 1; dividing by 1; multiplying together three numbers",
      prerequisiteObjectives: ["Y4-MD1", "Y3-NPV1"],
      followsFromObjectives: ["Y4-MD1", "Y3-MD2"],
      leadsToObjectives: ["Y5-MD2"],
      relatedObjectives: ["Y4-MD1"],
      expectedMastery: {
        passRate: 75,
        byEndOfYear: 4,
      },
      commonMisconceptions: [
        "Not understanding ×0 = 0",
        "Confusion with ×1 and +1",
        "Difficulty decomposing numbers for mental calculation",
      ],
      interventionStrategies: [
        "Partitioning strategies (23×4 = 20×4 + 3×4)",
        "Using known facts to derive (15×4 = 10×4 + 5×4)",
      ],
    },

    // YEAR 5
    {
      objectiveId: "Y5-MD1",
      keyStage: "KS2",
      yearGroup: 5,
      domain: "Number - multiplication and division",
      statement: "Identify multiples and factors, including finding all factor pairs of a number, and common factors of two numbers",
      prerequisiteObjectives: ["Y4-MD1"],
      followsFromObjectives: ["Y4-MD1"],
      leadsToObjectives: ["Y6-F1"],  // Leads to simplifying fractions
      relatedObjectives: ["Y5-MD2"],
      expectedMastery: {
        passRate: 75,
        byEndOfYear: 5,
      },
      commonMisconceptions: [
        "Confusing multiples and factors",
        "Missing factor pairs (e.g., forgetting 1 and the number itself)",
      ],
      interventionStrategies: [
        "Visual factor rainbow diagrams",
        "Systematic listing strategies",
      ],
    },
    {
      objectiveId: "Y5-MD2",
      keyStage: "KS2",
      yearGroup: 5,
      domain: "Number - multiplication and division",
      statement: "Multiply numbers up to 4 digits by a one- or two-digit number using a formal written method, including long multiplication for two-digit numbers",
      prerequisiteObjectives: ["Y4-MD1", "Y4-MD2"],
      followsFromObjectives: ["Y4-MD2"],
      leadsToObjectives: ["Y6-MD1"],
      relatedObjectives: ["Y5-MD1"],
      expectedMastery: {
        passRate: 70,
        byEndOfYear: 5,
      },
      commonMisconceptions: [
        "Place value errors in column multiplication",
        "Forgetting to add the carried digit",
        "Not placing second row correctly in long multiplication",
      ],
      interventionStrategies: [
        "Grid method before column method",
        "Clear place value headings",
        "Use of place value counters",
      ],
    },
    {
      objectiveId: "Y5-MD3",
      keyStage: "KS2",
      yearGroup: 5,
      domain: "Number - multiplication and division",
      statement: "Multiply and divide numbers mentally drawing upon known facts",
      prerequisiteObjectives: ["Y4-MD1", "Y4-MD2"],
      followsFromObjectives: ["Y4-MD2"],
      leadsToObjectives: ["Y6-MD1"],
      relatedObjectives: ["Y5-MD2"],
      expectedMastery: {
        passRate: 75,
        byEndOfYear: 5,
      },
    },
    {
      objectiveId: "Y5-MD4",
      keyStage: "KS2",
      yearGroup: 5,
      domain: "Number - multiplication and division",
      statement: "Multiply and divide whole numbers and those involving decimals by 10, 100 and 1000",
      prerequisiteObjectives: ["Y4-MD1", "Y4-NPV1"],
      followsFromObjectives: ["Y4-MD2"],
      leadsToObjectives: ["Y6-MD2"],
      relatedObjectives: ["Y5-D1"],
      expectedMastery: {
        passRate: 80,
        byEndOfYear: 5,
      },
      commonMisconceptions: [
        "Just 'adding zeros' without understanding place value shifts",
        "Confusion with decimal point movement",
      ],
      interventionStrategies: [
        "Place value charts showing digit movement",
        "Emphasize 'digits move, not decimal point'",
      ],
    },

    // YEAR 6
    {
      objectiveId: "Y6-MD1",
      keyStage: "KS2",
      yearGroup: 6,
      domain: "Number - multiplication and division",
      statement: "Multiply multi-digit numbers up to 4 digits by a two-digit whole number using the formal written method of long multiplication",
      prerequisiteObjectives: ["Y5-MD2"],
      followsFromObjectives: ["Y5-MD2"],
      leadsToObjectives: [],  // End of KS2
      relatedObjectives: ["Y6-MD2"],
      expectedMastery: {
        passRate: 75,
        byEndOfYear: 6,
      },
    },
    {
      objectiveId: "Y6-MD2",
      keyStage: "KS2",
      yearGroup: 6,
      domain: "Number - multiplication and division",
      statement: "Perform mental calculations, including with mixed operations and large numbers",
      prerequisiteObjectives: ["Y5-MD3", "Y4-MD1"],
      followsFromObjectives: ["Y5-MD3"],
      leadsToObjectives: [],
      relatedObjectives: ["Y6-MD1"],
      expectedMastery: {
        passRate: 75,
        byEndOfYear: 6,
      },
      commonMisconceptions: [
        "Applying BIDMAS/BODMAS incorrectly",
        "Difficulty estimating to check reasonableness",
      ],
      interventionStrategies: [
        "Teach estimation first (e.g., 'about 300')",
        "Break down mixed operations step-by-step",
      ],
    },
  ],

  milestones: [
    {
      yearGroup: 3,
      milestone: "Secure recall of 2, 3, 4, 5, 8, 10 times tables",
      criticalObjectives: ["Y3-MD1"],
    },
    {
      yearGroup: 4,
      milestone: "Full recall of all times tables up to 12×12 (MTC baseline)",
      criticalObjectives: ["Y4-MD1"],
    },
    {
      yearGroup: 5,
      milestone: "Formal written methods for multiplication, understanding of factors/multiples",
      criticalObjectives: ["Y5-MD1", "Y5-MD2"],
    },
    {
      yearGroup: 6,
      milestone: "Fluent mental and written calculation, ready for KS3 algebra",
      criticalObjectives: ["Y6-MD1", "Y6-MD2"],
    },
  ],
};

// ============================================================================
// SAMPLE DATA: KS2 FRACTIONS PROGRESSION
// ============================================================================

export const KS2_FRACTIONS_PROGRESSION: DomainProgression = {
  domain: "Number - fractions (including decimals and percentages)",
  keyStage: "KS2",
  objectives: [
    // YEAR 3
    {
      objectiveId: "Y3-F1",
      keyStage: "KS2",
      yearGroup: 3,
      domain: "Number - fractions",
      statement: "Recognise, find and write fractions of a discrete set of objects: unit fractions and non-unit fractions with small denominators",
      prerequisiteObjectives: ["Y2-F1"],
      followsFromObjectives: ["Y2-F1"],
      leadsToObjectives: ["Y4-F1"],
      relatedObjectives: ["Y3-F2"],
      expectedMastery: {
        passRate: 75,
        byEndOfYear: 3,
      },
      commonMisconceptions: [
        "Believing larger denominator = larger fraction",
        "Not understanding fraction as 'parts of a whole'",
      ],
      interventionStrategies: [
        "Concrete materials (fraction walls, circles)",
        "Bar models",
        "Real-world contexts (sharing pizza, chocolate)",
      ],
    },

    // YEAR 4
    {
      objectiveId: "Y4-F1",
      keyStage: "KS2",
      yearGroup: 4,
      domain: "Number - fractions",
      statement: "Recognise and show, using diagrams, families of common equivalent fractions",
      prerequisiteObjectives: ["Y3-F1"],
      followsFromObjectives: ["Y3-F1"],
      leadsToObjectives: ["Y5-F1", "Y6-F1"],
      relatedObjectives: ["Y4-F2"],
      expectedMastery: {
        passRate: 80,
        byEndOfYear: 4,
      },
      commonMisconceptions: [
        "Not understanding equivalent fractions represent same value",
        "Difficulty finding equivalent fractions without visual model",
      ],
      interventionStrategies: [
        "Fraction walls side-by-side comparison",
        "Folding paper models",
        "Number lines",
      ],
    },
    {
      objectiveId: "Y4-F2",
      keyStage: "KS2",
      yearGroup: 4,
      domain: "Number - fractions",
      statement: "Recognise and write decimal equivalents of any number of tenths or hundredths",
      prerequisiteObjectives: ["Y4-F1", "Y3-NPV1"],
      followsFromObjectives: ["Y4-F1"],
      leadsToObjectives: ["Y5-F3"],
      relatedObjectives: ["Y4-F1"],
      expectedMastery: {
        passRate: 75,
        byEndOfYear: 4,
      },
      commonMisconceptions: [
        "Writing 0.45 as 45/10 instead of 45/100",
        "Not understanding place value of decimal digits",
      ],
      interventionStrategies: [
        "Place value charts extended to tenths/hundredths",
        "Link to money (£0.45 = 45p)",
      ],
    },

    // YEAR 5
    {
      objectiveId: "Y5-F3",
      keyStage: "KS2",
      yearGroup: 5,
      domain: "Number - fractions",
      statement: "Read and write decimal numbers as fractions [for example, 0.71 = 71/100]",
      prerequisiteObjectives: ["Y4-F2"],
      followsFromObjectives: ["Y4-F2"],
      leadsToObjectives: ["Y6-F4"],
      relatedObjectives: ["Y5-F1"],
      expectedMastery: {
        passRate: 75,
        byEndOfYear: 5,
      },
      commonMisconceptions: [
        "Confusion between tenths and hundredths",
        "Not recognizing 0.5 as both 5/10 and 1/2",
      ],
      interventionStrategies: [
        "Place value grids",
        "Simplification practice",
      ],
    },

    // YEAR 6
    {
      objectiveId: "Y6-F1",
      keyStage: "KS2",
      yearGroup: 6,
      domain: "Number - fractions",
      statement: "Use common factors to simplify fractions; use common multiples to express fractions in the same denomination",
      prerequisiteObjectives: ["Y5-MD1", "Y4-F1"],
      followsFromObjectives: ["Y5-MD1"],
      leadsToObjectives: [],
      relatedObjectives: ["Y6-F2"],
      expectedMastery: {
        passRate: 75,
        byEndOfYear: 6,
      },
      commonMisconceptions: [
        "Not finding HCF, simplifying only partially",
        "Difficulty with LCM for common denominator",
      ],
      interventionStrategies: [
        "Link to Y5 factors work",
        "Step-by-step simplification",
      ],
    },
  ],

  milestones: [
    {
      yearGroup: 3,
      milestone: "Understand fractions as parts of a whole, unit fractions secure",
      criticalObjectives: ["Y3-F1"],
    },
    {
      yearGroup: 4,
      milestone: "Equivalent fractions and decimal/fraction links",
      criticalObjectives: ["Y4-F1", "Y4-F2"],
    },
    {
      yearGroup: 5,
      milestone: "Add/subtract fractions, multiply by whole numbers",
      criticalObjectives: ["Y5-F1", "Y5-F3"],
    },
    {
      yearGroup: 6,
      milestone: "All four operations with fractions, fraction/decimal/percentage fluency",
      criticalObjectives: ["Y6-F1", "Y6-F4"],
    },
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all prerequisites for an objective (recursive, full chain)
 */
export function getPrerequisiteChain(
  objectiveId: string,
  allObjectives: CurriculumObjective[]
): CurriculumObjective[] {
  const visited = new Set<string>();
  const chain: CurriculumObjective[] = [];

  function traverse(id: string) {
    if (visited.has(id)) return;
    visited.add(id);

    const objective = allObjectives.find(o => o.objectiveId === id);
    if (!objective) return;

    chain.push(objective);

    objective.prerequisiteObjectives.forEach(preReqId => {
      traverse(preReqId);
    });
  }

  traverse(objectiveId);
  return chain;
}

/**
 * Check if student performance meets expected mastery for year group
 */
export function isOnTrackForYearGroup(
  studentScore: number,
  objective: CurriculumObjective,
  studentYearGroup: YearGroup
): boolean {
  if (studentYearGroup < objective.expectedMastery.byEndOfYear) {
    // Student is below the year where mastery is expected
    return true; // Not yet expected to master
  }

  return studentScore >= objective.expectedMastery.passRate;
}
