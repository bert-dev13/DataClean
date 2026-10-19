import { CleanRecord, DatasetDefinition, QualityReport, ValidationIssue } from '../types';

export function calculateQualityReport(
  records: CleanRecord[],
  allIssues: ValidationIssue[],
  dataset: DatasetDefinition,
  detectionMeta: {
    matchedColumns: { uploaded: string; template: string }[];
    missingColumns: string[];
    extraColumns: string[];
    templateMatchScore: number;
    isOldOrIncompleteTemplate: boolean;
  }
): QualityReport {
  const totalRecords = records.length;
  const validRecords = records.filter((r) => r._status === 'VALID').length;

  // Auto-Fix Available: Records that have safe fixes detected but not yet applied
  const autoFixAvailableRecords = records.filter(
    (r) => r._status === 'AUTO-FIX-AVAILABLE' || (r._pendingAutoFix === true && r._status !== 'ERROR')
  ).length;

  // Auto-Cleaned: Records where safe fixes were explicitly applied
  const autoCleanedRecords = records.filter(
    (r) =>
      r._status !== 'ERROR' &&
      r._status !== 'AUTO-FIX-AVAILABLE' &&
      Object.values(r._cells || {}).some((c) => c.autoCleaned)
  ).length;

  let autoFixAvailableCells = 0;
  let autoCleanedCells = 0;
  for (const r of records) {
    if (!r._cells) continue;
    for (const key of Object.keys(r._cells)) {
      const cell = r._cells[key];
      if (cell?.pendingFix?.fixAvailable) autoFixAvailableCells++;
      if (cell?.autoCleaned) autoCleanedCells++;
    }
  }

  const reviewRecords = 0;
  const errorRecords = records.filter((r) => r._status === 'ERROR').length;

  const issueCounts = {
    missingValues: 0,
    formattingIssues: 0,
    duplicates: 0,
    invalidDates: 0,
    invalidCategories: 0,
    locationIssues: 0,
    numericIssues: 0,
    other: 0,
  };

  for (const issue of allIssues) {
    if (issue.isResolved) continue;
    switch (issue.category) {
      case 'MISSING_VALUE':
        issueCounts.missingValues++;
        break;
      case 'FORMATTING':
        issueCounts.formattingIssues++;
        break;
      case 'DUPLICATE':
        issueCounts.duplicates++;
        break;
      case 'INVALID_DATE':
        issueCounts.invalidDates++;
        break;
      case 'INVALID_CATEGORY':
        issueCounts.invalidCategories++;
        break;
      case 'LOCATION':
        issueCounts.locationIssues++;
        break;
      case 'NUMERIC':
        issueCounts.numericIssues++;
        break;
      default:
        issueCounts.other++;
        break;
    }
  }

  // Calculate readiness score
  // Each required field is a mandatory quality checkpoint (weight 1.0)
  // Optional fields contribute 0.5 to total checkpoints
  const fieldWeights = dataset.fields.reduce((acc, f) => acc + (f.required ? 1.0 : 0.5), 0);
  const totalCheckpoints = Math.max(1, totalRecords * fieldWeights);

  const activeErrors = allIssues.filter((i) => !i.isResolved && i.classification === 'ERROR').length;
  const activePendingFixes = autoFixAvailableCells;

  // Deductions: 1 full point per error, 0.15 per pending auto-fix
  const deductions = activeErrors * 1.0 + activePendingFixes * 0.15;
  let rawScore = Math.round(Math.max(0, (1 - deductions / totalCheckpoints) * 100));

  // Data Integrity Constraint: Never display 100% Ready if any mandatory errors or pending auto-fixes remain
  if (activeErrors > 0) {
    rawScore = Math.min(rawScore, 99);
  } else if (activePendingFixes > 0) {
    rawScore = Math.min(rawScore, 95);
  }

  if (totalRecords === 0) {
    rawScore = 0;
  }

  const readinessFormulaExplanation =
    'Readiness Score = (1 - (Blocking Errors × 1.0 + Pending Fixes × 0.15) / (Total Records × Field Checkpoints)) × 100%. Reaches 100% once safe fixes are applied and all errors are resolved.';

  return {
    datasetId: dataset.id,
    datasetName: dataset.name,
    system: dataset.system,
    totalRecords,
    validRecords,
    autoCleanedRecords,
    autoFixAvailableRecords,
    autoFixAvailableCells,
    autoCleanedCells,
    reviewRecords,
    errorRecords,
    readinessScore: rawScore,
    readinessFormulaExplanation,
    issueCounts,
    matchedColumns: detectionMeta.matchedColumns,
    missingColumns: detectionMeta.missingColumns,
    extraColumns: detectionMeta.extraColumns,
    templateMatchScore: detectionMeta.templateMatchScore,
    isOldOrIncompleteTemplate: detectionMeta.isOldOrIncompleteTemplate,
  };
}
