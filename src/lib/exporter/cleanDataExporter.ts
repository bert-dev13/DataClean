import * as XLSX from 'xlsx';
import { CleanRecord, DatasetDefinition } from '../types';

/**
 * Sanitizes a cell value for safe spreadsheet export.
 * Defends against CSV / Spreadsheet Formula Injection (CWE-1236).
 * If the value is a string beginning with '=', '+', '-', or '@', and is NOT a valid numeric expression,
 * prefix it with a single quote (') so that spreadsheet programs treat it strictly as literal text.
 */
export function sanitizeSpreadsheetValue(val: unknown): unknown {
  if (typeof val === 'number') {
    return val;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.length > 0) {
      const firstChar = trimmed[0];
      if (firstChar === '=' || firstChar === '@') {
        return `'${val}`;
      }
      if (firstChar === '+' || firstChar === '-') {
        const num = Number(trimmed);
        if (!isNaN(num)) {
          return val;
        }
        return `'${val}`;
      }
    }
  }
  return val;
}

/**
 * Builds the canonical Excel workbook for the dataset.
 */
export function buildCleanedWorkbook(
  records: CleanRecord[],
  dataset: DatasetDefinition
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // Build rows array: header row followed by data rows
  const headers = dataset.fields.map((f) => f.officialHeader);
  const rowsData: unknown[][] = [headers];

  for (const record of records) {
    const rowVals: unknown[] = [];
    for (const field of dataset.fields) {
      const cellState = record._cells[field.key];
      const rawVal = cellState
        ? (cellState.workingValue !== undefined
            ? cellState.workingValue
            : cellState.finalValue ?? cellState.originalValue)
        : record[field.key] ?? '';
      const cellVal = rawVal !== null && rawVal !== undefined ? rawVal : '';
      rowVals.push(sanitizeSpreadsheetValue(cellVal));
    }
    rowsData.push(rowVals);
  }

  const ws = XLSX.utils.aoa_to_sheet(rowsData);

  // Set column widths based on headers
  ws['!cols'] = headers.map((h) => ({ wch: Math.max(h.length + 4, 14) }));

  const sheetName = dataset.officialSheetName || 'Data';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  return wb;
}

/**
 * Exports cleaned data in the exact canonical structure of the official import template.
 */
export function exportCleanedDataset(
  records: CleanRecord[],
  dataset: DatasetDefinition,
  customFileName?: string
): void {
  const wb = buildCleanedWorkbook(records, dataset);
  const safeName = dataset.name.replace(/\s+/g, '');
  const fileName = customFileName || `${dataset.system}_${safeName}_Cleaned.xlsx`;
  XLSX.writeFile(wb, fileName);
}
