# 🚀 START HERE - Quick Setup

Get your AI insights running in **3 commands**.

---

## Step 1: Install

```bash
cd claude.curric.gaps
npm install
```

**Takes:** ~2 minutes

---

## Step 2: Configure (Optional)

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your Claude API key (optional)
# If you don't have a key, skip this - it works with mock data!
```

**Don't have a Claude API key?** No problem! The demo works without it using statistical insights. Get a key later from: https://console.anthropic.com

---

## Step 3: Run

```bash
npm run dev
```

**Server starts at:** http://localhost:3001

---

## 🎯 What to Open

### Option 1: MAT Dashboard (RECOMMENDED)
**→ http://localhost:3001/mat**

See **Horizon Academy Trust** with 4 anonymous schools:
- Complete MAT-level overview
- School comparison table
- AI-generated key insights
- Interactive buttons to generate real-time insights

### Option 2: Simple Demo
**→ http://localhost:3001/demo**

Test individual school insights with dropdowns.

---

## 📊 Sample Data Explained

You have **4 anonymous schools** in Horizon Academy Trust:

| School | Profile | Why Interesting |
|--------|---------|-----------------|
| **School A** | 52% FSM, SAS 92, 📉 Declining | **Needs urgent attention** - multiplication & fractions crisis |
| **School B** | 32% FSM, SAS 100, ➡️ Stable | Average performer, solid baseline |
| **School C** | 48% FSM, SAS 105, 📈 Improving | **Star performer** - similar deprivation to A but 13 points higher! |
| **School D** | 12% FSM, SAS 110, ➡️ Stable | Low deprivation, consistently high |

### 🎯 Key Story
**School C is the peer learning opportunity:** Same high FSM% as School A (48% vs. 52%) but performing 13 SAS points better. What are they doing differently?

---

## 🧪 Test Scenarios

### 1. **MAT Leader View**
```
Open: http://localhost:3001/mat
Click: "Generate Full AI Insights (MAT View)"
See: Trust-wide patterns, which schools need help, peer learning opportunities
```

### 2. **School A Deep Dive (Crisis School)**
```
Open: http://localhost:3001/mat
Click: "Deep Dive: School A"
See: Specific skill gaps, why they're declining, what to do
```

### 3. **School C Best Practice**
```
Open: http://localhost:3001/mat
Click: "Deep Dive: School C (Best Practice)"
See: What's working, strategies to replicate across MAT
```

### 4. **Compare Similar Schools**
```
Open: http://localhost:3001/mat
Click: "Compare Similar Schools"
See: Demographic matching, performance gaps, peer opportunities
```

---

## 📱 Expected Output

### Without Claude API Key (Mock Mode)
You'll see **statistical insights**:
- Outlier detection (which skills are significantly behind)
- Z-scores and effect sizes
- Skill-level breakdowns
- Generic recommendations

**Example:**
> "Number - fractions: -21% gap
> Current Score: 38%, Expected: 59%
> Effect Size: 0.85 (high)
> Focus on Converting fractions to decimals"

### With Claude API Key (Full AI)
You'll see **intelligent insights**:
- Root cause analysis ("Y4 equivalent fractions not secure")
- Peer learning examples ("School C uses visual models and scores 82%")
- Curriculum-aligned recommendations ("This is a Y5 objective, expected 75% mastery")
- Specific, actionable targets ("Target: 68% by next assessment")

**Example:**
> "🎯 Year 5 Fractions: 47% (below Y5 expected 75%)
> 
> **Foundation Gap:** Year 4 equivalent fractions prerequisite scored 62% (expected 80%)
> 
> **Root Cause:** Students haven't mastered Y4 objective 'Recognise families of equivalent fractions'
> 
> **Peer Example - School C:** Fractions domain 82% vs. your 47%. They built strong Y4 foundations (85% on basics) using visual models.
> 
> **Action:** Re-teach Y4 equivalent fractions before advancing. Target: 80% on equivalent fractions, then 70% on Y5 operations by next assessment."

---

## 🎓 What You're Testing

This demo shows:

1. **Similarity Matching** - Fair comparisons between schools with similar demographics
2. **Outlier Detection** - Statistical identification of significant skill gaps
3. **AI Analysis** - Claude understands educational context and generates actionable insights
4. **Peer Learning** - Automatically identifies what's working within your MAT
5. **Foundation Gaps** - Traces issues back to prerequisite skills from earlier years
6. **Curriculum Alignment** - UK National Curriculum-aware recommendations

---

## ❓ Troubleshooting

### "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Port 3001 already in use"
```bash
# Edit .env
PORT=3002

# Then restart
npm run dev
```

### "ANTHROPIC_API_KEY not found" (but you have one)
```bash
# Check .env file exists
ls -la .env

# Check it's not .env.example
cat .env

# Make sure no quotes around key
# Correct: ANTHROPIC_API_KEY=sk-ant-api03-...
# Wrong: ANTHROPIC_API_KEY="sk-ant-api03-..."
```

---

## 📚 Next Steps

1. **Try the MAT view** → http://localhost:3001/mat
2. **Generate some insights** → Click the buttons and see AI in action
3. **Explore the API** → curl http://localhost:3001/api/data/cohorts
4. **Read the docs** → See `QUICKSTART.md` for detailed guide
5. **Integrate your data** → See `docs/IMPLEMENTATION.md` for production setup

---

## 💡 Pro Tips

- **Cache is 15 minutes** - First load generates insights, subsequent loads are instant
- **Force refresh** - Add `?forceRefresh=true` to any API call to regenerate
- **Check console** - Server logs all API calls, outlier detection, and AI token usage
- **Mock mode is fast** - Without API key, insights generate in <1 second
- **Real AI takes ~5-10 seconds** - Claude analyses deeply, worth the wait!

---

## 🎉 You're Ready!

Open **http://localhost:3001/mat** and click "Generate Full AI Insights"

Watch as the system:
1. Finds similar schools based on demographics ✅
2. Detects statistical outliers in skill performance ✅
3. Generates AI insights with peer examples ✅
4. Provides actionable, curriculum-aligned recommendations ✅

**Time saved:** 30 seconds vs. 20-30 minutes of manual analysis

---

**Questions?** Check:
- `QUICKSTART.md` - Detailed local setup guide
- `docs/IMPLEMENTATION.md` - Production deployment guide
- `PROJECT_SUMMARY.md` - What's been built
