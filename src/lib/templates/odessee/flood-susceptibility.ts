import { DatasetDefinition } from '../../types';

export const floodsusceptibilityDefinition: DatasetDefinition = {
  id: 'odessee-flood',
  system: 'ODeSSEE',
  name: 'Flood Susceptibility Rating',
  description: 'ODeSSEE geo-hazard susceptibility ratings, flood heights, and elevation data.',
  officialFileName: 'Flood Susceptibility Rating Import Template.xlsx',
  officialSheetName: 'Geo Hazard Import Template',
  headerRowIndex: 1,
  compositeKey: ["areaOfConcern", "barangayName"],
  fields: [
    {
      key: 'areaOfConcern',
      officialHeader: 'Area of Concern',
      aliases: ["Area of Concern", "area of concern", "AREA OF CONCERN"],
      type: 'string',
      required: false,
      acceptedValues: undefined,
      description: 'Input official names, Do not use roman numerals in case numbers are present, Avoid abbreviations, Capitalize the first letter of each word',
      example: 'Bridge',
      rulesSummary: 'Input official names, Do not use roman numerals in case numbers are present, Avoid abbreviations, Capitalize the first l',
      compositeKeyPart: true
    },    {
      key: 'barangayName',
      officialHeader: 'Barangay Name',
      aliases: ["Barangay Name", "barangay name", "BARANGAY NAME", "brgy"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: 'Input official barangay names, Do not use roman numerals in case numbers are present, Avoid abbreviations, Capitalize the first letter of each word',
      example: 'San Fermin',
      rulesSummary: 'Input official barangay names, Do not use roman numerals in case numbers are present, Avoid abbreviations, Capitalize th',
      compositeKeyPart: true
    },    {
      key: 'barangayCode',
      officialHeader: 'Barangay Code',
      aliases: ["Barangay Code", "barangay code", "BARANGAY CODE", "brgy", "barangay name"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: 'All data must be accurate, complete, and entered using the official format by authorized personnel only.',
      example: '1928372.0',
      rulesSummary: 'All data must be accurate, complete, and entered using the official format by authorized personnel only.',
      compositeKeyPart: false
    },    {
      key: 'municipalityName',
      officialHeader: 'Municipality Name',
      aliases: ["Municipality Name", "municipality name", "MUNICIPALITY NAME"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: 'Input official municipal name. Capitalize the first letter of each word. Avoid abbreviations.',
      example: 'Cauayan City',
      rulesSummary: 'Input official municipal name. Capitalize the first letter of each word. Avoid abbreviations.',
      compositeKeyPart: false
    },    {
      key: 'municipalityCode',
      officialHeader: 'Municipality Code',
      aliases: ["Municipality Code", "municipality code", "MUNICIPALITY CODE"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: 'All data must be accurate, complete, and entered using the official format by authorized personnel only.',
      example: '126542.0',
      rulesSummary: 'All data must be accurate, complete, and entered using the official format by authorized personnel only.',
      compositeKeyPart: false
    },    {
      key: 'geocode',
      officialHeader: 'Geocode',
      aliases: ["Geocode", "geocode", "GEOCODE"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: 'All geographic data must use the official barangay geocode and follow standardized coordinates and location names.',
      example: 'PH-01-03-02-007',
      rulesSummary: 'All geographic data must use the official barangay geocode and follow standardized coordinates and location names.',
      compositeKeyPart: false
    },    {
      key: 'purokSitio',
      officialHeader: 'Purok/Sitio',
      aliases: ["Purok/Sitio", "purok/sitio", "PUROK/SITIO"],
      type: 'string',
      required: false,
      acceptedValues: undefined,
      description: 'Input official names of the location, Do not use roman numerals,',
      example: 'Purok 4',
      rulesSummary: 'Input official names of the location, Do not use roman numerals,',
      compositeKeyPart: false
    },    {
      key: 'latitude',
      officialHeader: 'Latitude',
      aliases: ["Latitude", "latitude", "LATITUDE"],
      type: 'coordinate_lat',
      required: false,
      acceptedValues: undefined,
      description: 'Input must be a valid geographic coordinate',
      example: '14.599512',
      rulesSummary: 'Input must be a valid geographic coordinate',
      compositeKeyPart: false
    },    {
      key: 'longitude',
      officialHeader: 'Longitude',
      aliases: ["Longitude", "longitude", "LONGITUDE"],
      type: 'coordinate_lng',
      required: false,
      acceptedValues: undefined,
      description: '',
      example: '120.984222',
      rulesSummary: '',
      compositeKeyPart: false
    },    {
      key: 'susceptibilityRating',
      officialHeader: 'Susceptibility Rating',
      aliases: ["Susceptibility Rating", "susceptibility rating", "SUSCEPTIBILITY RATING"],
      type: 'string',
      required: true,
      acceptedValues: ['HF', 'LF', 'MF', 'VHF', 'HIGH FLOOD SUSCEPTIBILITY (HF)', 'LOW FLOOD SUSCEPTIBILITY (LF)', 'MODERATE FLOOD SUSCEPTIBILITY (MF)', 'VERY HIGH FLOOD SUSCEPTIBILITY (VHF)'],
      description: 'Susceptibility ratings must be assigned based on validated hazard assessments and entered using standardized categories such as "HIGH FLOOD SUSCEPTIBILITY (HF), LOW FLOOD SUSCEPTIBILITY (LF), MODERATE FLOOD SUSCEPTIBILITY (MF), VERY HIGH FLOOD SUSCEPTIBILITY (VHF)"',
      example: 'HF',
      rulesSummary: 'Susceptibility ratings must be assigned based on validated hazard assessments and entered using standardized categories ',
      compositeKeyPart: false
    },    {
      key: 'floodHeight',
      officialHeader: 'Flood Height',
      aliases: ["Flood Height", "flood height", "FLOOD HEIGHT"],
      type: 'float',
      required: false,
      acceptedValues: undefined,
      description: 'Flood height must be measured in meters using verified instruments or official reports, and recorded as a numeric value with up to two decimal places.',
      example: '1.75',
      rulesSummary: 'Flood height must be measured in meters using verified instruments or official reports, and recorded as a numeric value ',
      compositeKeyPart: false
    },    {
      key: 'elevation',
      officialHeader: 'Elevation',
      aliases: ["Elevation", "elevation", "ELEVATION"],
      type: 'float',
      required: false,
      acceptedValues: undefined,
      description: 'Elevation must be recorded in meters above sea level as a numeric value with up to two decimal places, based on official surveys or GPS measurements.',
      example: '45.3',
      rulesSummary: 'Elevation must be recorded in meters above sea level as a numeric value with up to two decimal places, based on official',
      compositeKeyPart: false
    },    {
      key: 'poi',
      officialHeader: 'POI',
      aliases: ["POI", "poi", "Point of Interest", "point of interest", "POINT OF INTEREST"],
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
