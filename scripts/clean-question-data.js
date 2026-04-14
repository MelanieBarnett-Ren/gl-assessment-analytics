/**
 * Clean and structure the question bank data
 */
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../data/question-bank.json');
const outputPath = path.join(__dirname, '../data/question-bank-clean.json');

console.log('📂 Reading raw question data...');
const rawData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

// Skip first row (headers)
const questionRows = rawData.slice(1);

console.log(`📊 Processing ${questionRows.length} questions...`);

const cleanedQuestions = questionRows
  .filter(row => row.__EMPTY && row.__EMPTY !== 'Year Group') // Filter out any remaining header rows
  .map((row, index) => {
    // Extract year group
    const yearGroup = row.__EMPTY ? parseInt(row.__EMPTY) : null;
    const testLevel = row.__EMPTY_1;

    // Build question object
    return {
      id: row['Item ID'] || row.__EMPTY_2 || `q_${index}`,
      exportId: row.__EMPTY_2,
      yearGroup: yearGroup,
      testLevel: testLevel,
      intendedLevel: row['PB Intended Level'],
      minimumAge: row.__EMPTY_29 ? parseInt(row.__EMPTY_29) : null,

      // Question content
      questionText: row.__EMPTY_6,
      options: [
        row.Options,
        row.__EMPTY_7,
        row.__EMPTY_8,
        row.__EMPTY_9,
        row.__EMPTY_10,
        row.__EMPTY_11,
        row.__EMPTY_12,
        row.__EMPTY_13,
        row.__EMPTY_14,
        row.__EMPTY_15
      ].filter(opt => opt && opt.trim()),
      correctAnswer: row.__EMPTY_16,
      markingGuide: row.__EMPTY_17,

      // Difficulty and performance
      difficultyBand: row.__EMPTY_19 ? parseInt(row.__EMPTY_19) : null,
      facilityValue: row.__EMPTY_20 ? parseFloat(row.__EMPTY_20) : null,
      discrimination: row.__EMPTY_21 ? parseFloat(row.__EMPTY_21) : null,

      // Curriculum mapping
      strandCode: row.__EMPTY_30,
      strand: row.__EMPTY_31,
      ncReference: row.__EMPTY_32,
      problemSolving: row.__EMPTY_33 === 'Y',

      // Question metadata
      questionType: row.__EMPTY_35,
      isAnchor: row.__EMPTY_34 === 'Y',

      // Quality scores
      languageScore: row['Language Matrix Score'],
      functionalityScore: row['Functionality Matrix Score'],
      overallScore: row['Overall Matrix Score'],

      // Notes
      languageNotes: row['Language Notes'],
      functionalityNotes: row['Functionality Notes'],
      additionalNotes: row['Additional notes'],
      decision: row['Decision']
    };
  })
  .filter(q => q.questionText && q.questionText.trim()); // Only keep questions with actual text

console.log(`✅ Cleaned ${cleanedQuestions.length} valid questions`);

// Group by strand for quick reference
const byStrand = {};
cleanedQuestions.forEach(q => {
  if (q.strand) {
    if (!byStrand[q.strand]) {
      byStrand[q.strand] = [];
    }
    byStrand[q.strand].push(q.id);
  }
});

console.log('\n📚 Questions by Strand:');
Object.entries(byStrand).forEach(([strand, ids]) => {
  console.log(`  ${strand}: ${ids.length} questions`);
});

// Group by year group
const byYear = {};
cleanedQuestions.forEach(q => {
  if (q.yearGroup) {
    const year = `Year ${q.yearGroup}`;
    if (!byYear[year]) {
      byYear[year] = [];
    }
    byYear[year].push(q.id);
  }
});

console.log('\n🎓 Questions by Year:');
Object.entries(byYear).forEach(([year, ids]) => {
  console.log(`  ${year}: ${ids.length} questions`);
});

// Save cleaned data
const output = {
  metadata: {
    totalQuestions: cleanedQuestions.length,
    strands: Object.keys(byStrand),
    yearGroups: Object.keys(byYear),
    lastUpdated: new Date().toISOString()
  },
  questions: cleanedQuestions,
  index: {
    byStrand,
    byYear
  }
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log('\n💾 Saved cleaned data to:', outputPath);

// Show sample question
if (cleanedQuestions.length > 0) {
  console.log('\n📝 Sample question:');
  console.log(JSON.stringify(cleanedQuestions[10], null, 2));
}
