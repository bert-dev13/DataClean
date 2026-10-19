import { DatasetDefinition } from '../../types';

export const waterDefinition: DatasetDefinition = {
  id: 'dbl-water',
  system: 'DBL',
  name: 'Water',
  description: 'DBL water utility consumption, account identifiers, and billing records.',
  officialFileName: 'water-template.xlsx',
  officialSheetName: 'Data',
  headerRowIndex: 1,
  compositeKey: ["accountNumber", "billingDate"],
  fields: [
    {
      key: 'accountNumber',
      officialHeader: 'Account Number',
      aliases: ["Account Number", "account number", "ACCOUNT NUMBER", "account no", "account no.", "acct no"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: 'Enter the account identifier exactly as issued. Keep leading zeros, letters, and hyphens. Use text format. Each account and billing date combination should identify one billing record.',
      example: 'TEST-LUC-WTR-0000001',
      rulesSummary: 'Enter the account identifier exactly as issued. Keep leading zeros, letters, and hyphens. Use text format. Each account ',
      compositeKeyPart: true
    },    {
      key: 'type',
      officialHeader: 'Type',
      aliases: ["Type", "type", "TYPE"],
      type: 'string',
      required: true,
      acceptedValues: ['Residential', 'Commercial A', 'Commercial B', 'Industrial', 'Institutional'],
      description: 'Use the exact water customer classification accepted by the provider and reporting system.',
      example: 'Residential, Commercial A, Commercial B',
      rulesSummary: 'Use the exact water customer classification accepted by the provider and reporting system.',
      compositeKeyPart: false
    },    {
      key: 'consumption',
      officialHeader: 'Consumption',
      aliases: ["Consumption", "consumption", "CONSUMPTION", "water consumption", "consumption (cu.m)", "consumption (m3)"],
      type: 'float',
      required: true,
      acceptedValues: undefined,
      description: 'Enter a nonnegative numeric water consumption value for the billing period. Use a decimal point and omit unit symbols. Confirm the provider’s reporting unit before entry. Use 0 only for confirmed zero consumption.',
      example: '1.1',
      rulesSummary: 'Enter a nonnegative numeric water consumption value for the billing period. Use a decimal point and omit unit symbols. C',
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
      key: 'billingDate',
      officialHeader: 'Billing Date',
      aliases: ["Billing Date", "billing date", "BILLING DATE", "bill date", "date of billing"],
      type: 'date',
      required: true,
      acceptedValues: undefined,
      description: 'Enter the actual billing date in YYYY-MM-DD format, with a four-digit year. Use a valid calendar date and verify it against the bill.',
      example: '2026-05-30',
      rulesSummary: 'Enter the actual billing date in YYYY-MM-DD format, with a four-digit year. Use a valid calendar date and verify it agai',
      compositeKeyPart: true
    }
  ],
  notes: ["Keep Data column headers unchanged. Use one record per row. Examples illustrate entry format. Confirm category lists, units, and required fields with the receiving system.", "Barangay basis: PSA PSGC \u2014 https://psa.gov.ph/classification/psgc"]
};
