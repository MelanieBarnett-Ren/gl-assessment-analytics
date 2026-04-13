# 📊 Complete Drill-Down Capability Guide

## 🎯 Overview

The system now provides **5 levels of drill-down** from MAT-wide overview down to individual question analysis:

1. **MAT Level** - Trust-wide performance
2. **School Level** - Individual school analysis
3. **Skills Analysis** - Domain/strand/skill breakdown ⭐ **NEW!**
4. **Class Level** - Class and teacher performance
5. **Student Level** - Individual student data

---

## 📈 Drill-Down Navigation

### **Level 1: MAT Overview**
**URL**: http://localhost:3001/mat

**Shows**:
- 4 schools comparison table
- Overall MAT statistics
- School-by-school demographics (FSM%, EAL%, SEND%)
- Average SAS scores
- Performance trends (improving/stable/declining)

**Actions**:
- Compare schools across the trust
- Identify outliers (high/low performers)
- See demographic distribution

**Drill Into**:
- Click any school row → School Level (GL Assessment view)

---

### **Level 2: School Level**
**URLs**: 
- http://localhost:3001/gl (simple view)
- http://localhost:3001/gl-advanced (detailed view)

**Shows**:
- **School A** and **School C** side-by-side
- CAT4 baseline (cognitive potential)
- NGMT attainment (actual performance)
- Value-added analysis (working to potential?)
- Key insights (underachievement, gaps, trends)
- Top skill gaps from PTM
- Progress trajectory (improving/declining)

**Actions**:
- Compare CAT4 vs NGMT to identify underachievement
- See which skills need urgent attention
- Review progress over time

**Drill Into**:
- 🎯 **"View Detailed Skills Analysis"** button → **Skills Analysis** ⭐ **NEW!**
- Click any class link (5A, 5B, 5C) → Class Level

---

### **Level 3: Skills Analysis** ⭐ **NEW!**
**URLs**:
- http://localhost:3001/school/school6/skills (School A)
- http://localhost:3001/school/school8/skills (School C)

**4 Tabs with Different Views**:

#### **📊 Tab 1: Domains**
Shows NGMT domain scores with skill breakdowns:

**Number Domain** (example):
- Overall SAS: 88 (Stanine 3)
- Place Value: 62%
- Four Operations: 54%
- Fractions/Decimals/Percentages: 38% ⚠️ **CRITICAL GAP**
- Ratio: 42%

**Algebra Domain**:
- Sequences: 68%
- Expressions: 52%
- Equations: 48%

**Shape, Space & Measures**:
- Properties 2D/3D: 72%
- Position/Direction: 65%
- Measurement: 58%
- Perimeter: 61%

**Handling Data**:
- Data Representation: 64%
- Interpretation: 56%
- Probability: 52%

**Visual**: Each skill has a horizontal bar showing mastery level (colour-coded: red/orange/blue/green)

---

#### **🎯 Tab 2: Skills Breakdown**
Shows top skills needing attention from PTM item-level data:

**Example for School A**:
1. **Convert fractions to decimals**: 34% (vs 68% national) → **-34% gap** 🚨
2. **Equivalent fractions**: 42% (vs 75% national) → **-33% gap** 🚨
3. **Multiply 2-digit by 1-digit**: 52% (vs 78% national) → **-26% gap**
4. **Add fractions same denominator**: 56% (vs 82% national) → **-26% gap**
5. **Divide with remainders**: 48% (vs 72% national) → **-24% gap**

**Visual**: Each skill shows:
- Current score with severity colour
- Progress bar to national average (green line)
- Gap percentage highlighted

**Use Case**: Identify which specific skills to target for intervention

---

#### **🔥 Tab 3: Class Heatmap**
Cross-class comparison showing which skills each class has mastered:

| Skill | Class 5A | Class 5B | Class 5C | School Avg |
|-------|----------|----------|----------|------------|
| Multiply 2-digit by 1-digit | 48% 🔴 | 55% 🟠 | 52% 🟠 | 52% |
| Convert fractions to decimals | 32% 🔴 | 38% 🔴 | 34% 🔴 | 35% |
| Equivalent fractions | 40% 🔴 | 45% 🟠 | 42% 🔴 | 42% |
| Continue sequence +3 | 72% 🟡 | 68% 🟡 | 64% 🟡 | 68% |
| Identify 3D shapes | 75% 🟢 | 78% 🟢 | 70% 🟡 | 74% |

**Colour Key**:
- 🔴 Red (<30%): Critical
- 🟠 Orange (30-50%): Low
- 🟡 Yellow (50-70%): Medium
- 🔵 Blue (70-85%): Good
- 🟢 Green (85%+): High

**Use Case**: 
- Compare class performance side-by-side
- Identify if a skill gap is school-wide or class-specific
- Spot outlier classes (e.g., "Why is 5B better at fractions?")

---

#### **📝 Tab 4: Item Analysis**
Shows PTM question-level performance:

**Example Items**:

**Item N3** - Convert fractions to decimals
- Success Rate: **34%** 🔴
- 49 of 145 students correct
- Severity: Critical

**Item N4** - Equivalent fractions
- Success Rate: **42%** 🔴
- 61 of 145 students correct
- Severity: Critical

**Item N1** - Multiply 2-digit by 1-digit
- Success Rate: **52%** 🟠
- 75 of 145 students correct
- Severity: Needs work

**Item S1** - Identify 3D shapes
- Success Rate: **72%** 🟢
- 104 of 145 students correct
- Severity: Good

**Visual**: Cards sorted by difficulty (hardest first) with colour-coded severity

**Use Case**: 
- See which specific questions students struggled with
- Plan re-teaching for questions with <40% success
- Identify misconception patterns

---

### **Level 4: Class Level**
**URLs**:
- http://localhost:3001/class/class6a (School A, Class 5A - Mrs Thompson)
- http://localhost:3001/class/class6b (School A, Class 5B - Mr Patel)
- http://localhost:3001/class/class6c (School A, Class 5C - Miss Davies)
- http://localhost:3001/class/class8a (School C, Class 5A - Mrs Johnson)
- http://localhost:3001/class/class8b (School C, Class 5B - Mr Williams)
- http://localhost:3001/class/class8c (School C, Class 5C - Mrs Ahmed)

**Shows**:
- Summary cards: Student count, Avg CAT4, Avg NGMT, Value Added
- Value-added analysis for the class
- **Focus Groups breakdown**:
  - Foundation (below expected) - e.g., 12 students
  - Consolidation (at expected) - e.g., 13 students
  - Extension (above expected) - e.g., 3 students
- **Full student list** with columns:
  - Student name
  - CAT4 score
  - NGMT score (colour-coded)
  - Value Added (positive/negative)
  - PTM Progress (change from last term)
  - Focus Group badge
  - Demographics (FSM/EAL/SEND tags)

**Use Case**:
- Teacher sees their entire class at a glance
- Identify which students need foundation support
- Group students for differentiated teaching
- Track progress termly

---

### **Level 5: Student Level**
**Data Available** (via Class view):

For each student, you can see:
- **CAT4 scores**: Mean + 4 batteries (Verbal, Quantitative, Non-verbal, Spatial)
- **NGMT scores**: Overall SAS + 4 domain scores
- **PTM progress**: Term-on-term change
- **Item responses**: Which specific questions they got right/wrong (10 questions shown)
- **Demographics**: FSM, EAL, SEND flags
- **Focus group assignment**: Foundation/Consolidation/Extension

**Use Case**:
- Individual student profiles
- Parent meetings data
- SEN support planning
- Intervention targeting

---

## 🎓 Real-World Use Cases

### **Use Case 1: School Leader Review**
**Question**: "Why is our maths performance declining?"

1. **Start**: MAT View → See School A at SAS 92, declining trend
2. **Drill**: School Level → Value Added = -4 (underachieving vs CAT4 potential)
3. **Analyse**: Skills Analysis → Fractions at 34% (national 68%) - **-34% gap!**
4. **Investigate**: Heatmap → All 3 classes struggling with fractions (school-wide issue)
5. **Detail**: Item Analysis → Questions N3 and N4 (fraction conversion) < 40% success
6. **Action**: Target fractions with all classes, focus on conversion skills

**Root Cause Identified**: School-wide fraction teaching gap (not teacher-specific)

---

### **Use Case 2: Teacher Intervention Planning**
**Question**: "Which students need small group intervention in my class?"

1. **Start**: Class 5A view
2. **Review**: Focus Groups → 12 students in Foundation group
3. **Filter**: Look at Foundation students with Value Added < -5
4. **Check**: See 8 students with CAT4 > 90 but NGMT < 85 (underachieving)
5. **Review**: Their PTM item responses → All struggling with fractions
6. **Plan**: 
   - Foundation group: 8 students
   - Target: Fractions (Items N3, N4)
   - Intervention: 3× per week, 15 mins, TA-led
   - Strategy: Visual models (bar models, fraction walls)
   - Target: 68% by next assessment

---

### **Use Case 3: MAT Peer Learning**
**Question**: "Which school can help School A improve?"

1. **Start**: MAT View → School C at SAS 105 (13 points higher than School A)
2. **Compare**: Demographics → Both high FSM (48% vs 52%) - **similar context!**
3. **Analyse Skills**: 
   - School A fractions: 34%
   - School C fractions: 78%
   - **44-point gap!**
4. **Drill**: School C Heatmap → All 3 classes strong in fractions (70%+)
5. **Action**: Arrange visit from School A staff to observe School C lessons
6. **Share**: School C shares their approach:
   - Daily visual models for fractions
   - Pre-teach Year 4 foundations before Year 5 content
   - Systematic low-stakes quizzing

---

## 📊 Data Hierarchy

```
MAT (Trust)
├── School A (school6)
│   ├── Skills Analysis (Domains/Skills/Heatmap/Items) ⭐ NEW!
│   ├── Class 5A (Mrs Thompson, 28 students)
│   │   ├── Student 1 (CAT4: 103, NGMT: 79, VA: -24)
│   │   ├── Student 2 (CAT4: 95, NGMT: 88, VA: -7)
│   │   └── ... 26 more students
│   ├── Class 5B (Mr Patel, 29 students)
│   └── Class 5C (Miss Davies, 30 students)
│
├── School B (school7)
│
├── School C (school8)
│   ├── Skills Analysis (Domains/Skills/Heatmap/Items) ⭐ NEW!
│   ├── Class 5A (Mrs Johnson, 26 students)
│   │   ├── Student 1 (CAT4: 105, NGMT: 107, VA: +2)
│   │   └── ... 25 more students
│   ├── Class 5B (Mr Williams, 27 students)
│   └── Class 5C (Mrs Ahmed, 28 students)
│
└── School D (school9)
```

---

## 🚀 Quick Navigation Cheat Sheet

| View | URL | What You'll See |
|------|-----|-----------------|
| MAT Dashboard | http://localhost:3001/mat | 4 schools comparison |
| GL Assessment | http://localhost:3001/gl | School A & C side-by-side |
| **School A Skills** | http://localhost:3001/school/school6/skills | Domains/Skills/Heatmap/Items ⭐ |
| **School C Skills** | http://localhost:3001/school/school8/skills | Domains/Skills/Heatmap/Items ⭐ |
| School A - Class 5A | http://localhost:3001/class/class6a | 28 students, Mrs Thompson |
| School A - Class 5B | http://localhost:3001/class/class6b | 29 students, Mr Patel |
| School A - Class 5C | http://localhost:3001/class/class6c | 30 students, Miss Davies |
| School C - Class 5A | http://localhost:3001/class/class8a | 26 students, Mrs Johnson |
| School C - Class 5B | http://localhost:3001/class/class8b | 27 students, Mr Williams |
| School C - Class 5C | http://localhost:3001/class/class8c | 28 students, Mrs Ahmed |

---

## ✅ Complete Feature Set

- ✅ MAT-level comparison (4 schools)
- ✅ School-level GL Assessment integration (NGMT, PTM, CAT4)
- ✅ **Skills Analysis with 4 tabs** ⭐ **NEW!**
  - ✅ Domain breakdown with skill bars
  - ✅ Top skills needing attention
  - ✅ Cross-class heatmap
  - ✅ Item-level analysis
- ✅ Class-level student lists (87 students total across 6 classes)
- ✅ Student-level CAT4, NGMT, PTM data
- ✅ Focus group assignments (Foundation/Consolidation/Extension)
- ✅ Value-added analysis at all levels
- ✅ Progress tracking (improving/declining)
- ✅ Demographics (FSM/EAL/SEND) at all levels
- ✅ Tooltips explaining all technical terms
- ✅ Colour-coded severity indicators

---

**🎯 You now have complete drill-down from MAT → School → Skills → Class → Student!**
