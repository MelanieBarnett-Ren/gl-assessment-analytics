# Implementation Guide

Complete guide for implementing the Comparative Cohort Intelligence feature.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard Frontend                        │
│                  (React Components)                          │
└───────────────────────┬─────────────────────────────────────┘
                        │ REST API calls
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│    GET /api/insights/:viewLevel/:cohortId/:assessmentId     │
│    GET /api/cohorts/:cohortId/similar                       │
│    GET /api/analysis/outliers/:cohortId/:assessmentId       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   Analysis Engine                            │
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Similarity   │  │     Outlier     │  │  AI Service  │ │
│  │    Matcher     │  │    Detector     │  │   (Claude)   │ │
│  └────────────────┘  └─────────────────┘  └──────────────┘ │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  • Assessment Data (item-level, overall scores)              │
│  • Demographics (FSM%, EAL%, SEND%)                         │
│  • Historical Trends                                         │
│  • Curriculum Mappings (UK National Curriculum)             │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1: Environment Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- TypeScript 5+
- React 18+
- Anthropic API key

### Install Dependencies

```bash
cd claude.curric.gaps

# Core dependencies
npm install @anthropic-ai/sdk
npm install react react-dom

# TypeScript
npm install --save-dev typescript @types/react @types/node

# Optional: Testing
npm install --save-dev jest @testing-library/react
```

### Environment Variables

Create `.env` file:

```bash
# Claude API
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL=claude-sonnet-4-6

# Database (your existing system)
DATABASE_URL=postgresql://...

# Cache settings
CACHE_TTL_MINUTES=15
```

---

## Step 2: Database Schema

Add these tables to your existing database:

### Curriculum Mappings Table

```sql
CREATE TABLE curriculum_objectives (
  objective_id VARCHAR(50) PRIMARY KEY,
  key_stage VARCHAR(10) NOT NULL,
  year_group INTEGER NOT NULL,
  domain VARCHAR(100) NOT NULL,
  subdomain VARCHAR(100),
  statement TEXT NOT NULL,
  expected_pass_rate DECIMAL(5,2),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_curriculum_year ON curriculum_objectives(year_group);
CREATE INDEX idx_curriculum_domain ON curriculum_objectives(domain);
```

### Curriculum Prerequisites Table

```sql
CREATE TABLE curriculum_prerequisites (
  objective_id VARCHAR(50) REFERENCES curriculum_objectives(objective_id),
  prerequisite_id VARCHAR(50) REFERENCES curriculum_objectives(objective_id),
  essential BOOLEAN DEFAULT true,
  
  PRIMARY KEY (objective_id, prerequisite_id)
);
```

### Item-Curriculum Mapping Table

```sql
CREATE TABLE item_curriculum_mappings (
  item_id VARCHAR(50) PRIMARY KEY,
  primary_objective_id VARCHAR(50) REFERENCES curriculum_objectives(objective_id),
  difficulty VARCHAR(20), -- 'below', 'at', 'above', 'exceeding'
  
  FOREIGN KEY (item_id) REFERENCES assessment_items(item_id)
);
```

### Insights Cache Table

```sql
CREATE TABLE insights_cache (
  cache_id VARCHAR(100) PRIMARY KEY,
  view_level VARCHAR(20) NOT NULL,
  cohort_id VARCHAR(50) NOT NULL,
  assessment_id VARCHAR(50) NOT NULL,
  
  insights_json JSONB NOT NULL,
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  
  tokens_used INTEGER,
  processing_time_ms INTEGER
);

CREATE INDEX idx_cache_lookup ON insights_cache(view_level, cohort_id, assessment_id);
CREATE INDEX idx_cache_expiry ON insights_cache(expires_at);
```

---

## Step 3: Load Curriculum Data

Populate the curriculum_objectives table with UK National Curriculum data:

```typescript
// scripts/load-curriculum-data.ts

import { KS2_MULTIPLICATION_PROGRESSION, KS2_FRACTIONS_PROGRESSION } from '../models/curriculum-mappings';
import { db } from './database';

async function loadCurriculumData() {
  const progressions = [
    KS2_MULTIPLICATION_PROGRESSION,
    KS2_FRACTIONS_PROGRESSION,
  ];

  for (const progression of progressions) {
    for (const objective of progression.objectives) {
      // Insert objective
      await db.query(`
        INSERT INTO curriculum_objectives 
        (objective_id, key_stage, year_group, domain, statement, expected_pass_rate)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (objective_id) DO UPDATE SET
          statement = EXCLUDED.statement,
          expected_pass_rate = EXCLUDED.expected_pass_rate
      `, [
        objective.objectiveId,
        objective.keyStage,
        objective.yearGroup,
        objective.domain,
        objective.statement,
        objective.expectedMastery.passRate,
      ]);

      // Insert prerequisites
      for (const prereqId of objective.prerequisiteObjectives) {
        await db.query(`
          INSERT INTO curriculum_prerequisites 
          (objective_id, prerequisite_id, essential)
          VALUES ($1, $2, $3)
          ON CONFLICT DO NOTHING
        `, [objective.objectiveId, prereqId, true]);
      }
    }
  }

  console.log('Curriculum data loaded successfully');
}

loadCurriculumData();
```

Run the script:
```bash
npx ts-node scripts/load-curriculum-data.ts
```

---

## Step 4: API Implementation

### Main Insights Endpoint

```typescript
// api/routes/insights.ts

import express from 'express';
import { InsightsService } from '../services/insights-service';

const router = express.Router();
const insightsService = new InsightsService();

// GET /api/insights/:viewLevel/:cohortId/:assessmentId
router.get('/:viewLevel/:cohortId/:assessmentId', async (req, res) => {
  try {
    const { viewLevel, cohortId, assessmentId } = req.params;
    const { forceRefresh, maxInsights } = req.query;

    // Validate parameters
    if (!['mat', 'school', 'student'].includes(viewLevel)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMETERS', message: 'Invalid view level' },
      });
    }

    // Check cache first (unless forceRefresh)
    if (!forceRefresh) {
      const cached = await insightsService.getCachedInsights(
        viewLevel,
        cohortId,
        assessmentId
      );

      if (cached) {
        return res.json({
          success: true,
          data: cached,
          cached: true,
          generatedAt: cached.generatedAt,
          expiresAt: cached.expiresAt,
        });
      }
    }

    // Generate new insights
    const insightPanel = await insightsService.generateInsightsPanel(
      viewLevel,
      cohortId,
      assessmentId,
      { maxInsights: Number(maxInsights) || 5 }
    );

    // Cache the result
    await insightsService.cacheInsights(insightPanel);

    res.json({
      success: true,
      data: insightPanel,
      cached: false,
      generatedAt: insightPanel.generatedAt,
      expiresAt: insightPanel.expiresAt,
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'AI_SERVICE_ERROR',
        message: error.message,
      },
    });
  }
});

export default router;
```

### Insights Service

```typescript
// services/insights-service.ts

import { AIService } from '../engine/ai-service';
import { findSimilarCohorts } from '../engine/similarity-matcher';
import { detectOutliers } from '../engine/outlier-detector';
import { InsightPanel, ViewLevel } from '../models/insights';
import { db } from './database';

export class InsightsService {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }

  async generateInsightsPanel(
    viewLevel: ViewLevel,
    cohortId: string,
    assessmentId: string,
    options: { maxInsights?: number } = {}
  ): Promise<InsightPanel> {
    // 1. Load target cohort data
    const targetCohort = await this.loadCohortData(cohortId, assessmentId);

    // 2. Find similar cohorts for comparison
    const allCohorts = await this.loadAllCohorts(assessmentId, viewLevel);
    const similarCohorts = findSimilarCohorts(
      { ...targetCohort, cohortId, cohortName: cohortId },
      allCohorts,
      { maxResults: 10 }
    );

    // 3. Detect statistical outliers (skill-level gaps)
    const outliers = detectOutliers(
      targetCohort.assessment.skillDomainScores,
      similarCohorts.map(c => ({
        skills: c.assessment.skillDomainScores,
      }))
    );

    // 4. Load historical trends (optional)
    const historicalTrends = await this.loadHistoricalTrends(cohortId);

    // 5. Build context for AI
    const context = {
      viewLevel,
      targetCohort,
      similarCohorts,
      historicalTrends,
      outliers,
    };

    // 6. Generate insights with Claude
    const { insights, tokensUsed } = await this.aiService.generateInsights(context);

    // 7. Build insight panel
    const insightPanel: InsightPanel = {
      panelId: `panel_${viewLevel}_${cohortId}_${Date.now()}`,
      viewLevel,
      cohortId,
      assessmentId,
      insights: insights.slice(0, options.maxInsights || 5),
      summary: {
        totalComparisons: similarCohorts.length,
        significantGaps: outliers.filter(o => o.severity === 'critical' || o.severity === 'high').length,
        peerLearningOpportunities: insights.filter(i => i.type === 'peer_learning').length,
      },
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    };

    return insightPanel;
  }

  async getCachedInsights(
    viewLevel: string,
    cohortId: string,
    assessmentId: string
  ): Promise<InsightPanel | null> {
    const result = await db.query(`
      SELECT insights_json, generated_at, expires_at
      FROM insights_cache
      WHERE view_level = $1 
        AND cohort_id = $2 
        AND assessment_id = $3
        AND expires_at > NOW()
      ORDER BY generated_at DESC
      LIMIT 1
    `, [viewLevel, cohortId, assessmentId]);

    if (result.rows.length === 0) return null;

    return result.rows[0].insights_json;
  }

  async cacheInsights(panel: InsightPanel): Promise<void> {
    await db.query(`
      INSERT INTO insights_cache 
      (cache_id, view_level, cohort_id, assessment_id, insights_json, generated_at, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      panel.panelId,
      panel.viewLevel,
      panel.cohortId,
      panel.assessmentId,
      JSON.stringify(panel),
      panel.generatedAt,
      panel.expiresAt,
    ]);
  }

  // ... other helper methods (loadCohortData, loadAllCohorts, etc.)
}
```

---

## Step 5: Frontend Integration

### Add InsightsPanel to Dashboard

```typescript
// dashboard/SchoolView.tsx

import React from 'react';
import { InsightsPanel } from '../../claude.curric.gaps/components/InsightsPanel';

interface SchoolViewProps {
  schoolId: string;
  assessmentId: string;
}

export const SchoolView: React.FC<SchoolViewProps> = ({ schoolId, assessmentId }) => {
  return (
    <div className="school-dashboard">
      {/* Existing dashboard content */}
      <section className="overview">
        <h1>School Performance Overview</h1>
        {/* ... existing charts/tables ... */}
      </section>

      {/* NEW: AI Insights Panel */}
      <section className="ai-insights">
        <InsightsPanel
          viewLevel="school"
          cohortId={schoolId}
          assessmentId={assessmentId}
          apiBaseUrl="/api"
        />
      </section>

      {/* Rest of dashboard */}
      <section className="detailed-analysis">
        {/* ... existing content ... */}
      </section>
    </div>
  );
};
```

### Import CSS

```typescript
// App.tsx or main entry point
import './claude.curric.gaps/components/InsightsPanel.css';
```

---

## Step 6: Testing

### Unit Tests

```typescript
// engine/__tests__/similarity-matcher.test.ts

import { calculateSimilarity, findSimilarCohorts } from '../similarity-matcher';

describe('Similarity Matcher', () => {
  test('calculates perfect similarity for identical demographics', () => {
    const target = { fsmPercentage: 30, ealPercentage: 10, sendPercentage: 15 };
    const candidate = { fsmPercentage: 30, ealPercentage: 10, sendPercentage: 15 };

    const similarity = calculateSimilarity(target, candidate);
    expect(similarity).toBe(1.0);
  });

  test('finds similar cohorts and ranks by similarity', () => {
    const target = {
      cohortId: 'school1',
      cohortName: 'Target School',
      demographics: { fsmPercentage: 30, ealPercentage: 10, sendPercentage: 15 },
    };

    const candidates = [
      { cohortId: 'school2', cohortName: 'Similar', demographics: { fsmPercentage: 32, ealPercentage: 12, sendPercentage: 14 } },
      { cohortId: 'school3', cohortName: 'Very Different', demographics: { fsmPercentage: 5, ealPercentage: 2, sendPercentage: 3 } },
    ];

    const matches = findSimilarCohorts(target, candidates, { minSimilarityScore: 0.7 });

    expect(matches.length).toBe(1); // Only similar school
    expect(matches[0].cohortId).toBe('school2');
  });
});
```

### Integration Test

```typescript
// api/__tests__/insights.test.ts

import request from 'supertest';
import app from '../app';

describe('GET /api/insights/:viewLevel/:cohortId/:assessmentId', () => {
  test('returns insights panel for valid request', async () => {
    const response = await request(app)
      .get('/api/insights/school/school123/assessment456')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('insights');
    expect(response.body.data.insights.length).toBeGreaterThan(0);
  });

  test('returns 400 for invalid view level', async () => {
    const response = await request(app)
      .get('/api/insights/invalid/school123/assessment456')
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INVALID_PARAMETERS');
  });
});
```

Run tests:
```bash
npm test
```

---

## Step 7: Deployment

### Build

```bash
npm run build
```

### Environment Configuration

Production `.env`:
```bash
ANTHROPIC_API_KEY=<production-key>
ANTHROPIC_MODEL=claude-sonnet-4-6
DATABASE_URL=<production-db>
CACHE_TTL_MINUTES=15
NODE_ENV=production
```

### Rate Limiting (Recommended)

```typescript
// middleware/rate-limiter.ts

import rateLimit from 'express-rate-limit';

export const insightsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many insight requests, please try again later.',
});

// Apply to routes
app.use('/api/insights', insightsRateLimiter);
```

---

## Step 8: Monitoring

### Track Key Metrics

```typescript
// services/metrics.ts

export async function trackInsightGeneration(
  viewLevel: string,
  tokensUsed: number,
  processingTime: number,
  success: boolean
) {
  // Log to your monitoring system (e.g., DataDog, CloudWatch)
  console.log('[METRICS]', {
    event: 'insight_generation',
    viewLevel,
    tokensUsed,
    processingTime,
    success,
    timestamp: new Date(),
  });

  // Store in database for analytics
  await db.query(`
    INSERT INTO insight_metrics 
    (view_level, tokens_used, processing_time_ms, success, created_at)
    VALUES ($1, $2, $3, $4, NOW())
  `, [viewLevel, tokensUsed, processingTime, success]);
}
```

### Dashboard Metrics

Monitor:
- **API response times** - Target: <2s for cached, <10s for fresh
- **Claude API token usage** - Track costs
- **Cache hit rate** - Target: >70%
- **Error rate** - Target: <1%
- **User engagement** - Track which insights lead to actions

---

## Cost Estimation

### Claude API Costs

With **claude-sonnet-4-6**:
- Input: ~$3 per million tokens
- Output: ~$15 per million tokens

**Per insight generation**:
- Input tokens: ~3,000 (assessment data + context)
- Output tokens: ~1,500 (5 insights with recommendations)
- Cost per generation: ~$0.03

**With 15-minute cache**:
- If school has 100 dashboard views per day
- Only ~96 API calls per day (1 per 15 min)
- Daily cost: ~$2.88
- Monthly cost: ~$86

**For entire MAT (20 schools)**:
- Monthly cost: ~$1,700

Cache effectiveness is key to cost control!

---

## Next Steps

1. **Pilot with 2-3 schools**
   - Gather feedback on insight quality
   - Tune AI prompts based on real data

2. **Build curriculum mapping**
   - Complete mapping of all assessment items to curriculum
   - Load full UK National Curriculum data

3. **Add misconception detection**
   - Implement error pattern analysis
   - Build misconception library

4. **Expand to MAT and Student views**
   - Implement MAT-level strategic insights
   - Build focus group identification for teachers

5. **User feedback loop**
   - Add thumbs up/down on insights
   - Track which recommendations are acted upon
   - Use feedback to improve prompts

---

## Support

For questions or issues:
- Technical docs: See `/docs` folder
- API reference: See `/api/endpoints.ts`
- Sample data: See `/models` folder
