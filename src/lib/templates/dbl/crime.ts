import { DatasetDefinition } from '../../types';

export const crimeDefinition: DatasetDefinition = {
  id: 'dbl-crime',
  system: 'DBL',
  name: 'Crime',
  description: 'DBL crime incidents blotter records with PSCCS classification and coordinates.',
  officialFileName: 'crime-template.xlsx',
  officialSheetName: 'Data',
  headerRowIndex: 1,
  compositeKey: ["blotterNumber"],
  fields: [
    {
      key: 'blotterNumber',
      officialHeader: 'Blotter Number',
      aliases: ["Blotter Number", "blotter number", "BLOTTER NUMBER"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: 'Enter the official blotter identifier exactly as recorded. Keep leading zeros and hyphens.',
      example: 'TEST-BL-000001',
      rulesSummary: 'Enter the official blotter identifier exactly as recorded. Keep leading zeros and hyphens.',
      compositeKeyPart: true
    },    {
      key: 'datetimeReported',
      officialHeader: 'Datetime Reported',
      aliases: ["Datetime Reported", "datetime reported", "DATETIME REPORTED"],
      type: 'datetime',
      required: true,
      acceptedValues: undefined,
      description: 'Enter the date and time the incident was reported. Recommended format: YYYY-MM-DD HH:mm, using a 24-hour clock and the local reporting timezone. This should not be earlier than Datetime Committed.',
      example: '2026-07-21 05:38',
      rulesSummary: 'Enter the date and time the incident was reported. Recommended format: YYYY-MM-DD HH:mm, using a 24-hour clock and the l',
      compositeKeyPart: false
    },    {
      key: 'datetimeCommitted',
      officialHeader: 'Datetime Committed',
      aliases: ["Datetime Committed", "datetime committed", "DATETIME COMMITTED"],
      type: 'datetime',
      required: true,
      acceptedValues: undefined,
      description: 'Enter the date and time the incident occurred, based on the source record. Recommended format: YYYY-MM-DD HH:mm, using a 24-hour clock and the same timezone as Datetime Reported.',
      example: '2026-07-20 03:38',
      rulesSummary: 'Enter the date and time the incident occurred, based on the source record. Recommended format: YYYY-MM-DD HH:mm, using a',
      compositeKeyPart: false
    },    {
      key: 'subViolation',
      officialHeader: 'Sub Violation',
      aliases: ["Sub Violation", "sub violation", "SUB VIOLATION"],
      type: 'string',
      required: false,
      acceptedValues: undefined,
      description: 'Use the applicable description from the PSA Philippine Standard Classification of Crime for Statistical Purposes (PSCCS). Classify the recorded incident using PSCCS definitions and verify that the description agrees with the selected PSCCS sub-class code.',
      example: 'Acts against comprehensive dangerous drugs act',
      rulesSummary: 'Use the applicable description from the PSA Philippine Standard Classification of Crime for Statistical Purposes (PSCCS)',
      compositeKeyPart: false
    },    {
      key: 'psccsSubClassCode',
      officialHeader: 'PSCCS Sub-Class Code',
      aliases: ["PSCCS Sub-Class Code", "psccs sub-class code", "PSCCS SUB-CLASS CODE"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: 'Use the official sub-class code from PSA PSCCS for the recorded offense. Store it as text and preserve every digit, including leading zeros. Verify the code and description against the same PSCCS edition. Do not derive code length from the sample records.',
      example: '806102',
      rulesSummary: 'Use the official sub-class code from PSA PSCCS for the recorded offense. Store it as text and preserve every digit, incl',
      compositeKeyPart: false
    },    {
      key: 'violationName',
      officialHeader: 'Violation Name',
      aliases: ["Violation Name", "violation name", "VIOLATION NAME"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: 'Use the official offense description corresponding to the selected PSA PSCCS code. Apply the PSCCS definitions to the incident details. Keep Violation Name, Sub Violation, and PSCCS Sub-Class Code consistent with the same classification edition.',
      example: 'Obstruction of justice',
      rulesSummary: 'Use the official offense description corresponding to the selected PSA PSCCS code. Apply the PSCCS definitions to the in',
      compositeKeyPart: false
    },    {
      key: 'complainantGender',
      officialHeader: 'Complainant Gender',
      aliases: ["Complainant Gender", "complainant gender", "COMPLAINANT GENDER"],
      type: 'string',
      required: false,
      acceptedValues: ['Male', 'Female'],
      description: 'Enter the complainant’s gender using the exact label accepted by the reporting system. Use the source record and do not infer gender from a name.',
      example: 'Female',
      rulesSummary: 'Enter the complainant’s gender using the exact label accepted by the reporting system. Use the source record and do not ',
      compositeKeyPart: false
    },    {
      key: 'respondentGender',
      officialHeader: 'Respondent Gender',
      aliases: ["Respondent Gender", "respondent gender", "RESPONDENT GENDER"],
      type: 'string',
      required: false,
      acceptedValues: ['Male', 'Female'],
      description: 'Enter the respondent’s gender using the exact label accepted by the reporting system. Use the source record and do not infer gender from a name.',
      example: 'Male',
      rulesSummary: 'Enter the respondent’s gender using the exact label accepted by the reporting system. Use the source record and do not i',
      compositeKeyPart: false
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
      compositeKeyPart: false
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
      compositeKeyPart: false
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
    }
  ],
  notes: ["Keep Data column headers unchanged. Use one record per row. Examples illustrate entry format. Confirm category lists, units, and required fields with the receiving system.", "Barangay basis: PSA PSGC \u2014 https://psa.gov.ph/classification/psgc", "Crime classification basis: PSA PSCCS \u2014 https://psa.gov.ph/classification/psccs/general-information"]
};
