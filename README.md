# Comparative Cohort Intelligence - AI Insights Feature

AI-powered analytics panel that automatically identifies outliers, extracts actionable insights, and saves users 20-30 minutes of manual chart analysis.

## Project Structure

```
claude.curric.gaps/
├── api/                    # REST API endpoints
├── models/                 # Data models and schemas
├── engine/                 # Analysis engine (similarity, outliers, AI)
├── prompts/               # Claude API prompt templates
├── components/            # Frontend React components
└── docs/                  # Documentation and examples
```

## Key Features

- **Automatic outlier detection** - Skill-level performance gap analysis
- **Similar demographic matching** - Fair comparisons (FSM%, EAL%, SEND%)
- **Skill gap analysis** - LLM-powered domain/skill identification
- **Misconception detection** - Error pattern analysis
- **Prerequisite mapping** - Foundation skill deficit tracking
- **Prioritized recommendations** - Top 3-5 insights, ranked by impact

## Tech Stack

- **Backend**: Node.js/TypeScript
- **AI**: Claude API (Anthropic)
- **Analysis**: Statistical functions (z-scores, effect sizes)
- **Frontend**: React/TypeScript
- **Caching**: 5-15 minute cache layer

## Getting Started

See `docs/IMPLEMENTATION.md` for detailed setup instructions.
