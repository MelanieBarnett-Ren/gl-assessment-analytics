# 🚀 Quick Start Guide - Local Development

Get the Comparative Cohort Intelligence feature running locally in **5 minutes**.

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- (Optional) Anthropic API key for real Claude insights

---

## Step 1: Install Dependencies

```bash
cd claude.curric.gaps
npm install
```

This installs:
- `@anthropic-ai/sdk` - Claude API client
- `express` - Web server
- `typescript`, `tsx` - TypeScript runtime
- Other dependencies

---

## Step 2: Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your Anthropic API key (optional)
# If you don't have a key, the app will use mock insights
```

**`.env` file:**
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...  # Optional: Add your key here
PORT=3001
NODE_ENV=development
```

**Don't have an API key?** No problem! The app works with mock insights for testing.

---

## Step 3: Start the Development Server

```bash
npm run dev
```

You should see:

```
============================================================
🚀 Comparative Cohort Intelligence - Dev Server
============================================================
📍 Server: http://localhost:3001
🎨 Demo: http://localhost:3001/demo
📊 API: http://localhost:3001/api/insights/school/school1/assessment123
============================================================
✅ Claude API ready  (or ⚠️ Using mock insights)
============================================================
```

---

## Step 4: Open the Demo

Open your browser to: **http://localhost:3001/demo**

### What You'll See:

- **View Level Selector**: Choose MAT, School, or Student view
- **Cohort Selector**: Pick from 5 sample schools
- **Generate Insights Button**: Click to see AI analysis
- **Results Panel**: Shows 3-5 prioritised insights with recommendations

### Try This:

1. **Select "School" view**
2. **Choose "Oakwood Primary"** (below average performer)
3. **Click "Generate Insights"**
4. **Expand the insights** to see full analysis and recommendations

---

## Step 5: Test the API Directly

### Get Insights for a School

```bash
curl http://localhost:3001/api/insights/school/school1/assessment123
```

### List All Sample Cohorts

```bash
curl http://localhost:3001/api/data/cohorts
```

### Find Similar Cohorts

```bash
curl http://localhost:3001/api/cohorts/school1/similar
```

---

## Sample Data Included

The dev server comes with **5 sample schools**:

| School | FSM% | EAL% | SEND% | Avg SAS | Profile |
|--------|------|------|-------|---------|---------|
| **Oakwood Primary** | 45% | 15% | 18% | 96 | High FSM, below average |
| **Riverside Academy** | 28% | 12% | 14% | 102 | Medium FSM, average |
| **Valley School** | 42% | 18% | 16% | 108 | High FSM, **high performing** |
| **Hillside Primary** | 8% | 5% | 9% | 112 | Low FSM, high performing |
| **Meadow View** | 35% | 22% | 15% | 99 | Medium FSM, mixed |

### Key Comparisons:

- **Oakwood vs. Valley**: Similar demographics (high FSM), but Valley scores 12 points higher
- **Oakwood vs. Hillside**: Different demographics, not a fair comparison
- **Oakwood vs. Riverside**: Similar, Riverside slightly better

---

## Understanding the Insights

### With Mock Data (No API Key)

You'll see **statistical insights** based on outlier detection:
- Identifies skill-level gaps
- Compares to similar schools
- Shows effect sizes and z-scores
- Generic recommendations

### With Real Claude API

You'll get **AI-generated insights** that include:
- Root cause analysis
- Peer learning examples
- Curriculum-aligned recommendations
- Specific, actionable targets
- Foundation gap detection

---

## Example Output

**School View - Oakwood Primary:**

```
🎯 Number - fractions: -21% gap

Summary: Your cohort is 21% below similar cohorts on Converting fractions to decimals

Analysis:
• Current Score: 38%
• Expected (similar cohorts): 59%
• Gap: -21%
• Effect Size: 0.85 (high)

This represents a high gap that requires attention.

Recommendations:
1. Focus on Converting fractions to decimals
   - Target this specific skill with focused intervention
   - Effect size of 0.85 indicates significant gap
   - Target: Reach 59% by next assessment
```

---

## Troubleshooting

### Port Already in Use

```bash
# Change port in .env
PORT=3002
```

### API Key Not Working

```bash
# Check your .env file
cat .env

# Make sure ANTHROPIC_API_KEY is set correctly
# No quotes needed: ANTHROPIC_API_KEY=sk-ant-api03-...

# Restart the server
npm run dev
```

### Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

### 1. **Integrate with Your Data**

Replace `server/mock-data.ts` with a connection to your real assessment database:

```typescript
// server/data-loader.ts
export async function loadRealCohortData(cohortId: string) {
  const result = await yourDatabase.query(`
    SELECT * FROM assessments WHERE cohort_id = $1
  `, [cohortId]);
  
  return transformToInsightsFormat(result);
}
```

### 2. **Add Real Database**

Follow [`docs/IMPLEMENTATION.md`](docs/IMPLEMENTATION.md) Section "Step 2: Database Schema" to set up PostgreSQL tables.

### 3. **Deploy to Production**

See [`docs/IMPLEMENTATION.md`](docs/IMPLEMENTATION.md) Section "Step 7: Deployment"

### 4. **Customize Prompts**

Edit [`prompts/insight-generation.ts`](prompts/insight-generation.ts) to tune AI output for your needs.

---

## Development Tips

### Hot Reload

The server uses `tsx watch` - changes to `.ts` files automatically restart the server.

### Test Different Scenarios

```bash
# Try different view levels
curl http://localhost:3001/api/insights/mat/school1/assessment123
curl http://localhost:3001/api/insights/student/school1/assessment123

# Force refresh (bypass cache)
curl http://localhost:3001/api/insights/school/school1/assessment123?forceRefresh=true
```

### Check Logs

The server logs all requests and AI generations to console:

```
[REQUEST] GET /api/insights/school/school1/assessment123
Found 3 similar cohorts
Detected 6 outliers
🤖 Generating insights with Claude API...
✅ Generated 5 insights (3247 tokens)
```

---

## Project Structure

```
claude.curric.gaps/
├── server/
│   ├── dev-server.ts        ← Main server (edit this)
│   └── mock-data.ts         ← Sample data (edit this)
├── engine/
│   ├── similarity-matcher.ts
│   ├── outlier-detector.ts
│   └── ai-service.ts
├── prompts/
│   └── insight-generation.ts ← AI prompts (tune these)
├── models/
│   └── *.ts                 ← Type definitions
└── components/
    └── InsightsPanel.*      ← React component
```

---

## Support

- **Documentation**: See [`docs/`](docs/) folder
- **API Reference**: See [`api/endpoints.ts`](api/endpoints.ts)
- **Implementation Guide**: See [`docs/IMPLEMENTATION.md`](docs/IMPLEMENTATION.md)

---

**Ready to go! 🎉**

Open **http://localhost:3001/demo** and start exploring AI insights.
