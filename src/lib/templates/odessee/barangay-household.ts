import { DatasetDefinition } from '../../types';

export const barangayhouseholdDefinition: DatasetDefinition = {
  id: 'odessee-household',
  system: 'ODeSSEE',
  name: 'Barangay Household Profile',
  description: 'ODeSSEE citizen demographic microdata records (CBMS individual profiles).',
  officialFileName: 'Barangay Household Profile Import Template.xlsx',
  officialSheetName: 'Barangay Population Import Temp',
  headerRowIndex: 1,
  compositeKey: ["cbmsInd"],
  fields: [
    {
      key: 'cbmsInd',
      officialHeader: 'CBMS#-Ind#',
      aliases: ["CBMS#-Ind#", "cbms#-ind#", "CBMS#-IND#"],
      type: 'string',
      required: false,
      acceptedValues: undefined,
      description: '',
      example: '',
      rulesSummary: '',
      compositeKeyPart: true
    },    {
      key: 'gender',
      officialHeader: 'Gender',
      aliases: ["Gender", "gender", "GENDER"],
      type: 'string',
      required: false,
      acceptedValues: ['Male', 'Female', 'M', 'F'],
      description: '',
      example: '',
      rulesSummary: '',
      compositeKeyPart: false
    },    {
      key: 'civilStatus',
      officialHeader: 'Civil Status',
      aliases: ["Civil Status", "civil status", "CIVIL STATUS"],
      type: 'string',
      required: false,
      acceptedValues: ['Single', 'Married', 'Widowed', 'Separated', 'Divorced', 'Live-in'],
      description: '',
      example: '',
      rulesSummary: '',
      compositeKeyPart: false
    },    {
      key: 'barangay',
      officialHeader: 'Barangay',
      aliases: ["Barangay", "barangay", "BARANGAY", "brgy", "barangay name"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: '',
      example: '',
      rulesSummary: '',
      compositeKeyPart: false
    },    {
      key: 'purokZone',
      officialHeader: 'Purok/Zone',
      aliases: ["Purok/Zone", "purok/zone", "PUROK/ZONE", "purok/sitio", "sitio/purok"],
      type: 'string',
      required: false,
      acceptedValues: undefined,
      description: '',
      example: '',
      rulesSummary: '',
      compositeKeyPart: false
    },    {
      key: 'soloParentYN',
      officialHeader: 'Solo Parent(Y/N)',
      aliases: ["Solo Parent(Y/N)", "solo parent(y/n)", "SOLO PARENT(Y/N)"],
      type: 'string',
      required: false,
      acceptedValues: ['Y', 'N', 'Yes', 'No'],
      description: '',
      example: '',
      rulesSummary: '',
      compositeKeyPart: false
    },    {
      key: 'birthDate',
      officialHeader: 'Birth Date',
      aliases: ["Birth Date", "birth date", "BIRTH DATE"],
      type: 'date',
      required: true,
      acceptedValues: undefined,
      description: '',
      example: '',
      rulesSummary: '',
      compositeKeyPart: false
    },    {
      key: 'disability',
      officialHeader: 'Disability',
      aliases: ["Disability", "disability", "DISABILITY"],
      type: 'string',
      required: false,
      acceptedValues: undefined,
      description: '',
      example: '',
      rulesSummary: '',
      compositeKeyPart: false
    },    {
      key: 'incomeClassification',
      officialHeader: 'Income Classification',
      aliases: ["Income Classification", "income classification", "INCOME CLASSIFICATION"],
      type: 'string',
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
