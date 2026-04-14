const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_FILE = 'C:\\Users\\CBARRING\\OneDrive - Renaissance Learning\\Documents\\content_data_project\\data\\Adaptive Maths - Item Review Matrix.xlsx';
const OUTPUT_FILE = path.join(__dirname, '../data/question-bank-raw.json');

console.log('📖 Reading Excel file...');
const workbook = XLSX.readFile(EXCEL_FILE);

console.log('📊 Available sheets:', workbook.SheetNames);

// Read the first sheet
const sheetName = workbook.SheetNames[0];
console.log(`📄 Processing sheet: ${sheetName}`);

const worksheet = workbook.Sheets[sheetName];
const jsonData = XLSX.utils.sheet_to_json(worksheet);

console.log(`✅ Converted ${jsonData.length} rows to JSON`);

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Save raw JSON
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(jsonData, null, 2));
console.log(`💾 Saved raw data to: ${OUTPUT_FILE}`);

// Show sample of first row
console.log('\n📋 Sample row (showing column names):');
console.log(JSON.stringify(jsonData[0], null, 2));
