import { DatasetDefinition } from '../../types';

export const covidcasesDefinition: DatasetDefinition = {
  id: 'odessee-covid',
  system: 'ODeSSEE',
  name: 'COVID Cases',
  description: 'ODeSSEE health facility case surveillance summary by barangay.',
  officialFileName: 'COVID Cases Import Template.xlsx',
  officialSheetName: 'Covid Cases Import Template',
  headerRowIndex: 1,
  compositeKey: ["barangay", "facilities"],
  fields: [
    {
      key: 'barangay',
      officialHeader: 'Barangay',
      aliases: ["Barangay", "barangay", "BARANGAY", "brgy", "barangay name"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: 'Input official Barangay names, Do not use roman numerals in case numbers are present, Avoid abbreviations, Capitalize the first letter of each word.',
      example: 'San Fermin',
      rulesSummary: 'Input official Barangay names, Do not use roman numerals in case numbers are present, Avoid abbreviations, Capitalize th',
      compositeKeyPart: true
    },    {
      key: 'facilities',
      officialHeader: 'Facilities',
      aliases: ["Facilities", "facilities", "FACILITIES"],
      type: 'string',
      required: false,
      acceptedValues: undefined,
      description: '',
      example: '',
      rulesSummary: '',
      compositeKeyPart: true
    },    {
      key: 'totalNumberOfCase',
      officialHeader: 'Total Number of Case',
      aliases: ["Total Number of Case", "total number of case", "TOTAL NUMBER OF CASE"],
      type: 'integer',
      required: false,
      acceptedValues: undefined,
      description: '',
      example: '',
      rulesSummary: '',
      compositeKeyPart: false
    }
  ],
  notes: []
};
