import { ParsedWorkbook } from '../../parser/excelParser';

/**
 * Realistic DBL Water Test Datasets covering all required validation & cleaning scenarios.
 */

// 1. Realistic Test Dataset with all issue types
export const WATER_SAMPLE_WITH_ISSUES: Record<string, unknown>[] = [
  // Row 1 (Row 2 in Excel): Completely valid
  {
    'Account Number': 'TEST-LUC-WTR-0000001',
    'Type': 'Residential',
    'Consumption': 15.5,
    'Street': 'National Road',
    'Purok': 'Purok 1',
    'Barangay': 'Barangay 1',
    'Billing Date': '2026-05-30',
  },
  // Row 2: Extra whitespace (leading, trailing, and internal double spaces)
  {
    'Account Number': '  TEST-LUC-WTR-0000002   ',
    'Type': ' Commercial A  ',
    'Consumption': '  22.4 cu.m ',
    'Street': '  Mabini   Street  ',
    'Purok': '  Purok   2 ',
    'Barangay': ' Barangay 1  ',
    'Billing Date': ' 2026-05-30 ',
  },
  // Row 3: Missing Account Number (Mandatory Error - Cannot Fabricate!)
  {
    'Account Number': '',
    'Type': 'Residential',
    'Consumption': 18.0,
    'Street': 'Rizal Avenue',
    'Purok': 'Purok 3',
    'Barangay': 'Barangay 2',
    'Billing Date': '2026-05-30',
  },
  // Row 4: Negative Consumption (Error)
  {
    'Account Number': 'TEST-LUC-WTR-0000004',
    'Type': 'Commercial B',
    'Consumption': -5.2,
    'Street': 'Burgos Street',
    'Purok': 'Purok 1',
    'Barangay': 'Barangay 1',
    'Billing Date': '2026-05-30',
  },
  // Row 5: Invalid Consumption (Non-numeric text)
  {
    'Account Number': 'TEST-LUC-WTR-0000005',
    'Type': 'Industrial',
    'Consumption': 'N/A',
    'Street': 'Quezon Avenue',
    'Purok': 'Purok 4',
    'Barangay': 'Barangay 3',
    'Billing Date': '2026-05-30',
  },
  // Row 6: Invalid Billing Date (Malformed date string)
  {
    'Account Number': 'TEST-LUC-WTR-0000006',
    'Type': 'Residential',
    'Consumption': 12.0,
    'Street': 'Bonifacio Street',
    'Purok': 'Purok 2',
    'Barangay': 'Barangay 1',
    'Billing Date': '2026-02-31', // Feb 31 does not exist!
  },
  // Row 7: Future Billing Date (> 1 year ahead)
  {
    'Account Number': 'TEST-LUC-WTR-0000007',
    'Type': 'Residential',
    'Consumption': 8.5,
    'Street': 'Luna Street',
    'Purok': 'Purok 3',
    'Barangay': 'Barangay 2',
    'Billing Date': '2029-12-31',
  },
  // Row 8: Duplicate record (Same Account Number + Billing Date as Row 1!)
  {
    'Account Number': 'TEST-LUC-WTR-0000001',
    'Type': 'Residential',
    'Consumption': 15.5,
    'Street': 'National Road',
    'Purok': 'Purok 1',
    'Barangay': 'Barangay 1',
    'Billing Date': '2026-05-30',
  },
  // Row 9: Missing Street (Optional - must remain blank, never fabricate)
  {
    'Account Number': 'TEST-LUC-WTR-0000009',
    'Type': 'Commercial A',
    'Consumption': 45.0,
    'Street': '',
    'Purok': 'Purok 5',
    'Barangay': 'Barangay 4',
    'Billing Date': '2026-05-30',
  },
  // Row 10: Missing Purok (Optional - must remain blank, never fabricate)
  {
    'Account Number': 'TEST-LUC-WTR-0000010',
    'Type': 'Residential',
    'Consumption': 14.2,
    'Street': 'Del Pilar Street',
    'Purok': '',
    'Barangay': 'Barangay 1',
    'Billing Date': '2026-05-30',
  },
  // Row 11: Leading-zero Account Number (e.g. numeric "00045892" must retain zeros)
  {
    'Account Number': '00045892',
    'Type': 'Institutional',
    'Consumption': '₱120.50', // Currency symbol should be safely auto-fixed
    'Street': 'Govic Highway',
    'Purok': 'Purok 1',
    'Barangay': 'Barangay 5',
    'Billing Date': '05/30/2026', // Slash format normalized to ISO
  },
  // Row 12: Unknown Type (Review level - suggested standard category)
  {
    'Account Number': 'TEST-LUC-WTR-0000012',
    'Type': 'Commercial-A', // Hyphenated variant, should suggest "Commercial A"
    'Consumption': 33.1,
    'Street': 'Maharlika Highway',
    'Purok': 'Purok 2',
    'Barangay': 'Barangay 2',
    'Billing Date': '2026-05-30',
  },
  // Row 13: Purok with Roman Numeral (e.g. "Purok IV" -> Suggested "Purok 4")
  {
    'Account Number': 'TEST-LUC-WTR-0000013',
    'Type': 'Residential',
    'Consumption': 9.8,
    'Street': 'Bayanihan Road',
    'Purok': 'Purok IV',
    'Barangay': 'Barangay 3',
    'Billing Date': '2026-05-30',
  },
  // Row 14: Missing Barangay (Mandatory Error - Cannot Fabricate!)
  {
    'Account Number': 'TEST-LUC-WTR-0000014',
    'Type': 'Residential',
    'Consumption': 11.0,
    'Street': 'Silang Street',
    'Purok': 'Purok 1',
    'Barangay': '',
    'Billing Date': '2026-05-30',
  },
];

// 2. 100% Clean Valid Water Dataset
export const WATER_SAMPLE_VALID: Record<string, unknown>[] = [
  {
    'Account Number': 'TEST-LUC-WTR-0000101',
    'Type': 'Residential',
    'Consumption': 14.5,
    'Street': 'National Road',
    'Purok': 'Purok 1',
    'Barangay': 'Barangay 1',
    'Billing Date': '2026-05-30',
  },
  {
    'Account Number': 'TEST-LUC-WTR-0000102',
    'Type': 'Commercial A',
    'Consumption': 35.0,
    'Street': 'Mabini Street',
    'Purok': 'Purok 2',
    'Barangay': 'Barangay 2',
    'Billing Date': '2026-05-30',
  },
  {
    'Account Number': 'TEST-LUC-WTR-0000103',
    'Type': 'Industrial',
    'Consumption': 140.2,
    'Street': 'Industrial Zone Road',
    'Purok': 'Purok 3',
    'Barangay': 'Barangay 3',
    'Billing Date': '2026-05-30',
  },
  {
    'Account Number': 'TEST-LUC-WTR-0000104',
    'Type': 'Institutional',
    'Consumption': 52.8,
    'Street': 'Capitol Boulevard',
    'Purok': 'Purok 1',
    'Barangay': 'Barangay 1',
    'Billing Date': '2026-05-30',
  },
];

// 3. Old Template Water Dataset (Missing Street and Purok columns entirely)
export const WATER_SAMPLE_OLD_TEMPLATE: Record<string, unknown>[] = [
  {
    'Account Number': 'TEST-OLD-WTR-0001',
    'Type': 'Residential',
    'Consumption': 19.5,
    'Barangay': 'Barangay 1',
    'Billing Date': '2026-05-30',
  },
  {
    'Account Number': 'TEST-OLD-WTR-0002',
    'Type': 'Commercial A',
    'Consumption': 42.0,
    'Barangay': 'Barangay 2',
    'Billing Date': '2026-05-30',
  },
  {
    'Account Number': 'TEST-OLD-WTR-0003',
    'Type': 'Institutional',
    'Consumption': 88.4,
    'Barangay': 'Barangay 3',
    'Billing Date': '2026-05-30',
  },
];

// 4. Unrelated Excel Dataset
export const UNRELATED_SAMPLE: Record<string, unknown>[] = [
  {
    'Invoice ID': 'INV-9921',
    'Customer Name': 'John Doe',
    'Product SKU': 'SKU-0012',
    'Unit Price': 499.0,
    'Quantity Sold': 3,
    'Payment Method': 'Credit Card',
  },
  {
    'Invoice ID': 'INV-9922',
    'Customer Name': 'Jane Smith',
    'Product SKU': 'SKU-0099',
    'Unit Price': 1200.0,
    'Quantity Sold': 1,
    'Payment Method': 'Bank Transfer',
  },
];

export function getMockWorkbook(sampleType: 'issues' | 'valid' | 'old' | 'unrelated'): ParsedWorkbook {
  if (sampleType === 'valid') {
    return {
      fileName: 'Water_Valid_Dataset.xlsx',
      fileSize: 45200,
      sheetNames: ['Data'],
      selectedSheet: 'Data',
      headerRowIndex: 1,
      headers: ['Account Number', 'Type', 'Consumption', 'Street', 'Purok', 'Barangay', 'Billing Date'],
      rawRows: WATER_SAMPLE_VALID,
      totalRows: WATER_SAMPLE_VALID.length,
    };
  }

  if (sampleType === 'old') {
    return {
      fileName: 'Water_Old_Template_File.xlsx',
      fileSize: 38100,
      sheetNames: ['Water Data'],
      selectedSheet: 'Water Data',
      headerRowIndex: 1,
      headers: ['Account Number', 'Type', 'Consumption', 'Barangay', 'Billing Date'],
      rawRows: WATER_SAMPLE_OLD_TEMPLATE,
      totalRows: WATER_SAMPLE_OLD_TEMPLATE.length,
    };
  }

  if (sampleType === 'unrelated') {
    return {
      fileName: 'Quarterly_Sales_Invoices.xlsx',
      fileSize: 29500,
      sheetNames: ['Invoices'],
      selectedSheet: 'Invoices',
      headerRowIndex: 1,
      headers: ['Invoice ID', 'Customer Name', 'Product SKU', 'Unit Price', 'Quantity Sold', 'Payment Method'],
      rawRows: UNRELATED_SAMPLE,
      totalRows: UNRELATED_SAMPLE.length,
    };
  }

  // Default: realistic test with issues
  return {
    fileName: 'Water_LGU_Submission_With_Issues.xlsx',
    fileSize: 56300,
    sheetNames: ['Data', 'Instructions'],
    selectedSheet: 'Data',
    headerRowIndex: 1,
    headers: ['Account Number', 'Type', 'Consumption', 'Street', 'Purok', 'Barangay', 'Billing Date'],
    rawRows: WATER_SAMPLE_WITH_ISSUES,
    totalRows: WATER_SAMPLE_WITH_ISSUES.length,
  };
}
