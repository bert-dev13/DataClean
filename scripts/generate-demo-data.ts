import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { getDatasetById } from '../src/lib/templates';
import { validateDataset, applyAllSafeFixes } from '../src/lib/validator/validationEngine';
import { calculateQualityReport } from '../src/lib/validator/readinessCalculator';

export interface AutoFixIssueRecord {
  recordNumber: number; // 1-indexed record number (13 to 21)
  excelRow: number;     // 1-indexed Excel row
  field: string;
  before: string;
  after: string;
  action: string;
  ruleId: string;
}

export interface MustFixIssueRecord {
  recordNumber: number; // 1-indexed record number (22 to 25)
  excelRow: number;     // 1-indexed Excel row
  field: string;
  originalValue: string;
  requiredAction: string;
  ruleId: string;
  blockingReason: string;
}

export interface GeneratorOutput {
  cleanRows: Record<string, any>[];
  autoFixRows: Record<string, any>[];
  autoFixIssues: AutoFixIssueRecord[];
  mustFixIssues: MustFixIssueRecord[];
}

export interface DatasetResult {
  datasetId: string;
  system: 'DBL' | 'ODeSSEE';
  name: string;
  trainingDemoFileName: string;
  folderPath: string;
  cleanFile: string;
  autoFixFile: string;
  expectedFile: string;
  recordCount: number;
  initialValid: number;
  initialAutoFix: number;
  initialError: number;
  afterFixValid: number;
  afterFixCleaned: number;
  afterFixError: number;
  finalValid: number;
  finalError: number;
  readinessTitle: string;
  autoFixIssues: AutoFixIssueRecord[];
  mustFixIssues: MustFixIssueRecord[];
}

function writeWorkbook(
  filePath: string,
  sheetName: string,
  headers: string[],
  rows: Record<string, unknown>[],
  headerRowIndex: number = 1
) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const aoa: any[][] = [];
  if (headerRowIndex === 2) {
    aoa.push(['OFFICIAL TRAINING DATASET - DEMONSTRATION USE ONLY', ...Array(headers.length - 1).fill('')]);
    aoa.push(headers);
  } else {
    aoa.push(headers);
  }

  for (const row of rows) {
    const rowValues = headers.map((h) => {
      const val = row[h];
      return val !== undefined ? val : '';
    });
    aoa.push(rowValues);
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Preserve leading zeros as strings in cells
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = ws[addr];
      if (cell && typeof cell.v === 'string' && /^0\d+$/.test(cell.v)) {
        cell.t = 's';
        cell.w = cell.v;
      }
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filePath);
}

function readWorkbook(filePath: string, headerRowIndex: number = 1) {
  const wb = XLSX.readFile(filePath, { cellDates: true, cellNF: true, raw: false });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const aoa: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', blankrows: false, raw: false });
  const headerRow = aoa[headerRowIndex - 1] || [];
  const headers = headerRow.map((h: any, idx: number) => String(h ?? '').trim() || `Column_${idx + 1}`);
  const rawRows: Record<string, unknown>[] = [];
  for (let r = headerRowIndex; r < aoa.length; r++) {
    const row = aoa[r];
    if (!row) continue;
    const obj: Record<string, unknown> = {};
    headers.forEach((h, cIdx) => {
      obj[h] = row[cIdx] !== undefined ? row[cIdx] : '';
    });
    rawRows.push(obj);
  }
  return { headers, rawRows };
}

// ============================================================================
// 15 DATASET GENERATORS
// ============================================================================

// 1. DBL Business
function genBusiness(): GeneratorOutput {
  const baseRows: Record<string, any>[] = [];
  const streets = ['Rizal Street', 'Mabini Street', 'Bonifacio Street', 'Burgos Street', 'Luna Street', 'Quezon Street', 'Del Pilar Street', 'Bayanihan Road'];
  const brgys = ['Barangay Centro', 'Barangay San Isidro', 'Barangay Riverside', 'Barangay Maligaya', 'Barangay Pag-asa', 'Barangay Mabini', 'Barangay San Fermin', 'Barangay San Nicolas'];

  for (let i = 1; i <= 25; i++) {
    const pad = String(i).padStart(2, '0');
    baseRows.push({
      'Line of Business (DTI)': i % 2 === 0 ? 'Retail sale of food' : 'Real estate activities',
      'DTI Sub Category': i % 2 === 0 ? 'Convenience store' : 'Commercial leasing',
      'PSIC Sub-Class Code': i < 10 ? `0471${i}` : `4711${i % 10}`,
      'Business Trade Name': `ESTABLISHMENT DELTA ${pad}`,
      'Street': `${streets[(i - 1) % streets.length]} ${i}`,
      'Purok': `Purok ${((i - 1) % 4) + 1}`,
      'Barangay': brgys[(i - 1) % brgys.length],
      'Latitude': Number((16.6910 + (i * 0.0011)).toFixed(4)),
      'Longitude': Number((121.5510 + (i * 0.0011)).toFixed(4)),
      'Registration Date (mm/dd/yy)': `2024-0${((i % 8) + 1)}-15`,
      'Permit Status': i % 3 === 0 ? 'New' : 'Renewal',
      'Gross Sales': 250000 + (i * 15000),
      'Total Male Employees': (i % 4) + 1,
      'Total Female Employees': (i % 5) + 1,
    });
  }

  const cleanRows = baseRows.map((r) => ({ ...r }));
  const autoFixRows = baseRows.map((r) => ({ ...r }));

  const fixConfigs = [
    { idx: 12, rec: 13, field: 'Gross Sales', val: '₱320,000.00', orig: 320000, act: 'Stripped currency symbol and comma formatting to 320000', rule: 'STRIP_CURRENCY' },
    { idx: 13, rec: 14, field: 'Permit Status', val: 'renewal', orig: 'Renewal', act: 'Normalized category casing to official standard "Renewal"', rule: 'NORMALIZE_CATEGORY_CASE' },
    { idx: 14, rec: 15, field: 'Street', val: '  Rizal   Street  ', orig: 'Rizal Street 15', act: 'Trimmed and collapsed repeated spaces', rule: 'COLLAPSE_WHITESPACE' },
    { idx: 15, rec: 16, field: 'Business Trade Name', val: `  ${baseRows[15]['Business Trade Name']}  `, orig: baseRows[15]['Business Trade Name'], act: 'Trimmed leading/trailing whitespace', rule: 'TRIM_WHITESPACE' },
    { idx: 16, rec: 17, field: 'Gross Sales', val: '₱450,000.00', orig: 450000, act: 'Stripped currency symbol and formatting to 450000', rule: 'STRIP_CURRENCY' },
    { idx: 17, rec: 18, field: 'Registration Date (mm/dd/yy)', val: '05/30/2024', orig: '2024-05-30', act: 'Normalized MM/DD/YYYY to ISO date YYYY-MM-DD', rule: 'NORMALIZE_DATE' },
    { idx: 18, rec: 19, field: 'Permit Status', val: 'new', orig: 'New', act: 'Normalized category casing to official standard "New"', rule: 'NORMALIZE_CATEGORY_CASE' },
    { idx: 19, rec: 20, field: 'Barangay', val: `  ${baseRows[19]['Barangay']}  `, orig: baseRows[19]['Barangay'], act: 'Trimmed leading/trailing spaces', rule: 'TRIM_WHITESPACE' },
    { idx: 20, rec: 21, field: 'Purok', val: 'Purok IV', orig: 'Purok 4', act: 'Standardized Roman numeral Purok IV to Arabic Purok 4', rule: 'PUROK_ROMAN_NUMERAL' },
  ];

  const autoFixIssues: AutoFixIssueRecord[] = [];
  for (const c of fixConfigs) {
    autoFixRows[c.idx][c.field] = c.val;
    cleanRows[c.idx][c.field] = c.orig;
    autoFixIssues.push({
      recordNumber: c.rec,
      excelRow: c.idx + 2,
      field: c.field,
      before: String(c.val),
      after: String(c.orig),
      action: c.act,
      ruleId: c.rule,
    });
  }

  // Rows 22-25: Must Be Fixed
  autoFixRows[21]['Business Trade Name'] = '';
  autoFixRows[22]['Gross Sales'] = -250000;
  autoFixRows[23]['Business Trade Name'] = 'ESTABLISHMENT DELTA DUP';
  autoFixRows[23]['Street'] = 'Maharlika Highway 24';
  autoFixRows[23]['Barangay'] = 'Barangay Centro';
  autoFixRows[24]['Business Trade Name'] = 'ESTABLISHMENT DELTA DUP';
  autoFixRows[24]['Street'] = 'Maharlika Highway 24';
  autoFixRows[24]['Barangay'] = 'Barangay Centro';

  const mustFixIssues: MustFixIssueRecord[] = [
    {
      recordNumber: 22,
      excelRow: 23,
      field: 'Business Trade Name',
      originalValue: '(blank)',
      requiredAction: 'User must enter official registered business trade name.',
      ruleId: 'REQUIRED_FIELD_MISSING',
      blockingReason: 'Business permit cannot be issued to an anonymous enterprise; missing name blocks registry ingestion.',
    },
    {
      recordNumber: 23,
      excelRow: 24,
      field: 'Gross Sales',
      originalValue: '-250000',
      requiredAction: 'User must review financial declaration and enter positive gross sales figure.',
      ruleId: 'NEGATIVE_NUMBER_NOT_ALLOWED',
      blockingReason: 'Reported commercial gross receipts cannot be negative.',
    },
    {
      recordNumber: 24,
      excelRow: 25,
      field: 'Business Trade Name + Street + Barangay',
      originalValue: 'ESTABLISHMENT DELTA DUP | Maharlika Highway 24 | Barangay Centro',
      requiredAction: 'User must verify if distinct physical branch or merge/remove duplicate record.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Duplicate trade name at identical municipal address creates duplicate tax rolls.',
    },
    {
      recordNumber: 25,
      excelRow: 26,
      field: 'Business Trade Name + Street + Barangay',
      originalValue: 'ESTABLISHMENT DELTA DUP | Maharlika Highway 24 | Barangay Centro',
      requiredAction: 'User must verify if distinct physical branch or merge/remove duplicate record.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Duplicate trade name at identical municipal address creates duplicate tax rolls.',
    },
  ];

  return { cleanRows, autoFixRows, autoFixIssues, mustFixIssues };
}

// 2. DBL Crime
function genCrime(): GeneratorOutput {
  const baseRows: Record<string, any>[] = [];
  const brgys = ['Barangay Centro', 'Barangay San Isidro', 'Barangay Riverside', 'Barangay Maligaya', 'Barangay Pag-asa', 'Barangay Mabini', 'Barangay San Fermin', 'Barangay San Nicolas'];
  for (let i = 1; i <= 25; i++) {
    const pad = String(i).padStart(3, '0');
    const day = String(13 + ((i - 1) % 15)).padStart(2, '0');
    baseRows.push({
      'Blotter Number': `BLT-2026-000${pad}`,
      'Datetime Reported': `2026-02-${day} 16:00:00`,
      'Datetime Committed': `2026-02-${day} 10:00:00`,
      'Sub Violation': i % 2 === 0 ? 'Barangay Ordinance Violation' : 'Civil Dispute Conciliation',
      'PSCCS Sub-Class Code': i < 10 ? `08012${i}` : `80120${i % 10}`,
      'Violation Name': i % 2 === 0 ? 'Noise Disturbance' : 'Property Boundary Dispute',
      'Complainant Gender': i % 2 === 0 ? 'Male' : 'Female',
      'Respondent Gender': i % 2 === 0 ? 'Female' : 'Male',
      'Street': `Rizal Street ${i}`,
      'Purok': `Purok ${((i - 1) % 4) + 1}`,
      'Barangay': brgys[(i - 1) % brgys.length],
      'Latitude': Number((16.6910 + (i * 0.0011)).toFixed(4)),
      'Longitude': Number((121.5512 + (i * 0.0011)).toFixed(4)),
    });
  }

  const cleanRows = baseRows.map((r) => ({ ...r }));
  const autoFixRows = baseRows.map((r) => ({ ...r }));

  const fixConfigs = [
    { idx: 12, rec: 13, field: 'Blotter Number', val: `  ${baseRows[12]['Blotter Number']}  `, orig: baseRows[12]['Blotter Number'], act: 'Trimmed surrounding whitespace', rule: 'TRIM_WHITESPACE' },
    { idx: 13, rec: 14, field: 'Complainant Gender', val: 'male', orig: 'Male', act: 'Normalized gender casing to "Male"', rule: 'NORMALIZE_CATEGORY_CASE' },
    { idx: 14, rec: 15, field: 'Respondent Gender', val: 'female', orig: 'Female', act: 'Normalized gender casing to "Female"', rule: 'NORMALIZE_CATEGORY_CASE' },
    { idx: 15, rec: 16, field: 'Street', val: '  Rizal   Street   ', orig: 'Rizal Street 16', act: 'Collapsed internal spaces', rule: 'COLLAPSE_WHITESPACE' },
    { idx: 16, rec: 17, field: 'Datetime Reported', val: '02/14/2026 16:00:00', orig: '2026-02-14 16:00:00', act: 'Normalized MM/DD/YYYY datetime to ISO', rule: 'NORMALIZE_DATETIME' },
    { idx: 17, rec: 18, field: 'Datetime Committed', val: '02/15/2026 10:00:00', orig: '2026-02-15 10:00:00', act: 'Normalized MM/DD/YYYY datetime to ISO', rule: 'NORMALIZE_DATETIME' },
    { idx: 18, rec: 19, field: 'Barangay', val: `  ${baseRows[18]['Barangay']}  `, orig: baseRows[18]['Barangay'], act: 'Trimmed leading/trailing spaces', rule: 'TRIM_WHITESPACE' },
    { idx: 19, rec: 20, field: 'Violation Name', val: '  Noise   Disturbance  ', orig: 'Noise Disturbance', act: 'Trimmed and collapsed whitespace', rule: 'COLLAPSE_WHITESPACE' },
    { idx: 20, rec: 21, field: 'Purok', val: 'Purok III', orig: 'Purok 3', act: 'Standardized Roman numeral Purok III to Arabic Purok 3', rule: 'PUROK_ROMAN_NUMERAL' },
  ];

  const autoFixIssues: AutoFixIssueRecord[] = [];
  for (const c of fixConfigs) {
    autoFixRows[c.idx][c.field] = c.val;
    cleanRows[c.idx][c.field] = c.orig;
    autoFixIssues.push({
      recordNumber: c.rec,
      excelRow: c.idx + 2,
      field: c.field,
      before: String(c.val),
      after: String(c.orig),
      action: c.act,
      ruleId: c.rule,
    });
  }

  // Rows 22-25: Must Be Fixed
  autoFixRows[21]['Blotter Number'] = '';
  autoFixRows[22]['Latitude'] = -95.5;
  autoFixRows[23]['Blotter Number'] = 'BLT-2026-000999';
  autoFixRows[24]['Blotter Number'] = 'BLT-2026-000999';

  const mustFixIssues: MustFixIssueRecord[] = [
    {
      recordNumber: 22,
      excelRow: 23,
      field: 'Blotter Number',
      originalValue: '(blank)',
      requiredAction: 'User must input official police blotter incident tracking code.',
      ruleId: 'REQUIRED_FIELD_MISSING',
      blockingReason: 'Police blotter entry without incident tracking code is invalid in justice records.',
    },
    {
      recordNumber: 23,
      excelRow: 24,
      field: 'Latitude',
      originalValue: '-95.5',
      requiredAction: 'User must verify incident GPS coordinate and enter valid latitude between -90 and 90.',
      ruleId: 'INVALID_LATITUDE',
      blockingReason: 'Coordinate exceeds mathematical range (-90 to 90) and blocks GIS mapping.',
    },
    {
      recordNumber: 24,
      excelRow: 25,
      field: 'Blotter Number',
      originalValue: 'BLT-2026-000999',
      requiredAction: 'User must resolve conflicting blotter records and remove duplicate.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Blotter numbers must uniquely identify single police incidents.',
    },
    {
      recordNumber: 25,
      excelRow: 26,
      field: 'Blotter Number',
      originalValue: 'BLT-2026-000999',
      requiredAction: 'User must resolve conflicting blotter records and remove duplicate.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Blotter numbers must uniquely identify single police incidents.',
    },
  ];

  return { cleanRows, autoFixRows, autoFixIssues, mustFixIssues };
}

// 3. DBL Human Resource
function genHumanResource(): GeneratorOutput {
  const baseRows: Record<string, any>[] = [];
  const brgys = ['Barangay San Isidro', 'Barangay Mabini', 'Barangay Centro', 'Barangay Maligaya', 'Barangay Pag-asa', 'Barangay Riverside', 'Barangay San Fermin', 'Barangay San Nicolas'];
  for (let i = 1; i <= 25; i++) {
    const pad = String(i).padStart(3, '0');
    baseRows.push({
      'Student Number': `00098${pad}`,
      'Gender': i % 2 === 0 ? 'Female' : 'Male',
      'Street': `Mabini Street ${i}`,
      'Purok': `Purok ${((i - 1) % 4) + 1}`,
      'Barangay': brgys[(i - 1) % brgys.length],
      'School': i % 2 === 0 ? 'University of La Salette' : 'Isabela State University',
      'Course': i % 2 === 0 ? 'BS Nursing' : 'BS Information Technology',
      'Graduation Year': 2024 + (i % 3),
    });
  }

  const cleanRows = baseRows.map((r) => ({ ...r }));
  const autoFixRows = baseRows.map((r) => ({ ...r }));

  const fixConfigs = [
    { idx: 12, rec: 13, field: 'Student Number', val: `  ${baseRows[12]['Student Number']}  `, orig: baseRows[12]['Student Number'], act: 'Trimmed whitespace while keeping leading zeros', rule: 'TRIM_WHITESPACE' },
    { idx: 13, rec: 14, field: 'Gender', val: 'male', orig: 'Male', act: 'Normalized gender casing to "Male"', rule: 'NORMALIZE_CATEGORY_CASE' },
    { idx: 14, rec: 15, field: 'Graduation Year', val: ' 2026 ', orig: 2026, act: 'Casts whitespace-padded string to integer 2026', rule: 'CONVERT_TO_NUMBER' },
    { idx: 15, rec: 16, field: 'School', val: '  Isabela   State   University  ', orig: 'Isabela State University', act: 'Collapsed redundant whitespace', rule: 'COLLAPSE_WHITESPACE' },
    { idx: 16, rec: 17, field: 'Course', val: '  BS   Information   Technology  ', orig: 'BS Information Technology', act: 'Collapsed internal spaces', rule: 'COLLAPSE_WHITESPACE' },
    { idx: 17, rec: 18, field: 'Gender', val: 'female', orig: 'Female', act: 'Normalized gender casing to "Female"', rule: 'NORMALIZE_CATEGORY_CASE' },
    { idx: 18, rec: 19, field: 'Street', val: '  Mabini   Street  ', orig: 'Mabini Street 19', act: 'Trimmed and collapsed spaces', rule: 'COLLAPSE_WHITESPACE' },
    { idx: 19, rec: 20, field: 'Barangay', val: `  ${baseRows[19]['Barangay']}  `, orig: baseRows[19]['Barangay'], act: 'Trimmed leading/trailing spaces', rule: 'TRIM_WHITESPACE' },
    { idx: 20, rec: 21, field: 'Purok', val: 'Purok II', orig: 'Purok 2', act: 'Standardized Roman numeral Purok II to Arabic Purok 2', rule: 'PUROK_ROMAN_NUMERAL' },
  ];

  const autoFixIssues: AutoFixIssueRecord[] = [];
  for (const c of fixConfigs) {
    autoFixRows[c.idx][c.field] = c.val;
    cleanRows[c.idx][c.field] = c.orig;
    autoFixIssues.push({
      recordNumber: c.rec,
      excelRow: c.idx + 2,
      field: c.field,
      before: String(c.val),
      after: String(c.orig),
      action: c.act,
      ruleId: c.rule,
    });
  }

  // Rows 22-25: Must Be Fixed
  autoFixRows[21]['Student Number'] = '';
  autoFixRows[22]['Graduation Year'] = 1940;
  autoFixRows[23]['Student Number'] = '00098999';
  autoFixRows[24]['Student Number'] = '00098999';

  const mustFixIssues: MustFixIssueRecord[] = [
    {
      recordNumber: 22,
      excelRow: 23,
      field: 'Student Number',
      originalValue: '(blank)',
      requiredAction: 'User must enter official student ID number.',
      ruleId: 'REQUIRED_FIELD_MISSING',
      blockingReason: 'Student profile cannot be ingested into scholarship registry without identifier.',
    },
    {
      recordNumber: 23,
      excelRow: 24,
      field: 'Graduation Year',
      originalValue: '1940',
      requiredAction: 'User must verify student record and enter valid calendar graduation year (1950–2050).',
      ruleId: 'INVALID_GRADUATION_YEAR',
      blockingReason: 'Year 1940 falls outside the municipal higher-education operational range.',
    },
    {
      recordNumber: 24,
      excelRow: 25,
      field: 'Student Number',
      originalValue: '00098999',
      requiredAction: 'User must verify student identity and remove duplicate entry.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Duplicate student records cause double-counting in municipal education statistics.',
    },
    {
      recordNumber: 25,
      excelRow: 26,
      field: 'Student Number',
      originalValue: '00098999',
      requiredAction: 'User must verify student identity and remove duplicate entry.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Duplicate student records cause double-counting in municipal education statistics.',
    },
  ];

  return { cleanRows, autoFixRows, autoFixIssues, mustFixIssues };
}

// 4. DBL Power
function genPower(): GeneratorOutput {
  const baseRows: Record<string, any>[] = [];
  const types = ['Residential', 'Commercial - LV', 'Industrial', 'General Service', 'Public Building - HV'];
  const brgys = ['Barangay Centro', 'Barangay San Isidro', 'Barangay Riverside', 'Barangay Maligaya', 'Barangay Pag-asa', 'Barangay Mabini', 'Barangay San Fermin', 'Barangay San Nicolas'];
  for (let i = 1; i <= 25; i++) {
    const pad = String(i).padStart(3, '0');
    baseRows.push({
      'Account Number': `00029${pad}`,
      'Type': types[(i - 1) % types.length],
      'Consumption': 150.0 + (i * 25.5),
      'Street': `National Road ${i}`,
      'Purok': `Purok ${((i - 1) % 4) + 1}`,
      'Barangay': brgys[(i - 1) % brgys.length],
      'Billing Date': '2026-01-30',
    });
  }

  const cleanRows = baseRows.map((r) => ({ ...r }));
  const autoFixRows = baseRows.map((r) => ({ ...r }));

  const fixConfigs = [
    { idx: 12, rec: 13, field: 'Consumption', val: ' 350.2 kwh ', orig: 350.2, act: 'Strips "kwh" suffix and whitespace to float 350.2', rule: 'REMOVE_UNIT' },
    { idx: 13, rec: 14, field: 'Billing Date', val: '01/30/2026', orig: '2026-01-30', act: 'Normalizes MM/DD/YYYY to ISO date YYYY-MM-DD', rule: 'NORMALIZE_DATE' },
    { idx: 14, rec: 15, field: 'Account Number', val: `  ${baseRows[14]['Account Number']}  `, orig: baseRows[14]['Account Number'], act: 'Trims whitespace while preserving leading zeros', rule: 'TRIM_WHITESPACE' },
    { idx: 15, rec: 16, field: 'Consumption', val: '210.5 kwh', orig: 210.5, act: 'Strips "kwh" unit suffix to float 210.5', rule: 'REMOVE_UNIT' },
    { idx: 16, rec: 17, field: 'Street', val: '  National   Road  ', orig: 'National Road 17', act: 'Collapsed internal whitespace', rule: 'COLLAPSE_WHITESPACE' },
    { idx: 17, rec: 18, field: 'Billing Date', val: '03/30/2026', orig: '2026-03-30', act: 'Normalizes slashed date to ISO date', rule: 'NORMALIZE_DATE' },
    { idx: 18, rec: 19, field: 'Consumption', val: ' 420.0 kwh ', orig: 420.0, act: 'Strips "kwh" unit suffix to float 420.0', rule: 'REMOVE_UNIT' },
    { idx: 19, rec: 20, field: 'Barangay', val: `  ${baseRows[19]['Barangay']}  `, orig: baseRows[19]['Barangay'], act: 'Trimmed whitespace from barangay', rule: 'TRIM_WHITESPACE' },
    { idx: 20, rec: 21, field: 'Purok', val: 'Purok I', orig: 'Purok 1', act: 'Standardized Roman numeral Purok I to Arabic Purok 1', rule: 'PUROK_ROMAN_NUMERAL' },
  ];

  const autoFixIssues: AutoFixIssueRecord[] = [];
  for (const c of fixConfigs) {
    autoFixRows[c.idx][c.field] = c.val;
    cleanRows[c.idx][c.field] = c.orig;
    autoFixIssues.push({
      recordNumber: c.rec,
      excelRow: c.idx + 2,
      field: c.field,
      before: String(c.val),
      after: String(c.orig),
      action: c.act,
      ruleId: c.rule,
    });
  }

  // Rows 22-25: Must Be Fixed
  autoFixRows[21]['Account Number'] = '';
  autoFixRows[22]['Consumption'] = -150.5;
  autoFixRows[23]['Account Number'] = '00029999';
  autoFixRows[24]['Account Number'] = '00029999';
  autoFixRows[24]['Billing Date'] = autoFixRows[23]['Billing Date'];

  const mustFixIssues: MustFixIssueRecord[] = [
    {
      recordNumber: 22,
      excelRow: 23,
      field: 'Account Number',
      originalValue: '(blank)',
      requiredAction: 'User must enter customer electric utility account number.',
      ruleId: 'REQUIRED_FIELD_MISSING',
      blockingReason: 'Power billing record without customer account cannot be linked to utility meter.',
    },
    {
      recordNumber: 23,
      excelRow: 24,
      field: 'Consumption',
      originalValue: '-150.5',
      requiredAction: 'User must inspect meter log and enter positive power consumption in kWh.',
      ruleId: 'NEGATIVE_NUMBER_NOT_ALLOWED',
      blockingReason: 'Electric energy consumption cannot be negative.',
    },
    {
      recordNumber: 24,
      excelRow: 25,
      field: 'Account Number + Billing Date',
      originalValue: '00029999 | 2026-01-30',
      requiredAction: 'User must verify billing statement cycle and deduplicate.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Same meter cannot be billed twice for the identical billing period.',
    },
    {
      recordNumber: 25,
      excelRow: 26,
      field: 'Account Number + Billing Date',
      originalValue: '00029999 | 2026-01-30',
      requiredAction: 'User must verify billing statement cycle and deduplicate.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Same meter cannot be billed twice for the identical billing period.',
    },
  ];

  return { cleanRows, autoFixRows, autoFixIssues, mustFixIssues };
}

// 5. DBL Residential
function genResidential(): GeneratorOutput {
  const baseRows: Record<string, any>[] = [];
  const brgys = ['Barangay San Isidro', 'Barangay Riverside', 'Barangay Centro', 'Barangay Maligaya', 'Barangay Pag-asa', 'Barangay Mabini', 'Barangay San Fermin', 'Barangay San Nicolas'];
  for (let i = 1; i <= 25; i++) {
    const pad = String(i).padStart(3, '0');
    baseRows.push({
      'CBMS Number': `00049${pad}`,
      'Gender': i % 2 === 0 ? 'Female' : 'Male',
      'Birth Date': `198${(i % 9)}-08-23`,
      'House No': `${i * 3}-A`,
      'Street': `Burgos Street ${i}`,
      'Purok': `Purok ${((i - 1) % 4) + 1}`,
      'Barangay': brgys[(i - 1) % brgys.length],
    });
  }

  const cleanRows = baseRows.map((r) => ({ ...r }));
  const autoFixRows = baseRows.map((r) => ({ ...r }));

  const fixConfigs = [
    { idx: 12, rec: 13, field: 'CBMS Number', val: `  ${baseRows[12]['CBMS Number']}  `, orig: baseRows[12]['CBMS Number'], act: 'Trimmed whitespace while keeping leading zeros', rule: 'TRIM_WHITESPACE' },
    { idx: 13, rec: 14, field: 'Gender', val: 'female', orig: 'Female', act: 'Normalized gender casing to "Female"', rule: 'NORMALIZE_CATEGORY_CASE' },
    { idx: 14, rec: 15, field: 'Birth Date', val: '08/23/1985', orig: '1985-08-23', act: 'Normalizes MM/DD/YYYY slashed date to ISO YYYY-MM-DD', rule: 'NORMALIZE_DATE' },
    { idx: 15, rec: 16, field: 'House No', val: '  15-A  ', orig: '15-A', act: 'Trimmed whitespace from alphanumeric house number', rule: 'TRIM_WHITESPACE' },
    { idx: 16, rec: 17, field: 'Street', val: '  Burgos   Street  ', orig: 'Burgos Street 17', act: 'Collapsed internal spaces', rule: 'COLLAPSE_WHITESPACE' },
    { idx: 17, rec: 18, field: 'Gender', val: 'male', orig: 'Male', act: 'Normalized casing to "Male"', rule: 'NORMALIZE_CATEGORY_CASE' },
    { idx: 18, rec: 19, field: 'Birth Date', val: '05/12/1988', orig: '1988-05-12', act: 'Normalizes slashed date to standard ISO date', rule: 'NORMALIZE_DATE' },
    { idx: 19, rec: 20, field: 'Barangay', val: `  ${baseRows[19]['Barangay']}  `, orig: baseRows[19]['Barangay'], act: 'Trimmed leading/trailing spaces', rule: 'TRIM_WHITESPACE' },
    { idx: 20, rec: 21, field: 'Purok', val: 'Purok IV', orig: 'Purok 4', act: 'Standardized Roman numeral Purok IV to Arabic Purok 4', rule: 'PUROK_ROMAN_NUMERAL' },
  ];

  const autoFixIssues: AutoFixIssueRecord[] = [];
  for (const c of fixConfigs) {
    autoFixRows[c.idx][c.field] = c.val;
    cleanRows[c.idx][c.field] = c.orig;
    autoFixIssues.push({
      recordNumber: c.rec,
      excelRow: c.idx + 2,
      field: c.field,
      before: String(c.val),
      after: String(c.orig),
      action: c.act,
      ruleId: c.rule,
    });
  }

  // Rows 22-25: Must Be Fixed
  autoFixRows[21]['CBMS Number'] = '';
  autoFixRows[22]['Birth Date'] = '2035-01-01';
  autoFixRows[23]['CBMS Number'] = '00049999';
  autoFixRows[24]['CBMS Number'] = '00049999';

  const mustFixIssues: MustFixIssueRecord[] = [
    {
      recordNumber: 22,
      excelRow: 23,
      field: 'CBMS Number',
      originalValue: '(blank)',
      requiredAction: 'User must enter official CBMS household census number.',
      ruleId: 'REQUIRED_FIELD_MISSING',
      blockingReason: 'Household record cannot be registered without CBMS enumeration ID.',
    },
    {
      recordNumber: 23,
      excelRow: 24,
      field: 'Birth Date',
      originalValue: '2035-01-01',
      requiredAction: 'User must enter valid historical birth date.',
      ruleId: 'DATE_CANNOT_BE_FUTURE',
      blockingReason: 'Citizen birth date cannot be in the future.',
    },
    {
      recordNumber: 24,
      excelRow: 25,
      field: 'CBMS Number',
      originalValue: '00049999',
      requiredAction: 'User must verify household member roster and deduplicate census profile.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Duplicate census ID corrupts demographic population counts.',
    },
    {
      recordNumber: 25,
      excelRow: 26,
      field: 'CBMS Number',
      originalValue: '00049999',
      requiredAction: 'User must verify household member roster and deduplicate census profile.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Duplicate census ID corrupts demographic population counts.',
    },
  ];

  return { cleanRows, autoFixRows, autoFixIssues, mustFixIssues };
}

// 6. DBL Telecommunication Towers
function genTelecommunication(): GeneratorOutput {
  const baseRows: Record<string, any>[] = [];
  const providers = ['Globe Telecom', 'Smart Communications', 'DITO Telecommunity', 'Converge ICT'];
  const types = ['Self-Supporting', 'Monopole', 'Guyed Tower', 'Rooftop'];
  const brgys = ['Barangay San Isidro', 'Barangay Mabini', 'Barangay Centro', 'Barangay Maligaya', 'Barangay Pag-asa', 'Barangay Riverside', 'Barangay San Fermin', 'Barangay San Nicolas'];

  for (let i = 1; i <= 25; i++) {
    const pad = String(i).padStart(3, '0');
    baseRows.push({
      'Provider Name': providers[(i - 1) % providers.length],
      'Tower Name': `Telecommunication Mast ${pad}`,
      'Tower Code': `0098${pad}`,
      'Purok': `Purok ${((i - 1) % 4) + 1}`,
      'Barangay': brgys[(i - 1) % brgys.length],
      'Location Address': `Commercial Zone Site ${i}`,
      'Latitude': Number((16.6915 + (i * 0.0012)).toFixed(4)),
      'Longitude': Number((121.5515 + (i * 0.0012)).toFixed(4)),
      'Tower Type': types[(i - 1) % types.length],
      'Network Technology': '4G / 5G LTE',
      'Tower Height': 25.0 + (i * 2.0),
      'Ownership Type': i % 2 === 0 ? 'Provider-owned' : 'Shared',
      'Status': 'Operational',
      'Installation Date': '2021-05-10',
    });
  }

  const cleanRows = baseRows.map((r) => ({ ...r }));
  const autoFixRows = baseRows.map((r) => ({ ...r }));

  const fixConfigs = [
    { idx: 12, rec: 13, field: 'Tower Height', val: '45.5 m', orig: 45.5, act: 'Strips "m" unit suffix to numeric float 45.5', rule: 'REMOVE_UNIT' },
    { idx: 13, rec: 14, field: 'Installation Date', val: '07/14/2021', orig: '2021-07-14', act: 'Normalizes slashed date to ISO YYYY-MM-DD', rule: 'NORMALIZE_DATE' },
    { idx: 14, rec: 15, field: 'Tower Code', val: `  ${baseRows[14]['Tower Code']}  `, orig: baseRows[14]['Tower Code'], act: 'Trims whitespace while preserving leading zeros', rule: 'TRIM_WHITESPACE' },
    { idx: 15, rec: 16, field: 'Location Address', val: '  Commercial   Zone   Site  ', orig: 'Commercial Zone Site 16', act: 'Collapsed internal whitespace', rule: 'COLLAPSE_WHITESPACE' },
    { idx: 16, rec: 17, field: 'Tower Height', val: '35.0 m', orig: 35.0, act: 'Strips "m" unit suffix to float 35.0', rule: 'REMOVE_UNIT' },
    { idx: 17, rec: 18, field: 'Installation Date', val: '11/18/2022', orig: '2022-11-18', act: 'Normalizes MM/DD/YYYY to ISO date', rule: 'NORMALIZE_DATE' },
    { idx: 18, rec: 19, field: 'Provider Name', val: '  Smart Communications  ', orig: 'Smart Communications', act: 'Trimmed leading/trailing spaces', rule: 'TRIM_WHITESPACE' },
    { idx: 19, rec: 20, field: 'Barangay', val: `  ${baseRows[19]['Barangay']}  `, orig: baseRows[19]['Barangay'], act: 'Trimmed whitespace from barangay', rule: 'TRIM_WHITESPACE' },
    { idx: 20, rec: 21, field: 'Purok', val: 'Purok III', orig: 'Purok 3', act: 'Standardized Roman numeral Purok III to Arabic Purok 3', rule: 'PUROK_ROMAN_NUMERAL' },
  ];

  const autoFixIssues: AutoFixIssueRecord[] = [];
  for (const c of fixConfigs) {
    autoFixRows[c.idx][c.field] = c.val;
    cleanRows[c.idx][c.field] = c.orig;
    autoFixIssues.push({
      recordNumber: c.rec,
      excelRow: c.idx + 2,
      field: c.field,
      before: String(c.val),
      after: String(c.orig),
      action: c.act,
      ruleId: c.rule,
    });
  }

  // Rows 22-25: Must Be Fixed
  autoFixRows[21]['Tower Code'] = '';
  autoFixRows[22]['Tower Height'] = -45.0;
  autoFixRows[23]['Tower Code'] = '0098999';
  autoFixRows[24]['Tower Code'] = '0098999';

  const mustFixIssues: MustFixIssueRecord[] = [
    {
      recordNumber: 22,
      excelRow: 23,
      field: 'Tower Code',
      originalValue: '(blank)',
      requiredAction: 'User must enter telecommunication infrastructure asset code.',
      ruleId: 'REQUIRED_FIELD_MISSING',
      blockingReason: 'Asset registry cannot log tower without unique physical infrastructure ID.',
    },
    {
      recordNumber: 23,
      excelRow: 24,
      field: 'Tower Height',
      originalValue: '-45.0',
      requiredAction: 'User must measure and enter positive tower mast height in meters.',
      ruleId: 'NEGATIVE_NUMBER_NOT_ALLOWED',
      blockingReason: 'Physical elevation height cannot be negative.',
    },
    {
      recordNumber: 24,
      excelRow: 25,
      field: 'Tower Code',
      originalValue: '0098999',
      requiredAction: 'User must verify cellular site and deduplicate asset entry.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Duplicate tower code corrupts regional network coverage maps.',
    },
    {
      recordNumber: 25,
      excelRow: 26,
      field: 'Tower Code',
      originalValue: '0098999',
      requiredAction: 'User must verify cellular site and deduplicate asset entry.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Duplicate tower code corrupts regional network coverage maps.',
    },
  ];

  return { cleanRows, autoFixRows, autoFixIssues, mustFixIssues };
}

// 7. DBL Transportation
function genTransportation(): GeneratorOutput {
  const baseRows: Record<string, any>[] = [];
  const types = ['PUJ', 'Tricycle', 'UV Express', 'Jeepney', 'Bus'];
  for (let i = 1; i <= 25; i++) {
    baseRows.push({
      'Route': `Transport Route Segment ${i}`,
      'Available Units': 15 + (i * 2),
      'Vehicle Type': types[(i - 1) % types.length],
      'Barangays Covered by Route': `Barangay ${((i - 1) % 5) + 1}, Barangay ${((i % 5) + 1)}`,
      'Puroks Covered by Route': 'Purok 1, Purok 2',
    });
  }

  const cleanRows = baseRows.map((r) => ({ ...r }));
  const autoFixRows = baseRows.map((r) => ({ ...r }));

  const fixConfigs = [
    { idx: 12, rec: 13, field: 'Route', val: `  ${baseRows[12]['Route']}  `, orig: baseRows[12]['Route'], act: 'Trimmed surrounding whitespace', rule: 'TRIM_WHITESPACE' },
    { idx: 13, rec: 14, field: 'Available Units', val: ' 25 ', orig: 25, act: 'Casts whitespace-padded string to integer 25', rule: 'CONVERT_TO_NUMBER' },
    { idx: 14, rec: 15, field: 'Puroks Covered by Route', val: 'Purok 1,   Purok 2', orig: 'Purok 1, Purok 2', act: 'Collapsed redundant whitespace', rule: 'COLLAPSE_WHITESPACE' },
    { idx: 15, rec: 16, field: 'Vehicle Type', val: '  Jeepney  ', orig: 'Jeepney', act: 'Trimmed whitespace from vehicle type', rule: 'TRIM_WHITESPACE' },
    { idx: 16, rec: 17, field: 'Route', val: '  Mabini   -   Public   Market   Loop  ', orig: 'Mabini - Public Market Loop', act: 'Collapsed internal whitespace', rule: 'COLLAPSE_WHITESPACE' },
    { idx: 17, rec: 18, field: 'Available Units', val: ' 40 ', orig: 40, act: 'Casts padded string to integer 40', rule: 'CONVERT_TO_NUMBER' },
    { idx: 18, rec: 19, field: 'Barangays Covered by Route', val: '  Barangay Centro,   Barangay Riverside  ', orig: 'Barangay Centro, Barangay Riverside', act: 'Trimmed and normalized whitespace', rule: 'COLLAPSE_WHITESPACE' },
    { idx: 19, rec: 20, field: 'Vehicle Type', val: '  Tricycle  ', orig: 'Tricycle', act: 'Trimmed whitespace', rule: 'TRIM_WHITESPACE' },
    { idx: 20, rec: 21, field: 'Available Units', val: ' 18 ', orig: 18, act: 'Casts string count to integer 18', rule: 'CONVERT_TO_NUMBER' },
  ];

  const autoFixIssues: AutoFixIssueRecord[] = [];
  for (const c of fixConfigs) {
    autoFixRows[c.idx][c.field] = c.val;
    cleanRows[c.idx][c.field] = c.orig;
    autoFixIssues.push({
      recordNumber: c.rec,
      excelRow: c.idx + 2,
      field: c.field,
      before: String(c.val),
      after: String(c.orig),
      action: c.act,
      ruleId: c.rule,
    });
  }

  // Rows 22-25: Must Be Fixed
  autoFixRows[21]['Route'] = '';
  autoFixRows[22]['Available Units'] = -10;
  autoFixRows[23]['Route'] = 'Duplicate Route Loop';
  autoFixRows[23]['Vehicle Type'] = 'Jeepney';
  autoFixRows[24]['Route'] = 'Duplicate Route Loop';
  autoFixRows[24]['Vehicle Type'] = 'Jeepney';

  const mustFixIssues: MustFixIssueRecord[] = [
    {
      recordNumber: 22,
      excelRow: 23,
      field: 'Route',
      originalValue: '(blank)',
      requiredAction: 'User must enter official franchise transport route description.',
      ruleId: 'REQUIRED_FIELD_MISSING',
      blockingReason: 'Public transport franchise record must specify an authorized route.',
    },
    {
      recordNumber: 23,
      excelRow: 24,
      field: 'Available Units',
      originalValue: '-10',
      requiredAction: 'User must enter positive count of authorized operating vehicles.',
      ruleId: 'NEGATIVE_INTEGER_NOT_ALLOWED',
      blockingReason: 'Vehicle inventory count cannot be negative.',
    },
    {
      recordNumber: 24,
      excelRow: 25,
      field: 'Route + Vehicle Type',
      originalValue: 'Duplicate Route Loop | Jeepney',
      requiredAction: 'User must consolidate vehicle unit allocation under route.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Franchise route cannot have conflicting duplicate quota records.',
    },
    {
      recordNumber: 25,
      excelRow: 26,
      field: 'Route + Vehicle Type',
      originalValue: 'Duplicate Route Loop | Jeepney',
      requiredAction: 'User must consolidate vehicle unit allocation under route.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Franchise route cannot have conflicting duplicate quota records.',
    },
  ];

  return { cleanRows, autoFixRows, autoFixIssues, mustFixIssues };
}

// 8. DBL Water
function genWater(): GeneratorOutput {
  const baseRows: Record<string, any>[] = [];
  const types = ['Residential', 'Commercial A', 'Commercial B', 'Industrial', 'Institutional'];
  const brgys = ['Barangay San Isidro', 'Barangay Mabini', 'Barangay Centro', 'Barangay Maligaya', 'Barangay Pag-asa', 'Barangay Riverside', 'Barangay San Fermin', 'Barangay San Nicolas'];

  for (let i = 1; i <= 25; i++) {
    const pad = String(i).padStart(3, '0');
    baseRows.push({
      'Account Number': `00045${pad}`,
      'Type': types[(i - 1) % types.length],
      'Consumption': 15.0 + (i * 2.5),
      'Street': `Rizal Street ${i}`,
      'Purok': `Purok ${((i - 1) % 4) + 1}`,
      'Barangay': brgys[(i - 1) % brgys.length],
      'Billing Date': '2026-01-31',
    });
  }

  const cleanRows = baseRows.map((r) => ({ ...r }));
  const autoFixRows = baseRows.map((r) => ({ ...r }));

  const fixConfigs = [
    { idx: 12, rec: 13, field: 'Consumption', val: ' 22.4 cu.m ', orig: 22.4, act: 'Strips "cu.m" unit suffix and whitespace to float 22.4', rule: 'REMOVE_UNIT' },
    { idx: 13, rec: 14, field: 'Billing Date', val: '01/31/2026', orig: '2026-01-31', act: 'Normalizes MM/DD/YYYY slashed date to ISO YYYY-MM-DD', rule: 'NORMALIZE_DATE' },
    { idx: 14, rec: 15, field: 'Street', val: '  Rizal   Street  ', orig: 'Rizal Street 15', act: 'Trimmed and collapsed repeated spaces', rule: 'COLLAPSE_WHITESPACE' },
    { idx: 15, rec: 16, field: 'Account Number', val: `  ${baseRows[15]['Account Number']}  `, orig: baseRows[15]['Account Number'], act: 'Preserves leading zeros while trimming whitespace', rule: 'TRIM_WHITESPACE' },
    { idx: 16, rec: 17, field: 'Consumption', val: '18.5 cu.m', orig: 18.5, act: 'Strips "cu.m" unit to float 18.5', rule: 'REMOVE_UNIT' },
    { idx: 17, rec: 18, field: 'Billing Date', val: '05/30/2026', orig: '2026-05-30', act: 'Normalizes slashed date to ISO format', rule: 'NORMALIZE_DATE' },
    { idx: 18, rec: 19, field: 'Barangay', val: `  ${baseRows[18]['Barangay']}  `, orig: baseRows[18]['Barangay'], act: 'Trimmed leading/trailing spaces', rule: 'TRIM_WHITESPACE' },
    { idx: 19, rec: 20, field: 'Type', val: 'residential', orig: 'Residential', act: 'Normalized category casing to "Residential"', rule: 'NORMALIZE_CATEGORY_CASE' },
    { idx: 20, rec: 21, field: 'Purok', val: 'Purok IV', orig: 'Purok 4', act: 'Standardized Roman numeral Purok IV to Arabic Purok 4', rule: 'PUROK_ROMAN_NUMERAL' },
  ];

  const autoFixIssues: AutoFixIssueRecord[] = [];
  for (const c of fixConfigs) {
    autoFixRows[c.idx][c.field] = c.val;
    cleanRows[c.idx][c.field] = c.orig;
    autoFixIssues.push({
      recordNumber: c.rec,
      excelRow: c.idx + 2,
      field: c.field,
      before: String(c.val),
      after: String(c.orig),
      action: c.act,
      ruleId: c.rule,
    });
  }

  // Rows 22-25: Must Be Fixed
  autoFixRows[21]['Account Number'] = '';
  autoFixRows[22]['Consumption'] = -12.5;
  autoFixRows[23]['Account Number'] = '00045999';
  autoFixRows[24]['Account Number'] = '00045999';
  autoFixRows[24]['Billing Date'] = autoFixRows[23]['Billing Date'];

  const mustFixIssues: MustFixIssueRecord[] = [
    {
      recordNumber: 22,
      excelRow: 23,
      field: 'Account Number',
      originalValue: '(blank)',
      requiredAction: 'User must enter water service connection account number.',
      ruleId: 'REQUIRED_FIELD_MISSING',
      blockingReason: 'Water consumption billing record cannot be posted without consumer account.',
    },
    {
      recordNumber: 23,
      excelRow: 24,
      field: 'Consumption',
      originalValue: '-12.5',
      requiredAction: 'User must verify meter reading and enter positive cubic meter consumption.',
      ruleId: 'NEGATIVE_NUMBER_NOT_ALLOWED',
      blockingReason: 'Water meter consumption cannot be negative.',
    },
    {
      recordNumber: 24,
      excelRow: 25,
      field: 'Account Number + Billing Date',
      originalValue: '00045999 | 2026-01-31',
      requiredAction: 'User must verify meter reading cycle and remove duplicate billing entry.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Duplicate meter entry causes double-charging the customer for same period.',
    },
    {
      recordNumber: 25,
      excelRow: 26,
      field: 'Account Number + Billing Date',
      originalValue: '00045999 | 2026-01-31',
      requiredAction: 'User must verify meter reading cycle and remove duplicate billing entry.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Duplicate meter entry causes double-charging the customer for same period.',
    },
  ];

  return { cleanRows, autoFixRows, autoFixIssues, mustFixIssues };
}

// 9. ODeSSEE Barangay Household Profile
function genHousehold(): GeneratorOutput {
  const baseRows: Record<string, any>[] = [];
  const brgys = ['Barangay San Isidro', 'Barangay Mabini', 'Barangay Centro', 'Barangay Maligaya', 'Barangay Pag-asa', 'Barangay Riverside', 'Barangay San Fermin', 'Barangay San Nicolas'];
  const civil = ['Married', 'Single', 'Widowed', 'Separated', 'Divorced'];
  for (let i = 1; i <= 25; i++) {
    const pad = String(i).padStart(3, '0');
    baseRows.push({
      'CBMS#-Ind#': `00049${pad}`,
      'Gender': i % 2 === 0 ? 'Female' : 'Male',
      'Civil Status': civil[(i - 1) % civil.length],
      'Barangay': brgys[(i - 1) % brgys.length],
      'Purok/Zone': `Purok ${((i - 1) % 4) + 1}`,
      'Solo Parent(Y/N)': i % 3 === 0 ? 'Y' : 'N',
      'Birth Date': `198${(i % 9)}-05-22`,
      'Disability': 'None',
      'Income Classification': i % 2 === 0 ? 'Middle Income' : 'Low Income',
    });
  }

  const cleanRows = baseRows.map((r) => ({ ...r }));
  const autoFixRows = baseRows.map((r) => ({ ...r }));

  const fixConfigs = [
    { idx: 12, rec: 13, field: 'Solo Parent(Y/N)', val: 'y', orig: 'Y', act: 'Standardizes boolean indicator to uppercase "Y"', rule: 'NORMALIZE_BOOLEAN' },
    { idx: 13, rec: 14, field: 'CBMS#-Ind#', val: `  ${baseRows[13]['CBMS#-Ind#']}  `, orig: baseRows[13]['CBMS#-Ind#'], act: 'Preserves leading zeros while trimming whitespace', rule: 'TRIM_WHITESPACE' },
    { idx: 14, rec: 15, field: 'Birth Date', val: '05/22/1980', orig: '1980-05-22', act: 'Normalizes MM/DD/YYYY slashed date to standard ISO YYYY-MM-DD', rule: 'NORMALIZE_DATE' },
    { idx: 15, rec: 16, field: 'Gender', val: 'female', orig: 'Female', act: 'Normalized gender casing to "Female"', rule: 'NORMALIZE_CATEGORY_CASE' },
    { idx: 16, rec: 17, field: 'Barangay', val: `  ${baseRows[16]['Barangay']}  `, orig: baseRows[16]['Barangay'], act: 'Trimmed leading/trailing spaces', rule: 'TRIM_WHITESPACE' },
    { idx: 17, rec: 18, field: 'Solo Parent(Y/N)', val: 'yes', orig: 'Y', act: 'Standardizes "yes" to official uppercase "Y"', rule: 'NORMALIZE_BOOLEAN' },
    { idx: 18, rec: 19, field: 'Civil Status', val: '  Single  ', orig: 'Single', act: 'Trimmed whitespace from civil status', rule: 'TRIM_WHITESPACE' },
    { idx: 19, rec: 20, field: 'Purok/Zone', val: 'Purok IV', orig: 'Purok 4', act: 'Standardized Roman numeral Purok IV to Arabic Purok 4', rule: 'PUROK_ROMAN_NUMERAL' },
    { idx: 20, rec: 21, field: 'Solo Parent(Y/N)', val: 'no', orig: 'N', act: 'Standardizes "no" to official uppercase "N"', rule: 'NORMALIZE_BOOLEAN' },
  ];

  const autoFixIssues: AutoFixIssueRecord[] = [];
  for (const c of fixConfigs) {
    autoFixRows[c.idx][c.field] = c.val;
    cleanRows[c.idx][c.field] = c.orig;
    autoFixIssues.push({
      recordNumber: c.rec,
      excelRow: c.idx + 2,
      field: c.field,
      before: String(c.val),
      after: String(c.orig),
      action: c.act,
      ruleId: c.rule,
    });
  }

  // Rows 22-25: Must Be Fixed
  autoFixRows[21]['Barangay'] = '';
  autoFixRows[22]['Birth Date'] = '2035-01-01';
  autoFixRows[23]['CBMS#-Ind#'] = '00049999';
  autoFixRows[24]['CBMS#-Ind#'] = '00049999';

  const mustFixIssues: MustFixIssueRecord[] = [
    {
      recordNumber: 22,
      excelRow: 23,
      field: 'Barangay',
      originalValue: '(blank)',
      requiredAction: 'User must select official barangay jurisdiction from list.',
      ruleId: 'REQUIRED_FIELD_MISSING',
      blockingReason: 'CBMS demographic profile must belong to a recognized barangay.',
    },
    {
      recordNumber: 23,
      excelRow: 24,
      field: 'Birth Date',
      originalValue: '2035-01-01',
      requiredAction: 'User must enter historical birth date.',
      ruleId: 'DATE_CANNOT_BE_FUTURE',
      blockingReason: 'Citizen birth date cannot be in the future.',
    },
    {
      recordNumber: 24,
      excelRow: 25,
      field: 'CBMS#-Ind#',
      originalValue: '00049999',
      requiredAction: 'User must verify citizen profile and remove duplicate individual ID.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Individual CBMS ID must uniquely identify a citizen.',
    },
    {
      recordNumber: 25,
      excelRow: 26,
      field: 'CBMS#-Ind#',
      originalValue: '00049999',
      requiredAction: 'User must verify citizen profile and remove duplicate individual ID.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Individual CBMS ID must uniquely identify a citizen.',
    },
  ];

  return { cleanRows, autoFixRows, autoFixIssues, mustFixIssues };
}

// 10. ODeSSEE COVID Cases
function genCovid(): GeneratorOutput {
  const baseRows: Record<string, any>[] = [];
  const brgys = ['Barangay San Isidro', 'Barangay Mabini', 'Barangay Centro', 'Barangay Maligaya', 'Barangay Pag-asa', 'Barangay Riverside', 'Barangay San Fermin', 'Barangay San Nicolas'];
  for (let i = 1; i <= 25; i++) {
    baseRows.push({
      'Barangay': brgys[(i - 1) % brgys.length],
      'Facilities': `Health Center Unit ${i}`,
      'Total Number of Case': 5 + (i * 2),
    });
  }

  const cleanRows = baseRows.map((r) => ({ ...r }));
  const autoFixRows = baseRows.map((r) => ({ ...r }));

  const fixConfigs = [
    { idx: 12, rec: 13, field: 'Barangay', val: '  Barangay Maligaya  ', orig: 'Barangay Maligaya', act: 'Trimmed leading/trailing whitespace', rule: 'TRIM_WHITESPACE' },
    { idx: 13, rec: 14, field: 'Total Number of Case', val: '25 cases', orig: 25, act: 'Strips "cases" unit suffix to integer 25', rule: 'REMOVE_UNIT' },
    { idx: 14, rec: 15, field: 'Facilities', val: '   Community   Health   Center   ', orig: 'Community Health Center', act: 'Collapsed redundant spaces', rule: 'COLLAPSE_WHITESPACE' },
    { idx: 15, rec: 16, field: 'Total Number of Case', val: ' 10 ', orig: 10, act: 'Casts whitespace-padded string to integer 10', rule: 'CONVERT_TO_NUMBER' },
    { idx: 16, rec: 17, field: 'Barangay', val: '  Barangay Centro  ', orig: 'Barangay Centro', act: 'Trimmed whitespace', rule: 'TRIM_WHITESPACE' },
    { idx: 17, rec: 18, field: 'Total Number of Case', val: '18 cases', orig: 18, act: 'Strips "cases" unit suffix to integer 18', rule: 'REMOVE_UNIT' },
    { idx: 18, rec: 19, field: 'Facilities', val: '  Quarantine   Facility   A  ', orig: 'Quarantine Facility A', act: 'Collapsed internal spaces', rule: 'COLLAPSE_WHITESPACE' },
    { idx: 19, rec: 20, field: 'Total Number of Case', val: ' 35 ', orig: 35, act: 'Casts padded string to integer 35', rule: 'CONVERT_TO_NUMBER' },
    { idx: 20, rec: 21, field: 'Barangay', val: '   Barangay   Riverside   ', orig: 'Barangay Riverside', act: 'Collapsed internal whitespace', rule: 'COLLAPSE_WHITESPACE' },
  ];

  const autoFixIssues: AutoFixIssueRecord[] = [];
  for (const c of fixConfigs) {
    autoFixRows[c.idx][c.field] = c.val;
    cleanRows[c.idx][c.field] = c.orig;
    autoFixIssues.push({
      recordNumber: c.rec,
      excelRow: c.idx + 2,
      field: c.field,
      before: String(c.val),
      after: String(c.orig),
      action: c.act,
      ruleId: c.rule,
    });
  }

  // Rows 22-25: Must Be Fixed
  autoFixRows[21]['Barangay'] = '';
  autoFixRows[22]['Total Number of Case'] = -15;
  autoFixRows[23]['Barangay'] = 'Barangay Centro';
  autoFixRows[23]['Facilities'] = 'Central Isolation Ward DUP';
  autoFixRows[24]['Barangay'] = 'Barangay Centro';
  autoFixRows[24]['Facilities'] = 'Central Isolation Ward DUP';

  const mustFixIssues: MustFixIssueRecord[] = [
    {
      recordNumber: 22,
      excelRow: 23,
      field: 'Barangay',
      originalValue: '(blank)',
      requiredAction: 'User must input official barangay location for facility.',
      ruleId: 'REQUIRED_FIELD_MISSING',
      blockingReason: 'Epidemiological surveillance records must be tied to a barangay.',
    },
    {
      recordNumber: 23,
      excelRow: 24,
      field: 'Total Number of Case',
      originalValue: '-15',
      requiredAction: 'User must enter verified non-negative case count.',
      ruleId: 'NEGATIVE_INTEGER_NOT_ALLOWED',
      blockingReason: 'Disease surveillance counts cannot be negative.',
    },
    {
      recordNumber: 24,
      excelRow: 25,
      field: 'Barangay + Facilities',
      originalValue: 'Barangay Centro | Central Isolation Ward DUP',
      requiredAction: 'User must combine surveillance case counts for facility.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Facility case totals within a barangay cannot be logged in duplicate.',
    },
    {
      recordNumber: 25,
      excelRow: 26,
      field: 'Barangay + Facilities',
      originalValue: 'Barangay Centro | Central Isolation Ward DUP',
      requiredAction: 'User must combine surveillance case counts for facility.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Facility case totals within a barangay cannot be logged in duplicate.',
    },
  ];

  return { cleanRows, autoFixRows, autoFixIssues, mustFixIssues };
}

// 11. ODeSSEE Disaster Incident Report (Header row 2)
function genDisaster(): GeneratorOutput {
  const baseRows: Record<string, any>[] = [];
  const incs = ['Heavy Rainfall', 'Localized Flooding', 'Strong Winds', 'Riverbank Overflow', 'Flash Flood Warning'];
  const skyCond = ['Overcast', 'Cloudy with scattered rains', 'Partly Cloudy', 'Stormy', 'Overcast with Thunderstorm'];

  for (let i = 1; i <= 25; i++) {
    baseRows.push({
      'Report Date': `2024-0${((i % 8) + 1)}-15`,
      'Incident': `${incs[(i - 1) % incs.length]} Episode ${i}`,
      'Incident Date (Date Range)': 'Sept 15 - 16, 2024',
      'Sky Condition': skyCond[(i - 1) % skyCond.length],
      'Wind': 'Light to Moderate',
      'Precipitation': 'Moderate to Heavy',
      'Gauging Station': i < 10 ? `00${i}-Cagayan-Station` : `0${i}-Pinacanauan-Main`,
      'Current Level': 10.5 + (i * 0.3),
      'Areas Likely to be Affected': 'Barangay Riverside Lowland',
      'Casualty': 0,
    });
  }

  const cleanRows = baseRows.map((r) => ({ ...r }));
  const autoFixRows = baseRows.map((r) => ({ ...r }));

  const fixConfigs = [
    { idx: 12, rec: 13, field: 'Current Level', val: '14.8 m', orig: 14.8, act: 'Strips "m" suffix to numeric float 14.8', rule: 'REMOVE_UNIT' },
    { idx: 13, rec: 14, field: 'Casualty', val: ' 0 ', orig: 0, act: 'Casts whitespace-padded string to integer 0', rule: 'CONVERT_TO_NUMBER' },
    { idx: 14, rec: 15, field: 'Report Date', val: '11/15/2024', orig: '2024-11-15', act: 'Normalizes MM/DD/YYYY slashed date to standard YYYY-MM-DD', rule: 'NORMALIZE_DATE' },
    { idx: 15, rec: 16, field: 'Gauging Station', val: '  001-Cagayan-Station  ', orig: '001-Cagayan-Station', act: 'Preserves leading zeros while trimming whitespace', rule: 'TRIM_WHITESPACE' },
    { idx: 16, rec: 17, field: 'Incident', val: '  Heavy   Rainfall   Episode  ', orig: 'Heavy Rainfall Episode 17', act: 'Collapsed multiple internal spaces', rule: 'COLLAPSE_WHITESPACE' },
    { idx: 17, rec: 18, field: 'Current Level', val: '12.0 m', orig: 12.0, act: 'Strips "m" unit suffix to float 12.0', rule: 'REMOVE_UNIT' },
    { idx: 18, rec: 19, field: 'Report Date', val: '05/30/2024', orig: '2024-05-30', act: 'Normalizes slashed date to ISO format', rule: 'NORMALIZE_DATE' },
    { idx: 19, rec: 20, field: 'Sky Condition', val: '  Overcast  ', orig: 'Overcast', act: 'Trimmed surrounding whitespace', rule: 'TRIM_WHITESPACE' },
    { idx: 20, rec: 21, field: 'Casualty', val: ' 1 ', orig: 1, act: 'Casts string casualty count to integer 1', rule: 'CONVERT_TO_NUMBER' },
  ];

  const autoFixIssues: AutoFixIssueRecord[] = [];
  for (const c of fixConfigs) {
    autoFixRows[c.idx][c.field] = c.val;
    cleanRows[c.idx][c.field] = c.orig;
    autoFixIssues.push({
      recordNumber: c.rec,
      excelRow: c.idx + 3, // Header index is 2
      field: c.field,
      before: String(c.val),
      after: String(c.orig),
      action: c.act,
      ruleId: c.rule,
    });
  }

  // Rows 22-25: Must Be Fixed
  autoFixRows[21]['Incident'] = '';
  autoFixRows[22]['Casualty'] = -5;
  autoFixRows[23]['Report Date'] = '2024-05-15';
  autoFixRows[23]['Incident'] = 'Duplicate Flood Incident';
  autoFixRows[23]['Gauging Station'] = '001-Cagayan-Station';
  autoFixRows[24]['Report Date'] = '2024-05-15';
  autoFixRows[24]['Incident'] = 'Duplicate Flood Incident';
  autoFixRows[24]['Gauging Station'] = '001-Cagayan-Station';

  const mustFixIssues: MustFixIssueRecord[] = [
    {
      recordNumber: 22,
      excelRow: 24,
      field: 'Incident',
      originalValue: '(blank)',
      requiredAction: 'User must enter disaster/incident title or nature.',
      ruleId: 'REQUIRED_FIELD_MISSING',
      blockingReason: 'Disaster monitoring log cannot be filed without incident description.',
    },
    {
      recordNumber: 23,
      excelRow: 25,
      field: 'Casualty',
      originalValue: '-5',
      requiredAction: 'User must enter verified non-negative casualty count.',
      ruleId: 'NEGATIVE_INTEGER_NOT_ALLOWED',
      blockingReason: 'Human casualty count cannot be negative.',
    },
    {
      recordNumber: 24,
      excelRow: 26,
      field: 'Report Date + Incident',
      originalValue: '2024-05-15 | Duplicate Flood Incident',
      requiredAction: 'User must consolidate incident situation report.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Duplicate disaster incident reports distort regional situation assessments.',
    },
    {
      recordNumber: 25,
      excelRow: 27,
      field: 'Report Date + Incident',
      originalValue: '2024-05-15 | Duplicate Flood Incident',
      requiredAction: 'User must consolidate incident situation report.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Duplicate disaster incident reports distort regional situation assessments.',
    },
  ];

  return { cleanRows, autoFixRows, autoFixIssues, mustFixIssues };
}

// 12. ODeSSEE DRRM Resources
function genDrrm(): GeneratorOutput {
  const baseRows: Record<string, any>[] = [];
  const teams = ['Rescue Team Alpha', 'Logistics Support Unit', 'Emergency Medical Unit', 'Utility Response Team', 'Communications Unit', 'Camp Management Team', 'Security & Order Unit'];
  const eqList = [
    { eq: 'Rescue Boat', unit: 'Units' },
    { eq: 'Life Vest', unit: 'PCs' },
    { eq: 'First Aid Kit', unit: 'Boxes' },
    { eq: 'Portable Generator', unit: 'Units' },
    { eq: 'Water Pump', unit: 'Sets' },
    { eq: 'Handheld Radio', unit: 'PCs' },
    { eq: 'Emergency Light', unit: 'PCs' },
    { eq: 'Spine Board', unit: 'Units' },
    { eq: 'Megaphone', unit: 'PCs' },
    { eq: 'Folding Bed', unit: 'PCs' },
    { eq: 'Chainsaw Rescue Kit', unit: 'Sets' },
    { eq: 'Family Relief Tent', unit: 'Sets' },
  ];

  for (let i = 1; i <= 25; i++) {
    const item = eqList[(i - 1) % eqList.length];
    baseRows.push({
      'Group/Team': teams[(i - 1) % teams.length],
      'Resources/Equipment': `${item.eq} Batch ${i}`,
      'Quantity': 10 + (i * 5),
      'Unit': item.unit,
      'Category': 'Emergency Response',
    });
  }

  const cleanRows = baseRows.map((r) => ({ ...r }));
  const autoFixRows = baseRows.map((r) => ({ ...r }));

  const fixConfigs = [
    { idx: 12, rec: 13, field: 'Quantity', val: ' 24 pcs ', orig: 24, act: 'Strips "pcs" suffix to integer 24', rule: 'REMOVE_UNIT' },
    { idx: 13, rec: 14, field: 'Group/Team', val: '  Utility Response Team  ', orig: 'Utility Response Team', act: 'Trimmed leading/trailing whitespace', rule: 'TRIM_WHITESPACE' },
    { idx: 14, rec: 15, field: 'Resources/Equipment', val: '   Spine   Board   Batch 15   ', orig: 'Spine Board Batch 15', act: 'Collapsed redundant internal spaces', rule: 'COLLAPSE_WHITESPACE' },
    { idx: 15, rec: 16, field: 'Quantity', val: ' 150 pcs ', orig: 150, act: 'Strips "pcs" suffix to integer 150', rule: 'REMOVE_UNIT' },
    { idx: 16, rec: 17, field: 'Group/Team', val: '  Rescue Team Alpha  ', orig: 'Rescue Team Alpha', act: 'Trimmed whitespace from team name', rule: 'TRIM_WHITESPACE' },
    { idx: 17, rec: 18, field: 'Quantity', val: ' 8 units ', orig: 8, act: 'Strips "units" suffix to integer 8', rule: 'REMOVE_UNIT' },
    { idx: 18, rec: 19, field: 'Resources/Equipment', val: '  Portable Generator Batch 19  ', orig: 'Portable Generator Batch 19', act: 'Trimmed surrounding spaces', rule: 'TRIM_WHITESPACE' },
    { idx: 19, rec: 20, field: 'Quantity', val: ' 15 units ', orig: 15, act: 'Strips "units" suffix to integer 15', rule: 'REMOVE_UNIT' },
    { idx: 20, rec: 21, field: 'Group/Team', val: '   Logistics   Support   Unit   ', orig: 'Logistics Support Unit', act: 'Collapsed internal whitespace', rule: 'COLLAPSE_WHITESPACE' },
  ];

  const autoFixIssues: AutoFixIssueRecord[] = [];
  for (const c of fixConfigs) {
    autoFixRows[c.idx][c.field] = c.val;
    cleanRows[c.idx][c.field] = c.orig;
    autoFixIssues.push({
      recordNumber: c.rec,
      excelRow: c.idx + 2,
      field: c.field,
      before: String(c.val),
      after: String(c.orig),
      action: c.act,
      ruleId: c.rule,
    });
  }

  // Rows 22-25: Must Be Fixed
  autoFixRows[21]['Resources/Equipment'] = '';
  autoFixRows[22]['Quantity'] = -10;
  autoFixRows[23]['Group/Team'] = 'Rescue Team Alpha';
  autoFixRows[23]['Resources/Equipment'] = 'Emergency Rescue Truck DUP';
  autoFixRows[24]['Group/Team'] = 'Rescue Team Alpha';
  autoFixRows[24]['Resources/Equipment'] = 'Emergency Rescue Truck DUP';

  const mustFixIssues: MustFixIssueRecord[] = [
    {
      recordNumber: 22,
      excelRow: 23,
      field: 'Resources/Equipment',
      originalValue: '(blank)',
      requiredAction: 'User must enter emergency response resource or equipment name.',
      ruleId: 'REQUIRED_FIELD_MISSING',
      blockingReason: 'Disaster preparedness inventory requires resource designation.',
    },
    {
      recordNumber: 23,
      excelRow: 24,
      field: 'Quantity',
      originalValue: '-10',
      requiredAction: 'User must enter verified positive inventory quantity.',
      ruleId: 'NEGATIVE_INTEGER_NOT_ALLOWED',
      blockingReason: 'Emergency resource inventory count cannot be negative.',
    },
    {
      recordNumber: 24,
      excelRow: 25,
      field: 'Group/Team + Resources/Equipment',
      originalValue: 'Rescue Team Alpha | Emergency Rescue Truck DUP',
      requiredAction: 'User must combine unit quantities under single equipment entry.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Duplicate equipment rows cause discrepancies during emergency deployment.',
    },
    {
      recordNumber: 25,
      excelRow: 26,
      field: 'Group/Team + Resources/Equipment',
      originalValue: 'Rescue Team Alpha | Emergency Rescue Truck DUP',
      requiredAction: 'User must combine unit quantities under single equipment entry.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Duplicate equipment rows cause discrepancies during emergency deployment.',
    },
  ];

  return { cleanRows, autoFixRows, autoFixIssues, mustFixIssues };
}

// 13. ODeSSEE Evacuation Sites
function genEvacuation(): GeneratorOutput {
  const baseRows: Record<string, any>[] = [];
  const brgys = ['Barangay San Isidro', 'Barangay Mabini', 'Barangay Centro', 'Barangay Maligaya', 'Barangay Pag-asa', 'Barangay Riverside', 'Barangay San Fermin', 'Barangay San Nicolas'];

  for (let i = 1; i <= 25; i++) {
    const pad = String(i).padStart(2, '0');
    baseRows.push({
      'Name of Evacuation Center ': `Evacuation Center Facility ${pad}`,
      'Barangay': brgys[(i - 1) % brgys.length],
      'Latitude': Number((16.6918 + (i * 0.0012)).toFixed(4)),
      'Longitude': Number((121.5518 + (i * 0.0012)).toFixed(4)),
      'No. of Family': 40 + (i * 4),
      'No. of Individuals': 180 + (i * 15),
      'No. of Storey/ Floors': 2,
      'No. of Rooms': 8,
      'No. of Toilet for Women': 6,
      'No. of Toilet for Men': 4,
      'Common CR': 2,
      'No. of Bath/ Shower Area for Women': 4,
      'No. of Bath/ Shower Area for Men': 4,
      'Water Source/s': 'Piped Water Connection',
      'Breast feeding Area': 'Available',
      'With Storage (Y/N) If yes indicate the floor area': 'Yes - 35 sqm',
      'Used as COVID-19 TTMF (Y/N)': 'N',
      'Inspected Safe': 'Y',
    });
  }

  const cleanRows = baseRows.map((r) => ({ ...r }));
  const autoFixRows = baseRows.map((r) => ({ ...r }));

  const fixConfigs = [
    { idx: 12, rec: 13, field: 'No. of Family', val: ' 95 ', orig: 95, act: 'Casts whitespace-padded string to integer 95', rule: 'CONVERT_TO_NUMBER' },
    { idx: 13, rec: 14, field: 'No. of Individuals', val: ' 420 ', orig: 420, act: 'Casts whitespace-padded string to integer 420', rule: 'CONVERT_TO_NUMBER' },
    { idx: 14, rec: 15, field: 'Used as COVID-19 TTMF (Y/N)', val: 'n', orig: 'N', act: 'Standardizes boolean indicator to uppercase "N"', rule: 'NORMALIZE_BOOLEAN' },
    { idx: 15, rec: 16, field: 'Inspected Safe', val: 'yes', orig: 'Y', act: 'Standardizes "yes" to uppercase "Y"', rule: 'NORMALIZE_BOOLEAN' },
    { idx: 16, rec: 17, field: 'Barangay', val: `  ${baseRows[16]['Barangay']}  `, orig: baseRows[16]['Barangay'], act: 'Trimmed whitespace from barangay', rule: 'TRIM_WHITESPACE' },
    { idx: 17, rec: 18, field: 'No. of Family', val: ' 60 ', orig: 60, act: 'Casts string family count to integer 60', rule: 'CONVERT_TO_NUMBER' },
    { idx: 18, rec: 19, field: 'Used as COVID-19 TTMF (Y/N)', val: 'y', orig: 'Y', act: 'Standardizes boolean "y" to "Y"', rule: 'NORMALIZE_BOOLEAN' },
    { idx: 19, rec: 20, field: 'Name of Evacuation Center ', val: `  ${baseRows[19]['Name of Evacuation Center ']}  `, orig: baseRows[19]['Name of Evacuation Center '], act: 'Trimmed extraneous whitespace', rule: 'TRIM_WHITESPACE' },
    { idx: 20, rec: 21, field: 'Inspected Safe', val: 'y', orig: 'Y', act: 'Standardizes lowercase "y" to uppercase "Y"', rule: 'NORMALIZE_BOOLEAN' },
  ];

  const autoFixIssues: AutoFixIssueRecord[] = [];
  for (const c of fixConfigs) {
    autoFixRows[c.idx][c.field] = c.val;
    cleanRows[c.idx][c.field] = c.orig;
    autoFixIssues.push({
      recordNumber: c.rec,
      excelRow: c.idx + 2,
      field: c.field,
      before: String(c.val),
      after: String(c.orig),
      action: c.act,
      ruleId: c.rule,
    });
  }

  // Rows 22-25: Must Be Fixed
  autoFixRows[21]['Name of Evacuation Center '] = '';
  autoFixRows[22]['No. of Family'] = -50;
  autoFixRows[23]['Name of Evacuation Center '] = 'Central Gymnasium DUP';
  autoFixRows[23]['Barangay'] = 'Barangay Centro';
  autoFixRows[24]['Name of Evacuation Center '] = 'Central Gymnasium DUP';
  autoFixRows[24]['Barangay'] = 'Barangay Centro';

  const mustFixIssues: MustFixIssueRecord[] = [
    {
      recordNumber: 22,
      excelRow: 23,
      field: 'Name of Evacuation Center ',
      originalValue: '(blank)',
      requiredAction: 'User must enter evacuation facility name.',
      ruleId: 'REQUIRED_FIELD_MISSING',
      blockingReason: 'Emergency shelter database cannot list anonymous evacuation center.',
    },
    {
      recordNumber: 23,
      excelRow: 24,
      field: 'No. of Family',
      originalValue: '-50',
      requiredAction: 'User must enter positive family capacity count.',
      ruleId: 'NEGATIVE_INTEGER_NOT_ALLOWED',
      blockingReason: 'Evacuation center family capacity cannot be negative.',
    },
    {
      recordNumber: 24,
      excelRow: 25,
      field: 'Name of Evacuation Center  + Barangay',
      originalValue: 'Central Gymnasium DUP | Barangay Centro',
      requiredAction: 'User must deduplicate shelter listing and confirm single center capacity.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Duplicate center entries falsely inflate municipal evacuation capacity.',
    },
    {
      recordNumber: 25,
      excelRow: 26,
      field: 'Name of Evacuation Center  + Barangay',
      originalValue: 'Central Gymnasium DUP | Barangay Centro',
      requiredAction: 'User must deduplicate shelter listing and confirm single center capacity.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Duplicate center entries falsely inflate municipal evacuation capacity.',
    },
  ];

  return { cleanRows, autoFixRows, autoFixIssues, mustFixIssues };
}

// 14. ODeSSEE Flood Susceptibility Rating
function genFlood(): GeneratorOutput {
  const baseRows: Record<string, any>[] = [];
  const brgys = ['Barangay San Isidro', 'Barangay Riverside', 'Barangay Centro', 'Barangay Maligaya', 'Barangay Pag-asa', 'Barangay Mabini', 'Barangay San Fermin', 'Barangay San Nicolas'];
  const ratings = ['HF', 'VHF', 'MF', 'LF'];

  for (let i = 1; i <= 25; i++) {
    const pad = String(i).padStart(3, '0');
    baseRows.push({
      'Area of Concern': `Flood Monitoring Zone ${pad}`,
      'Barangay Name': brgys[(i - 1) % brgys.length],
      'Barangay Code': `023108${pad}`,
      'Municipality Name': 'Santiago City',
      'Municipality Code': '023108',
      'Geocode': `PH-02-31-08-${pad}`,
      'Purok/Sitio': `Purok ${((i - 1) % 4) + 1}`,
      'Latitude': Number((16.6918 + (i * 0.0012)).toFixed(4)),
      'Longitude': Number((121.5518 + (i * 0.0012)).toFixed(4)),
      'Susceptibility Rating': ratings[(i - 1) % ratings.length],
      'Flood Height': 0.5 + (i * 0.1),
      'Elevation': 40.0 + (i * 0.5),
      'POI': `Community Landmark ${i}`,
    });
  }

  const cleanRows = baseRows.map((r) => ({ ...r }));
  const autoFixRows = baseRows.map((r) => ({ ...r }));

  const fixConfigs = [
    { idx: 12, rec: 13, field: 'Flood Height', val: '2.25 m', orig: 2.25, act: 'Strips "m" suffix to float 2.25', rule: 'REMOVE_UNIT' },
    { idx: 13, rec: 14, field: 'Barangay Code', val: `  ${baseRows[13]['Barangay Code']}  `, orig: baseRows[13]['Barangay Code'], act: 'Preserves leading zeros while trimming whitespace', rule: 'TRIM_WHITESPACE' },
    { idx: 14, rec: 15, field: 'Area of Concern', val: '   San Nicolas   Low-lying   Basin   ', orig: 'San Nicolas Low-lying Basin', act: 'Collapsed redundant whitespace', rule: 'COLLAPSE_WHITESPACE' },
    { idx: 15, rec: 16, field: 'Elevation', val: ' 42.5 m ', orig: 42.5, act: 'Strips "m" suffix to float 42.5', rule: 'REMOVE_UNIT' },
    { idx: 16, rec: 17, field: 'Barangay Name', val: `  ${baseRows[16]['Barangay Name']}  `, orig: baseRows[16]['Barangay Name'], act: 'Trimmed whitespace from barangay', rule: 'TRIM_WHITESPACE' },
    { idx: 17, rec: 18, field: 'Flood Height', val: '1.80 m', orig: 1.80, act: 'Strips "m" unit suffix to float 1.8', rule: 'REMOVE_UNIT' },
    { idx: 18, rec: 19, field: 'Municipality Code', val: ' 023108 ', orig: '023108', act: 'Preserves leading zero while trimming whitespace', rule: 'TRIM_WHITESPACE' },
    { idx: 19, rec: 20, field: 'POI', val: '  Barangay Chapel  ', orig: 'Barangay Chapel', act: 'Trimmed surrounding spaces', rule: 'TRIM_WHITESPACE' },
    { idx: 20, rec: 21, field: 'Flood Height', val: ' 2.50 m ', orig: 2.50, act: 'Strips "m" unit suffix to float 2.5', rule: 'REMOVE_UNIT' },
  ];

  const autoFixIssues: AutoFixIssueRecord[] = [];
  for (const c of fixConfigs) {
    autoFixRows[c.idx][c.field] = c.val;
    cleanRows[c.idx][c.field] = c.orig;
    autoFixIssues.push({
      recordNumber: c.rec,
      excelRow: c.idx + 2,
      field: c.field,
      before: String(c.val),
      after: String(c.orig),
      action: c.act,
      ruleId: c.rule,
    });
  }

  // Rows 22-25: Must Be Fixed
  autoFixRows[21]['Barangay Name'] = '';
  autoFixRows[22]['Flood Height'] = -3.5;
  autoFixRows[23]['Area of Concern'] = 'Duplicate Flood Area';
  autoFixRows[23]['Barangay Name'] = 'Barangay Riverside';
  autoFixRows[24]['Area of Concern'] = 'Duplicate Flood Area';
  autoFixRows[24]['Barangay Name'] = 'Barangay Riverside';

  const mustFixIssues: MustFixIssueRecord[] = [
    {
      recordNumber: 22,
      excelRow: 23,
      field: 'Barangay Name',
      originalValue: '(blank)',
      requiredAction: 'User must enter official barangay jurisdiction.',
      ruleId: 'REQUIRED_FIELD_MISSING',
      blockingReason: 'Flood hazard susceptibility rating must belong to an administrative barangay.',
    },
    {
      recordNumber: 23,
      excelRow: 24,
      field: 'Flood Height',
      originalValue: '-3.5',
      requiredAction: 'User must enter positive inundation depth in meters.',
      ruleId: 'NEGATIVE_NUMBER_NOT_ALLOWED',
      blockingReason: 'Water inundation depth cannot be negative.',
    },
    {
      recordNumber: 24,
      excelRow: 25,
      field: 'Area of Concern + Barangay Name',
      originalValue: 'Duplicate Flood Area | Barangay Riverside',
      requiredAction: 'User must combine or verify distinct flood hazard monitoring zones.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Duplicate flood monitoring zones corrupt hydraulic risk modeling.',
    },
    {
      recordNumber: 25,
      excelRow: 26,
      field: 'Area of Concern + Barangay Name',
      originalValue: 'Duplicate Flood Area | Barangay Riverside',
      requiredAction: 'User must combine or verify distinct flood hazard monitoring zones.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Duplicate flood monitoring zones corrupt hydraulic risk modeling.',
    },
  ];

  return { cleanRows, autoFixRows, autoFixIssues, mustFixIssues };
}

// 15. ODeSSEE Vulnerability Risk Assessment
function genVra(): GeneratorOutput {
  const baseRows: Record<string, any>[] = [];
  const brgys = ['Barangay San Isidro', 'Barangay Maligaya', 'Barangay Centro', 'Barangay Mabini', 'Barangay Pag-asa', 'Barangay Riverside', 'Barangay San Fermin', 'Barangay San Nicolas'];
  const ratings = ['HF', 'VHF', 'MF', 'LF'];
  const cats = ['River Flood', 'Flash Flood', 'Surface Runoff', 'Rainwater Accumulation'];

  for (let i = 1; i <= 25; i++) {
    const pad = String(i).padStart(3, '0');
    baseRows.push({
      'Area of Concern': `VRA Sector ${pad}`,
      'Barangay Name': brgys[(i - 1) % brgys.length],
      'Purok/Sitio': `Purok ${((i - 1) % 4) + 1}`,
      'Geocode': `00098${pad}`,
      'Latitude': Number((16.6920 + (i * 0.0012)).toFixed(4)),
      'Longitude': Number((121.5520 + (i * 0.0012)).toFixed(4)),
      'Susceptibility Rating': ratings[(i - 1) % ratings.length],
      'Concern Category': cats[(i - 1) % cats.length],
    });
  }

  const cleanRows = baseRows.map((r) => ({ ...r }));
  const autoFixRows = baseRows.map((r) => ({ ...r }));

  const fixConfigs = [
    { idx: 12, rec: 13, field: 'Area of Concern', val: '  Mabini Riverbend Section  ', orig: 'Mabini Riverbend Section', act: 'Trimmed leading/trailing whitespace', rule: 'TRIM_WHITESPACE' },
    { idx: 13, rec: 14, field: 'Geocode', val: `  ${baseRows[13]['Geocode']}  `, orig: baseRows[13]['Geocode'], act: 'Preserves leading zeros while trimming whitespace', rule: 'TRIM_WHITESPACE' },
    { idx: 14, rec: 15, field: 'Barangay Name', val: '  Barangay   San Nicolas  ', orig: 'Barangay San Nicolas', act: 'Collapsed redundant whitespace', rule: 'COLLAPSE_WHITESPACE' },
    { idx: 15, rec: 16, field: 'Concern Category', val: '  River Flood  ', orig: 'River Flood', act: 'Trimmed whitespace from category', rule: 'TRIM_WHITESPACE' },
    { idx: 16, rec: 17, field: 'Purok/Sitio', val: 'Purok IV', orig: 'Purok 4', act: 'Standardized Roman numeral Purok IV to Arabic Purok 4', rule: 'PUROK_ROMAN_NUMERAL' },
    { idx: 17, rec: 18, field: 'Area of Concern', val: '   Sitio   Riverside   Confluence   ', orig: 'Sitio Riverside Confluence', act: 'Collapsed internal spaces', rule: 'COLLAPSE_WHITESPACE' },
    { idx: 18, rec: 19, field: 'Geocode', val: `   ${baseRows[18]['Geocode']}   `, orig: baseRows[18]['Geocode'], act: 'Trimmed whitespace from geocode', rule: 'TRIM_WHITESPACE' },
    { idx: 19, rec: 20, field: 'Barangay Name', val: `  ${baseRows[19]['Barangay Name']}  `, orig: baseRows[19]['Barangay Name'], act: 'Trimmed leading/trailing spaces', rule: 'TRIM_WHITESPACE' },
    { idx: 20, rec: 21, field: 'Concern Category', val: '  Surface   Runoff  ', orig: 'Surface Runoff', act: 'Collapsed internal spaces', rule: 'COLLAPSE_WHITESPACE' },
  ];

  const autoFixIssues: AutoFixIssueRecord[] = [];
  for (const c of fixConfigs) {
    autoFixRows[c.idx][c.field] = c.val;
    cleanRows[c.idx][c.field] = c.orig;
    autoFixIssues.push({
      recordNumber: c.rec,
      excelRow: c.idx + 2,
      field: c.field,
      before: String(c.val),
      after: String(c.orig),
      action: c.act,
      ruleId: c.rule,
    });
  }

  // Rows 22-25: Must Be Fixed
  autoFixRows[21]['Barangay Name'] = '';
  autoFixRows[22]['Latitude'] = -95.0;
  autoFixRows[23]['Area of Concern'] = 'Duplicate Vulnerability Zone';
  autoFixRows[23]['Barangay Name'] = 'Barangay Centro';
  autoFixRows[24]['Area of Concern'] = 'Duplicate Vulnerability Zone';
  autoFixRows[24]['Barangay Name'] = 'Barangay Centro';

  const mustFixIssues: MustFixIssueRecord[] = [
    {
      recordNumber: 22,
      excelRow: 23,
      field: 'Barangay Name',
      originalValue: '(blank)',
      requiredAction: 'User must enter official barangay jurisdiction.',
      ruleId: 'REQUIRED_FIELD_MISSING',
      blockingReason: 'Vulnerability risk assessment zone must belong to an official barangay.',
    },
    {
      recordNumber: 23,
      excelRow: 24,
      field: 'Latitude',
      originalValue: '-95.0',
      requiredAction: 'User must enter valid latitude between -90 and 90.',
      ruleId: 'INVALID_LATITUDE',
      blockingReason: 'Geographical coordinate -95.0 is out of valid mathematical range.',
    },
    {
      recordNumber: 24,
      excelRow: 25,
      field: 'Area of Concern + Barangay Name',
      originalValue: 'Duplicate Vulnerability Zone | Barangay Centro',
      requiredAction: 'User must verify distinct hazard assessment sector or remove duplicate.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Duplicate vulnerability zones cause double-counting of vulnerable populations.',
    },
    {
      recordNumber: 25,
      excelRow: 26,
      field: 'Area of Concern + Barangay Name',
      originalValue: 'Duplicate Vulnerability Zone | Barangay Centro',
      requiredAction: 'User must verify distinct hazard assessment sector or remove duplicate.',
      ruleId: 'DUPLICATE_COMPOSITE_KEY',
      blockingReason: 'Duplicate vulnerability zones cause double-counting of vulnerable populations.',
    },
  ];

  return { cleanRows, autoFixRows, autoFixIssues, mustFixIssues };
}

// ============================================================================
// MAIN GENERATION & MULTI-PHASE VERIFICATION PIPELINE
// ============================================================================

async function run() {
  console.log('================================================================');
  console.log('   DATACLEAN: COMPLETE AUTO-FIX TRAINING DATASET GENERATOR       ');
  console.log('   3-STATUS MODEL: 12 Valid | 9 Auto-Fix | 4 Must Be Fixed       ');
  console.log('================================================================\n');

  const configs = [
    {
      id: 'dbl-business',
      folder: 'DBL/Business',
      trainingDemo: 'DBL_Business_Training_Demo.xlsx',
      clean: 'DBL_Business_Clean_Sample.xlsx',
      autoFix: 'DBL_Business_AutoFix_Demo.xlsx',
      exp: 'DBL_Business_Expected_Cleaned.xlsx',
      gen: genBusiness,
    },
    {
      id: 'dbl-crime',
      folder: 'DBL/Crime',
      trainingDemo: 'DBL_Crime_Training_Demo.xlsx',
      clean: 'DBL_Crime_Clean_Sample.xlsx',
      autoFix: 'DBL_Crime_AutoFix_Demo.xlsx',
      exp: 'DBL_Crime_Expected_Cleaned.xlsx',
      gen: genCrime,
    },
    {
      id: 'dbl-human-resource',
      folder: 'DBL/Human-Resource',
      trainingDemo: 'DBL_HumanResource_Training_Demo.xlsx',
      clean: 'DBL_Human_Resource_Clean_Sample.xlsx',
      autoFix: 'DBL_Human_Resource_AutoFix_Demo.xlsx',
      exp: 'DBL_Human_Resource_Expected_Cleaned.xlsx',
      gen: genHumanResource,
    },
    {
      id: 'dbl-power',
      folder: 'DBL/Power',
      trainingDemo: 'DBL_Power_Training_Demo.xlsx',
      clean: 'DBL_Power_Clean_Sample.xlsx',
      autoFix: 'DBL_Power_AutoFix_Demo.xlsx',
      exp: 'DBL_Power_Expected_Cleaned.xlsx',
      gen: genPower,
    },
    {
      id: 'dbl-residential',
      folder: 'DBL/Residential',
      trainingDemo: 'DBL_Residential_Training_Demo.xlsx',
      clean: 'DBL_Residential_Clean_Sample.xlsx',
      autoFix: 'DBL_Residential_AutoFix_Demo.xlsx',
      exp: 'DBL_Residential_Expected_Cleaned.xlsx',
      gen: genResidential,
    },
    {
      id: 'dbl-telecommunication',
      folder: 'DBL/Telecommunication',
      trainingDemo: 'DBL_Telecommunication_Training_Demo.xlsx',
      clean: 'DBL_Telecommunication_Clean_Sample.xlsx',
      autoFix: 'DBL_Telecommunication_AutoFix_Demo.xlsx',
      exp: 'DBL_Telecommunication_Expected_Cleaned.xlsx',
      gen: genTelecommunication,
    },
    {
      id: 'dbl-transportation',
      folder: 'DBL/Transportation',
      trainingDemo: 'DBL_Transportation_Training_Demo.xlsx',
      clean: 'DBL_Transportation_Clean_Sample.xlsx',
      autoFix: 'DBL_Transportation_AutoFix_Demo.xlsx',
      exp: 'DBL_Transportation_Expected_Cleaned.xlsx',
      gen: genTransportation,
    },
    {
      id: 'dbl-water',
      folder: 'DBL/Water',
      trainingDemo: 'DBL_Water_Training_Demo.xlsx',
      clean: 'DBL_Water_Clean_Sample.xlsx',
      autoFix: 'DBL_Water_AutoFix_Demo.xlsx',
      exp: 'DBL_Water_Expected_Cleaned.xlsx',
      gen: genWater,
    },

    {
      id: 'odessee-household',
      folder: 'ODeSSEE/Barangay-Household',
      trainingDemo: 'ODeSSEE_Household_Training_Demo.xlsx',
      clean: 'ODeSSEE_Barangay_Household_Clean_Sample.xlsx',
      autoFix: 'ODeSSEE_Barangay_Household_AutoFix_Demo.xlsx',
      exp: 'ODeSSEE_Barangay_Household_Expected_Cleaned.xlsx',
      gen: genHousehold,
    },
    {
      id: 'odessee-covid',
      folder: 'ODeSSEE/COVID-Cases',
      trainingDemo: 'ODeSSEE_COVID_Training_Demo.xlsx',
      clean: 'ODeSSEE_COVID_Cases_Clean_Sample.xlsx',
      autoFix: 'ODeSSEE_COVID_Cases_AutoFix_Demo.xlsx',
      exp: 'ODeSSEE_COVID_Cases_Expected_Cleaned.xlsx',
      gen: genCovid,
    },
    {
      id: 'odessee-disaster',
      folder: 'ODeSSEE/Disaster-Incident',
      trainingDemo: 'ODeSSEE_DisasterIncident_Training_Demo.xlsx',
      clean: 'ODeSSEE_Disaster_Incident_Clean_Sample.xlsx',
      autoFix: 'ODeSSEE_Disaster_Incident_AutoFix_Demo.xlsx',
      exp: 'ODeSSEE_Disaster_Incident_Expected_Cleaned.xlsx',
      gen: genDisaster,
    },
    {
      id: 'odessee-drrm',
      folder: 'ODeSSEE/DRRM-Resources',
      trainingDemo: 'ODeSSEE_DRRMResources_Training_Demo.xlsx',
      clean: 'ODeSSEE_DRRM_Resources_Clean_Sample.xlsx',
      autoFix: 'ODeSSEE_DRRM_Resources_AutoFix_Demo.xlsx',
      exp: 'ODeSSEE_DRRM_Resources_Expected_Cleaned.xlsx',
      gen: genDrrm,
    },
    {
      id: 'odessee-evacuation',
      folder: 'ODeSSEE/Evacuation-Sites',
      trainingDemo: 'ODeSSEE_EvacuationSites_Training_Demo.xlsx',
      clean: 'ODeSSEE_Evacuation_Sites_Clean_Sample.xlsx',
      autoFix: 'ODeSSEE_Evacuation_Sites_AutoFix_Demo.xlsx',
      exp: 'ODeSSEE_Evacuation_Sites_Expected_Cleaned.xlsx',
      gen: genEvacuation,
    },
    {
      id: 'odessee-flood',
      folder: 'ODeSSEE/Flood-Susceptibility',
      trainingDemo: 'ODeSSEE_FloodSusceptibility_Training_Demo.xlsx',
      clean: 'ODeSSEE_Flood_Susceptibility_Clean_Sample.xlsx',
      autoFix: 'ODeSSEE_Flood_Susceptibility_AutoFix_Demo.xlsx',
      exp: 'ODeSSEE_Flood_Susceptibility_Expected_Cleaned.xlsx',
      gen: genFlood,
    },
    {
      id: 'odessee-vra',
      folder: 'ODeSSEE/Vulnerability-Risk',
      trainingDemo: 'ODeSSEE_VRA_Training_Demo.xlsx',
      clean: 'ODeSSEE_Vulnerability_Risk_Clean_Sample.xlsx',
      autoFix: 'ODeSSEE_Vulnerability_Risk_AutoFix_Demo.xlsx',
      exp: 'ODeSSEE_Vulnerability_Risk_Expected_Cleaned.xlsx',
      gen: genVra,
    },
  ];

  const results: DatasetResult[] = [];
  const baseDir = path.resolve('training-data');

  for (const cfg of configs) {
    const dataset = getDatasetById(cfg.id)!;
    const { cleanRows, autoFixRows, autoFixIssues, mustFixIssues } = cfg.gen();
    const headers = dataset.fields.map((f) => f.officialHeader);
    const headerRowIndex = dataset.headerRowIndex || 1;
    const sheetName = dataset.officialSheetName || 'Data';

    const folderAbs = path.join(baseDir, cfg.folder);
    const cleanPath = path.join(folderAbs, cfg.clean);
    const autoFixPath = path.join(folderAbs, cfg.autoFix);
    const expPath = path.join(folderAbs, cfg.exp);

    // Named user demo files
    const subfolderDemoPath = path.join(folderAbs, cfg.trainingDemo);
    const rootDemoPath = path.join(baseDir, cfg.trainingDemo);

    // 1. Write Clean Reference Sample (25 records, 100% valid)
    writeWorkbook(cleanPath, sheetName, headers, cleanRows, headerRowIndex);

    // 2. Write Auto-Fix Demo Sample (25 records: 12 valid, 9 auto-fix, 4 must be fixed)
    writeWorkbook(autoFixPath, sheetName, headers, autoFixRows, headerRowIndex);
    writeWorkbook(subfolderDemoPath, sheetName, headers, autoFixRows, headerRowIndex);
    writeWorkbook(rootDemoPath, sheetName, headers, autoFixRows, headerRowIndex);

    // 3. Write Expected Cleaned Result (25 records, 100% valid)
    writeWorkbook(expPath, sheetName, headers, cleanRows, headerRowIndex);

    // ========================================================================
    // PHASE 1: VERIFY INITIAL UPLOAD ON THE ACTUAL EXCEL FILE
    // ========================================================================
    const parsedDemo = readWorkbook(rootDemoPath, headerRowIndex);
    const initialRes = validateDataset(parsedDemo.rawRows, dataset);
    const initialReport = calculateQualityReport(initialRes.records, initialRes.allIssues, dataset, {
      matchedColumns: dataset.fields.map((f) => ({ uploaded: f.officialHeader, template: f.officialHeader })),
      missingColumns: [],
      extraColumns: [],
      templateMatchScore: 100,
      isOldOrIncompleteTemplate: false,
    });

    if (
      initialReport.totalRecords !== 25 ||
      initialReport.validRecords !== 12 ||
      initialReport.autoFixAvailableRecords !== 9 ||
      initialReport.errorRecords !== 4 ||
      initialReport.reviewRecords !== 0
    ) {
      console.error(
        `FAILED INITIAL STATS FOR ${dataset.name}: Total=${initialReport.totalRecords}, Valid=${initialReport.validRecords} (exp 12), AutoFix=${initialReport.autoFixAvailableRecords} (exp 9), Error=${initialReport.errorRecords} (exp 4), Review=${initialReport.reviewRecords} (exp 0)`,
        initialRes.allIssues
      );
      process.exit(1);
    }

    // ========================================================================
    // PHASE 2: VERIFY AFTER "Fix All Automatically"
    // ========================================================================
    const fixedRes = applyAllSafeFixes(initialRes.records, dataset);
    const afterFixReport = calculateQualityReport(fixedRes.records, fixedRes.allIssues, dataset, {
      matchedColumns: dataset.fields.map((f) => ({ uploaded: f.officialHeader, template: f.officialHeader })),
      missingColumns: [],
      extraColumns: [],
      templateMatchScore: 100,
      isOldOrIncompleteTemplate: false,
    });

    if (
      afterFixReport.validRecords !== 21 ||
      afterFixReport.errorRecords !== 4 ||
      afterFixReport.autoCleanedRecords !== 9 ||
      afterFixReport.autoFixAvailableRecords !== 0 ||
      afterFixReport.reviewRecords !== 0
    ) {
      console.error(
        `FAILED AFTER-FIX STATS FOR ${dataset.name}: Valid=${afterFixReport.validRecords} (exp 21), AutoCleaned=${afterFixReport.autoCleanedRecords} (exp 9), Error=${afterFixReport.errorRecords} (exp 4), AutoFixAvailable=${afterFixReport.autoFixAvailableRecords} (exp 0)`,
        fixedRes.allIssues
      );
      process.exit(1);
    }

    // ========================================================================
    // PHASE 3: VERIFY MANUAL RESOLUTION OF 4 BLOCKING ERRORS
    // ========================================================================
    // Manually replace records 22-25 with known valid records from cleanRows
    const manuallyCorrectedRows = fixedRes.records.map((r, rIdx) => {
      const rowObj: Record<string, unknown> = {};
      for (const f of dataset.fields) {
        if (rIdx >= 21) {
          // Row was manually corrected by user
          rowObj[f.officialHeader] = cleanRows[rIdx][f.officialHeader];
        } else {
          // Preserved working/cleaned value
          rowObj[f.officialHeader] = r[f.officialHeader];
        }
      }
      return rowObj;
    });

    const manualCorrectedRes = validateDataset(manuallyCorrectedRows, dataset);
    const manualReport = calculateQualityReport(manualCorrectedRes.records, manualCorrectedRes.allIssues, dataset, {
      matchedColumns: dataset.fields.map((f) => ({ uploaded: f.officialHeader, template: f.officialHeader })),
      missingColumns: [],
      extraColumns: [],
      templateMatchScore: 100,
      isOldOrIncompleteTemplate: false,
    });

    if (
      manualReport.totalRecords !== 25 ||
      manualReport.validRecords !== 25 ||
      manualReport.errorRecords !== 0 ||
      manualReport.autoFixAvailableRecords !== 0 ||
      manualReport.reviewRecords !== 0 ||
      manualReport.readinessScore !== 100
    ) {
      console.error(
        `FAILED MANUAL CORRECTION TEST FOR ${dataset.name}: Valid=${manualReport.validRecords} (exp 25), Error=${manualReport.errorRecords} (exp 0), Score=${manualReport.readinessScore} (exp 100)`
      );
      process.exit(1);
    }

    results.push({
      datasetId: cfg.id,
      system: dataset.system,
      name: dataset.name,
      trainingDemoFileName: cfg.trainingDemo,
      folderPath: `training-data/${cfg.folder}`,
      cleanFile: cfg.clean,
      autoFixFile: cfg.autoFix,
      expectedFile: cfg.exp,
      recordCount: 25,
      initialValid: initialReport.validRecords,
      initialAutoFix: initialReport.autoFixAvailableRecords,
      initialError: initialReport.errorRecords,
      afterFixValid: afterFixReport.validRecords,
      afterFixCleaned: afterFixReport.autoCleanedRecords,
      afterFixError: afterFixReport.errorRecords,
      finalValid: manualReport.validRecords,
      finalError: manualReport.errorRecords,
      readinessTitle: 'Ready for Official Import',
      autoFixIssues,
      mustFixIssues,
    });

    console.log(
      `[PASS] ${dataset.system} ${dataset.name}: 25 rows -> Initial (Valid: ${initialReport.validRecords}, Auto-Fix Available: ${initialReport.autoFixAvailableRecords}, Must Be Fixed: ${initialReport.errorRecords}) -> After Fix All (Valid: ${afterFixReport.validRecords}, Cleaned: ${afterFixReport.autoCleanedRecords}, Must Be Fixed: ${afterFixReport.errorRecords}) -> Final Clean (Valid: ${manualReport.validRecords}, Must Be Fixed: 0, 100% Ready for Official Import)`
    );
  }

  updateGuide(results);
  console.log('\n================================================================');
  console.log('✓ ALL 15 DATASET DEMO PACKAGES GENERATED AND VERIFIED (100% PASS)');
  console.log('================================================================');
}

function updateGuide(results: DatasetResult[]) {
  const guidePath = path.resolve('training-data/DEMO_DATA_GUIDE.md');

  let md = `# DataClean — Training & Demonstration Dataset Package Guide
## Capacity Building for DBL & ODeSSEE Data Cleaning & Official Population (3-Status Model)

> **DISCLAIMER & NOTICE**  
> All records in this training package are **100% fictional demonstration data**.  
> These files do **NOT** contain or copy any personal, household, business, or public utility records from any actual Local Government Unit.  
> Used strictly for instructional demonstration of DataClean's **Fix All Automatically** and **Must Be Fixed** resolution workflows.
> 
> **3-Status Model Compliance**:
> 1. ✅ **VALID** — Complies with the official template and all validation rules. Zero action required.
> 2. ✨ **AUTO-FIX AVAILABLE** — Contains only deterministic formatting or standardization problems that DataClean can resolve automatically.
> 3. ❌ **MUST BE FIXED** — Contains blocking problems (missing required values, prohibited negative values, out-of-range coordinates/dates, duplicates) requiring human correction.
> 
> *There is NO "Needs Review" category in DataClean.*

---

## 1. Master Training Demonstration Files

All 15 official training demo datasets contain **exactly 25 records**:
- **Records 1–12**: ✅ **Valid** (12 rows)
- **Records 13–21**: ✨ **Auto-Fix Available** (9 rows)
- **Records 22–25**: ❌ **Must Be Fixed** (4 rows)

### Primary Training Demo Files (Direct Access):
| System | Dataset | Training Demo File | Relative Path |
|---|---|---|---|
`;

  results.forEach((r) => {
    md += `| **${r.system}** | ${r.name} | \`${r.trainingDemoFileName}\` | \`training-data/${r.trainingDemoFileName}\` |\n`;
  });

  md += `\n---

## 2. Master Package Summary Table (Verified by DataClean Validation Engine)

| # | System | Dataset Name | Total Records | Initial State (On Upload) | After "Fix All Automatically" | After Human Correction |
|---|---|---|---|---|---|---|
`;

  results.forEach((r, idx) => {
    md += `| ${idx + 1} | **${r.system}** | ${r.name} | ${r.recordCount} | Valid: ${r.initialValid}, Auto-Fix: ${r.initialAutoFix}, Must Fix: ${r.initialError} | Valid: ${r.afterFixValid}, Cleaned: ${r.afterFixCleaned}, Must Fix: ${r.afterFixError} | Valid: ${r.finalValid}, Must Fix: 0 (100% Ready) |\n`;
  });

  md += `\n---

## 3. Recommended Live Demonstration Walkthrough

### Priority 1: DBL Water (5-Minute Live Demo)
**Why:** Water consumption records feature leading-zero customer account numbers, numeric consumption units (\`cu.m\`), and date standardization.

#### Presenter Workflow:
1. **Select System & Dataset**: On Home screen, select **DBL** $\\rightarrow$ **Water**.
2. **Upload Auto-Fix Demo**: Upload \`DBL_Water_Training_Demo.xlsx\` (or \`training-data/DBL/Water/DBL_Water_AutoFix_Demo.xlsx\`).
3. **Inspect Initial Findings (No Automatic Modifications on Upload)**:
   - Total Records: **25**
   - Valid: **12**
   - Auto-Fix Available: **9**
   - Must Be Fixed: **4**
   - Title: **"Action Required"**
4. **Click "Fix All Automatically"**:
   - DataClean deterministically converts all 9 auto-fix records in one click:
     - Record 13: \`" 22.4 cu.m "\` $\\rightarrow$ \`22.4\`
     - Record 14: \`"01/31/2026"\` $\\rightarrow$ \`"2026-01-31"\`
     - Record 15: \`"  Rizal   Street  "\` $\\rightarrow$ \`"Rizal Street 15"\`
     - Record 16: \`"  00045016  "\` $\\rightarrow$ \`"00045016"\` (Leading zero strictly preserved)
     - Record 17: \`"18.5 cu.m"\` $\\rightarrow$ \`18.5\`
     - Record 18: \`"05/30/2026"\` $\\rightarrow$ \`"2026-05-30"\`
     - Record 19: \`"  Barangay Maligaya  "\` $\\rightarrow$ \`"Barangay Maligaya"\`
     - Record 20: \`"residential"\` $\\rightarrow$ \`"Residential"\`
     - Record 21: \`"Purok IV"\` $\\rightarrow$ \`"Purok 4"\`
   - Valid becomes **21**, Must Be Fixed remains **4**.
   - Notification: *"9 records automatically cleaned. 4 records require user correction."*
5. **Resolve Remaining 4 Issues (Guided Resolution)**:
   - **Record 22**: Fill missing Account Number (\`"00045022"\`).
   - **Record 23**: Correct negative consumption (\`-12.5\` $\\rightarrow$ \`12.5\`).
   - **Records 24–25**: Resolve duplicate account number + billing date pair.
6. **Revalidate**:
   - Valid: **25** (100%)
   - Must Be Fixed: **0**
   - Readiness: **Ready for Official Import**

---

## 4. Comprehensive Dataset-by-Dataset Training Guide
`;

  results.forEach((r, idx) => {
    md += `\n### ${idx + 1}. ${r.system} — ${r.name}\n`;
    md += `- **Primary Training Demo File**: \`training-data/${r.trainingDemoFileName}\`\n`;
    md += `- **Subfolder Reference Files**: \`${r.folderPath}/\`\n`;
    md += `  - \`${r.cleanFile}\` (Clean reference sample, 25 records)\n`;
    md += `  - \`${r.autoFixFile}\` (Auto-fix demo sample, 25 records)\n`;
    md += `  - \`${r.expectedFile}\` (Expected cleaned result, 25 records)\n\n`;

    md += `#### Records 1–12 — Valid (12 Records)\n`;
    md += `Records 1 through 12 are 100% valid and comply fully with official template standards, correct data types, valid coordinates/dates, and unique identifiers. Zero action required.\n\n`;

    md += `#### Records 13–21 — Auto-Fix Available (9 Records)\n`;
    md += `These records contain only safe, deterministic formatting issues supported by DataClean's auto-cleaner. They are preserved intact upon upload and resolved when the user clicks **"Fix All Automatically"**.\n\n`;
    md += `| Record # | Expected Status | Field With Issue | Original Value | Expected Auto-Fix | Rule Triggered |\n`;
    md += `|---|---|---|---|---|---|\n`;

    r.autoFixIssues.forEach((iss) => {
      md += `| **Record ${iss.recordNumber}** (Row ${iss.excelRow}) | ✨ AUTO-FIX AVAILABLE | \`${iss.field}\` | \`${iss.before}\` | \`${iss.after}\` | \`${iss.ruleId}\` — ${iss.action} |\n`;
    });

    md += `\n#### Records 22–25 — Must Be Fixed (4 Records)\n`;
    md += `These records contain blocking issues that cannot be guessed or fabricated automatically. They require explicit human intervention before official import.\n\n`;
    md += `| Record # | Expected Status | Field With Issue | Original Value | Required Human Action | Rule Triggered | Blocking Reason |\n`;
    md += `|---|---|---|---|---|---|---|\n`;

    r.mustFixIssues.forEach((iss) => {
      md += `| **Record ${iss.recordNumber}** (Row ${iss.excelRow}) | ❌ MUST BE FIXED | \`${iss.field}\` | \`${iss.originalValue}\` | ${iss.requiredAction} | \`${iss.ruleId}\` | ${iss.blockingReason} |\n`;
    });

    md += `\n#### Verification Lifecycle for ${r.name}:\n`;
    md += `- **Initial Upload**: 12 Valid, 9 Auto-Fix Available, 4 Must Be Fixed (Status: Action Required)\n`;
    md += `- **Click "Fix All Automatically"**: 21 Valid, 0 Auto-Fix Available, 4 Must Be Fixed, 9 Auto-Cleaned\n`;
    md += `- **Manual Correction**: 25 Valid, 0 Must Be Fixed (100% Ready for Official Import)\n`;
  });

  md += `\n---
*Package generated and verified automatically by DataClean 3-Status Engine.*
`;

  fs.writeFileSync(guidePath, md, 'utf8');
}

run().catch((err) => {
  console.error('Fatal error during demo generation:', err);
  process.exit(1);
});
