import { ALL_DATASETS, DBL_DATASETS, getDatasetById } from '../src/lib/templates';
import {
  BUSINESS_SAMPLE_ISSUES,
  BUSINESS_SAMPLE_VALID,
  CRIME_SAMPLE_ISSUES,
  CRIME_SAMPLE_VALID,
  HR_SAMPLE_ISSUES,
  HR_SAMPLE_VALID,
  POWER_SAMPLE_ISSUES,
  POWER_SAMPLE_VALID,
  RESIDENTIAL_SAMPLE_ISSUES,
  RESIDENTIAL_SAMPLE_VALID,
  TELECOM_SAMPLE_ISSUES,
  TELECOM_SAMPLE_VALID,
  TRANSPORT_SAMPLE_ISSUES,
  TRANSPORT_SAMPLE_VALID,
} from '../src/lib/templates/dbl/dblTestData';
import {
  WATER_SAMPLE_WITH_ISSUES,
  WATER_SAMPLE_VALID,
  WATER_SAMPLE_OLD_TEMPLATE,
  UNRELATED_SAMPLE,
} from '../src/lib/templates/dbl/waterTestData';
import { evaluateTemplateMatch } from '../src/lib/detector/templateDetector';
import { validateAndCleanDataset } from '../src/lib/validator/validationEngine';
import { calculateQualityReport } from '../src/lib/validator/readinessCalculator';

console.log('================================================================');
console.log('       DATACLEAN: ALL 8 DBL DATASETS AUTOMATED TEST SUITE');
console.log('================================================================\n');

let allPassed = true;
let totalPassedCount = 0;
let totalFailedCount = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  [PASS] ${msg}`);
    totalPassedCount++;
  } else {
    console.error(`  [FAIL] ${msg}`);
    totalFailedCount++;
    allPassed = false;
  }
}

const unrelatedHeaders = Object.keys(UNRELATED_SAMPLE[0]);

// =============================================================
// 1. DBL BUSINESS
// =============================================================
console.log('--- 1. Testing DBL Business ---');
const businessDef = getDatasetById('dbl-business')!;
const bizHeaders = businessDef.fields.map((f) => f.officialHeader);

// 1. Valid dataset
const bizValidRes = validateAndCleanDataset(BUSINESS_SAMPLE_VALID, businessDef);
assert(bizValidRes.records.length === 1 && bizValidRes.totalErrors === 0 && bizValidRes.records[0]._status === 'VALID', '1. Valid dataset has 0 errors and status VALID');

// 2. Missing required field
const bizRes = validateAndCleanDataset(BUSINESS_SAMPLE_ISSUES, businessDef);
assert(
  bizRes.records[2]._issues.some((i) => i.ruleId === 'REQUIRED_FIELD_MISSING' && i.fieldKey === 'businessTradeName') &&
  bizRes.records[2]['businessTradeName'] === '',
  '2. Missing required Business Trade Name flagged as ERROR without fabricating values'
);

// 3. Invalid numeric value
assert(
  bizRes.records[3]._issues.some((i) => i.ruleId === 'NEGATIVE_NUMBER_NOT_ALLOWED' && i.fieldKey === 'grossSales') &&
  bizRes.records[3]._issues.some((i) => i.ruleId === 'NEGATIVE_INTEGER_NOT_ALLOWED' && i.fieldKey === 'totalMaleEmployees'),
  '3. Negative Gross Sales and negative employee counts flagged as numeric errors'
);

// 4. Invalid date
assert(
  bizRes.records[1]['registrationDateMmDdYy'] === '2026-11-18',
  '4. Registration date "11/18/26" safely converted to standard ISO date format "2026-11-18"'
);

// 5. Duplicate record
assert(
  bizRes.records[0]._issues.some((i) => i.category === 'DUPLICATE') &&
  bizRes.records[4]._issues.some((i) => i.category === 'DUPLICATE'),
  '5. Duplicate Trade Name + Barangay + Street detected on both original and duplicated rows'
);

// 6. Whitespace / formatting issue
assert(
  bizRes.records[1]['businessTradeName'] === 'ALPHA CORNER STORE' &&
  bizRes.records[1]._cells['grossSales'].finalValue === 150000,
  '6. Whitespace trimmed and currency "₱150,000.00" auto-stripped to 150000'
);

// 7. Missing column
const bizMissingColMatch = evaluateTemplateMatch(bizHeaders.filter((h) => h !== 'Business Trade Name'), businessDef);
assert(
  bizMissingColMatch.missingColumns.includes('Business Trade Name') && bizMissingColMatch.confidenceScore < 100,
  '7. Missing template column detected and scored accordingly'
);

// 8. Extra column
const bizExtraColMatch = evaluateTemplateMatch([...bizHeaders, 'Tax Clearance Number'], businessDef);
assert(
  bizExtraColMatch.extraColumns.includes('Tax Clearance Number'),
  '8. Extra non-template column safely identified'
);

// 9. Unknown categorical value
assert(
  bizRes.records[3]._issues.some((i) => i.ruleId === 'UNRECOGNIZED_CATEGORY' && i.fieldKey === 'permitStatus' && i.classification === 'ERROR'),
  '9. Unknown Permit Status flagged as ERROR (Must Be Fixed)'
);

// 10. Leading-zero identifier
assert(
  bizRes.records[1]['psicSubClassCode'] === '04711',
  '10. PSIC Sub-Class Code "04711" preserved leading zero as string'
);

// 11. Unrelated template detection
const bizUnrelatedMatch = evaluateTemplateMatch(unrelatedHeaders, businessDef);
assert(
  bizUnrelatedMatch.confidenceScore < 30,
  `11. Unrelated template rejected (Score: ${bizUnrelatedMatch.confidenceScore}% < 30%)`
);

// =============================================================
// 2. DBL CRIME
// =============================================================
console.log('\n--- 2. Testing DBL Crime ---');
const crimeDef = getDatasetById('dbl-crime')!;
const crimeHeaders = crimeDef.fields.map((f) => f.officialHeader);

// 1. Valid dataset
const crimeValidRes = validateAndCleanDataset(CRIME_SAMPLE_VALID, crimeDef);
assert(crimeValidRes.records.length === 1 && crimeValidRes.totalErrors === 0 && crimeValidRes.records[0]._status === 'VALID', '1. Valid dataset has 0 errors and status VALID');

// 2. Missing required field
const crimeRes = validateAndCleanDataset(CRIME_SAMPLE_ISSUES, crimeDef);
assert(
  crimeRes.records[2]._issues.some((i) => i.ruleId === 'REQUIRED_FIELD_MISSING' && i.fieldKey === 'blotterNumber') &&
  crimeRes.records[2]['blotterNumber'] === '',
  '2. Missing required Blotter Number flagged as ERROR without fabricating values'
);

// 3. Invalid numeric value (e.g. coordinates or cross-field validation)
const crimeCoordCheck = validateAndCleanDataset([{ ...CRIME_SAMPLE_VALID[0], 'Latitude': 195.5 }], crimeDef);
assert(
  crimeCoordCheck.records[0]._issues.some((i) => i.ruleId === 'INVALID_LATITUDE'),
  '3. Invalid Latitude (> 90) flagged as INVALID_LATITUDE error'
);

// 4. Invalid date (future date committed)
assert(
  crimeRes.records[3]._issues.some((i) => i.ruleId === 'DATE_CANNOT_BE_FUTURE' && i.fieldKey === 'datetimeCommitted'),
  '4. Future Datetime Committed flagged as DATE_CANNOT_BE_FUTURE error'
);

// 5. Duplicate record
assert(
  crimeRes.records[0]._issues.some((i) => i.category === 'DUPLICATE') &&
  crimeRes.records[4]._issues.some((i) => i.category === 'DUPLICATE'),
  '5. Duplicate Blotter Number detected on both conflicting rows'
);

// 6. Whitespace / formatting issue
assert(
  crimeRes.records[1]['blotterNumber'] === 'BLOTTER-2024-002' &&
  crimeRes.records[1]['datetimeReported'] === '2024-10-16 14:00:00',
  '6. Blotter number trimmed and datetime normalized to ISO format'
);

// 7. Missing column
const crimeMissingCol = evaluateTemplateMatch(crimeHeaders.filter((h) => h !== 'Blotter Number'), crimeDef);
assert(
  crimeMissingCol.missingColumns.includes('Blotter Number'),
  '7. Missing Blotter Number column detected'
);

// 8. Extra column
const crimeExtraCol = evaluateTemplateMatch([...crimeHeaders, 'Investigating Officer'], crimeDef);
assert(
  crimeExtraCol.extraColumns.includes('Investigating Officer'),
  '8. Extra column "Investigating Officer" identified'
);

// 9. Unknown categorical value
assert(
  crimeRes.records[1]._issues.some((i) => i.ruleId === 'UNRECOGNIZED_CATEGORY' && i.fieldKey === 'complainantGender'),
  '9. Unknown Complainant Gender flagged for REVIEW'
);

// 10. Leading-zero identifier
assert(
  crimeRes.records[1]['psccsSubClassCode'] === '080120',
  '10. PSCCS Sub-Class Code "080120" preserved leading zero as string'
);

// 11. Unrelated template detection
const crimeUnrelated = evaluateTemplateMatch(unrelatedHeaders, crimeDef);
assert(
  crimeUnrelated.confidenceScore < 30,
  `11. Unrelated template rejected (Score: ${crimeUnrelated.confidenceScore}% < 30%)`
);

// =============================================================
// 3. DBL HUMAN RESOURCE
// =============================================================
console.log('\n--- 3. Testing DBL Human Resource ---');
const hrDef = getDatasetById('dbl-human-resource')!;
const hrHeaders = hrDef.fields.map((f) => f.officialHeader);

// 1. Valid dataset
const hrValidRes = validateAndCleanDataset(HR_SAMPLE_VALID, hrDef);
assert(hrValidRes.records.length === 1 && hrValidRes.totalErrors === 0 && hrValidRes.records[0]._status === 'VALID', '1. Valid dataset has 0 errors and status VALID');

// 2. Missing required field
const hrRes = validateAndCleanDataset(HR_SAMPLE_ISSUES, hrDef);
assert(
  hrRes.records[2]._issues.some((i) => i.ruleId === 'REQUIRED_FIELD_MISSING' && i.fieldKey === 'studentNumber'),
  '2. Missing required Student Number flagged as ERROR without fabricating values'
);

// 3. Invalid numeric value (graduation year out of range)
assert(
  hrRes.records[3]._issues.some((i) => i.ruleId === 'INVALID_GRADUATION_YEAR'),
  '3. Unrealistic Graduation Year 1820 flagged as INVALID_GRADUATION_YEAR error'
);

// 4. Invalid date where applicable
assert(
  hrRes.records[1]['graduationYear'] === 2026,
  '4. Graduation year string " 2026 " cleaned to numeric integer 2026'
);

// 5. Duplicate record
assert(
  hrRes.records[0]._issues.some((i) => i.category === 'DUPLICATE') &&
  hrRes.records[4]._issues.some((i) => i.category === 'DUPLICATE'),
  '5. Duplicate Student Number detected and flagged on both rows'
);

// 6. Whitespace / formatting issue
assert(
  hrRes.records[1]['school'] === 'TEST SCHOOL 02',
  '6. School name whitespace trimmed'
);

// 7. Missing column
const hrMissingCol = evaluateTemplateMatch(hrHeaders.filter((h) => h !== 'Student Number'), hrDef);
assert(
  hrMissingCol.missingColumns.includes('Student Number'),
  '7. Missing Student Number column detected'
);

// 8. Extra column
const hrExtraCol = evaluateTemplateMatch([...hrHeaders, 'Graduation Honors'], hrDef);
assert(
  hrExtraCol.extraColumns.includes('Graduation Honors'),
  '8. Extra column "Graduation Honors" identified'
);

// 9. Unknown categorical value
assert(
  hrRes.records[3]._issues.some((i) => i.ruleId === 'UNRECOGNIZED_CATEGORY' && i.fieldKey === 'gender'),
  '9. Unknown Gender flagged for human REVIEW'
);

// 10. Leading-zero identifier
assert(
  hrRes.records[1]['studentNumber'] === '00098471',
  '10. Student Number "00098471" preserved leading zeros as string'
);

// 11. Unrelated template detection
const hrUnrelated = evaluateTemplateMatch(unrelatedHeaders, hrDef);
assert(
  hrUnrelated.confidenceScore < 30,
  `11. Unrelated template rejected (Score: ${hrUnrelated.confidenceScore}% < 30%)`
);

// =============================================================
// 4. DBL POWER
// =============================================================
console.log('\n--- 4. Testing DBL Power ---');
const powerDef = getDatasetById('dbl-power')!;
const powerHeaders = powerDef.fields.map((f) => f.officialHeader);

// 1. Valid dataset
const powerValidRes = validateAndCleanDataset(POWER_SAMPLE_VALID, powerDef);
assert(powerValidRes.records.length === 1 && powerValidRes.totalErrors === 0 && powerValidRes.records[0]._status === 'VALID', '1. Valid dataset has 0 errors and status VALID');

// 2. Missing required field
const powerRes = validateAndCleanDataset(POWER_SAMPLE_ISSUES, powerDef);
assert(
  powerRes.records[2]._issues.some((i) => i.ruleId === 'REQUIRED_FIELD_MISSING' && i.fieldKey === 'accountNumber'),
  '2. Missing required Account Number flagged as ERROR without fabricating values'
);

// 3. Invalid numeric value
assert(
  powerRes.records[3]._issues.some((i) => i.ruleId === 'NEGATIVE_NUMBER_NOT_ALLOWED' && i.fieldKey === 'consumption'),
  '3. Negative electricity consumption flagged as NEGATIVE_NUMBER_NOT_ALLOWED error'
);

// 4. Invalid date
assert(
  powerRes.records[1]['billingDate'] === '2026-05-30',
  '4. Slashed billing date "05/30/2026" safely normalized to standard ISO date "2026-05-30"'
);

// 5. Duplicate record
assert(
  powerRes.records[0]._issues.some((i) => i.category === 'DUPLICATE') &&
  powerRes.records[4]._issues.some((i) => i.category === 'DUPLICATE'),
  '5. Duplicate Account Number + Billing Date detected and flagged on both rows'
);

// 6. Whitespace / formatting issue
assert(
  powerRes.records[1]['accountNumber'] === 'TEST-PWR-0000002' &&
  powerRes.records[1]._cells['consumption'].finalValue === 350.2,
  '6. Account Number trimmed and consumption unit " 350.2 kwh " stripped to float 350.2'
);

// 7. Missing column
const powerMissingCol = evaluateTemplateMatch(powerHeaders.filter((h) => h !== 'Account Number'), powerDef);
assert(
  powerMissingCol.missingColumns.includes('Account Number'),
  '7. Missing Account Number column detected'
);

// 8. Extra column
const powerExtraCol = evaluateTemplateMatch([...powerHeaders, 'Meter Multiplier'], powerDef);
assert(
  powerExtraCol.extraColumns.includes('Meter Multiplier'),
  '8. Extra column "Meter Multiplier" identified'
);

// 9. Unknown categorical value
assert(
  powerRes.records[3]._issues.some((i) => i.ruleId === 'UNRECOGNIZED_CATEGORY' && i.fieldKey === 'type'),
  '9. Unknown customer type flagged for human REVIEW'
);

// 10. Leading-zero identifier
const pwrZeroRes = validateAndCleanDataset([{ ...POWER_SAMPLE_VALID[0], 'Account Number': '00029481' }], powerDef);
assert(
  pwrZeroRes.records[0]['accountNumber'] === '00029481',
  '10. Leading zeros in Power Account Number "00029481" preserved as string'
);

// 11. Unrelated template detection
const powerUnrelated = evaluateTemplateMatch(unrelatedHeaders, powerDef);
assert(
  powerUnrelated.confidenceScore < 30,
  `11. Unrelated template rejected (Score: ${powerUnrelated.confidenceScore}% < 30%)`
);

// =============================================================
// 5. DBL RESIDENTIAL
// =============================================================
console.log('\n--- 5. Testing DBL Residential ---');
const resDef = getDatasetById('dbl-residential')!;
const resHeaders = resDef.fields.map((f) => f.officialHeader);

// 1. Valid dataset
const resValidRes = validateAndCleanDataset(RESIDENTIAL_SAMPLE_VALID, resDef);
assert(resValidRes.records.length === 1 && resValidRes.totalErrors === 0 && resValidRes.records[0]._status === 'VALID', '1. Valid dataset has 0 errors and status VALID');

// 2. Missing required field
const residentialRes = validateAndCleanDataset(RESIDENTIAL_SAMPLE_ISSUES, resDef);
assert(
  residentialRes.records[2]._issues.some((i) => i.ruleId === 'REQUIRED_FIELD_MISSING' && i.fieldKey === 'cbmsNumber'),
  '2. Missing required CBMS Number flagged as ERROR without fabricating values'
);

// 3. Invalid numeric value / coordinates
const resCoordRes = validateAndCleanDataset([{ ...RESIDENTIAL_SAMPLE_VALID[0], 'House No': '012-A' }], resDef);
assert(
  resCoordRes.records[0]['houseNo'] === '012-A',
  '3. House Number "012-A" preserves alphanumeric text formatting without numeric mangling'
);

// 4. Invalid date (future birth date)
assert(
  residentialRes.records[3]._issues.some((i) => i.ruleId === 'DATE_CANNOT_BE_FUTURE' && i.fieldKey === 'birthDate') &&
  residentialRes.records[1]['birthDate'] === '1990-08-23',
  '4. Future Birth Date "2035-01-01" flagged as error, valid birth date "08/23/1990" normalized to ISO'
);

// 5. Duplicate record
assert(
  residentialRes.records[0]._issues.some((i) => i.category === 'DUPLICATE') &&
  residentialRes.records[4]._issues.some((i) => i.category === 'DUPLICATE'),
  '5. Duplicate CBMS Number detected and flagged on both rows'
);

// 6. Whitespace / formatting issue
assert(
  residentialRes.records[1]['street'] === 'Rizal Street',
  '6. Street name whitespace trimmed'
);

// 7. Missing column
const resMissingCol = evaluateTemplateMatch(resHeaders.filter((h) => h !== 'CBMS Number'), resDef);
assert(
  resMissingCol.missingColumns.includes('CBMS Number'),
  '7. Missing CBMS Number column detected'
);

// 8. Extra column
const resExtraCol = evaluateTemplateMatch([...resHeaders, 'Annual Income'], resDef);
assert(
  resExtraCol.extraColumns.includes('Annual Income'),
  '8. Extra column "Annual Income" identified'
);

// 9. Unknown categorical value
assert(
  residentialRes.records[3]._issues.some((i) => i.ruleId === 'UNRECOGNIZED_CATEGORY' && i.fieldKey === 'gender'),
  '9. Unknown Gender flagged for human REVIEW'
);

// 10. Leading-zero identifier
assert(
  residentialRes.records[1]['cbmsNumber'] === '00049182',
  '10. CBMS Number "00049182" preserved leading zero as string'
);

// 11. Unrelated template detection
const resUnrelated = evaluateTemplateMatch(unrelatedHeaders, resDef);
assert(
  resUnrelated.confidenceScore < 30,
  `11. Unrelated template rejected (Score: ${resUnrelated.confidenceScore}% < 30%)`
);

// =============================================================
// 6. DBL TELECOMMUNICATION TOWERS
// =============================================================
console.log('\n--- 6. Testing DBL Telecommunication Towers ---');
const telecomDef = getDatasetById('dbl-telecommunication')!;
const telecomHeaders = telecomDef.fields.map((f) => f.officialHeader);

// 1. Valid dataset
const telecomValidRes = validateAndCleanDataset(TELECOM_SAMPLE_VALID, telecomDef);
assert(telecomValidRes.records.length === 1 && telecomValidRes.totalErrors === 0 && telecomValidRes.records[0]._status === 'VALID', '1. Valid dataset has 0 errors and status VALID');

// 2. Missing required field
const telecomRes = validateAndCleanDataset(TELECOM_SAMPLE_ISSUES, telecomDef);
assert(
  telecomRes.records[2]._issues.some((i) => i.ruleId === 'REQUIRED_FIELD_MISSING' && i.fieldKey === 'towerCode'),
  '2. Missing required Tower Code flagged as ERROR without fabricating values'
);

// 3. Invalid numeric value (Latitude > 90)
assert(
  telecomRes.records[3]._issues.some((i) => i.ruleId === 'INVALID_LATITUDE'),
  '3. Latitude 120.5 > 90 flagged as INVALID_LATITUDE error'
);

// 4. Invalid date where applicable
assert(
  telecomRes.records[1]['installationDate'] === '2023-05-15',
  '4. Installation date validated and formatted'
);

// 5. Duplicate record
assert(
  telecomRes.records[0]._issues.some((i) => i.category === 'DUPLICATE') &&
  telecomRes.records[4]._issues.some((i) => i.category === 'DUPLICATE'),
  '5. Duplicate Tower Code detected and flagged on both rows'
);

// 6. Whitespace / formatting issue
assert(
  telecomRes.records[1]['towerName'] === 'DITO TOWER 02' &&
  telecomRes.records[1]._cells['towerHeight'].finalValue === 45.5,
  '6. Tower Name trimmed and height " 45.5 m " stripped to float 45.5'
);

// 7. Missing column
const telecomMissingCol = evaluateTemplateMatch(telecomHeaders.filter((h) => h !== 'Tower Code'), telecomDef);
assert(
  telecomMissingCol.missingColumns.includes('Tower Code'),
  '7. Missing Tower Code column detected'
);

// 8. Extra column
const telecomExtraCol = evaluateTemplateMatch([...telecomHeaders, 'Generator Backup Capacity'], telecomDef);
assert(
  telecomExtraCol.extraColumns.includes('Generator Backup Capacity'),
  '8. Extra column "Generator Backup Capacity" identified'
);

// 9. Unknown categorical value
assert(
  telecomRes.records[3]._issues.some((i) => i.ruleId === 'UNRECOGNIZED_CATEGORY' && i.fieldKey === 'towerType'),
  '9. Unknown Tower Type flagged for human REVIEW'
);

// 10. Leading-zero identifier
assert(
  telecomRes.records[1]['towerCode'] === '009812',
  '10. Tower Code "009812" preserved leading zeros as string'
);

// 11. Unrelated template detection
const telecomUnrelated = evaluateTemplateMatch(unrelatedHeaders, telecomDef);
assert(
  telecomUnrelated.confidenceScore < 30,
  `11. Unrelated template rejected (Score: ${telecomUnrelated.confidenceScore}% < 30%)`
);

// =============================================================
// 7. DBL TRANSPORTATION
// =============================================================
console.log('\n--- 7. Testing DBL Transportation ---');
const transDef = getDatasetById('dbl-transportation')!;
const transHeaders = transDef.fields.map((f) => f.officialHeader);

// 1. Valid dataset
const transValidRes = validateAndCleanDataset(TRANSPORT_SAMPLE_VALID, transDef);
assert(transValidRes.records.length === 1 && transValidRes.totalErrors === 0 && transValidRes.records[0]._status === 'VALID', '1. Valid dataset has 0 errors and status VALID');

// 2. Missing required field
const transRes = validateAndCleanDataset(TRANSPORT_SAMPLE_ISSUES, transDef);
assert(
  transRes.records[2]._issues.some((i) => i.ruleId === 'REQUIRED_FIELD_MISSING' && i.fieldKey === 'route'),
  '2. Missing required Route flagged as ERROR without fabricating values'
);

// 3. Invalid numeric value
assert(
  transRes.records[3]._issues.some((i) => i.ruleId === 'NEGATIVE_INTEGER_NOT_ALLOWED' && i.fieldKey === 'availableUnits'),
  '3. Negative Available Units flagged as NEGATIVE_INTEGER_NOT_ALLOWED error'
);

// 4. Invalid date where applicable
const transHasDateFields = transDef.fields.some((f) => f.type === 'date' || f.type === 'datetime');
assert(
  !transHasDateFields,
  '4. Verified Transportation specification has no date fields per MASTER_RULEBOOK.md'
);

// 5. Duplicate record
assert(
  transRes.records[0]._issues.some((i) => i.category === 'DUPLICATE') &&
  transRes.records[4]._issues.some((i) => i.category === 'DUPLICATE'),
  '5. Duplicate Route + Vehicle Type detected and flagged on both rows'
);

// 6. Whitespace / formatting issue
assert(
  transRes.records[1]['route'] === 'Barangay 2 - Poblacion' &&
  transRes.records[1]['availableUnits'] === 25,
  '6. Route trimmed and Available Units " 25 " cast to integer 25'
);

// 7. Missing column
const transMissingCol = evaluateTemplateMatch(transHeaders.filter((h) => h !== 'Route'), transDef);
assert(
  transMissingCol.missingColumns.includes('Route'),
  '7. Missing Route column detected'
);

// 8. Extra column
const transExtraCol = evaluateTemplateMatch([...transHeaders, 'Standard Base Fare'], transDef);
assert(
  transExtraCol.extraColumns.includes('Standard Base Fare'),
  '8. Extra column "Standard Base Fare" identified'
);

// 9. Unknown categorical value
assert(
  transRes.records[3]._issues.some((i) => i.ruleId === 'UNRECOGNIZED_CATEGORY' && i.fieldKey === 'vehicleType'),
  '9. Unknown Vehicle Type "Hovercraft" flagged for human REVIEW'
);

// 10. Leading-zero identifier
const transCodeRes = validateAndCleanDataset([{ ...TRANSPORT_SAMPLE_VALID[0], 'Route': '001-ALPHA-BETA' }], transDef);
assert(
  transCodeRes.records[0]['route'] === '001-ALPHA-BETA',
  '10. Identifier "001-ALPHA-BETA" preserved leading zeros as string'
);

// 11. Unrelated template detection
const transUnrelated = evaluateTemplateMatch(unrelatedHeaders, transDef);
assert(
  transUnrelated.confidenceScore < 30,
  `11. Unrelated template rejected (Score: ${transUnrelated.confidenceScore}% < 30%)`
);

// =============================================================
// 8. DBL WATER (REGRESSION & FULL PIPELINE CHECK)
// =============================================================
console.log('\n--- 8. Testing DBL Water (Full Pipeline & Regression) ---');
const waterDef = getDatasetById('dbl-water')!;
const waterHeaders = waterDef.fields.map((f) => f.officialHeader);

// 1. Valid dataset
const waterValidRes = validateAndCleanDataset(WATER_SAMPLE_VALID, waterDef);
assert(waterValidRes.records.length === 4 && waterValidRes.totalErrors === 0 && waterValidRes.records[0]._status === 'VALID', '1. Valid dataset has 4 records, 0 errors, and status VALID');

// 2. Missing required field
const waterRes = validateAndCleanDataset(WATER_SAMPLE_WITH_ISSUES, waterDef);
assert(
  waterRes.records[2]._issues.some((i) => i.ruleId === 'REQUIRED_FIELD_MISSING' && i.fieldKey === 'accountNumber'),
  '2. Missing required Account Number flagged as ERROR without fabricating values'
);

// 3. Invalid numeric value
assert(
  waterRes.records[3]._issues.some((i) => i.ruleId === 'NEGATIVE_NUMBER_NOT_ALLOWED' && i.fieldKey === 'consumption'),
  '3. Negative water consumption flagged as NEGATIVE_NUMBER_NOT_ALLOWED error'
);

// 4. Invalid date
assert(
  waterRes.records[5]._issues.some((i) => i.ruleId === 'INVALID_CALENDAR_DATE' && i.fieldKey === 'billingDate'),
  '4. Nonexistent calendar date "2026-02-31" flagged as INVALID_CALENDAR_DATE error'
);

// 5. Duplicate record
assert(
  waterRes.records[0]._issues.some((i) => i.category === 'DUPLICATE') &&
  waterRes.records[7]._issues.some((i) => i.category === 'DUPLICATE'),
  '5. Duplicate Account Number + Billing Date detected and flagged on both rows'
);

// 6. Whitespace / formatting issue
assert(
  waterRes.records[1]['accountNumber'] === 'TEST-LUC-WTR-0000002' &&
  waterRes.records[1]._cells['consumption'].finalValue === 22.4,
  '6. Account Number whitespace trimmed and unit " 22.4 cu.m " stripped to float 22.4'
);

// 7. Missing column (in older template)
const waterOldMatch = evaluateTemplateMatch(['Account Number', 'Type', 'Consumption', 'Barangay', 'Billing Date'], waterDef);
assert(
  waterOldMatch.isOldOrIncompleteTemplate && waterOldMatch.missingColumns.includes('Street'),
  '7. Older template missing Street and Purok detected and classified as isOldOrIncompleteTemplate'
);

// 8. Extra column
const waterExtraCol = evaluateTemplateMatch([...waterHeaders, 'Meter Brand'], waterDef);
assert(
  waterExtraCol.extraColumns.includes('Meter Brand'),
  '8. Extra column "Meter Brand" identified'
);

// 9. Unknown categorical value
assert(
  waterRes.records[11]._issues.some((i) => i.ruleId === 'UNRECOGNIZED_CATEGORY' && i.fieldKey === 'type'),
  '9. Unknown customer type flagged for human REVIEW'
);

// 10. Leading-zero identifier
assert(
  waterRes.records[10]['accountNumber'] === '00045892',
  '10. Account Number "00045892" preserved leading zero as string'
);

// 11. Unrelated template detection
const waterUnrelated = evaluateTemplateMatch(unrelatedHeaders, waterDef);
assert(
  waterUnrelated.confidenceScore < 30,
  `11. Unrelated template rejected (Score: ${waterUnrelated.confidenceScore}% < 30%)`
);

// =============================================================
// SUMMARY
// =============================================================
console.log('\n================================================================');
console.log(`TEST SUITE RESULTS: ${totalPassedCount} PASSED, ${totalFailedCount} FAILED`);
if (allPassed) {
  console.log('✓ ALL 8 DBL DATASETS PASSED WITH 100% VALIDATION COMPLIANCE');
} else {
  console.error('✗ SOME DBL TESTS FAILED');
}
console.log('================================================================');
process.exit(allPassed ? 0 : 1);
