import { DatasetDefinition } from '../../types';

export const humanresourceDefinition: DatasetDefinition = {
  id: 'dbl-human-resource',
  system: 'DBL',
  name: 'Human Resource',
  description: 'DBL student and graduate profiles with school, course, and location.',
  officialFileName: 'human-resource-template.xlsx',
  officialSheetName: 'Data',
  headerRowIndex: 1,
  compositeKey: ["studentNumber"],
  fields: [
    {
      key: 'studentNumber',
      officialHeader: 'Student Number',
      aliases: ["Student Number", "student number", "STUDENT NUMBER"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: 'Enter the student identifier exactly as issued. Keep leading zeros and hyphens. Use text format. Check duplicate student records before importing.',
      example: 'TEST-STU-0000001',
      rulesSummary: 'Enter the student identifier exactly as issued. Keep leading zeros and hyphens. Use text format. Check duplicate student',
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
      key: 'school',
      officialHeader: 'School',
      aliases: ["School", "school", "SCHOOL"],
      type: 'string',
      required: false,
      acceptedValues: undefined,
      description: 'Enter the official school or institution name. Avoid abbreviations unless they are part of the official name. Capitalize names consistently.',
      example: 'TEST SCHOOL 01',
      rulesSummary: 'Enter the official school or institution name. Avoid abbreviations unless they are part of the official name. Capitalize',
      compositeKeyPart: false
    },    {
      key: 'course',
      officialHeader: 'Course',
      aliases: ["Course", "course", "COURSE"],
      type: 'string',
      required: false,
      acceptedValues: undefined,
      description: 'Enter the official course, program, or strand title as recorded by the institution. Retain qualification levels and specialization names.',
      example: 'TVL - Industrial Arts',
      rulesSummary: 'Enter the official course, program, or strand title as recorded by the institution. Retain qualification levels and spec',
      compositeKeyPart: false
    },    {
      key: 'graduationYear',
      officialHeader: 'Graduation Year',
      aliases: ["Graduation Year", "graduation year", "GRADUATION YEAR"],
      type: 'integer',
      required: false,
      acceptedValues: undefined,
      description: 'Enter a four-digit calendar year for the recorded graduation, such as 2025. Do not enter a full date or academic-year range.',
      example: '2025',
      rulesSummary: 'Enter a four-digit calendar year for the recorded graduation, such as 2025. Do not enter a full date or academic-year ra',
      compositeKeyPart: false
    }
  ],
  notes: ["Keep Data column headers unchanged. Use one record per row. Examples illustrate entry format. Confirm category lists, units, and required fields with the receiving system.", "Barangay basis: PSA PSGC \u2014 https://psa.gov.ph/classification/psgc"]
};
