/**
 * Focus Group Identifier
 * Identifies groups of students with similar needs for targeted intervention
 */

import { StudentAssessment, SkillDomainScore } from '../models/assessment-data';

export interface FocusGroup {
  groupId: string;
  groupName: string;
  description: string;
  studentIds: string[];
  studentCount: number;

  // Performance profile
  avgScore: number;
  strengths: string[];  // Skills they're good at
  weaknesses: string[];  // Skills they struggle with
  commonMisconceptions?: string[];

  // Intervention recommendations
  interventionType: 'foundation' | 'extension' | 'consolidation' | 'mixed';
  suggestedApproach: string;
  targetSkills: string[];
  estimatedWeeks: number;  // How long intervention might take

  // Priority
  priority: 'urgent' | 'high' | 'medium' | 'low';
  rationale: string;
}

export interface FocusGroupAnalysis {
  classId: string;
  totalStudents: number;
  groups: FocusGroup[];
  ungroupedStudents: string[];  // Students who don't fit clear patterns
  recommendations: string[];
}

/**
 * Identify focus groups within a class based on performance patterns
 */
export function identifyFocusGroups(
  classId: string,
  studentAssessments: StudentAssessment[],
  priorAttainmentData?: Map<string, 'low' | 'middle' | 'high'>
): FocusGroupAnalysis {
  const groups: FocusGroup[] = [];
  const grouped = new Set<string>();

  // Group 1: Prior Low Attainment struggling significantly
  if (priorAttainmentData) {
    const priorLow = studentAssessments.filter(
      sa => priorAttainmentData.get(sa.studentId) === 'low'
    );

    const struggling = priorLow.filter(sa => sa.percentageScore < 50);
    if (struggling.length >= 3) {
      groups.push(createFocusGroup(
        'prior_low_struggling',
        'Prior Low Attainment - Foundation Group',
        'Students with low prior attainment scoring below 50%. Need foundational skills before age-appropriate content.',
        struggling,
        'foundation'
      ));
      struggling.forEach(sa => grouped.add(sa.studentId));
    }
  }

  // Group 2: Specific skill gap (e.g., everyone struggling with fractions)
  const skillGapGroups = identifySkillSpecificGroups(studentAssessments, grouped);
  skillGapGroups.forEach(group => {
    groups.push(group);
    group.studentIds.forEach(id => grouped.add(id));
  });

  // Group 3: High achievers ready for extension
  const highAchievers = studentAssessments.filter(
    sa => !grouped.has(sa.studentId) && sa.percentageScore >= 85
  );
  if (highAchievers.length >= 3) {
    groups.push(createFocusGroup(
      'high_achievers',
      'High Achievers - Extension Group',
      'Students consistently scoring 85%+. Ready for greater depth and challenge.',
      highAchievers,
      'extension'
    ));
    highAchievers.forEach(sa => grouped.add(sa.studentId));
  }

  // Group 4: Borderline students (60-75%) - need consolidation
  const borderline = studentAssessments.filter(
    sa => !grouped.has(sa.studentId) && sa.percentageScore >= 60 && sa.percentageScore < 75
  );
  if (borderline.length >= 4) {
    groups.push(createFocusGroup(
      'consolidation',
      'Consolidation Group',
      'Students scoring 60-75%. Close to age-appropriate expectations but need targeted practice.',
      borderline,
      'consolidation'
    ));
    borderline.forEach(sa => grouped.add(sa.studentId));
  }

  // Ungrouped students
  const ungrouped = studentAssessments
    .filter(sa => !grouped.has(sa.studentId))
    .map(sa => sa.studentId);

  // Generate recommendations
  const recommendations = generateGroupingRecommendations(groups, ungrouped.length);

  return {
    classId,
    totalStudents: studentAssessments.length,
    groups,
    ungroupedStudents: ungrouped,
    recommendations,
  };
}

/**
 * Create a focus group from student assessments
 */
function createFocusGroup(
  groupId: string,
  groupName: string,
  description: string,
  students: StudentAssessment[],
  interventionType: 'foundation' | 'extension' | 'consolidation' | 'mixed'
): FocusGroup {
  const avgScore = students.reduce((sum, s) => sum + s.percentageScore, 0) / students.length;

  // Identify common strengths and weaknesses
  const domainAverages = new Map<string, number>();
  const domainCounts = new Map<string, number>();

  students.forEach(student => {
    student.responses.forEach(response => {
      // Aggregate by domain (would need item metadata in real implementation)
      const domain = 'General'; // Placeholder
      const current = domainAverages.get(domain) || 0;
      const count = domainCounts.get(domain) || 0;
      domainAverages.set(domain, current + (response.isCorrect ? 1 : 0));
      domainCounts.set(domain, count + 1);
    });
  });

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  domainAverages.forEach((total, domain) => {
    const count = domainCounts.get(domain) || 1;
    const percentage = (total / count) * 100;
    if (percentage >= 75) strengths.push(domain);
    if (percentage < 50) weaknesses.push(domain);
  });

  // Determine priority
  let priority: 'urgent' | 'high' | 'medium' | 'low';
  let rationale: string;

  if (interventionType === 'foundation' && avgScore < 40) {
    priority = 'urgent';
    rationale = 'Students significantly behind age-related expectations. Urgent intervention needed to prevent further gaps.';
  } else if (interventionType === 'foundation' && avgScore < 50) {
    priority = 'high';
    rationale = 'Foundation gaps need addressing before they compound further.';
  } else if (interventionType === 'consolidation') {
    priority = 'medium';
    rationale = 'Students close to targets. Focused practice can move them to secure.';
  } else if (interventionType === 'extension') {
    priority = 'low';
    rationale = 'Students meeting expectations. Extension work prevents boredom and maintains engagement.';
  } else {
    priority = 'medium';
    rationale = 'Mixed needs require flexible approach.';
  }

  // Suggested approach based on intervention type
  let suggestedApproach: string;
  let estimatedWeeks: number;

  switch (interventionType) {
    case 'foundation':
      suggestedApproach = 'Small group (3-5 students) with TA support. Pre-teach foundations before whole-class lessons. Use concrete materials and visual models. 20-30 min daily.';
      estimatedWeeks = 8;
      break;
    case 'extension':
      suggestedApproach = 'Independent/paired problem-solving tasks. Greater depth questions. Cross-curricular challenges. Peer tutoring opportunities.';
      estimatedWeeks = 4;
      break;
    case 'consolidation':
      suggestedApproach = 'Guided practice during main lessons. Targeted homework. Mixed-attainment pair work. Regular low-stakes quizzes.';
      estimatedWeeks = 6;
      break;
    default:
      suggestedApproach = 'Flexible grouping based on specific skills. Regular formative assessment to track progress.';
      estimatedWeeks = 6;
  }

  return {
    groupId,
    groupName,
    description,
    studentIds: students.map(s => s.studentId),
    studentCount: students.length,
    avgScore,
    strengths,
    weaknesses,
    interventionType,
    suggestedApproach,
    targetSkills: weaknesses.slice(0, 3),
    estimatedWeeks,
    priority,
    rationale,
  };
}

/**
 * Identify groups with specific skill gaps
 */
function identifySkillSpecificGroups(
  students: StudentAssessment[],
  alreadyGrouped: Set<string>
): FocusGroup[] {
  const groups: FocusGroup[] = [];

  // Placeholder: In real implementation, would analyze item-level data
  // to find groups of students struggling with same specific skills
  // (e.g., 6 students all weak on fraction operations)

  // Example: Find students struggling with a specific domain
  // (would need item metadata to do this properly)

  return groups;
}

/**
 * Generate recommendations for grouping strategy
 */
function generateGroupingRecommendations(
  groups: FocusGroup[],
  ungroupedCount: number
): string[] {
  const recommendations: string[] = [];

  // Group size recommendations
  const totalGrouped = groups.reduce((sum, g) => sum + g.studentCount, 0);
  if (totalGrouped > 0) {
    recommendations.push(
      `✅ ${groups.length} focus groups identified covering ${totalGrouped} students. ` +
      `Group sizes are appropriate for differentiated teaching.`
    );
  }

  // Priority actions
  const urgent = groups.filter(g => g.priority === 'urgent');
  if (urgent.length > 0) {
    recommendations.push(
      `🚨 URGENT: ${urgent[0].groupName} (${urgent[0].studentCount} students) needs immediate intervention. ` +
      `These students are significantly behind and the gap is widening. Consider daily TA support or 1:1 tutoring.`
    );
  }

  // Foundation group specific advice
  const foundation = groups.filter(g => g.interventionType === 'foundation');
  if (foundation.length > 0) {
    recommendations.push(
      `📚 Foundation Group Strategy: Pre-teach key vocabulary and concepts BEFORE whole-class lessons. ` +
      `Use concrete materials (numicon, place value counters, fraction circles). ` +
      `Build confidence with small, achievable steps.`
    );
  }

  // Extension group advice
  const extension = groups.filter(g => g.interventionType === 'extension');
  if (extension.length > 0) {
    recommendations.push(
      `🌟 Extension Group: Use these students as peer tutors (benefits both tutor and tutee). ` +
      `Set open-ended investigation tasks. Introduce KS3 concepts for challenge. ` +
      `Avoid giving them "more of the same" - focus on depth not breadth.`
    );
  }

  // Staffing suggestions
  if (foundation.length > 0 && foundation[0].studentCount >= 5) {
    recommendations.push(
      `👥 Staffing: ${foundation[0].studentCount} students in foundation group. ` +
      `Consider timetabling TA support during maths lessons. ` +
      `Alternative: rotate teacher focus between groups across the week.`
    );
  }

  // Flexible grouping reminder
  recommendations.push(
    `🔄 Remember: These groups are NOT fixed sets. Regularly reassess (every 4-6 weeks) and move students between groups as they progress. ` +
    `Some students may be in different groups for different topics.`
  );

  // Ungrouped students
  if (ungroupedCount > 0) {
    recommendations.push(
      `ℹ️ ${ungroupedCount} students don't fit clear patterns - likely working at age-appropriate level with no specific gaps. ` +
      `They can work within whole-class mixed-attainment groups.`
    );
  }

  return recommendations;
}

/**
 * Create a timetable suggestion for group rotations
 */
export function generateGroupTimetable(
  groups: FocusGroup[],
  lessonsPerWeek: number = 5
): {
  schedule: Array<{
    day: string;
    teacherFocus: string;
    taSupport?: string;
    independent: string[];
  }>;
  notes: string[];
} {
  const schedule: Array<{
    day: string;
    teacherFocus: string;
    taSupport?: string;
    independent: string[];
  }> = [];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].slice(0, lessonsPerWeek);

  // Prioritize foundation groups for TA support
  const foundation = groups.find(g => g.interventionType === 'foundation');
  const extension = groups.find(g => g.interventionType === 'extension');
  const consolidation = groups.filter(g => g.interventionType === 'consolidation');

  days.forEach((day, index) => {
    let teacherFocus: string;
    let taSupport: string | undefined;
    const independent: string[] = [];

    if (index < 3 && foundation) {
      // Mon-Wed: Focus on foundation group
      teacherFocus = 'Whole class input, then rotate groups';
      taSupport = foundation.groupName + ' (pre-teach/consolidate)';
      if (extension) independent.push(extension.groupName + ' (investigation task)');
      consolidation.forEach(g => independent.push(g.groupName + ' (guided practice)'));
    } else if (extension) {
      // Thu-Fri: More focus on extension while foundation is independent
      teacherFocus = 'Whole class input, then ' + (extension.groupName || 'Extension group');
      if (foundation) taSupport = foundation.groupName + ' (continued support)';
      consolidation.forEach(g => independent.push(g.groupName + ' (pair work)'));
    } else {
      teacherFocus = 'Whole class mixed-attainment';
      if (foundation) taSupport = foundation.groupName;
    }

    schedule.push({ day, teacherFocus, taSupport, independent });
  });

  const notes = [
    '⏰ Aim for 10-15 min direct teaching with each focus group per lesson',
    '📝 Use AFL (exit tickets, mini-whiteboards) to track group progress',
    '🔄 Rotate independent tasks weekly to maintain engagement',
    '👀 Foundation group needs most teacher/TA time in first 4 weeks, then gradually reduce as they catch up',
  ];

  return { schedule, notes };
}

/**
 * Track progress of a focus group over time
 */
export interface FocusGroupProgress {
  groupId: string;
  startDate: Date;
  currentWeek: number;
  estimatedWeeks: number;

  initialAvgScore: number;
  currentAvgScore: number;
  targetScore: number;
  progressPercentage: number;  // % of journey to target complete

  onTrack: boolean;
  projectedCompletionWeek: number;

  studentsMovedOut: string[];  // Students who've progressed enough to leave group
  studentsJoined: string[];     // Students who've joined the group

  weeklyScores: Array<{ week: number; avgScore: number }>;
}

export function trackFocusGroupProgress(
  group: FocusGroup,
  weeklyAssessments: Array<{ week: number; studentScores: Map<string, number> }>,
  targetScore: number = 75
): FocusGroupProgress {
  const initialScore = group.avgScore;
  const currentAssessment = weeklyAssessments[weeklyAssessments.length - 1];

  // Calculate current average
  let currentAvg = initialScore;
  let currentStudents = new Set(group.studentIds);

  if (currentAssessment) {
    const scores: number[] = [];
    group.studentIds.forEach(id => {
      const score = currentAssessment.studentScores.get(id);
      if (score !== undefined) scores.push(score);
    });
    if (scores.length > 0) {
      currentAvg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    }
  }

  // Calculate progress
  const totalJourney = targetScore - initialScore;
  const journeySoFar = currentAvg - initialScore;
  const progressPercentage = totalJourney > 0 ? (journeySoFar / totalJourney) * 100 : 0;

  // Project completion
  const weeksElapsed = weeklyAssessments.length;
  const ratePerWeek = weeksElapsed > 0 ? (currentAvg - initialScore) / weeksElapsed : 0;
  const weeksRemaining = ratePerWeek > 0 ? Math.ceil((targetScore - currentAvg) / ratePerWeek) : 99;
  const projectedCompletionWeek = weeksElapsed + weeksRemaining;

  // On track if projected completion <= estimated weeks
  const onTrack = projectedCompletionWeek <= group.estimatedWeeks;

  // Weekly scores
  const weeklyScores = weeklyAssessments.map(wa => {
    const scores: number[] = [];
    group.studentIds.forEach(id => {
      const score = wa.studentScores.get(id);
      if (score !== undefined) scores.push(score);
    });
    const avg = scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;
    return { week: wa.week, avgScore: avg };
  });

  return {
    groupId: group.groupId,
    startDate: new Date(), // Would come from data
    currentWeek: weeksElapsed,
    estimatedWeeks: group.estimatedWeeks,
    initialAvgScore: initialScore,
    currentAvgScore: currentAvg,
    targetScore,
    progressPercentage: Math.max(0, Math.min(100, progressPercentage)),
    onTrack,
    projectedCompletionWeek,
    studentsMovedOut: [], // Would need to track
    studentsJoined: [],
    weeklyScores,
  };
}
