import * as XLSX from 'xlsx';

export interface ParsedWorkbook {
  fileName: string;
  fileSize: number;
  sheetNames: string[];
  selectedSheet: string;
  headerRowIndex: number; // 1-indexed
  headers: string[];
  rawRows: Record<string, unknown>[];
  totalRows: number;
}

/**
 * Parses an uploaded XLSX, XLS, or CSV file client-side in the browser.
 * Absolutely no data is uploaded or stored outside browser memory.
 */
export async function parseExcelOrCsvFile(
  file: File,
  targetSheetName?: string,
  preferredHeaderRow?: number
): Promise<ParsedWorkbook> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, {
    type: 'array',
    cellDates: true,
    cellNF: true,
    raw: false,
  });

  const sheetNames = workbook.SheetNames;
  if (!sheetNames || sheetNames.length === 0) {
    throw new Error('The uploaded workbook contains no sheets.');
  }

  // Auto-select sheet if not specified
  let selectedSheet = targetSheetName;
  if (!selectedSheet || !sheetNames.includes(selectedSheet)) {
    // Prefer sheets named 'Data', or sheet not containing 'instruct' or 'guide'
    const dataSheet = sheetNames.find(
      (s) => s.toLowerCase() === 'data' || (!s.toLowerCase().includes('instruct') && !s.toLowerCase().includes('guide'))
    );
    selectedSheet = dataSheet || sheetNames[0];
  }

  const worksheet = workbook.Sheets[selectedSheet];
  if (!worksheet) {
    throw new Error(`Sheet "${selectedSheet}" could not be read.`);
  }

  // Convert sheet to array of arrays (AOA)
  const aoa: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
    raw: false,
  });

  if (!aoa || aoa.length === 0) {
    return {
      fileName: file.name,
      fileSize: file.size,
      sheetNames,
      selectedSheet,
      headerRowIndex: 1,
      headers: [],
      rawRows: [],
      totalRows: 0,
    };
  }

  // Determine header row index (1-indexed)
  let headerRowIdx = preferredHeaderRow || 1;
  if (!preferredHeaderRow) {
    // If row 1 has few non-empty columns and row 2 has many column names (e.g. Disaster Incident Report)
    const r1 = aoa[0] || [];
    const r2 = aoa.length > 1 ? aoa[1] : [];
    const r1Count = r1.filter((c: unknown) => String(c ?? '').trim() !== '').length;
    const r2Count = r2.filter((c: unknown) => String(c ?? '').trim() !== '').length;

    if (r2Count > r1Count && r1Count <= 3) {
      headerRowIdx = 2;
    } else {
      headerRowIdx = 1;
    }
  }

  const headerRow = aoa[headerRowIdx - 1] || [];
  // Clean headers (trim whitespace, preserve original string if possible)
  const headers: string[] = headerRow.map((h: unknown, idx: number) => {
    const val = String(h ?? '').trim();
    return val !== '' ? val : `Column_${idx + 1}`;
  });

  // Extract raw rows
  const rawRows: Record<string, unknown>[] = [];
  for (let r = headerRowIdx; r < aoa.length; r++) {
    const row = aoa[r];
    if (!row) continue;

    // Check if row is completely empty
    const hasData = row.some((c: unknown) => c !== null && c !== undefined && String(c).trim() !== '');
    if (!hasData) continue;

    const rowObj: Record<string, unknown> = {};
    for (let c = 0; c < headers.length; c++) {
      const colHeader = headers[c];
      const cellVal = row[c] !== undefined ? row[c] : '';
      rowObj[colHeader] = cellVal;
    }
    rawRows.push(rowObj);
  }

  return {
    fileName: file.name,
    fileSize: file.size,
    sheetNames,
    selectedSheet,
    headerRowIndex: headerRowIdx,
    headers,
    rawRows,
    totalRows: rawRows.length,
  };
}
