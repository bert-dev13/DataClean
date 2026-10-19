import { ParsedWorkbook } from '../../parser/excelParser';

// -------------------------------------------------------------
// 1. BARANGAY HOUSEHOLD PROFILE TEST SAMPLES
// -------------------------------------------------------------
export const HOUSEHOLD_SAMPLE_ISSUES: Record<string, unknown>[] = [
  // 1. Valid row
  {
    'CBMS#-Ind#': 'CBMS-2024-00101',
    'Gender': 'Male',
    'Civil Status': 'Married',
    'Barangay': 'San Fermin',
    'Purok/Zone': 'Purok 1',
    'Solo Parent(Y/N)': 'N',
    'Birth Date': '1988-06-12',
    'Disability': 'None',
    'Income Classification': 'Low Income',
  },
  // 2. Whitespace + leading zero ID + slash birth date
  {
    'CBMS#-Ind#': ' 00049281 ',
    'Gender': 'Female',
    'Civil Status': 'Single',
    'Barangay': '  San Fermin  ',
    'Purok/Zone': 'Purok 2',
    'Solo Parent(Y/N)': 'Y',
    'Birth Date': '04/15/1992',
    'Disability': 'None',
    'Income Classification': 'Middle Income',
  },
  // 3. Missing required Barangay (Mandatory error - cannot fabricate)
  {
    'CBMS#-Ind#': 'CBMS-2024-00103',
    'Gender': 'Male',
    'Civil Status': 'Single',
    'Barangay': '', // ERROR: cannot fabricate
    'Birth Date': '1995-10-20',
  },
  // 4. Future Birth Date (Error) + Unrecognized Civil Status (Review)
  {
    'CBMS#-Ind#': 'CBMS-2024-00104',
    'Gender': 'Female',
    'Civil Status': 'Complicated', // REVIEW: Unrecognized category
    'Barangay': 'San Fermin',
    'Birth Date': '2035-01-01', // ERROR: Future date
  },
  // 5. Duplicate record (Same CBMS#-Ind# as Row 1)
  {
    'CBMS#-Ind#': 'CBMS-2024-00101',
    'Gender': 'Male',
    'Civil Status': 'Married',
    'Barangay': 'San Fermin',
    'Birth Date': '1988-06-12',
  },
];

export const HOUSEHOLD_SAMPLE_VALID: Record<string, unknown>[] = [HOUSEHOLD_SAMPLE_ISSUES[0]];

// -------------------------------------------------------------
// 2. COVID CASES TEST SAMPLES
// -------------------------------------------------------------
export const COVID_SAMPLE_ISSUES: Record<string, unknown>[] = [
  // 1. Valid row
  {
    'Barangay': 'San Fermin',
    'Facilities': 'City Isolation Center 1',
    'Total Number of Case': 14,
  },
  // 2. Whitespace + string integer count with unit
  {
    'Barangay': '  District 1  ',
    'Facilities': 'RHU Station 2',
    'Total Number of Case': ' 25 cases ',
  },
  // 3. Missing required Barangay (Mandatory error)
  {
    'Barangay': '', // ERROR
    'Facilities': 'Community Quarantine Facility',
    'Total Number of Case': 5,
  },
  // 4. Negative Case Count (Error)
  {
    'Barangay': 'San Fermin',
    'Facilities': 'District Hospital',
    'Total Number of Case': -8, // ERROR: Negative count
  },
  // 5. Duplicate record (Same Barangay + Facilities as Row 1)
  {
    'Barangay': 'San Fermin',
    'Facilities': 'City Isolation Center 1',
    'Total Number of Case': 20,
  },
];

export const COVID_SAMPLE_VALID: Record<string, unknown>[] = [COVID_SAMPLE_ISSUES[0]];

// -------------------------------------------------------------
// 3. DISASTER INCIDENT REPORT TEST SAMPLES
// -------------------------------------------------------------
export const DISASTER_SAMPLE_ISSUES: Record<string, unknown>[] = [
  // 1. Valid row
  {
    'Report Date': '2024-09-15',
    'Incident': 'Typhoon',
    'Incident Date (Date Range)': '2024-09-14 to 2024-09-16',
    'Sky Condition': 'Overcast',
    'Wind': 'Moderate',
    'Precipitation': 'Heavy',
    'Gauging Station': 'Station Alpha',
    'Current Level': 12.5,
    'Areas Likely to be Affected': 'Riverside Barangays',
    'Casualty': 0,
  },
  // 2. Whitespace + Current Level unit + slashed Report Date
  {
    'Report Date': '09/16/2024',
    'Incident': ' Flash Flood ',
    'Incident Date (Date Range)': '2024-09-16',
    'Sky Condition': 'Rainy',
    'Wind': 'Light',
    'Precipitation': 'Moderate',
    'Gauging Station': 'Station Beta',
    'Current Level': ' 14.8 m ',
    'Areas Likely to be Affected': 'Low-lying sectors',
    'Casualty': ' 2 ',
  },
  // 3. Missing required Report Date (Mandatory error)
  {
    'Report Date': '', // ERROR
    'Incident': 'Landslide',
    'Incident Date (Date Range)': '2024-09-17',
    'Areas Likely to be Affected': 'Mountain slope',
  },
  // 4. Negative Casualty Count (Error)
  {
    'Report Date': '2024-09-18',
    'Incident': 'Earthquake',
    'Incident Date (Date Range)': '2024-09-18',
    'Casualty': -3, // ERROR: Negative count
  },
  // 5. Duplicate record (Same Report Date + Incident as Row 1)
  {
    'Report Date': '2024-09-15',
    'Incident': 'Typhoon',
    'Incident Date (Date Range)': '2024-09-14 to 2024-09-16',
    'Gauging Station': 'Station Alpha',
  },
];

export const DISASTER_SAMPLE_VALID: Record<string, unknown>[] = [DISASTER_SAMPLE_ISSUES[0]];

// -------------------------------------------------------------
// 4. DRRM RESOURCES TEST SAMPLES
// -------------------------------------------------------------
export const DRRM_SAMPLE_ISSUES: Record<string, unknown>[] = [
  // 1. Valid row
  {
    'Group/Team': 'Rescue 922',
    'Resources/Equipment': 'Spine Board Stretcher',
    'Quantity': 12,
    'Unit': 'Pc',
    'Category': 'Emergency Medical Equipment',
  },
  // 2. Whitespace + string quantity with units
  {
    'Group/Team': ' BFP Special Operations ',
    'Resources/Equipment': ' Fire Axe ',
    'Quantity': ' 24 pcs ',
    'Unit': 'PCs',
    'Category': 'Extrication Gear',
  },
  // 3. Missing required Quantity (Mandatory error)
  {
    'Group/Team': 'Rescue 922',
    'Resources/Equipment': 'First Aid Kit',
    'Quantity': '', // ERROR: cannot fabricate
    'Unit': 'Sets',
    'Category': 'Medical',
  },
  // 4. Negative Quantity (Error) + Unrecognized Unit (Review)
  {
    'Group/Team': 'Rescue 922',
    'Resources/Equipment': 'Water Pump',
    'Quantity': -5, // ERROR: Negative count
    'Unit': 'Cartons', // REVIEW: Unrecognized unit
    'Category': 'Flood Equipment',
  },
  // 5. Duplicate record (Same Group/Team + Resources/Equipment as Row 1)
  {
    'Group/Team': 'Rescue 922',
    'Resources/Equipment': 'Spine Board Stretcher',
    'Quantity': 6,
    'Unit': 'Pc',
  },
];

export const DRRM_SAMPLE_VALID: Record<string, unknown>[] = [DRRM_SAMPLE_ISSUES[0]];

// -------------------------------------------------------------
// 5. EVACUATION SITES TEST SAMPLES
// -------------------------------------------------------------
export const EVACUATION_SAMPLE_ISSUES: Record<string, unknown>[] = [
  // 1. Valid row
  {
    'Name of Evacuation Center ': 'San Roque Evacuation Center',
    'Barangay': 'Barangay Malinis',
    'Latitude': 14.5995,
    'Longitude': 120.9842,
    'No. of Family': 38,
    'No. of Individuals': 182,
    'No. of Storey/ Floors': 2,
    'No. of Rooms': 10,
    'No. of Toilet for Women': 5,
    'No. of Toilet for Men': 4,
    'Common CR': 3,
    'No. of Bath/ Shower Area for Women': 4,
    'No. of Bath/ Shower Area for Men': 4,
    'Water Source/s': 'Deep well, Water Tank',
    'Breast feeding Area': 'Available',
    'With Storage (Y/N) If yes indicate the floor area': 'Y - 1st floor',
    'Used as COVID-19 TTMF (Y/N)': 'Y',
    'Inspected Safe': 'Y',
  },
  // 2. Whitespace + header without trailing space + string counts
  {
    'Name of Evacuation Center ': ' Central Gymnasium ',
    'Barangay': '  San Nicolas  ',
    'No. of Family': ' 45 ',
    'No. of Individuals': ' 210 ',
    'Breast feeding Area': 'Available',
    'Used as COVID-19 TTMF (Y/N)': 'N',
    'Inspected Safe': 'Y',
  },
  // 3. Missing required Name of Evacuation Center (Mandatory error)
  {
    'Name of Evacuation Center ': '', // ERROR: cannot fabricate
    'Barangay': 'San Nicolas',
    'No. of Family': 10,
  },
  // 4. Invalid Latitude (> 90) + Unrecognized Breast feeding Area (Review)
  {
    'Name of Evacuation Center ': 'North District High School',
    'Barangay': 'Poblacion',
    'Latitude': 135.5, // ERROR: Latitude out of bounds
    'Longitude': 121.0,
    'Breast feeding Area': 'Pending Inspection', // REVIEW
  },
  // 5. Duplicate record (Same Name + Barangay as Row 1)
  {
    'Name of Evacuation Center ': 'San Roque Evacuation Center',
    'Barangay': 'Barangay Malinis',
    'No. of Family': 50,
  },
];

export const EVACUATION_SAMPLE_VALID: Record<string, unknown>[] = [EVACUATION_SAMPLE_ISSUES[0]];

// -------------------------------------------------------------
// 6. FLOOD SUSCEPTIBILITY RATING TEST SAMPLES
// -------------------------------------------------------------
export const FLOOD_SAMPLE_ISSUES: Record<string, unknown>[] = [
  // 1. Valid row
  {
    'Area of Concern': 'Bridge Approach',
    'Barangay Name': 'San Fermin',
    'Barangay Code': '023108001',
    'Municipality Name': 'Cauayan City',
    'Municipality Code': '023108',
    'Geocode': 'PH-02-31-08-001',
    'Purok/Sitio': 'Purok 4',
    'Latitude': 16.9250,
    'Longitude': 121.7700,
    'Susceptibility Rating': 'HF',
    'Flood Height': 1.75,
    'Elevation': 45.3,
    'POI': 'Bridge Point 1',
  },
  // 2. Whitespace + leading zero preservation + flood height unit
  {
    'Area of Concern': ' Riverbank Road ',
    'Barangay Name': 'San Fermin',
    'Barangay Code': '00021345',
    'Municipality Name': 'Cauayan City',
    'Municipality Code': '00231',
    'Geocode': 'PH-00-11-22-333',
    'Purok/Sitio': 'Purok 1',
    'Latitude': 16.9200,
    'Longitude': 121.7650,
    'Susceptibility Rating': 'MF',
    'Flood Height': ' 2.25 m ',
    'Elevation': 40.0,
    'POI': 'School Gate',
  },
  // 3. Missing required Barangay Name (Mandatory error)
  {
    'Area of Concern': 'Market',
    'Barangay Name': '', // ERROR: cannot fabricate
    'Barangay Code': '023108003',
    'Municipality Name': 'Cauayan City',
    'Geocode': 'PH-02-31-08-003',
    'Susceptibility Rating': 'HF',
  },
  // 4. Negative Flood Height (Error) + Unrecognized Rating (Review)
  {
    'Area of Concern': 'Lowland Farmland',
    'Barangay Name': 'San Fermin',
    'Barangay Code': '023108004',
    'Municipality Name': 'Cauayan City',
    'Geocode': 'PH-02-31-08-004',
    'Susceptibility Rating': 'EXTREME_FLOOD', // REVIEW
    'Flood Height': -1.5, // ERROR: Negative height
  },
  // 5. Duplicate record (Same Area of Concern + Barangay Name as Row 1)
  {
    'Area of Concern': 'Bridge Approach',
    'Barangay Name': 'San Fermin',
    'Barangay Code': '023108001',
    'Municipality Name': 'Cauayan City',
    'Geocode': 'PH-02-31-08-001',
    'Susceptibility Rating': 'HF',
  },
];

export const FLOOD_SAMPLE_VALID: Record<string, unknown>[] = [FLOOD_SAMPLE_ISSUES[0]];

// -------------------------------------------------------------
// 7. VULNERABILITY RISK ASSESSMENT TEST SAMPLES
// -------------------------------------------------------------
export const VRA_SAMPLE_ISSUES: Record<string, unknown>[] = [
  // 1. Valid row
  {
    'Area of Concern': 'Riverside Settlers',
    'Barangay Name': 'San Fermin',
    'Purok/Sitio': 'Purok 2',
    'Geocode': 'PH-02-15-01-002',
    'Latitude': 17.6132,
    'Longitude': 121.7269,
    'Susceptibility Rating': 'HF',
    'Concern Category': 'Informal Settlers',
  },
  // 2. Whitespace + leading zero Geocode
  {
    'Area of Concern': ' Commercial District ',
    'Barangay Name': ' Centro ',
    'Purok/Sitio': ' Purok 1 ',
    'Geocode': '00098471',
    'Latitude': 17.6150,
    'Longitude': 121.7280,
    'Susceptibility Rating': 'VHF',
    'Concern Category': 'Business',
  },
  // 3. Missing required Geocode (Mandatory error)
  {
    'Area of Concern': 'School',
    'Barangay Name': 'Centro',
    'Geocode': '', // ERROR: cannot fabricate
    'Susceptibility Rating': 'LF',
  },
  // 4. Invalid Longitude (> 180) + Unrecognized Rating (Review)
  {
    'Area of Concern': 'Substation',
    'Barangay Name': 'Centro',
    'Geocode': 'PH-02-15-01-004',
    'Latitude': 17.6100,
    'Longitude': 220.5, // ERROR: Longitude out of bounds
    'Susceptibility Rating': 'UNKNOWN_RATING', // REVIEW
  },
  // 5. Duplicate record (Same Area of Concern + Barangay Name + Purok/Sitio as Row 1)
  {
    'Area of Concern': 'Riverside Settlers',
    'Barangay Name': 'San Fermin',
    'Purok/Sitio': 'Purok 2',
    'Geocode': 'PH-02-15-01-002',
    'Susceptibility Rating': 'HF',
  },
];

export const VRA_SAMPLE_VALID: Record<string, unknown>[] = [VRA_SAMPLE_ISSUES[0]];

// -------------------------------------------------------------
// WORKBOOK MOCK GENERATOR FOR ODESSEE
// -------------------------------------------------------------
export function getOdesseeMockWorkbook(datasetId: string, variant: 'issues' | 'valid' = 'issues'): ParsedWorkbook {
  switch (datasetId) {
    case 'odessee-household': {
      const rows = variant === 'valid' ? HOUSEHOLD_SAMPLE_VALID : HOUSEHOLD_SAMPLE_ISSUES;
      return {
        fileName: variant === 'valid' ? 'Barangay_Household_Valid.xlsx' : 'Barangay Household Profile Import Template.xlsx',
        fileSize: 45000,
        sheetNames: ['Barangay Population Import Temp', 'Instructions'],
        selectedSheet: 'Barangay Population Import Temp',
        headerRowIndex: 1,
        headers: [
          'CBMS#-Ind#',
          'Gender',
          'Civil Status',
          'Barangay',
          'Purok/Zone',
          'Solo Parent(Y/N)',
          'Birth Date',
          'Disability',
          'Income Classification',
        ],
        rawRows: rows,
        totalRows: rows.length,
      };
    }

    case 'odessee-covid': {
      const rows = variant === 'valid' ? COVID_SAMPLE_VALID : COVID_SAMPLE_ISSUES;
      return {
        fileName: variant === 'valid' ? 'COVID_Cases_Valid.xlsx' : 'COVID Cases Import Template.xlsx',
        fileSize: 32000,
        sheetNames: ['Covid Cases Import Template', 'Instructions'],
        selectedSheet: 'Covid Cases Import Template',
        headerRowIndex: 1,
        headers: ['Barangay', 'Facilities', 'Total Number of Case'],
        rawRows: rows,
        totalRows: rows.length,
      };
    }

    case 'odessee-disaster': {
      const rows = variant === 'valid' ? DISASTER_SAMPLE_VALID : DISASTER_SAMPLE_ISSUES;
      return {
        fileName: variant === 'valid' ? 'Disaster_Report_Valid.xlsx' : 'Disaster Incident Report Template.xlsx',
        fileSize: 48000,
        sheetNames: ['Disaster Incident Report', 'Instructions'],
        selectedSheet: 'Disaster Incident Report',
        headerRowIndex: 2,
        headers: [
          'Report Date',
          'Incident',
          'Incident Date (Date Range)',
          'Sky Condition',
          'Wind',
          'Precipitation',
          'Gauging Station',
          'Current Level',
          'Areas Likely to be Affected',
          'Casualty',
        ],
        rawRows: rows,
        totalRows: rows.length,
      };
    }

    case 'odessee-drrm': {
      const rows = variant === 'valid' ? DRRM_SAMPLE_VALID : DRRM_SAMPLE_ISSUES;
      return {
        fileName: variant === 'valid' ? 'DRRM_Resources_Valid.xlsx' : 'DRRM Resources Import Template.xlsx',
        fileSize: 39000,
        sheetNames: ['DRRM Resources Import Template', 'Instruction'],
        selectedSheet: 'DRRM Resources Import Template',
        headerRowIndex: 1,
        headers: ['Group/Team', 'Resources/Equipment', 'Quantity', 'Unit', 'Category'],
        rawRows: rows,
        totalRows: rows.length,
      };
    }

    case 'odessee-evacuation': {
      const rows = variant === 'valid' ? EVACUATION_SAMPLE_VALID : EVACUATION_SAMPLE_ISSUES;
      return {
        fileName: variant === 'valid' ? 'Evacuation_Sites_Valid.xlsx' : 'Evacuation Sites Import Template.xlsx',
        fileSize: 52000,
        sheetNames: ['Evacuation Sites Import Templat', 'Instructions'],
        selectedSheet: 'Evacuation Sites Import Templat',
        headerRowIndex: 1,
        headers: [
          'Name of Evacuation Center ',
          'Barangay',
          'Latitude',
          'Longitude',
          'No. of Family',
          'No. of Individuals',
          'No. of Storey/ Floors',
          'No. of Rooms',
          'No. of Toilet for Women',
          'No. of Toilet for Men',
          'Common CR',
          'No. of Bath/ Shower Area for Women',
          'No. of Bath/ Shower Area for Men',
          'Water Source/s',
          'Breast feeding Area',
          'With Storage (Y/N) If yes indicate the floor area',
          'Used as COVID-19 TTMF (Y/N)',
          'Inspected Safe',
        ],
        rawRows: rows,
        totalRows: rows.length,
      };
    }

    case 'odessee-flood': {
      const rows = variant === 'valid' ? FLOOD_SAMPLE_VALID : FLOOD_SAMPLE_ISSUES;
      return {
        fileName: variant === 'valid' ? 'Flood_Susceptibility_Valid.xlsx' : 'Flood Susceptibility Rating Import Template.xlsx',
        fileSize: 55000,
        sheetNames: ['Geo Hazard Import Template', 'Instructions'],
        selectedSheet: 'Geo Hazard Import Template',
        headerRowIndex: 1,
        headers: [
          'Area of Concern',
          'Barangay Name',
          'Barangay Code',
          'Municipality Name',
          'Municipality Code',
          'Geocode',
          'Purok/Sitio',
          'Latitude',
          'Longitude',
          'Susceptibility Rating',
          'Flood Height',
          'Elevation',
          'POI',
        ],
        rawRows: rows,
        totalRows: rows.length,
      };
    }

    case 'odessee-vra':
    default: {
      const rows = variant === 'valid' ? VRA_SAMPLE_VALID : VRA_SAMPLE_ISSUES;
      return {
        fileName: variant === 'valid' ? 'VRA_Valid.xlsx' : 'Vulnerability Risk Assessment Import Template.xlsx',
        fileSize: 42000,
        sheetNames: ['Tuguegarao VRA Import Template', 'Instructions'],
        selectedSheet: 'Tuguegarao VRA Import Template',
        headerRowIndex: 1,
        headers: [
          'Area of Concern',
          'Barangay Name',
          'Purok/Sitio',
          'Geocode',
          'Latitude',
          'Longitude',
          'Susceptibility Rating',
          'Concern Category',
        ],
        rawRows: rows,
        totalRows: rows.length,
      };
    }
  }
}
