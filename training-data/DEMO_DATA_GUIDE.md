# DataClean — Training & Demonstration Dataset Package Guide
## Capacity Building for DBL & ODeSSEE Data Cleaning & Official Population (3-Status Model)

> **DISCLAIMER & NOTICE**  
> All records in this training package are **100% fictional demonstration data**.  
> These files do **NOT** contain or copy any personal, household, business, or public utility records from any actual Local Government Unit.  
> Used strictly for instructional demonstration of DataClean's **Fix All Automatically** and **Must Be Fixed** resolution workflows.
> 
> **3-Status Model Compliance**:
> 1. ✅ **VALID** — Complies with the official template and all validation rules. Zero action required.
> 2. ✨ **AUTO-FIX AVAILABLE** — Contains only deterministic formatting or standardization problems that DataClean can resolve automatically.
> 3. ❌ **MUST BE FIXED** — Contains blocking problems (missing required values, prohibited negative values, out-of-range coordinates/dates, duplicates) requiring human correction.
> 
> *There is NO "Needs Review" category in DataClean.*

---

## 1. Master Training Demonstration Files

All 15 official training demo datasets contain **exactly 25 records**:
- **Records 1–12**: ✅ **Valid** (12 rows)
- **Records 13–21**: ✨ **Auto-Fix Available** (9 rows)
- **Records 22–25**: ❌ **Must Be Fixed** (4 rows)

### Primary Training Demo Files (Direct Access):
| System | Dataset | Training Demo File | Relative Path |
|---|---|---|---|
| **DBL** | Business | `DBL_Business_Training_Demo.xlsx` | `training-data/DBL_Business_Training_Demo.xlsx` |
| **DBL** | Crime | `DBL_Crime_Training_Demo.xlsx` | `training-data/DBL_Crime_Training_Demo.xlsx` |
| **DBL** | Human Resource | `DBL_HumanResource_Training_Demo.xlsx` | `training-data/DBL_HumanResource_Training_Demo.xlsx` |
| **DBL** | Power | `DBL_Power_Training_Demo.xlsx` | `training-data/DBL_Power_Training_Demo.xlsx` |
| **DBL** | Residential | `DBL_Residential_Training_Demo.xlsx` | `training-data/DBL_Residential_Training_Demo.xlsx` |
| **DBL** | Telecommunication Towers | `DBL_Telecommunication_Training_Demo.xlsx` | `training-data/DBL_Telecommunication_Training_Demo.xlsx` |
| **DBL** | Transportation | `DBL_Transportation_Training_Demo.xlsx` | `training-data/DBL_Transportation_Training_Demo.xlsx` |
| **DBL** | Water | `DBL_Water_Training_Demo.xlsx` | `training-data/DBL_Water_Training_Demo.xlsx` |
| **ODeSSEE** | Barangay Household Profile | `ODeSSEE_Household_Training_Demo.xlsx` | `training-data/ODeSSEE_Household_Training_Demo.xlsx` |
| **ODeSSEE** | COVID Cases | `ODeSSEE_COVID_Training_Demo.xlsx` | `training-data/ODeSSEE_COVID_Training_Demo.xlsx` |
| **ODeSSEE** | Disaster Incident Report | `ODeSSEE_DisasterIncident_Training_Demo.xlsx` | `training-data/ODeSSEE_DisasterIncident_Training_Demo.xlsx` |
| **ODeSSEE** | DRRM Resources | `ODeSSEE_DRRMResources_Training_Demo.xlsx` | `training-data/ODeSSEE_DRRMResources_Training_Demo.xlsx` |
| **ODeSSEE** | Evacuation Sites | `ODeSSEE_EvacuationSites_Training_Demo.xlsx` | `training-data/ODeSSEE_EvacuationSites_Training_Demo.xlsx` |
| **ODeSSEE** | Flood Susceptibility Rating | `ODeSSEE_FloodSusceptibility_Training_Demo.xlsx` | `training-data/ODeSSEE_FloodSusceptibility_Training_Demo.xlsx` |
| **ODeSSEE** | Vulnerability Risk Assessment | `ODeSSEE_VRA_Training_Demo.xlsx` | `training-data/ODeSSEE_VRA_Training_Demo.xlsx` |

---

## 2. Master Package Summary Table (Verified by DataClean Validation Engine)

| # | System | Dataset Name | Total Records | Initial State (On Upload) | After "Fix All Automatically" | After Human Correction |
|---|---|---|---|---|---|---|
| 1 | **DBL** | Business | 25 | Valid: 12, Auto-Fix: 9, Must Fix: 4 | Valid: 21, Cleaned: 9, Must Fix: 4 | Valid: 25, Must Fix: 0 (100% Ready) |
| 2 | **DBL** | Crime | 25 | Valid: 12, Auto-Fix: 9, Must Fix: 4 | Valid: 21, Cleaned: 9, Must Fix: 4 | Valid: 25, Must Fix: 0 (100% Ready) |
| 3 | **DBL** | Human Resource | 25 | Valid: 12, Auto-Fix: 9, Must Fix: 4 | Valid: 21, Cleaned: 9, Must Fix: 4 | Valid: 25, Must Fix: 0 (100% Ready) |
| 4 | **DBL** | Power | 25 | Valid: 12, Auto-Fix: 9, Must Fix: 4 | Valid: 21, Cleaned: 9, Must Fix: 4 | Valid: 25, Must Fix: 0 (100% Ready) |
| 5 | **DBL** | Residential | 25 | Valid: 12, Auto-Fix: 9, Must Fix: 4 | Valid: 21, Cleaned: 9, Must Fix: 4 | Valid: 25, Must Fix: 0 (100% Ready) |
| 6 | **DBL** | Telecommunication Towers | 25 | Valid: 12, Auto-Fix: 9, Must Fix: 4 | Valid: 21, Cleaned: 9, Must Fix: 4 | Valid: 25, Must Fix: 0 (100% Ready) |
| 7 | **DBL** | Transportation | 25 | Valid: 12, Auto-Fix: 9, Must Fix: 4 | Valid: 21, Cleaned: 9, Must Fix: 4 | Valid: 25, Must Fix: 0 (100% Ready) |
| 8 | **DBL** | Water | 25 | Valid: 12, Auto-Fix: 9, Must Fix: 4 | Valid: 21, Cleaned: 9, Must Fix: 4 | Valid: 25, Must Fix: 0 (100% Ready) |
| 9 | **ODeSSEE** | Barangay Household Profile | 25 | Valid: 12, Auto-Fix: 9, Must Fix: 4 | Valid: 21, Cleaned: 9, Must Fix: 4 | Valid: 25, Must Fix: 0 (100% Ready) |
| 10 | **ODeSSEE** | COVID Cases | 25 | Valid: 12, Auto-Fix: 9, Must Fix: 4 | Valid: 21, Cleaned: 9, Must Fix: 4 | Valid: 25, Must Fix: 0 (100% Ready) |
| 11 | **ODeSSEE** | Disaster Incident Report | 25 | Valid: 12, Auto-Fix: 9, Must Fix: 4 | Valid: 21, Cleaned: 9, Must Fix: 4 | Valid: 25, Must Fix: 0 (100% Ready) |
| 12 | **ODeSSEE** | DRRM Resources | 25 | Valid: 12, Auto-Fix: 9, Must Fix: 4 | Valid: 21, Cleaned: 9, Must Fix: 4 | Valid: 25, Must Fix: 0 (100% Ready) |
| 13 | **ODeSSEE** | Evacuation Sites | 25 | Valid: 12, Auto-Fix: 9, Must Fix: 4 | Valid: 21, Cleaned: 9, Must Fix: 4 | Valid: 25, Must Fix: 0 (100% Ready) |
| 14 | **ODeSSEE** | Flood Susceptibility Rating | 25 | Valid: 12, Auto-Fix: 9, Must Fix: 4 | Valid: 21, Cleaned: 9, Must Fix: 4 | Valid: 25, Must Fix: 0 (100% Ready) |
| 15 | **ODeSSEE** | Vulnerability Risk Assessment | 25 | Valid: 12, Auto-Fix: 9, Must Fix: 4 | Valid: 21, Cleaned: 9, Must Fix: 4 | Valid: 25, Must Fix: 0 (100% Ready) |

---

## 3. Recommended Live Demonstration Walkthrough

### Priority 1: DBL Water (5-Minute Live Demo)
**Why:** Water consumption records feature leading-zero customer account numbers, numeric consumption units (`cu.m`), and date standardization.

#### Presenter Workflow:
1. **Select System & Dataset**: On Home screen, select **DBL** $\rightarrow$ **Water**.
2. **Upload Auto-Fix Demo**: Upload `DBL_Water_Training_Demo.xlsx` (or `training-data/DBL/Water/DBL_Water_AutoFix_Demo.xlsx`).
3. **Inspect Initial Findings (No Automatic Modifications on Upload)**:
   - Total Records: **25**
   - Valid: **12**
   - Auto-Fix Available: **9**
   - Must Be Fixed: **4**
   - Title: **"Action Required"**
4. **Click "Fix All Automatically"**:
   - DataClean deterministically converts all 9 auto-fix records in one click:
     - Record 13: `" 22.4 cu.m "` $\rightarrow$ `22.4`
     - Record 14: `"01/31/2026"` $\rightarrow$ `"2026-01-31"`
     - Record 15: `"  Rizal   Street  "` $\rightarrow$ `"Rizal Street 15"`
     - Record 16: `"  00045016  "` $\rightarrow$ `"00045016"` (Leading zero strictly preserved)
     - Record 17: `"18.5 cu.m"` $\rightarrow$ `18.5`
     - Record 18: `"05/30/2026"` $\rightarrow$ `"2026-05-30"`
     - Record 19: `"  Barangay Maligaya  "` $\rightarrow$ `"Barangay Maligaya"`
     - Record 20: `"residential"` $\rightarrow$ `"Residential"`
     - Record 21: `"Purok IV"` $\rightarrow$ `"Purok 4"`
   - Valid becomes **21**, Must Be Fixed remains **4**.
   - Notification: *"9 records automatically cleaned. 4 records require user correction."*
5. **Resolve Remaining 4 Issues (Guided Resolution)**:
   - **Record 22**: Fill missing Account Number (`"00045022"`).
   - **Record 23**: Correct negative consumption (`-12.5` $\rightarrow$ `12.5`).
   - **Records 24–25**: Resolve duplicate account number + billing date pair.
6. **Revalidate**:
   - Valid: **25** (100%)
   - Must Be Fixed: **0**
   - Readiness: **Ready for Official Import**

---

## 4. Comprehensive Dataset-by-Dataset Training Guide

### 1. DBL — Business
- **Primary Training Demo File**: `training-data/DBL_Business_Training_Demo.xlsx`
- **Subfolder Reference Files**: `training-data/DBL/Business/`
  - `DBL_Business_Clean_Sample.xlsx` (Clean reference sample, 25 records)
  - `DBL_Business_AutoFix_Demo.xlsx` (Auto-fix demo sample, 25 records)
  - `DBL_Business_Expected_Cleaned.xlsx` (Expected cleaned result, 25 records)

#### Records 1–12 — Valid (12 Records)
Records 1 through 12 are 100% valid and comply fully with official template standards, correct data types, valid coordinates/dates, and unique identifiers. Zero action required.

#### Records 13–21 — Auto-Fix Available (9 Records)
These records contain only safe, deterministic formatting issues supported by DataClean's auto-cleaner. They are preserved intact upon upload and resolved when the user clicks **"Fix All Automatically"**.

| Record # | Expected Status | Field With Issue | Original Value | Expected Auto-Fix | Rule Triggered |
|---|---|---|---|---|---|
| **Record 13** (Row 14) | ✨ AUTO-FIX AVAILABLE | `Gross Sales` | `₱320,000.00` | `320000` | `STRIP_CURRENCY` — Stripped currency symbol and comma formatting to 320000 |
| **Record 14** (Row 15) | ✨ AUTO-FIX AVAILABLE | `Permit Status` | `renewal` | `Renewal` | `NORMALIZE_CATEGORY_CASE` — Normalized category casing to official standard "Renewal" |
| **Record 15** (Row 16) | ✨ AUTO-FIX AVAILABLE | `Street` | `  Rizal   Street  ` | `Rizal Street 15` | `COLLAPSE_WHITESPACE` — Trimmed and collapsed repeated spaces |
| **Record 16** (Row 17) | ✨ AUTO-FIX AVAILABLE | `Business Trade Name` | `  ESTABLISHMENT DELTA 16  ` | `ESTABLISHMENT DELTA 16` | `TRIM_WHITESPACE` — Trimmed leading/trailing whitespace |
| **Record 17** (Row 18) | ✨ AUTO-FIX AVAILABLE | `Gross Sales` | `₱450,000.00` | `450000` | `STRIP_CURRENCY` — Stripped currency symbol and formatting to 450000 |
| **Record 18** (Row 19) | ✨ AUTO-FIX AVAILABLE | `Registration Date (mm/dd/yy)` | `05/30/2024` | `2024-05-30` | `NORMALIZE_DATE` — Normalized MM/DD/YYYY to ISO date YYYY-MM-DD |
| **Record 19** (Row 20) | ✨ AUTO-FIX AVAILABLE | `Permit Status` | `new` | `New` | `NORMALIZE_CATEGORY_CASE` — Normalized category casing to official standard "New" |
| **Record 20** (Row 21) | ✨ AUTO-FIX AVAILABLE | `Barangay` | `  Barangay Maligaya  ` | `Barangay Maligaya` | `TRIM_WHITESPACE` — Trimmed leading/trailing spaces |
| **Record 21** (Row 22) | ✨ AUTO-FIX AVAILABLE | `Purok` | `Purok IV` | `Purok 4` | `PUROK_ROMAN_NUMERAL` — Standardized Roman numeral Purok IV to Arabic Purok 4 |

#### Records 22–25 — Must Be Fixed (4 Records)
These records contain blocking issues that cannot be guessed or fabricated automatically. They require explicit human intervention before official import.

| Record # | Expected Status | Field With Issue | Original Value | Required Human Action | Rule Triggered | Blocking Reason |
|---|---|---|---|---|---|---|
| **Record 22** (Row 23) | ❌ MUST BE FIXED | `Business Trade Name` | `(blank)` | User must enter official registered business trade name. | `REQUIRED_FIELD_MISSING` | Business permit cannot be issued to an anonymous enterprise; missing name blocks registry ingestion. |
| **Record 23** (Row 24) | ❌ MUST BE FIXED | `Gross Sales` | `-250000` | User must review financial declaration and enter positive gross sales figure. | `NEGATIVE_NUMBER_NOT_ALLOWED` | Reported commercial gross receipts cannot be negative. |
| **Record 24** (Row 25) | ❌ MUST BE FIXED | `Business Trade Name + Street + Barangay` | `ESTABLISHMENT DELTA DUP | Maharlika Highway 24 | Barangay Centro` | User must verify if distinct physical branch or merge/remove duplicate record. | `DUPLICATE_COMPOSITE_KEY` | Duplicate trade name at identical municipal address creates duplicate tax rolls. |
| **Record 25** (Row 26) | ❌ MUST BE FIXED | `Business Trade Name + Street + Barangay` | `ESTABLISHMENT DELTA DUP | Maharlika Highway 24 | Barangay Centro` | User must verify if distinct physical branch or merge/remove duplicate record. | `DUPLICATE_COMPOSITE_KEY` | Duplicate trade name at identical municipal address creates duplicate tax rolls. |

#### Verification Lifecycle for Business:
- **Initial Upload**: 12 Valid, 9 Auto-Fix Available, 4 Must Be Fixed (Status: Action Required)
- **Click "Fix All Automatically"**: 21 Valid, 0 Auto-Fix Available, 4 Must Be Fixed, 9 Auto-Cleaned
- **Manual Correction**: 25 Valid, 0 Must Be Fixed (100% Ready for Official Import)

### 2. DBL — Crime
- **Primary Training Demo File**: `training-data/DBL_Crime_Training_Demo.xlsx`
- **Subfolder Reference Files**: `training-data/DBL/Crime/`
  - `DBL_Crime_Clean_Sample.xlsx` (Clean reference sample, 25 records)
  - `DBL_Crime_AutoFix_Demo.xlsx` (Auto-fix demo sample, 25 records)
  - `DBL_Crime_Expected_Cleaned.xlsx` (Expected cleaned result, 25 records)

#### Records 1–12 — Valid (12 Records)
Records 1 through 12 are 100% valid and comply fully with official template standards, correct data types, valid coordinates/dates, and unique identifiers. Zero action required.

#### Records 13–21 — Auto-Fix Available (9 Records)
These records contain only safe, deterministic formatting issues supported by DataClean's auto-cleaner. They are preserved intact upon upload and resolved when the user clicks **"Fix All Automatically"**.

| Record # | Expected Status | Field With Issue | Original Value | Expected Auto-Fix | Rule Triggered |
|---|---|---|---|---|---|
| **Record 13** (Row 14) | ✨ AUTO-FIX AVAILABLE | `Blotter Number` | `  BLT-2026-000013  ` | `BLT-2026-000013` | `TRIM_WHITESPACE` — Trimmed surrounding whitespace |
| **Record 14** (Row 15) | ✨ AUTO-FIX AVAILABLE | `Complainant Gender` | `male` | `Male` | `NORMALIZE_CATEGORY_CASE` — Normalized gender casing to "Male" |
| **Record 15** (Row 16) | ✨ AUTO-FIX AVAILABLE | `Respondent Gender` | `female` | `Female` | `NORMALIZE_CATEGORY_CASE` — Normalized gender casing to "Female" |
| **Record 16** (Row 17) | ✨ AUTO-FIX AVAILABLE | `Street` | `  Rizal   Street   ` | `Rizal Street 16` | `COLLAPSE_WHITESPACE` — Collapsed internal spaces |
| **Record 17** (Row 18) | ✨ AUTO-FIX AVAILABLE | `Datetime Reported` | `02/14/2026 16:00:00` | `2026-02-14 16:00:00` | `NORMALIZE_DATETIME` — Normalized MM/DD/YYYY datetime to ISO |
| **Record 18** (Row 19) | ✨ AUTO-FIX AVAILABLE | `Datetime Committed` | `02/15/2026 10:00:00` | `2026-02-15 10:00:00` | `NORMALIZE_DATETIME` — Normalized MM/DD/YYYY datetime to ISO |
| **Record 19** (Row 20) | ✨ AUTO-FIX AVAILABLE | `Barangay` | `  Barangay Riverside  ` | `Barangay Riverside` | `TRIM_WHITESPACE` — Trimmed leading/trailing spaces |
| **Record 20** (Row 21) | ✨ AUTO-FIX AVAILABLE | `Violation Name` | `  Noise   Disturbance  ` | `Noise Disturbance` | `COLLAPSE_WHITESPACE` — Trimmed and collapsed whitespace |
| **Record 21** (Row 22) | ✨ AUTO-FIX AVAILABLE | `Purok` | `Purok III` | `Purok 3` | `PUROK_ROMAN_NUMERAL` — Standardized Roman numeral Purok III to Arabic Purok 3 |

#### Records 22–25 — Must Be Fixed (4 Records)
These records contain blocking issues that cannot be guessed or fabricated automatically. They require explicit human intervention before official import.

| Record # | Expected Status | Field With Issue | Original Value | Required Human Action | Rule Triggered | Blocking Reason |
|---|---|---|---|---|---|---|
| **Record 22** (Row 23) | ❌ MUST BE FIXED | `Blotter Number` | `(blank)` | User must input official police blotter incident tracking code. | `REQUIRED_FIELD_MISSING` | Police blotter entry without incident tracking code is invalid in justice records. |
| **Record 23** (Row 24) | ❌ MUST BE FIXED | `Latitude` | `-95.5` | User must verify incident GPS coordinate and enter valid latitude between -90 and 90. | `INVALID_LATITUDE` | Coordinate exceeds mathematical range (-90 to 90) and blocks GIS mapping. |
| **Record 24** (Row 25) | ❌ MUST BE FIXED | `Blotter Number` | `BLT-2026-000999` | User must resolve conflicting blotter records and remove duplicate. | `DUPLICATE_COMPOSITE_KEY` | Blotter numbers must uniquely identify single police incidents. |
| **Record 25** (Row 26) | ❌ MUST BE FIXED | `Blotter Number` | `BLT-2026-000999` | User must resolve conflicting blotter records and remove duplicate. | `DUPLICATE_COMPOSITE_KEY` | Blotter numbers must uniquely identify single police incidents. |

#### Verification Lifecycle for Crime:
- **Initial Upload**: 12 Valid, 9 Auto-Fix Available, 4 Must Be Fixed (Status: Action Required)
- **Click "Fix All Automatically"**: 21 Valid, 0 Auto-Fix Available, 4 Must Be Fixed, 9 Auto-Cleaned
- **Manual Correction**: 25 Valid, 0 Must Be Fixed (100% Ready for Official Import)

### 3. DBL — Human Resource
- **Primary Training Demo File**: `training-data/DBL_HumanResource_Training_Demo.xlsx`
- **Subfolder Reference Files**: `training-data/DBL/Human-Resource/`
  - `DBL_Human_Resource_Clean_Sample.xlsx` (Clean reference sample, 25 records)
  - `DBL_Human_Resource_AutoFix_Demo.xlsx` (Auto-fix demo sample, 25 records)
  - `DBL_Human_Resource_Expected_Cleaned.xlsx` (Expected cleaned result, 25 records)

#### Records 1–12 — Valid (12 Records)
Records 1 through 12 are 100% valid and comply fully with official template standards, correct data types, valid coordinates/dates, and unique identifiers. Zero action required.

#### Records 13–21 — Auto-Fix Available (9 Records)
These records contain only safe, deterministic formatting issues supported by DataClean's auto-cleaner. They are preserved intact upon upload and resolved when the user clicks **"Fix All Automatically"**.

| Record # | Expected Status | Field With Issue | Original Value | Expected Auto-Fix | Rule Triggered |
|---|---|---|---|---|---|
| **Record 13** (Row 14) | ✨ AUTO-FIX AVAILABLE | `Student Number` | `  00098013  ` | `00098013` | `TRIM_WHITESPACE` — Trimmed whitespace while keeping leading zeros |
| **Record 14** (Row 15) | ✨ AUTO-FIX AVAILABLE | `Gender` | `male` | `Male` | `NORMALIZE_CATEGORY_CASE` — Normalized gender casing to "Male" |
| **Record 15** (Row 16) | ✨ AUTO-FIX AVAILABLE | `Graduation Year` | ` 2026 ` | `2026` | `CONVERT_TO_NUMBER` — Casts whitespace-padded string to integer 2026 |
| **Record 16** (Row 17) | ✨ AUTO-FIX AVAILABLE | `School` | `  Isabela   State   University  ` | `Isabela State University` | `COLLAPSE_WHITESPACE` — Collapsed redundant whitespace |
| **Record 17** (Row 18) | ✨ AUTO-FIX AVAILABLE | `Course` | `  BS   Information   Technology  ` | `BS Information Technology` | `COLLAPSE_WHITESPACE` — Collapsed internal spaces |
| **Record 18** (Row 19) | ✨ AUTO-FIX AVAILABLE | `Gender` | `female` | `Female` | `NORMALIZE_CATEGORY_CASE` — Normalized gender casing to "Female" |
| **Record 19** (Row 20) | ✨ AUTO-FIX AVAILABLE | `Street` | `  Mabini   Street  ` | `Mabini Street 19` | `COLLAPSE_WHITESPACE` — Trimmed and collapsed spaces |
| **Record 20** (Row 21) | ✨ AUTO-FIX AVAILABLE | `Barangay` | `  Barangay Maligaya  ` | `Barangay Maligaya` | `TRIM_WHITESPACE` — Trimmed leading/trailing spaces |
| **Record 21** (Row 22) | ✨ AUTO-FIX AVAILABLE | `Purok` | `Purok II` | `Purok 2` | `PUROK_ROMAN_NUMERAL` — Standardized Roman numeral Purok II to Arabic Purok 2 |

#### Records 22–25 — Must Be Fixed (4 Records)
These records contain blocking issues that cannot be guessed or fabricated automatically. They require explicit human intervention before official import.

| Record # | Expected Status | Field With Issue | Original Value | Required Human Action | Rule Triggered | Blocking Reason |
|---|---|---|---|---|---|---|
| **Record 22** (Row 23) | ❌ MUST BE FIXED | `Student Number` | `(blank)` | User must enter official student ID number. | `REQUIRED_FIELD_MISSING` | Student profile cannot be ingested into scholarship registry without identifier. |
| **Record 23** (Row 24) | ❌ MUST BE FIXED | `Graduation Year` | `1940` | User must verify student record and enter valid calendar graduation year (1950–2050). | `INVALID_GRADUATION_YEAR` | Year 1940 falls outside the municipal higher-education operational range. |
| **Record 24** (Row 25) | ❌ MUST BE FIXED | `Student Number` | `00098999` | User must verify student identity and remove duplicate entry. | `DUPLICATE_COMPOSITE_KEY` | Duplicate student records cause double-counting in municipal education statistics. |
| **Record 25** (Row 26) | ❌ MUST BE FIXED | `Student Number` | `00098999` | User must verify student identity and remove duplicate entry. | `DUPLICATE_COMPOSITE_KEY` | Duplicate student records cause double-counting in municipal education statistics. |

#### Verification Lifecycle for Human Resource:
- **Initial Upload**: 12 Valid, 9 Auto-Fix Available, 4 Must Be Fixed (Status: Action Required)
- **Click "Fix All Automatically"**: 21 Valid, 0 Auto-Fix Available, 4 Must Be Fixed, 9 Auto-Cleaned
- **Manual Correction**: 25 Valid, 0 Must Be Fixed (100% Ready for Official Import)

### 4. DBL — Power
- **Primary Training Demo File**: `training-data/DBL_Power_Training_Demo.xlsx`
- **Subfolder Reference Files**: `training-data/DBL/Power/`
  - `DBL_Power_Clean_Sample.xlsx` (Clean reference sample, 25 records)
  - `DBL_Power_AutoFix_Demo.xlsx` (Auto-fix demo sample, 25 records)
  - `DBL_Power_Expected_Cleaned.xlsx` (Expected cleaned result, 25 records)

#### Records 1–12 — Valid (12 Records)
Records 1 through 12 are 100% valid and comply fully with official template standards, correct data types, valid coordinates/dates, and unique identifiers. Zero action required.

#### Records 13–21 — Auto-Fix Available (9 Records)
These records contain only safe, deterministic formatting issues supported by DataClean's auto-cleaner. They are preserved intact upon upload and resolved when the user clicks **"Fix All Automatically"**.

| Record # | Expected Status | Field With Issue | Original Value | Expected Auto-Fix | Rule Triggered |
|---|---|---|---|---|---|
| **Record 13** (Row 14) | ✨ AUTO-FIX AVAILABLE | `Consumption` | ` 350.2 kwh ` | `350.2` | `REMOVE_UNIT` — Strips "kwh" suffix and whitespace to float 350.2 |
| **Record 14** (Row 15) | ✨ AUTO-FIX AVAILABLE | `Billing Date` | `01/30/2026` | `2026-01-30` | `NORMALIZE_DATE` — Normalizes MM/DD/YYYY to ISO date YYYY-MM-DD |
| **Record 15** (Row 16) | ✨ AUTO-FIX AVAILABLE | `Account Number` | `  00029015  ` | `00029015` | `TRIM_WHITESPACE` — Trims whitespace while preserving leading zeros |
| **Record 16** (Row 17) | ✨ AUTO-FIX AVAILABLE | `Consumption` | `210.5 kwh` | `210.5` | `REMOVE_UNIT` — Strips "kwh" unit suffix to float 210.5 |
| **Record 17** (Row 18) | ✨ AUTO-FIX AVAILABLE | `Street` | `  National   Road  ` | `National Road 17` | `COLLAPSE_WHITESPACE` — Collapsed internal whitespace |
| **Record 18** (Row 19) | ✨ AUTO-FIX AVAILABLE | `Billing Date` | `03/30/2026` | `2026-03-30` | `NORMALIZE_DATE` — Normalizes slashed date to ISO date |
| **Record 19** (Row 20) | ✨ AUTO-FIX AVAILABLE | `Consumption` | ` 420.0 kwh ` | `420` | `REMOVE_UNIT` — Strips "kwh" unit suffix to float 420.0 |
| **Record 20** (Row 21) | ✨ AUTO-FIX AVAILABLE | `Barangay` | `  Barangay Maligaya  ` | `Barangay Maligaya` | `TRIM_WHITESPACE` — Trimmed whitespace from barangay |
| **Record 21** (Row 22) | ✨ AUTO-FIX AVAILABLE | `Purok` | `Purok I` | `Purok 1` | `PUROK_ROMAN_NUMERAL` — Standardized Roman numeral Purok I to Arabic Purok 1 |

#### Records 22–25 — Must Be Fixed (4 Records)
These records contain blocking issues that cannot be guessed or fabricated automatically. They require explicit human intervention before official import.

| Record # | Expected Status | Field With Issue | Original Value | Required Human Action | Rule Triggered | Blocking Reason |
|---|---|---|---|---|---|---|
| **Record 22** (Row 23) | ❌ MUST BE FIXED | `Account Number` | `(blank)` | User must enter customer electric utility account number. | `REQUIRED_FIELD_MISSING` | Power billing record without customer account cannot be linked to utility meter. |
| **Record 23** (Row 24) | ❌ MUST BE FIXED | `Consumption` | `-150.5` | User must inspect meter log and enter positive power consumption in kWh. | `NEGATIVE_NUMBER_NOT_ALLOWED` | Electric energy consumption cannot be negative. |
| **Record 24** (Row 25) | ❌ MUST BE FIXED | `Account Number + Billing Date` | `00029999 | 2026-01-30` | User must verify billing statement cycle and deduplicate. | `DUPLICATE_COMPOSITE_KEY` | Same meter cannot be billed twice for the identical billing period. |
| **Record 25** (Row 26) | ❌ MUST BE FIXED | `Account Number + Billing Date` | `00029999 | 2026-01-30` | User must verify billing statement cycle and deduplicate. | `DUPLICATE_COMPOSITE_KEY` | Same meter cannot be billed twice for the identical billing period. |

#### Verification Lifecycle for Power:
- **Initial Upload**: 12 Valid, 9 Auto-Fix Available, 4 Must Be Fixed (Status: Action Required)
- **Click "Fix All Automatically"**: 21 Valid, 0 Auto-Fix Available, 4 Must Be Fixed, 9 Auto-Cleaned
- **Manual Correction**: 25 Valid, 0 Must Be Fixed (100% Ready for Official Import)

### 5. DBL — Residential
- **Primary Training Demo File**: `training-data/DBL_Residential_Training_Demo.xlsx`
- **Subfolder Reference Files**: `training-data/DBL/Residential/`
  - `DBL_Residential_Clean_Sample.xlsx` (Clean reference sample, 25 records)
  - `DBL_Residential_AutoFix_Demo.xlsx` (Auto-fix demo sample, 25 records)
  - `DBL_Residential_Expected_Cleaned.xlsx` (Expected cleaned result, 25 records)

#### Records 1–12 — Valid (12 Records)
Records 1 through 12 are 100% valid and comply fully with official template standards, correct data types, valid coordinates/dates, and unique identifiers. Zero action required.

#### Records 13–21 — Auto-Fix Available (9 Records)
These records contain only safe, deterministic formatting issues supported by DataClean's auto-cleaner. They are preserved intact upon upload and resolved when the user clicks **"Fix All Automatically"**.

| Record # | Expected Status | Field With Issue | Original Value | Expected Auto-Fix | Rule Triggered |
|---|---|---|---|---|---|
| **Record 13** (Row 14) | ✨ AUTO-FIX AVAILABLE | `CBMS Number` | `  00049013  ` | `00049013` | `TRIM_WHITESPACE` — Trimmed whitespace while keeping leading zeros |
| **Record 14** (Row 15) | ✨ AUTO-FIX AVAILABLE | `Gender` | `female` | `Female` | `NORMALIZE_CATEGORY_CASE` — Normalized gender casing to "Female" |
| **Record 15** (Row 16) | ✨ AUTO-FIX AVAILABLE | `Birth Date` | `08/23/1985` | `1985-08-23` | `NORMALIZE_DATE` — Normalizes MM/DD/YYYY slashed date to ISO YYYY-MM-DD |
| **Record 16** (Row 17) | ✨ AUTO-FIX AVAILABLE | `House No` | `  15-A  ` | `15-A` | `TRIM_WHITESPACE` — Trimmed whitespace from alphanumeric house number |
| **Record 17** (Row 18) | ✨ AUTO-FIX AVAILABLE | `Street` | `  Burgos   Street  ` | `Burgos Street 17` | `COLLAPSE_WHITESPACE` — Collapsed internal spaces |
| **Record 18** (Row 19) | ✨ AUTO-FIX AVAILABLE | `Gender` | `male` | `Male` | `NORMALIZE_CATEGORY_CASE` — Normalized casing to "Male" |
| **Record 19** (Row 20) | ✨ AUTO-FIX AVAILABLE | `Birth Date` | `05/12/1988` | `1988-05-12` | `NORMALIZE_DATE` — Normalizes slashed date to standard ISO date |
| **Record 20** (Row 21) | ✨ AUTO-FIX AVAILABLE | `Barangay` | `  Barangay Maligaya  ` | `Barangay Maligaya` | `TRIM_WHITESPACE` — Trimmed leading/trailing spaces |
| **Record 21** (Row 22) | ✨ AUTO-FIX AVAILABLE | `Purok` | `Purok IV` | `Purok 4` | `PUROK_ROMAN_NUMERAL` — Standardized Roman numeral Purok IV to Arabic Purok 4 |

#### Records 22–25 — Must Be Fixed (4 Records)
These records contain blocking issues that cannot be guessed or fabricated automatically. They require explicit human intervention before official import.

| Record # | Expected Status | Field With Issue | Original Value | Required Human Action | Rule Triggered | Blocking Reason |
|---|---|---|---|---|---|---|
| **Record 22** (Row 23) | ❌ MUST BE FIXED | `CBMS Number` | `(blank)` | User must enter official CBMS household census number. | `REQUIRED_FIELD_MISSING` | Household record cannot be registered without CBMS enumeration ID. |
| **Record 23** (Row 24) | ❌ MUST BE FIXED | `Birth Date` | `2035-01-01` | User must enter valid historical birth date. | `DATE_CANNOT_BE_FUTURE` | Citizen birth date cannot be in the future. |
| **Record 24** (Row 25) | ❌ MUST BE FIXED | `CBMS Number` | `00049999` | User must verify household member roster and deduplicate census profile. | `DUPLICATE_COMPOSITE_KEY` | Duplicate census ID corrupts demographic population counts. |
| **Record 25** (Row 26) | ❌ MUST BE FIXED | `CBMS Number` | `00049999` | User must verify household member roster and deduplicate census profile. | `DUPLICATE_COMPOSITE_KEY` | Duplicate census ID corrupts demographic population counts. |

#### Verification Lifecycle for Residential:
- **Initial Upload**: 12 Valid, 9 Auto-Fix Available, 4 Must Be Fixed (Status: Action Required)
- **Click "Fix All Automatically"**: 21 Valid, 0 Auto-Fix Available, 4 Must Be Fixed, 9 Auto-Cleaned
- **Manual Correction**: 25 Valid, 0 Must Be Fixed (100% Ready for Official Import)

### 6. DBL — Telecommunication Towers
- **Primary Training Demo File**: `training-data/DBL_Telecommunication_Training_Demo.xlsx`
- **Subfolder Reference Files**: `training-data/DBL/Telecommunication/`
  - `DBL_Telecommunication_Clean_Sample.xlsx` (Clean reference sample, 25 records)
  - `DBL_Telecommunication_AutoFix_Demo.xlsx` (Auto-fix demo sample, 25 records)
  - `DBL_Telecommunication_Expected_Cleaned.xlsx` (Expected cleaned result, 25 records)

#### Records 1–12 — Valid (12 Records)
Records 1 through 12 are 100% valid and comply fully with official template standards, correct data types, valid coordinates/dates, and unique identifiers. Zero action required.

#### Records 13–21 — Auto-Fix Available (9 Records)
These records contain only safe, deterministic formatting issues supported by DataClean's auto-cleaner. They are preserved intact upon upload and resolved when the user clicks **"Fix All Automatically"**.

| Record # | Expected Status | Field With Issue | Original Value | Expected Auto-Fix | Rule Triggered |
|---|---|---|---|---|---|
| **Record 13** (Row 14) | ✨ AUTO-FIX AVAILABLE | `Tower Height` | `45.5 m` | `45.5` | `REMOVE_UNIT` — Strips "m" unit suffix to numeric float 45.5 |
| **Record 14** (Row 15) | ✨ AUTO-FIX AVAILABLE | `Installation Date` | `07/14/2021` | `2021-07-14` | `NORMALIZE_DATE` — Normalizes slashed date to ISO YYYY-MM-DD |
| **Record 15** (Row 16) | ✨ AUTO-FIX AVAILABLE | `Tower Code` | `  0098015  ` | `0098015` | `TRIM_WHITESPACE` — Trims whitespace while preserving leading zeros |
| **Record 16** (Row 17) | ✨ AUTO-FIX AVAILABLE | `Location Address` | `  Commercial   Zone   Site  ` | `Commercial Zone Site 16` | `COLLAPSE_WHITESPACE` — Collapsed internal whitespace |
| **Record 17** (Row 18) | ✨ AUTO-FIX AVAILABLE | `Tower Height` | `35.0 m` | `35` | `REMOVE_UNIT` — Strips "m" unit suffix to float 35.0 |
| **Record 18** (Row 19) | ✨ AUTO-FIX AVAILABLE | `Installation Date` | `11/18/2022` | `2022-11-18` | `NORMALIZE_DATE` — Normalizes MM/DD/YYYY to ISO date |
| **Record 19** (Row 20) | ✨ AUTO-FIX AVAILABLE | `Provider Name` | `  Smart Communications  ` | `Smart Communications` | `TRIM_WHITESPACE` — Trimmed leading/trailing spaces |
| **Record 20** (Row 21) | ✨ AUTO-FIX AVAILABLE | `Barangay` | `  Barangay Maligaya  ` | `Barangay Maligaya` | `TRIM_WHITESPACE` — Trimmed whitespace from barangay |
| **Record 21** (Row 22) | ✨ AUTO-FIX AVAILABLE | `Purok` | `Purok III` | `Purok 3` | `PUROK_ROMAN_NUMERAL` — Standardized Roman numeral Purok III to Arabic Purok 3 |

#### Records 22–25 — Must Be Fixed (4 Records)
These records contain blocking issues that cannot be guessed or fabricated automatically. They require explicit human intervention before official import.

| Record # | Expected Status | Field With Issue | Original Value | Required Human Action | Rule Triggered | Blocking Reason |
|---|---|---|---|---|---|---|
| **Record 22** (Row 23) | ❌ MUST BE FIXED | `Tower Code` | `(blank)` | User must enter telecommunication infrastructure asset code. | `REQUIRED_FIELD_MISSING` | Asset registry cannot log tower without unique physical infrastructure ID. |
| **Record 23** (Row 24) | ❌ MUST BE FIXED | `Tower Height` | `-45.0` | User must measure and enter positive tower mast height in meters. | `NEGATIVE_NUMBER_NOT_ALLOWED` | Physical elevation height cannot be negative. |
| **Record 24** (Row 25) | ❌ MUST BE FIXED | `Tower Code` | `0098999` | User must verify cellular site and deduplicate asset entry. | `DUPLICATE_COMPOSITE_KEY` | Duplicate tower code corrupts regional network coverage maps. |
| **Record 25** (Row 26) | ❌ MUST BE FIXED | `Tower Code` | `0098999` | User must verify cellular site and deduplicate asset entry. | `DUPLICATE_COMPOSITE_KEY` | Duplicate tower code corrupts regional network coverage maps. |

#### Verification Lifecycle for Telecommunication Towers:
- **Initial Upload**: 12 Valid, 9 Auto-Fix Available, 4 Must Be Fixed (Status: Action Required)
- **Click "Fix All Automatically"**: 21 Valid, 0 Auto-Fix Available, 4 Must Be Fixed, 9 Auto-Cleaned
- **Manual Correction**: 25 Valid, 0 Must Be Fixed (100% Ready for Official Import)

### 7. DBL — Transportation
- **Primary Training Demo File**: `training-data/DBL_Transportation_Training_Demo.xlsx`
- **Subfolder Reference Files**: `training-data/DBL/Transportation/`
  - `DBL_Transportation_Clean_Sample.xlsx` (Clean reference sample, 25 records)
  - `DBL_Transportation_AutoFix_Demo.xlsx` (Auto-fix demo sample, 25 records)
  - `DBL_Transportation_Expected_Cleaned.xlsx` (Expected cleaned result, 25 records)

#### Records 1–12 — Valid (12 Records)
Records 1 through 12 are 100% valid and comply fully with official template standards, correct data types, valid coordinates/dates, and unique identifiers. Zero action required.

#### Records 13–21 — Auto-Fix Available (9 Records)
These records contain only safe, deterministic formatting issues supported by DataClean's auto-cleaner. They are preserved intact upon upload and resolved when the user clicks **"Fix All Automatically"**.

| Record # | Expected Status | Field With Issue | Original Value | Expected Auto-Fix | Rule Triggered |
|---|---|---|---|---|---|
| **Record 13** (Row 14) | ✨ AUTO-FIX AVAILABLE | `Route` | `  Transport Route Segment 13  ` | `Transport Route Segment 13` | `TRIM_WHITESPACE` — Trimmed surrounding whitespace |
| **Record 14** (Row 15) | ✨ AUTO-FIX AVAILABLE | `Available Units` | ` 25 ` | `25` | `CONVERT_TO_NUMBER` — Casts whitespace-padded string to integer 25 |
| **Record 15** (Row 16) | ✨ AUTO-FIX AVAILABLE | `Puroks Covered by Route` | `Purok 1,   Purok 2` | `Purok 1, Purok 2` | `COLLAPSE_WHITESPACE` — Collapsed redundant whitespace |
| **Record 16** (Row 17) | ✨ AUTO-FIX AVAILABLE | `Vehicle Type` | `  Jeepney  ` | `Jeepney` | `TRIM_WHITESPACE` — Trimmed whitespace from vehicle type |
| **Record 17** (Row 18) | ✨ AUTO-FIX AVAILABLE | `Route` | `  Mabini   -   Public   Market   Loop  ` | `Mabini - Public Market Loop` | `COLLAPSE_WHITESPACE` — Collapsed internal whitespace |
| **Record 18** (Row 19) | ✨ AUTO-FIX AVAILABLE | `Available Units` | ` 40 ` | `40` | `CONVERT_TO_NUMBER` — Casts padded string to integer 40 |
| **Record 19** (Row 20) | ✨ AUTO-FIX AVAILABLE | `Barangays Covered by Route` | `  Barangay Centro,   Barangay Riverside  ` | `Barangay Centro, Barangay Riverside` | `COLLAPSE_WHITESPACE` — Trimmed and normalized whitespace |
| **Record 20** (Row 21) | ✨ AUTO-FIX AVAILABLE | `Vehicle Type` | `  Tricycle  ` | `Tricycle` | `TRIM_WHITESPACE` — Trimmed whitespace |
| **Record 21** (Row 22) | ✨ AUTO-FIX AVAILABLE | `Available Units` | ` 18 ` | `18` | `CONVERT_TO_NUMBER` — Casts string count to integer 18 |

#### Records 22–25 — Must Be Fixed (4 Records)
These records contain blocking issues that cannot be guessed or fabricated automatically. They require explicit human intervention before official import.

| Record # | Expected Status | Field With Issue | Original Value | Required Human Action | Rule Triggered | Blocking Reason |
|---|---|---|---|---|---|---|
| **Record 22** (Row 23) | ❌ MUST BE FIXED | `Route` | `(blank)` | User must enter official franchise transport route description. | `REQUIRED_FIELD_MISSING` | Public transport franchise record must specify an authorized route. |
| **Record 23** (Row 24) | ❌ MUST BE FIXED | `Available Units` | `-10` | User must enter positive count of authorized operating vehicles. | `NEGATIVE_INTEGER_NOT_ALLOWED` | Vehicle inventory count cannot be negative. |
| **Record 24** (Row 25) | ❌ MUST BE FIXED | `Route + Vehicle Type` | `Duplicate Route Loop | Jeepney` | User must consolidate vehicle unit allocation under route. | `DUPLICATE_COMPOSITE_KEY` | Franchise route cannot have conflicting duplicate quota records. |
| **Record 25** (Row 26) | ❌ MUST BE FIXED | `Route + Vehicle Type` | `Duplicate Route Loop | Jeepney` | User must consolidate vehicle unit allocation under route. | `DUPLICATE_COMPOSITE_KEY` | Franchise route cannot have conflicting duplicate quota records. |

#### Verification Lifecycle for Transportation:
- **Initial Upload**: 12 Valid, 9 Auto-Fix Available, 4 Must Be Fixed (Status: Action Required)
- **Click "Fix All Automatically"**: 21 Valid, 0 Auto-Fix Available, 4 Must Be Fixed, 9 Auto-Cleaned
- **Manual Correction**: 25 Valid, 0 Must Be Fixed (100% Ready for Official Import)

### 8. DBL — Water
- **Primary Training Demo File**: `training-data/DBL_Water_Training_Demo.xlsx`
- **Subfolder Reference Files**: `training-data/DBL/Water/`
  - `DBL_Water_Clean_Sample.xlsx` (Clean reference sample, 25 records)
  - `DBL_Water_AutoFix_Demo.xlsx` (Auto-fix demo sample, 25 records)
  - `DBL_Water_Expected_Cleaned.xlsx` (Expected cleaned result, 25 records)

#### Records 1–12 — Valid (12 Records)
Records 1 through 12 are 100% valid and comply fully with official template standards, correct data types, valid coordinates/dates, and unique identifiers. Zero action required.

#### Records 13–21 — Auto-Fix Available (9 Records)
These records contain only safe, deterministic formatting issues supported by DataClean's auto-cleaner. They are preserved intact upon upload and resolved when the user clicks **"Fix All Automatically"**.

| Record # | Expected Status | Field With Issue | Original Value | Expected Auto-Fix | Rule Triggered |
|---|---|---|---|---|---|
| **Record 13** (Row 14) | ✨ AUTO-FIX AVAILABLE | `Consumption` | ` 22.4 cu.m ` | `22.4` | `REMOVE_UNIT` — Strips "cu.m" unit suffix and whitespace to float 22.4 |
| **Record 14** (Row 15) | ✨ AUTO-FIX AVAILABLE | `Billing Date` | `01/31/2026` | `2026-01-31` | `NORMALIZE_DATE` — Normalizes MM/DD/YYYY slashed date to ISO YYYY-MM-DD |
| **Record 15** (Row 16) | ✨ AUTO-FIX AVAILABLE | `Street` | `  Rizal   Street  ` | `Rizal Street 15` | `COLLAPSE_WHITESPACE` — Trimmed and collapsed repeated spaces |
| **Record 16** (Row 17) | ✨ AUTO-FIX AVAILABLE | `Account Number` | `  00045016  ` | `00045016` | `TRIM_WHITESPACE` — Preserves leading zeros while trimming whitespace |
| **Record 17** (Row 18) | ✨ AUTO-FIX AVAILABLE | `Consumption` | `18.5 cu.m` | `18.5` | `REMOVE_UNIT` — Strips "cu.m" unit to float 18.5 |
| **Record 18** (Row 19) | ✨ AUTO-FIX AVAILABLE | `Billing Date` | `05/30/2026` | `2026-05-30` | `NORMALIZE_DATE` — Normalizes slashed date to ISO format |
| **Record 19** (Row 20) | ✨ AUTO-FIX AVAILABLE | `Barangay` | `  Barangay Centro  ` | `Barangay Centro` | `TRIM_WHITESPACE` — Trimmed leading/trailing spaces |
| **Record 20** (Row 21) | ✨ AUTO-FIX AVAILABLE | `Type` | `residential` | `Residential` | `NORMALIZE_CATEGORY_CASE` — Normalized category casing to "Residential" |
| **Record 21** (Row 22) | ✨ AUTO-FIX AVAILABLE | `Purok` | `Purok IV` | `Purok 4` | `PUROK_ROMAN_NUMERAL` — Standardized Roman numeral Purok IV to Arabic Purok 4 |

#### Records 22–25 — Must Be Fixed (4 Records)
These records contain blocking issues that cannot be guessed or fabricated automatically. They require explicit human intervention before official import.

| Record # | Expected Status | Field With Issue | Original Value | Required Human Action | Rule Triggered | Blocking Reason |
|---|---|---|---|---|---|---|
| **Record 22** (Row 23) | ❌ MUST BE FIXED | `Account Number` | `(blank)` | User must enter water service connection account number. | `REQUIRED_FIELD_MISSING` | Water consumption billing record cannot be posted without consumer account. |
| **Record 23** (Row 24) | ❌ MUST BE FIXED | `Consumption` | `-12.5` | User must verify meter reading and enter positive cubic meter consumption. | `NEGATIVE_NUMBER_NOT_ALLOWED` | Water meter consumption cannot be negative. |
| **Record 24** (Row 25) | ❌ MUST BE FIXED | `Account Number + Billing Date` | `00045999 | 2026-01-31` | User must verify meter reading cycle and remove duplicate billing entry. | `DUPLICATE_COMPOSITE_KEY` | Duplicate meter entry causes double-charging the customer for same period. |
| **Record 25** (Row 26) | ❌ MUST BE FIXED | `Account Number + Billing Date` | `00045999 | 2026-01-31` | User must verify meter reading cycle and remove duplicate billing entry. | `DUPLICATE_COMPOSITE_KEY` | Duplicate meter entry causes double-charging the customer for same period. |

#### Verification Lifecycle for Water:
- **Initial Upload**: 12 Valid, 9 Auto-Fix Available, 4 Must Be Fixed (Status: Action Required)
- **Click "Fix All Automatically"**: 21 Valid, 0 Auto-Fix Available, 4 Must Be Fixed, 9 Auto-Cleaned
- **Manual Correction**: 25 Valid, 0 Must Be Fixed (100% Ready for Official Import)

### 9. ODeSSEE — Barangay Household Profile
- **Primary Training Demo File**: `training-data/ODeSSEE_Household_Training_Demo.xlsx`
- **Subfolder Reference Files**: `training-data/ODeSSEE/Barangay-Household/`
  - `ODeSSEE_Barangay_Household_Clean_Sample.xlsx` (Clean reference sample, 25 records)
  - `ODeSSEE_Barangay_Household_AutoFix_Demo.xlsx` (Auto-fix demo sample, 25 records)
  - `ODeSSEE_Barangay_Household_Expected_Cleaned.xlsx` (Expected cleaned result, 25 records)

#### Records 1–12 — Valid (12 Records)
Records 1 through 12 are 100% valid and comply fully with official template standards, correct data types, valid coordinates/dates, and unique identifiers. Zero action required.

#### Records 13–21 — Auto-Fix Available (9 Records)
These records contain only safe, deterministic formatting issues supported by DataClean's auto-cleaner. They are preserved intact upon upload and resolved when the user clicks **"Fix All Automatically"**.

| Record # | Expected Status | Field With Issue | Original Value | Expected Auto-Fix | Rule Triggered |
|---|---|---|---|---|---|
| **Record 13** (Row 14) | ✨ AUTO-FIX AVAILABLE | `Solo Parent(Y/N)` | `y` | `Y` | `NORMALIZE_BOOLEAN` — Standardizes boolean indicator to uppercase "Y" |
| **Record 14** (Row 15) | ✨ AUTO-FIX AVAILABLE | `CBMS#-Ind#` | `  00049014  ` | `00049014` | `TRIM_WHITESPACE` — Preserves leading zeros while trimming whitespace |
| **Record 15** (Row 16) | ✨ AUTO-FIX AVAILABLE | `Birth Date` | `05/22/1980` | `1980-05-22` | `NORMALIZE_DATE` — Normalizes MM/DD/YYYY slashed date to standard ISO YYYY-MM-DD |
| **Record 16** (Row 17) | ✨ AUTO-FIX AVAILABLE | `Gender` | `female` | `Female` | `NORMALIZE_CATEGORY_CASE` — Normalized gender casing to "Female" |
| **Record 17** (Row 18) | ✨ AUTO-FIX AVAILABLE | `Barangay` | `  Barangay San Isidro  ` | `Barangay San Isidro` | `TRIM_WHITESPACE` — Trimmed leading/trailing spaces |
| **Record 18** (Row 19) | ✨ AUTO-FIX AVAILABLE | `Solo Parent(Y/N)` | `yes` | `Y` | `NORMALIZE_BOOLEAN` — Standardizes "yes" to official uppercase "Y" |
| **Record 19** (Row 20) | ✨ AUTO-FIX AVAILABLE | `Civil Status` | `  Single  ` | `Single` | `TRIM_WHITESPACE` — Trimmed whitespace from civil status |
| **Record 20** (Row 21) | ✨ AUTO-FIX AVAILABLE | `Purok/Zone` | `Purok IV` | `Purok 4` | `PUROK_ROMAN_NUMERAL` — Standardized Roman numeral Purok IV to Arabic Purok 4 |
| **Record 21** (Row 22) | ✨ AUTO-FIX AVAILABLE | `Solo Parent(Y/N)` | `no` | `N` | `NORMALIZE_BOOLEAN` — Standardizes "no" to official uppercase "N" |

#### Records 22–25 — Must Be Fixed (4 Records)
These records contain blocking issues that cannot be guessed or fabricated automatically. They require explicit human intervention before official import.

| Record # | Expected Status | Field With Issue | Original Value | Required Human Action | Rule Triggered | Blocking Reason |
|---|---|---|---|---|---|---|
| **Record 22** (Row 23) | ❌ MUST BE FIXED | `Barangay` | `(blank)` | User must select official barangay jurisdiction from list. | `REQUIRED_FIELD_MISSING` | CBMS demographic profile must belong to a recognized barangay. |
| **Record 23** (Row 24) | ❌ MUST BE FIXED | `Birth Date` | `2035-01-01` | User must enter historical birth date. | `DATE_CANNOT_BE_FUTURE` | Citizen birth date cannot be in the future. |
| **Record 24** (Row 25) | ❌ MUST BE FIXED | `CBMS#-Ind#` | `00049999` | User must verify citizen profile and remove duplicate individual ID. | `DUPLICATE_COMPOSITE_KEY` | Individual CBMS ID must uniquely identify a citizen. |
| **Record 25** (Row 26) | ❌ MUST BE FIXED | `CBMS#-Ind#` | `00049999` | User must verify citizen profile and remove duplicate individual ID. | `DUPLICATE_COMPOSITE_KEY` | Individual CBMS ID must uniquely identify a citizen. |

#### Verification Lifecycle for Barangay Household Profile:
- **Initial Upload**: 12 Valid, 9 Auto-Fix Available, 4 Must Be Fixed (Status: Action Required)
- **Click "Fix All Automatically"**: 21 Valid, 0 Auto-Fix Available, 4 Must Be Fixed, 9 Auto-Cleaned
- **Manual Correction**: 25 Valid, 0 Must Be Fixed (100% Ready for Official Import)

### 10. ODeSSEE — COVID Cases
- **Primary Training Demo File**: `training-data/ODeSSEE_COVID_Training_Demo.xlsx`
- **Subfolder Reference Files**: `training-data/ODeSSEE/COVID-Cases/`
  - `ODeSSEE_COVID_Cases_Clean_Sample.xlsx` (Clean reference sample, 25 records)
  - `ODeSSEE_COVID_Cases_AutoFix_Demo.xlsx` (Auto-fix demo sample, 25 records)
  - `ODeSSEE_COVID_Cases_Expected_Cleaned.xlsx` (Expected cleaned result, 25 records)

#### Records 1–12 — Valid (12 Records)
Records 1 through 12 are 100% valid and comply fully with official template standards, correct data types, valid coordinates/dates, and unique identifiers. Zero action required.

#### Records 13–21 — Auto-Fix Available (9 Records)
These records contain only safe, deterministic formatting issues supported by DataClean's auto-cleaner. They are preserved intact upon upload and resolved when the user clicks **"Fix All Automatically"**.

| Record # | Expected Status | Field With Issue | Original Value | Expected Auto-Fix | Rule Triggered |
|---|---|---|---|---|---|
| **Record 13** (Row 14) | ✨ AUTO-FIX AVAILABLE | `Barangay` | `  Barangay Maligaya  ` | `Barangay Maligaya` | `TRIM_WHITESPACE` — Trimmed leading/trailing whitespace |
| **Record 14** (Row 15) | ✨ AUTO-FIX AVAILABLE | `Total Number of Case` | `25 cases` | `25` | `REMOVE_UNIT` — Strips "cases" unit suffix to integer 25 |
| **Record 15** (Row 16) | ✨ AUTO-FIX AVAILABLE | `Facilities` | `   Community   Health   Center   ` | `Community Health Center` | `COLLAPSE_WHITESPACE` — Collapsed redundant spaces |
| **Record 16** (Row 17) | ✨ AUTO-FIX AVAILABLE | `Total Number of Case` | ` 10 ` | `10` | `CONVERT_TO_NUMBER` — Casts whitespace-padded string to integer 10 |
| **Record 17** (Row 18) | ✨ AUTO-FIX AVAILABLE | `Barangay` | `  Barangay Centro  ` | `Barangay Centro` | `TRIM_WHITESPACE` — Trimmed whitespace |
| **Record 18** (Row 19) | ✨ AUTO-FIX AVAILABLE | `Total Number of Case` | `18 cases` | `18` | `REMOVE_UNIT` — Strips "cases" unit suffix to integer 18 |
| **Record 19** (Row 20) | ✨ AUTO-FIX AVAILABLE | `Facilities` | `  Quarantine   Facility   A  ` | `Quarantine Facility A` | `COLLAPSE_WHITESPACE` — Collapsed internal spaces |
| **Record 20** (Row 21) | ✨ AUTO-FIX AVAILABLE | `Total Number of Case` | ` 35 ` | `35` | `CONVERT_TO_NUMBER` — Casts padded string to integer 35 |
| **Record 21** (Row 22) | ✨ AUTO-FIX AVAILABLE | `Barangay` | `   Barangay   Riverside   ` | `Barangay Riverside` | `COLLAPSE_WHITESPACE` — Collapsed internal whitespace |

#### Records 22–25 — Must Be Fixed (4 Records)
These records contain blocking issues that cannot be guessed or fabricated automatically. They require explicit human intervention before official import.

| Record # | Expected Status | Field With Issue | Original Value | Required Human Action | Rule Triggered | Blocking Reason |
|---|---|---|---|---|---|---|
| **Record 22** (Row 23) | ❌ MUST BE FIXED | `Barangay` | `(blank)` | User must input official barangay location for facility. | `REQUIRED_FIELD_MISSING` | Epidemiological surveillance records must be tied to a barangay. |
| **Record 23** (Row 24) | ❌ MUST BE FIXED | `Total Number of Case` | `-15` | User must enter verified non-negative case count. | `NEGATIVE_INTEGER_NOT_ALLOWED` | Disease surveillance counts cannot be negative. |
| **Record 24** (Row 25) | ❌ MUST BE FIXED | `Barangay + Facilities` | `Barangay Centro | Central Isolation Ward DUP` | User must combine surveillance case counts for facility. | `DUPLICATE_COMPOSITE_KEY` | Facility case totals within a barangay cannot be logged in duplicate. |
| **Record 25** (Row 26) | ❌ MUST BE FIXED | `Barangay + Facilities` | `Barangay Centro | Central Isolation Ward DUP` | User must combine surveillance case counts for facility. | `DUPLICATE_COMPOSITE_KEY` | Facility case totals within a barangay cannot be logged in duplicate. |

#### Verification Lifecycle for COVID Cases:
- **Initial Upload**: 12 Valid, 9 Auto-Fix Available, 4 Must Be Fixed (Status: Action Required)
- **Click "Fix All Automatically"**: 21 Valid, 0 Auto-Fix Available, 4 Must Be Fixed, 9 Auto-Cleaned
- **Manual Correction**: 25 Valid, 0 Must Be Fixed (100% Ready for Official Import)

### 11. ODeSSEE — Disaster Incident Report
- **Primary Training Demo File**: `training-data/ODeSSEE_DisasterIncident_Training_Demo.xlsx`
- **Subfolder Reference Files**: `training-data/ODeSSEE/Disaster-Incident/`
  - `ODeSSEE_Disaster_Incident_Clean_Sample.xlsx` (Clean reference sample, 25 records)
  - `ODeSSEE_Disaster_Incident_AutoFix_Demo.xlsx` (Auto-fix demo sample, 25 records)
  - `ODeSSEE_Disaster_Incident_Expected_Cleaned.xlsx` (Expected cleaned result, 25 records)

#### Records 1–12 — Valid (12 Records)
Records 1 through 12 are 100% valid and comply fully with official template standards, correct data types, valid coordinates/dates, and unique identifiers. Zero action required.

#### Records 13–21 — Auto-Fix Available (9 Records)
These records contain only safe, deterministic formatting issues supported by DataClean's auto-cleaner. They are preserved intact upon upload and resolved when the user clicks **"Fix All Automatically"**.

| Record # | Expected Status | Field With Issue | Original Value | Expected Auto-Fix | Rule Triggered |
|---|---|---|---|---|---|
| **Record 13** (Row 15) | ✨ AUTO-FIX AVAILABLE | `Current Level` | `14.8 m` | `14.8` | `REMOVE_UNIT` — Strips "m" suffix to numeric float 14.8 |
| **Record 14** (Row 16) | ✨ AUTO-FIX AVAILABLE | `Casualty` | ` 0 ` | `0` | `CONVERT_TO_NUMBER` — Casts whitespace-padded string to integer 0 |
| **Record 15** (Row 17) | ✨ AUTO-FIX AVAILABLE | `Report Date` | `11/15/2024` | `2024-11-15` | `NORMALIZE_DATE` — Normalizes MM/DD/YYYY slashed date to standard YYYY-MM-DD |
| **Record 16** (Row 18) | ✨ AUTO-FIX AVAILABLE | `Gauging Station` | `  001-Cagayan-Station  ` | `001-Cagayan-Station` | `TRIM_WHITESPACE` — Preserves leading zeros while trimming whitespace |
| **Record 17** (Row 19) | ✨ AUTO-FIX AVAILABLE | `Incident` | `  Heavy   Rainfall   Episode  ` | `Heavy Rainfall Episode 17` | `COLLAPSE_WHITESPACE` — Collapsed multiple internal spaces |
| **Record 18** (Row 20) | ✨ AUTO-FIX AVAILABLE | `Current Level` | `12.0 m` | `12` | `REMOVE_UNIT` — Strips "m" unit suffix to float 12.0 |
| **Record 19** (Row 21) | ✨ AUTO-FIX AVAILABLE | `Report Date` | `05/30/2024` | `2024-05-30` | `NORMALIZE_DATE` — Normalizes slashed date to ISO format |
| **Record 20** (Row 22) | ✨ AUTO-FIX AVAILABLE | `Sky Condition` | `  Overcast  ` | `Overcast` | `TRIM_WHITESPACE` — Trimmed surrounding whitespace |
| **Record 21** (Row 23) | ✨ AUTO-FIX AVAILABLE | `Casualty` | ` 1 ` | `1` | `CONVERT_TO_NUMBER` — Casts string casualty count to integer 1 |

#### Records 22–25 — Must Be Fixed (4 Records)
These records contain blocking issues that cannot be guessed or fabricated automatically. They require explicit human intervention before official import.

| Record # | Expected Status | Field With Issue | Original Value | Required Human Action | Rule Triggered | Blocking Reason |
|---|---|---|---|---|---|---|
| **Record 22** (Row 24) | ❌ MUST BE FIXED | `Incident` | `(blank)` | User must enter disaster/incident title or nature. | `REQUIRED_FIELD_MISSING` | Disaster monitoring log cannot be filed without incident description. |
| **Record 23** (Row 25) | ❌ MUST BE FIXED | `Casualty` | `-5` | User must enter verified non-negative casualty count. | `NEGATIVE_INTEGER_NOT_ALLOWED` | Human casualty count cannot be negative. |
| **Record 24** (Row 26) | ❌ MUST BE FIXED | `Report Date + Incident` | `2024-05-15 | Duplicate Flood Incident` | User must consolidate incident situation report. | `DUPLICATE_COMPOSITE_KEY` | Duplicate disaster incident reports distort regional situation assessments. |
| **Record 25** (Row 27) | ❌ MUST BE FIXED | `Report Date + Incident` | `2024-05-15 | Duplicate Flood Incident` | User must consolidate incident situation report. | `DUPLICATE_COMPOSITE_KEY` | Duplicate disaster incident reports distort regional situation assessments. |

#### Verification Lifecycle for Disaster Incident Report:
- **Initial Upload**: 12 Valid, 9 Auto-Fix Available, 4 Must Be Fixed (Status: Action Required)
- **Click "Fix All Automatically"**: 21 Valid, 0 Auto-Fix Available, 4 Must Be Fixed, 9 Auto-Cleaned
- **Manual Correction**: 25 Valid, 0 Must Be Fixed (100% Ready for Official Import)

### 12. ODeSSEE — DRRM Resources
- **Primary Training Demo File**: `training-data/ODeSSEE_DRRMResources_Training_Demo.xlsx`
- **Subfolder Reference Files**: `training-data/ODeSSEE/DRRM-Resources/`
  - `ODeSSEE_DRRM_Resources_Clean_Sample.xlsx` (Clean reference sample, 25 records)
  - `ODeSSEE_DRRM_Resources_AutoFix_Demo.xlsx` (Auto-fix demo sample, 25 records)
  - `ODeSSEE_DRRM_Resources_Expected_Cleaned.xlsx` (Expected cleaned result, 25 records)

#### Records 1–12 — Valid (12 Records)
Records 1 through 12 are 100% valid and comply fully with official template standards, correct data types, valid coordinates/dates, and unique identifiers. Zero action required.

#### Records 13–21 — Auto-Fix Available (9 Records)
These records contain only safe, deterministic formatting issues supported by DataClean's auto-cleaner. They are preserved intact upon upload and resolved when the user clicks **"Fix All Automatically"**.

| Record # | Expected Status | Field With Issue | Original Value | Expected Auto-Fix | Rule Triggered |
|---|---|---|---|---|---|
| **Record 13** (Row 14) | ✨ AUTO-FIX AVAILABLE | `Quantity` | ` 24 pcs ` | `24` | `REMOVE_UNIT` — Strips "pcs" suffix to integer 24 |
| **Record 14** (Row 15) | ✨ AUTO-FIX AVAILABLE | `Group/Team` | `  Utility Response Team  ` | `Utility Response Team` | `TRIM_WHITESPACE` — Trimmed leading/trailing whitespace |
| **Record 15** (Row 16) | ✨ AUTO-FIX AVAILABLE | `Resources/Equipment` | `   Spine   Board   Batch 15   ` | `Spine Board Batch 15` | `COLLAPSE_WHITESPACE` — Collapsed redundant internal spaces |
| **Record 16** (Row 17) | ✨ AUTO-FIX AVAILABLE | `Quantity` | ` 150 pcs ` | `150` | `REMOVE_UNIT` — Strips "pcs" suffix to integer 150 |
| **Record 17** (Row 18) | ✨ AUTO-FIX AVAILABLE | `Group/Team` | `  Rescue Team Alpha  ` | `Rescue Team Alpha` | `TRIM_WHITESPACE` — Trimmed whitespace from team name |
| **Record 18** (Row 19) | ✨ AUTO-FIX AVAILABLE | `Quantity` | ` 8 units ` | `8` | `REMOVE_UNIT` — Strips "units" suffix to integer 8 |
| **Record 19** (Row 20) | ✨ AUTO-FIX AVAILABLE | `Resources/Equipment` | `  Portable Generator Batch 19  ` | `Portable Generator Batch 19` | `TRIM_WHITESPACE` — Trimmed surrounding spaces |
| **Record 20** (Row 21) | ✨ AUTO-FIX AVAILABLE | `Quantity` | ` 15 units ` | `15` | `REMOVE_UNIT` — Strips "units" suffix to integer 15 |
| **Record 21** (Row 22) | ✨ AUTO-FIX AVAILABLE | `Group/Team` | `   Logistics   Support   Unit   ` | `Logistics Support Unit` | `COLLAPSE_WHITESPACE` — Collapsed internal whitespace |

#### Records 22–25 — Must Be Fixed (4 Records)
These records contain blocking issues that cannot be guessed or fabricated automatically. They require explicit human intervention before official import.

| Record # | Expected Status | Field With Issue | Original Value | Required Human Action | Rule Triggered | Blocking Reason |
|---|---|---|---|---|---|---|
| **Record 22** (Row 23) | ❌ MUST BE FIXED | `Resources/Equipment` | `(blank)` | User must enter emergency response resource or equipment name. | `REQUIRED_FIELD_MISSING` | Disaster preparedness inventory requires resource designation. |
| **Record 23** (Row 24) | ❌ MUST BE FIXED | `Quantity` | `-10` | User must enter verified positive inventory quantity. | `NEGATIVE_INTEGER_NOT_ALLOWED` | Emergency resource inventory count cannot be negative. |
| **Record 24** (Row 25) | ❌ MUST BE FIXED | `Group/Team + Resources/Equipment` | `Rescue Team Alpha | Emergency Rescue Truck DUP` | User must combine unit quantities under single equipment entry. | `DUPLICATE_COMPOSITE_KEY` | Duplicate equipment rows cause discrepancies during emergency deployment. |
| **Record 25** (Row 26) | ❌ MUST BE FIXED | `Group/Team + Resources/Equipment` | `Rescue Team Alpha | Emergency Rescue Truck DUP` | User must combine unit quantities under single equipment entry. | `DUPLICATE_COMPOSITE_KEY` | Duplicate equipment rows cause discrepancies during emergency deployment. |

#### Verification Lifecycle for DRRM Resources:
- **Initial Upload**: 12 Valid, 9 Auto-Fix Available, 4 Must Be Fixed (Status: Action Required)
- **Click "Fix All Automatically"**: 21 Valid, 0 Auto-Fix Available, 4 Must Be Fixed, 9 Auto-Cleaned
- **Manual Correction**: 25 Valid, 0 Must Be Fixed (100% Ready for Official Import)

### 13. ODeSSEE — Evacuation Sites
- **Primary Training Demo File**: `training-data/ODeSSEE_EvacuationSites_Training_Demo.xlsx`
- **Subfolder Reference Files**: `training-data/ODeSSEE/Evacuation-Sites/`
  - `ODeSSEE_Evacuation_Sites_Clean_Sample.xlsx` (Clean reference sample, 25 records)
  - `ODeSSEE_Evacuation_Sites_AutoFix_Demo.xlsx` (Auto-fix demo sample, 25 records)
  - `ODeSSEE_Evacuation_Sites_Expected_Cleaned.xlsx` (Expected cleaned result, 25 records)

#### Records 1–12 — Valid (12 Records)
Records 1 through 12 are 100% valid and comply fully with official template standards, correct data types, valid coordinates/dates, and unique identifiers. Zero action required.

#### Records 13–21 — Auto-Fix Available (9 Records)
These records contain only safe, deterministic formatting issues supported by DataClean's auto-cleaner. They are preserved intact upon upload and resolved when the user clicks **"Fix All Automatically"**.

| Record # | Expected Status | Field With Issue | Original Value | Expected Auto-Fix | Rule Triggered |
|---|---|---|---|---|---|
| **Record 13** (Row 14) | ✨ AUTO-FIX AVAILABLE | `No. of Family` | ` 95 ` | `95` | `CONVERT_TO_NUMBER` — Casts whitespace-padded string to integer 95 |
| **Record 14** (Row 15) | ✨ AUTO-FIX AVAILABLE | `No. of Individuals` | ` 420 ` | `420` | `CONVERT_TO_NUMBER` — Casts whitespace-padded string to integer 420 |
| **Record 15** (Row 16) | ✨ AUTO-FIX AVAILABLE | `Used as COVID-19 TTMF (Y/N)` | `n` | `N` | `NORMALIZE_BOOLEAN` — Standardizes boolean indicator to uppercase "N" |
| **Record 16** (Row 17) | ✨ AUTO-FIX AVAILABLE | `Inspected Safe` | `yes` | `Y` | `NORMALIZE_BOOLEAN` — Standardizes "yes" to uppercase "Y" |
| **Record 17** (Row 18) | ✨ AUTO-FIX AVAILABLE | `Barangay` | `  Barangay San Isidro  ` | `Barangay San Isidro` | `TRIM_WHITESPACE` — Trimmed whitespace from barangay |
| **Record 18** (Row 19) | ✨ AUTO-FIX AVAILABLE | `No. of Family` | ` 60 ` | `60` | `CONVERT_TO_NUMBER` — Casts string family count to integer 60 |
| **Record 19** (Row 20) | ✨ AUTO-FIX AVAILABLE | `Used as COVID-19 TTMF (Y/N)` | `y` | `Y` | `NORMALIZE_BOOLEAN` — Standardizes boolean "y" to "Y" |
| **Record 20** (Row 21) | ✨ AUTO-FIX AVAILABLE | `Name of Evacuation Center ` | `  Evacuation Center Facility 20  ` | `Evacuation Center Facility 20` | `TRIM_WHITESPACE` — Trimmed extraneous whitespace |
| **Record 21** (Row 22) | ✨ AUTO-FIX AVAILABLE | `Inspected Safe` | `y` | `Y` | `NORMALIZE_BOOLEAN` — Standardizes lowercase "y" to uppercase "Y" |

#### Records 22–25 — Must Be Fixed (4 Records)
These records contain blocking issues that cannot be guessed or fabricated automatically. They require explicit human intervention before official import.

| Record # | Expected Status | Field With Issue | Original Value | Required Human Action | Rule Triggered | Blocking Reason |
|---|---|---|---|---|---|---|
| **Record 22** (Row 23) | ❌ MUST BE FIXED | `Name of Evacuation Center ` | `(blank)` | User must enter evacuation facility name. | `REQUIRED_FIELD_MISSING` | Emergency shelter database cannot list anonymous evacuation center. |
| **Record 23** (Row 24) | ❌ MUST BE FIXED | `No. of Family` | `-50` | User must enter positive family capacity count. | `NEGATIVE_INTEGER_NOT_ALLOWED` | Evacuation center family capacity cannot be negative. |
| **Record 24** (Row 25) | ❌ MUST BE FIXED | `Name of Evacuation Center  + Barangay` | `Central Gymnasium DUP | Barangay Centro` | User must deduplicate shelter listing and confirm single center capacity. | `DUPLICATE_COMPOSITE_KEY` | Duplicate center entries falsely inflate municipal evacuation capacity. |
| **Record 25** (Row 26) | ❌ MUST BE FIXED | `Name of Evacuation Center  + Barangay` | `Central Gymnasium DUP | Barangay Centro` | User must deduplicate shelter listing and confirm single center capacity. | `DUPLICATE_COMPOSITE_KEY` | Duplicate center entries falsely inflate municipal evacuation capacity. |

#### Verification Lifecycle for Evacuation Sites:
- **Initial Upload**: 12 Valid, 9 Auto-Fix Available, 4 Must Be Fixed (Status: Action Required)
- **Click "Fix All Automatically"**: 21 Valid, 0 Auto-Fix Available, 4 Must Be Fixed, 9 Auto-Cleaned
- **Manual Correction**: 25 Valid, 0 Must Be Fixed (100% Ready for Official Import)

### 14. ODeSSEE — Flood Susceptibility Rating
- **Primary Training Demo File**: `training-data/ODeSSEE_FloodSusceptibility_Training_Demo.xlsx`
- **Subfolder Reference Files**: `training-data/ODeSSEE/Flood-Susceptibility/`
  - `ODeSSEE_Flood_Susceptibility_Clean_Sample.xlsx` (Clean reference sample, 25 records)
  - `ODeSSEE_Flood_Susceptibility_AutoFix_Demo.xlsx` (Auto-fix demo sample, 25 records)
  - `ODeSSEE_Flood_Susceptibility_Expected_Cleaned.xlsx` (Expected cleaned result, 25 records)

#### Records 1–12 — Valid (12 Records)
Records 1 through 12 are 100% valid and comply fully with official template standards, correct data types, valid coordinates/dates, and unique identifiers. Zero action required.

#### Records 13–21 — Auto-Fix Available (9 Records)
These records contain only safe, deterministic formatting issues supported by DataClean's auto-cleaner. They are preserved intact upon upload and resolved when the user clicks **"Fix All Automatically"**.

| Record # | Expected Status | Field With Issue | Original Value | Expected Auto-Fix | Rule Triggered |
|---|---|---|---|---|---|
| **Record 13** (Row 14) | ✨ AUTO-FIX AVAILABLE | `Flood Height` | `2.25 m` | `2.25` | `REMOVE_UNIT` — Strips "m" suffix to float 2.25 |
| **Record 14** (Row 15) | ✨ AUTO-FIX AVAILABLE | `Barangay Code` | `  023108014  ` | `023108014` | `TRIM_WHITESPACE` — Preserves leading zeros while trimming whitespace |
| **Record 15** (Row 16) | ✨ AUTO-FIX AVAILABLE | `Area of Concern` | `   San Nicolas   Low-lying   Basin   ` | `San Nicolas Low-lying Basin` | `COLLAPSE_WHITESPACE` — Collapsed redundant whitespace |
| **Record 16** (Row 17) | ✨ AUTO-FIX AVAILABLE | `Elevation` | ` 42.5 m ` | `42.5` | `REMOVE_UNIT` — Strips "m" suffix to float 42.5 |
| **Record 17** (Row 18) | ✨ AUTO-FIX AVAILABLE | `Barangay Name` | `  Barangay San Isidro  ` | `Barangay San Isidro` | `TRIM_WHITESPACE` — Trimmed whitespace from barangay |
| **Record 18** (Row 19) | ✨ AUTO-FIX AVAILABLE | `Flood Height` | `1.80 m` | `1.8` | `REMOVE_UNIT` — Strips "m" unit suffix to float 1.8 |
| **Record 19** (Row 20) | ✨ AUTO-FIX AVAILABLE | `Municipality Code` | ` 023108 ` | `023108` | `TRIM_WHITESPACE` — Preserves leading zero while trimming whitespace |
| **Record 20** (Row 21) | ✨ AUTO-FIX AVAILABLE | `POI` | `  Barangay Chapel  ` | `Barangay Chapel` | `TRIM_WHITESPACE` — Trimmed surrounding spaces |
| **Record 21** (Row 22) | ✨ AUTO-FIX AVAILABLE | `Flood Height` | ` 2.50 m ` | `2.5` | `REMOVE_UNIT` — Strips "m" unit suffix to float 2.5 |

#### Records 22–25 — Must Be Fixed (4 Records)
These records contain blocking issues that cannot be guessed or fabricated automatically. They require explicit human intervention before official import.

| Record # | Expected Status | Field With Issue | Original Value | Required Human Action | Rule Triggered | Blocking Reason |
|---|---|---|---|---|---|---|
| **Record 22** (Row 23) | ❌ MUST BE FIXED | `Barangay Name` | `(blank)` | User must enter official barangay jurisdiction. | `REQUIRED_FIELD_MISSING` | Flood hazard susceptibility rating must belong to an administrative barangay. |
| **Record 23** (Row 24) | ❌ MUST BE FIXED | `Flood Height` | `-3.5` | User must enter positive inundation depth in meters. | `NEGATIVE_NUMBER_NOT_ALLOWED` | Water inundation depth cannot be negative. |
| **Record 24** (Row 25) | ❌ MUST BE FIXED | `Area of Concern + Barangay Name` | `Duplicate Flood Area | Barangay Riverside` | User must combine or verify distinct flood hazard monitoring zones. | `DUPLICATE_COMPOSITE_KEY` | Duplicate flood monitoring zones corrupt hydraulic risk modeling. |
| **Record 25** (Row 26) | ❌ MUST BE FIXED | `Area of Concern + Barangay Name` | `Duplicate Flood Area | Barangay Riverside` | User must combine or verify distinct flood hazard monitoring zones. | `DUPLICATE_COMPOSITE_KEY` | Duplicate flood monitoring zones corrupt hydraulic risk modeling. |

#### Verification Lifecycle for Flood Susceptibility Rating:
- **Initial Upload**: 12 Valid, 9 Auto-Fix Available, 4 Must Be Fixed (Status: Action Required)
- **Click "Fix All Automatically"**: 21 Valid, 0 Auto-Fix Available, 4 Must Be Fixed, 9 Auto-Cleaned
- **Manual Correction**: 25 Valid, 0 Must Be Fixed (100% Ready for Official Import)

### 15. ODeSSEE — Vulnerability Risk Assessment
- **Primary Training Demo File**: `training-data/ODeSSEE_VRA_Training_Demo.xlsx`
- **Subfolder Reference Files**: `training-data/ODeSSEE/Vulnerability-Risk/`
  - `ODeSSEE_Vulnerability_Risk_Clean_Sample.xlsx` (Clean reference sample, 25 records)
  - `ODeSSEE_Vulnerability_Risk_AutoFix_Demo.xlsx` (Auto-fix demo sample, 25 records)
  - `ODeSSEE_Vulnerability_Risk_Expected_Cleaned.xlsx` (Expected cleaned result, 25 records)

#### Records 1–12 — Valid (12 Records)
Records 1 through 12 are 100% valid and comply fully with official template standards, correct data types, valid coordinates/dates, and unique identifiers. Zero action required.

#### Records 13–21 — Auto-Fix Available (9 Records)
These records contain only safe, deterministic formatting issues supported by DataClean's auto-cleaner. They are preserved intact upon upload and resolved when the user clicks **"Fix All Automatically"**.

| Record # | Expected Status | Field With Issue | Original Value | Expected Auto-Fix | Rule Triggered |
|---|---|---|---|---|---|
| **Record 13** (Row 14) | ✨ AUTO-FIX AVAILABLE | `Area of Concern` | `  Mabini Riverbend Section  ` | `Mabini Riverbend Section` | `TRIM_WHITESPACE` — Trimmed leading/trailing whitespace |
| **Record 14** (Row 15) | ✨ AUTO-FIX AVAILABLE | `Geocode` | `  00098014  ` | `00098014` | `TRIM_WHITESPACE` — Preserves leading zeros while trimming whitespace |
| **Record 15** (Row 16) | ✨ AUTO-FIX AVAILABLE | `Barangay Name` | `  Barangay   San Nicolas  ` | `Barangay San Nicolas` | `COLLAPSE_WHITESPACE` — Collapsed redundant whitespace |
| **Record 16** (Row 17) | ✨ AUTO-FIX AVAILABLE | `Concern Category` | `  River Flood  ` | `River Flood` | `TRIM_WHITESPACE` — Trimmed whitespace from category |
| **Record 17** (Row 18) | ✨ AUTO-FIX AVAILABLE | `Purok/Sitio` | `Purok IV` | `Purok 4` | `PUROK_ROMAN_NUMERAL` — Standardized Roman numeral Purok IV to Arabic Purok 4 |
| **Record 18** (Row 19) | ✨ AUTO-FIX AVAILABLE | `Area of Concern` | `   Sitio   Riverside   Confluence   ` | `Sitio Riverside Confluence` | `COLLAPSE_WHITESPACE` — Collapsed internal spaces |
| **Record 19** (Row 20) | ✨ AUTO-FIX AVAILABLE | `Geocode` | `   00098019   ` | `00098019` | `TRIM_WHITESPACE` — Trimmed whitespace from geocode |
| **Record 20** (Row 21) | ✨ AUTO-FIX AVAILABLE | `Barangay Name` | `  Barangay Mabini  ` | `Barangay Mabini` | `TRIM_WHITESPACE` — Trimmed leading/trailing spaces |
| **Record 21** (Row 22) | ✨ AUTO-FIX AVAILABLE | `Concern Category` | `  Surface   Runoff  ` | `Surface Runoff` | `COLLAPSE_WHITESPACE` — Collapsed internal spaces |

#### Records 22–25 — Must Be Fixed (4 Records)
These records contain blocking issues that cannot be guessed or fabricated automatically. They require explicit human intervention before official import.

| Record # | Expected Status | Field With Issue | Original Value | Required Human Action | Rule Triggered | Blocking Reason |
|---|---|---|---|---|---|---|
| **Record 22** (Row 23) | ❌ MUST BE FIXED | `Barangay Name` | `(blank)` | User must enter official barangay jurisdiction. | `REQUIRED_FIELD_MISSING` | Vulnerability risk assessment zone must belong to an official barangay. |
| **Record 23** (Row 24) | ❌ MUST BE FIXED | `Latitude` | `-95.0` | User must enter valid latitude between -90 and 90. | `INVALID_LATITUDE` | Geographical coordinate -95.0 is out of valid mathematical range. |
| **Record 24** (Row 25) | ❌ MUST BE FIXED | `Area of Concern + Barangay Name` | `Duplicate Vulnerability Zone | Barangay Centro` | User must verify distinct hazard assessment sector or remove duplicate. | `DUPLICATE_COMPOSITE_KEY` | Duplicate vulnerability zones cause double-counting of vulnerable populations. |
| **Record 25** (Row 26) | ❌ MUST BE FIXED | `Area of Concern + Barangay Name` | `Duplicate Vulnerability Zone | Barangay Centro` | User must verify distinct hazard assessment sector or remove duplicate. | `DUPLICATE_COMPOSITE_KEY` | Duplicate vulnerability zones cause double-counting of vulnerable populations. |

#### Verification Lifecycle for Vulnerability Risk Assessment:
- **Initial Upload**: 12 Valid, 9 Auto-Fix Available, 4 Must Be Fixed (Status: Action Required)
- **Click "Fix All Automatically"**: 21 Valid, 0 Auto-Fix Available, 4 Must Be Fixed, 9 Auto-Cleaned
- **Manual Correction**: 25 Valid, 0 Must Be Fixed (100% Ready for Official Import)

---
*Package generated and verified automatically by DataClean 3-Status Engine.*
