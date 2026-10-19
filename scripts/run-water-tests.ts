import { waterDefinition } from '../src/lib/templates/dbl/water';
import { ALL_DATASETS } from '../src/lib/templates';
import {
  WATER_SAMPLE_WITH_ISSUES,
  WATER_SAMPLE_VALID,
  WATER_SAMPLE_OLD_TEMPLATE,
  UNRELATED_SAMPLE,
} from '../src/lib/templates/dbl/waterTestData';
import { detectDataset, evaluateTemplateMatch } from '../src/lib/detector/templateDetector';
import { validateAndCleanDataset } from '../src/lib/validator/validationEngine';
import { calculateQualityReport } from '../src/lib/validator/readinessCalculator';

console.log('================================================================');
console.log('       DATACLEAN: DBL WATER COMPREHENSIVE TEST SUITE');
console.log('================================================================\n');

let allPassed = true;
function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  [PASS] ${msg}`);
  } else {
    console.error(`  [FAIL] ${msg}`);
    allPassed = false;
  }
}

// -------------------------------------------------------------
// TEST 1: 100% Clean Valid Dataset
// -------------------------------------------------------------
console.log('--- TEST 1: Valid Dataset ---');
const validDetection = evaluateTemplateMatch(
  ['Account Number', 'Type', 'Consumption', 'Street', 'Purok', 'Barangay', 'Billing Date'],
  waterDefinition
);
const validRes = validateAndCleanDataset(WATER_SAMPLE_VALID, waterDefinition);
const validReport = calculateQualityReport(validRes.records, validRes.allIssues, waterDefinition, {
  matchedColumns: validDetection.matchedColumns.map((c) => ({ uploaded: c.uploaded, template: c.template })),
  missingColumns: validDetection.missingColumns,
  extraColumns: validDetection.extraColumns,
  templateMatchScore: validDetection.confidenceScore,
  isOldOrIncompleteTemplate: validDetection.isOldOrIncompleteTemplate,
});

assert(validDetection.confidenceScore === 100, 'Template match score is 100%');
assert(validRes.totalErrors === 0, 'Zero blocking errors');
assert(validRes.totalReviews === 0, 'Zero review items');
assert(validReport.readinessScore === 100, 'Readiness score is 100%');
assert(validReport.validRecords === 4, 'All 4 records valid');

// -------------------------------------------------------------
// TEST 2: Template Detection & Rejection of Unrelated File
// -------------------------------------------------------------
console.log('\n--- TEST 2: Unrelated Excel File Detection ---');
const unrelatedHeaders = Object.keys(UNRELATED_SAMPLE[0]);
const detectedUnrelated = detectDataset(unrelatedHeaders);
assert(
  detectedUnrelated.bestMatch === null || detectedUnrelated.bestMatch.confidenceScore < 30,
  'Unrelated file rejected / match confidence < 30%'
);

// -------------------------------------------------------------
// TEST 3: Old/Incomplete Template Detection & Conversion
// -------------------------------------------------------------
console.log('\n--- TEST 3: Old/Incomplete Template Support (Missing Street & Purok) ---');
const oldHeaders = Object.keys(WATER_SAMPLE_OLD_TEMPLATE[0]);
const oldDetection = evaluateTemplateMatch(oldHeaders, waterDefinition);

assert(oldDetection.isOldOrIncompleteTemplate === true, 'Detected as old/incomplete template');
assert(oldDetection.missingColumns.includes('Street'), 'Identifies missing Street column');
assert(oldDetection.missingColumns.includes('Purok'), 'Identifies missing Purok column');
assert(oldDetection.canConvertToCurrent === true, 'Can convert to current template');

// Perform conversion (add missing columns as blank)
const convertedRows = WATER_SAMPLE_OLD_TEMPLATE.map((row) => ({
  'Account Number': row['Account Number'],
  'Type': row['Type'],
  'Consumption': row['Consumption'],
  'Street': '', // preserved blank, NOT fabricated!
  'Purok': '', // preserved blank, NOT fabricated!
  'Barangay': row['Barangay'],
  'Billing Date': row['Billing Date'],
}));

const convertedRes = validateAndCleanDataset(convertedRows, waterDefinition);
assert(convertedRes.records.length === 3, 'Converted 3 records');
assert(
  convertedRes.records[0]['Street'] === '' && convertedRes.records[0]['Purok'] === '',
  'Zero Data Fabrication: newly added Street & Purok columns are empty strings'
);
assert(convertedRes.totalErrors === 0, 'Missing optional Street/Purok does not produce blocking errors');

// -------------------------------------------------------------
// TEST 4: Realistic Dataset with Issues
// -------------------------------------------------------------
console.log('\n--- TEST 4: Realistic Dataset with Issues ---');
const issuesDetection = evaluateTemplateMatch(
  ['Account Number', 'Type', 'Consumption', 'Street', 'Purok', 'Barangay', 'Billing Date'],
  waterDefinition
);
const issuesRes = validateAndCleanDataset(WATER_SAMPLE_WITH_ISSUES, waterDefinition);
const issuesReport = calculateQualityReport(issuesRes.records, issuesRes.allIssues, waterDefinition, {
  matchedColumns: issuesDetection.matchedColumns.map((c) => ({ uploaded: c.uploaded, template: c.template })),
  missingColumns: issuesDetection.missingColumns,
  extraColumns: issuesDetection.extraColumns,
  templateMatchScore: issuesDetection.confidenceScore,
  isOldOrIncompleteTemplate: issuesDetection.isOldOrIncompleteTemplate,
});

console.log(`Total Records: ${issuesReport.totalRecords}`);
console.log(`Valid: ${issuesReport.validRecords}`);
console.log(`Auto-Cleaned: ${issuesReport.autoCleanedRecords}`);
console.log(`Needs Review: ${issuesReport.reviewRecords}`);
console.log(`Errors: ${issuesReport.errorRecords}`);
console.log(`Readiness Score: ${issuesReport.readinessScore}%`);

// 4a. Whitespace trimming & normalization (Row 2 in array = row 3 in Excel)
const rowWhitespace = issuesRes.records[1];
assert(rowWhitespace['Account Number'] === 'TEST-LUC-WTR-0000002', 'Trimmed Account Number whitespace');
assert(rowWhitespace['Type'] === 'Commercial A', 'Trimmed Type whitespace');
assert(rowWhitespace['Street'] === 'Mabini Street', 'Normalized internal double whitespace in Street');
assert(rowWhitespace['Barangay'] === 'Barangay 1', 'Trimmed Barangay whitespace');
assert(rowWhitespace._cells['consumption'].finalValue === 22.4, 'Cleaned consumption string with unit "22.4 cu.m" to numeric 22.4');

// 4b. Missing Account Number (Row 3 in array)
const rowMissingAcct = issuesRes.records[2];
assert(rowMissingAcct['Account Number'] === '', 'Zero Fabrication: missing Account Number remains blank');
assert(
  rowMissingAcct._issues.some((i) => i.ruleId === 'REQUIRED_FIELD_MISSING' && i.fieldKey === 'accountNumber'),
  'Flagged missing Account Number as REQUIRED_FIELD_MISSING error'
);

// 4c. Negative Consumption (Row 4 in array)
const rowNegCons = issuesRes.records[3];
assert(
  rowNegCons._issues.some((i) => i.ruleId === 'NEGATIVE_NUMBER_NOT_ALLOWED'),
  'Flagged negative consumption as error'
);

// 4d. Invalid Consumption (Row 5 in array, 'N/A')
const rowInvalidCons = issuesRes.records[4];
assert(
  rowInvalidCons._issues.some((i) => i.ruleId === 'INVALID_NUMERIC'),
  'Flagged non-numeric consumption "N/A" as error'
);

// 4e. Invalid Calendar Date (Row 6 in array, '2026-02-31')
const rowInvalidDate = issuesRes.records[5];
assert(
  rowInvalidDate._issues.some((i) => i.category === 'INVALID_DATE' && i.classification === 'ERROR'),
  'Flagged non-existent calendar date "2026-02-31" as error'
);

// 4f. Future Billing Date (Row 7 in array, '2029-12-31')
const rowFutDate = issuesRes.records[6];
assert(
  rowFutDate._issues.some((i) => i.ruleId === 'FUTURE_DATE_WARNING' && i.classification === 'ERROR'),
  'Flagged far future billing date as ERROR (Must Be Fixed)'
);

// 4g. Duplicate Detection (Row 8 in array has identical Account Number + Billing Date as Row 1)
const rowDupe = issuesRes.records[7];
assert(
  rowDupe._issues.some((i) => i.category === 'DUPLICATE' && i.classification === 'ERROR'),
  'Duplicate Account Number + Billing Date detected and flagged as ERROR'
);

// 4h. Missing Street & Purok preserved as blank (Row 9 & 10)
const rowMissingStreet = issuesRes.records[8];
assert(rowMissingStreet['Street'] === '', 'Missing Street left blank (zero fabrication)');
const rowMissingPurok = issuesRes.records[9];
assert(rowMissingPurok['Purok'] === '', 'Missing Purok left blank (zero fabrication)');

// 4i. Leading Zero Account Number (Row 11 in array)
const rowLeadingZero = issuesRes.records[10];
assert(rowLeadingZero['Account Number'] === '00045892', 'Leading zeros preserved on Account Number "00045892"');
assert(rowLeadingZero._cells['consumption'].finalValue === 120.5, 'Stripped currency symbol "₱120.50" to float 120.5');
assert(rowLeadingZero['Billing Date'] === '2026-05-30', 'Normalized date "05/30/2026" to ISO "2026-05-30"');

// 4j. Unknown Type (Row 12 in array, 'Commercial-A')
const rowUnknownType = issuesRes.records[11];
assert(
  rowUnknownType._issues.some((i) => i.ruleId === 'UNRECOGNIZED_CATEGORY' && i.suggestedValue === 'Commercial A'),
  'Fuzzy matched "Commercial-A" and suggested standard "Commercial A"'
);

// 4k. Roman Numeral Purok (Row 13 in array, 'Purok IV')
const rowRomanPurok = issuesRes.records[12];
assert(
  rowRomanPurok['Purok'] === 'Purok 4' ||
    rowRomanPurok._issues.some((i) => i.ruleId === 'PUROK_ROMAN_NUMERAL' && i.suggestedValue === 'Purok 4'),
  'Standardized Roman numeral "Purok IV" to Arabic "Purok 4"'
);

// 4l. Missing Mandatory Barangay (Row 14 in array)
const rowMissingBrgy = issuesRes.records[13];
assert(
  rowMissingBrgy._issues.some((i) => i.ruleId === 'REQUIRED_FIELD_MISSING' && i.fieldKey === 'barangay'),
  'Flagged missing Barangay as mandatory ERROR'
);

// 4m. Score Cap Rule: Never 100% while blocking errors exist
assert(issuesReport.readinessScore < 100, 'Score is strictly less than 100% while blocking errors exist');

console.log('\n================================================================');
if (allPassed) {
  console.log('✓ ALL WATER TEST CASES PASSED SUCCESSFULLY WITH 100% COMPLIANCE');
} else {
  console.error('✗ SOME TEST CASES FAILED');
}
console.log('================================================================');
