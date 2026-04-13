# 🕸️ Spider Charts Implementation

## Overview

Replaced the bar chart for "Top Skill Gaps" with an interactive **Spider/Radar Chart** showing performance across 6 maths domains. This provides a more intuitive visual comparison of school performance vs national average.

---

## 📊 What is a Spider Chart?

A **spider chart** (also called **radar chart** or **web chart**) is a graphical method of displaying multivariate data in the form of a two-dimensional chart of three or more quantitative variables represented on axes starting from the same point.

### Benefits for Teachers:
- **Visual gaps at a glance**: See which domains are strong/weak immediately
- **Shape comparison**: School's shape vs National shape shows relative performance
- **Multiple dimensions**: View 6 domains simultaneously instead of scrolling through bars
- **Pattern recognition**: Easier to spot patterns across related domains

---

## 🎯 Implementation Details

### Location: Visual Dashboard
**File**: `server/gl-dashboard.html`
**Chart ID**: `skillsChart`
**Title**: "🕸️ Domain Performance Spider Chart"

### Chart Configuration

```javascript
Highcharts.chart('skillsChart', {
  chart: {
    polar: true,      // Makes it a spider/radar chart
    type: 'line'
  },
  pane: {
    size: '80%'       // Chart takes 80% of container
  },
  xAxis: {
    categories: [
      'Number',
      'Fractions',
      'Algebra',
      'Geometry',
      'Measurement',
      'Statistics'
    ],
    tickmarkPlacement: 'on',
    lineWidth: 0
  },
  yAxis: {
    gridLineInterpolation: 'polygon',  // Hexagonal grid
    min: 0,
    max: 100,
    tickInterval: 25   // Lines at 0, 25, 50, 75, 100
  }
})
```

---

## 📈 Data Structure

### Domain Performance (6 Domains)

```javascript
const domainData = {
  school6: {
    schoolScores: [45, 34, 52, 48, 50, 42],  // School A
    nationalScores: [72, 68, 75, 73, 78, 70]
  },
  school7: {
    schoolScores: [68, 62, 72, 70, 75, 66],  // School B
    nationalScores: [72, 68, 75, 73, 78, 70]
  },
  school8: {
    schoolScores: [82, 78, 85, 83, 88, 80],  // School C
    nationalScores: [72, 68, 75, 73, 78, 70]
  }
};
```

### Domain Mapping (6 axes)

1. **Number** - Place value, operations, arithmetic
2. **Fractions** - Fractions, decimals & percentages
3. **Algebra** - Sequences, patterns, equations
4. **Geometry** - Properties of shapes, position & direction
5. **Measurement** - Length, mass, volume, time
6. **Statistics** - Data interpretation, probability

---

## 🎨 Visual Design

### Color Coding

| School | Color | When Used |
|--------|-------|-----------|
| School A (Struggling) | Red `#dc2626` | SAS 90, below national |
| School B (Average) | Amber `#f59e0b` | SAS 100, at national |
| School C (Best Practice) | Green `#10b981` | SAS 112, above national |
| National Average | Blue `#3b82f6` | Dashed line |

### Line Styles

- **School Line**: Solid, 3px width, circular markers (radius 4)
- **National Line**: Dashed, 2px width, circular markers (radius 3)

### Interactive Features

- **Hover Tooltip**: Shows exact percentage for each domain
- **Click**: Navigates to `/school/:schoolId/skills` for detailed analysis
- **Legend**: Shows school name and "National Average"

---

## 📊 Interpretation Guide

### Example: School A (Red Pentagon)

```
        Number 45%
           /\
          /  \
Stats 42% -------- Fractions 34%
         /      \
        /        \
Measurement 50%  Algebra 52%
         \      /
          \    /
           Geometry 48%
```

**Reading the Chart:**
- **Shape is compressed** → School performing below national across all domains
- **Fractions is weakest** → Only 34% vs 68% national (34-point gap)
- **No domain exceeds national** → Entire red shape inside blue dashed line
- **Consistent weakness** → All domains 20-30 points below national

### Example: School C (Green Hexagon)

```
        Number 82%
           /\
          /  \
Stats 80% -------- Fractions 78%
         /      \
        /        \
Measurement 88%  Algebra 85%
         \      /
          \    /
           Geometry 83%
```

**Reading the Chart:**
- **Shape extends outward** → School exceeds national in all domains
- **Measurement strongest** → 88% vs 78% national (10-point lead)
- **Balanced performance** → All domains 78-88% (small variation)
- **Green outside blue** → Entire shape exceeds national benchmark

---

## 🎓 Teacher Use Cases

### Scenario 1: Identifying Priority Domains

**Teacher asks:** "Where should I focus my intervention time?"

**Spider Chart shows:**
- School A: Fractions (34%) is furthest from national (68%)
- School A: 34-point gap is largest among all domains
- **Action:** Prioritize Y5 Focus Skills 524-531 (fractions strand)

### Scenario 2: Comparing Schools for Best Practice

**MAT Leader asks:** "Which school should host CPD on Algebra?"

**Spider Chart shows:**
- School A: Algebra 52%
- School B: Algebra 72%
- School C: Algebra 85%
- **Action:** Observe School C's Algebra teaching

### Scenario 3: Balanced vs Unbalanced Performance

**Consultant asks:** "Is this a curriculum issue or teaching quality issue?"

**Spider Chart shows:**
- If **shape is consistently small** → Teaching quality/school factors
- If **one domain is weak** → Curriculum sequencing/staffing issue
- **School A:** Consistently small (20-30 points below) → Systemic issue

---

## 🔗 Integration with Existing Features

### Click Navigation
- **Click any domain** → Navigate to `/school/:schoolId/skills`
- Skills page shows detailed breakdown by domain
- Heatmap shows class-level variation

### Responsive Design
- Chart adapts to screen size
- Legend moves to bottom on mobile
- Tooltip positions adjust automatically

### Data Consistency
- Domain scores align with data shown in:
  - MAT Overview (aggregate scores)
  - GL Assessment page (implications)
  - Skills Analysis page (domain tabs)
  - Strand pages (NC objectives)

---

## 📱 Responsive Behavior

```css
@media (max-width: 768px) {
  .chart-card {
    grid-column: span 1; /* Full width on mobile */
  }
  
  #skillsChart {
    height: 320px; /* Taller on mobile for better touch */
  }
}
```

---

## ✅ Testing Checklist

- [x] **School A**: Red spider chart, all domains below national
- [x] **School B**: Amber spider chart, close to national
- [x] **School C**: Green spider chart, all domains above national
- [x] **Hover tooltip**: Shows school name and percentage
- [x] **Click navigation**: Goes to skills analysis page
- [x] **Legend**: Shows both school and national
- [x] **Responsive**: Works on desktop, tablet, mobile

---

## 🎯 Future Enhancements

### 1. **Comparison Mode**
Allow selecting 2 schools to compare directly:
```javascript
series: [{
  name: 'School A',
  data: domainData.school6.schoolScores,
  color: '#dc2626'
}, {
  name: 'School C',
  data: domainData.school8.schoolScores,
  color: '#10b981'
}]
```

### 2. **Time Series Animation**
Show how spider chart shape changes over 4 terms:
- Autumn 2023 → Spring 2024 → Summer 2024 → Autumn 2024
- Animate shape growing/shrinking

### 3. **Focus Skills Overlay**
Add inner ring showing Focus Skills performance:
- Outer ring: All skills
- Inner ring: Focus Skills only (305 of 1,304)

### 4. **Interactive Domain Selection**
Click domain to drill to specific strand:
- Click "Fractions" → Go to `/school/:schoolId/strand/number-fractions`
- Click "Algebra" → Go to `/school/:schoolId/strand/algebra-sequences`

---

## 📝 Files Modified

### Modified:
- `server/gl-dashboard.html`
  - Updated `renderSkillsChart()` function
  - Changed from `bar` chart to `polar` chart
  - Added `domainData` structure (6 domains)
  - Updated chart title to "🕸️ Domain Performance Spider Chart"
  - Increased chart height from 300px to 350px

### Documentation:
- `SPIDER-CHARTS.md` (this file)

---

## 🎉 Summary

**Spider charts provide:**
- ✅ **Visual intuition** - See gaps at a glance
- ✅ **Multi-dimensional** - 6 domains simultaneously
- ✅ **Comparative** - School vs national on same chart
- ✅ **Pattern recognition** - Shape tells the story
- ✅ **Interactive** - Click to drill down to details

**Teachers love spider charts because:**
- No scrolling through multiple bar charts
- Shape comparison is faster than number comparison
- Easier to communicate gaps to SLT/governors
- More engaging in presentations

**Access the spider chart:** 
http://localhost:3001/dashboard → Click any school → See 🕸️ Domain Performance Spider Chart
