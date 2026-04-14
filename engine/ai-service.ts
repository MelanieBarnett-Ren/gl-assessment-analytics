/**
 * Claude API integration for generating insights
 */

import Anthropic from '@anthropic-ai/sdk';
import { AnthropicBedrock } from '@anthropic-ai/bedrock-sdk';
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
  apiKey?: string;               // For direct Anthropic API
  awsRegion?: string;            // For AWS Bedrock (e.g., 'us-east-1')
  awsAccessKeyId?: string;       // AWS credentials
  awsSecretAccessKey?: string;   // AWS credentials
  awsSessionToken?: string;      // Optional: for temporary credentials
  model?: string;                // Default: claude-sonnet-4-6
  maxTokens?: number;            // Default: 4096
  temperature?: number;          // Default: 1.0
  cacheSystemPrompt?: boolean;   // Use prompt caching (default: true)
}

export class AIService {
  private client: Anthropic | AnthropicBedrock;
  private config: Required<Omit<AIServiceConfig, 'apiKey' | 'awsAccessKeyId' | 'awsSecretAccessKey' | 'awsSessionToken'>> &
    Pick<AIServiceConfig, 'apiKey' | 'awsRegion' | 'awsAccessKeyId' | 'awsSecretAccessKey' | 'awsSessionToken'>;

  constructor(config: AIServiceConfig) {
    // Determine if using AWS Bedrock or direct API
    if (config.awsRegion) {
      // AWS Bedrock configuration - uses AWS credentials from environment or AWS CLI
      this.client = new AnthropicBedrock({
        awsRegion: config.awsRegion,
        // AWS SDK will automatically use credentials from:
        // 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
        // 2. AWS credentials file (~/.aws/credentials)
        // 3. IAM role (if running on EC2/ECS/Lambda)
      });
    } else {
      // Direct Anthropic API
      this.client = new Anthropic({
        apiKey: config.apiKey || '',
      });
    }

    this.config = {
      apiKey: config.apiKey,
      awsRegion: config.awsRegion || 'us-east-1',
      awsAccessKeyId: config.awsAccessKeyId,
      awsSecretAccessKey: config.awsSecretAccessKey,
      awsSessionToken: config.awsSessionToken,
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
      const response = await (this.client as any).messages.create({
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
      const textContent = response.content.find((c: any) => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in Claude response');
      }

      // Parse JSON response with error handling
      // First, strip markdown code fences if present
      let jsonText = textContent.text;
      jsonText = jsonText.replace(/^```(?:json)?\s*\n/gm, '').replace(/\n```\s*$/gm, '');

      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from Claude response');
      }

      let parsed;
      try {
        // Try to parse the JSON directly
        parsed = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        // If parsing fails, try to clean up common JSON issues
        console.log('Initial JSON parse failed, attempting to clean JSON...');
        let cleanedJson = jsonMatch[0]
          // Remove trailing commas before closing braces/brackets
          .replace(/,(\s*[}\]])/g, '$1')
          // Remove comments (// and /* */)
          .replace(/\/\/.*$/gm, '')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          // Escape literal newlines and tabs in string values
          .replace(/:\s*"([^"]*[\n\r\t]+[^"]*)"(?=[,\}\]])/g, (match, str) => {
            return ': "' + str.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '"';
          });

        try {
          parsed = JSON.parse(cleanedJson);
          console.log('✅ Successfully parsed cleaned JSON');
        } catch (secondError) {
          console.error('Claude response (first 500 chars):', textContent.text.substring(0, 500));
          console.error('JSON extract (first 500 chars):', jsonMatch[0].substring(0, 500));
          throw new Error(`Failed to parse JSON even after cleaning: ${secondError instanceof Error ? secondError.message : 'Unknown error'}`);
        }
      }

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
      const response = await (this.client as any).messages.create({
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

      const textContent = response.content.find((c: any) => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in Claude response');
      }

      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from Claude response');
      }

      let parsed;
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        // Clean up common JSON issues
        let cleanedJson = jsonMatch[0]
          .replace(/,(\s*[}\]])/g, '$1')
          .replace(/\/\/.*$/gm, '')
          .replace(/\/\*[\s\S]*?\*\//g, '');
        parsed = JSON.parse(cleanedJson);
      }

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

    if (recommendation.actionType === 'intervention') {
      actions.push({
        label: 'Plan Intervention',
        actionType: 'create_plan',
        targetUrl: `/dashboard/${context.viewLevel}/${context.targetCohort.cohortId}/interventions`,
        parameters: {
          skill: recommendation.targetMetric?.metric || 'skill-based intervention',
          targetValue: recommendation.targetMetric?.targetValue,
        },
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
  const awsRegion = process.env.AWS_REGION;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Check if using AWS Bedrock
  if (awsRegion) {
    console.log(`✓ Using AWS Bedrock in region: ${awsRegion}`);
    return new AIService({
      awsRegion,
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      awsSessionToken: process.env.AWS_SESSION_TOKEN,
      model: process.env.ANTHROPIC_MODEL || 'anthropic.claude-sonnet-4-20250514-v1:0',
      cacheSystemPrompt: true,
    });
  }

  // Otherwise use direct Anthropic API
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY or AWS_REGION environment variable is required');
  }

  console.log('✓ Using direct Anthropic API');
  return new AIService({
    apiKey,
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
    cacheSystemPrompt: true,
  });
}
