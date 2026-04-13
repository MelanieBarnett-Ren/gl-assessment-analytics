/**
 * Claude API integration for generating insights
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  SYSTEM_PROMPT,
  generateMATInsightsPrompt,
  generateSchoolInsightsPrompt,
  generateStudentInsightsPrompt,
  generateMisconceptionPrompt,
  PromptContext,
} from '../prompts/insight-generation';
import { Insight, ViewLevel, MisconductionPattern } from '../models/insights';

export interface AIServiceConfig {
  apiKey: string;
  model?: string;                // Default: claude-sonnet-4-6
  maxTokens?: number;            // Default: 4096
  temperature?: number;          // Default: 1.0
  cacheSystemPrompt?: boolean;   // Use prompt caching (default: true)
}

export class AIService {
  private client: Anthropic;
  private config: Required<AIServiceConfig>;

  constructor(config: AIServiceConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });

    this.config = {
      apiKey: config.apiKey,
      model: config.model || 'claude-sonnet-4-6',
      maxTokens: config.maxTokens || 4096,
      temperature: config.temperature || 1.0,
      cacheSystemPrompt: config.cacheSystemPrompt ?? true,
    };
  }

  /**
   * Generate insights for a cohort using Claude API
   */
  async generateInsights(
    context: PromptContext
  ): Promise<{ insights: Insight[]; tokensUsed: number }> {
    const userPrompt = this.buildPromptForViewLevel(context);

    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system: this.config.cacheSystemPrompt
          ? [
              {
                type: 'text',
                text: SYSTEM_PROMPT,
                cache_control: { type: 'ephemeral' },
              },
            ]
          : SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      // Extract text content
      const textContent = response.content.find(c => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in Claude response');
      }

      // Parse JSON response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from Claude response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const insights = this.normalizeInsights(parsed.insights, context);

      // Calculate token usage
      const tokensUsed =
        response.usage.input_tokens +
        response.usage.output_tokens;

      return { insights, tokensUsed };
    } catch (error) {
      console.error('Error generating insights with Claude API:', error);
      throw new Error(
        `Failed to generate insights: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate misconception analysis
   */
  async analyzeMisconceptions(
    skill: string,
    studentErrors: string[],
    correctAnswer: string
  ): Promise<MisconductionPattern> {
    const prompt = generateMisconceptionPrompt(skill, studentErrors, correctAnswer);

    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: 2048,
        temperature: this.config.temperature,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textContent = response.content.find(c => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in Claude response');
      }

      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from Claude response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        skill,
        contentDomain: '',  // To be filled by caller
        misconceptionType: parsed.misconceptionType,
        description: parsed.description,
        affectedStudents: 0,  // To be calculated
        affectedPercentage: parsed.affectedPercentage,
        exampleErrors: studentErrors.slice(0, 3),
        scoreImpact: 0,  // To be calculated
        suggestedApproach: parsed.suggestedRemediation,
      };
    } catch (error) {
      console.error('Error analyzing misconceptions:', error);
      throw new Error(
        `Failed to analyze misconceptions: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Build appropriate prompt based on view level
   */
  private buildPromptForViewLevel(context: PromptContext): string {
    switch (context.viewLevel) {
      case 'mat':
        return generateMATInsightsPrompt(context);
      case 'school':
        return generateSchoolInsightsPrompt(context);
      case 'student':
        return generateStudentInsightsPrompt(context);
      default:
        throw new Error(`Unknown view level: ${context.viewLevel}`);
    }
  }

  /**
   * Normalize and enrich insights from Claude response
   */
  private normalizeInsights(rawInsights: any[], context: PromptContext): Insight[] {
    return rawInsights.map((raw, index) => ({
      insightId: this.generateInsightId(context, index),
      viewLevel: context.viewLevel,
      cohortId: context.targetCohort.cohortId,
      assessmentId: context.targetCohort.assessment.cohortType,
      severity: raw.severity || 'neutral',
      type: raw.type || 'outlier',
      priority: raw.priority || index + 1,
      title: raw.title,
      summary: raw.summary,
      detailedAnalysis: raw.detailedAnalysis,
      evidence: {
        currentPerformance: context.targetCohort.assessment.avgSAS,
        comparisonPerformance: 0,  // To be calculated
        gap: 0,
        gapPercentage: 0,
        isSignificant: true,
        comparisonCohorts: context.similarCohorts.map(c => ({
          cohortId: c.cohortId,
          cohortName: c.cohortName,
          cohortType: 'school',
          demographics: {
            fsmPercentage: c.demographics.fsmPercentage,
            ealPercentage: c.demographics.ealPercentage,
            sendPercentage: c.demographics.sendPercentage,
          },
          similarityScore: c.similarityScore,
          performance: c.assessment.avgSAS,
          gap: c.assessment.avgSAS - context.targetCohort.assessment.avgSAS,
        })),
      },
      recommendations: raw.recommendations.map((rec: any, recIndex: number) => ({
        recommendationId: `${this.generateInsightId(context, index)}_rec_${recIndex}`,
        title: rec.title,
        description: rec.description,
        rationale: rec.rationale,
        actionType: rec.actionType || 'investigate',
        targetMetric: rec.targetMetric,
        peerExample: rec.peerExample,
        priority: rec.priority || recIndex + 1,
        dashboardActions: this.generateDashboardActions(rec, context),
      })),
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    }));
  }

  /**
   * Generate unique insight ID
   */
  private generateInsightId(context: PromptContext, index: number): string {
    const timestamp = Date.now();
    return `insight_${context.viewLevel}_${context.targetCohort.cohortId}_${timestamp}_${index}`;
  }

  /**
   * Generate dashboard action buttons
   */
  private generateDashboardActions(recommendation: any, context: PromptContext): any[] {
    const actions = [];

    // Always include "Investigate" action
    actions.push({
      label: 'Investigate',
      actionType: 'navigate',
      targetUrl: `/dashboard/${context.viewLevel}/${context.targetCohort.cohortId}/details`,
    });

    // Add specific actions based on recommendation type
    if (recommendation.peerExample) {
      actions.push({
        label: `Contact ${recommendation.peerExample.cohortName}`,
        actionType: 'contact_peer',
        parameters: {
          cohortId: recommendation.peerExample.cohortId || '',
          cohortName: recommendation.peerExample.cohortName,
        },
      });
    }

    if (recommendation.actionType === 'focus_group') {
      actions.push({
        label: 'Create Focus Group',
        actionType: 'create_plan',
        targetUrl: `/dashboard/student/${context.targetCohort.cohortId}/focus-groups`,
      });
    }

    if (recommendation.targetMetric) {
      actions.push({
        label: 'Track Progress',
        actionType: 'create_report',
        parameters: {
          metric: recommendation.targetMetric.metric,
          targetValue: recommendation.targetMetric.targetValue,
        },
      });
    }

    return actions;
  }
}

/**
 * Utility: Create AI service instance from environment
 */
export function createAIService(): AIService {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  return new AIService({
    apiKey,
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
    cacheSystemPrompt: true,
  });
}
