'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  CleanRecord,
  DatasetDefinition,
  FieldDefinition,
  QualityReport,
  RuleClassification,
  ValidationIssue,
} from '@/lib/types';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wand2,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X,
  Edit3,
  RotateCcw,
  Sparkles,
  Info,
  Check,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { GuidedResolutionModal } from './GuidedResolutionModal';

interface SafeFixesResult {
  fixedCount: number;
  previousReadiness: number;
  newReadiness: number;
  errorCount: number;
  remainingBreakdown?: {
    missingValues: number;
    numericIssues: number;
    duplicates: number;
    invalidDates: number;
    otherIssues: number;
  };
}

interface RevalidateResult {
  errorCount: number;
  readinessScore: number;
  isReadyForImport: boolean;
}

interface Step4ReviewWorkspaceProps {
  system: 'DBL' | 'ODeSSEE';
  dataset: DatasetDefinition;
  fileName: string;
  records: CleanRecord[];
  allIssues: ValidationIssue[];
  qualityReport: QualityReport;
  initialOpenPanel?: boolean;
  onUpdateCell: (rowIndex: number, fieldKey: string, newValue: unknown, isManual?: boolean) => void;
  onResetCellToOriginal: (rowIndex: number, fieldKey: string) => void;
  onRemoveRecord: (rowIndex: number, reason?: string) => void;
  onApplyAllSafeFixes: () => SafeFixesResult;
  onRevalidate: () => RevalidateResult;
  onProceedToExport: () => void;
}

interface ToastInfo {
  id: number;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface FeedbackModalState {
  isOpen: boolean;
  type: 'AUTO_FIX_SUCCESS' | 'NO_AUTO_FIX' | 'VALIDATION_ERRORS' | 'VALIDATION_SUCCESS';
  title: string;
  fixedCount?: number;
  errorCount?: number;
  previousReadiness?: number;
  newReadiness?: number;
  remainingBreakdown?: {
    missingValues: number;
    numericIssues: number;
    duplicates: number;
    invalidDates: number;
    otherIssues: number;
  };
}

export function Step4ReviewWorkspace({
  system,
  dataset,
  fileName,
  records,
  allIssues,
  qualityReport,
  initialOpenPanel = false,
  onUpdateCell,
  onResetCellToOriginal,
  onRemoveRecord,
  onApplyAllSafeFixes,
  onRevalidate,
  onProceedToExport,
}: Step4ReviewWorkspaceProps) {
  const [statusFilter, setStatusFilter] = useState<'ALL' | RuleClassification>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // Guided Resolution Wizard State
  const [isGuidedWizardOpen, setIsGuidedWizardOpen] = useState(false);

  // Button Loading and Confirmation States
  const [isApplyingFixes, setIsApplyingFixes] = useState(false);
  const [safeFixesSuccess, setSafeFixesSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validateSuccess, setValidateSuccess] = useState(false);

  // Toast System
  const [toast, setToast] = useState<ToastInfo | null>(null);
  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  };

  // Feedback Modal System
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalState>({
    isOpen: false,
    type: 'NO_AUTO_FIX',
    title: '',
  });

  // Selected cell for the Right-Side Review Panel
  const [selectedCell, setSelectedCell] = useState<{
    rowIndex: number;
    field: FieldDefinition;
  } | null>(() => {
    if (!initialOpenPanel) return null;
    const problemRecord = records.find(
      (r) => r._status === 'ERROR' || r._status === 'AUTO-FIX-AVAILABLE' || r._status === 'AUTO-FIX'
    );
    if (!problemRecord) return null;
    for (const f of dataset.fields) {
      const cell = problemRecord._cells[f.key];
      if (cell && (cell.issues.length > 0 || cell.changes.length > 0)) {
        return { rowIndex: problemRecord._rowIndex, field: f };
      }
    }
    return null;
  });

  const [isEditingManually, setIsEditingManually] = useState(false);
  const [manualInputValue, setManualInputValue] = useState('');
  const manualInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingManually && manualInputRef.current) {
      manualInputRef.current.focus();
    }
  }, [isEditingManually]);

  const {
    readinessScore,
    totalRecords,
    validRecords,
    autoCleanedRecords,
    autoFixAvailableRecords,
    autoFixAvailableCells,
    errorRecords,
    issueCounts,
  } = qualityReport;

  const hasPendingFixes = (autoFixAvailableRecords || 0) > 0 || (autoFixAvailableCells || 0) > 0;
  const isDbl = system === 'DBL';
  const isReadyForImport = errorRecords === 0 && !hasPendingFixes;

  // Filter records based on status filter and search term
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'AUTO-FIX-AVAILABLE') {
          if (r._status !== 'AUTO-FIX-AVAILABLE' && !r._pendingAutoFix) return false;
        } else if (statusFilter === 'AUTO-FIX') {
          if (r._status !== 'AUTO-FIX' && r._status !== 'AUTO-FIX-AVAILABLE') return false;
        } else if (r._status !== statusFilter) {
          return false;
        }
      }
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchesRow = String(r._rowIndex).includes(term);
        const matchesField = dataset.fields.some((f) => {
          const val = r._cells[f.key]?.workingValue ?? r[f.key];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(term);
        });
        return matchesRow || matchesField;
      }
      return true;
    });
  }, [records, statusFilter, searchTerm, dataset.fields]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Selected Cell State
  const activeRecord = selectedCell ? records.find((r) => r._rowIndex === selectedCell.rowIndex) : null;
  const activeCellState = activeRecord && selectedCell ? activeRecord._cells[selectedCell.field.key] : null;

  // Handler to open right side panel
  const handleCellClick = (rowIndex: number, field: FieldDefinition) => {
    const record = records.find((r) => r._rowIndex === rowIndex);
    const cellState = record?._cells[field.key];
    setSelectedCell({ rowIndex, field });
    setIsEditingManually(false);
    const curVal =
      cellState?.workingValue !== undefined
        ? cellState.workingValue
        : cellState?.finalValue !== null && cellState?.finalValue !== undefined
        ? cellState.finalValue
        : record?.[field.key];
    setManualInputValue(curVal !== null && curVal !== undefined ? String(curVal) : '');
  };

  // 1. APPLY ALL SAFE FIXES HANDLER
  const handleApplyAllSafeFixesClick = () => {
    setIsApplyingFixes(true);

    setTimeout(() => {
      const result = onApplyAllSafeFixes();
      setIsApplyingFixes(false);

      if (result.fixedCount > 0) {
        setSafeFixesSuccess(true);
        setTimeout(() => setSafeFixesSuccess(false), 2500);
        showToast(
          `✓ ${result.fixedCount} safe fix${result.fixedCount > 1 ? 'es' : ''} applied.`,
          'success'
        );

        setFeedbackModal({
          isOpen: true,
          type: 'AUTO_FIX_SUCCESS',
          title: 'Automatic Cleaning Complete',
          fixedCount: result.fixedCount,
          errorCount: result.errorCount,
          previousReadiness: result.previousReadiness,
          newReadiness: result.newReadiness,
          remainingBreakdown: result.remainingBreakdown,
        });
      } else {
        showToast('ℹ No automatic fixes available.', 'info');

        setFeedbackModal({
          isOpen: true,
          type: 'NO_AUTO_FIX',
          title: 'No Automatic Fixes Available',
          fixedCount: 0,
          errorCount: result.errorCount,
          remainingBreakdown: result.remainingBreakdown,
        });
      }
    }, 300);
  };

  // 2. VALIDATE AGAIN HANDLER
  const handleValidateAgainClick = () => {
    setIsValidating(true);

    setTimeout(() => {
      const result = onRevalidate();
      setIsValidating(false);
      setValidateSuccess(true);
      setTimeout(() => setValidateSuccess(false), 2500);

      if (result.isReadyForImport) {
        showToast('✓ Dataset is ready for import.', 'success');
        setFeedbackModal({
          isOpen: true,
          type: 'VALIDATION_SUCCESS',
          title: 'Validation Successful',
          errorCount: 0,
          newReadiness: result.readinessScore,
        });
      } else {
        showToast(
          `⚠ ${result.errorCount} blocking error${result.errorCount > 1 ? 's' : ''} remain.`,
          'warning'
        );
        setFeedbackModal({
          isOpen: true,
          type: 'VALIDATION_ERRORS',
          title: 'Validation Complete',
          errorCount: result.errorCount,
          newReadiness: result.readinessScore,
        });
      }
    }, 300);
  };

  // SVG Radial Progress ring math
  const ringRadius = 38;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (readinessScore / 100) * ringCircumference;

  const ringColor =
    readinessScore >= 95
      ? 'text-emerald-500'
      : readinessScore >= 75
      ? 'text-blue-500'
      : readinessScore >= 50
      ? 'text-amber-500'
      : 'text-rose-500';

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 relative">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900/95 text-white shadow-2xl border border-slate-700/60 backdrop-blur-md text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
          {toast.type === 'error' && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Guided Resolution Modal Component */}
      <GuidedResolutionModal
        isOpen={isGuidedWizardOpen}
        onClose={() => setIsGuidedWizardOpen(false)}
        dataset={dataset}
        records={records}
        allIssues={allIssues}
        onUpdateCell={(rowIndex, fieldKey, newValue, isManual) => {
          onUpdateCell(rowIndex, fieldKey, newValue, isManual);
          showToast('✓ Changes saved.', 'success');
        }}
        onRemoveRecord={(rowIndex, reason) => {
          onRemoveRecord(rowIndex, reason);
          showToast('✓ Duplicate record removed.', 'info');
        }}
        onProceedToExport={onProceedToExport}
      />

      {/* Action Feedback Modal Dialog */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start gap-4">
              {feedbackModal.type === 'AUTO_FIX_SUCCESS' ? (
                <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
              ) : feedbackModal.type === 'NO_AUTO_FIX' ? (
                <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5" />
                </div>
              ) : feedbackModal.type === 'VALIDATION_ERRORS' ? (
                <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  {feedbackModal.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {feedbackModal.type === 'AUTO_FIX_SUCCESS'
                    ? 'Deterministic formatting and whitespace corrections applied.'
                    : feedbackModal.type === 'NO_AUTO_FIX'
                    ? 'Review and manual verification required.'
                    : feedbackModal.type === 'VALIDATION_ERRORS'
                    ? 'Official template validation report.'
                    : 'Dataset verified and ready for database import.'}
                </p>
              </div>

              <button
                onClick={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-3 text-xs text-slate-600">
              {feedbackModal.type === 'AUTO_FIX_SUCCESS' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between text-blue-900 font-bold">
                    <span>{feedbackModal.fixedCount} records automatically cleaned.</span>
                    <span className="text-sm font-black text-blue-600">✓ Done</span>
                  </div>

                  {feedbackModal.errorCount !== undefined && feedbackModal.errorCount > 0 ? (
                    <div className="pt-2 border-t border-slate-200 text-rose-700 font-bold flex items-center gap-1.5 text-xs">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{feedbackModal.errorCount} records require user correction.</span>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-200 text-emerald-800 font-bold flex items-center gap-1.5 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Dataset Ready for Import</span>
                    </div>
                  )}

                  {/* Remaining Issues Breakdown */}
                  {feedbackModal.remainingBreakdown && (feedbackModal.errorCount || 0) > 0 && (
                    <div className="pt-2 border-t border-slate-200/80 space-y-1.5 text-xs text-slate-700">
                      <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                        Remaining Issues:
                      </span>
                      {feedbackModal.remainingBreakdown.missingValues > 0 && (
                        <p className="flex items-center gap-1.5 text-rose-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>{feedbackModal.remainingBreakdown.missingValues} missing required value(s)</span>
                        </p>
                      )}
                      {feedbackModal.remainingBreakdown.numericIssues > 0 && (
                        <p className="flex items-center gap-1.5 text-rose-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>{feedbackModal.remainingBreakdown.numericIssues} invalid numeric value(s)</span>
                        </p>
                      )}
                      {feedbackModal.remainingBreakdown.duplicates > 0 && (
                        <p className="flex items-center gap-1.5 text-rose-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>{feedbackModal.remainingBreakdown.duplicates} possible duplicate(s)</span>
                        </p>
                      )}
                    </div>
                  )}

                  {feedbackModal.previousReadiness !== undefined &&
                    feedbackModal.newReadiness !== undefined &&
                    feedbackModal.newReadiness !== feedbackModal.previousReadiness && (
                      <div className="pt-2 border-t border-slate-200 text-emerald-800 font-bold flex items-center justify-between">
                        <span>Readiness Improved:</span>
                        <span>
                          {feedbackModal.previousReadiness}% → {feedbackModal.newReadiness}%
                        </span>
                      </div>
                    )}
                </div>
              )}

              {feedbackModal.type === 'NO_AUTO_FIX' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 leading-relaxed space-y-3">
                  <p>
                    DataClean checked the dataset, but the remaining issues require your review or missing/correct
                    information. No values were changed.
                  </p>

                  {/* Remaining Breakdown */}
                  {feedbackModal.remainingBreakdown && (
                    <div className="pt-2 border-t border-slate-200/80 space-y-1.5 text-xs text-slate-700">
                      <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                        Remaining Issues:
                      </span>
                      {feedbackModal.remainingBreakdown.missingValues > 0 && (
                        <p className="flex items-center gap-1.5 text-rose-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>{feedbackModal.remainingBreakdown.missingValues} missing required value(s)</span>
                        </p>
                      )}
                      {feedbackModal.remainingBreakdown.numericIssues > 0 && (
                        <p className="flex items-center gap-1.5 text-rose-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>{feedbackModal.remainingBreakdown.numericIssues} invalid numeric value(s)</span>
                        </p>
                      )}
                      {feedbackModal.remainingBreakdown.duplicates > 0 && (
                        <p className="flex items-center gap-1.5 text-rose-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>{feedbackModal.remainingBreakdown.duplicates} possible duplicate(s)</span>
                        </p>
                      )}
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 font-medium">
                    Safe cleaners only normalize deterministic values. Missing values, invalid business numbers, or
                    duplicates will never be automatically altered or deleted.
                  </p>
                </div>
              )}

              {feedbackModal.type === 'VALIDATION_ERRORS' && (
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2 text-rose-950">
                  <p className="font-bold text-xs">
                    {feedbackModal.errorCount} blocking error(s) are still preventing this dataset from being imported.
                  </p>
                </div>
              )}

              {feedbackModal.type === 'VALIDATION_SUCCESS' && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-1">
                  <p className="font-bold text-xs">✓ All required validation checks passed.</p>
                  <p className="text-xs text-emerald-800">
                    Dataset is 100% compliant with the official government schema and ready for official import.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              {feedbackModal.type === 'AUTO_FIX_SUCCESS' && (
                <>
                  {(feedbackModal.errorCount || 0) > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
                        setIsGuidedWizardOpen(true);
                      }}
                      className="w-full sm:flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>Resolve Remaining Issues ({feedbackModal.errorCount})</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onProceedToExport}
                      className="w-full sm:flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                      Proceed to Export →
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
                    className="w-full sm:w-auto py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </>
              )}

              {feedbackModal.type === 'NO_AUTO_FIX' && (
                <>
                  {(feedbackModal.errorCount || 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
                        setIsGuidedWizardOpen(true);
                      }}
                      className="w-full sm:flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>Resolve Remaining Issues ({feedbackModal.errorCount})</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
                    className="w-full sm:w-auto py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                </>
              )}

              {feedbackModal.type === 'VALIDATION_ERRORS' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
                      setIsGuidedWizardOpen(true);
                    }}
                    className="w-full sm:flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Resolve Remaining Issues ({feedbackModal.errorCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
                    className="w-full sm:w-auto py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                </>
              )}

              {feedbackModal.type === 'VALIDATION_SUCCESS' && (
                <>
                  <button
                    type="button"
                    onClick={onProceedToExport}
                    className="w-full sm:flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Validate &amp; Export</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
                    className="w-full sm:w-auto py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Stay on Review
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Breadcrumb & Metadata Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-9 px-2.5 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs flex items-center">
            <Image
              src={isDbl ? '/DBL-LOGO.png' : '/ODESSEEE-LOGO.png'}
              alt={`${system} Logo`}
              width={90}
              height={18}
              className="h-4 w-auto object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                {system} / {dataset.name}
              </span>
              <span className="text-[11px] font-mono text-slate-500">• {fileName}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {dataset.fields.length} official columns • {totalRecords.toLocaleString()} records processed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isReadyForImport ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dataset Ready for Import</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>{errorRecords} Blocking Error(s) Remaining</span>
            </span>
          )}
        </div>
      </div>

      {/* 9. DATA QUALITY WORKSPACE (HERO + METRICS) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-6 border-b border-slate-100">
          {/* Radial Progress Ring & Title */}
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={ringRadius}
                  className="text-slate-100"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={ringRadius}
                  className={`${ringColor} transition-all duration-700 ease-out`}
                  strokeWidth="8"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                  {readinessScore}%
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                  Health
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Data Readiness Evaluation
              </span>
              {/* REFINED READINESS STATUS MESSAGING */}
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {errorRecords > 0
                  ? 'Action Required'
                  : hasPendingFixes
                  ? 'Formatting Corrections Available'
                  : 'Ready for Official Import'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-md leading-relaxed">
                {errorRecords > 0
                  ? `${errorRecords} blocking issue${errorRecords > 1 ? 's' : ''} must be resolved before import.`
                  : hasPendingFixes
                  ? `${autoFixAvailableCells || autoFixAvailableRecords} formatting issue${(autoFixAvailableCells || autoFixAvailableRecords) > 1 ? 's' : ''} can be automatically corrected.`
                  : 'All required validation checks passed. Dataset is 100% ready for official system population.'}
              </p>
            </div>
          </div>

          {/* Action Box with Apply All Safe Fixes + Prominent Resolve Remaining Issues */}
          <div className="lg:text-right flex flex-col sm:flex-row lg:flex-col items-end gap-2.5 max-w-md">
            <div className="flex flex-wrap items-center gap-2 justify-end">
              <button
                type="button"
                disabled={isApplyingFixes}
                onClick={handleApplyAllSafeFixesClick}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ${
                  safeFixesSuccess
                    ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                    : isApplyingFixes
                    ? 'bg-blue-400 text-white cursor-wait'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isApplyingFixes ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Fixing Automatically...</span>
                  </>
                ) : safeFixesSuccess ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>✓ Fixes Applied</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Fix All Automatically</span>
                  </>
                )}
              </button>

              {/* SECOND PROMINENT BUTTON: RESOLVE REMAINING ISSUES */}
              {errorRecords > 0 && (
                <button
                  type="button"
                  onClick={() => setIsGuidedWizardOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Resolve Remaining Issues ({errorRecords})</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed text-right">
              {errorRecords > 0
                ? 'Safe fixes resolve deterministic formatting. Click Resolve Remaining Issues to fix blocking errors with guided suggestions.'
                : 'Only deterministic corrections will be applied. Missing or uncertain information will never be guessed.'}
            </p>
          </div>
        </div>

        {/* 3 INTERACTIVE SUMMARY METRIC CARDS (Filterable on Click) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
          {/* Valid */}
          <button
            type="button"
            onClick={() => {
              setStatusFilter('VALID');
              setPage(1);
            }}
            className={`p-4 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between ${
              statusFilter === 'VALID'
                ? 'bg-emerald-100/90 border-2 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-emerald-50/60 border border-emerald-200/80 hover:bg-emerald-100/50 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-800 mb-1">
              <span className="text-xs font-bold">Valid</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-950">{validRecords.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-700 font-medium mt-0.5">Complies with all rules</p>
          </button>

          {/* Auto-Fix Available / Auto-Cleaned */}
          <button
            type="button"
            onClick={() => {
              setStatusFilter(hasPendingFixes ? 'AUTO-FIX-AVAILABLE' : 'AUTO-FIX');
              setPage(1);
            }}
            className={`p-4 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between ${
              statusFilter === 'AUTO-FIX' || statusFilter === 'AUTO-FIX-AVAILABLE'
                ? 'bg-blue-100/90 border-2 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                : 'bg-blue-50/60 border border-blue-200/80 hover:bg-blue-100/50 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-blue-800 mb-1">
              <span className="text-xs font-bold">
                {hasPendingFixes ? 'Auto-Fix Available' : 'Auto-Cleaned'}
              </span>
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-blue-950">
              {(hasPendingFixes ? (autoFixAvailableRecords || 0) : autoCleanedRecords).toLocaleString()}
            </p>
            <p className="text-[10px] text-blue-700 font-medium mt-0.5">
              {hasPendingFixes ? 'Can be automatically fixed' : 'Trimmed & standardized'}
            </p>
          </button>

          {/* Must Be Fixed */}
          <button
            type="button"
            onClick={() => {
              setStatusFilter('ERROR');
              setPage(1);
            }}
            className={`p-4 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between ${
              statusFilter === 'ERROR'
                ? 'bg-rose-100/90 border-2 border-rose-500 shadow-md ring-2 ring-rose-500/20'
                : 'bg-rose-50/60 border border-rose-200/80 hover:bg-rose-100/50 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-rose-800 mb-1">
              <span className="text-xs font-bold">Must Be Fixed</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-black text-rose-950">{errorRecords.toLocaleString()}</p>
            <p className="text-[10px] text-rose-700 font-medium mt-0.5">Blocks official import</p>
          </button>
        </div>

        {/* Issue Summary Strip */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4 text-xs text-slate-600">
          <span className="font-bold text-slate-800">Issue Breakdown:</span>
          <div className="flex items-center gap-4 flex-wrap text-[11px]">
            <span>
              Missing Information: <strong>{issueCounts.missingValues}</strong>
            </span>
            <span>
              Formatting: <strong>{issueCounts.formattingIssues}</strong>
            </span>
            <span>
              Duplicates: <strong>{issueCounts.duplicates}</strong>
            </span>
            <span>
              Invalid Dates: <strong>{issueCounts.invalidDates}</strong>
            </span>
            <span>
              Categories &amp; Locations:{' '}
              <strong>{issueCounts.invalidCategories + issueCounts.locationIssues}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 10. SPREADSHEET REVIEW WORKSPACE WITH SLIDE-OVER REVIEW PANEL */}
      <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({totalRecords})
            </button>

            <button
              onClick={() => {
                setStatusFilter('VALID');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'VALID'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Valid ({validRecords})</span>
            </button>

            <button
              onClick={() => {
                setStatusFilter(hasPendingFixes ? 'AUTO-FIX-AVAILABLE' : 'AUTO-FIX');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'AUTO-FIX' || statusFilter === 'AUTO-FIX-AVAILABLE'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>
                {hasPendingFixes
                  ? `Auto-Fix Available (${autoFixAvailableRecords || autoCleanedRecords})`
                  : `Auto-Cleaned (${autoCleanedRecords})`}
              </span>
            </button>

            <button
              onClick={() => {
                setStatusFilter('ERROR');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'ERROR'
                  ? 'bg-rose-600 text-white shadow-xs font-bold'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Must Be Fixed ({errorRecords})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Lightweight Spreadsheet Table */}
        <div className="overflow-x-auto max-h-[520px] spreadsheet-scrollbar">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 shadow-2xs">
              <tr>
                <th className="py-2.5 px-3 font-mono font-bold text-slate-500 w-16 text-center bg-slate-50">
                  #
                </th>
                <th className="py-2.5 px-3 font-bold text-slate-700 w-28 bg-slate-50">
                  Status
                </th>
                {dataset.fields.map((field) => (
                  <th
                    key={field.key}
                    className="py-2.5 px-3 font-bold text-slate-700 whitespace-nowrap bg-slate-50 border-l border-slate-200/60"
                  >
                    <span>{field.officialHeader}</span>
                    {field.required && <span className="text-rose-500 ml-1 font-bold">*</span>}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={dataset.fields.length + 2}
                    className="py-12 text-center text-xs text-slate-400"
                  >
                    No matching records found for current filter.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record, rIdx) => {
                  const isEven = rIdx % 2 === 0;

                  return (
                    <tr
                      key={record._rowIndex}
                      id={`record-row-${record._rowIndex}`}
                      className={`hover:bg-blue-50/30 transition-colors ${
                        isEven ? 'bg-white' : 'bg-slate-50/40'
                      }`}
                    >
                      {/* Row Number */}
                      <td className="py-2 px-3 font-mono text-center text-slate-400 select-none">
                        {record._rowIndex}
                      </td>

                      {/* Status Icon + Text + Color */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        {record._status === 'ERROR' ? (
                          <button
                            type="button"
                            onClick={() => {
                              const errField =
                                dataset.fields.find((f) => record._cells[f.key]?.status === 'ERROR') ||
                                dataset.fields[0];
                              handleCellClick(record._rowIndex, errField);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 hover:bg-rose-200 transition-colors cursor-pointer"
                          >
                            <XCircle className="w-3 h-3 text-rose-600" /> Must Fix
                          </button>
                        ) : record._status === 'AUTO-FIX-AVAILABLE' ? (
                          <button
                            type="button"
                            onClick={() => {
                              const fixField =
                                dataset.fields.find(
                                  (f) =>
                                    record._cells[f.key]?.status === 'AUTO-FIX-AVAILABLE' ||
                                    record._cells[f.key]?.pendingFix
                                ) || dataset.fields[0];
                              handleCellClick(record._rowIndex, fixField);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors cursor-pointer"
                          >
                            <Wand2 className="w-3 h-3 text-indigo-600" /> Auto-Fix Available
                          </button>
                        ) : record._status === 'AUTO-FIX' ? (
                          <button
                            type="button"
                            onClick={() => {
                              const fixField =
                                dataset.fields.find(
                                  (f) =>
                                    record._cells[f.key]?.status === 'AUTO-FIX' ||
                                    record._cells[f.key]?.autoCleaned
                                ) || dataset.fields[0];
                              handleCellClick(record._rowIndex, fixField);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                          >
                            <Check className="w-3 h-3 text-blue-600 stroke-[3]" /> Auto-Cleaned
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 select-none">
                            <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> Valid
                          </span>
                        )}
                      </td>

                      {/* Data Cells */}
                      {dataset.fields.map((field) => {
                        const cellState = record._cells[field.key];
                        const val = cellState
                          ? cellState.workingValue !== undefined
                            ? cellState.workingValue
                            : cellState.finalValue !== null && cellState.finalValue !== undefined
                            ? cellState.finalValue
                            : cellState.originalValue
                          : record[field.key];
                        const cellStatus = cellState ? cellState.status : 'VALID';

                        const isError = cellStatus === 'ERROR';
                        const isPendingFix =
                          cellStatus === 'AUTO-FIX-AVAILABLE' || Boolean(cellState?.pendingFix);
                        const isCleaned =
                          cellStatus === 'AUTO-FIX' || Boolean(cellState?.autoCleaned);
                        const isSelected =
                          selectedCell?.rowIndex === record._rowIndex &&
                          selectedCell?.field.key === field.key;

                        return (
                          <td
                            key={field.key}
                            onClick={() => handleCellClick(record._rowIndex, field)}
                            className={`py-2 px-3 whitespace-nowrap border-l border-slate-100 font-normal transition-colors cursor-pointer select-text ${
                              isSelected
                                ? 'ring-2 ring-blue-600 bg-blue-50/80 font-semibold'
                                : isError
                                ? 'bg-rose-50/80 text-rose-950 font-medium hover:bg-rose-100/80'
                                : isPendingFix
                                ? 'bg-indigo-50/60 text-indigo-950 hover:bg-indigo-100/60'
                                : isCleaned
                                ? 'bg-blue-50/40 text-blue-950 hover:bg-blue-100/40'
                                : 'hover:bg-slate-100/60 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate max-w-[200px]">
                                {val !== null && val !== undefined && val !== '' ? (
                                  String(val)
                                ) : (
                                  <span className="text-slate-300 italic font-mono text-[10px]">
                                    (empty)
                                  </span>
                                )}
                              </span>
                              {(isError || isPendingFix) && (
                                <span
                                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                    isError
                                      ? 'bg-rose-500'
                                      : 'bg-indigo-500'
                                  }`}
                                />
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Strip */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/60 text-xs text-slate-500">
          <div>
            Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong>{Math.min(currentPage * pageSize, filteredRecords.length)}</strong> of{' '}
            <strong>{filteredRecords.length.toLocaleString()}</strong> records
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-semibold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RIGHT-SIDE REVIEW PANEL (DRAWER) */}
        {selectedCell && activeRecord && activeCellState && (
          <div className="absolute top-0 right-0 bottom-0 w-80 sm:w-96 bg-white border-l border-slate-200 shadow-2xl z-20 flex flex-col justify-between animate-in slide-in-from-right-4 duration-150">
            <div>
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Review Issue</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-700">
                      Row {selectedCell.rowIndex}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    {selectedCell.field.officialHeader}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedCell(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-5 space-y-4 text-xs">
                {/* Status Badge */}
                <div>
                  {activeCellState.status === 'ERROR' ? (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2.5">
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-[11px] uppercase tracking-wide">Must Be Fixed</p>
                        <p className="text-xs mt-0.5 leading-relaxed">
                          {activeCellState.issues[0]?.message || 'Required field missing or invalid.'}
                        </p>
                      </div>
                    </div>
                  ) : activeCellState.status === 'AUTO-FIX-AVAILABLE' || activeCellState.pendingFix ? (
                    <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-start gap-2.5">
                      <Wand2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-[11px] uppercase tracking-wide">Auto-Fix Available</p>
                        <p className="text-xs mt-0.5 leading-relaxed">
                          {activeCellState.pendingFix?.description ||
                            activeCellState.issues[0]?.message ||
                            'Safe formatting correction detected.'}
                        </p>
                      </div>
                    </div>
                  ) : activeCellState.status === 'AUTO-FIX' || activeCellState.autoCleaned ? (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-[11px] uppercase tracking-wide">Auto-Cleaned</p>
                        <p className="text-xs mt-0.5 leading-relaxed">
                          {activeCellState.changes.map((c) => c.actionType).join('; ') || 'Standardized value.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold">Cell is valid according to official schema.</span>
                    </div>
                  )}
                </div>

                {/* ORIGINAL VALUE */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Original Value
                  </span>
                  <p className="text-xs font-mono font-semibold text-slate-800 mt-1">
                    {activeCellState.originalValue !== null &&
                    activeCellState.originalValue !== undefined &&
                    activeCellState.originalValue !== ''
                      ? `"${String(activeCellState.originalValue)}"`
                      : '<empty>'}
                  </p>
                </div>

                {/* CURRENT VALUE */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Current Value
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-900 mt-1">
                    {activeCellState.workingValue !== null &&
                    activeCellState.workingValue !== undefined &&
                    activeCellState.workingValue !== ''
                      ? `"${String(activeCellState.workingValue)}"`
                      : activeCellState.finalValue !== null &&
                        activeCellState.finalValue !== undefined &&
                        activeCellState.finalValue !== ''
                      ? `"${String(activeCellState.finalValue)}"`
                      : '<empty>'}
                  </p>
                </div>

                {/* SUGGESTED FIX */}
                {(activeCellState.pendingFix || activeCellState.issues[0]?.suggestedValue !== undefined) && (
                  <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Suggested Fix
                    </span>
                    <p className="text-xs font-mono font-bold text-emerald-950 mt-1">
                      {`"${String(activeCellState.pendingFix?.suggestedValue ?? activeCellState.issues[0]?.suggestedValue)}"`}
                    </p>
                    {activeCellState.pendingFix?.rules && activeCellState.pendingFix.rules.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {activeCellState.pendingFix.rules.map((r, i) => (
                          <span
                            key={i}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* REASON / WHY IT WAS FLAGGED */}
                {activeCellState.issues.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Problem &amp; Required Action
                    </span>
                    <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                      {activeCellState.issues[0]?.message}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 mt-1">
                      Rule ID: {activeCellState.issues[0]?.ruleId}
                    </p>
                  </div>
                )}

                {/* MANUAL EDIT INPUT */}
                {isEditingManually && (
                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-blue-900 block">
                      {(activeCellState.workingValue ?? activeCellState.finalValue) === '' ||
                      (activeCellState.workingValue ?? activeCellState.finalValue) === null
                        ? 'Enter Correct Value:'
                        : 'Edit Value:'}
                    </label>
                    <input
                      ref={manualInputRef}
                      type="text"
                      value={manualInputValue}
                      onChange={(e) => setManualInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onUpdateCell(selectedCell.rowIndex, selectedCell.field.key, manualInputValue, true);
                          showToast('✓ Changes saved.', 'success');
                          setIsEditingManually(false);
                        }
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateCell(selectedCell.rowIndex, selectedCell.field.key, manualInputValue, true);
                          showToast('✓ Changes saved.', 'success');
                          setIsEditingManually(false);
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-bold cursor-pointer transition-colors shadow-xs"
                      >
                        Save Value
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingManually(false)}
                        className="px-2 py-1 text-slate-600 hover:text-slate-800 text-[11px] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
              {(activeCellState.pendingFix?.suggestedValue !== undefined ||
                activeCellState.issues[0]?.suggestedValue !== undefined) && (
                <button
                  type="button"
                  onClick={() => {
                    const suggested =
                      activeCellState.pendingFix?.suggestedValue !== undefined
                        ? activeCellState.pendingFix.suggestedValue
                        : activeCellState.issues[0]?.suggestedValue;
                    onUpdateCell(
                      selectedCell.rowIndex,
                      selectedCell.field.key,
                      suggested
                    );
                    showToast('✓ Suggestion accepted.', 'success');
                    setSelectedCell(null);
                  }}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>
                    Accept Suggestion (&quot;
                    {String(
                      activeCellState.pendingFix?.suggestedValue ??
                        activeCellState.issues[0]?.suggestedValue
                    )}
                    &quot;)
                  </span>
                </button>
              )}

              {/* Action buttons based on cell state */}
              {!isEditingManually && (
                <button
                  type="button"
                  onClick={() => setIsEditingManually(true)}
                  className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>
                    {activeCellState.status === 'ERROR' &&
                    ((activeCellState.workingValue ?? activeCellState.finalValue) === '' ||
                      (activeCellState.workingValue ?? activeCellState.finalValue) === null)
                      ? 'Enter Correct Value'
                      : activeCellState.status === 'ERROR'
                      ? 'Edit Value'
                      : 'Edit Manually'}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onResetCellToOriginal(selectedCell.rowIndex, selectedCell.field.key);
                  showToast('Original value retained.', 'info');
                  setSelectedCell(null);
                }}
                className="w-full py-1.5 px-3 text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Keep Original</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Final Validation & Proceed Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isValidating}
            onClick={handleValidateAgainClick}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              validateSuccess
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : isValidating
                ? 'bg-slate-200 text-slate-500 cursor-wait'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {isValidating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Validating Dataset...</span>
              </>
            ) : validateSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                <span>✓ Validated</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Validate Again</span>
              </>
            )}
          </button>
          <span className="text-xs text-slate-500">
            {errorRecords > 0
              ? `${errorRecords} blocking error(s) must be fixed before export.`
              : 'All mandatory checks satisfied.'}
          </span>
        </div>

        <button
          type="button"
          onClick={onProceedToExport}
          disabled={!isReadyForImport}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ${
            isReadyForImport
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          <span>Validate &amp; Export</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
