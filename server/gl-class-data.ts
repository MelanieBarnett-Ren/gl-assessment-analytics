/**
 * Class and student-level GL Assessment data for drill-down
 */

export interface StudentData {
  studentId: string;
  studentName: string;  // Anonymized
  classId: string;
  cat4: {
    meanSAS: number;
    stanine: number;
    verbal: number;
    quantitative: number;
    nonVerbal: number;
    spatial: number;
  };
  ngmt: {
    sas: number;
    stanine: number;
    percentile: number;
    domains: {
      number: number;
      algebra: number;
      shapeSpace: number;
      data: number;
    };
  };
  ptm: {
    sas: number;
    stanine: number;
    progress: number;  // Change from previous term
    itemResponses: {
      itemId: string;
      skill: string;
      correct: boolean;
    }[];
  };
  demographics: {
    fsm: boolean;
    eal: boolean;
    send: boolean;
    gender: 'male' | 'female';
  };
  focusGroup?: 'foundation' | 'consolidation' | 'extension';
}

export interface ClassData {
  classId: string;
  className: string;
  schoolId: string;
  yearGroup: number;
  teacherName: string;  // Anonymized
  studentCount: number;
  students: StudentData[];
  classSummary: {
    avgCAT4: number;
    avgNGMT: number;
    valueAdded: number;
    fsmPercentage: number;
    ealPercentage: number;
    sendPercentage: number;
    focusGroups: {
      foundation: number;
      consolidation: number;
      extension: number;
    };
  };
}

// Helper to generate student data
function generateStudent(
  id: number,
  classId: string,
  cat4Mean: number,
  ngmtMean: number,
  variance: number = 10
): StudentData {
  const cat4 = Math.round(cat4Mean + (Math.random() - 0.5) * variance * 2);
  const ngmt = Math.round(ngmtMean + (Math.random() - 0.5) * variance * 2);
  const cat4Stanine = Math.min(9, Math.max(1, Math.round((cat4 - 70) / 6)));
  const ngmtStanine = Math.min(9, Math.max(1, Math.round((ngmt - 70) / 6)));

  // Determine focus group based on prior attainment (using CAT4 as proxy)
  let focusGroup: 'foundation' | 'consolidation' | 'extension';
  if (cat4 < 90) focusGroup = 'foundation';
  else if (cat4 < 105) focusGroup = 'consolidation';
  else focusGroup = 'extension';

  // Generate PTM item responses (sample)
  const ptmItems = [
    { itemId: 'N1', skill: 'Multiply 2-digit by 1-digit' },
    { itemId: 'N2', skill: 'Divide with remainders' },
    { itemId: 'N3', skill: 'Convert fractions to decimals' },
    { itemId: 'N4', skill: 'Equivalent fractions' },
    { itemId: 'N5', skill: 'Add fractions same denominator' },
    { itemId: 'A1', skill: 'Continue sequence +3' },
    { itemId: 'A2', skill: 'Simple expressions' },
    { itemId: 'S1', skill: 'Identify 3D shapes' },
    { itemId: 'S2', skill: 'Measure length mm' },
    { itemId: 'S3', skill: 'Calculate perimeter' },
  ];

  const itemResponses = ptmItems.map(item => ({
    ...item,
    correct: Math.random() < (ngmt / 130), // Probability based on NGMT score
  }));

  return {
    studentId: `STU${id.toString().padStart(4, '0')}`,
    studentName: `Student ${id}`,
    classId,
    cat4: {
      meanSAS: cat4,
      stanine: cat4Stanine,
      verbal: cat4 + Math.round((Math.random() - 0.5) * 6),
      quantitative: cat4 + Math.round((Math.random() - 0.5) * 6),
      nonVerbal: cat4 + Math.round((Math.random() - 0.5) * 6),
      spatial: cat4 + Math.round((Math.random() - 0.5) * 6),
    },
    ngmt: {
      sas: ngmt,
      stanine: ngmtStanine,
      percentile: Math.min(99, Math.max(1, Math.round((ngmt - 70) * 1.5))),
      domains: {
        number: Math.round(ngmt + (Math.random() - 0.5) * 8),
        algebra: Math.round(ngmt + (Math.random() - 0.5) * 8),
        shapeSpace: Math.round(ngmt + (Math.random() - 0.5) * 8),
        data: Math.round(ngmt + (Math.random() - 0.5) * 8),
      },
    },
    ptm: {
      sas: ngmt - 1, // PTM typically slightly lower than NGMT
      stanine: ngmtStanine,
      progress: Math.round((Math.random() - 0.5) * 6),
      itemResponses,
    },
    demographics: {
      fsm: Math.random() < 0.5, // Based on school FSM%
      eal: Math.random() < 0.28,
      send: Math.random() < 0.21,
      gender: Math.random() < 0.48 ? 'female' : 'male', // Roughly 48% female, 52% male
    },
    focusGroup,
  };
}

/**
 * Get class-level data for a school
 */
export function getClassData(schoolId: string): ClassData[] {
  if (schoolId === 'school6') {
    // School A - 4 classes, struggling
    return [
      {
        classId: 'class6a',
        className: '5A',
        schoolId: 'school6',
        yearGroup: 5,
        teacherName: 'Mrs Thompson',
        studentCount: 28,
        students: Array.from({ length: 28 }, (_, i) =>
          generateStudent(i + 1, 'class6a', 94, 90, 12)
        ),
        classSummary: {
          avgCAT4: 94,
          avgNGMT: 90,
          valueAdded: -4,
          fsmPercentage: 54,
          ealPercentage: 32,
          sendPercentage: 25,
          focusGroups: {
            foundation: 12,
            consolidation: 13,
            extension: 3,
          },
        },
      },
      {
        classId: 'class6b',
        className: '5B',
        schoolId: 'school6',
        yearGroup: 5,
        teacherName: 'Mr Patel',
        studentCount: 29,
        students: Array.from({ length: 29 }, (_, i) =>
          generateStudent(i + 29, 'class6b', 97, 93, 11)
        ),
        classSummary: {
          avgCAT4: 97,
          avgNGMT: 93,
          valueAdded: -4,
          fsmPercentage: 52,
          ealPercentage: 28,
          sendPercentage: 21,
          focusGroups: {
            foundation: 10,
            consolidation: 15,
            extension: 4,
          },
        },
      },
      {
        classId: 'class6c',
        className: '5C',
        schoolId: 'school6',
        yearGroup: 5,
        teacherName: 'Miss Davies',
        studentCount: 30,
        students: Array.from({ length: 30 }, (_, i) =>
          generateStudent(i + 58, 'class6c', 96, 93, 10)
        ),
        classSummary: {
          avgCAT4: 96,
          avgNGMT: 93,
          valueAdded: -3,
          fsmPercentage: 50,
          ealPercentage: 27,
          sendPercentage: 20,
          focusGroups: {
            foundation: 11,
            consolidation: 14,
            extension: 5,
          },
        },
      },
      {
        classId: 'class6d',
        className: '5D',
        schoolId: 'school6',
        yearGroup: 5,
        teacherName: 'Mr Jones',
        studentCount: 27,
        students: Array.from({ length: 27 }, (_, i) =>
          generateStudent(i + 88, 'class6d', 93, 88, 13)
        ),
        classSummary: {
          avgCAT4: 93,
          avgNGMT: 88,
          valueAdded: -5,
          fsmPercentage: 56,
          ealPercentage: 35,
          sendPercentage: 26,
          focusGroups: {
            foundation: 13,
            consolidation: 12,
            extension: 2,
          },
        },
      },
    ];
  } else if (schoolId === 'school7') {
    // School B - 4 classes, average performance
    return [
      {
        classId: 'class7a',
        className: '5A',
        schoolId: 'school7',
        yearGroup: 5,
        teacherName: 'Mrs Brown',
        studentCount: 28,
        students: Array.from({ length: 28 }, (_, i) =>
          generateStudent(i + 1, 'class7a', 100, 101, 9)
        ),
        classSummary: {
          avgCAT4: 100,
          avgNGMT: 101,
          valueAdded: +1,
          fsmPercentage: 32,
          ealPercentage: 18,
          sendPercentage: 16,
          focusGroups: {
            foundation: 8,
            consolidation: 15,
            extension: 5,
          },
        },
      },
      {
        classId: 'class7b',
        className: '5B',
        schoolId: 'school7',
        yearGroup: 5,
        teacherName: 'Mr Taylor',
        studentCount: 29,
        students: Array.from({ length: 29 }, (_, i) =>
          generateStudent(i + 29, 'class7b', 99, 99, 10)
        ),
        classSummary: {
          avgCAT4: 99,
          avgNGMT: 99,
          valueAdded: 0,
          fsmPercentage: 30,
          ealPercentage: 20,
          sendPercentage: 15,
          focusGroups: {
            foundation: 9,
            consolidation: 16,
            extension: 4,
          },
        },
      },
      {
        classId: 'class7c',
        className: '5C',
        schoolId: 'school7',
        yearGroup: 5,
        teacherName: 'Miss Green',
        studentCount: 27,
        students: Array.from({ length: 27 }, (_, i) =>
          generateStudent(i + 58, 'class7c', 101, 102, 8)
        ),
        classSummary: {
          avgCAT4: 101,
          avgNGMT: 102,
          valueAdded: +1,
          fsmPercentage: 35,
          ealPercentage: 22,
          sendPercentage: 17,
          focusGroups: {
            foundation: 7,
            consolidation: 15,
            extension: 5,
          },
        },
      },
      {
        classId: 'class7d',
        className: '5D',
        schoolId: 'school7',
        yearGroup: 5,
        teacherName: 'Mrs Wilson',
        studentCount: 26,
        students: Array.from({ length: 26 }, (_, i) =>
          generateStudent(i + 85, 'class7d', 98, 98, 11)
        ),
        classSummary: {
          avgCAT4: 98,
          avgNGMT: 98,
          valueAdded: 0,
          fsmPercentage: 33,
          ealPercentage: 19,
          sendPercentage: 18,
          focusGroups: {
            foundation: 9,
            consolidation: 14,
            extension: 3,
          },
        },
      },
    ];
  } else if (schoolId === 'school8') {
    // School C - 4 classes, performing well
    return [
      {
        classId: 'class8a',
        className: '5A',
        schoolId: 'school8',
        yearGroup: 5,
        teacherName: 'Mrs Johnson',
        studentCount: 26,
        students: Array.from({ length: 26 }, (_, i) =>
          generateStudent(i + 1, 'class8a', 105, 107, 10)
        ),
        classSummary: {
          avgCAT4: 105,
          avgNGMT: 107,
          valueAdded: +2,
          fsmPercentage: 46,
          ealPercentage: 23,
          sendPercentage: 19,
          focusGroups: {
            foundation: 6,
            consolidation: 14,
            extension: 6,
          },
        },
      },
      {
        classId: 'class8b',
        className: '5B',
        schoolId: 'school8',
        yearGroup: 5,
        teacherName: 'Mr Williams',
        studentCount: 27,
        students: Array.from({ length: 27 }, (_, i) =>
          generateStudent(i + 27, 'class8b', 104, 106, 11)
        ),
        classSummary: {
          avgCAT4: 104,
          avgNGMT: 106,
          valueAdded: +2,
          fsmPercentage: 48,
          ealPercentage: 26,
          sendPercentage: 18,
          focusGroups: {
            foundation: 7,
            consolidation: 15,
            extension: 5,
          },
        },
      },
      {
        classId: 'class8c',
        className: '5C',
        schoolId: 'school8',
        yearGroup: 5,
        teacherName: 'Mrs Ahmed',
        studentCount: 28,
        students: Array.from({ length: 28 }, (_, i) =>
          generateStudent(i + 54, 'class8c', 103, 103, 12)
        ),
        classSummary: {
          avgCAT4: 103,
          avgNGMT: 103,
          valueAdded: 0,
          fsmPercentage: 50,
          ealPercentage: 25,
          sendPercentage: 19,
          focusGroups: {
            foundation: 8,
            consolidation: 13,
            extension: 7,
          },
        },
      },
      {
        classId: 'class8d',
        className: '5D',
        schoolId: 'school8',
        yearGroup: 5,
        teacherName: 'Mr Singh',
        studentCount: 29,
        students: Array.from({ length: 29 }, (_, i) =>
          generateStudent(i + 82, 'class8d', 106, 109, 10)
        ),
        classSummary: {
          avgCAT4: 106,
          avgNGMT: 109,
          valueAdded: +3,
          fsmPercentage: 44,
          ealPercentage: 24,
          sendPercentage: 17,
          focusGroups: {
            foundation: 5,
            consolidation: 16,
            extension: 8,
          },
        },
      },
    ];
  }

  return [];
}

/**
 * Get specific class data
 */
export function getClassById(classId: string): ClassData | null {
  let schoolId = 'school6';
  if (classId.includes('7')) schoolId = 'school7';
  else if (classId.includes('8')) schoolId = 'school8';

  const classes = getClassData(schoolId);
  return classes.find(c => c.classId === classId) || null;
}
