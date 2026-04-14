/**
 * Question Recommendation Engine
 * Matches student weak points to appropriate practice questions
 * Uses prerequisite-based approach: if weak in Year 5, recommend Year 4 foundation questions
 */

interface Question {
  id: string;
  yearGroup: number;
  questionText: string;
  options: string[];
  correctAnswer: string;
  difficultyBand: number; // 1 (easiest) to 4 (hardest)
  strand: string;
  ncReference: string;
  facilityValue: number; // 0-1, higher = easier
}

interface QuestionBank {
  metadata: {
    totalQuestions: number;
    strands: string[];
    yearGroups: string[];
  };
  questions: Question[];
  index: {
    byStrand: Record<string, string[]>;
    byYear: Record<string, string[]>;
  };
}

interface WeakPoint {
  skill: string;
  domain: string;
  currentScore: number;
  yearGroup?: number;
  ncReference?: string;
}

interface QuestionRecommendation {
  question: Question;
  rationale: string;
  targetSkill: string;
  isPrerequisite: boolean;
}

export class QuestionRecommender {
  private questionBank: QuestionBank | null = null;

  /**
   * Load question bank from JSON file
   */
  async loadQuestionBank(): Promise<void> {
    try {
      const questionBankData = require('../data/question-bank-clean.json');
      this.questionBank = questionBankData;
      console.log(`✅ Loaded ${this.questionBank!.metadata.totalQuestions} questions`);
    } catch (error) {
      console.error('Failed to load question bank:', error);
      this.questionBank = null;
    }
  }

  /**
   * Recommend questions based on weak points
   * Uses prerequisite approach: recommends foundational questions from previous year groups
   */
  recommendQuestions(
    weakPoints: WeakPoint[],
    studentYearGroup: number,
    count: number = 5
  ): QuestionRecommendation[] {
    if (!this.questionBank) {
      console.warn('Question bank not loaded');
      return [];
    }

    const recommendations: QuestionRecommendation[] = [];

    for (const weakPoint of weakPoints) {
      // Map domain to strand
      const strand = this.mapDomainToStrand(weakPoint.domain);
      if (!strand) continue;

      // Determine target year group (use prerequisite approach)
      // If student is weak in Year 5, recommend Year 4 questions
      const targetYearGroup = this.getPrerequisiteYearGroup(studentYearGroup, weakPoint.currentScore);

      // Find appropriate questions
      const candidates = this.findQuestionsByStrandAndYear(strand, targetYearGroup);

      // Sort by difficulty (easier first)
      const sortedCandidates = candidates.sort((a, b) => {
        // Prefer questions with higher facility value (easier)
        return (b.facilityValue || 0) - (a.facilityValue || 0);
      });

      // Take top questions
      const selectedQuestions = sortedCandidates.slice(0, Math.ceil(count / weakPoints.length));

      for (const question of selectedQuestions) {
        const isPrerequisite = targetYearGroup < studentYearGroup;

        recommendations.push({
          question,
          rationale: isPrerequisite
            ? `Foundation question from Year ${targetYearGroup} to address ${weakPoint.skill} gap`
            : `Practice question for ${weakPoint.skill}`,
          targetSkill: weakPoint.skill,
          isPrerequisite
        });
      }
    }

    // Limit to requested count
    return recommendations.slice(0, count);
  }

  /**
   * Map assessment domains to question bank strands
   */
  private mapDomainToStrand(domain: string): string | null {
    const domainMapping: Record<string, string> = {
      'Number': 'Number',
      'Number - fractions': 'FDP',
      'Number - operations': 'Number',
      'Fractions': 'FDP',
      'Decimals': 'FDP',
      'Percentages': 'FDP',
      'Algebra': 'Algebra',
      'Algebra - sequences': 'Algebra',
      'Geometry': 'Geom',
      'Shape': 'Geom',
      'Space': 'Geom',
      'Measurement': 'Meas',
      'Statistics': 'Stat',
      'Data': 'Stat',
      'Ratio': 'Ratio/stat',
      'Proportion': 'Ratio/stat'
    };

    // Try exact match first
    if (domainMapping[domain]) {
      return domainMapping[domain];
    }

    // Try partial match
    for (const [key, value] of Object.entries(domainMapping)) {
      if (domain.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    return null;
  }

  /**
   * Determine prerequisite year group based on current performance
   * If score is very low, go back 2 years; if moderate, go back 1 year
   */
  private getPrerequisiteYearGroup(currentYear: number, score: number): number {
    if (score < 30) {
      // Critical gap - go back 2 years to foundations
      return Math.max(2, currentYear - 2);
    } else if (score < 50) {
      // Significant gap - go back 1 year
      return Math.max(2, currentYear - 1);
    } else {
      // Minor gap - practice at current level
      return currentYear;
    }
  }

  /**
   * Find questions by strand and year group
   */
  private findQuestionsByStrandAndYear(strand: string, yearGroup: number): Question[] {
    if (!this.questionBank) return [];

    return this.questionBank.questions.filter(
      q => q.strand === strand && q.yearGroup === yearGroup
    );
  }

  /**
   * Get a specific question by ID
   */
  getQuestionById(questionId: string): Question | null {
    if (!this.questionBank) return null;
    return this.questionBank.questions.find(q => q.id === questionId) || null;
  }

  /**
   * Get all questions for a specific strand
   */
  getQuestionsByStrand(strand: string): Question[] {
    if (!this.questionBank) return [];
    return this.questionBank.questions.filter(q => q.strand === strand);
  }
}

// Singleton instance
let recommenderInstance: QuestionRecommender | null = null;

export async function getQuestionRecommender(): Promise<QuestionRecommender> {
  if (!recommenderInstance) {
    recommenderInstance = new QuestionRecommender();
    await recommenderInstance.loadQuestionBank();
  }
  return recommenderInstance;
}
