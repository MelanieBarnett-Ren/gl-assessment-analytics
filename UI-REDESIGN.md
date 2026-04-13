# 🎨 UI Redesign - GL Assessment Dashboard Style

## Overview

The MAT and GL Assessment pages have been redesigned to match the professional, clean styling from the GL Assessment dashboard reference. The new design emphasizes:

- **Clean white cards** with subtle shadows
- **Purple accent colours** (#d946ef, #a855f7) for primary actions
- **Two-column insight format** showing "Performance" and "Practical Steps"
- **Professional typography** with clear hierarchy
- **Actionable links** embedded directly in recommendations
- **Badge indicators** for performance levels (positive/negative/neutral)

---

## 🎯 Key Design Changes

### 1. **MAT Overview Page** (`/mat`)

**New File:** `server/mat-visualization-v2.html`

#### Design Features:
- ✅ Light grey background (#f8f9fa)
- ✅ White card-based layout
- ✅ Summary cards at top (MAT Average, Schools Count, Total Students, Range)
- ✅ Individual school cards with:
  - Purple gradient header (for struggling schools) or green (for high performers)
  - Metrics grid showing CAT4, NGMT, Value Added, FSM
  - Horizontal bar charts comparing to national average
  - Embedded insight cards with warnings or successes
  - "Digital Only" badges
- ✅ Action buttons grid at bottom
- ✅ Tooltips on all technical terms

#### Colour Coding:
- **Purple (#a855f7)**: Primary brand colour, used for metrics and buttons
- **Cyan (#06b6d4)**: Bar chart fills for at/above target
- **Amber (#f59e0b)**: Bar chart fills for below target
- **Green (#10b981)**: Success indicators, high-performing schools
- **Red (#dc2626)**: Critical/negative indicators

---

### 2. **GL Assessment Page** (`/gl`)

**New File:** `server/gl-demo-v2.html`

#### Design Features:
- ✅ School cards with purple gradient headers
- ✅ 6-metric grid (CAT4, NGMT, PTM, Value Added, FSM, SEND)
- ✅ Large metric values (32px) in purple
- ✅ Badge indicators for performance levels

#### **"Implications for teaching and learning" Section**

This is the **signature feature** matching the GL Assessment reference:

```
🎓 Implications for teaching and learning
├── ›› Performance (Left Column)
│   • Bullet points analysing what the data shows
│   • Comparisons to national averages
│   • Identification of strengths and weaknesses
│   • Demographic analysis (FSM, EAL, SEND)
│   • Trend analysis
│
└── ›› Practical Steps (Right Column)
    • Actionable recommendations
    • Links to drill-down pages (strands, skills, classes)
    • Specific student groups to target
    • Collaborative opportunities
    • Root cause investigation steps
```

**Example for School A:**

**Performance Column:**
- "Maths attainment is significantly lower than national average (90 vs 100 SAS)"
- "38% of students below average or very low (Stanine 1-3)"
- "Attainment in Number - fractions is weakest (34% vs 68% national)"
- "Students performing 4 SAS points below CAT4 potential"
- "Overall progress is declining (-2 SAS)"

**Practical Steps Column:**
- "Analyse scores for Stanine 1-3 students → [View skills breakdown ›]"
- "Focus on Number - fractions strand → [View strand analysis ›]"
- "Review class-level variation → [View cross-class heatmap ›]"
- "Identify 12 students in Foundation group → [View Class 5A ›]"
- "Learn from School C strategies → [View their approaches ›]"

---

### 3. **Typography & Spacing**

#### Font Stack:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

#### Size Hierarchy:
- **Page Title**: 24px, weight 600
- **Section Headers**: 18px, weight 600
- **Card Titles**: 20px, weight 600
- **Metric Values**: 32px, weight 700
- **Metric Labels**: 11px, weight 600, uppercase
- **Body Text**: 14px
- **Small Text**: 12-13px

#### Spacing:
- Card padding: 24px
- Grid gaps: 20-24px
- Metric item padding: 20px
- Button padding: 8px 16px (small) or 12px 24px (large)

---

### 4. **Badge System**

Badges are used consistently across all pages:

```css
.badge-positive {
  background: #d1fae5;
  color: #065f46;
}

.badge-negative {
  background: #fee2e2;
  color: #991b1b;
}

.badge-neutral {
  background: #e0e7ff;
  color: #3730a3;
}
```

**Usage:**
- Value Added: +6 → Green badge
- Value Added: -4 → Red badge
- Trend: Improving → Green
- Trend: Declining → Red
- Trend: Stable → Blue/neutral

---

### 5. **Interactive Elements**

#### Buttons:
- **Primary**: Purple (#d946ef) with white text
- **Secondary**: White with grey border
- Hover states darken slightly
- 8px border radius

#### Links:
- Purple colour (#d946ef or #a855f7)
- Font weight 600
- Underline on hover
- Embedded directly in practical steps

#### Tooltips:
- Dark grey background (#1f2937)
- White text
- 8px border radius
- Appears on hover over dotted underline terms
- Positioned above the term

---

### 6. **Responsive Behaviour**

```css
@media (max-width: 768px) {
  .implications-grid {
    grid-template-columns: 1fr; /* Stack columns */
  }

  .metrics-grid {
    grid-template-columns: 1fr 1fr; /* 2 columns instead of 6 */
  }
}
```

---

## 📁 File Structure

### New Files:
- `server/mat-visualization-v2.html` - New MAT overview with clean styling
- `server/gl-demo-v2.html` - New GL assessment page with implications format
- `UI-REDESIGN.md` - This documentation

### Updated Files:
- `server/dev-server.ts` - Routes updated:
  - `/mat` → serves `mat-visualization-v2.html`
  - `/gl` → serves `gl-demo-v2.html`
  - `/mat-old` → serves old version for reference
  - `/gl-old` → serves old version for reference

### Unchanged Files:
- `server/gl-dashboard.html` - Visual analytics dashboard (already has good styling)
- `server/class-view.html` - Class detail pages
- `server/school-skills-view.html` - Skills analysis tabs
- `server/strand-view.html` - Strand drill-down

---

## 🎨 Colour Palette

```css
/* Primary Brand Colours */
--purple-primary: #d946ef;
--purple-light: #a855f7;
--purple-dark: #c026d3;

/* Status Colours */
--green-bg: #d1fae5;
--green-text: #065f46;
--red-bg: #fee2e2;
--red-text: #991b1b;
--blue-bg: #e0e7ff;
--blue-text: #3730a3;

/* Neutral Greys */
--grey-50: #f9fafb;
--grey-100: #f3f4f6;
--grey-200: #e5e7eb;
--grey-400: #9ca3af;
--grey-600: #6b7280;
--grey-900: #1f2937;

/* Background */
--bg-page: #f8f9fa;
--bg-card: #ffffff;

/* Chart Colours */
--chart-cyan: #06b6d4;
--chart-amber: #f59e0b;
--chart-green: #10b981;
```

---

## 📊 Before & After Comparison

### Before (Old Design):
- Heavy gradient backgrounds (purple to blue)
- White container with all content inside one card
- Dense tables with lots of borders
- Limited visual hierarchy
- Actions separated from insights

### After (New Design):
- Clean light background
- Individual white cards for each school
- Clear visual separation between sections
- Strong visual hierarchy with large metrics
- **Implications section** directly shows what to do
- Links embedded in recommendations for immediate action

---

## 🚀 Usage

### Access the New Pages:

1. **MAT Overview**: `http://localhost:3001/mat`
2. **GL Assessment**: `http://localhost:3001/gl`
3. **Dashboard**: `http://localhost:3001/dashboard` (unchanged)

### Access Old Versions (for reference):

1. **Old MAT**: `http://localhost:3001/mat-old`
2. **Old GL**: `http://localhost:3001/gl-old`

---

## ✨ Key Improvements

### 1. **Clearer Data Presentation**
- Large metric values immediately draw attention
- Badges provide instant status recognition
- Bar charts show comparison at a glance

### 2. **Actionable Insights**
- Two-column format separates "what" from "how"
- Embedded links provide direct navigation
- Practical steps are specific, not generic

### 3. **Professional Appearance**
- Matches GL Assessment brand aesthetic
- Clean, uncluttered layout
- Consistent spacing and typography

### 4. **Better Navigation**
- Every recommendation links to relevant detail page
- Header buttons provide quick access to dashboard/MAT
- Action links at bottom of each card

### 5. **Mobile-Friendly**
- Responsive grid layouts
- Stacked columns on small screens
- Touch-friendly button sizes

---

## 🎯 Design Principles

### 1. **Information Hierarchy**
- Most important metrics (SAS scores) are largest
- Section headers are bold and clear
- Supporting details are smaller but readable

### 2. **Colour Has Meaning**
- Purple = brand/primary actions
- Green = positive/above target
- Red = negative/below target
- Blue = neutral/average
- Grey = supporting information

### 3. **Every Insight is Actionable**
- No orphan insights without next steps
- All recommendations link to relevant pages
- Specific students/classes identified

### 4. **Consistency**
- Same card style across all schools
- Same metric grid layout
- Same badge styling
- Same button styles

### 5. **Accessibility**
- Good colour contrast ratios
- Tooltips explain technical terms
- Clear labels on all metrics
- Semantic HTML structure

---

## 🔗 Integration with Existing Features

The new UI maintains full compatibility with:

✅ **AI Insights** (`/demo`) - Links from "Generate AI Insights" buttons
✅ **Visual Dashboard** (`/dashboard`) - Links from header and action buttons
✅ **Skills Analysis** (`/school/:id/skills`) - Links in practical steps
✅ **Strand Drill-Down** (`/school/:id/strand/:strandId`) - Links in recommendations
✅ **Class View** (`/class/:classId`) - Links to view individual classes
✅ **Cross-Class Heatmap** - Links to skills page with anchor

---

## 📝 Content Example

### School A - Full Card

**Header (Purple Gradient):**
- 🏫 School A - Oakwood Primary
- Year 5 Cohort • 84 students • Autumn 2024

**Metrics Grid:**
- CAT4: 94 AVG SAS
- NGMT: 90 AVG SAS [Badge: Below]
- PTM: -2 Change [Badge: Declining]
- Value Added: -4 Points [Badge: -4.3%]
- FSM: 54% High
- SEND: 25% High

**Implications for teaching and learning:**

**Performance Column:**
- 9 detailed bullet points analysing the data
- Comparisons to national averages
- Demographic breakdowns
- Trend analysis

**Practical Steps Column:**
- 8 specific, actionable recommendations
- Each with embedded link to relevant page
- Named student groups ("12 students in Foundation")
- Specific curriculum areas ("Number - fractions")
- Collaborative opportunities ("Learn from School C")

**Action Links (Bottom):**
- 📊 Skills Analysis
- 📈 Trend Dashboard
- 👥 View Classes
- 🤖 Generate AI Insights [Primary Button]

---

## 🎉 Summary

The redesigned UI provides:

1. **Professional appearance** matching GL Assessment brand
2. **Clear data presentation** with large metrics and visual indicators
3. **Actionable insights** in two-column format (Performance + Practical Steps)
4. **Embedded navigation** with links directly in recommendations
5. **Responsive design** working on all screen sizes
6. **Consistent styling** across MAT and GL pages

**All existing functionality is preserved** - the redesign is purely visual with enhanced navigation.

**Access the new design:** http://localhost:3001/mat or http://localhost:3001/gl
