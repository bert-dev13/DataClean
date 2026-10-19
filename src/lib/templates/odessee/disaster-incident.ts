import { DatasetDefinition } from '../../types';

export const disasterincidentDefinition: DatasetDefinition = {
  id: 'odessee-disaster',
  system: 'ODeSSEE',
  name: 'Disaster Incident Report',
  description: 'ODeSSEE disaster incidents, weather conditions, water levels, and casualties.',
  officialFileName: 'Disaster Incident Report Template.xlsx',
  officialSheetName: 'Disaster Incident Report',
  headerRowIndex: 2,
  compositeKey: ["reportDate", "incident"],
  fields: [
    {
      key: 'reportDate',
      officialHeader: 'Report Date',
      aliases: ["Report Date", "report date", "REPORT DATE"],
      type: 'date',
      required: true,
      acceptedValues: undefined,
      description: '',
      example: '',
      rulesSummary: '',
      compositeKeyPart: true
    },    {
      key: 'incident',
      officialHeader: 'Incident',
      aliases: ["Incident", "incident", "INCIDENT"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: '',
      example: '',
      rulesSummary: '',
      compositeKeyPart: true
    },    {
      key: 'incidentDateDateRange',
      officialHeader: 'Incident Date (Date Range)',
      aliases: ["Incident Date (Date Range)", "incident date (date range)", "INCIDENT DATE (DATE RANGE)"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: '',
      example: '',
      rulesSummary: '',
      compositeKeyPart: false
    },    {
      key: 'skyCondition',
      officialHeader: 'Sky Condition',
      aliases: ["Sky Condition", "sky condition", "SKY CONDITION"],
      type: 'string',
      required: false,
      acceptedValues: undefined,
      description: '',
      example: '',
      rulesSummary: '',
      compositeKeyPart: false
    },    {
      key: 'wind',
      officialHeader: 'Wind',
      aliases: ["Wind", "wind", "WIND"],
      type: 'string',
      required: false,
      acceptedValues: undefined,
      description: '',
      example: '',
      rulesSummary: '',
      compositeKeyPart: false
    },    {
      key: 'precipitation',
      officialHeader: 'Precipitation',
      aliases: ["Precipitation", "precipitation", "PRECIPITATION"],
      type: 'string',
      required: false,
      acceptedValues: undefined,
      description: '',
      example: '',
      rulesSummary: '',
      compositeKeyPart: false
    },    {
      key: 'gaugingStation',
      officialHeader: 'Gauging Station',
      aliases: ["Gauging Station", "gauging station", "GAUGING STATION"],
      type: 'string',
      required: false,
      acceptedValues: undefined,
      description: '',
      example: '',
      rulesSummary: '',
      compositeKeyPart: false
    },    {
      key: 'currentLevel',
      officialHeader: 'Current Level',
      aliases: ["Current Level", "current level", "CURRENT LEVEL"],
      type: 'float',
      required: false,
      acceptedValues: undefined,
      description: '',
      example: '',
      rulesSummary: '',
      compositeKeyPart: false
    },    {
      key: 'areasLikelyToBeAffected',
      officialHeader: 'Areas Likely to be Affected',
      aliases: ["Areas Likely to be Affected", "areas likely to be affected", "AREAS LIKELY TO BE AFFECTED"],
      type: 'string',
      required: false,
      acceptedValues: undefined,
      description: '',
      example: '',
      rulesSummary: '',
      compositeKeyPart: false
    },    {
      key: 'casualty',
      officialHeader: 'Casualty',
      aliases: ["Casualty", "casualty", "CASUALTY"],
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
