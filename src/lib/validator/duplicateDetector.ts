import { DatasetDefinition, ValidationIssue } from '../types';

/**
 * Detects duplicate records based on the dataset's designated composite key.
 */
export function detectDuplicates(
  records: Record<string, unknown>[],
  dataset: DatasetDefinition
): Map<number, ValidationIssue[]> {
  const duplicateIssuesByRow = new Map<number, ValidationIssue[]>();
  if (!dataset.compositeKey || dataset.compositeKey.length === 0) {
    return duplicateIssuesByRow;
  }

  // Key map: compositeKeyString -> array of row indices
  const keyMap = new Map<string, number[]>();

  records.forEach((record, index) => {
    const rowNum = typeof record._rowIndex === 'number' ? record._rowIndex : index + 2;

    // Build composite key value string
    const keyParts: string[] = [];
    let hasAnyValue = false;

    for (const key of dataset.compositeKey) {
      const val = record[key];
      const strVal = val !== null && val !== undefined ? String(val).trim().toLowerCase() : '';
      if (strVal !== '') {
        hasAnyValue = true;
      }
      keyParts.push(`${key}:${strVal}`);
    }

    // Only check if at least one key field is populated
    if (hasAnyValue) {
      const compositeStr = keyParts.join('||');
      if (!keyMap.has(compositeStr)) {
        keyMap.set(compositeStr, []);
      }
      keyMap.get(compositeStr)!.push(rowNum);
    }
  });

  // Flag duplicates
  keyMap.forEach((rowNums, compositeStr) => {
    if (rowNums.length > 1) {
      const keySummary = dataset.compositeKey
        .map((k) => {
          const f = dataset.fields.find((field) => field.key === k);
          return f ? f.officialHeader : k;
        })
        .join(' + ');

      for (const rowNum of rowNums) {
        const otherRows = rowNums.filter((r) => r !== rowNum).join(', ');
        const issue: ValidationIssue = {
          id: `dup-${rowNum}-${Date.now()}-${Math.random()}`,
          rowIndex: rowNum,
          fieldKey: dataset.compositeKey[0],
          fieldHeader: keySummary,
          category: 'DUPLICATE',
          classification: 'ERROR',
          ruleId: 'DUPLICATE_COMPOSITE_KEY',
          message: `Duplicate record detected across ${keySummary}. Shares identical values with row(s) ${otherRows}.`,
          originalValue: compositeStr,
          isResolved: false,
        };

        if (!duplicateIssuesByRow.has(rowNum)) {
          duplicateIssuesByRow.set(rowNum, []);
        }
        duplicateIssuesByRow.get(rowNum)!.push(issue);
      }
    }
  });

  return duplicateIssuesByRow;
}
