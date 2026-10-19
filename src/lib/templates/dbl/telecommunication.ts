import { DatasetDefinition } from '../../types';

export const telecommunicationDefinition: DatasetDefinition = {
  id: 'dbl-telecommunication',
  system: 'DBL',
  name: 'Telecommunication Towers',
  description: 'DBL cellular and communications tower infrastructure registry.',
  officialFileName: 'telecommunication-towers.xlsx',
  officialSheetName: 'Data',
  headerRowIndex: 1,
  compositeKey: ["towerCode"],
  fields: [
    {
      key: 'providerName',
      officialHeader: 'Provider Name',
      aliases: ["Provider Name", "provider name", "PROVIDER NAME"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: 'Enter the official telecommunications provider name. Use consistent spelling and capitalization.',
      example: 'Smart Communications',
      rulesSummary: 'Enter the official telecommunications provider name. Use consistent spelling and capitalization.',
      compositeKeyPart: false
    },    {
      key: 'towerName',
      officialHeader: 'Tower Name',
      aliases: ["Tower Name", "tower name", "TOWER NAME"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: 'Enter the official site or tower name as recorded by the provider. Keep it consistent with the tower code and location.',
      example: 'TEST TOWER 00001',
      rulesSummary: 'Enter the official site or tower name as recorded by the provider. Keep it consistent with the tower code and location.',
      compositeKeyPart: false
    },    {
      key: 'towerCode',
      officialHeader: 'Tower Code',
      aliases: ["Tower Code", "tower code", "TOWER CODE"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: 'Enter the tower or site identifier exactly as assigned. Keep leading zeros, letters, and hyphens. Use text format and avoid duplicate tower identifiers.',
      example: 'TEST-TWR-00001',
      rulesSummary: 'Enter the tower or site identifier exactly as assigned. Keep leading zeros, letters, and hyphens. Use text format and av',
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
      compositeKeyPart: false
    },    {
      key: 'locationAddress',
      officialHeader: 'Location Address',
      aliases: ["Location Address", "location address", "LOCATION ADDRESS"],
      type: 'string',
      required: false,
      acceptedValues: undefined,
      description: 'Enter the complete official site address. Include the street or landmark, purok or sitio, and barangay where available. Ensure it agrees with the separate location fields and coordinates.',
      example: 'ECO TOURISM ROAD PUROK LANSONESAN, BARANGAY  1',
      rulesSummary: 'Enter the complete official site address. Include the street or landmark, purok or sitio, and barangay where available. ',
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
    },    {
      key: 'towerType',
      officialHeader: 'Tower Type',
      aliases: ["Tower Type", "tower type", "TOWER TYPE"],
      type: 'string',
      required: true,
      acceptedValues: ['Self-Supporting', 'Guyed Tower', 'Rooftop', 'Monopole'],
      description: 'Use the exact tower-type label accepted by the reporting system.',
      example: 'Self-Supporting, Guyed Tower, and Rooftop',
      rulesSummary: 'Use the exact tower-type label accepted by the reporting system.',
      compositeKeyPart: false
    },    {
      key: 'networkTechnology',
      officialHeader: 'Network Technology',
      aliases: ["Network Technology", "network technology", "NETWORK TECHNOLOGY"],
      type: 'string',
      required: false,
      acceptedValues: undefined,
      description: 'Use the exact technology designation accepted by the reporting system. Examples in the supplied file include LTE and 5G. Use the system’s prescribed format for multiple technologies.',
      example: 'LTE',
      rulesSummary: 'Use the exact technology designation accepted by the reporting system. Examples in the supplied file include LTE and 5G.',
      compositeKeyPart: false
    },    {
      key: 'towerHeight',
      officialHeader: 'Tower Height',
      aliases: ["Tower Height", "tower height", "TOWER HEIGHT"],
      type: 'float',
      required: false,
      acceptedValues: undefined,
      description: 'Enter a positive numeric height. Omit unit symbols from the value. Confirm the required measurement unit and whether the height refers to the tower structure or total height before entry.',
      example: '29',
      rulesSummary: 'Enter a positive numeric height. Omit unit symbols from the value. Confirm the required measurement unit and whether the',
      compositeKeyPart: false
    },    {
      key: 'ownershipType',
      officialHeader: 'Ownership Type',
      aliases: ["Ownership Type", "ownership type", "OWNERSHIP TYPE"],
      type: 'string',
      required: true,
      acceptedValues: ['Provider-owned', 'Third-party', 'Shared'],
      description: 'Use the exact ownership label accepted by the reporting system.',
      example: 'Provider-owned, Third-party, etc.',
      rulesSummary: 'Use the exact ownership label accepted by the reporting system.',
      compositeKeyPart: false
    },    {
      key: 'status',
      officialHeader: 'Status',
      aliases: ["Status", "status", "STATUS"],
      type: 'string',
      required: false,
      acceptedValues: ['Operational', 'Under Construction', 'Decommissioned'],
      description: 'Use the exact tower-status label accepted by the reporting system. Verify the status for the reporting date.',
      example: 'Operational, Under Construction, Etc.',
      rulesSummary: 'Use the exact tower-status label accepted by the reporting system. Verify the status for the reporting date.',
      compositeKeyPart: false
    },    {
      key: 'installationDate',
      officialHeader: 'Installation Date',
      aliases: ["Installation Date", "installation date", "INSTALLATION DATE"],
      type: 'date',
      required: true,
      acceptedValues: undefined,
      description: 'Enter the verified installation date in YYYY-MM-DD format, with a four-digit year. If installation has not occurred, use the reporting system’s accepted blank value instead of an invented date.',
      example: '2022-10-29',
      rulesSummary: 'Enter the verified installation date in YYYY-MM-DD format, with a four-digit year. If installation has not occurred, use',
      compositeKeyPart: false
    }
  ],
  notes: ["Keep Data column headers unchanged. Use one record per row. Examples illustrate entry format. Confirm category lists, units, and required fields with the receiving system.", "Barangay basis: PSA PSGC \u2014 https://psa.gov.ph/classification/psgc"]
};
