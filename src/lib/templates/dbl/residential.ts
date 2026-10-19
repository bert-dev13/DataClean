import { DatasetDefinition } from '../../types';

export const residentialDefinition: DatasetDefinition = {
  id: 'dbl-residential',
  system: 'DBL',
  name: 'Residential',
  description: 'DBL CBMS residential citizen demographics and household locations.',
  officialFileName: 'residential-template-test.xlsx',
  officialSheetName: 'Data',
  headerRowIndex: 1,
  compositeKey: ["cbmsNumber"],
  fields: [
    {
      key: 'cbmsNumber',
      officialHeader: 'CBMS Number',
      aliases: ["CBMS Number", "cbms number", "CBMS NUMBER"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: 'Enter the CBMS identifier exactly as issued. Keep leading zeros and hyphens. Use text format and avoid duplicate identifiers for the same person.',
      example: 'CBMS-000000001',
      rulesSummary: 'Enter the CBMS identifier exactly as issued. Keep leading zeros and hyphens. Use text format and avoid duplicate identif',
      compositeKeyPart: true
    },    {
      key: 'gender',
      officialHeader: 'Gender',
      aliases: ["Gender", "gender", "GENDER"],
      type: 'string',
      required: false,
      acceptedValues: ['Male', 'Female'],
      description: 'Use the exact gender label accepted by the reporting system and supported by the source record. Keep spelling and capitalization consistent.',
      example: 'Male',
      rulesSummary: 'Use the exact gender label accepted by the reporting system and supported by the source record. Keep spelling and capita',
      compositeKeyPart: false
    },    {
      key: 'birthDate',
      officialHeader: 'Birth Date',
      aliases: ["Birth Date", "birth date", "BIRTH DATE"],
      type: 'date',
      required: true,
      acceptedValues: undefined,
      description: 'Enter a valid birth date in YYYY-MM-DD format, with a four-digit year. Confirm the century from the source record. The date must not be in the future.',
      example: '1970-01-19',
      rulesSummary: 'Enter a valid birth date in YYYY-MM-DD format, with a four-digit year. Confirm the century from the source record. The d',
      compositeKeyPart: false
    },    {
      key: 'houseNo',
      officialHeader: 'House No',
      aliases: ["House No", "house no", "HOUSE NO"],
      type: 'string',
      required: false,
      acceptedValues: undefined,
      description: 'Enter the official house or unit number as text. Preserve letters, hyphens, slashes, and leading zeros. Do not force identifiers into numeric format.',
      example: '428',
      rulesSummary: 'Enter the official house or unit number as text. Preserve letters, hyphens, slashes, and leading zeros. Do not force ide',
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
    }
  ],
  notes: ["Keep Data column headers unchanged. Use one record per row. Examples illustrate entry format. Confirm category lists, units, and required fields with the receiving system.", "Barangay basis: PSA PSGC \u2014 https://psa.gov.ph/classification/psgc"]
};
