'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  DatasetDefinition,
  CleanRecord,
  ValidationIssue,
} from '@/lib/types';
import {
  X,
  Check,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  Info,
} from 'lucide-react';

interface GuidedResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: DatasetDefinition;
  records: CleanRecord[];
  allIssues: ValidationIssue[];
  onUpdateCell: (rowIndex: number, fieldKey: string, newValue: unknown, isManual?: boolean) => void;
  onRemoveRecord: (rowIndex: number, reason?: string) => void;
  onProceedToExport: () => void;
}

export interface GuidedStep {
  id: string;
  type: 'DUPLICATE' | 'NEGATIVE' | 'MISSING' | 'OTHER';
  issue: ValidationIssue;
  duplicatePair?: { recA: CleanRecord; recB: CleanRecord };
}

function buildGuidedSteps(
  allIssues: ValidationIssue[],
  records: CleanRecord[],
  dataset: DatasetDefinition
): GuidedStep[] {
  const blockingIssues = allIssues.filter((i) => !i.isResolved && i.classification === 'ERROR');
  const steps: GuidedStep[] = [];
  const processedDuplicateKeys = new Set<string>();

  for (const issue of blockingIssues) {
    if (issue.category === 'DUPLICATE') {
      const record = records.find((r) => r._rowIndex === issue.rowIndex);
      if (!record) continue;

      // Composite signature
      const compositeParts = dataset.compositeKey.map((k) => {
        const f = dataset.fields.find((field) => field.key === k || field.officialHeader === k);
        const cellVal = f
          ? record._cells[f.key]?.workingValue ??
            record._cells[f.key]?.finalValue ??
            record._cells[f.key]?.originalValue ??
            record[k]
          : record[k];
        return String(cellVal || '').trim().toLowerCase();
      });
      const keySig = compositeParts.join('|');

      if (processedDuplicateKeys.has(keySig)) {
        continue; // Colliding row already paired
      }
      processedDuplicateKeys.add(keySig);

      const conflicting = records.filter((r) => {
        const parts = dataset.compositeKey.map((k) => {
          const f = dataset.fields.find((field) => field.key === k || field.officialHeader === k);
          const cellVal = f
            ? r._cells[f.key]?.workingValue ??
              r._cells[f.key]?.finalValue ??
              r._cells[f.key]?.originalValue ??
              r[k]
            : r[k];
          return String(cellVal || '').trim().toLowerCase();
        });
        return parts.join('|') === keySig;
      });

      if (conflicting.length >= 2) {
        steps.push({
          id: `step-dup-${keySig}`,
          type: 'DUPLICATE',
          issue,
          duplicatePair: { recA: conflicting[0], recB: conflicting[1] },
        });
        continue;
      }
    }

    // Check for Negative Number
    const rec = records.find((r) => r._rowIndex === issue.rowIndex);
    const cellVal =
      rec?._cells[issue.fieldKey]?.workingValue ??
      rec?._cells[issue.fieldKey]?.finalValue ??
      rec?._cells[issue.fieldKey]?.originalValue ??
      rec?.[issue.fieldKey];
    const isNegative =
      issue.ruleId.includes('NEGATIVE') ||
      issue.category === 'NUMERIC' ||
      (typeof cellVal === 'number' && cellVal < 0) ||
      (typeof cellVal === 'string' && /^\s*-\d+/.test(cellVal));

    if (isNegative) {
      steps.push({
        id: `step-neg-${issue.id}`,
        type: 'NEGATIVE',
        issue,
      });
      continue;
    }

    // Check for Missing Required Value
    if (issue.category === 'MISSING_VALUE' || issue.ruleId === 'REQUIRED_FIELD_MISSING') {
      steps.push({
        id: `step-missing-${issue.id}`,
        type: 'MISSING',
        issue,
      });
      continue;
    }

    // Other blocking error
    steps.push({
      id: `step-other-${issue.id}`,
      type: 'OTHER',
      issue,
    });
  }

  return steps;
}

export function GuidedResolutionModal(props: GuidedResolutionModalProps) {
  if (!props.isOpen) return null;
  return <GuidedResolutionModalContent {...props} />;
}

function GuidedResolutionModalContent({
  onClose,
  dataset,
  records,
  allIssues,
  onUpdateCell,
  onRemoveRecord,
  onProceedToExport,
}: GuidedResolutionModalProps) {
  const [queueSteps] = useState<GuidedStep[]>(() => buildGuidedSteps(allIssues, records, dataset));
  const [initialErrorCount] = useState<number>(() => allIssues.filter((i) => !i.isResolved && i.classification === 'ERROR').length);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [prevStepIndex, setPrevStepIndex] = useState(0);
  const [isCustomEditing, setIsCustomEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Compute live blocking errors
  const currentBlockingErrors = useMemo(() => {
    return allIssues.filter((i) => !i.isResolved && i.classification === 'ERROR').length;
  }, [allIssues]);

  const activeStep = queueSteps[currentStepIndex];
  const totalSteps = queueSteps.length;
  const isCompleted = totalSteps === 0 || currentStepIndex >= totalSteps;

  const getInitialInputForStep = (step: GuidedStep | undefined) => {
    if (!step) return '';
    const rec = records.find((r) => r._rowIndex === step.issue.rowIndex);
    const cellVal =
      rec?._cells[step.issue.fieldKey]?.workingValue ??
      rec?._cells[step.issue.fieldKey]?.finalValue ??
      rec?._cells[step.issue.fieldKey]?.originalValue ??
      rec?.[step.issue.fieldKey];

    if (step.type === 'NEGATIVE') {
      const num = Number(cellVal);
      return String(isNaN(num) ? '' : Math.abs(num));
    }
    return cellVal !== null && cellVal !== undefined ? String(cellVal) : '';
  };

  const [manualInput, setManualInput] = useState(() => getInitialInputForStep(queueSteps[0]));

  if (currentStepIndex !== prevStepIndex) {
    setPrevStepIndex(currentStepIndex);
    setIsCustomEditing(false);
    setManualInput(getInitialInputForStep(activeStep));
  }

  useEffect(() => {
    if (isCustomEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCustomEditing]);

  // Advance to next step
  const advanceToNext = () => {
    setIsCustomEditing(false);
    setCurrentStepIndex((prev) => prev + 1);
  };

  // 1. NEGATIVE NUMBER ACTIONS
  const handleUsePositiveValue = () => {
    if (!activeStep) return;
    const rec = records.find((r) => r._rowIndex === activeStep.issue.rowIndex);
    const cellVal =
      rec?._cells[activeStep.issue.fieldKey]?.workingValue ??
      rec?._cells[activeStep.issue.fieldKey]?.finalValue ??
      rec?._cells[activeStep.issue.fieldKey]?.originalValue ??
      rec?.[activeStep.issue.fieldKey];
    const num = Math.abs(Number(cellVal));
    onUpdateCell(activeStep.issue.rowIndex, activeStep.issue.fieldKey, num, true);
    advanceToNext();
  };

  const handleSaveManualValue = () => {
    if (!activeStep) return;
    const field = dataset.fields.find((f) => f.key === activeStep.issue.fieldKey);
    let val: unknown = manualInput.trim();
    if (field?.type === 'number' || field?.type === 'integer' || field?.type === 'float') {
      const num = Number(val);
      if (!isNaN(num) && val !== '') {
        val = num;
      }
    }
    onUpdateCell(activeStep.issue.rowIndex, activeStep.issue.fieldKey, val, true);
    setIsCustomEditing(false);
    advanceToNext();
  };

  // 2. DUPLICATE ACTIONS
  const handleKeepFirstDuplicate = () => {
    if (!activeStep || !activeStep.duplicatePair) return;
    const { recA, recB } = activeStep.duplicatePair;
    onRemoveRecord(
      recB._rowIndex,
      `User confirmed duplicate resolution: Kept Row ${recA._rowIndex}, removed duplicate Row ${recB._rowIndex}`
    );
    advanceToNext();
  };

  const handleKeepSecondDuplicate = () => {
    if (!activeStep || !activeStep.duplicatePair) return;
    const { recA, recB } = activeStep.duplicatePair;
    onRemoveRecord(
      recA._rowIndex,
      `User confirmed duplicate resolution: Kept Row ${recB._rowIndex}, removed duplicate Row ${recA._rowIndex}`
    );
    advanceToNext();
  };

  const handleKeepBothDuplicates = () => {
    // Both are kept, issue remains
    advanceToNext();
  };

  // Skip or Keep Original
  const handleSkipOrKeepOriginal = () => {
    advanceToNext();
  };

  // Helper to extract key fields for duplicate comparison
  const getDuplicateCardSummary = (record: CleanRecord) => {
    const keyFields = dataset.fields.filter(
      (f) => dataset.compositeKey.includes(f.key) || dataset.compositeKey.includes(f.officialHeader)
    );
    const otherFields = dataset.fields.filter(
      (f) =>
        !keyFields.includes(f) &&
        (f.key.toLowerCase().includes('barangay') ||
          f.key.toLowerCase().includes('street') ||
          f.key.toLowerCase().includes('address') ||
          f.key.toLowerCase().includes('name'))
    );
    const displayFields = [...keyFields, ...otherFields].slice(0, 4);

    return displayFields.map((f) => {
      const cell = record._cells[f.key];
      const val =
        cell?.workingValue ??
        cell?.finalValue ??
        cell?.originalValue ??
        record[f.key] ??
        '';
      return {
        header: f.officialHeader,
        value: String(val).trim() || '<empty>',
        isKey: keyFields.includes(f),
      };
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-7 space-y-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-inner">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Resolve Remaining Issues
              </h2>
              <p className="text-xs text-slate-500">
                Step-by-step guided workflow for non-automatic validation errors.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* COMPLETION VIEW */}
        {isCompleted ? (
          <div className="text-center py-6 space-y-5">
            {currentBlockingErrors === 0 ? (
              <>
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    All Blocking Issues Resolved
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    All blocking errors have been verified and corrected. The dataset is now 100% ready for official system population.
                  </p>
                </div>

                {/* Before vs After Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 max-w-md mx-auto grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-white rounded-xl border border-rose-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Before
                    </span>
                    <p className="text-xl font-black text-rose-600 mt-0.5">
                      {initialErrorCount} Blocking Errors
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      After
                    </span>
                    <p className="text-xl font-black text-emerald-600 mt-0.5">
                      0 Blocking Errors
                    </p>
                  </div>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onProceedToExport();
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Continue to Export</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Back to Review Table
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
                  <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Issue Review Completed
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    You chose to keep original values or retain duplicate records. {currentBlockingErrors} blocking error(s) remain before export can proceed.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 max-w-md mx-auto grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-white rounded-xl border border-rose-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Before
                    </span>
                    <p className="text-xl font-black text-rose-600 mt-0.5">
                      {initialErrorCount} Blocking Errors
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-amber-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      After
                    </span>
                    <p className="text-xl font-black text-amber-600 mt-0.5">
                      {currentBlockingErrors} Blocking Errors
                    </p>
                  </div>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStepIndex(0);
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    Review Issues Again
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Back to Review Table
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          /* ACTIVE STEP CONTENT */
          <div className="space-y-5">
            {/* Progress Bar & Header */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span className="text-blue-600">
                  Issue {currentStepIndex + 1} of {totalSteps}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  Row {activeStep.issue.rowIndex} • {activeStep.issue.fieldHeader}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* 1. NEGATIVE NUMBER RESOLUTION */}
            {activeStep.type === 'NEGATIVE' && (() => {
              const rec = records.find((r) => r._rowIndex === activeStep.issue.rowIndex);
              const cellVal =
                rec?._cells[activeStep.issue.fieldKey]?.workingValue ??
                rec?._cells[activeStep.issue.fieldKey]?.finalValue ??
                rec?._cells[activeStep.issue.fieldKey]?.originalValue ??
                rec?.[activeStep.issue.fieldKey];
              const originalNum = Number(cellVal);
              const suggestedPositive = Math.abs(isNaN(originalNum) ? 0 : originalNum);

              return (
                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-950">
                        Negative values are not allowed.
                      </h4>
                      <p className="text-xs text-amber-800 mt-0.5">
                        {activeStep.issue.fieldHeader} = <span className="font-mono font-bold text-rose-600">{String(cellVal)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Current vs Suggested Correction */}
                  <div className="p-3.5 bg-white rounded-xl border border-amber-200/80 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Current Value
                      </span>
                      <p className="text-sm font-mono font-bold text-rose-600 mt-0.5">
                        {String(cellVal)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Suggested correction
                      </span>
                      <p className="text-sm font-mono font-bold text-emerald-600 mt-0.5">
                        {suggestedPositive}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {isCustomEditing ? (
                    <div className="space-y-2 pt-2 border-t border-amber-200">
                      <label className="text-xs font-bold text-slate-700 block">
                        Enter Different Value for {activeStep.issue.fieldHeader}:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          ref={inputRef}
                          type="number"
                          value={manualInput}
                          onChange={(e) => setManualInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveManualValue()}
                          className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter positive number..."
                        />
                        <button
                          type="button"
                          onClick={handleSaveManualValue}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
                        >
                          Save &amp; Continue
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCustomEditing(false)}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleUsePositiveValue}
                        className="w-full sm:flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Use {suggestedPositive}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsCustomEditing(true)}
                        className="w-full sm:w-auto py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        Enter Different Value
                      </button>

                      <button
                        type="button"
                        onClick={handleSkipOrKeepOriginal}
                        className="w-full sm:w-auto py-2.5 px-3 text-slate-500 hover:text-slate-800 text-xs font-medium cursor-pointer"
                      >
                        Keep Original
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 2. DUPLICATE RECORD RESOLUTION (SIDE-BY-SIDE COMPARISON) */}
            {activeStep.type === 'DUPLICATE' && activeStep.duplicatePair && (() => {
              const { recA, recB } = activeStep.duplicatePair;
              const summaryA = getDuplicateCardSummary(recA);
              const summaryB = getDuplicateCardSummary(recB);

              return (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                    <Copy className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wide">
                        POSSIBLE DUPLICATE
                      </h4>
                      <p className="text-xs text-rose-800 mt-0.5">
                        Conflicting records share identical official identifying keys. Review both records below.
                      </p>
                    </div>
                  </div>

                  {/* Side-by-Side Comparison Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Row A */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="font-bold text-slate-900">Row {recA._rowIndex}</span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-blue-50 font-bold text-blue-700 border border-blue-200">
                          First Record
                        </span>
                      </div>

                      <div className="space-y-1.5 font-mono text-slate-800">
                        {summaryA.map((item, idx) => (
                          <div key={idx} className="text-[11px] leading-tight">
                            <span className="text-[10px] uppercase text-slate-400 block font-sans font-bold">
                              {item.header}
                            </span>
                            <span className={`block font-semibold ${item.isKey ? 'text-blue-900 bg-blue-50/60 px-1 py-0.5 rounded' : 'text-slate-800'}`}>
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleKeepFirstDuplicate}
                        className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Keep First Record</span>
                      </button>
                    </div>

                    {/* Row B */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="font-bold text-slate-900">Row {recB._rowIndex}</span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-purple-50 font-bold text-purple-700 border border-purple-200">
                          Second Record
                        </span>
                      </div>

                      <div className="space-y-1.5 font-mono text-slate-800">
                        {summaryB.map((item, idx) => (
                          <div key={idx} className="text-[11px] leading-tight">
                            <span className="text-[10px] uppercase text-slate-400 block font-sans font-bold">
                              {item.header}
                            </span>
                            <span className={`block font-semibold ${item.isKey ? 'text-blue-900 bg-blue-50/60 px-1 py-0.5 rounded' : 'text-slate-800'}`}>
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleKeepSecondDuplicate}
                        className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Keep Second Record</span>
                      </button>
                    </div>
                  </div>

                  {/* Keep Both Option & Explanation */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-[11px] text-slate-500 leading-tight">
                      <Info className="w-3.5 h-3.5 inline text-slate-400 mr-1" />
                      If Keep Both is selected, both records remain in the dataset, but the duplicate validation issue will remain unless the identifying fields are corrected.
                    </p>
                    <button
                      type="button"
                      onClick={handleKeepBothDuplicates}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer shadow-2xs"
                    >
                      Keep Both
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* 3. MISSING REQUIRED VALUES RESOLUTION */}
            {activeStep.type === 'MISSING' && (
              <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-rose-950">
                      Required Field is Missing
                    </h4>
                    <p className="text-xs text-rose-800 mt-0.5">
                      {activeStep.issue.fieldHeader} = <span className="font-mono font-bold text-rose-600">&lt;empty&gt;</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-rose-200">
                  <label className="text-xs font-bold text-slate-700 block">
                    {activeStep.issue.fieldHeader} <span className="text-rose-500">*</span>
                  </label>

                  {/* If field has acceptedValues, show dropdown */}
                  {(() => {
                    const field = dataset.fields.find((f) => f.key === activeStep.issue.fieldKey);
                    const accepted = field?.acceptedValues;
                    if (accepted && accepted.length > 0) {
                      return (
                        <select
                          value={manualInput}
                          onChange={(e) => setManualInput(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select official {activeStep.issue.fieldHeader}...</option>
                          {accepted.map((opt: string) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      );
                    }
                    return (
                      <input
                        ref={inputRef}
                        type="text"
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveManualValue()}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter ${activeStep.issue.fieldHeader}...`}
                      />
                    );
                  })()}

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!manualInput.trim()}
                      onClick={handleSaveManualValue}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                    >
                      Save &amp; Continue
                    </button>
                    <button
                      type="button"
                      onClick={handleSkipOrKeepOriginal}
                      className="px-3 py-2 text-slate-500 hover:text-slate-800 text-xs font-medium cursor-pointer"
                    >
                      Skip For Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. OTHER BLOCKING ERRORS */}
            {activeStep.type === 'OTHER' && (
              <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-rose-950">
                      Invalid Value for {activeStep.issue.fieldHeader}
                    </h4>
                    <p className="text-xs text-rose-800 mt-0.5">
                      {activeStep.issue.message}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-rose-200">
                  <label className="text-xs font-bold text-slate-700 block">
                    Corrected {activeStep.issue.fieldHeader} <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveManualValue()}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter valid value..."
                  />

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!manualInput.trim()}
                      onClick={handleSaveManualValue}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                    >
                      Save &amp; Continue
                    </button>
                    <button
                      type="button"
                      onClick={handleSkipOrKeepOriginal}
                      className="px-3 py-2 text-slate-500 hover:text-slate-800 text-xs font-medium cursor-pointer"
                    >
                      Skip For Now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
