# TEMPLATE QUESTIONS AND CONFLICT LOG
## DBL & ODeSSEE Data Cleaning and Preparation Tool
**Document Version:** 1.0.0  
**Status:** Pending Project-Team Clarification & Confirmation  
**Primary Reference:** `dbl template/` and `odessee template/` actual Excel workbooks

---

## 1. Overview of Template Inspection Findings

During systematic analysis of the 15 official Excel templates, significant discrepancies were discovered between the **Data / Import Sheets** (the actual data ingestion tables) and the **Instructions Sheets** (the user documentation tables).

In accordance with user requirements:
> *"If an Instructions sheet conflicts with the actual import/Data sheet, FLAG THE CONFLICT instead of silently deciding which one is correct. Use the actual import sheet structure as the primary structural reference, but document any conflict requiring project-team confirmation."*

This document provides the exhaustive registry of all conflicts, structural anomalies, typos, and open questions requiring project-team confirmation.

---

## 2. Critical Conflicts (System Discrepancies)

### Q1. ODeSSEE Barangay Household Profile: Microdata vs. Aggregate Census
- **Workbook:** `odessee template/Barangay Household Profile Import Template.xlsx`
- **Data Sheet Name:** `Barangay Population Import Temp`
- **Data Sheet Structure (9 Columns):**
  1. `CBMS#-Ind#` (Individual/Household Identifier)
  2. `Gender`
  3. `Civil Status`
  4. `Barangay`
  5. `Purok/Zone`
  6. `Solo Parent(Y/N)`
  7. `Birth Date`
  8. `Disability`
  9. `Income Classification`
- **Instructions Sheet Structure (22 Columns):**
  - Defines aggregate Barangay demographic summaries: `Barangay Name`, `Total Population`, `Total Male`, `Total Female`, `Total Single`, `Total Married`, `Total Widowed`, `Total Solo Parent`, `Age 0 to 12 years`, `Age 13 to 18 years`, `Age 19 to 59 years`, `Age 60 years and above`, plus 10 specific aggregate disability count columns (`Disability: Psychosocial Disability`, `Disability: Learning Disability`, etc.).
- **Impact & Conflict:**
  The Data sheet is **individual-level microdata** (one row per citizen/respondent), whereas the Instructions sheet specifies an **aggregate census summary** (one row per barangay with demographic sums).
- **Primary Reference Applied:** Data sheet (9 columns).
- **Questions for Project Team:**
  1. Does ODeSSEE import microdata (9 cols) or aggregate barangay summaries (22 cols)?
  2. If both import formats are used in different modules of ODeSSEE, should the tool support both as two distinct template variants (e.g., `ODeSSEE - Barangay Household (Microdata)` and `ODeSSEE - Barangay Population (Aggregate)`)?

---

### Q2. ODeSSEE COVID Cases: Aggregate Facility Tally vs. 40-Column Epidemiologic Line-List
- **Workbook:** `odessee template/COVID Cases Import Template.xlsx`
- **Data Sheet Name:** `Covid Cases Import Template`
- **Data Sheet Structure (3 Columns):**
  1. `Barangay`
  2. `Facilities`
  3. `Total Number of Case`
- **Instructions Sheet Structure (40 Columns):**
  - Defines full epidemiologic surveillance line-listing: `Barangay`, `CV Number`, `Facility Name`, `Latitude`, `Longitude`, `Birth Date`, `Sex`, `Civil Status`, `Nationality`, `Classification`, `Health Care Worker`, `Occupation`, `Industry`, `Occupation Classification`, `Travel History 14 Days`, `Travel History 14 Days Date From`, `Travel History 14 Days From Location`, `Travel History 14 Days To Location`, `Current Health Status`, 8 symptom columns (`Fever`, `Cough`, `Cold`, `Sore Throat`, `Respiratory Infection`, `Diarrhea`, `Other Symptoms`, `Specify Symptom`), 7 comorbidity columns (`Hypertension`, `Diabetes`, `Tuberculosis`, `Cancer`, `Renal Disease`, `Cardiac Disease`, `Autoimmune Disease`, `Pregnant`, `High Risk Pregnancy`, `Other Condition Comorbidity`), `Quarantine`, `Place Of Quarantine`, `Date Time Specimen Collected`.
- **Impact & Conflict:**
  The Data sheet is a 3-column high-level aggregate summary per facility, while the Instructions sheet represents a 40-column patient investigation form.
- **Primary Reference Applied:** Data sheet (3 columns).
- **Questions for Project Team:**
  1. Is the actual production importer expecting the 3-column facility aggregate or the 40-column individual patient line-list?
  2. Should DataClean support both schemas as selectable dataset options?

---

### Q3. ODeSSEE Disaster Incident Report: Multi-Row Merged Headers & Empty Instructions Sheet
- **Workbook:** `odessee template/Disaster Incident Report Template.xlsx`
- **Data Sheet Name:** `Disaster Incident Report`
- **Data Sheet Header Structure:**
  - Row 1: Merged super-headers: Cells D1:F1 contain `"Weather Conditions"`, Cells G1:H1 contain `"Water Level"`. Other columns are empty in Row 1.
  - Row 2: Contains the actual field headers:
    1. `Report Date`
    2. `Incident`
    3. `Incident Date (Date Range)`
    4. `Sky Condition`
    5. `Wind`
    6. `Precipitation`
    7. `Gauging Station`
    8. `Current Level`
    9. `Areas Likely to be Affected`
    10. `Casualty`
- **Instructions Sheet:**
  - Row 1: `['Column', 'Data Types', 'Rules', 'Example']`
  - Rows 2+: **COMPLETELY EMPTY**. No field definitions, data types, rules, or examples are provided.
- **Impact & Conflict:**
  Standard single-row spreadsheet importers will fail if they read Row 1. Furthermore, validation rules (allowed incidents, date formats for ranges, numeric vs text units for casualty/water level) are undocumented in the workbook.
- **Questions for Project Team:**
  1. Does the ODeSSEE production importer expect Row 1 (merged super-headers) to be present, or should the exported template have Row 1 as the exact 10 column headers?
  2. What is the standard syntax for `Incident Date (Date Range)` (e.g. `YYYY-MM-DD to YYYY-MM-DD` vs text description)?
  3. What are the recognized incident categories (e.g., Typhoon, Flood, Flash Flood, Landslide, Earthquake)?

---

### Q4. ODeSSEE Flood Susceptibility Rating: Header Mismatches & Missing Columns
- **Workbook:** `odessee template/Flood Susceptibility Rating Import Template.xlsx`
- **Data Sheet Name:** `Geo Hazard Import Template` (Note: sheet name does not mention "Flood")
- **Data Sheet Columns (13):**
  `Area of Concern`, `Barangay Name`, `Barangay Code`, `Municipality Name`, `Municipality Code`, `Geocode`, `Purok/Sitio`, `Latitude`, `Longitude`, `Susceptibility Rating`, `Flood Height`, `Elevation`, `POI`
- **Instructions Sheet Columns (15):**
  Defines `Point of Interest` (instead of `POI`), plus two additional columns at the end:
  14. `Remarks/Recommendation`
  15. `As of` (Date)
- **Impact & Conflict:**
  - Column 13 name discrepancy: `POI` vs `Point of Interest`.
  - Missing columns: `Remarks/Recommendation` and `As of` are present in instructions but missing from the Data sheet.
- **Questions for Project Team:**
  1. Should the exported file use header `POI` or `Point of Interest`?
  2. Should the official template include `Remarks/Recommendation` and `As of`?

---

### Q5. ODeSSEE Vulnerability Risk Assessment: Hardcoded LGU Sheet Name & Missing Columns
- **Workbook:** `odessee template/Vulnerability Risk Assessment Import Template.xlsx`
- **Data Sheet Name:** `Tuguegarao VRA Import Template` (LGU-specific municipality hardcoded in sheet name)
- **Data Sheet Columns (8):**
  `Area of Concern`, `Barangay Name`, `Purok/Sitio`, `Geocode`, `Latitude`, `Longitude`, `Susceptibility Rating`, `Concern Category`
- **Instructions Sheet Columns (10):**
  Includes the 8 columns above, plus:
  9. `Remarks/Recommendation`
  10. `As of` (Date)
- **Impact & Conflict:**
  - Hardcoded sheet name: If an LGU from another municipality (e.g., Cauayan, Ilagan, Santiago) uploads this, having `Tuguegarao` hardcoded may cause confusion or system rejection if the backend validates sheet names.
  - Missing columns: `Remarks/Recommendation` and `As of` are in instructions but missing from Data sheet.
- **Questions for Project Team:**
  1. Should the sheet name be standardized to a generic name (e.g., `VRA Import Template` or `Data`)?
  2. Should `Remarks/Recommendation` and `As of` be added to the official template?

---

### Q6. ODeSSEE Evacuation Sites: Truncated Sheet Name & Trailing Whitespace in Header
- **Workbook:** `odessee template/Evacuation Sites Import Template.xlsx`
- **Data Sheet Name:** `Evacuation Sites Import Templat` (Notice the missing trailing letter `'e'`)
- **Column 1 Header in Data Sheet:** `'Name of Evacuation Center '` (contains a trailing space: 26 characters)
- **Column 1 Header in Instructions Sheet:** `'Name of Evacuation Center'` (no trailing space: 25 characters)
- **Instructions Example Typo:** In row 15 `Water Source/s`, example is `"Deep well, Water Tana"`.
- **Questions for Project Team:**
  1. Does the backend parser strictly require sheet name `Evacuation Sites Import Templat` (with truncated 't')?
  2. Should the column header be trimmed to `'Name of Evacuation Center'` without trailing space in official exports?
  3. In `Water Source/s`, is `"Water Tana"` a typo for `"Water Tank"`?

---

## 3. DBL Formatting & Schema Clarifications

### Q7. DBL Business: Date Format Specification in Header `(mm/dd/yy)`
- **Workbook:** `dbl template/business-template.xlsx`
- **Header:** `Registration Date (mm/dd/yy)`
- **Conflict:**
  All other DBL templates mandate `YYYY-MM-DD` (ISO 8601 with 4-digit year). The Business header explicitly asks for `(mm/dd/yy)` (e.g. `11/18/26`), which creates 2-digit year ambiguity (e.g., 1926 vs 2026).
- **Questions for Project Team:**
  1. Should DataClean export `YYYY-MM-DD` (full ISO date) or format strictly as `MM/DD/YY`?
  2. Should the header remain `Registration Date (mm/dd/yy)` even if full 4-digit years are stored?

---

### Q8. DBL Transportation: Multi-Purok Delimiter Syntax
- **Workbook:** `dbl template/transportation-template.xlsx`
- **Field:** `Puroks Covered by Route`
- **Instruction Example:** `Barangay 1 :: Purok 1, Barangay 2 :: Purok 1,`
- **Questions for Project Team:**
  1. Is the `::` delimiter strictly required between Barangay and Purok in this field?
  2. Should trailing commas be stripped?

---

### Q9. PSA Master Geographic & Classification Dictionaries
- **Templates:** All DBL templates reference PSA PSGC (Barangays), PSA PSIC (Industrial Classifications), and PSA PSCCS (Crime Classifications).
- **Questions for Project Team:**
  1. Will the project team provide official JSON/CSV lookup tables for the target LGUs' specific PSGC barangays?
  2. If an LGU uses a colloquial barangay name not in PSGC, should DataClean flag it as **REVIEW** or **ERROR**?

---

## 4. Summary Table of Template Ambiguities & Fallback Stance

| # | Dataset | Ambiguity / Conflict | Fallback Stance in DataClean V1 |
| :-: | :--- | :--- | :--- |
| 1 | ODeSSEE Household | Data sheet (9 cols microdata) vs Instructions (22 cols aggregate) | Use Data sheet structure (9 cols microdata); flag conflict in UI. |
| 2 | ODeSSEE COVID | Data sheet (3 cols aggregate) vs Instructions (40 cols line-list) | Use Data sheet structure (3 cols); flag conflict in UI. |
| 3 | ODeSSEE Disaster | Row 1 merged headers; Instructions sheet empty | Read headers from Row 2; provide standard date/text validations. |
| 4 | ODeSSEE Flood | Header `POI` vs `Point of Interest`; 2 missing cols in Data sheet | Use `POI` matching Data sheet; accept `Point of Interest` as alias. |
| 5 | ODeSSEE VRA | Hardcoded `Tuguegarao` sheet name; 2 missing cols in Data sheet | Preserve Data sheet columns; accept any sheet matching VRA headers. |
| 6 | ODeSSEE Evacuation | Truncated sheet name `...Templat`; trailing space in col 1 header | Auto-trim whitespace from headers; preserve sheet name compatibility. |
| 7 | DBL Business | Header states `(mm/dd/yy)` vs system standard `YYYY-MM-DD` | Parse any date safely; format as ISO `YYYY-MM-DD` or `MM/DD/YY`. |
| 8 | DBL Transportation | Delimiter `::` and trailing commas in `Puroks Covered by Route` | Normalize spacing around `::`; strip invalid trailing commas. |
