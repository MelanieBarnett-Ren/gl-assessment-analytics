/**
 * GL Assessment Data - NGMT, PTM, CAT4
 * Real scoring systems from GL Assessment
 */

export interface GLAssessmentScore {
  sas: number;          // Standardized Age Score (mean 100, SD 15)
  stanine: number;      // 1-9 scale
  percentile: number;   // 1-99
}

// ============================================================================
// NGMT (New Group Mathematics Test) - Ages 7-14
// ============================================================================

export interface NGMTAssessment {
  assessmentId: string;
  schoolId: string;
  yearGroup: number;
  assessmentDate: Date;
  studentCount: number;

  // Overall score
  overall: GLAssessmentScore;

  // Skill domains (NGMT structure)
  domains: {
    number: {
      score: GLAssessmentScore;
      skills: {
        placeValue: number;           // % score
        fourOperations: number;
        fractionsDecimalsPercentages: number;
        ratio: number;
      };
    };
    algebra: {
      score: GLAssessmentScore;
      skills: {
        sequences: number;
        expressions: number;
        equations: number;
      };
    };
    shapeSpaceMeasures: {
      score: GLAssessmentScore;
      skills: {
        properties2D3D: number;
        positionDirection: number;
        measurement: number;
        perimeter: number;
      };
    };
    handlingData: {
      score: GLAssessmentScore;
      skills: {
        dataRepresentation: number;
        interpretation: number;
        probability: number;
      };
    };
  };
}

// ============================================================================
// PTM (Progress Test in Maths) - Termly Progress
// ============================================================================

export interface PTMAssessment {
  assessmentId: string;
  schoolId: string;
  yearGroup: number;
  term: 'autumn' | 'spring' | 'summer';
  assessmentDate: Date;
  studentCount: number;

  // Overall score
  overall: GLAssessmentScore;

  // Progress indicators
  progress: {
    expectedProgress: number;      // Expected SAS gain since last term
    actualProgress: number;        // Actual SAS gain
    progressIndicator: 'above' | 'expected' | 'below';
  };

  // Skill domains (PTM structure)
  domains: {
    number: {
      score: GLAssessmentScore;
      itemLevelData: Array<{
        itemId: string;
        skill: string;
        percentCorrect: number;
        nationalAverage: number;
      }>;
    };
    algebra: {
      score: GLAssessmentScore;
      itemLevelData: Array<{
        itemId: string;
        skill: string;
        percentCorrect: number;
        nationalAverage: number;
      }>;
    };
    shapeSpaceMeasures: {
      score: GLAssessmentScore;
      itemLevelData: Array<{
        itemId: string;
        skill: string;
        percentCorrect: number;
        nationalAverage: number;
      }>;
    };
    handlingData: {
      score: GLAssessmentScore;
      itemLevelData: Array<{
        itemId: string;
        skill: string;
        percentCorrect: number;
        nationalAverage: number;
      }>;
    };
  };
}

// ============================================================================
// CAT4 (Cognitive Abilities Test) - Baseline/Potential
// ============================================================================

export interface CAT4Assessment {
  assessmentId: string;
  schoolId: string;
  yearGroup: number;
  assessmentDate: Date;
  studentCount: number;

  // Overall mean CAT4 score
  meanCAT4: GLAssessmentScore;

  // Four batteries
  batteries: {
    verbal: {
      score: GLAssessmentScore;
      subtests: {
        verbalClassification: number;    // % correct
        verbalAnalogies: number;
      };
    };
    quantitative: {
      score: GLAssessmentScore;
      subtests: {
        numberAnalogies: number;
        numberSeries: number;
      };
    };
    nonVerbal: {
      score: GLAssessmentScore;
      subtests: {
        figureClassification: number;
        figureMatrices: number;
      };
    };
    spatial: {
      score: GLAssessmentScore;
      subtests: {
        figureAnalysis: number;
        figureRecognition: number;
      };
    };
  };

  // Predicted grades (based on CAT4)
  predictions: {
    gcseEnglish: string;    // e.g., "5-7"
    gcseMaths: string;
    gcseScience: string;
  };
}

// ============================================================================
// SAMPLE DATA - Horizon Academy Trust (4 Schools)
// ============================================================================

export const NGMT_DATA: NGMTAssessment[] = [
  // SCHOOL A - Below average, weak on number operations
  {
    assessmentId: 'ngmt_2024_autumn',
    schoolId: 'school6',
    yearGroup: 5,
    assessmentDate: new Date('2024-10-15'),
    studentCount: 145,
    overall: { sas: 92, stanine: 3, percentile: 29 },
    domains: {
      number: {
        score: { sas: 88, stanine: 3, percentile: 21 },
        skills: {
          placeValue: 62,
          fourOperations: 54,
          fractionsDecimalsPercentages: 38,  // Critical weakness
          ratio: 42,
        },
      },
      algebra: {
        score: { sas: 94, stanine: 4, percentile: 34 },
        skills: {
          sequences: 68,
          expressions: 52,
          equations: 48,
        },
      },
      shapeSpaceMeasures: {
        score: { sas: 96, stanine: 4, percentile: 39 },
        skills: {
          properties2D3D: 72,
          positionDirection: 65,
          measurement: 58,
          perimeter: 61,
        },
      },
      handlingData: {
        score: { sas: 93, stanine: 4, percentile: 32 },
        skills: {
          dataRepresentation: 64,
          interpretation: 56,
          probability: 52,
        },
      },
    },
  },

  // SCHOOL C - Above average, strong across board (peer learning opportunity)
  {
    assessmentId: 'ngmt_2024_autumn',
    schoolId: 'school8',
    yearGroup: 5,
    assessmentDate: new Date('2024-10-15'),
    studentCount: 156,
    overall: { sas: 105, stanine: 6, percentile: 63 },
    domains: {
      number: {
        score: { sas: 108, stanine: 6, percentile: 70 },
        skills: {
          placeValue: 84,
          fourOperations: 82,
          fractionsDecimalsPercentages: 78,  // Strong - compare to School A!
          ratio: 76,
        },
      },
      algebra: {
        score: { sas: 103, stanine: 5, percentile: 58 },
        skills: {
          sequences: 82,
          expressions: 74,
          equations: 72,
        },
      },
      shapeSpaceMeasures: {
        score: { sas: 106, stanine: 6, percentile: 66 },
        skills: {
          properties2D3D: 86,
          positionDirection: 82,
          measurement: 78,
          perimeter: 80,
        },
      },
      handlingData: {
        score: { sas: 104, stanine: 6, percentile: 61 },
        skills: {
          dataRepresentation: 81,
          interpretation: 76,
          probability: 74,
        },
      },
    },
  },
];

export const PTM_DATA: PTMAssessment[] = [
  // SCHOOL A - Declining, not making expected progress
  {
    assessmentId: 'ptm_2024_autumn',
    schoolId: 'school6',
    yearGroup: 5,
    term: 'autumn',
    assessmentDate: new Date('2024-10-20'),
    studentCount: 145,
    overall: { sas: 91, stanine: 3, percentile: 27 },
    progress: {
      expectedProgress: 3,    // Expected +3 SAS since summer
      actualProgress: -1,     // Actually declined by 1
      progressIndicator: 'below',
    },
    domains: {
      number: {
        score: { sas: 87, stanine: 2, percentile: 19 },
        itemLevelData: [
          { itemId: 'N1', skill: 'Multiply 2-digit by 1-digit', percentCorrect: 52, nationalAverage: 78 },
          { itemId: 'N2', skill: 'Divide with remainders', percentCorrect: 48, nationalAverage: 72 },
          { itemId: 'N3', skill: 'Convert fractions to decimals', percentCorrect: 34, nationalAverage: 68 },
          { itemId: 'N4', skill: 'Equivalent fractions', percentCorrect: 42, nationalAverage: 75 },
          { itemId: 'N5', skill: 'Add fractions same denominator', percentCorrect: 56, nationalAverage: 82 },
        ],
      },
      algebra: {
        score: { sas: 93, stanine: 4, percentile: 32 },
        itemLevelData: [
          { itemId: 'A1', skill: 'Continue sequence +3', percentCorrect: 68, nationalAverage: 84 },
          { itemId: 'A2', skill: 'Simple expressions', percentCorrect: 54, nationalAverage: 76 },
        ],
      },
      shapeSpaceMeasures: {
        score: { sas: 95, stanine: 4, percentile: 37 },
        itemLevelData: [
          { itemId: 'S1', skill: 'Identify 3D shapes', percentCorrect: 72, nationalAverage: 86 },
          { itemId: 'S2', skill: 'Measure length mm', percentCorrect: 58, nationalAverage: 74 },
          { itemId: 'S3', skill: 'Calculate perimeter', percentCorrect: 62, nationalAverage: 78 },
        ],
      },
      handlingData: {
        score: { sas: 92, stanine: 4, percentile: 30 },
        itemLevelData: [
          { itemId: 'D1', skill: 'Read bar chart', percentCorrect: 64, nationalAverage: 82 },
          { itemId: 'D2', skill: 'Interpret pie chart', percentCorrect: 52, nationalAverage: 70 },
        ],
      },
    },
  },

  // SCHOOL C - Improving, exceeding expected progress
  {
    assessmentId: 'ptm_2024_autumn',
    schoolId: 'school8',
    yearGroup: 5,
    term: 'autumn',
    assessmentDate: new Date('2024-10-20'),
    studentCount: 156,
    overall: { sas: 106, stanine: 6, percentile: 66 },
    progress: {
      expectedProgress: 3,    // Expected +3 SAS
      actualProgress: 5,      // Actually gained +5
      progressIndicator: 'above',
    },
    domains: {
      number: {
        score: { sas: 109, stanine: 7, percentile: 73 },
        itemLevelData: [
          { itemId: 'N1', skill: 'Multiply 2-digit by 1-digit', percentCorrect: 88, nationalAverage: 78 },
          { itemId: 'N2', skill: 'Divide with remainders', percentCorrect: 84, nationalAverage: 72 },
          { itemId: 'N3', skill: 'Convert fractions to decimals', percentCorrect: 82, nationalAverage: 68 },
          { itemId: 'N4', skill: 'Equivalent fractions', percentCorrect: 86, nationalAverage: 75 },
          { itemId: 'N5', skill: 'Add fractions same denominator', percentCorrect: 92, nationalAverage: 82 },
        ],
      },
      algebra: {
        score: { sas: 104, stanine: 6, percentile: 61 },
        itemLevelData: [
          { itemId: 'A1', skill: 'Continue sequence +3', percentCorrect: 86, nationalAverage: 84 },
          { itemId: 'A2', skill: 'Simple expressions', percentCorrect: 78, nationalAverage: 76 },
        ],
      },
      shapeSpaceMeasures: {
        score: { sas: 107, stanine: 6, percentile: 68 },
        itemLevelData: [
          { itemId: 'S1', skill: 'Identify 3D shapes', percentCorrect: 90, nationalAverage: 86 },
          { itemId: 'S2', skill: 'Measure length mm', percentCorrect: 82, nationalAverage: 74 },
          { itemId: 'S3', skill: 'Calculate perimeter', percentCorrect: 84, nationalAverage: 78 },
        ],
      },
      handlingData: {
        score: { sas: 105, stanine: 6, percentile: 63 },
        itemLevelData: [
          { itemId: 'D1', skill: 'Read bar chart', percentCorrect: 88, nationalAverage: 82 },
          { itemId: 'D2', skill: 'Interpret pie chart', percentCorrect: 76, nationalAverage: 70 },
        ],
      },
    },
  },
];

export const CAT4_DATA: CAT4Assessment[] = [
  // SCHOOL A - Lower cognitive baseline (explains some struggles)
  {
    assessmentId: 'cat4_2024_baseline',
    schoolId: 'school6',
    yearGroup: 5,
    assessmentDate: new Date('2024-09-10'),
    studentCount: 145,
    meanCAT4: { sas: 96, stanine: 4, percentile: 39 },
    batteries: {
      verbal: {
        score: { sas: 95, stanine: 4, percentile: 37 },
        subtests: {
          verbalClassification: 58,
          verbalAnalogies: 54,
        },
      },
      quantitative: {
        score: { sas: 94, stanine: 4, percentile: 34 },
        subtests: {
          numberAnalogies: 52,
          numberSeries: 56,
        },
      },
      nonVerbal: {
        score: { sas: 98, stanine: 5, percentile: 45 },
        subtests: {
          figureClassification: 62,
          figureMatrices: 58,
        },
      },
      spatial: {
        score: { sas: 97, stanine: 5, percentile: 42 },
        subtests: {
          figureAnalysis: 60,
          figureRecognition: 58,
        },
      },
    },
    predictions: {
      gcseEnglish: '3-5',
      gcseMaths: '3-5',
      gcseScience: '4-5',
    },
  },

  // SCHOOL C - Higher cognitive potential (working to potential)
  {
    assessmentId: 'cat4_2024_baseline',
    schoolId: 'school8',
    yearGroup: 5,
    assessmentDate: new Date('2024-09-10'),
    studentCount: 156,
    meanCAT4: { sas: 104, stanine: 6, percentile: 61 },
    batteries: {
      verbal: {
        score: { sas: 103, stanine: 5, percentile: 58 },
        subtests: {
          verbalClassification: 74,
          verbalAnalogies: 72,
        },
      },
      quantitative: {
        score: { sas: 106, stanine: 6, percentile: 66 },
        subtests: {
          numberAnalogies: 78,
          numberSeries: 76,
        },
      },
      nonVerbal: {
        score: { sas: 105, stanine: 6, percentile: 63 },
        subtests: {
          figureClassification: 76,
          figureMatrices: 74,
        },
      },
      spatial: {
        score: { sas: 102, stanine: 5, percentile: 55 },
        subtests: {
          figureAnalysis: 72,
          figureRecognition: 70,
        },
      },
    },
    predictions: {
      gcseEnglish: '5-7',
      gcseMaths: '6-7',
      gcseScience: '5-7',
    },
  },
];

/**
 * Get GL Assessment data for a school
 */
export function getGLAssessmentData(schoolId: string) {
  return {
    ngmt: NGMT_DATA.find(d => d.schoolId === schoolId),
    ptm: PTM_DATA.find(d => d.schoolId === schoolId),
    cat4: CAT4_DATA.find(d => d.schoolId === schoolId),
  };
}
