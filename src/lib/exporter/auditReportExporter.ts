import * as XLSX from 'xlsx';
import { CleanRecord, DatasetDefinition, QualityReport, ValidationIssue } from '../types';
import { sanitizeSpreadsheetValue } from './cleanDataExporter';

/**
 * Exports a comprehensive Cleaning Audit Report (.xlsx) for LGU records and training review.
 */
export interface RemovedRecordLog {
  rowIndex: number;
  record: CleanRecord;
  reason: string;
  timestamp: string;
}

/**
 * Builds the Cleaning Audit Report workbook in memory.
 */
export function buildAuditReportWorkbook(
  records: CleanRecord[],
  allIssues: ValidationIssue[],
  dataset: DatasetDefinition,
  qualityReport: QualityReport,
  removedRecords?: RemovedRecordLog[]
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // 1. Summary Sheet
  const summaryData: (string | number)[][] = [
    ['DataClean Audit Report — Executive Summary'],
    ['Generated On', new Date().toLocaleString()],
    ['Target System', dataset.system],
    ['Target Dataset', dataset.name],
    ['Official File Structure', dataset.officialFileName],
    [],
    ['METRIC', 'VALUE'],
    ['Total Records Processed', qualityReport.totalRecords],
    ['Valid Records', qualityReport.validRecords],
    ['Auto-Fix Available Records', qualityReport.autoFixAvailableRecords || 0],
    ['Auto-Cleaned Records', qualityReport.autoCleanedRecords],
    ['Must Be Fixed Records', qualityReport.errorRecords],
    ['Final Readiness Score', `${qualityReport.readinessScore}%`],
    [],
    ['ISSUE BREAKDOWN', 'COUNT'],
    ['Missing Values', qualityReport.issueCounts.missingValues],
    ['Formatting Issues', qualityReport.issueCounts.formattingIssues],
    ['Duplicates', qualityReport.issueCounts.duplicates],
    ['Invalid Dates', qualityReport.issueCounts.invalidDates],
    ['Invalid Categories', qualityReport.issueCounts.invalidCategories],
    ['Location Issues', qualityReport.issueCounts.locationIssues],
    ['Numeric Issues', qualityReport.issueCounts.numericIssues],
    ['Other Issues', qualityReport.issueCounts.other],
    [],
    ['Calculation Basis', qualityReport.readinessFormulaExplanation],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 30 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // 2. Audit Trail Sheet
  const auditHeaders = [
    'Row Number',
    'Field / Column',
    'Original Value',
    'Final Value',
    'Issue Detected',
    'Action Taken',
    'Status',
  ];

  const auditRows: (string | number)[][] = [auditHeaders];

  // Compile all changes and issues
  for (const record of records) {
    const rowNum = record._rowIndex;

    for (const field of dataset.fields) {
      const cellState = record._cells[field.key];
      if (!cellState) continue;

      const hasChange = cellState.changes && cellState.changes.length > 0;
      const hasIssues = cellState.issues && cellState.issues.length > 0;

      if (hasChange || hasIssues) {
        const origVal =
          cellState.originalValue !== null && cellState.originalValue !== undefined
            ? String(cellState.originalValue)
            : '';
        const finalVal =
          cellState.workingValue !== null && cellState.workingValue !== undefined
            ? String(cellState.workingValue)
            : cellState.finalValue !== null && cellState.finalValue !== undefined
            ? String(cellState.finalValue)
            : '';

        const issueMessages = cellState.issues.map((i) => i.message).join(' | ');
        const actionsTaken =
          cellState.changes.map((c) => c.actionType).join(' | ') ||
          (cellState.issues.some((i) => i.isResolved)
            ? 'Reviewed and resolved by user'
            : 'Pending resolution');

        auditRows.push([
          rowNum,
          field.officialHeader,
          sanitizeSpreadsheetValue(origVal) as string | number,
          sanitizeSpreadsheetValue(finalVal) as string | number,
          issueMessages || 'None (Safe Auto-Fix applied)',
          actionsTaken,
          cellState.status,
        ]);
      }
    }
  }

  // Append removed duplicate records to the audit trail
  if (removedRecords && removedRecords.length > 0) {
    for (const rem of removedRecords) {
      auditRows.push([
        rem.rowIndex,
        'Entire Record (Duplicate)',
        'Active Record in Uploaded File',
        'REMOVED',
        'Duplicate Key Violation',
        rem.reason,
        'REMOVED',
      ]);
    }
  }

  // If no issues were detected at all
  if (auditRows.length === 1) {
    auditRows.push([
      'All',
      'All Fields',
      '—',
      '—',
      'None',
      'Dataset is 100% clean and valid',
      'VALID',
    ]);
  }

  const wsAudit = XLSX.utils.aoa_to_sheet(auditRows);
  wsAudit['!cols'] = [
    { wch: 12 },
    { wch: 22 },
    { wch: 25 },
    { wch: 25 },
    { wch: 45 },
    { wch: 35 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(wb, wsAudit, 'Audit Trail');

  // 3. Removed Records Sheet (if any records were purged)
  if (removedRecords && removedRecords.length > 0) {
    const remHeaders = [
      'Row Number',
      'Removal Reason',
      'Timestamp',
      ...dataset.fields.map((f) => f.officialHeader),
    ];
    const remRows: (string | number)[][] = [remHeaders];
    for (const rem of removedRecords) {
      const rowVals: (string | number)[] = [
        rem.rowIndex,
        rem.reason,
        rem.timestamp,
        ...dataset.fields.map((f) => {
          const val =
            rem.record._cells[f.key]?.workingValue ??
            rem.record._cells[f.key]?.finalValue ??
            rem.record[f.key];
          const rawStr = val !== null && val !== undefined ? String(val) : '';
          return sanitizeSpreadsheetValue(rawStr) as string | number;
        }),
      ];
      remRows.push(rowVals);
    }
    const wsRem = XLSX.utils.aoa_to_sheet(remRows);
    XLSX.utils.book_append_sheet(wb, wsRem, 'Removed Duplicates');
  }

  return wb;
}

/**
 * Exports a comprehensive Cleaning Audit Report (.xlsx) for LGU records and training review.
 */
export function exportCleaningReport(
  records: CleanRecord[],
  allIssues: ValidationIssue[],
  dataset: DatasetDefinition,
  qualityReport: QualityReport,
  customFileName?: string,
  removedRecords?: RemovedRecordLog[]
): void {
  const wb = buildAuditReportWorkbook(
    records,
    allIssues,
    dataset,
    qualityReport,
    removedRecords
  );
  const safeName = dataset.name.replace(/\s+/g, '');
  const fileName =
    customFileName ||
    `${dataset.system}_${safeName}_Cleaning_Report.xlsx`;
  XLSX.writeFile(wb, fileName);
}
