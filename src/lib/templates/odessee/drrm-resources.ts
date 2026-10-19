import { DatasetDefinition } from '../../types';

export const drrmresourcesDefinition: DatasetDefinition = {
  id: 'odessee-drrm',
  system: 'ODeSSEE',
  name: 'DRRM Resources',
  description: 'ODeSSEE disaster risk reduction emergency equipment, teams, and inventory.',
  officialFileName: 'DRRM Resources Import Template.xlsx',
  officialSheetName: 'DRRM Resources Import Template',
  headerRowIndex: 1,
  compositeKey: ["groupTeam", "resourcesEquipment"],
  fields: [
    {
      key: 'groupTeam',
      officialHeader: 'Group/Team',
      aliases: ["Group/Team", "group/team", "GROUP/TEAM"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: 'Input official Group/Team names, Do not use roman numerals in case numbers are present, Avoid abbreviations, Capitalize the first letter of each word',
      example: 'Rescue 922',
      rulesSummary: 'Input official Group/Team names, Do not use roman numerals in case numbers are present, Avoid abbreviations, Capitalize ',
      compositeKeyPart: true
    },    {
      key: 'resourcesEquipment',
      officialHeader: 'Resources/Equipment',
      aliases: ["Resources/Equipment", "resources/equipment", "RESOURCES/EQUIPMENT"],
      type: 'string',
      required: true,
      acceptedValues: undefined,
      description: 'Input official Resource/Equipment names, Do not use roman numerals in case numbers are present, Avoid abbreviations, Capitalize the first letter of each word',
      example: 'Stretcher',
      rulesSummary: 'Input official Resource/Equipment names, Do not use roman numerals in case numbers are present, Avoid abbreviations, Cap',
      compositeKeyPart: true
    },    {
      key: 'quantity',
      officialHeader: 'Quantity',
      aliases: ["Quantity", "quantity", "QUANTITY"],
      type: 'integer',
      required: true,
      acceptedValues: undefined,
      description: 'Input whole number, Use 0 if none, Do not use letters.',
      example: '1.0',
      rulesSummary: 'Input whole number, Use 0 if none, Do not use letters.',
      compositeKeyPart: false
    },    {
      key: 'unit',
      officialHeader: 'Unit',
      aliases: ["Unit", "unit", "UNIT"],
      type: 'string',
      required: false,
      acceptedValues: ['Pc', 'PCs', 'Pairs', 'Sets', 'Units', 'Boxes', 'Rolls'],
      description: 'Choose one of the predetermined category based on the input of Quantity: “Pc" (Piece), "PCs" (Pieces), "Pairs"',
      example: 'Pc',
      rulesSummary: 'Choose one of the predetermined category based on the input of Quantity: “Pc" (Piece), "PCs" (Pieces), "Pairs"',
      compositeKeyPart: false
    },    {
      key: 'category',
      officialHeader: 'Category',
      aliases: ["Category", "category", "CATEGORY"],
      type: 'string',
      required: false,
      acceptedValues: undefined,
      description: 'Input official Category names, Avoid abbreviations, Capitalize the first letter of each word',
      example: 'Emergency Medical Equipment',
      rulesSummary: 'Input official Category names, Avoid abbreviations, Capitalize the first letter of each word',
      compositeKeyPart: false
    }
  ],
  notes: []
};
