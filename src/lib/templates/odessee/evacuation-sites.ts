import { DatasetDefinition } from '../../types';

export const evacuationsitesDefinition: DatasetDefinition = {
  id: 'odessee-evacuation',
  system: 'ODeSSEE',
  name: 'Evacuation Sites',
  description: 'ODeSSEE emergency evacuation center facilities, capacity, and amenities.',
  officialFileName: 'Evacuation Sites Import Template.xlsx',
  officialSheetName: 'Evacuation Sites Import Templat',
  headerRowIndex: 1,
  compositeKey: ["nameOfEvacuationCenter", "barangay"],
  fields: [
    {
      key: 'nameOfEvacuationCenter',
      officialHeader: 'Name of Evacuation Center ',
      aliases: ["Name of Evacuation Center ", "Name of Evacuation Center", "name of evacuation center", "NAME OF EVACUATION CENTER"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: 'Input official Evacuation Center names, Do not use roman numerals in case numbers are present, Avoid abbreviations, Capitalize the first letter of each word',
      example: 'San Roque Evacuation Center',
      rulesSummary: 'Input official Evacuation Center names, Do not use roman numerals in case numbers are present, Avoid abbreviations, Capi',
      compositeKeyPart: true
    },    {
      key: 'barangay',
      officialHeader: 'Barangay',
      aliases: ["Barangay", "barangay", "BARANGAY", "brgy", "barangay name"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: 'Input official Barangay names, Do not use roman numerals in case numbers are present, Avoid abbreviations, Capitalize the first letter of each word',
      example: 'Barangay Malinis',
      rulesSummary: 'Input official Barangay names, Do not use roman numerals in case numbers are present, Avoid abbreviations, Capitalize th',
      compositeKeyPart: true
    },    {
      key: 'latitude',
      officialHeader: 'Latitude',
      aliases: ["Latitude", "latitude", "LATITUDE"],
      type: 'coordinate_lat',
      required: false,
      acceptedValues: undefined,
      description: 'Input must not contain a non-numeric symbols/units',
      example: '14.5995',
      rulesSummary: 'Input must not contain a non-numeric symbols/units',
      compositeKeyPart: false
    },    {
      key: 'longitude',
      officialHeader: 'Longitude',
      aliases: ["Longitude", "longitude", "LONGITUDE"],
      type: 'coordinate_lng',
      required: false,
      acceptedValues: undefined,
      description: '',
      example: '120.9842',
      rulesSummary: '',
      compositeKeyPart: false
    },    {
      key: 'noOfFamily',
      officialHeader: 'No. of Family',
      aliases: ["No. of Family", "no. of family", "NO. OF FAMILY", "number of family", "no of family"],
      type: 'integer',
      required: false,
      acceptedValues: undefined,
      description: 'Input whole numbers, Use 0 if none, Do not use letters.',
      example: '38.0',
      rulesSummary: 'Input whole numbers, Use 0 if none, Do not use letters.',
      compositeKeyPart: false
    },    {
      key: 'noOfIndividuals',
      officialHeader: 'No. of Individuals',
      aliases: ["No. of Individuals", "no. of individuals", "NO. OF INDIVIDUALS", "number of individuals", "no of individuals"],
      type: 'integer',
      required: false,
      acceptedValues: undefined,
      description: '',
      example: '182.0',
      rulesSummary: '',
      compositeKeyPart: false
    },    {
      key: 'noOfStoreyFloors',
      officialHeader: 'No. of Storey/ Floors',
      aliases: ["No. of Storey/ Floors", "no. of storey/ floors", "NO. OF STOREY/ FLOORS", "number of storey/ floors", "no of storey/ floors"],
      type: 'integer',
      required: false,
      acceptedValues: undefined,
      description: '',
      example: '2.0',
      rulesSummary: '',
      compositeKeyPart: false
    },    {
      key: 'noOfRooms',
      officialHeader: 'No. of Rooms',
      aliases: ["No. of Rooms", "no. of rooms", "NO. OF ROOMS", "number of rooms", "no of rooms"],
      type: 'integer',
      required: false,
      acceptedValues: undefined,
      description: '',
      example: '10.0',
      rulesSummary: '',
      compositeKeyPart: false
    },    {
      key: 'noOfToiletForWomen',
      officialHeader: 'No. of Toilet for Women',
      aliases: ["No. of Toilet for Women", "no. of toilet for women", "NO. OF TOILET FOR WOMEN", "number of toilet for women", "no of toilet for women"],
      type: 'integer',
      required: false,
      acceptedValues: undefined,
      description: '',
      example: '5.0',
      rulesSummary: '',
      compositeKeyPart: false
    },    {
      key: 'noOfToiletForMen',
      officialHeader: 'No. of Toilet for Men',
      aliases: ["No. of Toilet for Men", "no. of toilet for men", "NO. OF TOILET FOR MEN", "number of toilet for men", "no of toilet for men"],
      type: 'integer',
      required: false,
      acceptedValues: undefined,
      description: '',
      example: '4.0',
      rulesSummary: '',
      compositeKeyPart: false
    },    {
      key: 'commonCr',
      officialHeader: 'Common CR',
      aliases: ["Common CR", "common cr", "COMMON CR"],
      type: 'integer',
      required: false,
      acceptedValues: undefined,
      description: '',
      example: '3.0',
      rulesSummary: '',
      compositeKeyPart: false
    },    {
      key: 'noOfBathShowerAreaForWomen',
      officialHeader: 'No. of Bath/ Shower Area for Women',
      aliases: ["No. of Bath/ Shower Area for Women", "no. of bath/ shower area for women", "NO. OF BATH/ SHOWER AREA FOR WOMEN", "number of bath/ shower area for women", "no of bath/ shower area for women"],
      type: 'integer',
      required: false,
      acceptedValues: undefined,
      description: '',
      example: '4.0',
      rulesSummary: '',
      compositeKeyPart: false
    },    {
      key: 'noOfBathShowerAreaForMen',
      officialHeader: 'No. of Bath/ Shower Area for Men',
      aliases: ["No. of Bath/ Shower Area for Men", "no. of bath/ shower area for men", "NO. OF BATH/ SHOWER AREA FOR MEN", "number of bath/ shower area for men", "no of bath/ shower area for men"],
      type: 'integer',
      required: false,
      acceptedValues: undefined,
      description: '',
      example: '4.0',
      rulesSummary: '',
      compositeKeyPart: false
    },    {
      key: 'waterSourceS',
      officialHeader: 'Water Source/s',
      aliases: ["Water Source/s", "water source/s", "WATER SOURCE/S"],
      type: 'string',
      required: false,
      acceptedValues: undefined,
      description: 'Input types of water source/s, Avoid abbreviations, Capitalize the first letter of each word',
      example: 'Deep well, Water Tana',
      rulesSummary: 'Input types of water source/s, Avoid abbreviations, Capitalize the first letter of each word',
      compositeKeyPart: false
    },    {
      key: 'breastFeedingArea',
      officialHeader: 'Breast feeding Area',
      aliases: ["Breast feeding Area", "breast feeding area", "BREAST FEEDING AREA"],
      type: 'string',
      required: false,
      acceptedValues: ['Available', 'Not Available'],
      description: 'Indicate availability; write "Available" or "Not Available"',
      example: 'Available',
      rulesSummary: 'Indicate availability; write "Available" or "Not Available"',
      compositeKeyPart: false
    },    {
      key: 'withStorageYNIfYesIndicateTheFloorArea',
      officialHeader: 'With Storage (Y/N) If yes indicate the floor area',
      aliases: ["With Storage (Y/N) If yes indicate the floor area", "with storage (y/n) if yes indicate the floor area", "WITH STORAGE (Y/N) IF YES INDICATE THE FLOOR AREA"],
      type: 'string',
      required: false,
      acceptedValues: undefined,
      description: 'Format: "Y - [area]" or "N", Avoid abbreviation with the area name.',
      example: 'Y - 1st floor',
      rulesSummary: 'Format: "Y - [area]" or "N", Avoid abbreviation with the area name.',
      compositeKeyPart: false
    },    {
      key: 'usedAsCovid19TtmfYN',
      officialHeader: 'Used as COVID-19 TTMF (Y/N)',
      aliases: ["Used as COVID-19 TTMF (Y/N)", "used as covid-19 ttmf (y/n)", "USED AS COVID-19 TTMF (Y/N)"],
      type: 'boolean',
      required: false,
      acceptedValues: ['Y', 'N', 'Yes', 'No'],
      description: 'Input “Y” or “N”, Capitalize the letter.',
      example: 'Y',
      rulesSummary: 'Input “Y” or “N”, Capitalize the letter.',
      compositeKeyPart: false
    },    {
      key: 'inspectedSafe',
      officialHeader: 'Inspected Safe',
      aliases: ["Inspected Safe", "inspected safe", "INSPECTED SAFE"],
      type: 'boolean',
      required: false,
      acceptedValues: ['Y', 'N', 'Yes', 'No'],
      description: '',
      example: 'Y',
      rulesSummary: '',
      compositeKeyPart: false
    }
  ],
  notes: []
};
