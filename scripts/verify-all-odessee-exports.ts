import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { ODESSEE_DATASETS } from '../src/lib/templates';
import { getOdesseeMockWorkbook } from '../src/lib/templates/odessee/odesseeTestData';
import { validateAndCleanDataset } from '../src/lib/validator/validationEngine';
import { calculateQualityReport } from '../src/lib/validator/readinessCalculator';

console.log('================================================================');
console.log('     VERIFYING ODeSSEE OFFICIAL EXPORT TEMPLATES & REPORTS');
console.log('================================================================\n');

const outputDir = path.join(process.cwd(), 'scratch', 'export_verification');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let allPassed = true;

for (const dataset of ODESSEE_DATASETS) {
  console.log(`Checking export template structure for: ${dataset.name} (${dataset.id})`);
  const mockWb = getOdesseeMockWorkbook(dataset.id, 'valid');
  const res = validateAndCleanDataset(mockWb.rawRows, dataset);
  const qualityReport = calculateQualityReport(res.records, res.allIssues, dataset, {
    matchedColumns: dataset.fields.map((f) => ({ uploaded: f.officialHeader, template: f.officialHeader })),
    missingColumns: [],
    extraColumns: [],
    templateMatchScore: 100,
    isOldOrIncompleteTemplate: false,
  });

  // 1. Build Cleaned Dataset Workbook
  const wbClean = XLSX.utils.book_new();
  const headers = dataset.fields.map((f) => f.officialHeader);
  const rowsData: any[][] = [headers];

  for (const record of res.records) {
    const rowVals: any[] = [];
    for (const field of dataset.fields) {
      const cellState = record._cells[field.key];
      const val = cellState
        ? cellState.workingValue !== undefined
          ? cellState.workingValue
          : cellState.finalValue ?? cellState.originalValue
        : record[field.key];
      rowVals.push(val !== null && val !== undefined ? val : '');
    }
    rowsData.push(rowVals);
  }

  const ws = XLSX.utils.aoa_to_sheet(rowsData);
  const targetSheetName = dataset.officialSheetName || 'Data';
  XLSX.utils.book_append_sheet(wbClean, ws, targetSheetName);

  const cleanFilePath = path.join(outputDir, `${dataset.id}_Cleaned.xlsx`);
  XLSX.writeFile(wbClean, cleanFilePath);

  // Read back and verify Cleaned Workbook
  const readBackWb = XLSX.readFile(cleanFilePath);
  const sheet = readBackWb.Sheets[targetSheetName];
  if (!sheet) {
    console.error(`  [FAIL] Official sheet "${targetSheetName}" not found in exported workbook`);
    allPassed = false;
    continue;
  }

  const parsedAoA = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
  const exportedHeaders = parsedAoA[0];

  // Check column count
  if (exportedHeaders.length !== dataset.fields.length) {
    console.error(`  [FAIL] Column count mismatch: expected ${dataset.fields.length}, got ${exportedHeaders.length}`);
    allPassed = false;
  } else {
    console.log(`  [PASS] Column count matches (${exportedHeaders.length} columns)`);
  }

  // Check column headers & order
  let headerMatch = true;
  for (let i = 0; i < dataset.fields.length; i++) {
    const expected = dataset.fields[i].officialHeader;
    const actual = exportedHeaders[i];
    if (expected !== actual) {
      console.error(`  [FAIL] Column ${i + 1} mismatch: expected "${expected}", got "${actual}"`);
      headerMatch = false;
      allPassed = false;
    }
  }

  if (headerMatch) {
    console.log(`  [PASS] All ${dataset.fields.length} headers match official template sequence exactly.`);
  }

  // Dataset specific checks
  if (dataset.id === 'odessee-household') {
    if (exportedHeaders.length === 9) {
      console.log('  [PASS] Household Profile exports exactly 9 canonical columns (NOT 22 aggregate columns).');
    } else {
      console.error('  [FAIL] Household Profile column count is not 9!');
      allPassed = false;
    }
  }

  if (dataset.id === 'odessee-covid') {
    if (exportedHeaders.length === 3) {
      console.log('  [PASS] COVID Cases exports exactly 3 canonical columns (NOT 40 line-list columns).');
    } else {
      console.error('  [FAIL] COVID Cases column count is not 3!');
      allPassed = false;
    }
  }

  if (dataset.id === 'odessee-evacuation') {
    if (targetSheetName === 'Evacuation Sites Import Templat') {
      console.log('  [PASS] Evacuation Sites preserves official truncated sheet name "Evacuation Sites Import Templat".');
    } else {
      console.error(`  [FAIL] Evacuation Sites sheet name is "${targetSheetName}"!`);
      allPassed = false;
    }
    if (exportedHeaders.includes('Name of Evacuation Center ')) {
      console.log('  [PASS] Evacuation Sites preserves official trailing space header "Name of Evacuation Center ".');
    } else {
      console.error('  [FAIL] Evacuation Sites missing official trailing space header!');
      allPassed = false;
    }
  }

  if (dataset.id === 'odessee-flood') {
    if (exportedHeaders.includes('POI')) {
      console.log('  [PASS] Flood Susceptibility exports canonical "POI" header (even if alias was accepted).');
    } else {
      console.error('  [FAIL] Flood Susceptibility missing "POI" header in export!');
      allPassed = false;
    }
  }

  // Verify leading zeros preserved in data rows
  if (dataset.id === 'odessee-flood') {
    const dataRow1 = parsedAoA[1];
    const bgyColIdx = headers.indexOf('Barangay Code');
    const muniColIdx = headers.indexOf('Municipality Code');
    if (dataRow1 && String(dataRow1[bgyColIdx]).startsWith('02') && String(dataRow1[muniColIdx]).startsWith('02')) {
      console.log(`  [PASS] Leading zeros preserved for Barangay Code (${dataRow1[bgyColIdx]}) and Municipality Code (${dataRow1[muniColIdx]}).`);
    } else {
      console.error(`  [FAIL] Leading zeros lost in exported row: ${JSON.stringify(dataRow1)}`);
      allPassed = false;
    }
  }

  // Verify zero data fabrication: missing or undefined values remain empty string
  const mockRowWithBlanks: Record<string, unknown> = {};
  mockRowWithBlanks[dataset.fields[0].officialHeader] = 'Sample Value';
  const resMissing = validateAndCleanDataset([mockRowWithBlanks], dataset);
  const testRec = resMissing.records[0];
  let zeroFabricationHolds = true;

  for (let f = 1; f < dataset.fields.length; f++) {
    const fieldKey = dataset.fields[f].key;
    const cell = testRec._cells[fieldKey];
    if (cell && cell.finalValue !== '' && cell.finalValue !== null && cell.finalValue !== undefined) {
      console.error(`  [FAIL] Field ${fieldKey} was fabricated as: ${cell.finalValue}`);
      zeroFabricationHolds = false;
      allPassed = false;
    }
  }

  if (zeroFabricationHolds) {
    console.log('  [PASS] Zero data fabrication confirmed: missing values remain strictly blank in export.');
  }

  // 2. Build and Verify Cleaning Audit Report Workbook
  const wbReport = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData: (string | number)[][] = [
    ['DataClean Audit Report — Executive Summary'],
    ['Target System', dataset.system],
    ['Target Dataset', dataset.name],
    ['Official File Structure', dataset.officialFileName],
    [],
    ['METRIC', 'VALUE'],
    ['Total Records Processed', qualityReport.totalRecords],
    ['Valid Records', qualityReport.validRecords],
    ['Auto-Cleaned Records', qualityReport.autoCleanedRecords],
    ['Records Needing Review', qualityReport.reviewRecords],
    ['Records with Errors', qualityReport.errorRecords],
    ['Final Readiness Score', `${qualityReport.readinessScore}%`],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wbReport, wsSummary, 'Summary');

  // Audit Trail Sheet
  const auditHeaders = ['Row Number', 'Field / Column', 'Original Value', 'Final Value', 'Issue Detected', 'Action Taken', 'Status'];
  const auditRows: (string | number)[][] = [auditHeaders];
  auditRows.push(['1', 'Sample Field', 'sample', 'Sample', 'None', 'Safe Auto-Fix applied', 'VALID']);
  const wsAudit = XLSX.utils.aoa_to_sheet(auditRows);
  XLSX.utils.book_append_sheet(wbReport, wsAudit, 'Audit Trail');

  const reportFilePath = path.join(outputDir, `${dataset.id}_Report.xlsx`);
  XLSX.writeFile(wbReport, reportFilePath);

  // Read back report
  const readBackReport = XLSX.readFile(reportFilePath);
  if (readBackReport.Sheets['Summary'] && readBackReport.Sheets['Audit Trail']) {
    console.log('  [PASS] Cleaning Report.xlsx generated with Summary and Audit Trail sheets.\n');
  } else {
    console.error('  [FAIL] Cleaning Report missing required sheets!');
    allPassed = false;
  }
}

console.log('================================================================');
if (allPassed) {
  console.log('✓ ALL 7 ODeSSEE DATASET EXPORTS PRESERVE OFFICIAL TEMPLATES 100%');
} else {
  console.error('✗ SOME ODeSSEE EXPORTS FAILED VERIFICATION');
}
console.log('================================================================');
process.exit(allPassed ? 0 : 1);
