import { DatasetDefinition } from '../../types';

export const businessDefinition: DatasetDefinition = {
  id: 'dbl-business',
  system: 'DBL',
  name: 'Business',
  description: 'DBL business establishment registry including trade name, DTI/PSIC classification, location, and sales.',
  officialFileName: 'business-template.xlsx',
  officialSheetName: 'Data',
  headerRowIndex: 1,
  compositeKey: ["businessTradeName", "barangay", "street"],
  fields: [
    {
      key: 'lineOfBusinessDti',
      officialHeader: 'Line of Business (DTI)',
      aliases: ["Line of Business (DTI)", "line of business (dti)", "LINE OF BUSINESS (DTI)"],
      type: 'string',
      required: false,
      acceptedValues: undefined,
      description: 'Use PSA Philippine Standard Industrial Classification (PSIC) as the basis for the business activity classification. Match the principal economic activity to the corresponding PSIC description and sub-class code. This existing column header is retained.',
      example: 'Real estate activities with own or leased property',
      rulesSummary: 'Use PSA Philippine Standard Industrial Classification (PSIC) as the basis for the business activity classification. Matc',
      compositeKeyPart: false
    },    {
      key: 'dtiSubCategory',
      officialHeader: 'DTI Sub Category',
      aliases: ["DTI Sub Category", "dti sub category", "DTI SUB CATEGORY"],
      type: 'string',
      required: false,
      acceptedValues: undefined,
      description: 'Use the business activity description corresponding to the selected PSA PSIC sub-class code. Keep this description, Line of Business (DTI), and PSIC Sub-Class Code consistent with the same PSIC edition. This existing column header is retained.',
      example: 'Renting and operating of self-owned or leased residential buildings and dwellings',
      rulesSummary: 'Use the business activity description corresponding to the selected PSA PSIC sub-class code. Keep this description, Line',
      compositeKeyPart: false
    },    {
      key: 'psicSubClassCode',
      officialHeader: 'PSIC Sub-Class Code',
      aliases: ["PSIC Sub-Class Code", "psic sub-class code", "PSIC SUB-CLASS CODE"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: 'Use the official PSA PSIC sub-class code for the business activity. Store it as text and preserve every digit, including leading zeros. Verify that the code and activity descriptions agree with the same PSIC edition.',
      example: '68101',
      rulesSummary: 'Use the official PSA PSIC sub-class code for the business activity. Store it as text and preserve every digit, including',
      compositeKeyPart: false
    },    {
      key: 'businessTradeName',
      officialHeader: 'Business Trade Name',
      aliases: ["Business Trade Name", "business trade name", "BUSINESS TRADE NAME"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: 'Enter the registered trade name exactly as recorded. Preserve official spelling, punctuation, and diacritics. Avoid unofficial abbreviations.',
      example: 'E.R. VILLASEÑOR REAL ESTATE LEASING',
      rulesSummary: 'Enter the registered trade name exactly as recorded. Preserve official spelling, punctuation, and diacritics. Avoid unof',
      compositeKeyPart: true
    },    {
      key: 'street',
      officialHeader: 'Street',
      aliases: ["Street", "street", "STREET"],
      type: 'string',
      required: false,
      acceptedValues: undefined,
      description: 'Enter the official street name. Avoid abbreviations where a full official name is available. Capitalize the first letter of each word and retain official punctuation.',
      example: 'National Road',
      rulesSummary: 'Enter the official street name. Avoid abbreviations where a full official name is available. Capitalize the first letter',
      compositeKeyPart: true
    },    {
      key: 'purok',
      officialHeader: 'Purok',
      aliases: ["Purok", "purok", "PUROK", "purok/sitio", "sitio/purok"],
      type: 'string',
      required: false,
      acceptedValues: undefined,
      description: 'Enter the official purok or sitio name. Avoid abbreviations and use Arabic digits instead of Roman numerals when a location number is present. Keep the name consistent with its barangay.',
      example: 'Purok 1',
      rulesSummary: 'Enter the official purok or sitio name. Avoid abbreviations and use Arabic digits instead of Roman numerals when a locat',
      compositeKeyPart: false
    },    {
      key: 'barangay',
      officialHeader: 'Barangay',
      aliases: ["Barangay", "barangay", "BARANGAY", "brgy", "barangay name"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: 'Use the official barangay name in the PSA Philippine Standard Geographic Code (PSGC). Match the correct city or municipality and province. Preserve PSGC spelling, punctuation, and numbering. Do not use unofficial aliases or abbreviations.',
      example: 'Barangay 1',
      rulesSummary: 'Use the official barangay name in the PSA Philippine Standard Geographic Code (PSGC). Match the correct city or municipa',
      compositeKeyPart: true
    },    {
      key: 'latitude',
      officialHeader: 'Latitude',
      aliases: ["Latitude", "latitude", "LATITUDE"],
      type: 'coordinate_lat',
      required: false,
      acceptedValues: undefined,
      description: 'Enter a valid decimal latitude from -90 to 90. Use a decimal point, without degree symbols. Verify that the coordinate matches the stated location.',
      example: '13.93824298',
      rulesSummary: 'Enter a valid decimal latitude from -90 to 90. Use a decimal point, without degree symbols. Verify that the coordinate m',
      compositeKeyPart: false
    },    {
      key: 'longitude',
      officialHeader: 'Longitude',
      aliases: ["Longitude", "longitude", "LONGITUDE"],
      type: 'coordinate_lng',
      required: false,
      acceptedValues: undefined,
      description: 'Enter a valid decimal longitude from -180 to 180. Use a decimal point, without degree symbols. Verify that the coordinate matches the stated location.',
      example: '121.6132709',
      rulesSummary: 'Enter a valid decimal longitude from -180 to 180. Use a decimal point, without degree symbols. Verify that the coordinat',
      compositeKeyPart: false
    },    {
      key: 'registrationDateMmDdYy',
      officialHeader: 'Registration Date (mm/dd/yy)',
      aliases: ["Registration Date (mm/dd/yy)", "registration date (mm/dd/yy)", "REGISTRATION DATE (MM/DD/YY)"],
      type: 'date',
      required: true,
      acceptedValues: undefined,
      description: 'Enter a valid registration date. Follow the format specified in the column header: MM/DD/YY. Verify the full year against the source record before entering a two-digit year.',
      example: '11/18/26',
      rulesSummary: 'Enter a valid registration date. Follow the format specified in the column header: MM/DD/YY. Verify the full year agains',
      compositeKeyPart: false
    },    {
      key: 'permitStatus',
      officialHeader: 'Permit Status',
      aliases: ["Permit Status", "permit status", "PERMIT STATUS"],
      type: 'string',
      required: false,
      acceptedValues: ['New', 'Renewal', 'Retired'],
      description: 'Use the exact permit-status label accepted by the reporting system. Verify it against the permit record. The supplied sample uses Renewal.',
      example: 'Renewal',
      rulesSummary: 'Use the exact permit-status label accepted by the reporting system. Verify it against the permit record. The supplied sa',
      compositeKeyPart: false
    },    {
      key: 'grossSales',
      officialHeader: 'Gross Sales',
      aliases: ["Gross Sales", "gross sales", "GROSS SALES"],
      type: 'float',
      required: false,
      acceptedValues: undefined,
      description: 'Enter a nonnegative numeric amount. Use a decimal point and omit currency symbols and thousands separators in import values. Use the currency and reporting period required by the reporting system. A blank value must not be replaced by zero.',
      example: '240000',
      rulesSummary: 'Enter a nonnegative numeric amount. Use a decimal point and omit currency symbols and thousands separators in import val',
      compositeKeyPart: false
    },    {
      key: 'totalMaleEmployees',
      officialHeader: 'Total Male Employees',
      aliases: ["Total Male Employees", "total male employees", "TOTAL MALE EMPLOYEES"],
      type: 'integer',
      required: false,
      acceptedValues: undefined,
      description: 'Enter a nonnegative whole-number count for the applicable reporting period. Use 0 only when the confirmed count is zero. Keep missing counts blank until verified.',
      example: '0',
      rulesSummary: 'Enter a nonnegative whole-number count for the applicable reporting period. Use 0 only when the confirmed count is zero.',
      compositeKeyPart: false
    },    {
      key: 'totalFemaleEmployees',
      officialHeader: 'Total Female Employees',
      aliases: ["Total Female Employees", "total female employees", "TOTAL FEMALE EMPLOYEES"],
      type: 'integer',
      required: false,
      acceptedValues: undefined,
      description: 'Enter a nonnegative whole-number count for the applicable reporting period. Use 0 only when the confirmed count is zero. Keep missing counts blank until verified.',
      example: '0',
      rulesSummary: 'Enter a nonnegative whole-number count for the applicable reporting period. Use 0 only when the confirmed count is zero.',
      compositeKeyPart: false
    }
  ],
  notes: ["Keep Data column headers unchanged. Use one record per row. Examples illustrate entry format. Confirm category lists, units, and required fields with the receiving system.", "Barangay basis: PSA PSGC \u2014 https://psa.gov.ph/classification/psgc", "Business classification basis: PSA PSIC \u2014 https://psa.gov.ph/classification/psic"]
};
