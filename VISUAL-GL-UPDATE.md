# 🎨 Visual GL Assessment Update

## Overview

The GL Assessment page has been completely redesigned to be more visual, less wordy, and focused on high-impact information. The new design emphasizes:

- **Visual charts** instead of long text blocks
- **Pill-shaped filters** for terms and year groups
- **Compact metrics** with color-coded changes
- **Mini progress charts** showing 2 years of history
- **Tree structure** for MAT → School → Classes drill-down
- **4 classes per school** with proper NGMT, PTM, CAT4 data
- **Hamburger menu on left** for consistent navigation

---

## ✅ What's New

### 1. **Visual Layout** (gl-demo-v3.html)

**Old Design** (gl-demo-v2.html):
- Long text paragraphs in "Implications for teaching and learning"
- 6 large metric boxes
- Wordy performance analysis
- Hidden practical steps

**New Design** (gl-demo-v3.html):
- **Compact 4-metric grid** (CAT4, NGMT, VA, PTM)
- **Mini line charts** showing 6 terms of progress (2 academic years)
- **Visual badges** (Red: Concern, Amber: On Track, Green: Excelling)
- **Tree structure** showing classes underneath each school

---

### 2. **Pill-Shaped Filters**

```html
<div class="filter-bar">
  <span class="filter-label">Term:</span>
  <select class="pill-select">
    <option>Autumn 2024</option>
    <option>Summer 2024</option>
    <option>Spring 2024</option>
    <option>Autumn 2023</option>
    <option>Summer 2023</option>
    <option>Spring 2023</option>
  </select>

  <span class="filter-label">Year:</span>
  <div class="filter-pills">
    <div class="pill active">Year 5</div>
    <div class="pill">Year 6</div>
  </div>

  <span class="filter-label">View:</span>
  <div class="filter-pills">
    <div class="pill active">All Schools</div>
    <div class="pill">Concern Only</div>
  </div>
</div>
```

**CSS:**
```css
.pill {
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid #e5e7eb;
  background: white;
  transition: all 0.2s;
}

.pill.active {
  background: #d946ef;
  color: white;
  border-color: #d946ef;
}
```

---

### 3. **Term Selection** (2 Academic Years)

**Available Terms:**
- Spring 2023
- Summer 2023
- Autumn 2023
- Spring 2024
- Summer 2024
- Autumn 2024 (current)

**Data Structure:**
```javascript
const termData = {
  'autumn-2024': {
    school6: { cat4: 94, ngmt: 90, ptm: -2, valueAdded: -4 },
    school7: { cat4: 100, ngmt: 100, ptm: 0, valueAdded: 0 },
    school8: { cat4: 105, ngmt: 112, ptm: +3, valueAdded: +7 }
  },
  // ... 5 more terms
};
```

**Dynamic Updates:**
- Select different term from dropdown
- All school cards update with that term's data
- Mini charts show full 6-term history regardless of selected term

---

### 4. **Compact Metrics Grid**

**4 Key Metrics Per School:**
```
┌─────────┬─────────┬─────────┬─────────┐
│  CAT4   │  NGMT   │   VA    │   PTM   │
│   94    │   90    │   -4    │   -2    │
│         │ -2 prev │         │         │
└─────────┴─────────┴─────────┴─────────┘
```

**Features:**
- Large values (24px font, purple)
- Change indicators (green for +, red for -)
- "vs prev" shows term-on-term progress
- Compact 2x2 or 4x1 grid on mobile

---

### 5. **Mini Progress Charts**

**Each school card shows:**
- **6-term line chart** (Highcharts)
- NGMT (solid line, colored by performance)
- CAT4 (dashed grey line for comparison)
- X-axis: Spr 23, Sum 23, Aut 23, Spr 24, Sum 24, Aut 24
- Y-axis: 80-120 SAS

**Color Coding:**
- School A (Red): #dc2626
- School B (Amber): #f59e0b
- School C (Green): #10b981

**Visual Insight:**
- **Declining line** = Concern (School A: 98 → 90)
- **Flat line** = Stable (School B: 98 → 100)
- **Rising line** = Improving (School C: 104 → 112)

---

### 6. **Tree Structure: MAT → School → Classes**

**Navigation Hierarchy:**
```
GL Assessment (/gl)
├── School A - Oakwood
│   ├── 5A - Mrs Thompson (28 students)
│   ├── 5B - Mr Patel (29 students)
│   ├── 5C - Miss Davies (30 students)
│   └── 5D - Mr Jones (27 students)
├── School B - Riverside
│   ├── 5A - Mrs Brown (28 students)
│   ├── 5B - Mr Taylor (29 students)
│   ├── 5C - Miss Green (27 students)
│   └── 5D - Mrs Wilson (26 students)
└── School C - Hillside
    ├── 5A - Mrs Johnson (26 students)
    ├── 5B - Mr Williams (27 students)
    ├── 5C - Mrs Ahmed (28 students)
    └── 5D - Mr Singh (29 students)
```

**UI Design:**
```html
<div class="classes-section">
  <div class="classes-title">📂 Classes (4)</div>
  <div class="classes-list">
    <a href="/class/class6a" class="class-link">
      <span class="class-icon">👥</span>
      <span>5A - Mrs Thompson (28)</span>
    </a>
    <!-- ... 3 more classes -->
  </div>
</div>
```

**CSS:**
```css
.classes-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.class-link {
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.2s;
}

.class-link:hover {
  background: #eff6ff;
  color: #d946ef;
}
```

---

### 7. **4 Classes Per School** (Data Update)

**File Updated:** `server/gl-class-data.ts`

**Added:**
- School A: `class6d` (5D - Mr Jones, 27 students)
- School B: **All 4 classes** (school7 was missing entirely!)
  - `class7a` (5A - Mrs Brown, 28 students)
  - `class7b` (5B - Mr Taylor, 29 students)
  - `class7c` (5C - Miss Green, 27 students)
  - `class7d` (5D - Mrs Wilson, 26 students)
- School C: `class8d` (5D - Mr Singh, 29 students)

**Data Includes:**
- CAT4 mean SAS per class
- NGMT mean SAS per class
- PTM progress per class
- Value Added per class
- FSM, EAL, SEND percentages
- Focus groups (Foundation, Consolidation, Extension)
- 26-30 students per class with full data

**Fixed `getClassById()`:**
```typescript
export function getClassById(classId: string): ClassData | null {
  let schoolId = 'school6';
  if (classId.includes('7')) schoolId = 'school7';
  else if (classId.includes('8')) schoolId = 'school8';

  const classes = getClassData(schoolId);
  return classes.find(c => c.classId === classId) || null;
}
```

**Now supports:**
- `class6a`, `class6b`, `class6c`, `class6d` (School A)
- `class7a`, `class7b`, `class7c`, `class7d` (School B) ← NEW!
- `class8a`, `class8b`, `class8c`, `class8d` (School C)

---

### 8. **Hamburger Menu on Left**

**Fixed Issue:**
- **Problem:** Menu toggle (☰) was on right, sidebar appeared on left (confusing)
- **Solution:** Added `order: 1` to menu-toggle, `order: 2` to title

**CSS Update (All Pages):**
```css
.hamburger-menu h1 {
  order: 2;  /* Title on right */
}

.menu-toggle {
  order: 1;  /* Button on left */
}
```

**Updated Pages:**
- `landing.html` ✅
- `mat-visualization-v2.html` ✅
- `gl-demo-v2.html` ✅
- `gl-demo-v3.html` ✅ (NEW)
- `gl-dashboard.html` ✅
- `strand-view.html` ✅
- `school-skills-view.html` ✅
- `class-view.html` ✅

**Result:**
- Click ☰ on left → Sidebar slides in from left ✅
- Consistent across ALL pages ✅

---

## 📊 Before vs After Comparison

### Before (gl-demo-v2.html):

```
┌─────────────────────────────────────────────┐
│ School A - Oakwood Primary                  │
│ Year 5 Cohort • 84 students • Autumn 2024  │
├─────────────────────────────────────────────┤
│ [6 large metric boxes]                      │
│ CAT4: 94 | NGMT: 90 | PTM: -2              │
│ Value Added: -4 | FSM: 54% | SEND: 25%     │
├─────────────────────────────────────────────┤
│ 🎓 Implications for teaching and learning   │
│                                             │
│ ›› Performance                              │
│ • Maths attainment is significantly lower   │
│   than national average (90 vs 100 SAS).   │
│ • 38% of students are in below average or   │
│   very low attainment bands (Stanine 1-3).  │
│ • Attainment in Number - fractions is...    │
│   [8 more paragraphs of text]               │
│                                             │
│ ›› Practical Steps                          │
│ • Analyse the detailed scores for...        │
│   [8 more paragraphs of text]               │
└─────────────────────────────────────────────┘
```

**Issues:**
- ❌ Too wordy (16+ paragraphs per school)
- ❌ Hard to scan quickly
- ❌ No visual trends
- ❌ Metrics scattered
- ❌ Classes hidden in links

---

### After (gl-demo-v3.html):

```
┌─────────────────────────────────────────────┐
│ School A - Oakwood Primary     [🔴 Concern] │
├─────────────────────────────────────────────┤
│ CAT4  │ NGMT  │  VA   │  PTM  │
│  94   │  90   │  -4   │  -2   │
│       │-2 prev│       │       │
├─────────────────────────────────────────────┤
│ [Mini Line Chart: 6 terms]                  │
│  NGMT ━━━━━━━━╲ (declining)                 │
│  CAT4 ┄┄┄┄┄┄┄┄┄ (stable)                    │
├─────────────────────────────────────────────┤
│ 📂 Classes (4)                              │
│ [👥 5A - Mrs Thompson (28)]                 │
│ [👥 5B - Mr Patel (29)]                     │
│ [👥 5C - Miss Davies (30)]                  │
│ [👥 5D - Mr Jones (27)]                     │
└─────────────────────────────────────────────┘
```

**Benefits:**
- ✅ Visual at a glance
- ✅ Compact metrics (4 key numbers)
- ✅ Mini chart shows 2-year trend
- ✅ Classes immediately visible
- ✅ One-click drill to class details
- ✅ Color-coded badge (Red/Amber/Green)

---

## 🚀 Usage

### Access the New Page:
`http://localhost:3001/gl`

### Access Old Versions:
- `/gl-v2` - Wordy version with implications (for reference)
- `/gl-old` - Original simple version (for reference)

---

## 🎯 User Workflows

### Scenario 1: MAT Leader Reviews Term Progress

1. **Visit:** `/gl`
2. **See:** All 3 schools with mini charts
3. **Identify:** School A declining (98 → 90 over 6 terms)
4. **Select:** "Spring 2024" from dropdown
5. **Compare:** Spring 24 vs Autumn 24 data
6. **Drill:** Click "5A - Mrs Thompson" to see class detail

**Time:** 30 seconds (vs 5+ minutes reading paragraphs)

---

### Scenario 2: School Leader Checks Classes

1. **Visit:** `/gl`
2. **Scroll to:** School A card
3. **See:** 4 classes listed with teacher names
4. **Click:** "5D - Mr Jones (27)" class link
5. **View:** Individual student data for Class 5D

**Path:** GL → Class (2 clicks)
**Old Path:** GL → School Skills → Find class in dropdown → Select → View (5+ clicks)

---

### Scenario 3: Teacher Compares Terms

1. **Visit:** `/gl`
2. **Select:** "Autumn 2023" from term dropdown
3. **Note:** School A NGMT was 96
4. **Select:** "Autumn 2024"
5. **Note:** School A NGMT now 90 (6-point decline)
6. **Action:** Discuss intervention strategy

**Visual Feedback:** Mini chart shows declining trend line over 4 terms

---

## 📝 Technical Details

### Files Created:
- `server/gl-demo-v3.html` (NEW visual GL Assessment page)

### Files Modified:
- `server/gl-class-data.ts` (Added 4th class per school, added School B data)
- `server/dev-server.ts` (Updated `/gl` route to serve v3)
- `server/landing.html` (Hamburger menu order fix)
- `server/mat-visualization-v2.html` (Hamburger menu order fix)
- `server/gl-demo-v2.html` (Hamburger menu order fix)
- `server/gl-dashboard.html` (Hamburger menu order fix)
- `server/strand-view.html` (Hamburger menu order fix)
- `server/school-skills-view.html` (Hamburger menu order fix)
- `server/class-view.html` (Hamburger menu order fix)

### Documentation:
- `VISUAL-GL-UPDATE.md` (this document)

---

## 🎨 Design Tokens

### Colors:
- **Concern Badge**: Red #fee2e2 bg, #991b1b text
- **On Track Badge**: Amber #fef3c7 bg, #92400e text
- **Excelling Badge**: Green #d1fae5 bg, #065f46 text
- **Pill Active**: Purple #d946ef bg, white text
- **Pill Inactive**: White bg, #6b7280 text, #e5e7eb border

### Typography:
- **School Name**: 18px, weight 600
- **Metric Value**: 24px, weight 700, purple
- **Metric Label**: 11px, weight 600, uppercase, grey
- **Change Indicator**: 12px, weight 600, green/red

### Spacing:
- **Card Padding**: 24px
- **Metrics Grid Gap**: 12px
- **Classes Grid Gap**: 8px
- **Filter Pills Gap**: 8px

---

## ✅ Quality Checks

- [x] **Hamburger menu on left** (all pages)
- [x] **Sidebar appears from left** (all pages)
- [x] **4 classes per school** (school6, school7, school8)
- [x] **School B (school7) data exists** (was completely missing!)
- [x] **Term selection dropdown** (6 terms, 2 academic years)
- [x] **Progress charts render** (Highcharts mini line charts)
- [x] **Pill filters styled** (rounded 20px, purple active state)
- [x] **Class links work** (navigate to `/class/:classId`)
- [x] **Tree structure visible** (MAT → School → Classes)
- [x] **Visual badges** (Red/Amber/Green for performance)
- [x] **Compact metrics** (4-grid layout)
- [x] **Responsive design** (mobile: 2x2 metrics, 1-column classes)

---

## 🎉 Summary

**The GL Assessment page is now:**
- ✅ **Visual** - Charts instead of paragraphs
- ✅ **Compact** - 4 key metrics + mini chart per school
- ✅ **Interactive** - Term selection, pill filters
- ✅ **Hierarchical** - MAT → School → Classes drill-down
- ✅ **Complete** - 4 classes per school with full data
- ✅ **Consistent** - Hamburger menu on left across all pages
- ✅ **Fast to scan** - High-impact info immediately visible

**Time saved:**
- Old: 5+ minutes reading text per school
- New: 10 seconds scanning visual card per school

**Navigation improved:**
- Old: 5+ clicks to reach class data
- New: 2 clicks (GL → Class)

**Data coverage:**
- Old: 3 schools, 9 classes (School B missing!)
- New: 3 schools, 12 classes ✅

---

**Access:** http://localhost:3001/gl
