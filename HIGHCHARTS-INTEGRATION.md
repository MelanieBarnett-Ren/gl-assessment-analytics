# 📊 Highcharts Integration Guide

## Overview

Highcharts is a powerful JavaScript charting library perfect for educational data visualisations. This guide shows how to integrate it into the GL Assessment system.

---

## 🎯 Installation

### Option 1: CDN (Quickest)

Add to your HTML `<head>`:

```html
<!-- Highcharts Core -->
<script src="https://code.highcharts.com/highcharts.js"></script>

<!-- Optional modules -->
<script src="https://code.highcharts.com/modules/exporting.js"></script>
<script src="https://code.highcharts.com/modules/export-data.js"></script>
<script src="https://code.highcharts.com/modules/accessibility.js"></script>
```

### Option 2: npm (Production)

```bash
npm install highcharts --save
```

Then import:
```javascript
import Highcharts from 'highcharts';
```

---

## 📈 Recommended Charts for Educational Data

### 1. **Progress Over Time (Line Chart)**
**Use Case**: Show SAS score progression across terms

```javascript
Highcharts.chart('progress-container', {
  chart: {
    type: 'line'
  },
  title: {
    text: 'School A Progress - Year 5 Maths'
  },
  xAxis: {
    categories: ['Autumn 2023', 'Spring 2024', 'Summer 2024', 'Autumn 2024']
  },
  yAxis: {
    title: {
      text: 'SAS Score'
    },
    plotLines: [{
      value: 100,
      color: '#10b981',
      dashStyle: 'dash',
      width: 2,
      label: {
        text: 'National Average (100)',
        align: 'right'
      }
    }]
  },
  series: [{
    name: 'School A',
    data: [95, 93, 92, 92],
    color: '#dc2626'
  }, {
    name: 'School C',
    data: [98, 102, 105, 105],
    color: '#10b981'
  }]
});
```

---

### 2. **Skill Gap Analysis (Bar Chart)**
**Use Case**: Compare school performance vs national on specific skills

```javascript
Highcharts.chart('skills-container', {
  chart: {
    type: 'bar'
  },
  title: {
    text: 'Top Skill Gaps - School A'
  },
  xAxis: {
    categories: [
      'Convert fractions to decimals',
      'Equivalent fractions',
      'Multiply 2-digit by 1-digit',
      'Divide with remainders',
      'Add fractions'
    ]
  },
  yAxis: {
    title: {
      text: 'Percentage Correct'
    }
  },
  plotOptions: {
    series: {
      dataLabels: {
        enabled: true,
        format: '{y}%'
      }
    }
  },
  series: [{
    name: 'Your School',
    data: [34, 42, 52, 48, 56],
    color: '#dc2626'
  }, {
    name: 'National Average',
    data: [68, 75, 78, 72, 82],
    color: '#3b82f6'
  }]
});
```

---

### 3. **Value-Added Scatter Plot**
**Use Case**: CAT4 (x-axis) vs NGMT (y-axis) for all students

```javascript
Highcharts.chart('value-added-container', {
  chart: {
    type: 'scatter',
    zoomType: 'xy'
  },
  title: {
    text: 'CAT4 vs NGMT Performance - School A'
  },
  xAxis: {
    title: {
      text: 'CAT4 SAS (Cognitive Ability)'
    },
    plotLines: [{
      value: 100,
      color: '#6b7280',
      width: 1,
      dashStyle: 'dash'
    }]
  },
  yAxis: {
    title: {
      text: 'NGMT SAS (Maths Attainment)'
    },
    plotLines: [{
      value: 100,
      color: '#6b7280',
      width: 1,
      dashStyle: 'dash'
    }]
  },
  series: [{
    name: 'Students',
    color: '#3b82f6',
    data: [
      [96, 85], [94, 88], [103, 79], [98, 92], [92, 85],
      [105, 98], [89, 82], [112, 105], [87, 78], [100, 95]
      // ... more student data points [CAT4, NGMT]
    ]
  }, {
    // Diagonal line showing "working to potential"
    type: 'line',
    name: 'Expected (no value added)',
    data: [[70, 70], [130, 130]],
    color: '#10b981',
    dashStyle: 'dash',
    marker: {
      enabled: false
    },
    enableMouseTracking: false
  }]
});
```

---

### 4. **Domain Heatmap**
**Use Case**: Show strength/weakness across domains and classes

```javascript
Highcharts.chart('heatmap-container', {
  chart: {
    type: 'heatmap',
    marginTop: 40,
    marginBottom: 80
  },
  title: {
    text: 'Skills Mastery Heatmap - All Classes'
  },
  xAxis: {
    categories: ['Class 5A', 'Class 5B', 'Class 5C']
  },
  yAxis: {
    categories: [
      'Fractions to decimals',
      'Equivalent fractions',
      'Multiply 2-digit',
      'Divide with remainders',
      'Add fractions',
      'Continue sequence',
      'Simple expressions',
      'Identify 3D shapes'
    ],
    title: null
  },
  colorAxis: {
    min: 0,
    max: 100,
    stops: [
      [0, '#dc2626'],    // Red (0%)
      [0.5, '#f59e0b'],  // Orange (50%)
      [0.7, '#3b82f6'],  // Blue (70%)
      [1, '#10b981']     // Green (100%)
    ]
  },
  series: [{
    name: 'Percentage Correct',
    borderWidth: 1,
    data: [
      [0, 0, 32], [0, 1, 40], [0, 2, 45],  // Class 5A - Fractions to decimals
      [1, 0, 38], [1, 1, 42], [1, 2, 48],  // Class 5A - Equivalent fractions
      [2, 0, 52], [2, 1, 55], [2, 2, 58],  // etc...
      [3, 0, 48], [3, 1, 52], [3, 2, 50],
      [4, 0, 56], [4, 1, 60], [4, 2, 62],
      [5, 0, 72], [5, 1, 68], [5, 2, 64],
      [6, 0, 54], [6, 1, 58], [6, 2, 52],
      [7, 0, 75], [7, 1, 78], [7, 2, 70]
    ],
    dataLabels: {
      enabled: true,
      color: '#000000',
      format: '{point.value}%'
    }
  }],
  tooltip: {
    formatter: function () {
      return '<b>' + this.series.yAxis.categories[this.point.y] + '</b><br>' +
        this.series.xAxis.categories[this.point.x] + ': <b>' +
        this.point.value + '%</b>';
    }
  }
});
```

---

### 5. **Gauge Chart for Overall Performance**
**Use Case**: Visual "speedometer" showing school SAS

```javascript
Highcharts.chart('gauge-container', {
  chart: {
    type: 'solidgauge'
  },
  title: {
    text: 'School A Overall Performance'
  },
  pane: {
    center: ['50%', '85%'],
    size: '140%',
    startAngle: -90,
    endAngle: 90,
    background: {
      backgroundColor: '#EEE',
      innerRadius: '60%',
      outerRadius: '100%',
      shape: 'arc'
    }
  },
  yAxis: {
    min: 70,
    max: 130,
    stops: [
      [0.1, '#dc2626'], // Red
      [0.4, '#f59e0b'], // Orange
      [0.6, '#3b82f6'], // Blue
      [0.9, '#10b981']  // Green
    ],
    lineWidth: 0,
    tickWidth: 0,
    minorTickInterval: null,
    tickAmount: 2,
    title: {
      y: -70,
      text: 'SAS Score'
    },
    labels: {
      y: 16
    }
  },
  plotOptions: {
    solidgauge: {
      dataLabels: {
        y: 5,
        borderWidth: 0,
        useHTML: true
      }
    }
  },
  series: [{
    name: 'SAS',
    data: [92],
    dataLabels: {
      format:
        '<div style="text-align:center">' +
        '<span style="font-size:25px">{y}</span><br/>' +
        '<span style="font-size:12px;opacity:0.4">SAS Score</span>' +
        '</div>'
    }
  }]
});
```

---

### 6. **Pyramid Chart for Focus Groups**
**Use Case**: Show distribution of foundation/consolidation/extension groups

```javascript
Highcharts.chart('pyramid-container', {
  chart: {
    type: 'pyramid'
  },
  title: {
    text: 'Class 5A Focus Groups'
  },
  plotOptions: {
    series: {
      dataLabels: {
        enabled: true,
        format: '<b>{point.name}</b> ({point.y} students)',
        softConnector: true
      },
      center: ['50%', '50%'],
      width: '80%'
    }
  },
  series: [{
    name: 'Students',
    data: [
      ['Extension', 3],
      ['Consolidation', 13],
      ['Foundation', 12]
    ],
    colors: ['#10b981', '#3b82f6', '#dc2626']
  }]
});
```

---

## 🎨 Styling to Match Your Brand

### Theme Configuration

```javascript
Highcharts.setOptions({
  colors: ['#3b82f6', '#10b981', '#f59e0b', '#dc2626', '#8b5cf6', '#06b6d4'],
  chart: {
    backgroundColor: '#ffffff',
    style: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }
  },
  title: {
    style: {
      color: '#1f2937',
      fontSize: '18px',
      fontWeight: '600'
    }
  },
  xAxis: {
    gridLineColor: '#e5e7eb',
    labels: {
      style: {
        color: '#6b7280'
      }
    }
  },
  yAxis: {
    gridLineColor: '#e5e7eb',
    labels: {
      style: {
        color: '#6b7280'
      }
    }
  },
  legend: {
    itemStyle: {
      color: '#374151'
    }
  }
});
```

---

## 📱 Responsive Charts

Make charts mobile-friendly:

```javascript
Highcharts.chart('container', {
  // ... chart config ...
  responsive: {
    rules: [{
      condition: {
        maxWidth: 500
      },
      chartOptions: {
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom'
        },
        yAxis: {
          labels: {
            align: 'left',
            x: 0,
            y: -5
          },
          title: {
            text: null
          }
        },
        subtitle: {
          text: null
        },
        credits: {
          enabled: false
        }
      }
    }]
  }
});
```

---

## ♿ Accessibility

Highcharts has excellent accessibility features:

```javascript
accessibility: {
  enabled: true,
  keyboardNavigation: {
    enabled: true
  },
  announceNewData: {
    enabled: true
  }
}
```

---

## 🚀 Implementation Example

Create a new page: `server/highcharts-demo.html`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>GL Assessment - Visual Analytics</title>
  <script src="https://code.highcharts.com/highcharts.js"></script>
  <script src="https://code.highcharts.com/modules/heatmap.js"></script>
  <script src="https://code.highcharts.com/highcharts-more.js"></script>
  <script src="https://code.highcharts.com/modules/solid-gauge.js"></script>
  <style>
    body { font-family: sans-serif; margin: 40px; background: #f5f7fa; }
    .chart-container { background: white; padding: 24px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #1e3a8a; }
  </style>
</head>
<body>
  <h1>📊 GL Assessment Visual Analytics</h1>

  <div class="chart-container">
    <div id="progress-chart"></div>
  </div>

  <div class="chart-container">
    <div id="skills-chart"></div>
  </div>

  <div class="chart-container">
    <div id="value-added-chart"></div>
  </div>

  <script>
    // Apply theme
    Highcharts.setOptions({
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#dc2626'],
      chart: {
        style: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        }
      }
    });

    // Progress chart
    Highcharts.chart('progress-chart', {
      // ... config from examples above ...
    });

    // Skills chart
    Highcharts.chart('skills-chart', {
      // ... config from examples above ...
    });

    // Value-added chart
    Highcharts.chart('value-added-chart', {
      // ... config from examples above ...
    });
  </script>
</body>
</html>
```

Then add route in `dev-server.ts`:

```typescript
app.get('/charts', (req, res) => {
  res.sendFile(path.join(__dirname, 'highcharts-demo.html'));
});
```

---

## 📊 Recommended Charts by Use Case

| Use Case | Chart Type | Priority |
|----------|-----------|----------|
| Progress over time | Line Chart | ⭐⭐⭐ Essential |
| Skill gaps | Horizontal Bar | ⭐⭐⭐ Essential |
| CAT4 vs NGMT | Scatter Plot | ⭐⭐ Important |
| Cross-class heatmap | Heatmap | ⭐⭐ Important |
| School performance | Gauge | ⭐ Nice-to-have |
| Focus groups | Pyramid | ⭐ Nice-to-have |

---

## 💰 Pricing

- **Free** for non-commercial use
- **Commercial licence** required for revenue-generating products
- Check: https://www.highcharts.com/products/highcharts/#non-commercial

For UK schools/MATs, you may qualify for educational pricing.

---

## 🎓 Learning Resources

- **Docs**: https://api.highcharts.com/highcharts/
- **Demos**: https://www.highcharts.com/demo
- **JSFiddle examples**: https://www.highcharts.com/blog/tutorials/

---

**Would you like me to implement any specific chart type for your GL Assessment data?**
