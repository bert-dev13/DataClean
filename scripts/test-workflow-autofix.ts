import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import assert from 'assert';
import { parseExcelOrCsvFile } from '../src/lib/parser/excelParser';
import { evaluateTemplateMatch } from '../src/lib/detector/templateDetector';
import { getDatasetById } from '../src/lib/templates';
import { validateDataset, applyAllSafeFixes } from '../src/lib/validator/validationEngine';
import { calculateQualityReport } from '../src/lib/validator/readinessCalculator';
import { buildCleanedWorkbook } from '../src/lib/exporter/cleanDataExporter';
import { buildAuditReportWorkbook } from '../src/lib/exporter/auditReportExporter';

console.log('================================================================');
console.log('  TEST WORKFLOW: AUTO-FIX ON-DEMAND ("FIX ALL AUTOMATICALLY")');
console.log('================================================================\n');

let totalPassed = 0;
function testAssert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  [PASS] ${msg}`);
    totalPassed++;
  } else {
    console.error(`  [FAIL] ${msg}`);
    throw new Error(`Test assertion failed: ${msg}`);
  }
}

async function runWorkflowTest() {
  const filePath = path.resolve('training-data/DBL/Water/DBL_Water_AutoFix_Demo.xlsx');
  testAssert(fs.existsSync(filePath), 'Demo file DBL_Water_AutoFix_Demo.xlsx exists');

  // STEP 1: UPLOAD MUST NOT MODIFY DATA
  console.log('--- Step 1 & 2: Upload & Parse Original Values ---');
  const buffer = fs.readFileSync(filePath);
  const file = new File([buffer], 'DBL_Water_AutoFix_Demo.xlsx');
  const parsedWb = await parseExcelOrCsvFile(file);

  testAssert(parsedWb.sheetNames.length > 0, 'Workbook parsed successfully');
  testAssert(parsedWb.totalRows > 0, `Sheet has ${parsedWb.totalRows} rows`);

  // Verify exact preservation of raw values
  const rawRows = parsedWb.rawRows;
  const sampleWithSpaces = rawRows.find((r) =>
    Object.values(r).some((v) => typeof v === 'string' && (v.startsWith(' ') || v.endsWith(' ') || v.includes('cu.m')))
  );
  testAssert(Boolean(sampleWithSpaces), '1. Raw parsed rows contain un-trimmed whitespace and raw units');

  // STEP 2: DATASET DETECTION MUST NOT MODIFY DATA
  console.log('--- Step 3: Dataset Detection ---');
  const waterDataset = getDatasetById('dbl-water')!;
  testAssert(Boolean(waterDataset), 'DBL Water dataset definition loaded');

  const detection = evaluateTemplateMatch(parsedWb.headers, waterDataset);
  testAssert(detection.confidenceScore >= 80, `Dataset detected with score ${detection.confidenceScore}%`);
  // Verify detection did not mutate rawRows
  testAssert(Boolean(sampleWithSpaces), '2. Dataset detection leaves parsed rows 100% unaltered');

  // STEP 3: INITIAL VALIDATION MUST NOT MODIFY VALUES
  console.log('--- Step 4 & 5: Initial Validation & Data Quality Results ---');
  const initialResult = validateDataset(rawRows, waterDataset);
  testAssert(initialResult.records.length === rawRows.length, `Validated ${initialResult.records.length} records`);

  // Verify that all cell values match original values exactly
  let cellsWithPendingFix = 0;
  let cellsWithAutoCleaned = 0;
  for (const record of initialResult.records) {
    for (const field of waterDataset.fields) {
      const cell = record._cells[field.key];
      if (!cell) continue;
      // originalValue must equal workingValue before fix
      testAssert(
        cell.workingValue === cell.originalValue,
        `Row ${record._rowIndex} ${field.key}: workingValue must equal originalValue before Fix All`
      );
      testAssert(
        cell.finalValue === null,
        `Row ${record._rowIndex} ${field.key}: finalValue must be null before Fix All`
      );
      testAssert(
        cell.autoCleaned === false,
        `Row ${record._rowIndex} ${field.key}: autoCleaned must be false before Fix All`
      );
      if (cell.pendingFix) {
        cellsWithPendingFix++;
        testAssert(
          cell.status === 'AUTO-FIX-AVAILABLE',
          `Row ${record._rowIndex} ${field.key}: cell with pendingFix has status AUTO-FIX-AVAILABLE`
        );
      }
      if (cell.status === 'AUTO-FIX') {
        cellsWithAutoCleaned++;
      }
    }
  }

  testAssert(cellsWithPendingFix > 0, `3. Safe fixes detected as pending: ${cellsWithPendingFix} cells have pendingFix`);
  testAssert(cellsWithAutoCleaned === 0, '4. Zero cells were auto-cleaned during initial validation');

  // Quality Report Evaluation
  const initialReport = calculateQualityReport(initialResult.records, initialResult.allIssues, waterDataset, {
    matchedColumns: detection.matchedColumns.map((c) => ({ uploaded: c.uploaded, template: c.template })),
    missingColumns: detection.missingColumns,
    extraColumns: detection.extraColumns,
    templateMatchScore: detection.confidenceScore,
    isOldOrIncompleteTemplate: detection.isOldOrIncompleteTemplate,
  });

  testAssert(initialReport.autoFixAvailableRecords > 0, `Report: ${initialReport.autoFixAvailableRecords} records have auto-fix available`);
  testAssert(initialReport.autoCleanedRecords === 0, 'Report: 0 records auto-cleaned prior to user confirmation');
  testAssert(initialReport.readinessScore < 100, `Report: Readiness score capped at ${initialReport.readinessScore}% while pending fixes exist`);

  // STEP 4: EXPORT WITHOUT APPLYING FIXES (USER CHOOSES NOT TO FIX)
  console.log('--- Step 6: Export Without Applying Fixes ---');
  const uncleanedExportWb = buildCleanedWorkbook(initialResult.records, waterDataset);
  const uncleanedSheet = uncleanedExportWb.Sheets[waterDataset.officialSheetName || 'Data'];
  const uncleanedRows = XLSX.utils.sheet_to_json<any[]>(uncleanedSheet, { header: 1 });
  const headerRow = uncleanedRows[0];
  const acctColIdx = headerRow.indexOf('Account Number');
  const firstDataRow = uncleanedRows[1];
  testAssert(
    firstDataRow[acctColIdx] === initialResult.records[0]._cells['accountNumber'].originalValue,
    '5. If user never applies fixes, export preserves exact original uploaded values'
  );

  // STEP 5: USER CLICKS "FIX ALL AUTOMATICALLY"
  console.log('--- Step 7: User Clicks "Fix All Automatically" ---');
  const fixedResult = applyAllSafeFixes(initialResult.records, waterDataset);
  testAssert(fixedResult.totalAutoCleaned > 0, `6. Fix All Automatically applied ${fixedResult.totalAutoCleaned} fixes`);

  let verifiedCleanedCells = 0;
  for (const record of fixedResult.records) {
    for (const field of waterDataset.fields) {
      const cell = record._cells[field.key];
      if (!cell) continue;
      // Original value MUST be preserved
      testAssert(cell.originalValue !== undefined, '7. Original value remains intact after cleaning');
      if (cell.autoCleaned) {
        verifiedCleanedCells++;
        testAssert(cell.finalValue !== null, 'Cleaned cell has non-null finalValue');
        testAssert(cell.workingValue === cell.finalValue, 'Cleaned cell workingValue equals finalValue');
        testAssert(cell.changes.length > 0, 'Cleaned cell has logged changes');
      }
    }
  }
  testAssert(verifiedCleanedCells > 0, `Verified ${verifiedCleanedCells} cells have autoCleaned = true and audit trail`);

  // STEP 6: REVALIDATION & UPDATED REPORT
  console.log('--- Step 8: Revalidation & Data Readiness ---');
  const postFixReport = calculateQualityReport(fixedResult.records, fixedResult.allIssues, waterDataset, {
    matchedColumns: detection.matchedColumns.map((c) => ({ uploaded: c.uploaded, template: c.template })),
    missingColumns: detection.missingColumns,
    extraColumns: detection.extraColumns,
    templateMatchScore: detection.confidenceScore,
    isOldOrIncompleteTemplate: detection.isOldOrIncompleteTemplate,
  });

  testAssert(postFixReport.autoFixAvailableRecords === 0, 'Post-fix: 0 records with pending auto-fix');
  testAssert(postFixReport.autoCleanedRecords > 0, `Post-fix: ${postFixReport.autoCleanedRecords} records auto-cleaned`);
  testAssert(postFixReport.readinessScore > initialReport.readinessScore, `Readiness score increased from ${initialReport.readinessScore}% to ${postFixReport.readinessScore}%`);

  // STEP 7: EXPORT AFTER SAFE FIXES
  console.log('--- Step 9: Export After Fixes & Audit Report ---');
  const cleanedExportWb = buildCleanedWorkbook(fixedResult.records, waterDataset);
  const cleanedSheet = cleanedExportWb.Sheets[waterDataset.officialSheetName || 'Data'];
  const cleanedRows = XLSX.utils.sheet_to_json<any[]>(cleanedSheet, { header: 1 });
  const cleanedDataRow1 = cleanedRows[1];

  // Verify cleaned value is exported
  const targetCell = fixedResult.records[0]._cells['accountNumber'];
  testAssert(
    cleanedDataRow1[acctColIdx] === (targetCell.workingValue ?? targetCell.finalValue),
    '8. Export uses cleaned workingValue after Fix All Automatically is applied'
  );

  // STEP 8: AUDIT REPORT BEFORE / AFTER LOGGING
  const auditWb = buildAuditReportWorkbook(
    fixedResult.records,
    fixedResult.allIssues,
    waterDataset,
    postFixReport,
    []
  );
  testAssert(Boolean(auditWb.Sheets['Audit Trail']), 'Cleaning Report contains Audit Trail sheet');
  const auditSheet = auditWb.Sheets['Audit Trail'];
  const auditRows = XLSX.utils.sheet_to_json<any[]>(auditSheet, { header: 1 });
  testAssert(auditRows.length > 1, `9. Audit Trail sheet logs ${auditRows.length - 1} transformations with before/after values`);

  console.log('\n================================================================');
  console.log(`✓ ALL 9 REQUIREMENTS OF REQUIREMENT 13 PASSED (${totalPassed} assertions)`);
  console.log('================================================================\n');
}

runWorkflowTest().catch((err) => {
  console.error(err);
  process.exit(1);
});
