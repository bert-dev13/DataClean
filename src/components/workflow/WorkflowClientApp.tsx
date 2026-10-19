'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Header } from '@/components/common/Header';
import { WorkflowStepper, WorkflowStep } from '@/components/common/WorkflowStepper';
import { Step1SystemSelect } from '@/components/workflow/Step1SystemSelect';
import { Step2DatasetSelect } from '@/components/workflow/Step2DatasetSelect';
import { Step3UploadAnalyze } from '@/components/workflow/Step3UploadAnalyze';
import { Step4ReviewWorkspace } from '@/components/workflow/Step4ReviewWorkspace';
import { Step5Export } from '@/components/workflow/Step5Export';

import { ParsedWorkbook, parseExcelOrCsvFile } from '@/lib/parser/excelParser';
import { DBL_DATASETS, ODESSEE_DATASETS, getDatasetById, businessDefinition } from '@/lib/templates';
import { CleanRecord, DatasetDefinition, QualityReport, ValidationIssue, RuleClassification } from '@/lib/types';
import { evaluateTemplateMatch, DetectionResult } from '@/lib/detector/templateDetector';
import { validateDataset, applyAllSafeFixes } from '@/lib/validator/validationEngine';
import { calculateQualityReport } from '@/lib/validator/readinessCalculator';
import { getDblMockWorkbook } from '@/lib/templates/dbl/dblTestData';
import { getOdesseeMockWorkbook } from '@/lib/templates/odessee/odesseeTestData';
import { RemovedRecordLog } from '@/lib/exporter/auditReportExporter';

interface WorkflowClientAppProps {
  initialStep?: WorkflowStep;
  initialSystem?: 'DBL' | 'ODeSSEE';
  initialDatasetId?: string;
  initialSample?: string | null;
  initialFileLoaded?: boolean;
  initialOpenPanel?: boolean;
}

export function WorkflowClientApp({
  initialStep = 1,
  initialSystem = 'DBL',
  initialDatasetId = 'dbl-business',
  initialSample,
  initialFileLoaded = false,
  initialOpenPanel = false,
}: WorkflowClientAppProps) {
  // Compute initial loaded data if requested via props
  const initialSetup = useMemo(() => {
    let workbook: ParsedWorkbook | null = null;
    let detection: DetectionResult | null = null;
    let records: CleanRecord[] = [];
    let issues: ValidationIssue[] = [];
    let qualityReport: QualityReport | null = null;

    if (initialSample || initialFileLoaded || initialStep >= 4) {
      const targetDataset = getDatasetById(initialDatasetId) || businessDefinition;
      const variant = (initialSample as 'issues' | 'valid' | 'old') || (initialStep === 5 ? 'valid' : 'issues');
      workbook =
        initialSystem === 'DBL'
          ? getDblMockWorkbook(initialDatasetId, variant)
          : getOdesseeMockWorkbook(initialDatasetId, variant === 'old' ? 'issues' : variant);

      detection = evaluateTemplateMatch(workbook.headers, targetDataset);

      if (initialStep >= 4 || initialSample) {
        let res = validateDataset(workbook.rawRows, targetDataset);
        if (initialStep === 5) {
          const fixed = applyAllSafeFixes(res.records, targetDataset);
          res = { ...res, records: fixed.records, allIssues: fixed.allIssues };
        }
        records = res.records;
        issues = res.allIssues;
        qualityReport = calculateQualityReport(records, issues, targetDataset, {
          matchedColumns: detection.matchedColumns.map((c) => ({
            uploaded: c.uploaded,
            template: c.template,
          })),
          missingColumns: detection.missingColumns,
          extraColumns: detection.extraColumns,
          templateMatchScore: detection.confidenceScore,
          isOldOrIncompleteTemplate: detection.isOldOrIncompleteTemplate,
        });
      }
    }

    return {
      workbook,
      detection,
      records,
      issues,
      qualityReport,
    };
  }, [initialStep, initialSystem, initialDatasetId, initialSample, initialFileLoaded]);

  // State Management
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(initialStep);
  const [maxAccessibleStep, setMaxAccessibleStep] = useState<WorkflowStep>(Math.max(initialStep, 5) as WorkflowStep);
  const [selectedSystem, setSelectedSystem] = useState<'DBL' | 'ODeSSEE'>(initialSystem);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(initialDatasetId);

  const [parsedWorkbook, setParsedWorkbook] = useState<ParsedWorkbook | null>(initialSetup.workbook);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(initialSetup.detection);
  const [records, setRecords] = useState<CleanRecord[]>(initialSetup.records);
  const [allIssues, setAllIssues] = useState<ValidationIssue[]>(initialSetup.issues);
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(initialSetup.qualityReport);
  const [removedRecordsLog, setRemovedRecordsLog] = useState<RemovedRecordLog[]>([]);

  const currentDataset = useMemo(() => {
    return getDatasetById(selectedDatasetId) || businessDefinition;
  }, [selectedDatasetId]);

  const activeSystemDatasets = useMemo(() => {
    return selectedSystem === 'DBL' ? DBL_DATASETS : ODESSEE_DATASETS;
  }, [selectedSystem]);

  // Validation Pipeline — PURE VALIDATION ONLY, NO CLEANING APPLIED
  const processRows = useCallback(
    (rows: Record<string, unknown>[], dataset: DatasetDefinition, detection: DetectionResult) => {
      const { records: cleanRecords, allIssues: issues } = validateDataset(rows, dataset);

      const report = calculateQualityReport(cleanRecords, issues, dataset, {
        matchedColumns: detection.matchedColumns.map((c) => ({
          uploaded: c.uploaded,
          template: c.template,
        })),
        missingColumns: detection.missingColumns,
        extraColumns: detection.extraColumns,
        templateMatchScore: detection.confidenceScore,
        isOldOrIncompleteTemplate: detection.isOldOrIncompleteTemplate,
      });

      setRecords(cleanRecords);
      setAllIssues(issues);
      setQualityReport(report);
    },
    []
  );

  // Handlers
  const handleSelectSystem = (system: 'DBL' | 'ODeSSEE') => {
    setSelectedSystem(system);
    setSelectedDatasetId(system === 'DBL' ? 'dbl-business' : 'odessee-household');
    setCurrentStep(2);
    setMaxAccessibleStep((prev) => Math.max(prev, 2) as WorkflowStep);
  };

  const handleDatasetSelected = (datasetId: string) => {
    setSelectedDatasetId(datasetId);
  };

  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleContinueToUpload = () => {
    setCurrentStep(3);
    setMaxAccessibleStep((prev) => Math.max(prev, 3) as WorkflowStep);
  };

  const handleFileUploaded = async (file: File) => {
    setUploadError(null);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !['xlsx', 'xls', 'csv'].includes(ext)) {
        setUploadError(`Unsupported file format (.${ext || 'unknown'}). Please upload an Excel (.xlsx, .xls) or CSV spreadsheet.`);
        return;
      }
      const wb = await parseExcelOrCsvFile(file);
      if (!wb.headers || wb.headers.length === 0) {
        setUploadError('The uploaded spreadsheet contains no recognizable column headers or is empty. Please verify your spreadsheet.');
        return;
      }
      setParsedWorkbook(wb);
      const match = evaluateTemplateMatch(wb.headers, currentDataset);
      setDetectionResult(match);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to parse file. Please verify your spreadsheet.';
      setUploadError(message);
    }
  };

  const handleLoadSample = (variant: 'issues' | 'valid' | 'old' = 'issues') => {
    setUploadError(null);
    const mock =
      selectedSystem === 'DBL'
        ? getDblMockWorkbook(selectedDatasetId, variant)
        : getOdesseeMockWorkbook(selectedDatasetId, variant === 'old' ? 'issues' : variant);

    setParsedWorkbook(mock);
    const match = evaluateTemplateMatch(mock.headers, currentDataset);
    setDetectionResult(match);
  };

  const handleRunAnalysis = () => {
    if (!parsedWorkbook || !detectionResult) return;
    processRows(parsedWorkbook.rawRows, currentDataset, detectionResult);
    setCurrentStep(4);
    setMaxAccessibleStep((prev) => Math.max(prev, 4) as WorkflowStep);
  };

  const revalidateDataset = useCallback(
    (currentRecords: CleanRecord[]): {
      records: CleanRecord[];
      report: QualityReport;
      issues: ValidationIssue[];
    } | null => {
      if (!detectionResult) return null;
      const targetDataset = currentDataset;

      const currentRows = currentRecords.map((r) => {
        const rowObj: Record<string, unknown> = {
          _rowIndex: r._rowIndex,
          _cells: r._cells,
        };
        for (const field of targetDataset.fields) {
          const cell = r._cells[field.key];
          const val =
            cell && cell.workingValue !== undefined
              ? cell.workingValue
              : cell && cell.finalValue !== null && cell.finalValue !== undefined
              ? cell.finalValue
              : r[field.key];
          rowObj[field.officialHeader] = val ?? '';
          rowObj[field.key] = val ?? '';
        }
        return rowObj;
      });

      const { records: cleanRecords, allIssues: issues } = validateDataset(
        currentRows,
        targetDataset
      );

      // Preserve originalValue and accumulated changes from currentRecords
      const mergedRecords = cleanRecords.map((newRec) => {
        const prevRec = currentRecords.find((p) => p._rowIndex === newRec._rowIndex);
        if (!prevRec) return newRec;

        const mergedCells = { ...newRec._cells };
        for (const field of targetDataset.fields) {
          const prevCell = prevRec._cells[field.key];
          const newCell = mergedCells[field.key];
          if (prevCell && newCell) {
            mergedCells[field.key] = {
              ...newCell,
              originalValue: prevCell.originalValue !== undefined ? prevCell.originalValue : newCell.originalValue,
              changes: prevCell.changes && prevCell.changes.length > 0 ? prevCell.changes : newCell.changes,
              autoCleaned: prevCell.autoCleaned || newCell.autoCleaned,
              finalValue: prevCell.finalValue !== null && prevCell.finalValue !== undefined ? prevCell.finalValue : newCell.finalValue,
            };
          }
        }

        return {
          ...newRec,
          _cells: mergedCells,
        };
      });

      const report = calculateQualityReport(mergedRecords, issues, targetDataset, {
        matchedColumns: detectionResult.matchedColumns.map((c) => ({
          uploaded: c.uploaded,
          template: c.template,
        })),
        missingColumns: detectionResult.missingColumns,
        extraColumns: detectionResult.extraColumns,
        templateMatchScore: detectionResult.confidenceScore,
        isOldOrIncompleteTemplate: detectionResult.isOldOrIncompleteTemplate,
      });

      setRecords(mergedRecords);
      setAllIssues(issues);
      setQualityReport(report);

      return { records: mergedRecords, report, issues };
    },
    [currentDataset, detectionResult]
  );

  const handleUpdateCell = useCallback(
    (rowIndex: number, fieldKey: string, newValue: unknown, isManual: boolean = false) => {
      setRecords((prevRecords) => {
        const next = prevRecords.map((r) => {
          if (r._rowIndex !== rowIndex) return r;

          const oldCell = r._cells[fieldKey];
          const updatedCell = {
            ...oldCell,
            workingValue: newValue,
            finalValue: newValue,
            cleanedValue: newValue,
            pendingFix: null,
            status: (isManual ? 'VALID' : 'AUTO-FIX') as RuleClassification,
            issues: isManual ? [] : oldCell.issues.map((i) => ({ ...i, isResolved: true })),
            changes: [
              ...oldCell.changes,
              {
                id: `change-${rowIndex}-${fieldKey}-${Date.now()}`,
                rowIndex,
                fieldKey,
                fieldHeader: oldCell.issues[0]?.fieldHeader || fieldKey,
                originalValue: oldCell.originalValue,
                finalValue: newValue,
                ruleId: isManual ? 'MANUAL_USER_EDIT' : 'ACCEPTED_SUGGESTION',
                actionType: isManual ? 'User manually updated cell value' : 'User accepted recommended value',
                status: isManual ? ('MANUAL_EDIT' as const) : ('AUTO-FIX' as const),
                timestamp: new Date().toISOString(),
              },
            ],
          };

          return {
            ...r,
            [fieldKey]: newValue,
            _cells: {
              ...r._cells,
              [fieldKey]: updatedCell,
            },
          };
        });

        setTimeout(() => revalidateDataset(next), 0);
        return next;
      });
    },
    [revalidateDataset]
  );

  const handleResetCellToOriginal = useCallback(
    (rowIndex: number, fieldKey: string) => {
      setRecords((prevRecords) => {
        const next = prevRecords.map((r) => {
          if (r._rowIndex !== rowIndex) return r;
          const oldCell = r._cells[fieldKey];
          const orig = oldCell.originalValue;
          return {
            ...r,
            [fieldKey]: orig,
            _cells: {
              ...r._cells,
              [fieldKey]: {
                ...oldCell,
                workingValue: orig,
                finalValue: null,
                cleanedValue: orig,
                autoCleaned: false,
                changes: oldCell.changes.filter((c) => c.ruleId !== 'SAFE_AUTO_FIX'),
              },
            },
          };
        });
        setTimeout(() => revalidateDataset(next), 0);
        return next;
      });
    },
    [revalidateDataset]
  );

  const handleApplyAllSafeFixes = useCallback(() => {
    if (!records.length || !detectionResult) {
      return {
        fixedCount: 0,
        previousReadiness: 0,
        newReadiness: 0,
        errorCount: 0,
      };
    }

    const previousReadiness = qualityReport?.readinessScore || 0;
    const applied = applyAllSafeFixes(records, currentDataset);

    const report = calculateQualityReport(applied.records, applied.allIssues, currentDataset, {
      matchedColumns: detectionResult.matchedColumns.map((c) => ({
        uploaded: c.uploaded,
        template: c.template,
      })),
      missingColumns: detectionResult.missingColumns,
      extraColumns: detectionResult.extraColumns,
      templateMatchScore: detectionResult.confidenceScore,
      isOldOrIncompleteTemplate: detectionResult.isOldOrIncompleteTemplate,
    });

    setRecords(applied.records);
    setAllIssues(applied.allIssues);
    setQualityReport(report);

    const newReadiness = report.readinessScore;
    const errorCount = report.errorRecords;

    const remainingBreakdown = {
      missingValues: report.issueCounts.missingValues || 0,
      numericIssues: report.issueCounts.numericIssues || 0,
      duplicates: report.issueCounts.duplicates || 0,
      invalidDates: report.issueCounts.invalidDates || 0,
      otherIssues:
        (report.issueCounts.invalidCategories || 0) +
        (report.issueCounts.locationIssues || 0) +
        (report.issueCounts.other || 0),
    };

    return {
      fixedCount: applied.fixedCount,
      previousReadiness,
      newReadiness,
      errorCount,
      remainingBreakdown,
    };
  }, [records, detectionResult, qualityReport, currentDataset]);

  const handleRemoveRecord = useCallback(
    (rowIndex: number, reason: string = 'Removed duplicate record') => {
      setRecords((prevRecords) => {
        const target = prevRecords.find((r) => r._rowIndex === rowIndex);
        if (target) {
          setRemovedRecordsLog((prevLog) => [
            ...prevLog,
            {
              rowIndex,
              record: target,
              reason,
              timestamp: new Date().toISOString(),
            },
          ]);
        }
        const next = prevRecords.filter((r) => r._rowIndex !== rowIndex);
        setTimeout(() => revalidateDataset(next), 0);
        return next;
      });
    },
    [revalidateDataset]
  );

  const handleRevalidate = useCallback(() => {
    const result = revalidateDataset(records);
    return {
      records: result?.records || records,
      report: result?.report || qualityReport!,
      issues: result?.issues || allIssues,
      errorCount: result?.report.errorRecords || 0,
      readinessScore: result?.report.readinessScore || 0,
      isReadyForImport: (result?.report.errorRecords || 0) === 0,
    };
  }, [revalidateDataset, records, qualityReport, allIssues]);

  const handleProceedToExport = () => {
    setCurrentStep(5);
    setMaxAccessibleStep((prev) => Math.max(prev, 5) as WorkflowStep);
  };

  const handleResetAll = () => {
    setCurrentStep(1);
    setMaxAccessibleStep(1);
    setParsedWorkbook(null);
    setDetectionResult(null);
    setRecords([]);
    setAllIssues([]);
    setQualityReport(null);
    setRemovedRecordsLog([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans bg-animated-tiles selection:bg-blue-100 selection:text-blue-900 relative overflow-x-hidden">
      <Header />

      <WorkflowStepper
        currentStep={currentStep}
        maxAccessibleStep={maxAccessibleStep}
        onStepClick={(step) => setCurrentStep(step)}
        systemName={selectedSystem}
        datasetName={currentDataset.name}
      />

      <main className="flex-1 pb-16">
        {currentStep === 1 && <Step1SystemSelect onSelectSystem={handleSelectSystem} />}

        {currentStep === 2 && (
          <Step2DatasetSelect
            system={selectedSystem}
            datasets={activeSystemDatasets}
            selectedDatasetId={selectedDatasetId}
            onSelectDataset={handleDatasetSelected}
            onBack={() => setCurrentStep(1)}
            onContinue={handleContinueToUpload}
          />
        )}

        {currentStep === 3 && (
          <Step3UploadAnalyze
            system={selectedSystem}
            dataset={currentDataset}
            parsedWorkbook={parsedWorkbook}
            detectionResult={detectionResult}
            uploadError={uploadError}
            onFileParsed={handleFileUploaded}
            onAnalyze={handleRunAnalysis}
            onResetFile={() => {
              setParsedWorkbook(null);
              setDetectionResult(null);
              setUploadError(null);
            }}
            onBack={() => setCurrentStep(2)}
            onLoadSample={handleLoadSample}
          />
        )}

        {currentStep === 4 && qualityReport && (
          <Step4ReviewWorkspace
            system={selectedSystem}
            dataset={currentDataset}
            fileName={parsedWorkbook ? parsedWorkbook.fileName : `${currentDataset.name}.xlsx`}
            records={records}
            allIssues={allIssues}
            qualityReport={qualityReport}
            initialOpenPanel={initialOpenPanel}
            onUpdateCell={handleUpdateCell}
            onResetCellToOriginal={handleResetCellToOriginal}
            onRemoveRecord={handleRemoveRecord}
            onApplyAllSafeFixes={handleApplyAllSafeFixes}
            onRevalidate={handleRevalidate}
            onProceedToExport={handleProceedToExport}
          />
        )}

        {currentStep === 5 && qualityReport && (
          <Step5Export
            system={selectedSystem}
            dataset={currentDataset}
            fileName={parsedWorkbook ? parsedWorkbook.fileName : `${currentDataset.name}.xlsx`}
            records={records}
            allIssues={allIssues}
            qualityReport={qualityReport}
            removedRecords={removedRecordsLog}
            onReset={handleResetAll}
          />
        )}
      </main>
    </div>
  );
}
