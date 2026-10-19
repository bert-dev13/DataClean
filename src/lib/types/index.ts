export type SystemType = 'DBL' | 'ODeSSEE';

export type FieldType =
  | 'string'
  | 'number'
  | 'integer'
  | 'float'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'coordinate_lat'
  | 'coordinate_lng';

export type RuleClassification =
  | 'VALID'
  | 'AUTO-FIX-AVAILABLE'
  | 'AUTO-FIX'
  | 'ERROR';

export type IssueCategory =
  | 'MISSING_VALUE'
  | 'FORMATTING'
  | 'DUPLICATE'
  | 'INVALID_DATE'
  | 'INVALID_CATEGORY'
  | 'LOCATION'
  | 'NUMERIC'
  | 'STRUCTURAL'
  | 'OTHER';

export interface FieldDefinition {
  key: string;
  officialHeader: string;
  aliases: string[];
  type: FieldType;
  required: boolean;
  acceptedValues?: string[];
  description: string;
  example?: string;
  rulesSummary?: string;
  compositeKeyPart?: boolean;
}

export interface DatasetDefinition {
  id: string;
  system: SystemType;
  name: string;
  description: string;
  officialFileName: string;
  officialSheetName: string;
  headerRowIndex: number;
  compositeKey: string[];
  fields: FieldDefinition[];
  notes?: string[];
}

export interface ValidationIssue {
  id: string;
  rowIndex: number; // 1-indexed Excel row
  fieldKey: string;
  fieldHeader: string;
  category: IssueCategory;
  classification: RuleClassification;
  ruleId: string;
  message: string;
  originalValue: unknown;
  suggestedValue?: unknown;
  isResolved: boolean;
  resolvedAction?: 'ACCEPTED_SUGGESTION' | 'MANUAL_EDIT' | 'KEPT_ORIGINAL' | 'AUTO_FIXED';
}

export interface CleaningChange {
  id: string;
  rowIndex: number;
  fieldKey: string;
  fieldHeader: string;
  originalValue: unknown;
  finalValue: unknown;
  ruleId: string;
  actionType: string;
  status: RuleClassification | 'MANUAL_EDIT';
  timestamp: string;
  /** Safe-fix rule identifiers applied (only for SAFE_AUTO_FIX changes). */
  safeFixRules?: SafeFixRule[];
}

/** Deterministic safe-fix rules DataClean can apply when the user clicks "Fix All Automatically". */
export type SafeFixRule =
  | 'TRIM_WHITESPACE'
  | 'COLLAPSE_WHITESPACE'
  | 'NORMALIZE_NON_BREAKING_SPACE'
  | 'STRIP_CURRENCY'
  | 'STRIP_THOUSANDS_SEPARATOR'
  | 'REMOVE_UNIT'
  | 'CONVERT_TO_NUMBER'
  | 'NORMALIZE_DATE'
  | 'NORMALIZE_DATETIME'
  | 'NORMALIZE_CATEGORY_CASE'
  | 'NORMALIZE_BOOLEAN'
  | 'NORMALIZE_PUROK_NUMERAL'
  | 'PUROK_ROMAN_NUMERAL';

/**
 * Result of DETECTING (not applying) a safe fix.
 * Produced by `detectSafeFix()`; never changes the dataset by itself.
 */
export interface SafeFixSuggestion {
  originalValue: unknown;
  suggestedValue: unknown;
  fixAvailable: boolean;
  /** Primary rule (first rule that matched), or null when no fix is available. */
  rule: SafeFixRule | null;
  rules: SafeFixRule[];
  /** Human-readable explanation, e.g. "Removed leading/trailing whitespace". */
  description: string;
}

/**
 * Per-cell state.
 *
 * Three values are maintained:
 * - originalValue: exactly as uploaded. NEVER changes.
 * - workingValue:  the current value used for display and export. Equals
 *                  originalValue after upload/analysis and only changes through
 *                  an explicit user action (Fix All Automatically, manual edit,
 *                  accepting a suggestion, keeping the original).
 * - finalValue:    the committed value after an explicit cleaning action;
 *                  null until the user has taken such an action.
 */
export interface CellState {
  originalValue: unknown;
  workingValue: unknown;
  finalValue: unknown | null;
  /** Backwards compatibility alias equal to workingValue */
  cleanedValue?: unknown;
  /** A detected-but-NOT-applied safe fix for the current workingValue. */
  pendingFix: SafeFixSuggestion | null;
  /** True once a safe fix has been applied to this cell via "Fix All Automatically". */
  autoCleaned: boolean;
  issues: ValidationIssue[];
  changes: CleaningChange[];
  status: RuleClassification;
}

export interface CleanRecord {
  _rowIndex: number;
  _status: RuleClassification;
  _issues: ValidationIssue[];
  _cells: Record<string, CellState>;
  /** True when at least one cell has a safe fix available that has not been applied yet. */
  _pendingAutoFix?: boolean;
  [key: string]: unknown;
}

export interface QualityReport {
  datasetId: string;
  datasetName: string;
  system: SystemType;
  totalRecords: number;
  validRecords: number;
  /** Records whose safe fixes have been APPLIED via "Fix All Automatically". */
  autoCleanedRecords: number;
  /** Records with safe fixes DETECTED but not yet applied. */
  autoFixAvailableRecords: number;
  /** Number of individual cells with a pending (unapplied) safe fix. */
  autoFixAvailableCells: number;
  /** Number of individual cells that were auto-cleaned. */
  autoCleanedCells: number;
  reviewRecords: number;
  errorRecords: number;
  readinessScore: number; // 0 - 100
  readinessFormulaExplanation: string;
  issueCounts: {
    missingValues: number;
    formattingIssues: number;
    duplicates: number;
    invalidDates: number;
    invalidCategories: number;
    locationIssues: number;
    numericIssues: number;
    other: number;
  };
  matchedColumns: { uploaded: string; template: string }[];
  missingColumns: string[];
  extraColumns: string[];
  templateMatchScore: number;
  isOldOrIncompleteTemplate: boolean;
}
