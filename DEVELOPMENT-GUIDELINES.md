# Development Guidelines - WCAG 2.2 Level AA Compliance

**CRITICAL**: All changes to this codebase MUST maintain WCAG 2.2 Level AA compliance.

---

## Quick Pre-Commit Checklist

Before committing any changes, verify:

- [ ] Color contrast meets minimum ratios (4.5:1 text, 3:1 UI components)
- [ ] All interactive elements have visible focus indicators
- [ ] Keyboard navigation works (Tab, Shift+Tab, Arrow keys, Escape, Enter)
- [ ] ARIA labels present on all interactive elements
- [ ] Semantic HTML5 landmarks used (header, nav, main, aside, footer)
- [ ] Images have alt text (or aria-label where appropriate)
- [ ] Forms have associated labels
- [ ] No information conveyed by color alone

---

## Color Usage Rules

### Approved Color Palette (Epoch UI)

**PRIMARY - Magenta** (Use for buttons, links, active states)
```css
--color-primary: #ba119b;           /* Contrast 4.6:1 on white ✓ */
--color-primary-focus: #610350;     /* Focus rings - 3:1 on white ✓ */
--color-primary-container: #f8e5f2; /* Backgrounds */
```

**SECONDARY - Deep Purple** (Use for accents, secondary actions)
```css
--color-secondary: #6f1ed8;         /* Contrast 3.8:1 on white ✓ */
--color-secondary-container: #efe6fa; /* Backgrounds */
```

**SEMANTIC COLORS**
```css
--color-tertiary: #00b46d;          /* Success - 3.2:1 on white ✓ */
--color-error: #ea4f46;             /* Error - 3.1:1 on white ✓ */
--color-warning: #e8ae66;           /* Warning - 2.9:1 (use with icon) */
--color-link: #3062d4;              /* Links - 7.2:1 on white ✓ */
```

**TEXT COLORS**
```css
--color-copy-primary: #292929;      /* Body text - 15.8:1 on white ✓ */
--color-10: #1d1b20;                /* Headings - 17.4:1 on white ✓ */
--color-70: #aea9b1;                /* Subdued - 2.8:1 (use for non-essential) */
```

### ⚠️ DO NOT:
- Use custom colors without checking contrast ratios
- Use color alone to convey information (always add text/icon)
- Use `--color-70` or lighter for essential text
- Override focus indicator colors

### ✅ DO:
- Use CSS custom properties from epoch-theme.css
- Test contrast with WebAIM Contrast Checker
- Add visual indicators beyond color (icons, underlines, borders)
- Verify focus rings are visible on all backgrounds

---

## Focus Indicators (WCAG 2.4.7, 2.4.11, 2.4.13)

### Required Pattern: Epoch UI Double-Ring

All interactive elements MUST show focus indicators:

```css
/* Standard focus (keyboard only) */
*:focus-visible {
  outline: 3px solid var(--color-primary-focus, #610350);
  outline-offset: 2px;
}

/* Enhanced focus (buttons, links, inputs) */
a:focus-visible,
button:focus-visible,
input:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring-primary);
  /* 0 0 0 0.19rem white, 0 0 0 0.38rem #610350 */
}
```

### ⚠️ DO NOT:
- Set `outline: none` without providing alternative focus indicator
- Use focus colors with insufficient contrast (must be 3:1 minimum)
- Skip `:focus-visible` pseudo-class (prevents mouse click outlines)

### ✅ DO:
- Always use `var(--focus-ring-primary)` for consistency
- Test focus visibility on all background colors
- Ensure focus indicators are at least 2px thick
- Verify keyboard navigation order is logical

---

## Keyboard Navigation (WCAG 2.1.1, 2.1.2, 2.4.3)

All functionality MUST be keyboard accessible.

### Required Key Support

| Element Type | Required Keys | Implementation |
|--------------|---------------|----------------|
| Buttons/Links | Tab, Shift+Tab, Enter, Space | Native HTML elements |
| Dropdowns | Arrow Up/Down, Enter, Escape | Custom event listeners |
| Modals | Tab (trapped), Escape (close) | Focus management |
| Tables | Tab, Arrow keys | ARIA roles if needed |
| Forms | Tab, Shift+Tab, Enter | Native HTML |

### Focus Trap Example (Modals)

```javascript
modal.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
  
  if (e.key === 'Tab') {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
});
```

### ⚠️ DO NOT:
- Create keyboard traps (except in modals with Escape key)
- Change default tab order with tabindex > 0
- Disable keyboard events

### ✅ DO:
- Use semantic HTML (button, a, input) for interactivity
- Provide skip links for long navigation
- Return focus to trigger element when closing modals
- Test entire flow with keyboard only (no mouse)

---

## ARIA Labels and Roles (WCAG 1.3.1, 4.1.2)

### When to Use ARIA

**Use ARIA when:**
- Custom interactive elements (role="button" on divs)
- Dynamic content updates (aria-live regions)
- Complex widgets (tabs, accordions, sliders)
- Providing additional context (aria-label, aria-describedby)

**DON'T use ARIA when:**
- Semantic HTML exists (use `<button>` not `<div role="button">`)
- Native HTML provides the same semantics

### Common Patterns

**Buttons**
```html
<!-- Good: Native button -->
<button type="button">Export PDF</button>

<!-- Acceptable: Non-button element made interactive -->
<div role="button" tabindex="0" aria-label="Export PDF">📄</div>

<!-- Bad: No role, no keyboard support -->
<div onclick="exportPDF()">Export</div>
```

**Navigation**
```html
<nav aria-label="Main navigation">
  <a href="/" aria-current="page">Home</a>
  <a href="/dashboard">Dashboard</a>
</nav>
```

**Live Regions (Dynamic Updates)**
```html
<!-- Polite: Non-urgent updates -->
<div role="status" aria-live="polite" aria-atomic="true">
  <p>PDF export complete</p>
</div>

<!-- Assertive: Urgent updates -->
<div role="alert" aria-live="assertive">
  <p>Error: Export failed</p>
</div>
```

**Forms**
```html
<label for="student-name">Student Name</label>
<input 
  id="student-name" 
  type="text" 
  required
  aria-required="true"
  aria-invalid="false"
  aria-describedby="name-hint"
/>
<span id="name-hint">First and last name</span>
```

**Modals**
```html
<div 
  role="dialog" 
  aria-modal="true" 
  aria-labelledby="modal-title"
  aria-hidden="false"
>
  <h2 id="modal-title">Export Pages</h2>
  <!-- modal content -->
</div>
```

### ⚠️ DO NOT:
- Add ARIA when native HTML works
- Forget to update aria-hidden when showing/hiding content
- Use aria-label on non-interactive elements (use visually-hidden text instead)

### ✅ DO:
- Use semantic HTML5 landmarks (header, nav, main, aside, footer)
- Add aria-label to buttons with only icons
- Update aria-expanded when toggling menus
- Use aria-current="page" on active navigation links

---

## Semantic HTML (WCAG 1.3.1)

### Required Landmark Structure

Every page MUST have:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Descriptive Page Title | GL Assessment</title>
</head>
<body>
  <!-- Skip Links (ALWAYS first) -->
  <nav class="skip-links" aria-label="Skip links">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <a href="#navigation" class="skip-link">Skip to navigation</a>
  </nav>

  <!-- Header -->
  <header role="banner">
    <h1>Site Title</h1>
  </header>

  <!-- Navigation -->
  <nav id="navigation" role="navigation" aria-label="Primary">
    <!-- nav links -->
  </nav>

  <!-- Main Content -->
  <main id="main-content" role="main">
    <h1>Page Heading (only one h1 per page)</h1>
    <!-- content -->
  </main>

  <!-- Footer -->
  <footer role="contentinfo">
    <!-- footer content -->
  </footer>
</body>
</html>
```

### Heading Hierarchy

```html
<!-- ✅ CORRECT: Logical heading order -->
<h1>Dashboard</h1>
  <h2>Quick Stats</h2>
  <h2>School Performance</h2>
    <h3>School A</h3>
    <h3>School B</h3>

<!-- ❌ WRONG: Skips h2, multiple h1s -->
<h1>Dashboard</h1>
<h1>Quick Stats</h1>
  <h3>School A</h3>
```

### ⚠️ DO NOT:
- Skip heading levels (h1 → h3)
- Use multiple h1 elements per page
- Use headings for styling (use CSS instead)
- Forget `lang` attribute on `<html>`

### ✅ DO:
- Use one h1 per page
- Maintain logical heading hierarchy
- Use semantic elements (article, section, aside)
- Add skip links at the very top

---

## Forms and Inputs (WCAG 1.3.1, 3.3.1, 3.3.2)

### Required Pattern

```html
<!-- Text Input -->
<div class="form-field">
  <label for="email" class="required">Email Address</label>
  <input 
    id="email" 
    type="email" 
    name="email"
    required
    aria-required="true"
    aria-invalid="false"
    aria-describedby="email-hint"
  />
  <span id="email-hint" class="form-hint">We'll never share your email</span>
  <span id="email-error" class="error-message" role="alert" style="display:none;">
    Please enter a valid email address
  </span>
</div>

<!-- Select Dropdown -->
<label for="school">Select School</label>
<select id="school" name="school" required aria-required="true">
  <option value="">Choose a school...</option>
  <option value="school-a">School A</option>
  <option value="school-b">School B</option>
</select>

<!-- Checkbox Group -->
<fieldset>
  <legend>Export Options</legend>
  <label>
    <input type="checkbox" name="include-charts" checked>
    Include charts
  </label>
  <label>
    <input type="checkbox" name="include-data">
    Include raw data
  </label>
</fieldset>

<!-- Radio Buttons -->
<fieldset>
  <legend>Report Format</legend>
  <label>
    <input type="radio" name="format" value="pdf" checked>
    PDF
  </label>
  <label>
    <input type="radio" name="format" value="excel">
    Excel
  </label>
</fieldset>
```

### Error Handling

```javascript
// Show error
const input = document.getElementById('email');
const errorMsg = document.getElementById('email-error');

input.setAttribute('aria-invalid', 'true');
errorMsg.style.display = 'block';
input.focus(); // Return focus to invalid field

// Clear error
input.setAttribute('aria-invalid', 'false');
errorMsg.style.display = 'none';
```

### ⚠️ DO NOT:
- Use placeholder as label (always use `<label>`)
- Show errors in red only (add icon or text)
- Forget to associate label with input (for/id)
- Use `aria-label` on inputs (use `<label>` instead)

### ✅ DO:
- Associate every input with a visible label
- Mark required fields with aria-required="true"
- Show error messages with role="alert"
- Use fieldset/legend for radio/checkbox groups
- Return focus to first invalid field on submit

---

## Images and Visual Content (WCAG 1.1.1, 1.4.5)

### Alt Text Guidelines

```html
<!-- Informative Image -->
<img src="chart.png" alt="Bar chart showing School A performance: 112 SAS">

<!-- Decorative Image -->
<img src="decorative-pattern.svg" alt="" role="presentation">

<!-- Functional Image (e.g., button) -->
<button>
  <img src="pdf-icon.svg" alt="Export to PDF">
</button>

<!-- Complex Chart (provide text alternative) -->
<div role="img" aria-label="Performance trends from 2023-2025">
  <canvas id="chart"></canvas>
  <div class="sr-only">
    <h3>Performance Trends</h3>
    <ul>
      <li>2023: 98 SAS</li>
      <li>2024: 102 SAS</li>
      <li>2025: 105 SAS</li>
    </ul>
  </div>
</div>

<!-- Icon with Text (no alt needed on icon) -->
<a href="/download">
  <svg aria-hidden="true"><!-- icon --></svg>
  Download Report
</a>
```

### ⚠️ DO NOT:
- Leave alt text empty for informative images
- Use generic alt text ("image", "chart", "icon")
- Put "image of" or "picture of" in alt text
- Describe decorative images

### ✅ DO:
- Describe the information conveyed by the image
- Use alt="" for purely decorative images
- Provide text alternatives for charts/graphs
- Use aria-hidden="true" on decorative icons with visible text

---

## Testing Checklist (Before Every Commit)

### 1. Keyboard Navigation (5 minutes)
```
1. Disconnect mouse
2. Use Tab key to navigate entire page
3. Verify all interactive elements are reachable
4. Verify visible focus indicators on all elements
5. Test Enter/Space on buttons
6. Test Escape to close modals/menus
7. Test Arrow keys in dropdowns
```

### 2. Screen Reader (10 minutes)
```
1. Enable VoiceOver (Mac) or NVDA (Windows)
2. Navigate with Tab key - verify all elements are announced
3. Use heading navigation (Cmd+Option+H on Mac)
4. Verify images have appropriate alt text
5. Verify form labels are announced
6. Verify ARIA live regions announce updates
7. Verify modal focus is trapped
```

### 3. Color Contrast (2 minutes)
```
1. Open browser dev tools
2. Inspect all text elements
3. Use "Show accessibility properties" or contrast checker
4. Verify: Text ≥ 4.5:1, UI components ≥ 3:1
5. Check hover/focus states
```

### 4. Visual Inspection (5 minutes)
```
1. Zoom page to 200% (Cmd/Ctrl + +)
2. Verify no horizontal scrolling
3. Verify text is still readable
4. Verify no content is cut off
5. Test on mobile viewport (375px width)
```

### 5. Automated Scan (3 minutes)
```
1. Install axe DevTools browser extension
2. Run full page scan
3. Fix all Critical and Serious issues
4. Review Moderate and Minor issues
```

---

## Tools and Resources

### Browser Extensions
- **axe DevTools** (Chrome/Firefox) - Automated accessibility testing
- **WAVE** (Chrome/Firefox/Edge) - Visual accessibility inspector
- **Lighthouse** (Chrome DevTools) - Audit tool (includes accessibility)

### Contrast Checkers
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Colour Contrast Analyser**: https://www.tpgi.com/color-contrast-checker/

### Screen Readers
- **VoiceOver** (Mac) - Cmd+F5 to enable
- **NVDA** (Windows) - Free download: https://www.nvaccess.org/
- **JAWS** (Windows) - Commercial: https://www.freedomscientific.com/

### Online Validators
- **W3C HTML Validator**: https://validator.w3.org/
- **AChecker**: https://achecker.achecks.ca/

### Documentation
- **WCAG 2.2 Guidelines**: https://www.w3.org/WAI/WCAG22/quickref/
- **ARIA Practices**: https://www.w3.org/WAI/ARIA/apg/
- **MDN Accessibility**: https://developer.mozilla.org/en-US/docs/Web/Accessibility

---

## Common Violations and Fixes

### Violation: Low Color Contrast
```css
/* ❌ WRONG: Insufficient contrast (2.5:1) */
.label {
  color: #999999; /* Light gray on white */
}

/* ✅ CORRECT: Sufficient contrast (4.6:1) */
.label {
  color: var(--color-copy-primary); /* #292929 */
}
```

### Violation: Missing Focus Indicator
```css
/* ❌ WRONG: Removes focus outline without alternative */
button:focus {
  outline: none;
}

/* ✅ CORRECT: Custom focus indicator */
button:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring-primary);
}
```

### Violation: Non-Semantic Markup
```html
<!-- ❌ WRONG: div acting as button -->
<div onclick="doSomething()">Click me</div>

<!-- ✅ CORRECT: Semantic button -->
<button type="button" onclick="doSomething()">Click me</button>
```

### Violation: Missing Form Labels
```html
<!-- ❌ WRONG: No label -->
<input type="text" placeholder="Enter name">

<!-- ✅ CORRECT: Visible label -->
<label for="name">Name</label>
<input id="name" type="text" placeholder="e.g. John Smith">
```

### Violation: Empty Links
```html
<!-- ❌ WRONG: No accessible text -->
<a href="/download">
  <svg><!-- icon --></svg>
</a>

<!-- ✅ CORRECT: aria-label or visible text -->
<a href="/download" aria-label="Download report">
  <svg aria-hidden="true"><!-- icon --></svg>
</a>
```

### Violation: Poor Heading Structure
```html
<!-- ❌ WRONG: Skips h2 -->
<h1>Dashboard</h1>
<h3>Statistics</h3>

<!-- ✅ CORRECT: Logical order -->
<h1>Dashboard</h1>
<h2>Statistics</h2>
```

---

## Component Library (Pre-Approved Patterns)

### Button
```html
<button type="button" class="btn btn-primary">
  Primary Action
</button>

<!-- Icon button -->
<button type="button" class="btn btn-primary" aria-label="Export to PDF">
  <svg aria-hidden="true"><!-- PDF icon --></svg>
</button>
```

### Link
```html
<a href="/dashboard" class="nav-link">Dashboard</a>

<!-- External link -->
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  External Site
  <span class="sr-only">(opens in new tab)</span>
</a>
```

### Card
```html
<article class="card">
  <h3>School A Performance</h3>
  <p>Average SAS: <strong>112</strong></p>
  <a href="/school-a" class="btn btn-secondary">View Details</a>
</article>
```

### Modal
```html
<div 
  class="pdf-modal" 
  role="dialog" 
  aria-modal="true" 
  aria-labelledby="modal-title"
  aria-hidden="true"
>
  <div class="pdf-modal-content">
    <div class="pdf-modal-header">
      <h3 id="modal-title">Export Options</h3>
      <button type="button" class="pdf-modal-close" aria-label="Close dialog">
        &times;
      </button>
    </div>
    <div class="pdf-modal-body">
      <!-- modal content -->
    </div>
    <div class="pdf-modal-footer">
      <button type="button" class="btn btn-secondary">Cancel</button>
      <button type="button" class="btn btn-primary">Export</button>
    </div>
  </div>
</div>
```

### Table
```html
<table>
  <caption>School Performance Data</caption>
  <thead>
    <tr>
      <th scope="col">School</th>
      <th scope="col">SAS</th>
      <th scope="col">Rank</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">School A</th>
      <td>112</td>
      <td>1st</td>
    </tr>
  </tbody>
</table>
```

---

## Quick Reference Card

Print this out and keep at your desk:

```
✅ ALWAYS:
- Use semantic HTML (button, a, nav, main, header, footer)
- Include visible focus indicators
- Test with keyboard only (Tab, Enter, Escape)
- Use CSS custom properties from epoch-theme.css
- Check color contrast (4.5:1 text, 3:1 UI)
- Associate labels with form inputs
- Provide alt text for images
- Use ARIA landmarks (role="main", aria-label)
- Test with screen reader

❌ NEVER:
- Remove focus outline without replacement
- Use color alone to convey information
- Create custom interactive elements without keyboard support
- Use placeholder as label
- Skip heading levels (h1 → h3)
- Forget to trap focus in modals
- Use text smaller than 14px for body copy
- Override --color-primary without checking contrast

🔍 BEFORE COMMITTING:
1. Tab through entire page (all elements reachable?)
2. Check focus indicators (visible on all elements?)
3. Run axe DevTools (no Critical/Serious issues?)
4. Zoom to 200% (still usable?)
5. Test screen reader (elements announced correctly?)
```

---

## Support and Questions

If you're unsure whether a design pattern meets WCAG 2.2:

1. Check this guide first
2. Test with the tools listed above
3. Consult WCAG 2.2 Quick Reference: https://www.w3.org/WAI/WCAG22/quickref/
4. Review existing accessible patterns in the codebase
5. When in doubt, test with real assistive technology

**Remember**: Accessibility is not optional. It's a requirement for all features in this codebase.

---

**Last Updated**: April 14, 2026  
**WCAG Version**: 2.2 Level AA  
**Maintained By**: Development Team
