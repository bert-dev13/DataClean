# MASTER TEMPLATE AND VALIDATION RULEBOOK
## DBL & ODeSSEE Data Cleaning and Preparation Tool
**Document Version:** 1.0.0  
**Status:** Approved Reference Specification  
**Scope:** 15 Supported Datasets (8 DBL, 7 ODeSSEE)  
**Primary Reference:** Actual Excel Import Templates (`dbl template/`, `odessee template/`)

---

## 1. Executive Summary & Core Principles

This Master Rulebook establishes the authoritative structural definitions, validation constraints, safe cleaning rules, and conflict documentation for the 15 official local government unit (LGU) datasets across two core information systems:
1. **DBL (Digital Business Locator)** – 8 datasets
2. **ODeSSEE (Optimization of Decision Support System for Effective e-Governance)** – 7 datasets

### 1.1 Critical Data Integrity Mandate (The "Zero-Fabrication" Rule)
In strict accordance with government data-governance standards:
> **THE SYSTEM MUST NEVER FABRICATE, GUESS, OR IMPUTE MISSING GOVERNMENT DATA.**
Under no circumstances may the tool auto-populate missing names, account numbers, barangays, puroks, coordinates, crime entries, consumption volumes, demographic details, or dates. Missing mandatory values must be flagged as **ERROR** or **REVIEW** and left explicitly blank until verified and entered by authorized LGU personnel.

### 1.2 Rule Classification System
Every cleaning and validation rule belongs to one of four deterministic tiers:

| Tier | Code | Meaning | System Action |
| :--- | :---: | :--- | :--- |
| **VALID** | `A` | The input value fully satisfies the official template specification. | No modification required. Preserved as-is. |
| **AUTO-FIX** | `B` | Deterministic, safe, non-destructive normalization that cannot alter data meaning. | Automatically cleaned; logged in audit trail. (e.g., trim whitespace, normalize repeated spaces, strip completely blank rows, parse standard dates into ISO, preserve string leading zeros). |
| **REVIEW** | `C` | Potential anomaly, ambiguous format, or suggested standardization requiring human approval. | Flagged with suggested correction and diff; user must manually Accept, Edit, or Keep Original. |
| **ERROR** | `D` | Violation of a mandatory requirement, impossible value, or missing required field. | Flagged as blocking error. Value remains blank/unresolved; prevents dataset from reaching 100% readiness. |

### 1.3 Data Lineage & Traceability
The application maintains three states for every cell:
1. `originalValue`: Exactly as parsed from the uploaded file.
2. `cleanedValue`: Deterministically normalized after applying safe auto-fixes.
3. `finalValue`: After user reviews, overrides, or manual edits.
Every transformation logs a structured `CleaningChange` record containing: `rowIndex`, `fieldKey`, `originalValue`, `finalValue`, `ruleId`, `actionType`, and `status`.

---

## 2. Universal & Cross-Cutting Rules

These rules apply universally to all 15 datasets unless overridden by a field-specific constraint:

### 2.1 Whitespace & Text Normalization (AUTO-FIX)
- **Trim Leading/Trailing Whitespace:** Strip any leading or trailing spaces, tabs, or non-breaking spaces (`\u00A0`).
- **Collapse Internal Whitespace:** Replace consecutive multiple spaces (`  +`) with a single space.
- **Empty Row Detection:** Rows where all cell values are empty, whitespace-only, or `null` are purged automatically.

### 2.2 Identifier & Leading-Zero Preservation (AUTO-FIX)
- Identifiers (e.g., Account Numbers, Student Numbers, CBMS Numbers, Blotter Numbers, PSIC Codes, Geocodes) must be treated strictly as **Strings**.
- When Excel numeric conversion strips leading zeros (e.g., code `01234` imported as number `1234`), the system preserves original string representation from formatted text (`w` property in SheetJS) or provides a REVIEW suggestion to restore expected length where standard schema is known.

### 2.3 Coordinate Validation (Coordinates)
- **Latitude:** Must be a valid decimal number in the range `[-90.0, 90.0]`. Values outside this range are flagged as **ERROR**.
- **Longitude:** Must be a valid decimal number in the range `[-180.0, 180.0]`. Values outside this range are flagged as **ERROR**.
- **Philippine Geographic Bounding Box (REVIEW):** Philippines bounding box is roughly `Latitude: [4.5°N, 21.5°N]` and `Longitude: [116.0°E, 127.0°E]`. Coordinates outside this box trigger a **REVIEW** warning: *"Coordinates appear outside the Philippines bounding box. Verify swapped lat/lng or typo."*
- **Degree Symbols & DMS Notation (AUTO-FIX / REVIEW):** Decimal coordinates containing accidental degree signs (`°`, `'`, `"`) or compass letters (`N`, `E`) can be safely converted to decimal if unambiguous.

### 2.4 Date & Datetime Handling
- Supported inputs: Excel serial numbers, ISO strings (`YYYY-MM-DD`), standard Philippine common formats (`MM/DD/YYYY`, `DD/MM/YYYY` if unambiguous, `YYYY/MM/DD`).
- **Standardized Export Format:** `YYYY-MM-DD` (ISO 8601) for date fields; `YYYY-MM-DD HH:mm:ss` for datetime fields, unless header explicitly mandates two-digit year (documented in conflicts).
- **Temporal Consistency (ERROR / REVIEW):**
  - Birth dates must be in the past.
  - Crime `Datetime Committed` must be <= `Datetime Reported` and <= current date.
  - Future dates in historical records trigger a **REVIEW** or **ERROR**.

### 2.5 Geographic Standardization (PSGC Basis)
- **Barangay:** Official names reference the Philippine Statistics Authority (PSA) Philippine Standard Geographic Code (PSGC).
  - Cleaners apply title-casing and trim whitespace.
  - Common prefixes ("Brgy.", "BRGY", "Barangay ") are retained or normalized per LGU preference.
  - Roman numerals vs Arabic numerals: Standardized per official PSGC name.
- **Purok / Sitio:** Avoid Roman numerals when referring to numbered zones (e.g., use "Purok 1" rather than "Purok I"). Standardize "Purok" spelling.

---

## 3. DBL (Digital Business Locator) Datasets (8)

### 3.1 DBL – Business
- **Template File:** `business-template.xlsx`
- **Data Sheet Name:** `Data` (Header Row: 1)
- **Instructions Sheet Name:** `Instructions`
- **Total Columns:** 14

#### Column Definitions & Validation Rules:

| # | Official Header | Data Type | Required | Sample / Allowed | Rule Classification & Cleaning Specification |
| :-: | :--- | :---: | :---: | :--- | :--- |
| 1 | `Line of Business (DTI)` | String | Optional | Real estate activities with own or leased property | **AUTO-FIX (trim, whitespace)**: Use PSA Philippine Standard Industrial Classification (PSIC) as the basis for the business activity classification. Match the principal economic activity to the corresponding PSIC description and sub-class code. This existing column header is retained. |
| 2 | `DTI Sub Category` | String | Optional | Renting and operating of self-owned or leased residential buildings and dwellings | **AUTO-FIX (trim, whitespace)**: Use the business activity description corresponding to the selected PSA PSIC sub-class code. Keep this description, Line of Business (DTI), and PSIC Sub-Class Code consistent with the same PSIC edition. This existing column header is retained. |
| 3 | `PSIC Sub-Class Code` | String | Yes (Mandatory) | 68101 | **AUTO-FIX (preserve text & leading zeros) / ERROR (missing/blank)**: Use the official PSA PSIC sub-class code for the business activity. Store it as text and preserve every digit, including leading zeros. Verify that the code and activity descriptions agree with the same PSIC edition. |
| 4 | `Business Trade Name` | String | Yes | E.R. VILLASEÑOR REAL ESTATE LEASING | **AUTO-FIX (trim, whitespace)**: Enter the registered trade name exactly as recorded. Preserve official spelling, punctuation, and diacritics. Avoid unofficial abbreviations. |
| 5 | `Street` | String | Optional | National Road | **AUTO-FIX (trim, whitespace)**: Enter the official street name. Avoid abbreviations where a full official name is available. Capitalize the first letter of each word and retain official punctuation. |
| 6 | `Purok` | String | Optional | Purok 1 | **AUTO-FIX (trim, whitespace)**: Enter the official purok or sitio name. Avoid abbreviations and use Arabic digits instead of Roman numerals when a location number is present. Keep the name consistent with its barangay. |
| 7 | `Barangay` | String | Yes | Barangay 1 | **AUTO-FIX (trim, whitespace)**: Use the official barangay name in the PSA Philippine Standard Geographic Code (PSGC). Match the correct city or municipality and province. Preserve PSGC spelling, punctuation, and numbering. Do not use unofficial aliases or abbreviations. |
| 8 | `Latitude` | Float | Optional | 13.93824298 | **AUTO-FIX (strip symbols) / ERROR (out of bounds [-90,90], [-180,180])**: Enter a valid decimal latitude from -90 to 90. Use a decimal point, without degree symbols. Verify that the coordinate matches the stated location. |
| 9 | `Longitude` | Float | Optional | 121.6132709 | **AUTO-FIX (strip symbols) / ERROR (out of bounds [-90,90], [-180,180])**: Enter a valid decimal longitude from -180 to 180. Use a decimal point, without degree symbols. Verify that the coordinate matches the stated location. |
| 10 | `Registration Date (mm/dd/yy)` | Date | Yes | 11/18/26 | **AUTO-FIX (ISO date format) / ERROR (invalid date)**: Enter a valid registration date. Follow the format specified in the column header: MM/DD/YY. Verify the full year against the source record before entering a two-digit year. |
| 11 | `Permit Status` | String | Optional | Renewal | **AUTO-FIX (trim) / REVIEW (unrecognized category)**: Use the exact permit-status label accepted by the reporting system. Verify it against the permit record. The supplied sample uses Renewal. |
| 12 | `Gross Sales` | Float | Optional | 240000 | **AUTO-FIX (strip currency/commas) / ERROR (negative or non-numeric)**: Enter a nonnegative numeric amount. Use a decimal point and omit currency symbols and thousands separators in import values. Use the currency and reporting period required by the reporting system. A blank value must not be replaced by zero. |
| 13 | `Total Male Employees` | Integer | Optional | 0 | **AUTO-FIX (cast int) / ERROR (non-integer or negative)**: Enter a nonnegative whole-number count for the applicable reporting period. Use 0 only when the confirmed count is zero. Keep missing counts blank until verified. |
| 14 | `Total Female Employees` | Integer | Optional | 0 | **AUTO-FIX (cast int) / ERROR (non-integer or negative)**: Enter a nonnegative whole-number count for the applicable reporting period. Use 0 only when the confirmed count is zero. Keep missing counts blank until verified. |

**Notes & Authority Basis:**
- Keep Data column headers unchanged. Use one record per row. Examples illustrate entry format. Confirm category lists, units, and required fields with the receiving system.
- Barangay basis: PSA PSGC — https://psa.gov.ph/classification/psgc
- Business classification basis: PSA PSIC — https://psa.gov.ph/classification/psic

---

### 3.2 DBL – Crime
- **Template File:** `crime-template.xlsx`
- **Data Sheet Name:** `Data` (Header Row: 1)
- **Instructions Sheet Name:** `Instructions`
- **Total Columns:** 13

#### Column Definitions & Validation Rules:

| # | Official Header | Data Type | Required | Sample / Allowed | Rule Classification & Cleaning Specification |
| :-: | :--- | :---: | :---: | :--- | :--- |
| 1 | `Blotter Number` | String | Yes (Mandatory) | TEST-BL-000001 | **AUTO-FIX (preserve text & leading zeros) / ERROR (missing/blank)**: Enter the official blotter identifier exactly as recorded. Keep leading zeros and hyphens. |
| 2 | `Datetime Reported` | Datetime | Yes | 2026-07-21 05:38 | **AUTO-FIX (ISO date format) / ERROR (invalid date)**: Enter the date and time the incident was reported. Recommended format: YYYY-MM-DD HH:mm, using a 24-hour clock and the local reporting timezone. This should not be earlier than Datetime Committed. |
| 3 | `Datetime Committed` | Datetime | Yes | 2026-07-20 03:38 | **AUTO-FIX (ISO date format) / ERROR (invalid date)**: Enter the date and time the incident occurred, based on the source record. Recommended format: YYYY-MM-DD HH:mm, using a 24-hour clock and the same timezone as Datetime Reported. |
| 4 | `Sub Violation` | String | Optional | Acts against comprehensive dangerous drugs act | **AUTO-FIX (trim, whitespace)**: Use the applicable description from the PSA Philippine Standard Classification of Crime for Statistical Purposes (PSCCS). Classify the recorded incident using PSCCS definitions and verify that the description agrees with the selected PSCCS sub-class code. |
| 5 | `PSCCS Sub-Class Code` | String | Yes (Mandatory) | 806102 | **AUTO-FIX (preserve text & leading zeros) / ERROR (missing/blank)**: Use the official sub-class code from PSA PSCCS for the recorded offense. Store it as text and preserve every digit, including leading zeros. Verify the code and description against the same PSCCS edition. Do not derive code length from the sample records. |
| 6 | `Violation Name` | String | Yes | Obstruction of justice | **AUTO-FIX (trim, whitespace)**: Use the official offense description corresponding to the selected PSA PSCCS code. Apply the PSCCS definitions to the incident details. Keep Violation Name, Sub Violation, and PSCCS Sub-Class Code consistent with the same classification edition. |
| 7 | `Complainant Gender` | String | Optional | Female | **AUTO-FIX (trim) / REVIEW (unrecognized category)**: Enter the complainant’s gender using the exact label accepted by the reporting system. Use the source record and do not infer gender from a name. |
| 8 | `Respondent Gender` | String | Optional | Male | **AUTO-FIX (trim) / REVIEW (unrecognized category)**: Enter the respondent’s gender using the exact label accepted by the reporting system. Use the source record and do not infer gender from a name. |
| 9 | `Street` | String | Optional | National Road | **AUTO-FIX (trim, whitespace)**: Enter the official street name. Avoid abbreviations where a full official name is available. Capitalize the first letter of each word and retain official punctuation. |
| 10 | `Purok` | String | Optional | Purok 1 | **AUTO-FIX (trim, whitespace)**: Enter the official purok or sitio name. Avoid abbreviations and use Arabic digits instead of Roman numerals when a location number is present. Keep the name consistent with its barangay. |
| 11 | `Barangay` | String | Yes | Barangay 1 | **AUTO-FIX (trim, whitespace)**: Use the official barangay name in the PSA Philippine Standard Geographic Code (PSGC). Match the correct city or municipality and province. Preserve PSGC spelling, punctuation, and numbering. Do not use unofficial aliases or abbreviations. |
| 12 | `Latitude` | Float | Optional | 13.93824298 | **AUTO-FIX (strip symbols) / ERROR (out of bounds [-90,90], [-180,180])**: Enter a valid decimal latitude from -90 to 90. Use a decimal point, without degree symbols. Verify that the coordinate matches the stated location. |
| 13 | `Longitude` | Float | Optional | 121.6132709 | **AUTO-FIX (strip symbols) / ERROR (out of bounds [-90,90], [-180,180])**: Enter a valid decimal longitude from -180 to 180. Use a decimal point, without degree symbols. Verify that the coordinate matches the stated location. |

**Notes & Authority Basis:**
- Keep Data column headers unchanged. Use one record per row. Examples illustrate entry format. Confirm category lists, units, and required fields with the receiving system.
- Barangay basis: PSA PSGC — https://psa.gov.ph/classification/psgc
- Crime classification basis: PSA PSCCS — https://psa.gov.ph/classification/psccs/general-information

---

### 3.3 DBL – Human Resource
- **Template File:** `human-resource-template.xlsx`
- **Data Sheet Name:** `Data` (Header Row: 1)
- **Instructions Sheet Name:** `Instructions`
- **Total Columns:** 8

#### Column Definitions & Validation Rules:

| # | Official Header | Data Type | Required | Sample / Allowed | Rule Classification & Cleaning Specification |
| :-: | :--- | :---: | :---: | :--- | :--- |
| 1 | `Student Number` | String | Yes (Mandatory) | TEST-STU-0000001 | **AUTO-FIX (preserve text & leading zeros) / ERROR (missing/blank)**: Enter the student identifier exactly as issued. Keep leading zeros and hyphens. Use text format. Check duplicate student records before importing. |
| 2 | `Gender` | String | Optional | Male | **AUTO-FIX (trim) / REVIEW (unrecognized category)**: Use the exact gender label accepted by the reporting system and supported by the source record. Keep spelling and capitalization consistent. |
| 3 | `Street` | String | Optional | National Road | **AUTO-FIX (trim, whitespace)**: Enter the official street name. Avoid abbreviations where a full official name is available. Capitalize the first letter of each word and retain official punctuation. |
| 4 | `Purok` | String | Optional | Purok 1 | **AUTO-FIX (trim, whitespace)**: Enter the official purok or sitio name. Avoid abbreviations and use Arabic digits instead of Roman numerals when a location number is present. Keep the name consistent with its barangay. |
| 5 | `Barangay` | String | Yes | Barangay 1 | **AUTO-FIX (trim, whitespace)**: Use the official barangay name in the PSA Philippine Standard Geographic Code (PSGC). Match the correct city or municipality and province. Preserve PSGC spelling, punctuation, and numbering. Do not use unofficial aliases or abbreviations. |
| 6 | `School` | String | Optional | TEST SCHOOL 01 | **AUTO-FIX (trim, whitespace)**: Enter the official school or institution name. Avoid abbreviations unless they are part of the official name. Capitalize names consistently. |
| 7 | `Course` | String | Optional | TVL - Industrial Arts | **AUTO-FIX (trim, whitespace)**: Enter the official course, program, or strand title as recorded by the institution. Retain qualification levels and specialization names. |
| 8 | `Graduation Year` | Integer | Optional | 2025 | **AUTO-FIX (ISO date format) / ERROR (invalid date)**: Enter a four-digit calendar year for the recorded graduation, such as 2025. Do not enter a full date or academic-year range. |

**Notes & Authority Basis:**
- Keep Data column headers unchanged. Use one record per row. Examples illustrate entry format. Confirm category lists, units, and required fields with the receiving system.
- Barangay basis: PSA PSGC — https://psa.gov.ph/classification/psgc

---

### 3.4 DBL – Power
- **Template File:** `power-template.xlsx`
- **Data Sheet Name:** `Data` (Header Row: 1)
- **Instructions Sheet Name:** `Instructions`
- **Total Columns:** 7

#### Column Definitions & Validation Rules:

| # | Official Header | Data Type | Required | Sample / Allowed | Rule Classification & Cleaning Specification |
| :-: | :--- | :---: | :---: | :--- | :--- |
| 1 | `Account Number` | String | Yes (Mandatory) | TEST-PWR-0000001 | **AUTO-FIX (preserve text & leading zeros) / ERROR (missing/blank)**: Enter the account identifier exactly as issued. Keep leading zeros, letters, and hyphens. Use text format. Each account and billing date combination should identify one billing record. |
| 2 | `Type` | String | Optional | Residential, Public Building - HV, Commercial - HV, Commercial - LV | **AUTO-FIX (trim) / REVIEW (unrecognized category)**: Use the exact electricity customer classification accepted by the provider and reporting system. |
| 3 | `Consumption` | Float | Optional | 28.71 | **AUTO-FIX (strip currency/commas) / ERROR (negative or non-numeric)**: Enter a nonnegative numeric electricity consumption value for the billing period. Use a decimal point and omit unit symbols. Confirm the provider’s reporting unit before entry. Use 0 only for confirmed zero consumption. |
| 4 | `Street` | String | Optional | National Road | **AUTO-FIX (trim, whitespace)**: Enter the official street name. Avoid abbreviations where a full official name is available. Capitalize the first letter of each word and retain official punctuation. |
| 5 | `Purok` | String | Optional | Purok 1 | **AUTO-FIX (trim, whitespace)**: Enter the official purok or sitio name. Avoid abbreviations and use Arabic digits instead of Roman numerals when a location number is present. Keep the name consistent with its barangay. |
| 6 | `Barangay` | String | Yes | Barangay 1 | **AUTO-FIX (trim, whitespace)**: Use the official barangay name in the PSA Philippine Standard Geographic Code (PSGC). Match the correct city or municipality and province. Preserve PSGC spelling, punctuation, and numbering. Do not use unofficial aliases or abbreviations. |
| 7 | `Billing Date` | Date | Yes | 2026-05-30 | **AUTO-FIX (ISO date format) / ERROR (invalid date)**: Enter the actual billing date in YYYY-MM-DD format, with a four-digit year. Use a valid calendar date and verify it against the bill. |

**Notes & Authority Basis:**
- Keep Data column headers unchanged. Use one record per row. Examples illustrate entry format. Confirm category lists, units, and required fields with the receiving system.
- Barangay basis: PSA PSGC — https://psa.gov.ph/classification/psgc

---

### 3.5 DBL – Residential
- **Template File:** `residential-template-test.xlsx`
- **Data Sheet Name:** `Data` (Header Row: 1)
- **Instructions Sheet Name:** `Instructions`
- **Total Columns:** 7

#### Column Definitions & Validation Rules:

| # | Official Header | Data Type | Required | Sample / Allowed | Rule Classification & Cleaning Specification |
| :-: | :--- | :---: | :---: | :--- | :--- |
| 1 | `CBMS Number` | String | Yes (Mandatory) | CBMS-000000001 | **AUTO-FIX (preserve text & leading zeros) / ERROR (missing/blank)**: Enter the CBMS identifier exactly as issued. Keep leading zeros and hyphens. Use text format and avoid duplicate identifiers for the same person. |
| 2 | `Gender` | String | Optional | Male | **AUTO-FIX (trim) / REVIEW (unrecognized category)**: Use the exact gender label accepted by the reporting system and supported by the source record. Keep spelling and capitalization consistent. |
| 3 | `Birth Date` | Date | Yes | 1970-01-19 | **AUTO-FIX (ISO date format) / ERROR (invalid date)**: Enter a valid birth date in YYYY-MM-DD format, with a four-digit year. Confirm the century from the source record. The date must not be in the future. |
| 4 | `House No` | String | Optional | 428 | **AUTO-FIX (trim, whitespace)**: Enter the official house or unit number as text. Preserve letters, hyphens, slashes, and leading zeros. Do not force identifiers into numeric format. |
| 5 | `Street` | String | Optional | National Road | **AUTO-FIX (trim, whitespace)**: Enter the official street name. Avoid abbreviations where a full official name is available. Capitalize the first letter of each word and retain official punctuation. |
| 6 | `Purok` | String | Optional | Purok 1 | **AUTO-FIX (trim, whitespace)**: Enter the official purok or sitio name. Avoid abbreviations and use Arabic digits instead of Roman numerals when a location number is present. Keep the name consistent with its barangay. |
| 7 | `Barangay` | String | Yes | Barangay 1 | **AUTO-FIX (trim, whitespace)**: Use the official barangay name in the PSA Philippine Standard Geographic Code (PSGC). Match the correct city or municipality and province. Preserve PSGC spelling, punctuation, and numbering. Do not use unofficial aliases or abbreviations. |

**Notes & Authority Basis:**
- Keep Data column headers unchanged. Use one record per row. Examples illustrate entry format. Confirm category lists, units, and required fields with the receiving system.
- Barangay basis: PSA PSGC — https://psa.gov.ph/classification/psgc

---

### 3.6 DBL – Telecommunication Towers
- **Template File:** `telecommunication-towers.xlsx`
- **Data Sheet Name:** `Data` (Header Row: 1)
- **Instructions Sheet Name:** `Instructions`
- **Total Columns:** 14

#### Column Definitions & Validation Rules:

| # | Official Header | Data Type | Required | Sample / Allowed | Rule Classification & Cleaning Specification |
| :-: | :--- | :---: | :---: | :--- | :--- |
| 1 | `Provider Name` | String | Yes | Smart Communications | **AUTO-FIX (trim, whitespace)**: Enter the official telecommunications provider name. Use consistent spelling and capitalization. |
| 2 | `Tower Name` | String | Yes | TEST TOWER 00001 | **AUTO-FIX (trim, whitespace)**: Enter the official site or tower name as recorded by the provider. Keep it consistent with the tower code and location. |
| 3 | `Tower Code` | String | Yes (Mandatory) | TEST-TWR-00001 | **AUTO-FIX (preserve text & leading zeros) / ERROR (missing/blank)**: Enter the tower or site identifier exactly as assigned. Keep leading zeros, letters, and hyphens. Use text format and avoid duplicate tower identifiers. |
| 4 | `Purok` | String | Optional | Purok 1 | **AUTO-FIX (trim, whitespace)**: Enter the official purok or sitio name. Avoid abbreviations and use Arabic digits instead of Roman numerals when a location number is present. Keep the name consistent with its barangay. |
| 5 | `Barangay` | String | Yes | Barangay 1 | **AUTO-FIX (trim, whitespace)**: Use the official barangay name in the PSA Philippine Standard Geographic Code (PSGC). Match the correct city or municipality and province. Preserve PSGC spelling, punctuation, and numbering. Do not use unofficial aliases or abbreviations. |
| 6 | `Location Address` | String | Optional | ECO TOURISM ROAD PUROK LANSONESAN, BARANGAY  1 | **AUTO-FIX (trim, whitespace)**: Enter the complete official site address. Include the street or landmark, purok or sitio, and barangay where available. Ensure it agrees with the separate location fields and coordinates. |
| 7 | `Latitude` | Float | Optional | 13.93824298 | **AUTO-FIX (strip symbols) / ERROR (out of bounds [-90,90], [-180,180])**: Enter a valid decimal latitude from -90 to 90. Use a decimal point, without degree symbols. Verify that the coordinate matches the stated location. |
| 8 | `Longitude` | Float | Optional | 121.6132709 | **AUTO-FIX (strip symbols) / ERROR (out of bounds [-90,90], [-180,180])**: Enter a valid decimal longitude from -180 to 180. Use a decimal point, without degree symbols. Verify that the coordinate matches the stated location. |
| 9 | `Tower Type` | String | Optional | Self-Supporting, Guyed Tower, and Rooftop | **AUTO-FIX (trim) / REVIEW (unrecognized category)**: Use the exact tower-type label accepted by the reporting system. |
| 10 | `Network Technology` | String | Optional | LTE | **AUTO-FIX (trim, whitespace)**: Use the exact technology designation accepted by the reporting system. Examples in the supplied file include LTE and 5G. Use the system’s prescribed format for multiple technologies. |
| 11 | `Tower Height` | Float | Optional | 29 | **AUTO-FIX (strip currency/commas) / ERROR (negative or non-numeric)**: Enter a positive numeric height. Omit unit symbols from the value. Confirm the required measurement unit and whether the height refers to the tower structure or total height before entry. |
| 12 | `Ownership Type` | String | Optional | Provider-owned, Third-party, etc. | **AUTO-FIX (trim) / REVIEW (unrecognized category)**: Use the exact ownership label accepted by the reporting system. |
| 13 | `Status` | String | Optional | Operational, Under Construction, Etc. | **AUTO-FIX (trim) / REVIEW (unrecognized category)**: Use the exact tower-status label accepted by the reporting system. Verify the status for the reporting date. |
| 14 | `Installation Date` | Date | Yes | 2022-10-29 | **AUTO-FIX (ISO date format) / ERROR (invalid date)**: Enter the verified installation date in YYYY-MM-DD format, with a four-digit year. If installation has not occurred, use the reporting system’s accepted blank value instead of an invented date. |

**Notes & Authority Basis:**
- Keep Data column headers unchanged. Use one record per row. Examples illustrate entry format. Confirm category lists, units, and required fields with the receiving system.
- Barangay basis: PSA PSGC — https://psa.gov.ph/classification/psgc

---

### 3.7 DBL – Transportation
- **Template File:** `transportation-template.xlsx`
- **Data Sheet Name:** `Data` (Header Row: 1)
- **Instructions Sheet Name:** `Instructions`
- **Total Columns:** 5

#### Column Definitions & Validation Rules:

| # | Official Header | Data Type | Required | Sample / Allowed | Rule Classification & Cleaning Specification |
| :-: | :--- | :---: | :---: | :--- | :--- |
| 1 | `Route` | String | Yes | Barangay 1 - Barangay 2 | **AUTO-FIX (trim, whitespace)**: Enter the official route name with its origin and destination. Use a consistent separator and include distinguishing route details where needed. |
| 2 | `Available Units` | Integer | Optional | 66 | **AUTO-FIX (cast int) / ERROR (non-integer or negative)**: Enter the nonnegative whole-number count of available vehicles for the route and reporting period. Do not include units unavailable under the reporting definition. |
| 3 | `Vehicle Type` | String | Optional | PUJ | **AUTO-FIX (trim) / REVIEW (unrecognized category)**: Use the exact vehicle-type label or code accepted by the reporting system. Keep approved codes unchanged. The supplied sample uses PUJ. |
| 4 | `Barangays Covered by Route` | String | Yes | Barangay 1, Barangay 2 | **AUTO-FIX (trim, whitespace)**: Use the official barangay names in PSA PSGC for the barangays served by the route. Match each to the correct city or municipality and province. Preserve PSGC spelling and numbering. Use the import system’s delimiter for multiple names and avoid duplicates. |
| 5 | `Puroks Covered by Route` | String | Yes | Barangay 1 :: Purok 1, Barangay 2 :: Purok 1, | **AUTO-FIX (trim, whitespace)**: Enter the official local puroks served by the route and associate each with its PSA PSGC barangay name. Use the import system’s delimiter for multiple entries. Verify purok names against local records. |

**Notes & Authority Basis:**
- Keep Data column headers unchanged. Use one record per row. Examples illustrate entry format. Confirm category lists, units, and required fields with the receiving system.
- Barangay basis: PSA PSGC — https://psa.gov.ph/classification/psgc

---

### 3.8 DBL – Water
- **Template File:** `water-template.xlsx`
- **Data Sheet Name:** `Data` (Header Row: 1)
- **Instructions Sheet Name:** `Instructions`
- **Total Columns:** 7

#### Column Definitions & Validation Rules:

| # | Official Header | Data Type | Required | Sample / Allowed | Rule Classification & Cleaning Specification |
| :-: | :--- | :---: | :---: | :--- | :--- |
| 1 | `Account Number` | String | Yes (Mandatory) | TEST-LUC-WTR-0000001 | **AUTO-FIX (preserve text & leading zeros) / ERROR (missing/blank)**: Enter the account identifier exactly as issued. Keep leading zeros, letters, and hyphens. Use text format. Each account and billing date combination should identify one billing record. |
| 2 | `Type` | String | Optional | Residential, Commercial A, Commercial B | **AUTO-FIX (trim) / REVIEW (unrecognized category)**: Use the exact water customer classification accepted by the provider and reporting system. |
| 3 | `Consumption` | Float | Optional | 1.1 | **AUTO-FIX (strip currency/commas) / ERROR (negative or non-numeric)**: Enter a nonnegative numeric water consumption value for the billing period. Use a decimal point and omit unit symbols. Confirm the provider’s reporting unit before entry. Use 0 only for confirmed zero consumption. |
| 4 | `Street` | String | Optional | National Road | **AUTO-FIX (trim, whitespace)**: Enter the official street name. Avoid abbreviations where a full official name is available. Capitalize the first letter of each word and retain official punctuation. |
| 5 | `Purok` | String | Optional | Purok 1 | **AUTO-FIX (trim, whitespace)**: Enter the official purok or sitio name. Avoid abbreviations and use Arabic digits instead of Roman numerals when a location number is present. Keep the name consistent with its barangay. |
| 6 | `Barangay` | String | Yes | Barangay 1 | **AUTO-FIX (trim, whitespace)**: Use the official barangay name in the PSA Philippine Standard Geographic Code (PSGC). Match the correct city or municipality and province. Preserve PSGC spelling, punctuation, and numbering. Do not use unofficial aliases or abbreviations. |
| 7 | `Billing Date` | Date | Yes | 2026-05-30 | **AUTO-FIX (ISO date format) / ERROR (invalid date)**: Enter the actual billing date in YYYY-MM-DD format, with a four-digit year. Use a valid calendar date and verify it against the bill. |

**Notes & Authority Basis:**
- Keep Data column headers unchanged. Use one record per row. Examples illustrate entry format. Confirm category lists, units, and required fields with the receiving system.
- Barangay basis: PSA PSGC — https://psa.gov.ph/classification/psgc

---

## 4. ODeSSEE Datasets (7)

### 4.1 ODeSSEE – Barangay Household Profile
- **Template File:** `Barangay Household Profile Import Template.xlsx`
- **Data Sheet Name:** `Barangay Population Import Temp` (Header Row: 1)
- **Instructions Sheet Name:** `Instructions`
- **Data Sheet Columns:** 9
- **Instructions Defined Columns:** 22

#### Column Definitions & Validation Rules (Primary Reference: Data Sheet):

| # | Official Header | Data Type | Required | Sample / Allowed | Rule Classification & Cleaning Specification |
| :-: | :--- | :---: | :---: | :--- | :--- |
| 1 | `CBMS#-Ind#` | String | Optional | — | **AUTO-FIX (trim, whitespace)**: Standard field. |
| 2 | `Gender` | String | Optional | — | **AUTO-FIX (trim, uppercase Y/N) / REVIEW (unrecognized category)**: Standard field. |
| 3 | `Civil Status` | String | Optional | — | **AUTO-FIX (trim, uppercase Y/N) / REVIEW (unrecognized category)**: Standard field. |
| 4 | `Barangay` | String | Yes | — | **AUTO-FIX (trim, whitespace)**: Standard field. |
| 5 | `Purok/Zone` | String | Optional | — | **AUTO-FIX (trim, whitespace)**: Standard field. |
| 6 | `Solo Parent(Y/N)` | String | Optional | — | **AUTO-FIX (trim, uppercase Y/N) / REVIEW (unrecognized category)**: Standard field. |
| 7 | `Birth Date` | String | Yes | — | **AUTO-FIX (ISO date) / ERROR (invalid date)**: Standard field. |
| 8 | `Disability` | String | Optional | — | **AUTO-FIX (trim, whitespace)**: Standard field. |
| 9 | `Income Classification` | String | Optional | — | **AUTO-FIX (trim, whitespace)**: Standard field. |

**Notes & Template Structural Findings:**

---

### 4.2 ODeSSEE – Covid Cases
- **Template File:** `COVID Cases Import Template.xlsx`
- **Data Sheet Name:** `Covid Cases Import Template` (Header Row: 1)
- **Instructions Sheet Name:** `Instructions`
- **Data Sheet Columns:** 3
- **Instructions Defined Columns:** 40

#### Column Definitions & Validation Rules (Primary Reference: Data Sheet):

| # | Official Header | Data Type | Required | Sample / Allowed | Rule Classification & Cleaning Specification |
| :-: | :--- | :---: | :---: | :--- | :--- |
| 1 | `Barangay` | string | Yes | San Fermin | **AUTO-FIX (trim, whitespace)**: Input official Barangay names, Do not use roman numerals in case numbers are present, Avoid abbreviations, Capitalize the first letter of each word. |
| 2 | `Facilities` | String | Optional | — | **AUTO-FIX (trim, whitespace)**: Standard field. |
| 3 | `Total Number of Case` | String | Optional | — | **AUTO-FIX (cast int) / ERROR (negative or non-integer)**: Standard field. |

**Notes & Template Structural Findings:**

---

### 4.3 ODeSSEE – Drrm Resources
- **Template File:** `DRRM Resources Import Template.xlsx`
- **Data Sheet Name:** `DRRM Resources Import Template` (Header Row: 1)
- **Instructions Sheet Name:** `Instruction`
- **Data Sheet Columns:** 5
- **Instructions Defined Columns:** 5

#### Column Definitions & Validation Rules (Primary Reference: Data Sheet):

| # | Official Header | Data Type | Required | Sample / Allowed | Rule Classification & Cleaning Specification |
| :-: | :--- | :---: | :---: | :--- | :--- |
| 1 | `Group/Team` | String | Yes | Rescue 922 | **AUTO-FIX (trim, whitespace)**: Input official Group/Team names, Do not use roman numerals in case numbers are present, Avoid abbreviations, Capitalize the first letter of each word |
| 2 | `Resources/Equipment` | String | Optional | Stretcher | **AUTO-FIX (trim, whitespace)**: Input official Resource/Equipment names, Do not use roman numerals in case numbers are present, Avoid abbreviations, Capitalize the first letter of each word |
| 3 | `Quantity` | int | Yes | 1.0 | **AUTO-FIX (cast int) / ERROR (negative or non-integer)**: Input whole number, Use 0 if none, Do not use letters. |
| 4 | `Unit` | String | Optional | Pc | **AUTO-FIX (trim, whitespace)**: Choose one of the predetermined category based on the input of Quantity: “Pc" (Piece), "PCs" (Pieces), "Pairs" |
| 5 | `Category` | String | Optional | Emergency Medical Equipment | **AUTO-FIX (trim, whitespace)**: Input official Category names, Avoid abbreviations, Capitalize the first letter of each word |

**Notes & Template Structural Findings:**

---

### 4.4 ODeSSEE – Disaster Incident Report
- **Template File:** `Disaster Incident Report Template.xlsx`
- **Data Sheet Name:** `Disaster Incident Report` (Header Row: 2)
- **Instructions Sheet Name:** `Instructions`
- **Data Sheet Columns:** 10
- **Instructions Defined Columns:** 0

#### Column Definitions & Validation Rules (Primary Reference: Data Sheet):

| # | Official Header | Data Type | Required | Sample / Allowed | Rule Classification & Cleaning Specification |
| :-: | :--- | :---: | :---: | :--- | :--- |
| 1 | `Report Date` | String | Yes | — | **AUTO-FIX (ISO date) / ERROR (invalid date)**: Standard field. |
| 2 | `Incident` | String | Optional | — | **AUTO-FIX (trim, whitespace)**: Standard field. |
| 3 | `Incident Date (Date Range)` | String | Yes | — | **AUTO-FIX (ISO date) / ERROR (invalid date)**: Standard field. |
| 4 | `Sky Condition` | String | Optional | — | **AUTO-FIX (trim, whitespace)**: Standard field. |
| 5 | `Wind` | String | Optional | — | **AUTO-FIX (trim, whitespace)**: Standard field. |
| 6 | `Precipitation` | String | Optional | — | **AUTO-FIX (trim, whitespace)**: Standard field. |
| 7 | `Gauging Station` | String | Optional | — | **AUTO-FIX (trim, whitespace)**: Standard field. |
| 8 | `Current Level` | String | Optional | — | **AUTO-FIX (cast float) / ERROR (non-numeric)**: Standard field. |
| 9 | `Areas Likely to be Affected` | String | Optional | — | **AUTO-FIX (trim, whitespace)**: Standard field. |
| 10 | `Casualty` | String | Optional | — | **AUTO-FIX (trim, whitespace)**: Standard field. |

**Notes & Template Structural Findings:**

---

### 4.5 ODeSSEE – Evacuation Sites
- **Template File:** `Evacuation Sites Import Template.xlsx`
- **Data Sheet Name:** `Evacuation Sites Import Templat` (Header Row: 1)
- **Instructions Sheet Name:** `Instructions`
- **Data Sheet Columns:** 18
- **Instructions Defined Columns:** 18

#### Column Definitions & Validation Rules (Primary Reference: Data Sheet):

| # | Official Header | Data Type | Required | Sample / Allowed | Rule Classification & Cleaning Specification |
| :-: | :--- | :---: | :---: | :--- | :--- |
| 1 | `Name of Evacuation Center` | String | Yes | San Roque Evacuation Center | **AUTO-FIX (trim, whitespace)**: Input official Evacuation Center names, Do not use roman numerals in case numbers are present, Avoid abbreviations, Capitalize the first letter of each word |
| 2 | `Barangay` | String | Yes | Barangay Malinis | **AUTO-FIX (trim, whitespace)**: Input official Barangay names, Do not use roman numerals in case numbers are present, Avoid abbreviations, Capitalize the first letter of each word |
| 3 | `Latitude` | Float | Optional | 14.5995 | **AUTO-FIX (strip symbols) / ERROR (out of bounds)**: Input must not contain a non-numeric symbols/units |
| 4 | `Longitude` | Float | Optional | 120.9842 | **AUTO-FIX (strip symbols) / ERROR (out of bounds)**:  |
| 5 | `No. of Family` | int | Optional | 38.0 | **AUTO-FIX (cast int) / ERROR (negative or non-integer)**: Input whole numbers, Use 0 if none, Do not use letters. |
| 6 | `No. of Individuals` | int | Optional | 182.0 | **AUTO-FIX (cast int) / ERROR (negative or non-integer)**:  |
| 7 | `No. of Storey/ Floors` | int | Optional | 2.0 | **AUTO-FIX (cast int) / ERROR (negative or non-integer)**:  |
| 8 | `No. of Rooms` | int | Optional | 10.0 | **AUTO-FIX (cast int) / ERROR (negative or non-integer)**:  |
| 9 | `No. of Toilet for Women` | int | Optional | 5.0 | **AUTO-FIX (cast int) / ERROR (negative or non-integer)**:  |
| 10 | `No. of Toilet for Men` | int | Optional | 4.0 | **AUTO-FIX (cast int) / ERROR (negative or non-integer)**:  |
| 11 | `Common CR` | int | Optional | 3.0 | **AUTO-FIX (trim, whitespace)**:  |
| 12 | `No. of Bath/ Shower Area for Women` | int | Optional | 4.0 | **AUTO-FIX (cast int) / ERROR (negative or non-integer)**:  |
| 13 | `No. of Bath/ Shower Area for Men` | int | Optional | 4.0 | **AUTO-FIX (cast int) / ERROR (negative or non-integer)**:  |
| 14 | `Water Source/s` | String | Optional | Deep well, Water Tana | **AUTO-FIX (trim, whitespace)**: Input types of water source/s, Avoid abbreviations, Capitalize the first letter of each word |
| 15 | `Breast feeding Area` | String | Optional | Available | **AUTO-FIX (trim, whitespace)**: Indicate availability; write "Available" or "Not Available" |
| 16 | `With Storage (Y/N) If yes indicate the floor area` | String | Optional | Y - 1st floor | **AUTO-FIX (trim, uppercase Y/N) / REVIEW (unrecognized category)**: Format: "Y - [area]" or "N", Avoid abbreviation with the area name. |
| 17 | `Used as COVID-19 TTMF (Y/N)` | Boolean | Optional | Y | **AUTO-FIX (trim, uppercase Y/N) / REVIEW (unrecognized category)**: Input “Y” or “N”, Capitalize the letter. |
| 18 | `Inspected Safe` | Boolean | Optional | Y | **AUTO-FIX (trim, whitespace)**:  |

**Notes & Template Structural Findings:**

---

### 4.6 ODeSSEE – Flood Susceptibility Rating
- **Template File:** `Flood Susceptibility Rating Import Template.xlsx`
- **Data Sheet Name:** `Geo Hazard Import Template` (Header Row: 1)
- **Instructions Sheet Name:** `Instructions`
- **Data Sheet Columns:** 13
- **Instructions Defined Columns:** 15

#### Column Definitions & Validation Rules (Primary Reference: Data Sheet):

| # | Official Header | Data Type | Required | Sample / Allowed | Rule Classification & Cleaning Specification |
| :-: | :--- | :---: | :---: | :--- | :--- |
| 1 | `Area of Concern` | String | Optional | Bridge | **AUTO-FIX (trim, whitespace)**: Input official names, Do not use roman numerals in case numbers are present, Avoid abbreviations, Capitalize the first letter of each word |
| 2 | `Barangay Name` | String | Yes | San Fermin | **AUTO-FIX (trim, whitespace)**: Input official barangay names, Do not use roman numerals in case numbers are present, Avoid abbreviations, Capitalize the first letter of each word |
| 3 | `Barangay Code` | int | Yes | 1928372.0 | **AUTO-FIX (trim, whitespace)**: All data must be accurate, complete, and entered using the official format by authorized personnel only. |
| 4 | `Municipality Name` | String | Yes | Cauayan City | **AUTO-FIX (trim, whitespace)**: Input official municipal name. Capitalize the first letter of each word. Avoid abbreviations. |
| 5 | `Municipality Code` | int | Yes | 126542.0 | **AUTO-FIX (trim, whitespace)**: All data must be accurate, complete, and entered using the official format by authorized personnel only. |
| 6 | `Geocode` | String | Yes | PH-01-03-02-007 | **AUTO-FIX (trim, whitespace)**: All geographic data must use the official barangay geocode and follow standardized coordinates and location names. |
| 7 | `Purok/Sitio` | String | Optional | Purok 4 | **AUTO-FIX (trim, whitespace)**: Input official names of the location, Do not use roman numerals, |
| 8 | `Latitude` | Float | Optional | 14.599512 | **AUTO-FIX (strip symbols) / ERROR (out of bounds)**: Input must be a valid geographic coordinate |
| 9 | `Longitude` | Float | Optional | 120.984222 | **AUTO-FIX (strip symbols) / ERROR (out of bounds)**:  |
| 10 | `Susceptibility Rating` | String | Yes | HF | **AUTO-FIX (trim, uppercase Y/N) / REVIEW (unrecognized category)**: Susceptibility ratings must be assigned based on validated hazard assessments and entered using standardized categories such as "HIGH FLOOD SUSCEPTIBILITY (HF), LOW FLOOD SUSCEPTIBILITY (LF), MODERATE FLOOD SUSCEPTIBILITY (MF), VERY HIGH FLOOD SUSCEPTIBILITY (VHF)" |
| 11 | `Flood Height` | Float | Optional | 1.75 | **AUTO-FIX (cast float) / ERROR (non-numeric)**: Flood height must be measured in meters using verified instruments or official reports, and recorded as a numeric value with up to two decimal places. |
| 12 | `Elevation` | Float | Optional | 45.3 | **AUTO-FIX (cast float) / ERROR (non-numeric)**: Elevation must be recorded in meters above sea level as a numeric value with up to two decimal places, based on official surveys or GPS measurements. |
| 13 | `POI` | String | Optional | — | **AUTO-FIX (trim, whitespace)**: Standard field. |

**Notes & Template Structural Findings:**

---

### 4.7 ODeSSEE – Vulnerability Risk Assessment
- **Template File:** `Vulnerability Risk Assessment Import Template.xlsx`
- **Data Sheet Name:** `Tuguegarao VRA Import Template` (Header Row: 1)
- **Instructions Sheet Name:** `Instructions`
- **Data Sheet Columns:** 8
- **Instructions Defined Columns:** 10

#### Column Definitions & Validation Rules (Primary Reference: Data Sheet):

| # | Official Header | Data Type | Required | Sample / Allowed | Rule Classification & Cleaning Specification |
| :-: | :--- | :---: | :---: | :--- | :--- |
| 1 | `Area of Concern` | String | Optional |  | **AUTO-FIX (trim, whitespace)**: Input official Area names, Do not use roman numerals in case numbers are present, Avoid abbreviations, Capitalize the first letter of each word |
| 2 | `Barangay Name` | String | Yes | San Fermin | **AUTO-FIX (trim, whitespace)**: Input official barangay names, Do not use roman numerals in case numbers are present, Avoid abbreviations, Capitalize the first letter of each word |
| 3 | `Purok/Sitio` |  | Optional |  | **AUTO-FIX (trim, whitespace)**: Input official names of the location, Do not use roman numerals |
| 4 | `Geocode` | String | Yes | PH-01-03-02-007 | **AUTO-FIX (trim, whitespace)**: All geographic data must use the official barangay geocode and follow standardized coordinates and location names. |
| 5 | `Latitude` | Float | Optional | 14.599512 | **AUTO-FIX (strip symbols) / ERROR (out of bounds)**: Input must be a valid geographic coordinate |
| 6 | `Longitude` | Float | Optional | 120.984222 | **AUTO-FIX (strip symbols) / ERROR (out of bounds)**:  |
| 7 | `Susceptibility Rating` | String | Yes | HF | **AUTO-FIX (trim, uppercase Y/N) / REVIEW (unrecognized category)**: Susceptibility ratings must be assigned based on validated hazard assessments and entered using standardized categories such as "HIGH FLOOD SUSCEPTIBILITY (HF), LOW FLOOD SUSCEPTIBILITY (LF), MODERATE FLOOD SUSCEPTIBILITY (MF), VERY HIGH FLOOD SUSCEPTIBILITY (VHF)" |
| 8 | `Concern Category` | String | Optional |  | **AUTO-FIX (trim, whitespace)**:  |

**Notes & Template Structural Findings:**

---

## 5. Duplicate Detection Specifications

Each dataset has an identified candidate composite key for duplicate detection:

| System | Dataset | Candidate Unique Identifier / Composite Key | Action on Duplicate |
| :--- | :--- | :--- | :--- |
| **DBL** | Business | `Business Trade Name` + `Barangay` + `Street` OR `PSIC Sub-Class Code` | REVIEW / ERROR |
| **DBL** | Crime | `Blotter Number` (Primary Key) | ERROR (Duplicate Blotter #) |
| **DBL** | Human Resource | `Student Number` (Primary Key) | ERROR (Duplicate Student #) |
| **DBL** | Power | `Account Number` + `Billing Date` | ERROR (Duplicate Billing Record) |
| **DBL** | Residential | `CBMS Number` (Primary Key) | ERROR (Duplicate CBMS #) |
| **DBL** | Telecommunications | `Tower Code` (Primary Key) | ERROR (Duplicate Tower Code) |
| **DBL** | Transportation | `Route` + `Vehicle Type` | REVIEW (Duplicate Route Entry) |
| **DBL** | Water | `Account Number` + `Billing Date` | ERROR (Duplicate Billing Record) |
| **ODeSSEE** | Barangay Household Profile | `CBMS#-Ind#` (Primary Key) | ERROR (Duplicate Individual ID) |
| **ODeSSEE** | COVID Cases | `Barangay` + `Facilities` | REVIEW (Duplicate Facility Tally) |
| **ODeSSEE** | Disaster Incident Report | `Report Date` + `Incident` + `Gauging Station` | REVIEW |
| **ODeSSEE** | DRRM Resources | `Group/Team` + `Resources/Equipment` | REVIEW (Duplicate Resource Entry) |
| **ODeSSEE** | Evacuation Sites | `Name of Evacuation Center` + `Barangay` | ERROR (Duplicate Evac Center) |
| **ODeSSEE** | Flood Susceptibility | `Geocode` OR `Barangay Code` + `Purok/Sitio` | REVIEW |
| **ODeSSEE** | Vulnerability Risk Assessment | `Area of Concern` + `Barangay Name` + `Purok/Sitio` | REVIEW |

---

## 6. Template Conversion Engine Specifications

When a user uploads an older version of a template or a partially populated dataset (e.g. Water template missing `Street` and `Purok` columns):
1. **Column Mapping & Alignment:**
   - Case-insensitive and alias-aware header matching.
   - Identified existing columns are mapped to the current official template positions.
2. **Missing Column Insertion:**
   - Any missing official columns are generated at their exact expected template position.
   - Values in newly added columns are left **explicitly blank** (`""` / `null`).
   - The system **NEVER** fabricates placeholder values like `"N/A"`, `"Unknown"`, or `"Barangay 1"`.
3. **Data Quality Status:**
   - If missing columns are optional, rows remain valid with warnings.
   - If missing columns are mandatory, rows are flagged with **ERROR (Missing Mandatory Field)** for user population during the review stage.

---

## 7. Audit Trail and Export Specification

### 7.1 Cleaned Data Export (`.xlsx`)
- Single or primary sheet named exactly according to official specification (e.g. `Data` for DBL, or official sheet name).
- Exact header naming and column order matching the current template.
- Blank cells preserved where data is genuinely absent.

### 7.2 Cleaning Report Export (`.xlsx`)
Exported alongside the cleaned data to provide full transparency to training facilitators and LGU supervisors.
Columns:
1. `Row Number`: Spreadsheet row number (1-indexed).
2. `Field / Column`: Official column header.
3. `Original Value`: Exactly as uploaded.
4. `Final Value`: After all automated fixes and human approvals.
5. `Issue Detected`: Description of problem (e.g., "Trailing whitespace", "Missing required field", "Malformed date").
6. `Action Taken`: Action performed (e.g., "Trimmed whitespace", "User manually entered value", "Format converted to ISO").
7. `Status`: `AUTO-FIX`, `REVIEW (APPROVED)`, `REVIEW (KEPT ORIGINAL)`, `MANUALLY EDITED`, or `UNRESOLVED ERROR`.
