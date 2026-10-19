import { ALL_DATASETS } from '../templates';
import { DatasetDefinition, FieldDefinition } from '../types';

export interface ColumnMatch {
  uploaded: string;
  template: string;
  fieldKey: string;
  field: FieldDefinition;
}

export interface DetectionResult {
  dataset: DatasetDefinition;
  confidenceScore: number; // 0 - 100
  matchedColumns: ColumnMatch[];
  missingColumns: string[]; // Official template headers missing in uploaded file
  missingRequiredColumns: string[];
  extraColumns: string[]; // Uploaded headers not matching any template field
  isOldOrIncompleteTemplate: boolean;
  canConvertToCurrent: boolean;
}

function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Evaluates uploaded column headers against a single DatasetDefinition.
 */
export function evaluateTemplateMatch(
  uploadedHeaders: string[],
  dataset: DatasetDefinition
): DetectionResult {
  const matchedColumns: ColumnMatch[] = [];
  const matchedTemplateKeys = new Set<string>();
  const matchedUploadedHeaders = new Set<string>();

  for (const uploadedHeader of uploadedHeaders) {
    const normUploaded = normalizeHeader(uploadedHeader);
    let bestField: FieldDefinition | null = null;

    for (const field of dataset.fields) {
      if (matchedTemplateKeys.has(field.key)) continue;

      // Exact match
      if (field.officialHeader.toLowerCase() === uploadedHeader.toLowerCase().trim()) {
        bestField = field;
        break;
      }

      // Normalized match with official header
      if (normalizeHeader(field.officialHeader) === normUploaded) {
        bestField = field;
        break;
      }

      // Alias match
      const matchedAlias = field.aliases.some(
        (a) => normalizeHeader(a) === normUploaded || a.toLowerCase() === uploadedHeader.toLowerCase().trim()
      );
      if (matchedAlias) {
        bestField = field;
        break;
      }
    }

    if (bestField) {
      matchedColumns.push({
        uploaded: uploadedHeader,
        template: bestField.officialHeader,
        fieldKey: bestField.key,
        field: bestField,
      });
      matchedTemplateKeys.add(bestField.key);
      matchedUploadedHeaders.add(uploadedHeader);
    }
  }

  const missingColumns: string[] = [];
  const missingRequiredColumns: string[] = [];
  for (const field of dataset.fields) {
    if (!matchedTemplateKeys.has(field.key)) {
      missingColumns.push(field.officialHeader);
      if (field.required) {
        missingRequiredColumns.push(field.officialHeader);
      }
    }
  }

  const extraColumns: string[] = uploadedHeaders.filter((h) => !matchedUploadedHeaders.has(h));

  // Calculate weighted confidence score
  // Required fields have weight 1.5, optional fields have weight 1.0
  let totalWeight = 0;
  let matchedWeight = 0;
  for (const field of dataset.fields) {
    const weight = field.required ? 1.5 : 1.0;
    totalWeight += weight;
    if (matchedTemplateKeys.has(field.key)) {
      matchedWeight += weight;
    }
  }

  // Penalty for excessive extra columns if few template columns matched
  const rawRatio = totalWeight > 0 ? matchedWeight / totalWeight : 0;
  const confidenceScore = Math.round(rawRatio * 100);

  // An old/incomplete template is detected when key core fields match (e.g. Account Number, Consumption, Barangay)
  // but some columns (like Street, Purok) are absent from the file.
  const isOldOrIncompleteTemplate =
    matchedColumns.length >= 3 &&
    missingColumns.length > 0 &&
    confidenceScore >= 50;

  const canConvertToCurrent = isOldOrIncompleteTemplate && matchedColumns.length > 0;

  return {
    dataset,
    confidenceScore,
    matchedColumns,
    missingColumns,
    missingRequiredColumns,
    extraColumns,
    isOldOrIncompleteTemplate,
    canConvertToCurrent,
  };
}

/**
 * Automatically detects the best matching dataset among all 15 supported datasets.
 */
export function detectDataset(
  uploadedHeaders: string[],
  fileNameOrSheet?: string
): {
  bestMatch: DetectionResult | null;
  allResults: DetectionResult[];
} {
  if (!uploadedHeaders || uploadedHeaders.length === 0) {
    return { bestMatch: null, allResults: [] };
  }

  const allResults = ALL_DATASETS.map((d) => {
    const res = evaluateTemplateMatch(uploadedHeaders, d);
    let boost = 0;
    if (fileNameOrSheet) {
      const fnLower = fileNameOrSheet.toLowerCase();
      const nameLower = d.name.toLowerCase();
      const idLower = d.id.toLowerCase();
      if (fnLower.includes(nameLower) || fnLower.includes(idLower)) {
        boost = 15;
      }
    }
    return {
      ...res,
      confidenceScore: res.confidenceScore + boost,
    };
  }).sort((a, b) => b.confidenceScore - a.confidenceScore);

  const bestMatch = allResults.length > 0 && allResults[0].confidenceScore > 25 ? allResults[0] : null;

  return {
    bestMatch,
    allResults,
  };
}
