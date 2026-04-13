# UK National Curriculum Integration

## Overview

This document outlines how to integrate the [UK National Curriculum for Mathematics](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study) into the Comparative Cohort Intelligence system for:

1. **Skill mapping** - Map assessment items to specific curriculum objectives
2. **Prerequisite identification** - Understand progression and dependencies
3. **Age-appropriate recommendations** - Generate insights aligned with key stage expectations
4. **Misconception detection** - Identify common conceptual gaps at each stage

---

## Key Stage Structure

### Key Stage 1 (Ages 5-7, Years 1-2)
**Focus**: Number sense, basic arithmetic, practical measurement

**Core domains**:
- Number and place value
- Addition and subtraction
- Multiplication and division
- Fractions
- Measurement
- Geometry (position, direction, properties of shapes)

### Key Stage 2 (Ages 7-11, Years 3-6)
**Focus**: Fluency in fundamentals, problem-solving, mathematical reasoning

**Core domains**:
- Number and place value (up to 10,000,000 by Year 6)
- Addition, subtraction, multiplication, division
- Fractions (including decimals and percentages)
- Ratio and proportion
- Algebra (Year 6)
- Measurement
- Geometry (properties of shapes, position and direction)
- Statistics

---

## Skill Mapping Schema

Each assessment item should be tagged with curriculum references:

```typescript
interface CurriculumMapping {
  itemId: string;
  
  // Curriculum reference
  keyStage: 'KS1' | 'KS2' | 'KS3';
  yearGroup: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  
  // Programme of study reference
  domain: string;              // e.g., "Number - fractions"
  objective: string;           // Specific objective from curriculum
  objectiveCode?: string;      // Optional: internal code (e.g., "Y5-F3")
  
  // Progression
  prerequisiteObjectives?: string[];  // What must be mastered first
  nextSteps?: string[];               // What comes after
  
  // Expected attainment
  expectedMastery: {
    byYearGroup: number;       // Year group when mastery expected
    passRate: number;          // Expected % of students achieving
  };
}
```

### Example Mapping

```typescript
const fractionConversionItem: CurriculumMapping = {
  itemId: "Q_MAT_Y5_F03",
  keyStage: "KS2",
  yearGroup: 5,
  domain: "Number - fractions (including decimals and percentages)",
  objective: "Read and write decimal numbers as fractions [for example, 0.71 = 71/100]",
  objectiveCode: "Y5-F3",
  prerequisiteObjectives: [
    "Y4-F1: Recognise and show, using diagrams, families of common equivalent fractions",
    "Y4-F2: Count up and down in hundredths"
  ],
  nextSteps: [
    "Y6-F1: Use common factors to simplify fractions",
    "Y6-F4: Associate a fraction with division"
  ],
  expectedMastery: {
    byYearGroup: 5,
    passRate: 75  // 75% of Y5 students expected to master
  }
};
```

---

## Key Stage 2 Domains (Most Relevant for MTCKS2)

### 1. Number - Place Value

**Year 3**:
- Count from 0 in multiples of 4, 8, 50, 100
- Find 10 or 100 more/less than a given number
- Recognise place value of each digit in 3-digit numbers

**Year 4**:
- Count in multiples of 6, 7, 9, 25, 1000
- Find 1000 more/less than given number
- Order and compare numbers beyond 1000

**Year 5**:
- Read, write, order, compare numbers to at least 1,000,000
- Count forwards/backwards in steps of powers of 10
- Interpret negative numbers in context

**Year 6**:
- Read, write, order, compare numbers up to 10,000,000
- Round any whole number to required degree of accuracy
- Use negative numbers in context

### 2. Number - Multiplication & Division (Core for MTC)

**Year 3**:
- Recall and use multiplication/division facts for 3, 4, 8 tables
- Write and calculate mathematical statements using × and ÷

**Year 4**:
- Recall multiplication/division facts up to 12 × 12
- Use place value and known facts to multiply/divide mentally
- Multiply 2-digit and 3-digit by 1-digit

**Year 5**:
- Multiply numbers up to 4 digits by 1- or 2-digit using formal written method
- Multiply/divide whole numbers and decimals by 10, 100, 1000
- Square and cube numbers

**Year 6**:
- Multiply multi-digit numbers up to 4 digits by 2-digit
- Perform mental calculations with mixed operations
- Use estimation to check answers

### 3. Number - Fractions, Decimals, Percentages

**Year 3**:
- Count up/down in tenths
- Recognise, find, write fractions of set of objects (unit fractions)
- Add/subtract fractions with same denominator (within one whole)

**Year 4**:
- Recognise and write decimal equivalents of tenths, quarters, halves
- Find effect of dividing 1- or 2-digit by 10, 100 (answer to 1 decimal place)
- Round decimals with 1 decimal place to nearest whole number

**Year 5**:
- Read and write decimal numbers as fractions
- Recognise and convert between mixed numbers and improper fractions
- Add/subtract fractions with same denominator and denominators that are multiples
- Multiply proper fractions and mixed numbers by whole numbers

**Year 6**:
- Use common factors to simplify fractions
- Compare and order fractions including >1
- Add/subtract fractions with different denominators and mixed numbers
- Multiply simple pairs of proper fractions
- Divide proper fractions by whole numbers
- Recall and use equivalences between simple fractions, decimals, percentages

### 4. Ratio & Proportion (Year 6)

- Solve problems involving relative sizes of two quantities
- Solve problems involving similar shapes
- Solve problems involving unequal sharing and grouping

### 5. Algebra (Year 6)

- Use simple formulae
- Generate and describe linear number sequences
- Express missing number problems algebraically
- Find pairs of numbers satisfying equation with two unknowns

---

## Prerequisite Chains

Understanding prerequisite chains helps identify foundation gaps:

### Example: Fractions Chain (KS2)

```
Y3: Unit fractions (1/2, 1/4, 1/3)
  ↓
Y3: Add/subtract same denominator
  ↓
Y4: Equivalent fractions (1/2 = 2/4)
  ↓
Y4: Decimals as fractions (0.5 = 1/2)
  ↓
Y5: Improper fractions ↔ mixed numbers
  ↓
Y5: Add/subtract different denominators
  ↓
Y5: Multiply fractions by whole numbers
  ↓
Y6: Simplify using common factors
  ↓
Y6: Multiply fraction pairs
  ↓
Y6: Divide fractions by whole numbers
  ↓
Y6: Fraction/decimal/percentage equivalence
```

### Example: Multiplication Chain

```
Y2: 2, 5, 10 times tables
  ↓
Y3: 3, 4, 8 times tables
  ↓
Y4: Up to 12×12 (full recall)
  ↓
Y4: Multiply 2-digit × 1-digit mentally
  ↓
Y5: Formal written method (4-digit × 2-digit)
  ↓
Y5: Multiply by 10, 100, 1000
  ↓
Y6: Multi-digit × 2-digit fluency
  ↓
Y6: Mental calculations with mixed operations
```

---

## AI Insight Enhancement

### Curriculum-Aware Prompting

Add this to the Claude API prompt context:

```typescript
const curriculumContext = `
# UK NATIONAL CURRICULUM CONTEXT

This assessment aligns with the UK National Curriculum for Mathematics (Key Stage 2).

Expected progression for fractions domain:
- Year 4: Students should recognize equivalent fractions (e.g., 1/2 = 2/4)
- Year 5: Students should add/subtract fractions with different denominators
- Year 6: Students should master simplification and fraction operations

When analyzing gaps, consider:
1. Is this skill age-appropriate for the cohort?
2. Are prerequisite skills from earlier years missing?
3. Are students on track for end-of-key-stage expectations?
`;
```

### Curriculum-Specific Recommendations

Examples of enhanced recommendations:

**Generic recommendation**:
> "Focus on fractions - students scoring 47%"

**Curriculum-aware recommendation**:
> "Year 5 Fractions: 47% (below Y5 expected 75%)
> 
> **Foundation Gap**: Year 4 equivalent fractions prerequisite scored 62% (expected 80%)
> 
> **Root Cause**: Students haven't mastered Y4 objective 'Recognise families of equivalent fractions'
> 
> **Action**: Re-teach Y4 equivalent fractions using visual models before advancing to Y5 objectives
> 
> **Target**: 80% on equivalent fractions, then 70% on Y5 fraction operations by next assessment"

---

## Misconception Library (KS2 Common Issues)

Based on curriculum progressions, common misconceptions:

### Fractions
1. **"Larger denominator = larger fraction"**
   - Curriculum stage: Y3-Y4
   - Intervention: Visual models (fraction walls, bar models)

2. **"Add numerators AND denominators"**
   - Curriculum stage: Y5
   - Prerequisite missing: Y4 equivalent fractions
   - Intervention: Focus on "same whole" concept

3. **"Decimal 0.45 = 45/10"** (not 45/100)
   - Curriculum stage: Y5
   - Prerequisite missing: Y4 place value (hundredths)
   - Intervention: Place value charts with decimal extension

### Multiplication
1. **"Multiplying makes bigger"** (not true for fractions/decimals)
   - Curriculum stage: Y5-Y6
   - Intervention: Use contexts (half of, quarter of)

2. **"Times tables but can't apply to word problems"**
   - Curriculum stage: Y4 onwards
   - Root cause: Lack of understanding of multiplication as scaling/grouping
   - Intervention: Bar models, varied problem types

3. **"Struggle with 7, 8, 9 tables"**
   - Curriculum stage: Y4 (expected full recall 12×12)
   - Intervention: Pattern recognition, distributed practice

### Place Value
1. **"Reading large numbers incorrectly"** (e.g., 1,304 as "one hundred and thirty-four")
   - Curriculum stage: Y3-Y4
   - Intervention: Place value charts, expanded notation

2. **"× 10 just adds a zero"** (fails with decimals)
   - Curriculum stage: Y5
   - Intervention: Focus on digits moving left/right, not "adding zeros"

---

## Implementation in AI Service

Add curriculum mapping to `AIService.generateInsights()`:

```typescript
// In ai-service.ts

import { loadCurriculumMappings } from './curriculum-mappings';

async generateInsights(context: PromptContext): Promise<...> {
  // Load curriculum data for this assessment
  const curriculumData = await loadCurriculumMappings(
    context.targetCohort.assessment.assessmentId
  );
  
  // Enrich context with curriculum expectations
  const enrichedContext = {
    ...context,
    curriculumExpectations: curriculumData,
    prerequisiteChains: buildPrerequisiteChains(curriculumData),
  };
  
  // Add to prompt
  const promptWithCurriculum = `
${userPrompt}

# CURRICULUM CONTEXT
${formatCurriculumContext(enrichedContext)}
  `;
  
  // Continue with API call...
}
```

---

## Data Sources

1. **Primary**: [Gov.uk National Curriculum - Mathematics programmes of study](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study)

2. **Supplementary**: 
   - NCETM (National Centre for Excellence in Teaching Mathematics) progression maps
   - White Rose Maths schemes of learning
   - Assessment framework documents (KS2 SATs)

---

## Next Steps

1. **Create curriculum mapping database**
   - JSON/database of all curriculum objectives by year
   - Prerequisite relationships
   - Expected mastery rates

2. **Integrate with assessment item metadata**
   - Tag each item with curriculum objective(s)
   - Store prerequisite chains

3. **Enhance AI prompts**
   - Include curriculum context in prompts
   - Ask Claude to identify prerequisite gaps
   - Request age-appropriate recommendations

4. **Build misconception library**
   - Common errors at each curriculum stage
   - Evidence-based interventions from research

5. **Add progression tracking**
   - Compare student performance to curriculum expectations
   - Flag students behind age-related expectations
   - Identify cohorts not on track for end-of-KS2 standards
