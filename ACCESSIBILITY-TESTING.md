# Accessibility Testing Guide

## Quick Keyboard Navigation Test

### Test 1: Basic Tab Navigation
1. Open http://localhost:3001/
2. Press **Tab** key repeatedly
3. ✅ **Expected**: Blue focus ring appears on each interactive element
4. ✅ **Expected**: Tab order follows visual layout (skip links → menu → content → footer → PDF button)

### Test 2: Skip Links
1. Open any page
2. Press **Tab** once
3. ✅ **Expected**: "Skip to main content" link appears at top of page
4. Press **Enter**
5. ✅ **Expected**: Focus jumps to main content area

### Test 3: Menu Navigation
1. Open any page
2. Tab to PDF export button (bottom right)
3. Press **Enter** to open menu
4. Press **Arrow Down** key
5. ✅ **Expected**: Focus moves to next menu item
6. Press **Arrow Up** key
7. ✅ **Expected**: Focus moves to previous menu item
8. Press **Escape**
9. ✅ **Expected**: Menu closes, focus returns to button

### Test 4: Modal Interaction
1. Click PDF export button
2. Select "Select Pages"
3. Press **Tab**
4. ✅ **Expected**: Focus stays within modal (focus trap working)
5. Press **Escape**
6. ✅ **Expected**: Modal closes, focus returns to PDF button

## Visual Accessibility Test

### Test 5: Focus Indicators
1. Open any page
2. Press Tab repeatedly
3. ✅ **Expected**: Every interactive element shows visible blue outline when focused
4. ✅ **Expected**: Outline is at least 3px thick
5. ✅ **Expected**: Outline has 2px offset from element

### Test 6: Zoom/Text Scaling
1. Open http://localhost:3001/
2. Press **Cmd/Ctrl + Plus** to zoom to 200%
3. ✅ **Expected**: All text scales proportionally
4. ✅ **Expected**: No horizontal scrolling required
5. ✅ **Expected**: All functionality still works
6. ✅ **Expected**: Focus indicators still visible

### Test 7: Color Contrast
1. Open any page
2. Check text readability
3. ✅ **Expected**: All body text meets 4.5:1 contrast ratio
4. ✅ **Expected**: Large text (headings) meets 3:1 ratio
5. ✅ **Expected**: Interactive elements (buttons, links) meet 3:1 ratio

### Test 8: Responsive Design
1. Resize browser to 320px wide (mobile)
2. ✅ **Expected**: Content reflows to single column
3. ✅ **Expected**: No horizontal scrolling
4. ✅ **Expected**: All interactive elements remain usable
5. ✅ **Expected**: Touch targets are at least 24×24px

## Screen Reader Test (macOS VoiceOver)

### Test 9: Enable VoiceOver
1. Press **Cmd + F5** to enable VoiceOver
2. Open http://localhost:3001/
3. ✅ **Expected**: Page title announced
4. ✅ **Expected**: "GL Assessment Analytics" announced

### Test 10: Navigate by Headings
1. With VoiceOver on, press **VO + Cmd + H**
2. ✅ **Expected**: Rotor shows all headings
3. Press **Arrow Down**
4. ✅ **Expected**: Navigates through heading hierarchy
5. ✅ **Expected**: Heading levels announced (h1, h2, h3)

### Test 11: Navigate by Landmarks
1. With VoiceOver on, press **VO + U**
2. Press **Left/Right** arrows to select "Landmarks"
3. ✅ **Expected**: Shows "banner", "navigation", "main", "contentinfo"
4. Press **Arrow Down** to navigate
5. ✅ **Expected**: Can jump to each landmark

### Test 12: Read Buttons and Links
1. With VoiceOver on, navigate to PDF button
2. ✅ **Expected**: Announces "Export to PDF button"
3. ✅ **Expected**: Announces "has popup"
4. Press **Space** to activate
5. ✅ **Expected**: Menu opens
6. ✅ **Expected**: Announces "Export to PDF menu"

## Automated Testing

### Test 13: Lighthouse Audit
```bash
# Open Chrome DevTools
1. Right-click page → Inspect
2. Click "Lighthouse" tab
3. Check "Accessibility"
4. Click "Analyze page load"
```
✅ **Expected**: Score 95+ out of 100

### Test 14: WAVE Browser Extension
```bash
# Install WAVE extension for Chrome/Firefox
1. Visit any page
2. Click WAVE extension icon
3. Review report
```
✅ **Expected**: No errors, minimal warnings

### Test 15: axe DevTools
```bash
# Install axe DevTools extension
1. Right-click page → Inspect
2. Click "axe DevTools" tab
3. Click "Scan ALL of my page"
```
✅ **Expected**: No violations found

## Advanced Testing

### Test 16: Keyboard Trap Check
1. Open any page
2. Tab through **entire page**
3. ✅ **Expected**: Can reach every interactive element
4. ✅ **Expected**: Can tab away from every element
5. ✅ **Expected**: No infinite loops or stuck focus

### Test 17: Motion Reduction
1. Enable "Reduce Motion" in OS settings:
   - **macOS**: System Preferences → Accessibility → Display → Reduce motion
   - **Windows**: Settings → Ease of Access → Display → Show animations
2. Open any page
3. ✅ **Expected**: Animations still work but are much faster (0.01ms)
4. ✅ **Expected**: No jarring motion effects

### Test 18: High Contrast Mode
1. Enable high contrast:
   - **macOS**: System Preferences → Accessibility → Display → Increase contrast
   - **Windows**: Settings → Ease of Access → High contrast
2. Open any page
3. ✅ **Expected**: All UI elements remain visible
4. ✅ **Expected**: Borders appear on all interactive elements

## Common Issues to Check

### 🚫 Issues to Avoid
- ❌ Focus indicators missing or invisible
- ❌ Keyboard traps (can't tab away from element)
- ❌ Poor color contrast (text too light)
- ❌ Missing ARIA labels on buttons/links
- ❌ Incorrect heading hierarchy (h1 → h3 without h2)
- ❌ Touch targets too small (< 24×24px)
- ❌ Horizontal scrolling at any zoom level
- ❌ Content overlapping at 200% zoom

### ✅ What Good Looks Like
- ✅ Visible 3px blue focus ring on all elements
- ✅ Can navigate entire site with keyboard only
- ✅ Screen reader announces all content clearly
- ✅ Text readable at 200% zoom
- ✅ All interactive elements 24×24px minimum
- ✅ Logical tab order throughout
- ✅ Headings create proper document outline
- ✅ Skip links work to bypass navigation

## Testing Checklist

Print this checklist and test each item:

```
□ Tab navigation works on all pages
□ Skip links appear and function
□ Focus indicators visible (3px blue)
□ Escape key closes menus/modals
□ Arrow keys navigate menus
□ Can zoom to 200% without issues
□ No horizontal scrolling at 320px
□ Color contrast passes (4.5:1 minimum)
□ Screen reader announces content
□ Headings create logical hierarchy
□ Landmarks announced by screen reader
□ Buttons have descriptive labels
□ Modal focus trap works
□ PDF export fully keyboard accessible
□ Lighthouse score 95+ for accessibility
□ WAVE shows no errors
□ axe DevTools shows no violations
```

## Browser Compatibility

Test in these browsers (latest versions):

- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ iOS Safari (mobile)
- ✅ Chrome Mobile (Android)

## Screen Readers to Test

- ✅ **NVDA** (Windows) - Free
- ✅ **JAWS** (Windows) - Commercial
- ✅ **VoiceOver** (macOS/iOS) - Built-in
- ✅ **TalkBack** (Android) - Built-in

## Quick Test in 5 Minutes

1. **Keyboard**: Tab through page (2 min)
   - Can reach all elements?
   - Focus visible?
   - Escape closes modals?

2. **Zoom**: Zoom to 200% (1 min)
   - Text readable?
   - No horizontal scroll?
   - All features work?

3. **Automated**: Run Lighthouse (1 min)
   - Score 95+?
   - No errors?

4. **Screen Reader**: Enable and test (1 min)
   - Content announced?
   - Buttons described?
   - Navigation works?

✅ If all pass → Ready to deploy!

## Report Issues

Found an accessibility issue? Check:

1. **Which page?** (URL)
2. **What's wrong?** (Description)
3. **How to reproduce?** (Steps)
4. **Expected behavior?**
5. **Browser/OS?**
6. **Screen reader?** (if applicable)
7. **Screenshot?** (if visual issue)

---

**Questions?** See WCAG-COMPLIANCE.md for full documentation.
