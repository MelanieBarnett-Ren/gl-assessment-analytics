const fs = require('fs');
const path = require('path');

const RAW_FILE = path.join(__dirname, '../data/question-bank-raw.json');
const OUTPUT_FILE = path.join(__dirname, '../data/question-bank-clean.json');

console.log('📖 Reading raw JSON...');
const rawData = JSON.parse(fs.readFileSync(RAW_FILE, 'utf8'));

// Skip header row (first row)
const dataRows = rawData.slice(1);

console.log(`📊 Processing ${dataRows.length} questions...`);

const questions = [];
const strands = new Set();
const yearGroups = new Set();

dataRows.forEach((row, index) => {
  try {
    // Extract year group
    const yearGroup = parseInt(row['__EMPTY']) || null;
    if (!yearGroup) return; // Skip rows without year group

    // Extract question data
    const questionId = row['__EMPTY_2'] || `q${index}`;
    const questionText = row['__EMPTY_6'] || '';
    const correctAnswer = row['__EMPTY_16'] || '';
    const difficultyBand = parseInt(row['__EMPTY_19']) || null;
    const facilityValue = parseFloat(row['__EMPTY_20']) || null;
    const strand = row['__EMPTY_31'] || '';
    const ncReference = row['__EMPTY_32'] || '';

    // Extract options (Option 1 through Option 10)
    const options = [];
    if (row['Options']) options.push(row['Options']);
    for (let i = 7; i <= 15; i++) {
      const optionKey = `__EMPTY_${i}`;
      if (row[optionKey]) {
        options.push(row[optionKey]);
      }
    }

    // Only include questions with meaningful content
    if (questionText && questionText.length > 5) {
      questions.push({
        id: questionId,
        yearGroup,
        questionText: String(questionText).trim(),
        options: options.filter(opt => opt && String(opt).trim().length > 0),
        correctAnswer: String(correctAnswer).trim(),
        difficultyBand,
        strand: String(strand).trim(),
        ncReference: String(ncReference || '').trim(),
        facilityValue
      });

      if (strand) strands.add(String(strand).trim());
      if (yearGroup) yearGroups.add(yearGroup);
    }
  } catch (error) {
    console.error(`⚠️  Error processing row ${index}:`, error.message);
  }
});

// Group questions by strand
const byStrand = {};
const byYear = {};

questions.forEach(q => {
  if (!byStrand[q.strand]) byStrand[q.strand] = [];
  byStrand[q.strand].push(q.id);

  const yearKey = `Year ${q.yearGroup}`;
  if (!byYear[yearKey]) byYear[yearKey] = [];
  byYear[yearKey].push(q.id);
});

const output = {
  metadata: {
    totalQuestions: questions.length,
    strands: Array.from(strands).sort(),
    yearGroups: Array.from(yearGroups).sort().map(y => `Year ${y}`)
  },
  questions,
  index: {
    byStrand,
    byYear
  }
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

console.log(`\n✅ Successfully processed ${questions.length} questions`);
console.log(`📚 Strands: ${Array.from(strands).join(', ')}`);
console.log(`🎓 Year Groups: ${Array.from(yearGroups).sort().join(', ')}`);
console.log(`💾 Saved to: ${OUTPUT_FILE}`);

// Show strand breakdown
console.log('\n📊 Questions by Strand:');
Object.entries(byStrand)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([strand, ids]) => {
    console.log(`   ${strand}: ${ids.length} questions`);
  });
