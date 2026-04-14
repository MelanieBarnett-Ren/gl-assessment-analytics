# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GL Assessment Analytics Platform - An AI-powered educational analytics system that generates actionable insights from GL Assessment data (NGMT, PTM, CAT4) for schools in Multi-Academy Trusts (MATs). Uses Claude API to automatically identify performance outliers, extract skill-level gaps, and generate prioritized recommendations.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run tests
npm test

# Seed mock data
npm run seed

# Start production server
npm start
```

## Environment Setup

Create a `.env` file from `.env.example`:
- `ANTHROPIC_API_KEY` - Required for AI insights generation (Claude API)
- `ANTHROPIC_MODEL` - Default: `claude-sonnet-4-6`
- `PORT` - Server port (default: 3001)
- `CACHE_TTL_MINUTES` - Insights cache duration (default: 15)

The dev server will run with mock insights if no API key is provided.

## Demo Routes

Access these routes when the dev server is running:

- `/` - Landing page with all available demos
- `/gl` - **Primary demo**: GL Assessment integrated insights (NGMT/PTM/CAT4)
- `/mat` - Multi-Academy Trust visualization dashboard
- `/dashboard` - Visual analytics dashboard with Highcharts
- `/school/:schoolId/skills` - School-level skills analysis
- `/school/:schoolId/strand/:strandId` - Strand-level drill-down with National Curriculum objectives
- `/class/:classId` - Class-level student list and performance details

## Architecture

### High-Level Flow

```
User Request → API Endpoints → Analysis Engine → Claude API → Insights Panel
                     ↓              ↓
                 Cache Layer    Statistical Analysis
                                (similarity, outliers)
```

### Directory Structure

- **`api/`** - REST API endpoint definitions and request/response types
- **`engine/`** - Core analysis algorithms:
  - `similarity-matcher.ts` - Finds cohorts with similar demographics (FSM%, EAL%, SEND%)
  - `outlier-detector.ts` - Detects statistical performance outliers using z-scores and effect sizes
  - `ai-service.ts` - Claude API integration for generating insights
  - `gl-assessment-analyzer.ts` - GL Assessment-specific analysis (NGMT/PTM/CAT4)
  - `trend-analyzer.ts` - Historical performance trends
  - `misconception-detector.ts` - Error pattern analysis
  - `prerequisite-analyzer.ts` - Foundation skill deficit tracking
  - `focus-group-identifier.ts` - Student grouping for interventions
- **`models/`** - TypeScript interfaces and data models:
  - `insights.ts` - Insight, InsightPanel, Recommendation types
  - `assessment-data.ts` - CohortAssessment, Demographics, SkillDomainScore
  - `curriculum-mappings.ts` - UK National Curriculum objectives and progressions
- **`prompts/`** - Claude API prompt templates for generating insights at different view levels (MAT, school, student)
- **`server/`** - Express server and demo pages:
  - `dev-server.ts` - Main server with all routes
  - `mock-data.ts` - Sample data for 4 anonymous schools
  - `gl-assessment-data.ts` - GL Assessment mock data
  - `gl-class-data.ts` - Class-level student data
  - `*.html` - Demo pages (landing, dashboards, visualizations)
- **`components/`** - React components (InsightsPanel.tsx)

### Key Data Flow

1. **API Request**: Client requests insights for a cohort (MAT/school/class) and assessment
2. **Cache Check**: Server checks in-memory cache (15-min TTL by default)
3. **Load Data**: Fetch target cohort's assessment data and demographics
4. **Find Similar Cohorts**: Use `similarity-matcher.ts` to find demographically similar cohorts
5. **Detect Outliers**: Use `outlier-detector.ts` to identify skill-level gaps (z-scores, effect sizes)
6. **Generate Insights**: Pass context to Claude API via `ai-service.ts` with structured prompts
7. **Return Panel**: Package insights into `InsightPanel` with top 3-5 prioritized insights

### Prompt Architecture

Three specialized prompts in `prompts/insight-generation.ts`:
- **MAT-level** (`generateMATInsightsPrompt`): Trust-wide patterns, strategic resource allocation, peer learning across schools
- **School-level** (`generateSchoolInsightsPrompt`): Skill-level gaps, foundation analysis, comparison to similar schools
- **Student/Class-level** (`generateStudentInsightsPrompt`): Focus groups, misconception detection, practical interventions

All prompts return structured JSON with insights that include:
- Severity (critical/attention/positive)
- Type (skill_gap/trend/peer_learning/misconception)
- Priority ranking
- Detailed analysis with specific numbers
- Actionable recommendations with target metrics

## Statistical Analysis

### Similarity Matching

Uses weighted demographic comparison (configurable weights):
- FSM%: 0.4 (default)
- EAL%: 0.3 (default)
- SEND%: 0.3 (default)

Returns similarity score 0-1 (default minimum: 0.7)

### Outlier Detection

Identifies performance gaps using:
- **Z-scores**: Standard deviations from mean of similar cohorts
- **Effect sizes**: Cohen's d for practical significance
- **Severity classification**: critical (>1.0), high (>0.8), moderate (>0.5), low (<0.5)

Only outliers with min effect size 0.5 are included in insights.

## Claude API Integration

### Request Structure

The AI service constructs context including:
- Target cohort performance (SAS scores, skill domain breakdowns)
- Similar cohort comparisons with demographics and performance
- Historical trends (if available)
- Statistical outliers with effect sizes
- View level (MAT/school/student) for appropriate prompt

### Response Parsing

Claude returns structured JSON with insights array. Each insight contains:
- Severity, type, priority
- Title and summary for quick scanning
- Detailed analysis with evidence
- Recommendations with specific target metrics
- Optional peer examples for learning opportunities

### Token Usage

Typical token counts per request:
- Input: ~3,000 tokens (assessment data + context)
- Output: ~1,500 tokens (5 insights with recommendations)
- Cost: ~$0.03 per generation

Cache hits avoid API calls (15-min TTL = ~96 calls/day per school).

## GL Assessment Integration

The system integrates three GL Assessment types:

1. **NGMT** (New Group Mathematics Test): Standardized maths assessment
2. **PTM** (Progress Test in Maths): Curriculum-aligned progress monitoring
3. **CAT4** (Cognitive Abilities Test): Cognitive reasoning baseline

Analysis correlates PTM performance against CAT4 cognitive scores to identify:
- Students performing below potential (PTM < CAT4)
- Students performing above expectations (PTM > CAT4)
- Specific strand-level gaps vs. National Curriculum objectives

## National Curriculum Mapping

`models/curriculum-mappings.ts` contains UK National Curriculum progressions:
- Key Stage 2 (Years 3-6)
- Domains: Number, Algebra, Measurement, Geometry, Statistics
- Each objective includes:
  - Year group and statement
  - Expected mastery threshold
  - Prerequisite objectives (dependency graph)

Used for:
- Mapping assessment items to curriculum objectives
- Identifying foundation gaps (missing prerequisites)
- Generating strand-level drill-down views

## Caching Strategy

In-memory cache (production should use Redis/database):
- Key: `{viewLevel}_{cohortId}_{assessmentId}`
- TTL: 15 minutes (configurable via `CACHE_TTL_MINUTES`)
- Cache hit rate target: >70%
- Cache includes full `InsightPanel` with generated timestamp

Force refresh with `?forceRefresh=true` query parameter.

## Adding New Analysis Engines

To add a new analysis algorithm:

1. Create new file in `engine/` (e.g., `new-analyzer.ts`)
2. Export analysis function with clear input/output types
3. Integrate into `dev-server.ts` insights generation flow (around line 100-150)
4. Update prompt context in `prompts/insight-generation.ts` if insights should be AI-enhanced
5. Consider adding new `InsightType` to `models/insights.ts` if needed

## Adding New View Levels

Current view levels: MAT, school, student/class

To add new level:

1. Add type to `ViewLevel` in `models/insights.ts`
2. Create new prompt generator in `prompts/insight-generation.ts`
3. Add route in `server/dev-server.ts`
4. Update API documentation in `api/endpoints.ts`
5. Create HTML demo page in `server/` directory

## Mock Data Structure

`server/mock-data.ts` provides 4 anonymous schools:
- School A: 52% FSM, SAS 92, declining trend (needs attention)
- School B: 32% FSM, SAS 100, stable (average)
- School C: 48% FSM, SAS 105, improving (best practice example)
- School D: 12% FSM, SAS 110, stable (high performer)

Used for demos without requiring real data integration.

## Working with Insights

Each `Insight` object contains:
- **Evidence**: Statistical backing (gaps, effect sizes, z-scores)
- **Recommendations**: Actionable steps with target metrics
- **Peer examples**: Best practices from similar high-performing cohorts

When modifying insight generation:
- Ensure statistical significance (effect size > 0.5)
- Include specific numbers (not vague descriptions)
- Provide actionable recommendations with measurable targets
- Rank by impact and urgency (priority 1-5)
- Link to drill-down views where available

## Performance Considerations

- **API calls**: Cache aggressively (15-min TTL), use force refresh sparingly
- **Token usage**: Monitor via console logs (each generation logged with token count)
- **Response time**: Target <2s for cached, <10s for fresh generation
- **Error handling**: AI service errors fall back to error response (don't crash server)

## TypeScript Configuration

- Target: ES2020
- Module: CommonJS (Node.js compatibility)
- JSX: React
- Strict mode enabled
- Output directory: `./dist`

All source files compile to `dist/` for production deployment.
