# 📊 Visual Analytics Dashboard & Enhanced Insights

## What's New

### 1. **Interactive Visual Analytics Dashboard** 
**URL**: `http://localhost:3001/dashboard`

A comprehensive Highcharts-powered dashboard featuring:

#### **Summary Cards**
- Current SAS score
- Value Added (CAT4 vs NGMT)
- FSM percentage
- SEND percentage

#### **6 Interactive Charts**

1. **Progress Over Time (Line Chart)**
   - 4-term trend analysis (Autumn 2023 → Autumn 2024)
   - Tracks Average SAS, CAT4, and NGMT
   - National average reference line (100 SAS)
   - Shows whether performance is improving, stable, or declining

2. **Overall Performance Gauge**
   - Visual "speedometer" showing current SAS
   - Color-coded: Red (<85), Orange (85-95), Blue (95-105), Green (>105)
   - Instant visual assessment of school performance

3. **Top Skill Gaps vs National Average (Bar Chart)**
   - Top 5 skills needing attention
   - Direct comparison: Your School vs National
   - Clickable bars → drill down to skills analysis page
   - Colour-coded: Red (below national), Green (above national)

4. **Value Added: CAT4 vs NGMT (Scatter Plot)**
   - Each dot represents a student
   - X-axis: CAT4 (cognitive potential)
   - Y-axis: NGMT (actual attainment)
   - Diagonal line shows "expected" performance
   - Points above line = positive value added
   - Points below line = underperformance vs potential
   - Click scatter points → view all GL data

5. **Skills Mastery Heatmap (All Classes)**
   - 8 key skills × 3 classes matrix
   - Colour gradient: Red (0%) → Green (100%)
   - Shows which classes struggle with which skills
   - Clickable cells → drill down to specific class

6. **Drill-Down Links Section**
   - Quick navigation to: Skills Analysis, Class A/B/C, AI Insights
   - Breadcrumb navigation back to MAT and GL Overview

#### **School Switching**
- Toggle between School A, School B, School C
- All charts update instantly
- Compare performance across schools

---

## 2. **Enhanced AI Insights with Strand Data**

All AI insights now include **actionable, strand-specific recommendations** with direct links to drill-down views.

### **What's Enhanced:**

#### **For Skill Gap Insights:**
- ✅ Now includes link to **strand analysis page**
- ✅ References specific National Curriculum objectives
- ✅ Shows which classes need support (5A, 5B, 5C)
- ✅ Identifies students by mastery level (concern/emerging/developing/mastered)

**Example:**
```
Recommendation: Focus on "Converting fractions to decimals"

Description:
Target this specific skill with focused intervention. 📊 View strand 
analysis to see National Curriculum objectives and student-level mastery 
data.

Class-Level Action:
Review strand objectives with all classes. Classes 5A, 5B, and 5C need 
targeted support on this strand. View detailed student mastery data to 
identify specific students for intervention groups.
```

#### **For Overall Performance Insights:**
- ✅ Link to **skills analysis page** to see domain breakdown
- ✅ Link to **cross-class heatmap** to identify variation between classes
- ✅ Actionable next steps with specific URLs

**Example:**
```
Recommendation: Investigate Underperformance

Description:
Review teaching practices, curriculum delivery, and barriers to learning. 
View detailed skills analysis to identify specific areas needing attention.

Class-Level Deep Dive:
Review performance across all classes. View cross-class heatmap to 
identify which classes need targeted support on specific strands.
```

#### **For Declining Trend Insights:**
- ✅ Link to **trend dashboard** to visualise decline over time
- ✅ Link to **strand-level data** to identify problematic curriculum areas
- ✅ Focus on strands with "concern" or "emerging" mastery

**Example:**
```
Recommendation: Reverse Declining Trend

Description:
View trend dashboard to see performance over time across all assessments 
and identify which domains are declining fastest.

Identify Problematic Strands:
Drill down to strand level to see which specific National Curriculum 
objectives are driving the decline. Focus intervention resources on 
strands with "concern" or "emerging" mastery levels.
```

#### **For Improving Trend Insights:**
- ✅ Link to dashboard to identify strongest improvement areas
- ✅ Link to strand mastery to capture successful teaching approaches
- ✅ Share best practices across MAT

---

## 3. **Dashboard Access Points**

The dashboard is now accessible from multiple locations:

### **From MAT Level**
- `http://localhost:3001/mat`
- Button: **"📊 Visual Analytics Dashboard"** (first action button)

### **From GL Assessment View**
- `http://localhost:3001/gl`
- Button: **"📊 Visual Analytics Dashboard"** (below skills analysis button)

### **From GL Assessment Advanced View**
- `http://localhost:3001/gl-advanced`
- Button: **"📊 Visual Analytics Dashboard"**

### **Direct Access**
- `http://localhost:3001/dashboard`

---

## 4. **Strand Mapping for Actionable Links**

The system now intelligently maps domains and skills to strand IDs:

| Domain | Maps to Strand ID | URL Path |
|--------|-------------------|----------|
| Number - fractions | `number-fractions` | `/school/:schoolId/strand/number-fractions` |
| Number - operations | `number-operations` | `/school/:schoolId/strand/number-operations` |
| Algebra | `algebra-sequences` | `/school/:schoolId/strand/algebra-sequences` |
| Measurement | `measurement` | `/school/:schoolId/strand/measurement` |
| Geometry | `geometry` | `/school/:schoolId/strand/geometry` |
| Statistics | `statistics` | `/school/:schoolId/strand/statistics` |

When an insight mentions a domain or skill, it automatically provides a clickable link to the relevant strand page showing:
- National Curriculum objectives
- Mastery levels (concern/emerging/developing/mastered)
- Student names grouped by mastery level
- Class-level comparison bars

---

## 5. **Complete User Journey Examples**

### **MAT Leader Reviewing All Schools:**
1. Visit `/mat` → See summary table with all 3 schools
2. Click **"📊 Visual Analytics Dashboard"**
3. Toggle between School A, B, C to compare trends
4. Click **"🤖 Generate Full AI Insights (MAT View)"**
5. Read insights → Click **"View strand analysis"** link in recommendation
6. See National Curriculum objectives → Identify students needing support

### **School Leader Investigating Underperformance:**
1. Visit `/gl` → See School A performing -12 SAS below expected
2. Click **"Analyse School A"** → Get AI insights
3. Read insight: "Number - fractions: -21% gap"
4. Click **"View strand analysis"** in recommendation
5. See 10 Y5 objectives with mastery levels
6. Identify 12 students in "concern" level (0-49% mastery)
7. Click **Class 5A** → See individual student CAT4/NGMT/PTM scores
8. Create intervention group based on data

### **Teacher Reviewing Class Performance:**
1. Visit `/dashboard`
2. Click on **Skills Mastery Heatmap** → Click on Class 5A "Fractions to decimals" (32% - red)
3. Navigate to `/class/class6a`
4. See all 28 students with their scores
5. Filter by "Foundation" focus group (12 students)
6. Plan targeted small-group intervention

---

## 6. **Technical Enhancements**

### **New Files Created:**
- `server/gl-dashboard.html` - Complete Highcharts dashboard with 6 charts
- `DASHBOARD-FEATURES.md` - This documentation

### **Files Modified:**
- `server/dev-server.ts` - Added:
  - `/dashboard` route
  - `getStrandActionableLink()` helper function
  - Enhanced all insight recommendations with strand links
- `server/mat-visualization.html` - Added dashboard button
- `server/gl-demo-simple.html` - Added dashboard link
- `server/gl-assessment-demo.html` - Added dashboard link

### **Key Functions:**
```typescript
function getStrandActionableLink(
  cohortId: string, 
  domain: string, 
  skill: string
): string
```
Maps domains/skills to strand IDs and generates HTML links to drill-down pages.

---

## 7. **Data Flow Summary**

```
MAT Overview (/mat)
    ↓
Visual Dashboard (/dashboard)
    ↓
GL Assessment (/gl)
    ↓
AI Insights (/demo)
    ↓ (click strand link)
Strand Analysis (/school/:id/strand/:strandId)
    ↓
National Curriculum Objectives
    ↓
Students by Mastery Level
    ↓ (click class link)
Class View (/class/:classId)
    ↓
Individual Student Data (CAT4, NGMT, PTM, Focus Group)
```

**Every level now has actionable links to the next level of detail.**

---

## 8. **Usage Tips**

### **For MAT Leaders:**
- Start at `/mat` to see trust-wide overview
- Use `/dashboard` to compare schools visually
- AI insights now reference specific strands for each school's weaknesses

### **For School Leaders:**
- Use `/gl` or `/dashboard` as your starting point
- AI insights provide direct links to strand data
- Follow links from insights → strands → classes → students

### **For Teachers:**
- Use `/class/:classId` to see your students
- Cross-reference with strand analysis to understand curriculum gaps
- Use Focus Group labels (Foundation/Consolidation/Extension) for grouping

---

## 9. **What Makes This Actionable**

✅ **Every insight includes clickable links** - No more "what do I do next?"
✅ **Links go directly to relevant data** - Strands, classes, students
✅ **Shows specific curriculum objectives** - National Curriculum Y5 objectives mapped
✅ **Identifies students by name** - Not just percentages, actual student names
✅ **Grouped by mastery level** - Concern/Emerging/Developing/Mastered
✅ **Visualises trends** - 4 terms of data showing trajectory
✅ **Cross-class comparison** - Heatmap reveals teaching quality variation
✅ **Value-added analysis** - CAT4 vs NGMT scatter shows who's underperforming

---

## 10. **Next Steps**

You now have:
- ✅ Complete dashboard with 6 Highcharts visualisations
- ✅ Enhanced AI insights with strand-specific recommendations
- ✅ Direct links from insights → strands → classes → students
- ✅ Trend analysis showing 4 terms of data
- ✅ All links working between MAT, GL, dashboard, skills, strands, and classes

**Try it now:**
1. Visit `http://localhost:3001/mat`
2. Click **"📊 Visual Analytics Dashboard"**
3. Click **"🤖 Generate Full AI Insights"** for School A
4. Click any **"View strand analysis"** link in recommendations
5. See National Curriculum objectives and student mastery levels

---

**🎉 Dashboard complete! All insights now provide actionable, strand-specific recommendations with direct drill-down links.**
