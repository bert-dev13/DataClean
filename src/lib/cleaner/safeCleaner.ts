import { CleaningChange, FieldDefinition, SafeFixRule, SafeFixSuggestion } from '../types';

/**
 * Deterministic, non-destructive cleaners that preserve data meaning.
 * NEVER fabricates missing government data.
 *
 * IMPORTANT — DETECTION vs MUTATION
 * ---------------------------------
 * - `detectSafeFix()` is PURE. It inspects a value and describes the fix that
 *   *could* be applied. It never changes the dataset. It is the only function
 *   that upload / parsing / analysis / validation / readiness code may call.
 * - `applySafeFix()` produces the cleaned value plus an audit `CleaningChange`.
 *   It must ONLY be invoked as a result of the explicit user action
 *   "Fix All Automatically" (see `applyAllSafeFixes` in the validation engine).
 *
 * The low-level helpers below (`cleanWhitespace`, `cleanNumeric`, `cleanDate`)
 * are pure functions that return new values; they never mutate their inputs.
 */

export const SAFE_FIX_RULE_DESCRIPTIONS: Record<SafeFixRule, string> = {
  TRIM_WHITESPACE: 'Removed leading/trailing whitespace',
  COLLAPSE_WHITESPACE: 'Collapsed repeated internal spaces',
  NORMALIZE_NON_BREAKING_SPACE: 'Replaced non-breaking spaces with standard spaces',
  STRIP_CURRENCY: 'Removed currency symbol',
  STRIP_THOUSANDS_SEPARATOR: 'Removed thousands separators',
  REMOVE_UNIT: 'Removed recognized unit of measure',
  CONVERT_TO_NUMBER: 'Standardized numeric format',
  NORMALIZE_DATE: 'Standardized date to YYYY-MM-DD',
  NORMALIZE_DATETIME: 'Standardized datetime to YYYY-MM-DD HH:mm:ss',
  NORMALIZE_CATEGORY_CASE: 'Normalized case to official standard',
  NORMALIZE_BOOLEAN: 'Standardized boolean indicator (Y/N)',
  NORMALIZE_PUROK_NUMERAL: 'Standardized Roman numeral Purok to Arabic digit',
  PUROK_ROMAN_NUMERAL: 'Standardized Roman numeral Purok to Arabic digit',
};

export function cleanWhitespace(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  // Replace non-breaking spaces with standard space, trim leading/trailing
  const trimmed = str.replace(/\u00A0/g, ' ').trim();
  // Collapse multiple internal whitespace
  return trimmed.replace(/\s+/g, ' ');
}

const CURRENCY_PATTERN = /(?:₱|\$|PHP|Php|php)\s*/g;
const UNIT_PATTERN = /\s*(cu\.m|m3|m\^3|kwh|meters|meter|m|pcs|pc|units|unit|cases|case)$/i;

export function cleanNumeric(val: unknown): { value: number | string; wasCleaned: boolean } {
  if (val === null || val === undefined || val === '') {
    return { value: '', wasCleaned: false };
  }

  if (typeof val === 'number') {
    return { value: val, wasCleaned: false };
  }

  let str = cleanWhitespace(val);
  const originalStr = str;
  // Strip currency symbols and commas without corrupting text words
  str = str.replace(CURRENCY_PATTERN, '').replace(/,/g, '').trim();
  // Strip common unit symbols if present (e.g., m3, cu.m, kwh, m, pcs, units, cases)
  str = str.replace(UNIT_PATTERN, '').trim();

  const num = Number(str);
  if (!isNaN(num) && str !== '') {
    return { value: num, wasCleaned: originalStr !== String(num) || typeof val !== 'number' };
  }

  return { value: originalStr, wasCleaned: false };
}

export function cleanDate(val: unknown, isDateTime: boolean = false): { isoDate: string; wasCleaned: boolean } {
  if (val === null || val === undefined || val === '') {
    return { isoDate: '', wasCleaned: false };
  }

  if (val instanceof Date && !isNaN(val.getTime())) {
    const yyyy = val.getFullYear();
    const mm = String(val.getMonth() + 1).padStart(2, '0');
    const dd = String(val.getDate()).padStart(2, '0');
    if (isDateTime) {
      const hh = String(val.getHours()).padStart(2, '0');
      const min = String(val.getMinutes()).padStart(2, '0');
      const ss = String(val.getSeconds()).padStart(2, '0');
      return { isoDate: `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`, wasCleaned: true };
    }
    return { isoDate: `${yyyy}-${mm}-${dd}`, wasCleaned: true };
  }

  const str = cleanWhitespace(val);

  // If already standard ISO or date with time
  if (isDateTime) {
    const dtMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (dtMatch) {
      const ss = dtMatch[6] ? dtMatch[6] : '00';
      return { isoDate: `${dtMatch[1]}-${dtMatch[2]}-${dtMatch[3]} ${dtMatch[4]}:${dtMatch[5]}:${ss}`, wasCleaned: str.includes('T') || !dtMatch[6] };
    }
  } else {
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return { isoDate: str, wasCleaned: false };
    }
  }

  // Handle Excel serial date numbers (e.g., 45442)
  if (/^\d{5}$/.test(str)) {
    const serial = parseInt(str, 10);
    // Excel base date Dec 30 1899
    const utcDays = Math.floor(serial - 25569);
    const date = new Date(utcDays * 86400 * 1000);
    if (!isNaN(date.getTime())) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      if (isDateTime) {
        return { isoDate: `${yyyy}-${mm}-${dd} 00:00:00`, wasCleaned: true };
      }
      return { isoDate: `${yyyy}-${mm}-${dd}`, wasCleaned: true };
    }
  }

  // Handle MM/DD/YYYY or MM/DD/YY (with optional time)
  const slashMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (slashMatch) {
    const mm = slashMatch[1].padStart(2, '0');
    const dd = slashMatch[2].padStart(2, '0');
    let yyyy = slashMatch[3];
    if (yyyy.length === 2) {
      const yr = parseInt(yyyy, 10);
      yyyy = yr > 50 ? `19${yyyy}` : `20${yyyy}`;
    }
    if (isDateTime && slashMatch[4] && slashMatch[5]) {
      const hh = slashMatch[4].padStart(2, '0');
      const min = slashMatch[5].padStart(2, '0');
      const ss = (slashMatch[6] || '00').padStart(2, '0');
      return { isoDate: `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`, wasCleaned: true };
    }
    return { isoDate: `${yyyy}-${mm}-${dd}`, wasCleaned: true };
  }

  // Handle YYYY/MM/DD
  const ySlashMatch = str.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (ySlashMatch) {
    const yyyy = ySlashMatch[1];
    const mm = ySlashMatch[2].padStart(2, '0');
    const dd = ySlashMatch[3].padStart(2, '0');
    if (isDateTime && ySlashMatch[4] && ySlashMatch[5]) {
      const hh = ySlashMatch[4].padStart(2, '0');
      const min = ySlashMatch[5].padStart(2, '0');
      const ss = (ySlashMatch[6] || '00').padStart(2, '0');
      return { isoDate: `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`, wasCleaned: true };
    }
    return { isoDate: `${yyyy}-${mm}-${dd}`, wasCleaned: true };
  }

  return { isoDate: str, wasCleaned: false };
}

function isIdentifierStringField(field: FieldDefinition): boolean {
  const k = field.key.toLowerCase();
  return (
    field.type === 'string' &&
    (!!field.compositeKeyPart ||
      k.includes('account') ||
      k.includes('number') ||
      k.includes('code') ||
      k.includes('blotter') ||
      k.includes('student') ||
      k.includes('cbms') ||
      k.includes('psic') ||
      k.includes('psccs'))
  );
}

function noFix(value: unknown): SafeFixSuggestion {
  return {
    originalValue: value,
    suggestedValue: value,
    fixAvailable: false,
    rule: null,
    rules: [],
    description: '',
  };
}

/**
 * DETECTION ONLY — pure, never mutates anything.
 *
 * Inspects a single cell value and reports whether a deterministic safe fix is
 * available, what the cleaned value *would* be, and which rule(s) apply.
 *
 * Example:
 *   detectSafeFix("  Riverside Bakery  ", field)
 *   → { originalValue: "  Riverside Bakery  ", suggestedValue: "Riverside Bakery",
 *       fixAvailable: true, rule: "TRIM_WHITESPACE", ... }
 */
export function detectSafeFix(value: unknown, field: FieldDefinition): SafeFixSuggestion {
  // Never fabricate missing data
  if (value === null || value === undefined || value === '') {
    return noFix(value);
  }

  const originalStr = String(value);
  let projected: unknown = value;
  const rules: SafeFixRule[] = [];
  const descriptions: string[] = [];
  const addRule = (rule: SafeFixRule, description?: string) => {
    if (!rules.includes(rule)) {
      rules.push(rule);
      descriptions.push(description || SAFE_FIX_RULE_DESCRIPTIONS[rule]);
    }
  };

  // 1. Whitespace for all fields
  const trimmed = cleanWhitespace(value);
  if (trimmed !== originalStr) {
    projected = trimmed;
    const spaced = originalStr.replace(/\u00A0/g, ' ');
    if (spaced !== originalStr) addRule('NORMALIZE_NON_BREAKING_SPACE');
    if (spaced !== spaced.trim()) addRule('TRIM_WHITESPACE');
    if (/\s{2,}|[\t\n\r]/.test(spaced.trim())) addRule('COLLAPSE_WHITESPACE');
    if (rules.length === 0) addRule('TRIM_WHITESPACE');
  }

  // 2. Numeric fields
  if (field.type === 'number' || field.type === 'float' || field.type === 'integer') {
    const before = typeof projected === 'string' ? projected : String(projected);
    const numRes = cleanNumeric(projected);
    if (typeof numRes.value === 'number') {
      projected = numRes.value;
      if (numRes.wasCleaned && before !== String(numRes.value)) {
        if (/(?:₱|\$|PHP|Php|php)/.test(before)) addRule('STRIP_CURRENCY');
        if (before.includes(',')) addRule('STRIP_THOUSANDS_SEPARATOR');
        const unitMatch = before.replace(CURRENCY_PATTERN, '').replace(/,/g, '').trim().match(UNIT_PATTERN);
        if (unitMatch) addRule('REMOVE_UNIT', `Removed recognized unit "${unitMatch[1]}"`);
        if (
          !rules.includes('STRIP_CURRENCY') &&
          !rules.includes('STRIP_THOUSANDS_SEPARATOR') &&
          !rules.includes('REMOVE_UNIT')
        ) {
          addRule('CONVERT_TO_NUMBER');
        }
      }
    }
  }

  // 3. Date fields
  if (field.type === 'date') {
    const dateRes = cleanDate(projected, false);
    if (dateRes.wasCleaned) {
      projected = dateRes.isoDate;
      addRule('NORMALIZE_DATE');
    }
  } else if (field.type === 'datetime') {
    const dateRes = cleanDate(projected, true);
    if (dateRes.wasCleaned) {
      projected = dateRes.isoDate;
      addRule('NORMALIZE_DATETIME');
    }
  }

  // 4. Identifier fields - preserve leading zeros and string type
  if (isIdentifierStringField(field)) {
    projected = String(projected).trim();
  }

  // 5. Categorical casing normalization - exact case-insensitive match against official allowed values
  const acceptedVals = field.acceptedValues || (field as FieldDefinition & { allowedValues?: string[] }).allowedValues;
  if (acceptedVals && acceptedVals.length > 0 && typeof projected === 'string') {
    const valLower = projected.toLowerCase();
    const exactMatch = acceptedVals.find((allowed: string) => allowed.toLowerCase() === valLower);
    if (exactMatch && exactMatch !== projected) {
      projected = exactMatch;
      addRule('NORMALIZE_CATEGORY_CASE', `Normalized case to official standard "${exactMatch}"`);
    }
  }

  // 6. Boolean normalization (e.g. "y", "yes" -> "Y"; "n", "no" -> "N")
  if (
    field.type === 'boolean' ||
    (acceptedVals && acceptedVals.length === 2 && acceptedVals.includes('Y') && acceptedVals.includes('N'))
  ) {
    if (typeof projected === 'string') {
      const bStr = projected.trim().toLowerCase();
      if (bStr === 'y' || bStr === 'yes' || bStr === 'true') {
        if (projected !== 'Y') {
          projected = 'Y';
          addRule('NORMALIZE_BOOLEAN', 'Normalized to official standard "Y"');
        }
      } else if (bStr === 'n' || bStr === 'no' || bStr === 'false') {
        if (projected !== 'N') {
          projected = 'N';
          addRule('NORMALIZE_BOOLEAN', 'Normalized to official standard "N"');
        }
      }
    }
  }

  // 7. Purok Roman Numeral normalization (e.g. "Purok IV" -> "Purok 4")
  if ((field.key === 'purok' || field.key === 'purokZone' || field.key === 'purokSitio') && typeof projected === 'string') {
    const romanMatch = projected.match(/^purok\s+(i|ii|iii|iv|v|vi|vii|viii|ix|x)$/i);
    if (romanMatch) {
      const romanMap: Record<string, string> = {
        i: '1',
        ii: '2',
        iii: '3',
        iv: '4',
        v: '5',
        vi: '6',
        vii: '7',
        viii: '8',
        ix: '9',
        x: '10',
      };
      const num = romanMap[romanMatch[1].toLowerCase()];
      if (num) {
        const arabicPurok = `Purok ${num}`;
        if (projected !== arabicPurok) {
          projected = arabicPurok;
          addRule('PUROK_ROMAN_NUMERAL', `Standardized Roman numeral to Arabic "${arabicPurok}"`);
        }
      }
    }
  }

  // A fix is only "available" when the visible text actually changes.
  // (Pure type differences such as "250000" vs 250000 are NOT reported as fixes.)
  if (rules.length > 0 && String(projected) !== originalStr) {
    return {
      originalValue: value,
      suggestedValue: projected,
      fixAvailable: true,
      rule: rules[0],
      rules,
      description: descriptions.join('; '),
    };
  }

  return noFix(value);
}

/**
 * MUTATION — produces the cleaned value and an audit record.
 *
 * Must ONLY be called as a consequence of the explicit user action
 * "Fix All Automatically". Never call from parsing, detection or validation.
 */
export function applySafeFix(
  value: unknown,
  field: FieldDefinition,
  rowIndex: number
): { cleanedValue: unknown; change: CleaningChange | null } {
  if (value === null || value === undefined || value === '') {
    return { cleanedValue: value === undefined || value === null ? '' : value, change: null };
  }

  const suggestion = detectSafeFix(value, field);
  if (!suggestion.fixAvailable) {
    return { cleanedValue: value, change: null };
  }

  const change: CleaningChange = {
    id: `change-${rowIndex}-${field.key}-${Date.now()}`,
    rowIndex,
    fieldKey: field.key,
    fieldHeader: field.officialHeader,
    originalValue: value,
    finalValue: suggestion.suggestedValue,
    ruleId: 'SAFE_AUTO_FIX',
    actionType: suggestion.description,
    status: 'AUTO-FIX',
    timestamp: new Date().toISOString(),
    safeFixRules: suggestion.rules,
  };
  return { cleanedValue: suggestion.suggestedValue, change };
}

/**
 * @deprecated Use `detectSafeFix()` for analysis and `applySafeFix()` for the
 * explicit "Fix All Automatically" action. Kept as an alias for older scripts.
 */
export const applySafeCleaning = applySafeFix;
