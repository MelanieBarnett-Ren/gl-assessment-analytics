/**
 * Local Development Server with Mock Data
 * Run with: npm run dev
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { getMockData } from './mock-data';
import { AIService, createAIService } from '../engine/ai-service';
import { findSimilarCohorts } from '../engine/similarity-matcher';
import { detectOutliers } from '../engine/outlier-detector';
import { InsightPanel, ViewLevel } from '../models/insights';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (for frontend testing)
app.use('/static', express.static(path.join(__dirname, '../components')));

// Serve CSS and other static assets from server directory
app.use(express.static(path.join(__dirname)));

// In-memory cache for development
const cache = new Map<string, { data: InsightPanel; expiresAt: Date }>();

// Initialize AI Service
let aiService: AIService | null = null;
try {
  // Check if AWS Bedrock or direct API is configured
  if (process.env.AWS_REGION || (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_api_key_here')) {
    aiService = createAIService();
    console.log('✅ Claude API initialized');
  } else {
    console.log('⚠️  No Claude API key or AWS region found - using mock insights');
  }
} catch (error) {
  console.log('⚠️  Failed to initialize AI service - using mock insights');
  console.error(error);
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /api/insights/:viewLevel/:cohortId/:assessmentId
 * Generate AI insights for a cohort
 */
app.get('/api/insights/:viewLevel/:cohortId/:assessmentId', async (req, res) => {
  try {
    const { viewLevel, cohortId, assessmentId } = req.params;
    const { forceRefresh } = req.query;

    console.log(`[REQUEST] GET /api/insights/${viewLevel}/${cohortId}/${assessmentId}`);

    // Validate view level
    if (!['mat', 'school', 'student'].includes(viewLevel)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMETERS', message: 'Invalid view level' },
      });
    }

    // Check cache
    const cacheKey = `${viewLevel}_${cohortId}_${assessmentId}`;
    if (!forceRefresh) {
      const cached = cache.get(cacheKey);
      if (cached && cached.expiresAt > new Date()) {
        console.log('✅ Returning cached insights');
        return res.json({
          success: true,
          data: cached.data,
          cached: true,
          generatedAt: cached.data.generatedAt.toISOString(),
          expiresAt: cached.expiresAt.toISOString(),
        });
      }
    }

    // Load mock data
    const mockData = getMockData();
    const targetCohort = mockData.cohorts.find(c => c.cohortId === cohortId);

    if (!targetCohort) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Cohort not found' },
      });
    }

    // Find similar cohorts
    const similarCohorts = findSimilarCohorts(
      targetCohort,
      mockData.cohorts.filter(c => c.cohortId !== cohortId),
      { maxResults: 10, minSimilarityScore: 0.7 }
    );

    console.log(`Found ${similarCohorts.length} similar cohorts`);

    // Detect outliers with relaxed mode to ensure we always get skill-level insights
    const outliers = detectOutliers(
      targetCohort.assessment.skillDomainScores,
      similarCohorts.map(c => ({ skills: c.assessment.skillDomainScores })),
      {
        minEffectSize: 0.5,
        minZScore: 1.5,
        significanceLevel: 0.05,
        relaxedMode: true,  // Always find relative weak areas, even for high performers
        minResultsInRelaxedMode: 5  // Ensure at least 5 skill-level insights
      }
    );

    console.log(`Detected ${outliers.length} skill areas for analysis (including relative weak areas)`);

    // Generate insights
    let insightPanel: InsightPanel;

    if (aiService) {
      // Use real Claude API
      console.log('🤖 Generating insights with Claude API...');
      const context = {
        viewLevel: viewLevel as ViewLevel,
        targetCohort: {
          cohortId: targetCohort.cohortId,
          cohortName: targetCohort.cohortName,
          assessment: targetCohort.assessment,
          demographics: targetCohort.demographics,
        },
        similarCohorts: similarCohorts.map(sc => ({
          cohortId: sc.cohortId,
          cohortName: sc.cohortName,
          assessment: sc.assessment,
          demographics: sc.demographics,
          similarityScore: sc.similarityScore,
        })),
        outliers: outliers.map(o => ({
          skill: o.skill,
          domain: o.contentDomain,
          gap: o.gap,
          effectSize: o.effectSize,
        })),
      };

      const { insights, tokensUsed } = await aiService.generateInsights(context);
      console.log(`✅ Generated ${insights.length} insights (${tokensUsed} tokens)`);

      insightPanel = {
        panelId: `panel_${viewLevel}_${cohortId}_${Date.now()}`,
        viewLevel: viewLevel as ViewLevel,
        cohortId,
        assessmentId,
        insights: insights.slice(0, 5),
        summary: {
          totalComparisons: similarCohorts.length,
          significantGaps: outliers.filter(o => o.severity === 'critical' || o.severity === 'high').length,
          peerLearningOpportunities: insights.filter(i => i.type === 'peer_learning').length,
        },
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      };
    } else {
      // Use mock insights for demo
      console.log('📝 Using mock insights (no API key)');
      insightPanel = generateMockInsightPanel(viewLevel as ViewLevel, cohortId, assessmentId, targetCohort, similarCohorts, outliers);
    }

    // Cache the result
    cache.set(cacheKey, {
      data: insightPanel,
      expiresAt: insightPanel.expiresAt,
    });

    res.json({
      success: true,
      data: insightPanel,
      cached: false,
      generatedAt: insightPanel.generatedAt.toISOString(),
      expiresAt: insightPanel.expiresAt.toISOString(),
    });

  } catch (error) {
    console.error('❌ Error generating insights:');
    console.error(error);
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'AI_SERVICE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
  }
});

/**
 * GET /api/cohorts/:cohortId/similar
 * Find similar cohorts
 */
app.get('/api/cohorts/:cohortId/similar', (req, res) => {
  try {
    const { cohortId } = req.params;
    const mockData = getMockData();

    const targetCohort = mockData.cohorts.find(c => c.cohortId === cohortId);
    if (!targetCohort) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Cohort not found' },
      });
    }

    const similarCohorts = findSimilarCohorts(
      targetCohort,
      mockData.cohorts.filter(c => c.cohortId !== cohortId),
      { maxResults: 10 }
    );

    res.json({
      success: true,
      data: {
        targetCohort: {
          cohortId: targetCohort.cohortId,
          demographics: targetCohort.demographics,
        },
        similarCohorts,
      },
    });
  } catch (error) {
    console.error('Error finding similar cohorts:', error);
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: error instanceof Error ? error.message : 'Unknown error' },
    });
  }
});

/**
 * GET /api/data/cohorts
 * List all available cohorts (for testing)
 */
app.get('/api/data/cohorts', (req, res) => {
  const mockData = getMockData();
  res.json({
    success: true,
    data: mockData.cohorts.map(c => ({
      cohortId: c.cohortId,
      cohortName: c.cohortName,
      demographics: c.demographics,
      avgSAS: c.assessment.avgSAS,
    })),
  });
});

/**
 * GET /hackathon
 * Hackathon demo page (RECOMMENDED FOR DEMO)
 */
app.get('/hackathon', (req, res) => {
  res.sendFile(path.join(__dirname, 'hackathon-demo.html'));
});

/**
 * GET /gl
 * GL Assessment integrated insights (NGMT, PTM, CAT4) - NEW STYLED VERSION
 */
app.get('/gl', (req, res) => {
  res.sendFile(path.join(__dirname, 'gl-demo-v3.html'));
});

/**
 * GET /gl-v2
 * GL Assessment (wordy version - for reference)
 */
app.get('/gl-v2', (req, res) => {
  res.sendFile(path.join(__dirname, 'gl-demo-v2.html'));
});

/**
 * GET /gl-old
 * GL Assessment (old simple version - for reference)
 */
app.get('/gl-old', (req, res) => {
  res.sendFile(path.join(__dirname, 'gl-demo-simple.html'));
});

/**
 * GET /gl-advanced
 * GL Assessment (advanced version)
 */
app.get('/gl-advanced', (req, res) => {
  res.sendFile(path.join(__dirname, 'gl-assessment-demo.html'));
});

/**
 * GET /dashboard
 * GL Assessment Visual Analytics Dashboard with Highcharts
 */
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'gl-dashboard.html'));
});

/**
 * GET /api/gl-assessment/all
 * Get integrated GL Assessment data for all schools
 */
app.get('/api/gl-assessment/all', (req, res) => {
  try {
    const { getGLAssessmentData } = require('./gl-assessment-data');
    const { generateGLIntegratedInsights } = require('../engine/gl-assessment-analyzer');

    const schools = ['school6', 'school7', 'school8'];
    const results = schools.map(schoolId => {
      const data = getGLAssessmentData(schoolId);
      if (data.ngmt && data.ptm && data.cat4) {
        const schoolName = schoolId === 'school6' ? 'School A' : schoolId === 'school7' ? 'School B' : 'School C';
        return generateGLIntegratedInsights(schoolId, schoolName, data.ngmt, data.ptm, data.cat4);
      }
      return null;
    }).filter(r => r !== null);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error generating GL Assessment insights:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * GET /api/gl-assessment/school/:schoolId/classes
 * Get class-level data for a school
 */
app.get('/api/gl-assessment/school/:schoolId/classes', (req, res) => {
  try {
    const { schoolId } = req.params;
    const { getClassData } = require('./gl-class-data');

    const classes = getClassData(schoolId);

    res.json({
      success: true,
      data: classes,
    });
  } catch (error) {
    console.error('Error getting class data:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * GET /api/gl-assessment/class/:classId
 * Get detailed data for a specific class including all students
 */
app.get('/api/gl-assessment/class/:classId', (req, res) => {
  try {
    const { classId } = req.params;
    const { getClassById } = require('./gl-class-data');

    const classData = getClassById(classId);

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: { message: 'Class not found' },
      });
    }

    res.json({
      success: true,
      data: classData,
    });
  } catch (error) {
    console.error('Error getting class data:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
});

/**
 * GET /class/:classId
 * Class-level drill-down page
 */
app.get('/class/:classId', (req, res) => {
  res.sendFile(path.join(__dirname, 'class-view.html'));
});

/**
 * GET /school/:schoolId/skills
 * School-level skills analysis page
 */
app.get('/school/:schoolId/skills', (req, res) => {
  res.sendFile(path.join(__dirname, 'school-skills-view.html'));
});

/**
 * GET /school/:schoolId/strand/:strandId
 * Strand-level drill-down page (visual dashboard)
 */
app.get('/school/:schoolId/strand/:strandId', (req, res) => {
  res.sendFile(path.join(__dirname, 'strand-view-v2.html'));
});

/**
 * GET /school/:schoolId/strand-old/:strandId
 * Strand-level drill-down page (old list view)
 */
app.get('/school/:schoolId/strand-old/:strandId', (req, res) => {
  res.sendFile(path.join(__dirname, 'strand-view.html'));
});

/**
 * GET /mat
 * MAT visualization dashboard
 */
app.get('/mat', (req, res) => {
  res.sendFile(path.join(__dirname, 'mat-visualization-v2.html'));
});

/**
 * GET /mat-old
 * Old MAT visualization (for reference)
 */
app.get('/mat-old', (req, res) => {
  res.sendFile(path.join(__dirname, 'mat-visualization.html'));
});

/**
 * GET /reports
 * Reports and data exports hub
 */
app.get('/reports', (req, res) => {
  res.sendFile(path.join(__dirname, 'reports.html'));
});

/**
 * GET /demo-dashboard
 * AI Insights Dashboard (PTM-style)
 */
app.get('/demo-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'demo-dashboard.html'));
});

/**
 * GET /demo
 * AI Insights Dashboard (redirect to new dashboard)
 */
app.get('/demo', (req, res) => {
  res.redirect('/demo-dashboard');
});

/**
 * GET /demo-old
 * Old simple demo page
 */
app.get('/demo-old', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Insights Demo</title>
        <link rel="stylesheet" href="/static/InsightsPanel.css">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; background: #f5f5f5; }
          h1 { color: #553c9a; }
          .container { max-width: 1200px; margin: 0 auto; }
          .controls { background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; }
          select, button { padding: 10px; font-size: 14px; margin-right: 10px; border-radius: 6px; border: 1px solid #ccc; }
          button { background: #7c3aed; color: white; border: none; cursor: pointer; }
          button:hover { background: #6d28d9; }
          #result { background: white; padding: 20px; border-radius: 12px; min-height: 400px; }
          .loading { text-align: center; padding: 40px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🤖 AI Insights Demo</h1>

          <div class="controls">
            <label>View Level:</label>
            <select id="viewLevel">
              <option value="school">School</option>
              <option value="mat">MAT</option>
              <option value="student">Student/Class</option>
            </select>

            <label>Cohort:</label>
            <select id="cohortId">
              <option value="school1">Oakwood Primary</option>
              <option value="school2">Riverside Academy</option>
              <option value="school3">Valley School</option>
            </select>

            <button onclick="loadInsights()">Generate Insights</button>
            <button onclick="loadInsights(true)">Force Refresh</button>
          </div>

          <div id="result">
            <p style="color: #6b7280;">Click "Generate Insights" to see AI-powered analysis</p>
          </div>
        </div>

        <script>
          async function loadInsights(forceRefresh = false) {
            const viewLevel = document.getElementById('viewLevel').value;
            const cohortId = document.getElementById('cohortId').value;
            const result = document.getElementById('result');

            result.innerHTML = '<div class="loading">🤖 Analyzing performance data...</div>';

            try {
              const url = \`http://localhost:${PORT}/api/insights/\${viewLevel}/\${cohortId}/assessment123\${forceRefresh ? '?forceRefresh=true' : ''}\`;
              const response = await fetch(url);
              const data = await response.json();

              if (data.success) {
                const panel = data.data;
                let html = \`
                  <h2>🎯 AI Insights</h2>
                  <p><strong>Generated:</strong> \${new Date(data.generatedAt).toLocaleString()}</p>
                  <p><strong>Cached:</strong> \${data.cached ? 'Yes' : 'No'}</p>
                  <p><strong>Significant Gaps:</strong> \${panel.summary.significantGaps}</p>
                  <p><strong>Peer Opportunities:</strong> \${panel.summary.peerLearningOpportunities}</p>
                  <hr>
                \`;

                panel.insights.forEach((insight, idx) => {
                  html += \`
                    <div style="border-left: 4px solid #7c3aed; padding: 16px; margin: 16px 0; background: #faf9fb; border-radius: 8px;">
                      <h3>\${idx + 1}. \${insight.title}</h3>
                      <p><strong>Summary:</strong> \${insight.summary}</p>
                      <p><strong>Priority:</strong> \${insight.priority} | <strong>Severity:</strong> \${insight.severity}</p>
                      <details>
                        <summary style="cursor: pointer; color: #7c3aed;">View Full Analysis</summary>
                        <p style="margin-top: 12px; white-space: pre-wrap;">\${insight.detailedAnalysis}</p>
                        <h4>Recommendations:</h4>
                        <ul>
                          \${insight.recommendations.map(rec => \`<li><strong>\${rec.title}:</strong> \${rec.description}</li>\`).join('')}
                        </ul>
                      </details>
                    </div>
                  \`;
                });

                result.innerHTML = html;
              } else {
                result.innerHTML = \`<p style="color: red;">Error: \${data.error.message}</p>\`;
              }
            } catch (error) {
              result.innerHTML = \`<p style="color: red;">Error: \${error.message}</p>\`;
            }
          }
        </script>
      </body>
    </html>
  `);
});

// Root endpoint
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing.html'));
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 Comparative Cohort Intelligence - Dev Server');
  console.log('='.repeat(70));
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🏆 HACKATHON DEMO: http://localhost:${PORT}/hackathon  ⭐ START HERE!`);
  console.log(`📊 GL ASSESSMENT: http://localhost:${PORT}/gl  ⭐ NEW! (NGMT/PTM/CAT4)`);
  console.log(`🏫 MAT View: http://localhost:${PORT}/mat`);
  console.log(`🎨 Simple Demo: http://localhost:${PORT}/demo`);
  console.log('='.repeat(70));
  console.log('📚 Sample Data: 4 anonymous schools in Horizon Academy Trust');
  console.log('   • School A: 52% FSM, SAS 92, Declining (needs attention)');
  console.log('   • School B: 32% FSM, SAS 100, Stable (average)');
  console.log('   • School C: 48% FSM, SAS 105, Improving (best practice!)');
  console.log('   • School D: 12% FSM, SAS 110, Stable (high performer)');
  console.log('='.repeat(70));
  console.log(aiService ? '✅ Claude API ready' : '⚠️  Using mock insights (set ANTHROPIC_API_KEY in .env)');
  console.log('='.repeat(70) + '\n');
});

// ============================================================================
// MOCK INSIGHT GENERATOR (for demo without API key)
// ============================================================================

/**
 * Map domains and skills to strand IDs and generate actionable links
 */
function getStrandActionableLink(cohortId: string, domain: string, skill: string): string {
  // Map domains and skills to strand IDs
  const strandMappings: Record<string, string> = {
    'Number - fractions': 'number-fractions',
    'Number - operations': 'number-operations',
    'Number - place value': 'number-operations',
    'Algebra': 'algebra-sequences',
    'Algebra - sequences': 'algebra-sequences',
    'Measurement': 'measurement',
    'Geometry': 'geometry',
    'Statistics': 'statistics',
  };

  const strandId = strandMappings[domain] || strandMappings[domain + ' - ' + skill.toLowerCase()];

  if (strandId) {
    return `📊 <a href="/school/${cohortId}/strand/${strandId}" style="color: #3b82f6; font-weight: 600; text-decoration: underline;">View strand analysis</a> to see National Curriculum objectives and student-level mastery data.`;
  }

  return `Review detailed skills breakdown at <a href="/school/${cohortId}/skills" style="color: #3b82f6; font-weight: 600; text-decoration: underline;">skills analysis page</a>.`;
}

function generateMockInsightPanel(
  viewLevel: ViewLevel,
  cohortId: string,
  assessmentId: string,
  targetCohort: any,
  similarCohorts: any[],
  outliers: any[]
): InsightPanel {
  const mockInsights: any[] = [];

  // If we have outliers, generate insights from them
  if (outliers.length > 0) {
    outliers.slice(0, 3).forEach((outlier, idx) => {
    mockInsights.push({
      insightId: `mock_${cohortId}_${idx}`,
      viewLevel,
      cohortId,
      assessmentId,
      severity: outlier.severity,
      type: 'skill_gap',
      priority: idx + 1,
      title: `${outlier.skill === 'Overall' ? outlier.contentDomain : outlier.skill}: ${outlier.gap > 0 ? '+' : ''}${outlier.gap.toFixed(1)}% gap`,
      summary: `${outlier.gap < 0 ? 'Focus area identified: ' : 'Strength area: '}${outlier.skill} ${outlier.gap < 0 ? 'needs improvement' : 'performing well'} (${outlier.gap > 0 ? '+' : ''}${outlier.gap.toFixed(1)}%)`,
      detailedAnalysis: `Skill-Level Analysis - ${outlier.contentDomain} > ${outlier.skill}:\n\n` +
        `**Performance Data:**\n` +
        `• Your Score: ${outlier.currentScore.toFixed(1)}%\n` +
        `• Similar Schools Average: ${outlier.expectedScore.toFixed(1)}%\n` +
        `• Performance Gap: ${outlier.gap > 0 ? '+' : ''}${outlier.gap.toFixed(1)}%\n` +
        `• Statistical Significance: ${outlier.isSignificant ? 'Significant' : 'Marginal'} (effect size: ${outlier.effectSize.toFixed(2)})\n\n` +
        `**What This Means:**\n` +
        (outlier.gap < 0
          ? `This skill is ${Math.abs(outlier.gap) > 10 ? 'significantly' : 'relatively'} weaker than demographically similar schools. ${outlier.severity === 'critical' ? 'Urgent intervention recommended.' : 'Targeted support needed.'}\n\n` +
            `**Recommended Actions:**\n` +
            `1. Review teaching approach for this specific skill\n` +
            `2. Identify students struggling with this concept\n` +
            `3. Implement focused intervention (e.g., small group work, additional practice)\n` +
            `4. Check prerequisite knowledge - students may have foundation gaps`
          : `This skill is a relative strength${Math.abs(outlier.gap) > 5 ? ' - excellent performance!' : ''}. Consider:\n` +
            `1. Maintaining current teaching approach\n` +
            `2. Sharing strategies with other schools\n` +
            `3. Setting stretch goals for highest achievers\n` +
            `4. Using this skill as foundation for more advanced concepts`
        ),
      evidence: {
        currentPerformance: outlier.currentScore,
        comparisonPerformance: outlier.expectedScore,
        gap: outlier.gap,
        gapPercentage: (outlier.gap / outlier.expectedScore * 100),
        effectSize: outlier.effectSize,
        zScore: outlier.zScore,
        isSignificant: true,
        comparisonCohorts: similarCohorts.slice(0, 3).map(sc => ({
          cohortId: sc.cohortId,
          cohortName: sc.cohortName,
          cohortType: 'school',
          demographics: sc.demographics,
          similarityScore: sc.similarityScore,
          performance: sc.assessment.avgSAS,
          gap: sc.assessment.avgSAS - targetCohort.assessment.avgSAS,
        })),
      },
      recommendations: [
        {
          recommendationId: `rec_${idx}`,
          title: `Targeted Intervention: ${outlier.skill}`,
          description: `Implement focused teaching for "${outlier.skill}" skill. ${outlier.gap < 0
            ? `Students are ${Math.abs(outlier.gap).toFixed(0)}% below similar schools - prioritize this for intervention groups. Use concrete examples, visual aids, and regular practice.`
            : `This is a strength area - use it to build advanced skills and support peer learning.`} ${getStrandActionableLink(cohortId, outlier.contentDomain, outlier.skill)}`,
          rationale: `${outlier.gap < 0
            ? `Gap of ${Math.abs(outlier.gap).toFixed(1)}% indicates students need additional support on this specific skill`
            : `Strong performance (${outlier.gap.toFixed(1)}% above average) shows effective teaching approach`}`,
          actionType: outlier.gap < 0 ? 'intervention' : 'maintain',
          priority: 1,
          targetMetric: {
            metric: `${outlier.skill} mastery`,
            currentValue: outlier.currentScore,
            targetValue: outlier.gap < 0 ? outlier.expectedScore : Math.min(100, outlier.currentScore + 5),
            timeframe: 'next assessment cycle',
          },
          dashboardActions: [
            {
              label: 'View Details',
              actionType: 'navigate',
              targetUrl: `/school/${cohortId}/skills`,
            },
            {
              label: 'Track Progress',
              actionType: 'create_report',
              parameters: { skill: outlier.skill },
            }
          ],
        },
        {
          recommendationId: `rec_${idx}_drill`,
          title: `Drill Down to Student Level`,
          description: `<a href="/school/${cohortId}/skills" style="color: #d946ef; font-weight: 600; text-decoration: underline;">View student-by-student mastery data</a> for "${outlier.skill}" to identify exactly which students need support. ${outlier.gap < 0
            ? `Target the Foundation group (likely 20-30% of students) who haven't mastered this skill.`
            : `Identify highest achievers for extension activities and peer mentoring roles.`}`,
          rationale: `Student-level data reveals which specific learners need intervention, enabling targeted grouping`,
          actionType: 'drill_down',
          priority: 2,
          dashboardActions: [
            {
              label: 'View Student Data',
              actionType: 'navigate',
              targetUrl: `/school/${cohortId}/skills`,
            },
            {
              label: 'View Strand Details',
              actionType: 'navigate',
              targetUrl: `/strand/${cohortId}/${encodeURIComponent(outlier.contentDomain)}`,
            }
          ],
        },
      ],
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
    });
  } else {
    // No outliers detected - generate insights based on overall performance and comparison to similar cohorts
    const avgSimilarSAS = similarCohorts.length > 0
      ? similarCohorts.reduce((sum, c) => sum + c.assessment.avgSAS, 0) / similarCohorts.length
      : 100;

    const gap = targetCohort.assessment.avgSAS - avgSimilarSAS;
    const severity = Math.abs(gap) > 8 ? 'critical' : Math.abs(gap) > 5 ? 'attention' : 'positive';

    // Performance vs similar schools
    mockInsights.push({
      insightId: `mock_${cohortId}_overall`,
      viewLevel,
      cohortId,
      assessmentId,
      severity,
      type: gap < 0 ? 'skill_gap' : 'positive',
      priority: 1,
      title: `Overall Performance: ${gap > 0 ? '+' : ''}${gap.toFixed(1)} SAS vs Similar Schools`,
      summary: `${targetCohort.cohortName} is performing ${Math.abs(gap).toFixed(1)} SAS points ${gap > 0 ? 'above' : 'below'} schools with similar demographics`,
      detailedAnalysis: `Performance Analysis:\n\n` +
        `• Your Score: ${targetCohort.assessment.avgSAS} SAS (Stanine ${targetCohort.assessment.avgStanine})\n` +
        `• Similar Schools Average: ${avgSimilarSAS.toFixed(1)} SAS\n` +
        `• Gap: ${gap > 0 ? '+' : ''}${gap.toFixed(1)} SAS points\n` +
        `• Demographics: ${targetCohort.demographics.fsmPercentage}% FSM, ${targetCohort.demographics.ealPercentage}% EAL, ${targetCohort.demographics.sendPercentage}% SEND\n\n` +
        `${gap < -5 ? 'This is a significant underperformance that requires investigation.' : gap > 5 ? 'Excellent performance - consider sharing best practices with other schools.' : 'Performance is broadly in line with similar schools.'}`,
      evidence: {
        currentPerformance: targetCohort.assessment.avgSAS,
        comparisonPerformance: avgSimilarSAS,
        gap: gap,
        gapPercentage: (gap / avgSimilarSAS * 100),
        effectSize: gap / 15, // Approximate effect size
        isSignificant: Math.abs(gap) > 5,
        comparisonCohorts: similarCohorts.slice(0, 3).map(sc => ({
          cohortId: sc.cohortId,
          cohortName: sc.cohortName,
          cohortType: 'school',
          demographics: sc.demographics,
          similarityScore: sc.similarityScore,
          performance: sc.assessment.avgSAS,
          gap: sc.assessment.avgSAS - targetCohort.assessment.avgSAS,
        })),
      },
      recommendations: [
        {
          recommendationId: `rec_overall`,
          title: gap < 0 ? 'Investigate Underperformance' : 'Maintain Standards',
          description: gap < 0
            ? `Review teaching practices, curriculum delivery, and barriers to learning. Compare with higher-performing similar schools. <a href="/school/${cohortId}/skills" style="color: #3b82f6; font-weight: 600; text-decoration: underline;">View detailed skills analysis</a> to identify specific areas needing attention.`
            : 'Document successful strategies for sharing with other schools in the trust.',
          rationale: `${Math.abs(gap).toFixed(1)} SAS point ${gap < 0 ? 'gap' : 'advantage'} vs demographically similar schools`,
          actionType: gap < 0 ? 'investigate' : 'maintain',
          priority: 1,
          targetMetric: {
            metric: 'Overall SAS',
            currentValue: targetCohort.assessment.avgSAS,
            targetValue: gap < 0 ? avgSimilarSAS : targetCohort.assessment.avgSAS + 3,
            timeframe: 'next assessment',
          },
          dashboardActions: [
            {
              label: 'View Skills Analysis',
              actionType: 'navigate',
              targetUrl: `/school/${cohortId}/skills`,
            },
            {
              label: 'Compare to Peers',
              actionType: 'navigate',
              targetUrl: `/mat/schools`,
            }
          ],
        },
        {
          recommendationId: `rec_overall_classes`,
          title: 'Class-Level Deep Dive',
          description: `Review performance across all classes. <a href="/school/${cohortId}/skills#heatmap" style="color: #3b82f6; font-weight: 600; text-decoration: underline;">View cross-class heatmap</a> to identify which classes need targeted support on specific strands.`,
          rationale: `Class-level variation may reveal specific teaching quality or cohort composition issues`,
          actionType: 'drill_down',
          priority: 2,
          dashboardActions: [
            {
              label: 'View Heatmap',
              actionType: 'navigate',
              targetUrl: `/school/${cohortId}/skills#heatmap`,
            },
            {
              label: 'View All Classes',
              actionType: 'navigate',
              targetUrl: `/school/${cohortId}/classes`,
            }
          ],
        },
      ],
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    // Trend analysis
    if (targetCohort.assessment.scoreTrend === 'declining') {
      mockInsights.push({
        insightId: `mock_${cohortId}_trend`,
        viewLevel,
        cohortId,
        assessmentId,
        severity: 'critical',
        type: 'trend',
        priority: 2,
        title: 'Declining Performance Trend',
        summary: `${targetCohort.cohortName} is showing a declining trend in performance`,
        detailedAnalysis: `Trend Analysis:\n\n` +
          `• Current Trend: Declining\n` +
          `• Current SAS: ${targetCohort.assessment.avgSAS}\n` +
          `• This indicates performance has decreased over recent assessment periods\n\n` +
          `Urgent investigation needed to identify root causes:\n` +
          `• Has there been staff turnover?\n` +
          `• Changes in cohort composition?\n` +
          `• Impact of external factors?\n` +
          `• Curriculum delivery issues?`,
        evidence: {
          currentPerformance: targetCohort.assessment.avgSAS,
          isSignificant: true,
          comparisonCohorts: [],
        },
        recommendations: [
          {
            recommendationId: `rec_trend`,
            title: 'Reverse Declining Trend',
            description: `Conduct root cause analysis and implement immediate interventions. <a href="/dashboard" style="color: #3b82f6; font-weight: 600; text-decoration: underline;">View trend dashboard</a> to see performance over time across all assessments and identify which domains are declining fastest.`,
            rationale: 'Declining performance requires urgent action to prevent further deterioration',
            actionType: 'investigate',
            priority: 1,
          },
          {
            recommendationId: `rec_trend_strand`,
            title: 'Identify Problematic Strands',
            description: `<a href="/school/${cohortId}/skills" style="color: #3b82f6; font-weight: 600; text-decoration: underline;">Drill down to strand level</a> to see which specific National Curriculum objectives are driving the decline. Focus intervention resources on strands with "concern" or "emerging" mastery levels.`,
            rationale: `Strand-level data reveals which specific curriculum areas are contributing to overall decline`,
            actionType: 'drill_down',
            priority: 1,
          },
        ],
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      });
    } else if (targetCohort.assessment.scoreTrend === 'improving') {
      mockInsights.push({
        insightId: `mock_${cohortId}_positive`,
        viewLevel,
        cohortId,
        assessmentId,
        severity: 'positive',
        type: 'positive',
        priority: 2,
        title: 'Improving Performance Trend',
        summary: `${targetCohort.cohortName} shows consistent improvement`,
        detailedAnalysis: `Positive Trend Identified:\n\n` +
          `• Current Trend: Improving\n` +
          `• Current SAS: ${targetCohort.assessment.avgSAS}\n` +
          `• Performance has increased over recent periods\n\n` +
          `Consider documenting successful strategies for sharing across the MAT.`,
        evidence: {
          currentPerformance: targetCohort.assessment.avgSAS,
          isSignificant: true,
          comparisonCohorts: [],
        },
        recommendations: [
          {
            recommendationId: `rec_maintain`,
            title: 'Document Best Practices',
            description: `Capture what's working well for peer learning opportunities. <a href="/dashboard" style="color: #3b82f6; font-weight: 600; text-decoration: underline;">View trend dashboard</a> to identify which domains show strongest improvement.`,
            rationale: 'Improving schools can share strategies with others',
            actionType: 'maintain',
            priority: 2,
          },
          {
            recommendationId: `rec_maintain_strands`,
            title: 'Share Successful Strand Teaching',
            description: `<a href="/school/${cohortId}/skills" style="color: #3b82f6; font-weight: 600; text-decoration: underline;">Review strand-level mastery</a> to identify which specific teaching approaches are working well. Share these practices with other schools in the MAT.`,
            rationale: `Strand-specific success can be replicated across the trust`,
            actionType: 'maintain',
            priority: 2,
          },
        ],
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      });
    }

    // Skill domain analysis - find weakest domain
    const weakestDomain = targetCohort.assessment.skillDomainScores
      .reduce((min, skill) => skill.score < min.score ? skill : min);

    if (weakestDomain.score < 50) {
      mockInsights.push({
        insightId: `mock_${cohortId}_domain`,
        viewLevel,
        cohortId,
        assessmentId,
        severity: 'attention',
        type: 'skill_gap',
        priority: 3,
        title: `Weakest Domain: ${weakestDomain.domain}`,
        summary: `${weakestDomain.domain} is the weakest area at ${weakestDomain.score}%`,
        detailedAnalysis: `Domain Analysis:\n\n` +
          `• Weakest Domain: ${weakestDomain.domain}\n` +
          `• Score: ${weakestDomain.score}%\n` +
          `• Items Correct: ${weakestDomain.itemsCorrect}/${weakestDomain.itemsAttempted}\n\n` +
          `Skill Breakdown:\n` +
          weakestDomain.skillBreakdown.map(sb => `• ${sb.skill}: ${sb.score}%`).join('\n'),
        evidence: {
          currentPerformance: weakestDomain.score,
          isSignificant: true,
          comparisonCohorts: [],
        },
        recommendations: [
          {
            recommendationId: `rec_domain`,
            title: `Target ${weakestDomain.domain}`,
            description: `Focus teaching time and interventions on ${weakestDomain.domain}. ${getStrandActionableLink(cohortId, weakestDomain.domain, '')}`,
            rationale: `Lowest performing domain at ${weakestDomain.score}%`,
            actionType: 'investigate',
            priority: 2,
            targetMetric: {
              metric: `${weakestDomain.domain} score`,
              currentValue: weakestDomain.score,
              targetValue: 60,
              timeframe: 'next term',
            },
          },
        ],
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      });
    }
  }

  return {
    panelId: `mock_panel_${cohortId}_${Date.now()}`,
    viewLevel,
    cohortId,
    assessmentId,
    insights: mockInsights,
    summary: {
      totalComparisons: similarCohorts.length,
      significantGaps: outliers.filter(o => o.severity === 'critical' || o.severity === 'high').length,
      peerLearningOpportunities: 0,
    },
    generatedAt: new Date(),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  };
}
