import { ParsedWorkbook } from '../../parser/excelParser';
import {
  WATER_SAMPLE_WITH_ISSUES,
  WATER_SAMPLE_VALID,
  WATER_SAMPLE_OLD_TEMPLATE,
} from './waterTestData';

// -------------------------------------------------------------
// 1. BUSINESS TEST SAMPLES
// -------------------------------------------------------------
export const BUSINESS_SAMPLE_ISSUES: Record<string, unknown>[] = [
  // Valid row
  {
    'Line of Business (DTI)': 'Real estate activities with own or leased property',
    'DTI Sub Category': 'Renting and operating of self-owned or leased residential buildings and dwellings',
    'PSIC Sub-Class Code': '68101',
    'Business Trade Name': 'VILLASENOR REAL ESTATE LEASING',
    'Street': 'National Road',
    'Purok': 'Purok 1',
    'Barangay': 'Barangay 1',
    'Latitude': 13.9382,
    'Longitude': 121.6132,
    'Registration Date (mm/dd/yy)': '2026-01-15',
    'Permit Status': 'Renewal',
    'Gross Sales': 240000,
    'Total Male Employees': 2,
    'Total Female Employees': 3,
  },
  // Whitespace + leading zero PSIC code + invalid date format
  {
    'Line of Business (DTI)': ' Retail sale of food  ',
    'DTI Sub Category': 'Convenience store',
    'PSIC Sub-Class Code': '04711', // leading zero must be preserved!
    'Business Trade Name': '  ALPHA CORNER STORE   ',
    'Street': '  Burgos   Street ',
    'Purok': 'Purok 2',
    'Barangay': 'Barangay 2',
    'Latitude': '13.9400',
    'Longitude': '121.6150',
    'Registration Date (mm/dd/yy)': '11/18/26', // converted to ISO
    'Permit Status': 'New',
    'Gross Sales': '₱150,000.00', // auto-fixed to 150000
    'Total Male Employees': 1,
    'Total Female Employees': 1,
  },
  // Missing required Business Trade Name (Mandatory error)
  {
    'Line of Business (DTI)': 'Food service',
    'DTI Sub Category': 'Restaurants',
    'PSIC Sub-Class Code': '56101',
    'Business Trade Name': '', // ERROR: cannot fabricate
    'Street': 'Luna Street',
    'Purok': 'Purok 3',
    'Barangay': 'Barangay 1',
    'Registration Date (mm/dd/yy)': '2026-02-10',
    'Permit Status': 'Renewal',
  },
  // Negative Gross Sales (Error) + Unrecognized Permit Status (Review)
  {
    'Line of Business (DTI)': 'General Merchandise',
    'DTI Sub Category': 'Retail',
    'PSIC Sub-Class Code': '47190',
    'Business Trade Name': 'BETA GENERAL MERCHANDISE',
    'Street': 'Rizal Avenue',
    'Purok': 'Purok IV', // Roman numeral Purok
    'Barangay': 'Barangay 3',
    'Registration Date (mm/dd/yy)': '2026-03-01',
    'Permit Status': 'Pending Application', // Review
    'Gross Sales': -50000, // Error: negative sales
    'Total Male Employees': -1, // Error: negative employee
  },
  // Duplicate Record (Same Trade Name + Barangay + Street as Row 1)
  {
    'Line of Business (DTI)': 'Real estate activities',
    'DTI Sub Category': 'Leasing',
    'PSIC Sub-Class Code': '68101',
    'Business Trade Name': 'VILLASENOR REAL ESTATE LEASING',
    'Street': 'National Road',
    'Purok': 'Purok 1',
    'Barangay': 'Barangay 1',
    'Registration Date (mm/dd/yy)': '2026-01-15',
    'Permit Status': 'Renewal',
  },
];

// -------------------------------------------------------------
// 2. CRIME TEST SAMPLES
// -------------------------------------------------------------
export const CRIME_SAMPLE_ISSUES: Record<string, unknown>[] = [
  // Valid record
  {
    'Blotter Number': 'BLOTTER-2024-001',
    'Datetime Reported': '2024-10-15 10:30:00',
    'Datetime Committed': '2024-10-15 08:00:00',
    'Sub Violation': 'Physical Injuries',
    'PSCCS Sub-Class Code': '806102',
    'Violation Name': 'Less Serious Physical Injuries',
    'Complainant Gender': 'Male',
    'Respondent Gender': 'Female',
    'Street': 'National Road',
    'Purok': 'Purok 1',
    'Barangay': 'Barangay 1',
    'Latitude': 13.9382,
    'Longitude': 121.6132,
  },
  // Whitespace + Datetime formatting + Unknown Gender
  {
    'Blotter Number': '  BLOTTER-2024-002  ',
    'Datetime Reported': '10/16/2024 14:00',
    'Datetime Committed': '10/16/2024 12:30',
    'PSCCS Sub-Class Code': '080120', // leading zero
    'Violation Name': 'Theft',
    'Complainant Gender': 'Non-Binary', // Review
    'Barangay': 'Barangay 2',
  },
  // Missing Blotter Number (Error)
  {
    'Blotter Number': '', // Error
    'Datetime Reported': '2024-10-17 09:00:00',
    'Datetime Committed': '2024-10-17 08:00:00',
    'PSCCS Sub-Class Code': '806101',
    'Violation Name': 'Robbery',
    'Barangay': 'Barangay 1',
  },
  // Future Datetime Committed (Error)
  {
    'Blotter Number': 'BLOTTER-2024-004',
    'Datetime Reported': '2024-10-18 10:00:00',
    'Datetime Committed': '2030-01-01 10:00:00', // Error: future committed date
    'PSCCS Sub-Class Code': '806101',
    'Violation Name': 'Trespassing',
    'Barangay': 'Barangay 3',
  },
  // Duplicate Blotter Number
  {
    'Blotter Number': 'BLOTTER-2024-001', // Duplicate of Row 1
    'Datetime Reported': '2024-10-19 11:00:00',
    'Datetime Committed': '2024-10-19 10:00:00',
    'PSCCS Sub-Class Code': '806102',
    'Violation Name': 'Assault',
    'Barangay': 'Barangay 1',
  },
];

// -------------------------------------------------------------
// 3. HUMAN RESOURCE TEST SAMPLES
// -------------------------------------------------------------
export const HR_SAMPLE_ISSUES: Record<string, unknown>[] = [
  // Valid row
  {
    'Student Number': 'TEST-STU-0000001',
    'Gender': 'Male',
    'Street': 'National Road',
    'Purok': 'Purok 1',
    'Barangay': 'Barangay 1',
    'School': 'Lucena City College',
    'Course': 'BS Information Technology',
    'Graduation Year': 2025,
  },
  // Whitespace + leading zero id + graduation year string
  {
    'Student Number': ' 00098471 ',
    'Gender': 'Female',
    'Street': 'Mabini Street',
    'Purok': 'Purok 2',
    'Barangay': 'Barangay 2',
    'School': 'TEST SCHOOL 02',
    'Course': 'TVL - Industrial Arts',
    'Graduation Year': ' 2026 ',
  },
  // Missing Student Number (Error)
  {
    'Student Number': '',
    'Gender': 'Male',
    'Barangay': 'Barangay 1',
    'School': 'TEST SCHOOL 03',
    'Graduation Year': 2024,
  },
  // Invalid Graduation Year + Unrecognized Gender (Review)
  {
    'Student Number': 'TEST-STU-0000004',
    'Gender': 'Non-Binary', // Review: Unrecognized gender
    'Barangay': 'Barangay 3',
    'School': 'TEST SCHOOL 01',
    'Graduation Year': 1820, // Error: unrealistic year
  },
  // Duplicate Student Number
  {
    'Student Number': 'TEST-STU-0000001', // Duplicate of Row 1
    'Gender': 'Male',
    'Barangay': 'Barangay 1',
    'School': 'Lucena City College',
    'Graduation Year': 2025,
  },
];

// -------------------------------------------------------------
// 4. POWER TEST SAMPLES
// -------------------------------------------------------------
export const POWER_SAMPLE_ISSUES: Record<string, unknown>[] = [
  // Valid row
  {
    'Account Number': 'TEST-PWR-0000001',
    'Type': 'Residential',
    'Consumption': 142.5,
    'Street': 'National Road',
    'Purok': 'Purok 1',
    'Barangay': 'Barangay 1',
    'Billing Date': '2026-05-30',
  },
  // Whitespace + string consumption with kwh unit
  {
    'Account Number': ' TEST-PWR-0000002 ',
    'Type': ' Commercial - LV ',
    'Consumption': ' 350.2 kwh ',
    'Street': 'Quezon Avenue',
    'Purok': 'Purok 2',
    'Barangay': 'Barangay 2',
    'Billing Date': '05/30/2026',
  },
  // Missing Account Number
  {
    'Account Number': '',
    'Type': 'Residential',
    'Consumption': 80.0,
    'Barangay': 'Barangay 1',
    'Billing Date': '2026-05-30',
  },
  // Negative Consumption + Unrecognized Customer Type (Review)
  {
    'Account Number': 'TEST-PWR-0000004',
    'Type': 'Solar Microgrid', // Review: Unrecognized type
    'Consumption': -25.0,
    'Barangay': 'Barangay 3',
    'Billing Date': '2026-05-30',
  },
  // Duplicate Account Number + Billing Date
  {
    'Account Number': 'TEST-PWR-0000001',
    'Type': 'Residential',
    'Consumption': 142.5,
    'Barangay': 'Barangay 1',
    'Billing Date': '2026-05-30',
  },
];

// -------------------------------------------------------------
// 5. RESIDENTIAL TEST SAMPLES
// -------------------------------------------------------------
export const RESIDENTIAL_SAMPLE_ISSUES: Record<string, unknown>[] = [
  // Valid row
  {
    'CBMS Number': 'CBMS-000000001',
    'Gender': 'Male',
    'Birth Date': '1985-04-12',
    'House No': '428',
    'Street': 'National Road',
    'Purok': 'Purok 1',
    'Barangay': 'Barangay 1',
  },
  // Whitespace + leading zero house no + slash birth date
  {
    'CBMS Number': ' 00049182 ', // leading zero
    'Gender': 'Female',
    'Birth Date': '08/23/1990',
    'House No': '012-A', // must preserve text
    'Street': ' Rizal Street ',
    'Purok': 'Purok 2',
    'Barangay': 'Barangay 2',
  },
  // Missing CBMS Number (Error)
  {
    'CBMS Number': '',
    'Gender': 'Male',
    'Birth Date': '1995-11-05',
    'Barangay': 'Barangay 1',
  },
  // Future Birth Date (Error) + Unrecognized Gender (Review)
  {
    'CBMS Number': 'CBMS-000000004',
    'Gender': 'Undisclosed', // Review: Unrecognized gender
    'Birth Date': '2035-01-01', // Error
    'Barangay': 'Barangay 3',
  },
  // Duplicate CBMS Number
  {
    'CBMS Number': 'CBMS-000000001', // Duplicate of Row 1
    'Gender': 'Male',
    'Birth Date': '1985-04-12',
    'Barangay': 'Barangay 1',
  },
];

// -------------------------------------------------------------
// 6. TELECOMMUNICATIONS TEST SAMPLES
// -------------------------------------------------------------
export const TELECOM_SAMPLE_ISSUES: Record<string, unknown>[] = [
  // Valid row
  {
    'Provider Name': 'Smart Communications',
    'Tower Name': 'TEST TOWER 00001',
    'Tower Code': 'TEST-TWR-00001',
    'Purok': 'Purok 1',
    'Barangay': 'Barangay 1',
    'Location Address': 'ECO TOURISM ROAD, BARANGAY 1',
    'Latitude': 13.9382,
    'Longitude': 121.6132,
    'Tower Type': 'Self-Supporting',
    'Network Technology': 'LTE, 5G',
    'Tower Height': 29.0,
    'Ownership Type': 'Provider-owned',
    'Status': 'Operational',
    'Installation Date': '2022-10-29',
  },
  // Whitespace + string height with 'm' unit
  {
    'Provider Name': ' Globe Telecom ',
    'Tower Name': ' DITO TOWER 02 ',
    'Tower Code': ' 009812 ', // leading zeros
    'Barangay': 'Barangay 2',
    'Tower Type': 'Guyed Tower',
    'Tower Height': ' 45.5 m ',
    'Ownership Type': 'Third-party',
    'Status': 'Under Construction',
    'Installation Date': '2023-05-15',
  },
  // Missing Tower Code (Error)
  {
    'Provider Name': 'DITO Telecommunity',
    'Tower Name': 'TOWER 03',
    'Tower Code': '', // Error
    'Barangay': 'Barangay 1',
    'Tower Type': 'Rooftop',
    'Ownership Type': 'Provider-owned',
    'Installation Date': '2024-01-10',
  },
  // Invalid Coordinates (Latitude > 90) + Unrecognized Tower Type (Review)
  {
    'Provider Name': 'Smart Communications',
    'Tower Name': 'TOWER 04',
    'Tower Code': 'TEST-TWR-00004',
    'Barangay': 'Barangay 1',
    'Latitude': 120.5, // Error: Lat cannot exceed 90!
    'Longitude': 121.6,
    'Tower Type': 'Balloon Tethered', // Review: Unrecognized tower type
    'Ownership Type': 'Provider-owned',
    'Installation Date': '2022-01-01',
  },
  // Duplicate Tower Code
  {
    'Provider Name': 'Smart Communications',
    'Tower Name': 'TEST TOWER 00001',
    'Tower Code': 'TEST-TWR-00001', // Duplicate of Row 1
    'Barangay': 'Barangay 1',
    'Tower Type': 'Self-Supporting',
    'Ownership Type': 'Provider-owned',
    'Installation Date': '2022-10-29',
  },
];

// -------------------------------------------------------------
// 7. TRANSPORTATION TEST SAMPLES
// -------------------------------------------------------------
export const TRANSPORT_SAMPLE_ISSUES: Record<string, unknown>[] = [
  // Valid row
  {
    'Route': 'Barangay 1 - Barangay 2',
    'Available Units': 66,
    'Vehicle Type': 'PUJ',
    'Barangays Covered by Route': 'Barangay 1, Barangay 2',
    'Puroks Covered by Route': 'Barangay 1 :: Purok 1, Barangay 2 :: Purok 1',
  },
  // Whitespace + string units
  {
    'Route': ' Barangay 2 - Poblacion ',
    'Available Units': ' 25 ',
    'Vehicle Type': ' Tricycle ',
    'Barangays Covered by Route': 'Barangay 2, Poblacion',
    'Puroks Covered by Route': 'Barangay 2 :: Purok 1, Poblacion :: Purok 2',
  },
  // Missing Route (Error)
  {
    'Route': '', // Error
    'Available Units': 10,
    'Vehicle Type': 'Bus',
    'Barangays Covered by Route': 'Barangay 1, Barangay 3',
    'Puroks Covered by Route': 'Barangay 1 :: Purok 1',
  },
  // Negative Available Units (Error) + Unrecognized Vehicle Type (Review)
  {
    'Route': 'Barangay 3 - Central',
    'Available Units': -5, // Error: negative count
    'Vehicle Type': 'Hovercraft', // Unrecognized category
    'Barangays Covered by Route': 'Barangay 3, Central',
    'Puroks Covered by Route': 'Barangay 3 :: Purok 1',
  },
  // Duplicate Route + Vehicle Type
  {
    'Route': 'Barangay 1 - Barangay 2', // Duplicate of Row 1
    'Available Units': 30,
    'Vehicle Type': 'PUJ',
    'Barangays Covered by Route': 'Barangay 1, Barangay 2',
    'Puroks Covered by Route': 'Barangay 1 :: Purok 1',
  },
];

export const BUSINESS_SAMPLE_VALID: Record<string, unknown>[] = [BUSINESS_SAMPLE_ISSUES[0]];
export const CRIME_SAMPLE_VALID: Record<string, unknown>[] = [CRIME_SAMPLE_ISSUES[0]];
export const HR_SAMPLE_VALID: Record<string, unknown>[] = [HR_SAMPLE_ISSUES[0]];
export const POWER_SAMPLE_VALID: Record<string, unknown>[] = [POWER_SAMPLE_ISSUES[0]];
export const RESIDENTIAL_SAMPLE_VALID: Record<string, unknown>[] = [RESIDENTIAL_SAMPLE_ISSUES[0]];
export const TELECOM_SAMPLE_VALID: Record<string, unknown>[] = [TELECOM_SAMPLE_ISSUES[0]];
export const TRANSPORT_SAMPLE_VALID: Record<string, unknown>[] = [TRANSPORT_SAMPLE_ISSUES[0]];

export function getDblMockWorkbook(datasetId: string, variant: 'issues' | 'valid' | 'old' = 'issues'): ParsedWorkbook {
  switch (datasetId) {
    case 'dbl-business': {
      const rows = variant === 'valid' ? BUSINESS_SAMPLE_VALID : BUSINESS_SAMPLE_ISSUES;
      return {
        fileName: variant === 'valid' ? 'Business_Valid.xlsx' : 'Business_LGU_Import.xlsx',
        fileSize: 58200,
        sheetNames: ['Data', 'Instructions'],
        selectedSheet: 'Data',
        headerRowIndex: 1,
        headers: [
          'Line of Business (DTI)',
          'DTI Sub Category',
          'PSIC Sub-Class Code',
          'Business Trade Name',
          'Street',
          'Purok',
          'Barangay',
          'Latitude',
          'Longitude',
          'Registration Date (mm/dd/yy)',
          'Permit Status',
          'Gross Sales',
          'Total Male Employees',
          'Total Female Employees',
        ],
        rawRows: rows,
        totalRows: rows.length,
      };
    }

    case 'dbl-crime': {
      const rows = variant === 'valid' ? CRIME_SAMPLE_VALID : CRIME_SAMPLE_ISSUES;
      return {
        fileName: variant === 'valid' ? 'Crime_Valid.xlsx' : 'Crime_Blotter_Records.xlsx',
        fileSize: 58100,
        sheetNames: ['Data', 'Instructions'],
        selectedSheet: 'Data',
        headerRowIndex: 1,
        headers: [
          'Blotter Number',
          'Datetime Reported',
          'Datetime Committed',
          'Sub Violation',
          'PSCCS Sub-Class Code',
          'Violation Name',
          'Complainant Gender',
          'Respondent Gender',
          'Street',
          'Purok',
          'Barangay',
          'Latitude',
          'Longitude',
        ],
        rawRows: rows,
        totalRows: rows.length,
      };
    }

    case 'dbl-human-resource': {
      const rows = variant === 'valid' ? HR_SAMPLE_VALID : HR_SAMPLE_ISSUES;
      return {
        fileName: variant === 'valid' ? 'HR_Valid.xlsx' : 'Human_Resource_Students.xlsx',
        fileSize: 57500,
        sheetNames: ['Data', 'Instructions'],
        selectedSheet: 'Data',
        headerRowIndex: 1,
        headers: ['Student Number', 'Gender', 'Street', 'Purok', 'Barangay', 'School', 'Course', 'Graduation Year'],
        rawRows: rows,
        totalRows: rows.length,
      };
    }

    case 'dbl-power': {
      const rows = variant === 'valid' ? POWER_SAMPLE_VALID : POWER_SAMPLE_ISSUES;
      return {
        fileName: variant === 'valid' ? 'Power_Valid.xlsx' : 'Power_Utility_Bills.xlsx',
        fileSize: 57500,
        sheetNames: ['Data', 'Instructions'],
        selectedSheet: 'Data',
        headerRowIndex: 1,
        headers: ['Account Number', 'Type', 'Consumption', 'Street', 'Purok', 'Barangay', 'Billing Date'],
        rawRows: rows,
        totalRows: rows.length,
      };
    }

    case 'dbl-residential': {
      const rows = variant === 'valid' ? RESIDENTIAL_SAMPLE_VALID : RESIDENTIAL_SAMPLE_ISSUES;
      return {
        fileName: variant === 'valid' ? 'Residential_Valid.xlsx' : 'Residential_CBMS_Profiles.xlsx',
        fileSize: 50800,
        sheetNames: ['Data', 'Instructions'],
        selectedSheet: 'Data',
        headerRowIndex: 1,
        headers: ['CBMS Number', 'Gender', 'Birth Date', 'House No', 'Street', 'Purok', 'Barangay'],
        rawRows: rows,
        totalRows: rows.length,
      };
    }

    case 'dbl-telecommunication': {
      const rows = variant === 'valid' ? TELECOM_SAMPLE_VALID : TELECOM_SAMPLE_ISSUES;
      return {
        fileName: variant === 'valid' ? 'Telecom_Valid.xlsx' : 'Telecommunication_Towers.xlsx',
        fileSize: 58100,
        sheetNames: ['Data', 'Instructions'],
        selectedSheet: 'Data',
        headerRowIndex: 1,
        headers: [
          'Provider Name',
          'Tower Name',
          'Tower Code',
          'Purok',
          'Barangay',
          'Location Address',
          'Latitude',
          'Longitude',
          'Tower Type',
          'Network Technology',
          'Tower Height',
          'Ownership Type',
          'Status',
          'Installation Date',
        ],
        rawRows: rows,
        totalRows: rows.length,
      };
    }

    case 'dbl-transportation': {
      const rows = variant === 'valid' ? TRANSPORT_SAMPLE_VALID : TRANSPORT_SAMPLE_ISSUES;
      return {
        fileName: variant === 'valid' ? 'Transport_Valid.xlsx' : 'Transportation_Routes.xlsx',
        fileSize: 57200,
        sheetNames: ['Data', 'Instructions'],
        selectedSheet: 'Data',
        headerRowIndex: 1,
        headers: ['Route', 'Available Units', 'Vehicle Type', 'Barangays Covered by Route', 'Puroks Covered by Route'],
        rawRows: rows,
        totalRows: rows.length,
      };
    }

    case 'dbl-water':
    default:
      if (variant === 'valid') {
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
      if (variant === 'old') {
        return {
          fileName: 'Water_Old_Template.xlsx',
          fileSize: 38100,
          sheetNames: ['Data'],
          selectedSheet: 'Data',
          headerRowIndex: 1,
          headers: ['Account Number', 'Type', 'Consumption', 'Barangay', 'Billing Date'],
          rawRows: WATER_SAMPLE_OLD_TEMPLATE,
          totalRows: WATER_SAMPLE_OLD_TEMPLATE.length,
        };
      }
      return {
        fileName: 'Water_LGU_Submission.xlsx',
        fileSize: 57400,
        sheetNames: ['Data', 'Instructions'],
        selectedSheet: 'Data',
        headerRowIndex: 1,
        headers: ['Account Number', 'Type', 'Consumption', 'Street', 'Purok', 'Barangay', 'Billing Date'],
        rawRows: WATER_SAMPLE_WITH_ISSUES,
        totalRows: WATER_SAMPLE_WITH_ISSUES.length,
      };
  }
}
