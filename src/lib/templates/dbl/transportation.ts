import { DatasetDefinition } from '../../types';

export const transportationDefinition: DatasetDefinition = {
  id: 'dbl-transportation',
  system: 'DBL',
  name: 'Transportation',
  description: 'DBL public utility transport routes, vehicles, and barangay coverage.',
  officialFileName: 'transportation-template.xlsx',
  officialSheetName: 'Data',
  headerRowIndex: 1,
  compositeKey: ["route", "vehicleType"],
  fields: [
    {
      key: 'route',
      officialHeader: 'Route',
      aliases: ["Route", "route", "ROUTE"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: 'Enter the official route name with its origin and destination. Use a consistent separator and include distinguishing route details where needed.',
      example: 'Barangay 1 - Barangay 2',
      rulesSummary: 'Enter the official route name with its origin and destination. Use a consistent separator and include distinguishing rou',
      compositeKeyPart: true
    },    {
      key: 'availableUnits',
      officialHeader: 'Available Units',
      aliases: ["Available Units", "available units", "AVAILABLE UNITS"],
      type: 'integer',
      required: false,
      acceptedValues: undefined,
      description: 'Enter the nonnegative whole-number count of available vehicles for the route and reporting period. Do not include units unavailable under the reporting definition.',
      example: '66',
      rulesSummary: 'Enter the nonnegative whole-number count of available vehicles for the route and reporting period. Do not include units ',
      compositeKeyPart: false
    },    {
      key: 'vehicleType',
      officialHeader: 'Vehicle Type',
      aliases: ["Vehicle Type", "vehicle type", "VEHICLE TYPE", "mode of transport"],
      type: 'string',
      required: true,
      acceptedValues: ['PUJ', 'Tricycle', 'Bus', 'UV Express', 'Jeepney', 'Van', 'E-Trike'],
      description: 'Use the exact vehicle-type label or code accepted by the reporting system. Keep approved codes unchanged. The supplied sample uses PUJ.',
      example: 'PUJ',
      rulesSummary: 'Use the exact vehicle-type label or code accepted by the reporting system. Keep approved codes unchanged. The supplied s',
      compositeKeyPart: true
    },    {
      key: 'barangaysCoveredByRoute',
      officialHeader: 'Barangays Covered by Route',
      aliases: ["Barangays Covered by Route", "barangays covered by route", "BARANGAYS COVERED BY ROUTE", "brgy", "barangay name"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: 'Use the official barangay names in PSA PSGC for the barangays served by the route. Match each to the correct city or municipality and province. Preserve PSGC spelling and numbering. Use the import system’s delimiter for multiple names and avoid duplicates.',
      example: 'Barangay 1, Barangay 2',
      rulesSummary: 'Use the official barangay names in PSA PSGC for the barangays served by the route. Match each to the correct city or mun',
      compositeKeyPart: false
    },    {
      key: 'puroksCoveredByRoute',
      officialHeader: 'Puroks Covered by Route',
      aliases: ["Puroks Covered by Route", "puroks covered by route", "PUROKS COVERED BY ROUTE", "purok/sitio", "sitio/purok"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: 'Enter the official local puroks served by the route and associate each with its PSA PSGC barangay name. Use the import system’s delimiter for multiple entries. Verify purok names against local records.',
      example: 'Barangay 1 :: Purok 1, Barangay 2 :: Purok 1,',
      rulesSummary: 'Enter the official local puroks served by the route and associate each with its PSA PSGC barangay name. Use the import s',
      compositeKeyPart: false
    }
  ],
  notes: ["Keep Data column headers unchanged. Use one record per row. Examples illustrate entry format. Confirm category lists, units, and required fields with the receiving system.", "Barangay basis: PSA PSGC \u2014 https://psa.gov.ph/classification/psgc"]
};
