/**
 * Convert Excel file to JSON for question bank
 */
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Path to the Excel file
const excelPath = 'C:\\Users\\CBARRING\\OneDrive - Renaissance Learning\\Documents\\content_data_project\\data\\Adaptive Maths - Item Review Matrix.xlsx';
const outputPath = path.join(__dirname, '../data/question-bank.json');

console.log('🔄 Reading Excel file...');
console.log('📂 Source:', excelPath);

try {
  // Read the Excel file
  const workbook = XLSX.readFile(excelPath);

  console.log('📊 Available sheets:', workbook.SheetNames.join(', '));

  // Read the first sheet (or you can specify which sheet to read)
  const sheetName = workbook.SheetNames[0];
  console.log('📄 Reading sheet:', sheetName);

  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    defval: null,
    raw: false
  });

  console.log('✅ Converted', jsonData.length, 'rows');

  // Show first row to understand structure
  if (jsonData.length > 0) {
    console.log('\n📋 First row sample:');
    console.log(JSON.stringify(jsonData[0], null, 2));

    console.log('\n🔑 Available columns:');
    Object.keys(jsonData[0]).forEach((key, index) => {
      console.log(`  ${index + 1}. ${key}`);
    });
  }

  // Create data directory if it doesn't exist
  const dataDir = path.dirname(outputPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Save as JSON
  fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));
  console.log('\n💾 Saved to:', outputPath);
  console.log('✅ Conversion complete!');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
