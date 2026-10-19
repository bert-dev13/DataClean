import { ODESSEE_DATASETS, getDatasetById } from '../src/lib/templates';
import {
  HOUSEHOLD_SAMPLE_ISSUES,
  HOUSEHOLD_SAMPLE_VALID,
  COVID_SAMPLE_ISSUES,
  COVID_SAMPLE_VALID,
  DISASTER_SAMPLE_ISSUES,
  DISASTER_SAMPLE_VALID,
  DRRM_SAMPLE_ISSUES,
  DRRM_SAMPLE_VALID,
  EVACUATION_SAMPLE_ISSUES,
  EVACUATION_SAMPLE_VALID,
  FLOOD_SAMPLE_ISSUES,
  FLOOD_SAMPLE_VALID,
  VRA_SAMPLE_ISSUES,
  VRA_SAMPLE_VALID,
} from '../src/lib/templates/odessee/odesseeTestData';
import { UNRELATED_SAMPLE } from '../src/lib/templates/dbl/waterTestData';
import { evaluateTemplateMatch, detectDataset } from '../src/lib/detector/templateDetector';
import { validateAndCleanDataset } from '../src/lib/validator/validationEngine';

console.log('================================================================');
console.log('       DATACLEAN: ALL 7 ODeSSEE DATASETS AUTOMATED TEST SUITE');
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
// 1. ODeSSEE BARANGAY HOUSEHOLD PROFILE
// =============================================================
console.log('--- 1. Testing ODeSSEE Barangay Household Profile ---');
const hhDef = getDatasetById('odessee-household')!;
const hhHeaders = hhDef.fields.map((f) => f.officialHeader);

// Specific Requirement: 9-column canonical structure
assert(hhDef.fields.length === 9, '1a. Specific check: Canonical definition has exactly 9 columns (not 22 aggregate)');
assert(
  hhHeaders.includes('CBMS#-Ind#') && hhHeaders.includes('Income Classification') && !hhHeaders.includes('Total Population'),
  '1b. Specific check: Uses microdata structure (CBMS#-Ind# to Income Classification) and excludes 22-column aggregate'
);

// 1. Valid dataset
const hhValidRes = validateAndCleanDataset(HOUSEHOLD_SAMPLE_VALID, hhDef);
assert(hhValidRes.records.length === 1 && hhValidRes.totalErrors === 0 && hhValidRes.records[0]._status === 'VALID', '1. Valid dataset has 0 errors and status VALID');

// 2. Missing required value + Zero Data Fabrication
const hhRes = validateAndCleanDataset(HOUSEHOLD_SAMPLE_ISSUES, hhDef);
assert(
  hhRes.records[2]._issues.some((i) => i.ruleId === 'REQUIRED_FIELD_MISSING' && i.fieldKey === 'barangay') &&
  hhRes.records[2]['barangay'] === '',
  '2. Missing required Barangay flagged as ERROR without fabricating values'
);

// 3. Missing required column
const hhMissingCol = evaluateTemplateMatch(hhHeaders.filter((h) => h !== 'Barangay'), hhDef);
assert(hhMissingCol.missingRequiredColumns.includes('Barangay') && hhMissingCol.confidenceScore < 100, '3. Missing required column detected');

// 4. Extra column
const hhExtraCol = evaluateTemplateMatch([...hhHeaders, 'Family Serial Number'], hhDef);
assert(hhExtraCol.extraColumns.includes('Family Serial Number'), '4. Extra non-template column identified');

// 5. Numeric / boolean formatting issue
assert(hhRes.records[1]['soloParentYN'] === 'Y', '5. Boolean/YN field "y" safely auto-fixed to uppercase "Y"');

// 6. Invalid date (future date)
assert(
  hhRes.records[3]._issues.some((i) => i.ruleId === 'DATE_CANNOT_BE_FUTURE' && i.fieldKey === 'birthDate') &&
  hhRes.records[1]['birthDate'] === '1992-04-15',
  '6. Future birth date flagged as error; slashed date "04/15/1992" normalized to ISO'
);

// 7. Coordinates where applicable
assert(!hhDef.fields.some((f) => f.type === 'coordinate_lat'), '7. Verified Household profile does not require coordinates');

// 8. Duplicate records
assert(
  hhRes.records[0]._issues.some((i) => i.category === 'DUPLICATE') &&
  hhRes.records[4]._issues.some((i) => i.category === 'DUPLICATE'),
  '8. Duplicate CBMS#-Ind# detected and flagged on both conflicting rows'
);

// 9. Whitespace normalization
assert(hhRes.records[1]['barangay'] === 'San Fermin', '9. Whitespace trimmed in Barangay');

// 10. Leading-zero identifier preservation
assert(hhRes.records[1]['cbmsInd'] === '00049281', '10. Leading zeros preserved in CBMS#-Ind# "00049281"');

// 11. Unknown categorical value
assert(
  hhRes.records[3]._issues.some((i) => i.ruleId === 'UNRECOGNIZED_CATEGORY' && i.fieldKey === 'civilStatus'),
  '11. Unrecognized Civil Status "Complicated" flagged for human REVIEW'
);

// 12. Unrelated template rejection
const hhUnrelated = evaluateTemplateMatch(unrelatedHeaders, hhDef);
assert(hhUnrelated.confidenceScore < 30, `12. Unrelated template rejected (${hhUnrelated.confidenceScore}% < 30%)`);

// 13. Zero data fabrication verification
assert(hhRes.records[2]['disability'] === '' && hhRes.records[2]['purokZone'] === '', '13. Empty optional fields remain strictly empty without placeholder insertion');

// =============================================================
// 2. ODeSSEE COVID CASES
// =============================================================
console.log('\n--- 2. Testing ODeSSEE COVID Cases ---');
const covidDef = getDatasetById('odessee-covid')!;
const covidHeaders = covidDef.fields.map((f) => f.officialHeader);

// Specific Requirement: 3-column canonical structure
assert(covidDef.fields.length === 3, '2a. Specific check: Canonical definition has exactly 3 columns (not 40 patient list)');
assert(
  JSON.stringify(covidHeaders) === JSON.stringify(['Barangay', 'Facilities', 'Total Number of Case']),
  '2b. Specific check: Official headers match ["Barangay", "Facilities", "Total Number of Case"]'
);

// 1. Valid dataset
const covidValidRes = validateAndCleanDataset(COVID_SAMPLE_VALID, covidDef);
assert(covidValidRes.records.length === 1 && covidValidRes.totalErrors === 0 && covidValidRes.records[0]._status === 'VALID', '1. Valid dataset has 0 errors and status VALID');

// 2. Missing required value + Zero fabrication
const covidRes = validateAndCleanDataset(COVID_SAMPLE_ISSUES, covidDef);
assert(
  covidRes.records[2]._issues.some((i) => i.ruleId === 'REQUIRED_FIELD_MISSING' && i.fieldKey === 'barangay') &&
  covidRes.records[2]['barangay'] === '',
  '2. Missing required Barangay flagged as ERROR without fabricating values'
);

// 3. Missing required column
const covidMissingCol = evaluateTemplateMatch(covidHeaders.filter((h) => h !== 'Barangay'), covidDef);
assert(covidMissingCol.missingRequiredColumns.includes('Barangay'), '3. Missing required column detected');

// 4. Extra column
const covidExtraCol = evaluateTemplateMatch([...covidHeaders, 'Active Cases'], covidDef);
assert(covidExtraCol.extraColumns.includes('Active Cases'), '4. Extra column "Active Cases" identified');

// 5. Numeric formatting & negative checks
assert(
  covidRes.records[1]['totalNumberOfCase'] === 25 &&
  covidRes.records[3]._issues.some((i) => i.ruleId === 'NEGATIVE_INTEGER_NOT_ALLOWED'),
  '5. " 25 cases " parsed to integer 25; negative case count (-8) flagged as NEGATIVE_INTEGER_NOT_ALLOWED'
);

// 6. Invalid date where applicable
assert(!covidDef.fields.some((f) => f.type === 'date'), '6. Verified COVID cases aggregate has no date column');

// 7. Coordinates where applicable
assert(!covidDef.fields.some((f) => f.type === 'coordinate_lat'), '7. Verified COVID cases aggregate has no coordinate columns');

// 8. Duplicate records
assert(
  covidRes.records[0]._issues.some((i) => i.category === 'DUPLICATE') &&
  covidRes.records[4]._issues.some((i) => i.category === 'DUPLICATE'),
  '8. Duplicate Barangay + Facilities detected on conflicting rows'
);

// 9. Whitespace normalization
assert(covidRes.records[1]['barangay'] === 'District 1', '9. Trimmed whitespace in Barangay');

// 10. Leading-zero identifier
const covidCodeRes = validateAndCleanDataset([{ ...COVID_SAMPLE_VALID[0], 'Barangay': '001-Poblacion' }], covidDef);
assert(covidCodeRes.records[0]['barangay'] === '001-Poblacion', '10. Leading zero code in Barangay preserved');

// 11. Categorical check
assert(covidDef.fields.every((f) => f.acceptedValues === undefined), '11. Verified COVID cases has no arbitrary non-documented categories');

// 12. Unrelated template rejection
const covidUnrelated = evaluateTemplateMatch(unrelatedHeaders, covidDef);
assert(covidUnrelated.confidenceScore < 30, `12. Unrelated template rejected (${covidUnrelated.confidenceScore}% < 30%)`);

// 13. Zero data fabrication
assert(covidRes.records[2]['facilities'] === 'Community Quarantine Facility', '13. Preserves original content without injecting dummy values');

// =============================================================
// 3. ODeSSEE DISASTER INCIDENT REPORT
// =============================================================
console.log('\n--- 3. Testing ODeSSEE Disaster Incident Report ---');
const disasterDef = getDatasetById('odessee-disaster')!;
const disasterHeaders = disasterDef.fields.map((f) => f.officialHeader);

// Specific Requirement: Multi-row header recognition
assert(disasterDef.headerRowIndex === 2, '3a. Specific check: Designated headerRowIndex is 2 to bypass merged super-headers');
assert(disasterDef.fields.length === 10, '3b. Specific check: 10 official columns defined on Row 2');

// 1. Valid dataset
const disasterValidRes = validateAndCleanDataset(DISASTER_SAMPLE_VALID, disasterDef);
assert(disasterValidRes.records.length === 1 && disasterValidRes.totalErrors === 0 && disasterValidRes.records[0]._status === 'VALID', '1. Valid dataset has 0 errors and status VALID');

// 2. Missing required value + Zero fabrication
const disasterRes = validateAndCleanDataset(DISASTER_SAMPLE_ISSUES, disasterDef);
assert(
  disasterRes.records[2]._issues.some((i) => i.ruleId === 'REQUIRED_FIELD_MISSING' && i.fieldKey === 'reportDate') &&
  disasterRes.records[2]['reportDate'] === '',
  '2. Missing required Report Date flagged as ERROR without fabricating values'
);

// 3. Missing required column
const disasterMissingCol = evaluateTemplateMatch(disasterHeaders.filter((h) => h !== 'Report Date'), disasterDef);
assert(disasterMissingCol.missingRequiredColumns.includes('Report Date'), '3. Missing Report Date column detected');

// 4. Extra column
const disasterExtraCol = evaluateTemplateMatch([...disasterHeaders, 'Evacuation Status'], disasterDef);
assert(disasterExtraCol.extraColumns.includes('Evacuation Status'), '4. Extra column identified');

// 5. Numeric formatting
assert(
  disasterRes.records[1]._cells['currentLevel'].finalValue === 14.8 &&
  disasterRes.records[1]['casualty'] === 2 &&
  disasterRes.records[3]._issues.some((i) => i.ruleId === 'NEGATIVE_INTEGER_NOT_ALLOWED'),
  '5. " 14.8 m " stripped to 14.8, casualty cast to integer 2, negative casualty flagged as error'
);

// 6. Invalid date
assert(
  disasterRes.records[1]['reportDate'] === '2024-09-16',
  '6. Slashed date "09/16/2024" safely converted to standard ISO date "2024-09-16"'
);

// 7. Coordinates where applicable
assert(!disasterDef.fields.some((f) => f.type === 'coordinate_lat'), '7. Verified Disaster report does not contain lat/lng columns');

// 8. Duplicate records
assert(
  disasterRes.records[0]._issues.some((i) => i.category === 'DUPLICATE') &&
  disasterRes.records[4]._issues.some((i) => i.category === 'DUPLICATE'),
  '8. Duplicate Report Date + Incident detected on conflicting rows'
);

// 9. Whitespace normalization
assert(disasterRes.records[1]['incident'] === 'Flash Flood', '9. Whitespace trimmed in Incident name');

// 10. Leading-zero identifier
const disasterCodeRes = validateAndCleanDataset([{ ...DISASTER_SAMPLE_VALID[0], 'Gauging Station': '009-River-Alpha' }], disasterDef);
assert(disasterCodeRes.records[0]['gaugingStation'] === '009-River-Alpha', '10. Leading zeros preserved in Gauging Station');

// 11. Categorical check
assert(disasterRes.records[1]['skyCondition'] === 'Rainy', '11. Preserves documented sky condition');

// 12. Unrelated template rejection
const disasterUnrelated = evaluateTemplateMatch(unrelatedHeaders, disasterDef);
assert(disasterUnrelated.confidenceScore < 30, `12. Unrelated template rejected (${disasterUnrelated.confidenceScore}% < 30%)`);

// 13. Zero data fabrication
assert(disasterRes.records[2]['casualty'] === '', '13. Unreported casualty remains blank without inventing 0');

// =============================================================
// 4. ODeSSEE DRRM RESOURCES
// =============================================================
console.log('\n--- 4. Testing ODeSSEE DRRM Resources ---');
const drrmDef = getDatasetById('odessee-drrm')!;
const drrmHeaders = drrmDef.fields.map((f) => f.officialHeader);

// 1. Valid dataset
const drrmValidRes = validateAndCleanDataset(DRRM_SAMPLE_VALID, drrmDef);
assert(drrmValidRes.records.length === 1 && drrmValidRes.totalErrors === 0 && drrmValidRes.records[0]._status === 'VALID', '1. Valid dataset has 0 errors and status VALID');

// 2. Missing required value + Zero fabrication
const drrmRes = validateAndCleanDataset(DRRM_SAMPLE_ISSUES, drrmDef);
assert(
  drrmRes.records[2]._issues.some((i) => i.ruleId === 'REQUIRED_FIELD_MISSING' && i.fieldKey === 'quantity') &&
  drrmRes.records[2]['quantity'] === '',
  '2. Missing required Quantity flagged as ERROR without fabricating values'
);

// 3. Missing required column
const drrmMissingCol = evaluateTemplateMatch(drrmHeaders.filter((h) => h !== 'Quantity'), drrmDef);
assert(drrmMissingCol.missingRequiredColumns.includes('Quantity'), '3. Missing required Quantity column detected');

// 4. Extra column
const drrmExtraCol = evaluateTemplateMatch([...drrmHeaders, 'Storage Facility'], drrmDef);
assert(drrmExtraCol.extraColumns.includes('Storage Facility'), '4. Extra column "Storage Facility" identified');

// 5. Numeric formatting & negative checks
assert(
  drrmRes.records[1]['quantity'] === 24 &&
  drrmRes.records[3]._issues.some((i) => i.ruleId === 'NEGATIVE_INTEGER_NOT_ALLOWED'),
  '5. " 24 pcs " stripped to 24; negative quantity (-5) flagged as NEGATIVE_INTEGER_NOT_ALLOWED'
);

// 6. Invalid date where applicable
assert(!drrmDef.fields.some((f) => f.type === 'date'), '6. Verified DRRM resources has no date fields');

// 7. Coordinates where applicable
assert(!drrmDef.fields.some((f) => f.type === 'coordinate_lat'), '7. Verified DRRM resources has no coordinate fields');

// 8. Duplicate records
assert(
  drrmRes.records[0]._issues.some((i) => i.category === 'DUPLICATE') &&
  drrmRes.records[4]._issues.some((i) => i.category === 'DUPLICATE'),
  '8. Duplicate Group/Team + Resources/Equipment detected on both rows'
);

// 9. Whitespace normalization
assert(
  drrmRes.records[1]['groupTeam'] === 'BFP Special Operations' &&
  drrmRes.records[1]['resourcesEquipment'] === 'Fire Axe',
  '9. Whitespace trimmed in Group/Team and Resources/Equipment'
);

// 10. Leading-zero identifier
const drrmZeroRes = validateAndCleanDataset([{ ...DRRM_SAMPLE_VALID[0], 'Group/Team': '001-Team-Alpha' }], drrmDef);
assert(drrmZeroRes.records[0]['groupTeam'] === '001-Team-Alpha', '10. Leading zeros preserved in Team identifier');

// 11. Unknown categorical value
assert(
  drrmRes.records[3]._issues.some((i) => i.ruleId === 'UNRECOGNIZED_CATEGORY' && i.fieldKey === 'unit'),
  '11. Unrecognized Unit "Cartons" flagged for human REVIEW'
);

// 12. Unrelated template rejection
const drrmUnrelated = evaluateTemplateMatch(unrelatedHeaders, drrmDef);
assert(drrmUnrelated.confidenceScore < 30, `12. Unrelated template rejected (${drrmUnrelated.confidenceScore}% < 30%)`);

// 13. Zero data fabrication
assert(drrmRes.records[2]['quantity'] === '', '13. Missing quantity remains blank without fabricating 0');

// =============================================================
// 5. ODeSSEE EVACUATION SITES
// =============================================================
console.log('\n--- 5. Testing ODeSSEE Evacuation Sites ---');
const evacDef = getDatasetById('odessee-evacuation')!;
const evacHeaders = evacDef.fields.map((f) => f.officialHeader);

// Specific Requirement: Trailing whitespace header matching
const evacWithTrailingSpaceMatch = evaluateTemplateMatch(['Name of Evacuation Center ', 'Barangay', 'Latitude', 'Longitude'], evacDef);
const evacWithoutTrailingSpaceMatch = evaluateTemplateMatch(['Name of Evacuation Center', 'Barangay', 'Latitude', 'Longitude'], evacDef);
assert(
  evacWithTrailingSpaceMatch.matchedColumns.some((c) => c.fieldKey === 'nameOfEvacuationCenter') &&
  evacWithoutTrailingSpaceMatch.matchedColumns.some((c) => c.fieldKey === 'nameOfEvacuationCenter'),
  '5a. Specific check: Matches header whether trailing space is present ("Name of Evacuation Center ") or trimmed ("Name of Evacuation Center")'
);

// 1. Valid dataset
const evacValidRes = validateAndCleanDataset(EVACUATION_SAMPLE_VALID, evacDef);
assert(evacValidRes.records.length === 1 && evacValidRes.totalErrors === 0 && evacValidRes.records[0]._status === 'VALID', '1. Valid dataset has 0 errors and status VALID');

// 2. Missing required value + Zero fabrication
const evacRes = validateAndCleanDataset(EVACUATION_SAMPLE_ISSUES, evacDef);
assert(
  evacRes.records[2]._issues.some((i) => i.ruleId === 'REQUIRED_FIELD_MISSING' && i.fieldKey === 'nameOfEvacuationCenter') &&
  evacRes.records[2]['nameOfEvacuationCenter'] === '',
  '2. Missing required Name of Evacuation Center flagged as ERROR without fabricating values'
);

// 3. Missing required column
const evacMissingCol = evaluateTemplateMatch(evacHeaders.filter((h) => !h.includes('Evacuation Center')), evacDef);
assert(evacMissingCol.missingRequiredColumns.some((c) => c.includes('Evacuation Center')), '3. Missing required Evacuation Center column detected');

// 4. Extra column
const evacExtraCol = evaluateTemplateMatch([...evacHeaders, 'Generator Specs'], evacDef);
assert(evacExtraCol.extraColumns.includes('Generator Specs'), '4. Extra column "Generator Specs" identified');

// 5. Numeric formatting & counts
assert(
  evacRes.records[1]['noOfFamily'] === 45 &&
  evacRes.records[1]['noOfIndividuals'] === 210,
  '5. String counts " 45 " and " 210 " cleaned to numeric integers'
);

// 6. Invalid date where applicable
assert(!evacDef.fields.some((f) => f.type === 'date'), '6. Verified Evacuation sites template has no date fields');

// 7. Invalid coordinates
assert(
  evacRes.records[3]._issues.some((i) => i.ruleId === 'INVALID_LATITUDE'),
  '7. Latitude 135.5 > 90 flagged as INVALID_LATITUDE error'
);

// 8. Duplicate records
assert(
  evacRes.records[0]._issues.some((i) => i.category === 'DUPLICATE') &&
  evacRes.records[4]._issues.some((i) => i.category === 'DUPLICATE'),
  '8. Duplicate Evacuation Center + Barangay detected on conflicting rows'
);

// 9. Whitespace normalization
assert(evacRes.records[1]['barangay'] === 'San Nicolas', '9. Whitespace trimmed in Barangay');

// 10. Leading-zero identifier
const evacZeroRes = validateAndCleanDataset([{ ...EVACUATION_SAMPLE_VALID[0], 'Name of Evacuation Center ': '001-CENTRAL-EVAC' }], evacDef);
assert(evacZeroRes.records[0]['nameOfEvacuationCenter'] === '001-CENTRAL-EVAC', '10. Leading zeros preserved in Evacuation center name');

// 11. Unknown categorical value
assert(
  evacRes.records[3]._issues.some((i) => i.ruleId === 'UNRECOGNIZED_CATEGORY' && i.fieldKey === 'breastFeedingArea'),
  '11. Unrecognized Breast feeding Area "Pending Inspection" flagged for human REVIEW'
);

// 12. Unrelated template rejection
const evacUnrelated = evaluateTemplateMatch(unrelatedHeaders, evacDef);
assert(evacUnrelated.confidenceScore < 30, `12. Unrelated template rejected (${evacUnrelated.confidenceScore}% < 30%)`);

// 13. Zero data fabrication
assert(evacRes.records[2]['noOfRooms'] === '', '13. Unreported room count remains blank');

// =============================================================
// 6. ODeSSEE FLOOD SUSCEPTIBILITY RATING
// =============================================================
console.log('\n--- 6. Testing ODeSSEE Flood Susceptibility Rating ---');
const floodDef = getDatasetById('odessee-flood')!;
const floodHeaders = floodDef.fields.map((f) => f.officialHeader);

// Specific Requirement: POI alias support
const floodWithPoiAliasMatch = evaluateTemplateMatch(
  floodHeaders.map((h) => (h === 'POI' ? 'Point of Interest' : h)),
  floodDef
);
assert(
  floodWithPoiAliasMatch.matchedColumns.some((c) => c.fieldKey === 'poi' && c.uploaded === 'Point of Interest'),
  '6a. Specific check: Supports "Point of Interest" as alias for official header "POI"'
);
assert(
  floodDef.fields.find((f) => f.key === 'poi')?.officialHeader === 'POI',
  '6b. Specific check: Official header for export remains strictly "POI"'
);

// 1. Valid dataset
const floodValidRes = validateAndCleanDataset(FLOOD_SAMPLE_VALID, floodDef);
assert(floodValidRes.records.length === 1 && floodValidRes.totalErrors === 0 && floodValidRes.records[0]._status === 'VALID', '1. Valid dataset has 0 errors and status VALID');

// 2. Missing required value + Zero fabrication
const floodRes = validateAndCleanDataset(FLOOD_SAMPLE_ISSUES, floodDef);
assert(
  floodRes.records[2]._issues.some((i) => i.ruleId === 'REQUIRED_FIELD_MISSING' && i.fieldKey === 'barangayName') &&
  floodRes.records[2]['barangayName'] === '',
  '2. Missing required Barangay Name flagged as ERROR without fabricating values'
);

// 3. Missing required column
const floodMissingCol = evaluateTemplateMatch(floodHeaders.filter((h) => h !== 'Barangay Name'), floodDef);
assert(floodMissingCol.missingRequiredColumns.includes('Barangay Name'), '3. Missing Barangay Name column detected');

// 4. Extra column
const floodExtraCol = evaluateTemplateMatch([...floodHeaders, 'Soil Type'], floodDef);
assert(floodExtraCol.extraColumns.includes('Soil Type'), '4. Extra column "Soil Type" identified');

// 5. Numeric formatting & negative checks
assert(
  floodRes.records[1]._cells['floodHeight'].finalValue === 2.25 &&
  floodRes.records[3]._issues.some((i) => i.ruleId === 'NEGATIVE_NUMBER_NOT_ALLOWED' && i.fieldKey === 'floodHeight'),
  '5. " 2.25 m " stripped to 2.25; negative flood height (-1.5) flagged as NEGATIVE_NUMBER_NOT_ALLOWED'
);

// 6. Invalid date where applicable
assert(!floodDef.fields.some((f) => f.type === 'date'), '6. Verified Flood susceptibility template has no date fields');

// 7. Coordinates validation
const floodCoordCheck = validateAndCleanDataset([{ ...FLOOD_SAMPLE_VALID[0], 'Latitude': 95.0 }], floodDef);
assert(
  floodCoordCheck.records[0]._issues.some((i) => i.ruleId === 'INVALID_LATITUDE'),
  '7. Latitude 95.0 > 90 flagged as INVALID_LATITUDE error'
);

// 8. Duplicate records
assert(
  floodRes.records[0]._issues.some((i) => i.category === 'DUPLICATE') &&
  floodRes.records[4]._issues.some((i) => i.category === 'DUPLICATE'),
  '8. Duplicate Area of Concern + Barangay Name detected on conflicting rows'
);

// 9. Whitespace normalization
assert(floodRes.records[1]['areaOfConcern'] === 'Riverbank Road', '9. Whitespace trimmed in Area of Concern');

// 10. Leading-zero identifier preservation
assert(
  floodRes.records[1]['barangayCode'] === '00021345' &&
  floodRes.records[1]['municipalityCode'] === '00231' &&
  floodRes.records[1]['geocode'] === 'PH-00-11-22-333',
  '10. Leading zeros preserved in Barangay Code "00021345", Municipality Code "00231", and Geocode "PH-00-11-22-333"'
);

// 11. Unknown categorical value
assert(
  floodRes.records[3]._issues.some((i) => i.ruleId === 'UNRECOGNIZED_CATEGORY' && i.fieldKey === 'susceptibilityRating'),
  '11. Unrecognized Susceptibility Rating "EXTREME_FLOOD" flagged for human REVIEW'
);

// 12. Unrelated template rejection
const floodUnrelated = evaluateTemplateMatch(unrelatedHeaders, floodDef);
assert(floodUnrelated.confidenceScore < 30, `12. Unrelated template rejected (${floodUnrelated.confidenceScore}% < 30%)`);

// 13. Zero data fabrication
assert(floodRes.records[2]['poi'] === '', '13. Unreported POI remains blank');

// =============================================================
// 7. ODeSSEE VULNERABILITY RISK ASSESSMENT
// =============================================================
console.log('\n--- 7. Testing ODeSSEE Vulnerability Risk Assessment ---');
const vraDef = getDatasetById('odessee-vra')!;
const vraHeaders = vraDef.fields.map((f) => f.officialHeader);

// Specific Requirement: Sheet-name independence (detects based on headers, NOT "Tuguegarao")
const vraDetectResult = detectDataset(vraHeaders);
assert(
  vraDetectResult.bestMatch !== null && vraDetectResult.bestMatch.dataset.id === 'odessee-vra',
  '7a. Specific check: Detects VRA dataset based strictly on actual headers, completely independent of worksheet name'
);

// 1. Valid dataset
const vraValidRes = validateAndCleanDataset(VRA_SAMPLE_VALID, vraDef);
assert(vraValidRes.records.length === 1 && vraValidRes.totalErrors === 0 && vraValidRes.records[0]._status === 'VALID', '1. Valid dataset has 0 errors and status VALID');

// 2. Missing required value + Zero fabrication
const vraRes = validateAndCleanDataset(VRA_SAMPLE_ISSUES, vraDef);
assert(
  vraRes.records[2]._issues.some((i) => i.ruleId === 'REQUIRED_FIELD_MISSING' && i.fieldKey === 'geocode') &&
  vraRes.records[2]['geocode'] === '',
  '2. Missing required Geocode flagged as ERROR without fabricating values'
);

// 3. Missing required column
const vraMissingCol = evaluateTemplateMatch(vraHeaders.filter((h) => h !== 'Geocode'), vraDef);
assert(vraMissingCol.missingRequiredColumns.includes('Geocode'), '3. Missing Geocode column detected');

// 4. Extra column
const vraExtraCol = evaluateTemplateMatch([...vraHeaders, 'Risk Index'], vraDef);
assert(vraExtraCol.extraColumns.includes('Risk Index'), '4. Extra column "Risk Index" identified');

// 5. Numeric formatting
assert(vraRes.records[0]['latitude'] === 17.6132, '5. Latitude preserved as float 17.6132');

// 6. Invalid date where applicable
assert(!vraDef.fields.some((f) => f.type === 'date'), '6. Verified VRA template has no date fields');

// 7. Invalid coordinates
assert(
  vraRes.records[3]._issues.some((i) => i.ruleId === 'INVALID_LONGITUDE'),
  '7. Longitude 220.5 > 180 flagged as INVALID_LONGITUDE error'
);

// 8. Duplicate records
assert(
  vraRes.records[0]._issues.some((i) => i.category === 'DUPLICATE') &&
  vraRes.records[4]._issues.some((i) => i.category === 'DUPLICATE'),
  '8. Duplicate Area of Concern + Barangay Name + Purok/Sitio detected on conflicting rows'
);

// 9. Whitespace normalization
assert(
  vraRes.records[1]['areaOfConcern'] === 'Commercial District' &&
  vraRes.records[1]['barangayName'] === 'Centro',
  '9. Whitespace trimmed in Area of Concern and Barangay Name'
);

// 10. Leading-zero identifier preservation
assert(vraRes.records[1]['geocode'] === '00098471', '10. Leading zeros preserved in Geocode "00098471"');

// 11. Unknown categorical value
assert(
  vraRes.records[3]._issues.some((i) => i.ruleId === 'UNRECOGNIZED_CATEGORY' && i.fieldKey === 'susceptibilityRating'),
  '11. Unrecognized Susceptibility Rating "UNKNOWN_RATING" flagged for human REVIEW'
);

// 12. Unrelated template rejection
const vraUnrelated = evaluateTemplateMatch(unrelatedHeaders, vraDef);
assert(vraUnrelated.confidenceScore < 30, `12. Unrelated template rejected (${vraUnrelated.confidenceScore}% < 30%)`);

// 13. Zero data fabrication
assert(vraRes.records[2]['areaOfConcern'] === 'School' && vraRes.records[2]['geocode'] === '', '13. Missing geocode remains strictly empty');

// =============================================================
// SUMMARY
// =============================================================
console.log('\n================================================================');
console.log(`ODeSSEE TEST SUITE RESULTS: ${totalPassedCount} PASSED, ${totalFailedCount} FAILED`);
if (allPassed) {
  console.log('✓ ALL 7 ODeSSEE DATASETS PASSED WITH 100% VALIDATION COMPLIANCE');
} else {
  console.error('✗ SOME ODeSSEE TESTS FAILED');
}
console.log('================================================================');
process.exit(allPassed ? 0 : 1);
