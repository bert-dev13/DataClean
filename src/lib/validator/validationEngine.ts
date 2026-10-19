import {
  CellState,
  CleaningChange,
  CleanRecord,
  DatasetDefinition,
  FieldDefinition,
  RuleClassification,
  SafeFixSuggestion,
  ValidationIssue,
} from '../types';
import { detectSafeFix } from '../cleaner/safeCleaner';
import { detectDuplicates } from './duplicateDetector';

const ROMAN_NUMERALS_MAP: Record<string, string> = {
  'I': '1',
  'II': '2',
  'III': '3',
  'IV': '4',
  'V': '5',
  'VI': '6',
  'VII': '7',
  'VIII': '8',
  'IX': '9',
  'X': '10',
};

function checkRomanPurok(val: string): { hasRoman: boolean; suggested: string } {
  const match = val.match(/^purok\s+(i|ii|iii|iv|v|vi|vii|viii|ix|x)$/i);
  if (match) {
    const roman = match[1].toUpperCase();
    const arabic = ROMAN_NUMERALS_MAP[roman];
    if (arabic) {
      return { hasRoman: true, suggested: `Purok ${arabic}` };
    }
  }
  return { hasRoman: false, suggested: val };
}

/**
 * Validates a single cell value against its field definition.
 */
export function validateCell(
  value: unknown,
  field: FieldDefinition,
  rowIndex: number,
  originalValue: unknown
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const strVal = value !== null && value !== undefined ? String(value).trim() : '';

  // 1. Required Check
  if (field.required && strVal === '') {
    issues.push({
      id: `err-req-${rowIndex}-${field.key}`,
      rowIndex,
      fieldKey: field.key,
      fieldHeader: field.officialHeader,
      category: 'MISSING_VALUE',
      classification: 'ERROR',
      ruleId: 'REQUIRED_FIELD_MISSING',
      message: `Mandatory field "${field.officialHeader}" is missing. Official data must not be left blank.`,
      originalValue,
      isResolved: false,
    });
    return issues; // Cannot perform further type validations on an empty value
  }

  // If value is empty and not required, it's valid
  if (strVal === '') {
    return issues;
  }

  // 2. Numeric / Float Validations
  if (field.type === 'float' || field.type === 'number') {
    const num = Number(strVal);
    if (isNaN(num)) {
      issues.push({
        id: `err-num-${rowIndex}-${field.key}`,
        rowIndex,
        fieldKey: field.key,
        fieldHeader: field.officialHeader,
        category: 'NUMERIC',
        classification: 'ERROR',
        ruleId: 'INVALID_NUMERIC',
        message: `Field "${field.officialHeader}" must be a valid number, got "${strVal}".`,
        originalValue,
        isResolved: false,
      });
    } else {
      // Consumption, sales, heights must be non-negative
      if (
        (field.key.toLowerCase().includes('consumption') ||
          field.key.toLowerCase().includes('sales') ||
          field.key.toLowerCase().includes('height')) &&
        num < 0
      ) {
        issues.push({
          id: `err-neg-${rowIndex}-${field.key}`,
          rowIndex,
          fieldKey: field.key,
          fieldHeader: field.officialHeader,
          category: 'NUMERIC',
          classification: 'ERROR',
          ruleId: 'NEGATIVE_NUMBER_NOT_ALLOWED',
          message: `Field "${field.officialHeader}" cannot be negative (${num}). Use 0 only for confirmed zero.`,
          originalValue,
          isResolved: false,
        });
      }
    }
  }

  // 3. Integer Validations
  if (field.type === 'integer') {
    const num = Number(strVal);
    if (isNaN(num) || !Number.isInteger(num)) {
      issues.push({
        id: `err-int-${rowIndex}-${field.key}`,
        rowIndex,
        fieldKey: field.key,
        fieldHeader: field.officialHeader,
        category: 'NUMERIC',
        classification: 'ERROR',
        ruleId: 'INVALID_INTEGER',
        message: `Field "${field.officialHeader}" must be a whole number (integer), got "${strVal}".`,
        originalValue,
        isResolved: false,
      });
    } else if (num < 0) {
      issues.push({
        id: `err-int-neg-${rowIndex}-${field.key}`,
        rowIndex,
        fieldKey: field.key,
        fieldHeader: field.officialHeader,
        category: 'NUMERIC',
        classification: 'ERROR',
        ruleId: 'NEGATIVE_INTEGER_NOT_ALLOWED',
        message: `Field "${field.officialHeader}" count cannot be negative (${num}).`,
        originalValue,
        isResolved: false,
      });
    }
  }

  // 4. Date and Datetime Validations
  if (field.type === 'date' || field.type === 'datetime') {
    const isDt = field.type === 'datetime';
    const pattern = isDt
      ? /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/
      : /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = strVal.match(pattern);

    if (!match) {
      issues.push({
        id: `err-date-${rowIndex}-${field.key}`,
        rowIndex,
        fieldKey: field.key,
        fieldHeader: field.officialHeader,
        category: 'INVALID_DATE',
        classification: 'ERROR',
        ruleId: isDt ? 'INVALID_DATETIME_FORMAT' : 'INVALID_DATE_FORMAT',
        message: `Field "${field.officialHeader}" must be a valid ${isDt ? 'datetime in YYYY-MM-DD HH:mm:ss format' : 'date in YYYY-MM-DD format'}, got "${strVal}".`,
        originalValue,
        isResolved: false,
      });
    } else {
      const y = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const d = parseInt(match[3], 10);
      const hh = isDt ? parseInt(match[4], 10) : 0;
      const mm = isDt ? parseInt(match[5], 10) : 0;
      const ss = isDt && match[6] ? parseInt(match[6], 10) : 0;

      const dateObj = new Date(y, m - 1, d, hh, mm, ss);
      if (
        dateObj.getFullYear() !== y ||
        dateObj.getMonth() !== m - 1 ||
        dateObj.getDate() !== d ||
        (isDt && (hh > 23 || mm > 59 || ss > 59))
      ) {
        issues.push({
          id: `err-cal-date-${rowIndex}-${field.key}`,
          rowIndex,
          fieldKey: field.key,
          fieldHeader: field.officialHeader,
          category: 'INVALID_DATE',
          classification: 'ERROR',
          ruleId: 'INVALID_CALENDAR_DATE',
          message: `Date "${strVal}" is not a real calendar date (e.g. invalid days in month or invalid time).`,
          originalValue,
          isResolved: false,
        });
      } else {
        const now = new Date();
        const futureLimit = new Date();
        futureLimit.setMonth(now.getMonth() + 1);

        const keyLower = field.key.toLowerCase();
        const isPastOnly = keyLower.includes('birth') || keyLower.includes('committed');
        if (isPastOnly && dateObj > now) {
          issues.push({
            id: `err-date-fut-${rowIndex}-${field.key}`,
            rowIndex,
            fieldKey: field.key,
            fieldHeader: field.officialHeader,
            category: 'INVALID_DATE',
            classification: 'ERROR',
            ruleId: 'DATE_CANNOT_BE_FUTURE',
            message: `Field "${field.officialHeader}" date cannot be in the future, got "${strVal}".`,
            originalValue,
            isResolved: false,
          });
        } else if (!isPastOnly && dateObj > futureLimit) {
          issues.push({
            id: `err-date-fut-${rowIndex}-${field.key}`,
            rowIndex,
            fieldKey: field.key,
            fieldHeader: field.officialHeader,
            category: 'INVALID_DATE',
            classification: 'ERROR',
            ruleId: 'FUTURE_DATE_WARNING',
            message: `Date "${strVal}" is more than one month in the future. Please confirm accuracy.`,
            originalValue,
            suggestedValue: strVal,
            isResolved: false,
          });
        }
      }
    }
  }

  // 4b. Graduation Year Specific Validation
  if (field.key === 'graduationYear') {
    const yr = Number(strVal);
    if (isNaN(yr) || yr < 1950 || yr > 2050 || !Number.isInteger(yr)) {
      issues.push({
        id: `err-gradyear-${rowIndex}-${field.key}`,
        rowIndex,
        fieldKey: field.key,
        fieldHeader: field.officialHeader,
        category: 'INVALID_DATE',
        classification: 'ERROR',
        ruleId: 'INVALID_GRADUATION_YEAR',
        message: `Field "${field.officialHeader}" must be a 4-digit calendar year (e.g., 2025), got "${strVal}".`,
        originalValue,
        isResolved: false,
      });
    }
  }

  // 5. Geographic Coordinates
  if (field.type === 'coordinate_lat') {
    const lat = Number(strVal);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      issues.push({
        id: `err-lat-${rowIndex}-${field.key}`,
        rowIndex,
        fieldKey: field.key,
        fieldHeader: field.officialHeader,
        category: 'LOCATION',
        classification: 'ERROR',
        ruleId: 'INVALID_LATITUDE',
        message: `Latitude must be a decimal between -90 and 90, got "${strVal}".`,
        originalValue,
        isResolved: false,
      });
    } else if (lat < 4.5 || lat > 21.5) {
      issues.push({
        id: `err-lat-ph-${rowIndex}-${field.key}`,
        rowIndex,
        fieldKey: field.key,
        fieldHeader: field.officialHeader,
        category: 'LOCATION',
        classification: 'ERROR',
        ruleId: 'LATITUDE_OUTSIDE_PHILIPPINES',
        message: `Latitude ${lat} is outside the Philippines bounding box (4.5°N - 21.5°N). Verify if coordinates are swapped.`,
        originalValue,
        isResolved: false,
      });
    }
  }

  if (field.type === 'coordinate_lng') {
    const lng = Number(strVal);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      issues.push({
        id: `err-lng-${rowIndex}-${field.key}`,
        rowIndex,
        fieldKey: field.key,
        fieldHeader: field.officialHeader,
        category: 'LOCATION',
        classification: 'ERROR',
        ruleId: 'INVALID_LONGITUDE',
        message: `Longitude must be a decimal between -180 and 180, got "${strVal}".`,
        originalValue,
        isResolved: false,
      });
    } else if (lng < 116.0 || lng > 127.0) {
      issues.push({
        id: `err-lng-ph-${rowIndex}-${field.key}`,
        rowIndex,
        fieldKey: field.key,
        fieldHeader: field.officialHeader,
        category: 'LOCATION',
        classification: 'ERROR',
        ruleId: 'LONGITUDE_OUTSIDE_PHILIPPINES',
        message: `Longitude ${lng} is outside the Philippines bounding box (116.0°E - 127.0°E). Verify if coordinates are swapped.`,
        originalValue,
        isResolved: false,
      });
    }
  }

  // 6. Categorical Acceptance Check
  if (field.acceptedValues && field.acceptedValues.length > 0) {
    const match = field.acceptedValues.find(
      (a) => a.toLowerCase() === strVal.toLowerCase()
    );
    if (!match) {
      // Find closest fuzzy match by normalizing spaces and punctuation
      const normStr = strVal.toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
      const candidate = field.acceptedValues.find((a) => {
        const normA = a.toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
        return normA === normStr || normA.includes(normStr) || normStr.includes(normA);
      });
      issues.push({
        id: `err-cat-${rowIndex}-${field.key}`,
        rowIndex,
        fieldKey: field.key,
        fieldHeader: field.officialHeader,
        category: 'INVALID_CATEGORY',
        classification: 'ERROR',
        ruleId: 'UNRECOGNIZED_CATEGORY',
        message: `Value "${strVal}" is not in the official accepted list: [${field.acceptedValues.join(', ')}].`,
        originalValue,
        suggestedValue: candidate || undefined,
        isResolved: false,
      });
    }
  }

  // 7. Purok Roman Numeral Check
  if (field.key === 'purok' || field.key === 'purokZone' || field.key === 'purokSitio') {
    const romanCheck = checkRomanPurok(strVal);
    if (romanCheck.hasRoman) {
      issues.push({
        id: `autofix-purok-${rowIndex}-${field.key}`,
        rowIndex,
        fieldKey: field.key,
        fieldHeader: field.officialHeader,
        category: 'FORMATTING',
        classification: 'AUTO-FIX-AVAILABLE',
        ruleId: 'PUROK_ROMAN_NUMERAL',
        message: `Purok uses Roman numerals ("${strVal}"). Can be automatically standardized to "${romanCheck.suggested}".`,
        originalValue,
        suggestedValue: romanCheck.suggested,
        isResolved: false,
      });
    }
  }

  return issues;
}

/**
 * PURE VALIDATION — NEVER MUTATES VALUES.
 *
 * Validates a dataset of raw or working rows, identifies issues, and detects
 * which cells can be safely corrected automatically.
 * Original cell values are strictly preserved in both `originalValue` and `workingValue`.
 * `finalValue` remains null until the user explicitly applies a cleaning action.
 */
export function validateDataset(
  rawRows: Record<string, unknown>[],
  dataset: DatasetDefinition
): {
  records: CleanRecord[];
  allIssues: ValidationIssue[];
  totalErrors: number;
  totalReviews: number;
  totalAutoCleaned: number;
  totalAutoFixAvailable: number;
} {
  const records: CleanRecord[] = [];
  const allIssues: ValidationIssue[] = [];
  let totalAutoCleaned = 0;
  let totalAutoFixAvailable = 0;

  // Process row by row
  rawRows.forEach((row, idx) => {
    const rowIndex = typeof row._rowIndex === 'number' ? (row._rowIndex as number) : idx + 2; // spreadsheet row number
    const cells: Record<string, CellState> = {};
    const rowIssues: ValidationIssue[] = [];
    const flatRecord: Record<string, unknown> = { _rowIndex: rowIndex };

    // Check if row already carries prior cell state (e.g. during revalidation after user actions)
    const priorCells = row._cells as Record<string, CellState> | undefined;

    for (const field of dataset.fields) {
      const priorCell = priorCells ? priorCells[field.key] : undefined;

      // Find value from row matching official header or mapped header
      let rawVal: unknown = '';
      if (priorCell && priorCell.workingValue !== undefined) {
        rawVal = priorCell.workingValue;
      } else if (row[field.officialHeader] !== undefined) {
        rawVal = row[field.officialHeader];
      } else if (row[field.key] !== undefined) {
        rawVal = row[field.key];
      } else {
        // Try aliases
        for (const alias of field.aliases) {
          if (row[alias] !== undefined) {
            rawVal = row[alias];
            break;
          }
        }
      }

      // Preserve original uploaded value across multiple validation passes
      const origVal: unknown =
        priorCell && priorCell.originalValue !== undefined ? priorCell.originalValue : rawVal;

      const workingVal: unknown = rawVal;
      const wasAutoCleaned = priorCell?.autoCleaned === true;
      const priorFinal = priorCell?.finalValue !== undefined ? priorCell.finalValue : null;
      const priorChanges = priorCell?.changes || [];

      let cellIssues: ValidationIssue[] = [];
      let cellStatus: RuleClassification = 'VALID';
      let pendingFix: SafeFixSuggestion | null = null;

      if (wasAutoCleaned) {
        // Cell was already explicitly cleaned via Fix All: validate working value directly
        cellIssues = validateCell(workingVal, field, rowIndex, origVal);
        if (cellIssues.some((i) => i.classification === 'ERROR')) {
          cellStatus = 'ERROR';
        } else {
          cellStatus = 'AUTO-FIX';
        }
        totalAutoCleaned++;
      } else {
        // Cell has NOT been auto-cleaned: check if a safe fix can be detected
        const fix = detectSafeFix(workingVal, field);

        if (fix.fixAvailable) {
          // Verify if applying the suggested value would resolve formatting without introducing errors
          const testIssues = validateCell(fix.suggestedValue, field, rowIndex, origVal);
          const hasBlockingError = testIssues.some((i) => i.classification === 'ERROR');

          if (!hasBlockingError) {
            // Safe fix is available and would produce a valid value!
            pendingFix = fix;
            totalAutoFixAvailable++;
            const fixIssue: ValidationIssue = {
              id: `autofix-${rowIndex}-${field.key}`,
              rowIndex,
              fieldKey: field.key,
              fieldHeader: field.officialHeader,
              category: 'FORMATTING',
              classification: 'AUTO-FIX-AVAILABLE',
              ruleId: fix.rule || 'SAFE_AUTO_FIX',
              message: `${fix.description}. Suggested cleaned value: "${String(fix.suggestedValue)}"`,
              originalValue: origVal,
              suggestedValue: fix.suggestedValue,
              isResolved: false,
            };
            cellIssues = [fixIssue, ...testIssues];
            cellStatus = 'AUTO-FIX-AVAILABLE';
          } else {
            // Underlying value has a blocking error (e.g., negative number or empty required field)
            cellIssues = validateCell(workingVal, field, rowIndex, origVal);
            cellStatus = 'ERROR';
          }
        } else {
          // No safe fix available: run standard validation on the original value
          cellIssues = validateCell(workingVal, field, rowIndex, origVal);
          if (cellIssues.some((i) => i.classification === 'ERROR')) {
            cellStatus = 'ERROR';
          } else if (cellIssues.some((i) => i.classification === 'AUTO-FIX-AVAILABLE')) {
            cellStatus = 'AUTO-FIX-AVAILABLE';
          } else {
            cellStatus = 'VALID';
          }
        }
      }

      rowIssues.push(...cellIssues);
      allIssues.push(...cellIssues);

      cells[field.key] = {
        originalValue: origVal,
        workingValue: workingVal,
        finalValue: priorFinal,
        cleanedValue: workingVal,
        pendingFix,
        autoCleaned: wasAutoCleaned,
        issues: cellIssues,
        changes: priorChanges,
        status: cellStatus,
      };

      flatRecord[field.key] = workingVal;
      flatRecord[field.officialHeader] = workingVal;
    }

    // Cross-field check: Crime Datetime Committed vs Datetime Reported
    if (dataset.id === 'dbl-crime') {
      const commVal = flatRecord['datetimeCommitted'];
      const repVal = flatRecord['datetimeReported'];
      if (commVal && repVal) {
        const commTime = new Date(String(commVal).replace(' ', 'T')).getTime();
        const repTime = new Date(String(repVal).replace(' ', 'T')).getTime();
        if (!isNaN(commTime) && !isNaN(repTime) && commTime > repTime) {
          const crossIssue: ValidationIssue = {
            id: `err-comm-rep-${rowIndex}`,
            rowIndex,
            fieldKey: 'datetimeCommitted',
            fieldHeader: 'Datetime Committed',
            category: 'INVALID_DATE',
            classification: 'ERROR',
            ruleId: 'COMMITTED_AFTER_REPORTED',
            message: 'Datetime Committed is recorded after Datetime Reported. Please verify incident timeline.',
            originalValue: commVal,
            isResolved: false,
          };
          rowIssues.push(crossIssue);
          allIssues.push(crossIssue);
          if (cells['datetimeCommitted']) {
            cells['datetimeCommitted'].issues.push(crossIssue);
            cells['datetimeCommitted'].status = 'ERROR';
          }
        }
      }
    }

    // Determine row status (strictly 3 statuses: VALID, AUTO-FIX-AVAILABLE, ERROR)
    let rowStatus: RuleClassification = 'VALID';
    if (rowIssues.some((i) => i.classification === 'ERROR')) {
      rowStatus = 'ERROR';
    } else if (Object.values(cells).some((c) => c.status === 'AUTO-FIX-AVAILABLE' || c.pendingFix?.fixAvailable)) {
      rowStatus = 'AUTO-FIX-AVAILABLE';
    } else {
      rowStatus = 'VALID';
    }

    flatRecord._status = rowStatus;
    flatRecord._issues = rowIssues;
    flatRecord._cells = cells;
    flatRecord._pendingAutoFix = Object.values(cells).some((c) => c.pendingFix?.fixAvailable);

    records.push(flatRecord as CleanRecord);
  });

  // Step 3: Run Duplicate Detection (only on populated composite keys)
  const duplicateIssues = detectDuplicates(records, dataset);
  duplicateIssues.forEach((issues, rowNum) => {
    const record = records.find((r) => r._rowIndex === rowNum);
    if (record) {
      for (const issue of issues) {
        record._issues.push(issue);
        allIssues.push(issue);
        record._status = 'ERROR';
        if (record._cells[issue.fieldKey]) {
          record._cells[issue.fieldKey].issues.push(issue);
          record._cells[issue.fieldKey].status = 'ERROR';
        }
      }
    }
  });

  const totalErrors = allIssues.filter((i) => i.classification === 'ERROR').length;
  const totalReviews = 0;

  return {
    records,
    allIssues,
    totalErrors,
    totalReviews,
    totalAutoCleaned,
    totalAutoFixAvailable,
  };
}

/**
 * MUTATION STEP — ONLY INVOKED WHEN USER CLICKS "Fix All Automatically".
 *
 * Applies deterministic cleaning rules to all cells that have pending safe fixes.
 * - Updates workingValue to the cleaned value
 * - Sets finalValue to the cleaned value
 * - Retains originalValue intact
 * - Records an audit CleaningChange with rule and description
 * - Revalidates the updated dataset
 */
export function applyAllSafeFixes(
  records: CleanRecord[],
  dataset: DatasetDefinition
): {
  records: CleanRecord[];
  allIssues: ValidationIssue[];
  totalErrors: number;
  totalReviews: number;
  totalAutoCleaned: number;
  fixedCount: number;
} {
  let fixedCount = 0;
  const transformedRows: Record<string, unknown>[] = [];

  for (const r of records) {
    const rowObj: Record<string, unknown> = {
      _rowIndex: r._rowIndex,
      _cells: {},
    };
    const rowCells: Record<string, CellState> = { ...r._cells };

    for (const field of dataset.fields) {
      const cell = rowCells[field.key];
      const currentVal =
        cell && cell.workingValue !== undefined
          ? cell.workingValue
          : cell && cell.finalValue !== null && cell.finalValue !== undefined
          ? cell.finalValue
          : r[field.key];
      const origVal = cell?.originalValue !== undefined ? cell.originalValue : currentVal;

      const pending = cell?.pendingFix;
      const fix = pending?.fixAvailable ? pending : detectSafeFix(currentVal, field);

      if (fix.fixAvailable) {
        fixedCount++;
        const targetValue = fix.suggestedValue;
        const newChange: CleaningChange = {
          id: `safe-fix-${r._rowIndex}-${field.key}-${Date.now()}`,
          rowIndex: r._rowIndex,
          fieldKey: field.key,
          fieldHeader: field.officialHeader,
          originalValue: origVal,
          finalValue: targetValue,
          ruleId: 'SAFE_AUTO_FIX',
          actionType: fix.description || 'Applied deterministic safe fix',
          status: 'AUTO-FIX',
          timestamp: new Date().toISOString(),
          safeFixRules: fix.rules,
        };

        const updatedCell: CellState = {
          originalValue: origVal,
          workingValue: targetValue,
          finalValue: targetValue,
          cleanedValue: targetValue,
          pendingFix: null,
          autoCleaned: true,
          issues: [],
          changes: [...(cell?.changes || []), newChange],
          status: 'AUTO-FIX',
        };

        rowCells[field.key] = updatedCell;
        rowObj[field.officialHeader] = targetValue;
        rowObj[field.key] = targetValue;
      } else {
        rowCells[field.key] = cell
          ? cell
          : {
              originalValue: origVal,
              workingValue: currentVal,
              finalValue: null,
              cleanedValue: currentVal,
              pendingFix: null,
              autoCleaned: false,
              issues: [],
              changes: [],
              status: 'VALID',
            };
        rowObj[field.officialHeader] = currentVal;
        rowObj[field.key] = currentVal;
      }
    }

    rowObj._cells = rowCells;
    transformedRows.push(rowObj);
  }

  // Revalidate the dataset with the updated working values
  const reval = validateDataset(transformedRows, dataset);

  return {
    records: reval.records,
    allIssues: reval.allIssues,
    totalErrors: reval.totalErrors,
    totalReviews: reval.totalReviews,
    totalAutoCleaned: reval.totalAutoCleaned,
    fixedCount,
  };
}

/**
 * Convenience helper that validates and cleans dataset rows.
 *
 * For the web workflow (where cleaning must NOT happen until the user clicks
 * "Fix All Automatically"), use `validateDataset` directly.
 * By default, `validateAndCleanDataset` applies safe fixes unless `autoApplyFixes: false`.
 */
export function validateAndCleanDataset(
  rawRows: Record<string, unknown>[],
  dataset: DatasetDefinition,
  headerMapping?: Map<string, string>,
  options?: { autoApplyFixes?: boolean }
): {
  records: CleanRecord[];
  allIssues: ValidationIssue[];
  totalErrors: number;
  totalReviews: number;
  totalAutoCleaned: number;
  totalAutoFixAvailable: number;
} {
  const result = validateDataset(rawRows, dataset);
  const shouldApplyFixes = options?.autoApplyFixes ?? true;
  if (shouldApplyFixes) {
    const fixed = applyAllSafeFixes(result.records, dataset);
    return {
      records: fixed.records,
      allIssues: fixed.allIssues,
      totalErrors: fixed.totalErrors,
      totalReviews: fixed.totalReviews,
      totalAutoCleaned: fixed.totalAutoCleaned,
      totalAutoFixAvailable: 0,
    };
  }
  return result;
}

