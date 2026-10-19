'use client';

import React from 'react';
import { QualityReport } from '@/lib/types';
import {
  CheckCircle2,
  XCircle,
  Wand2,
  Info,
} from 'lucide-react';

interface DataReadinessDashboardProps {
  report: QualityReport;
  onApplyAllSafeFixes: () => void;
  canApplySafeFixes: boolean;
}

export function DataReadinessDashboard({
  report,
  onApplyAllSafeFixes,
  canApplySafeFixes,
}: DataReadinessDashboardProps) {
  const { readinessScore, totalRecords, validRecords, autoCleanedRecords, errorRecords, issueCounts } =
    report;

  // Determine readiness status color
  const scoreColor =
    readinessScore >= 95
      ? 'text-emerald-600 border-emerald-500'
      : readinessScore >= 75
      ? 'text-blue-600 border-blue-500'
      : readinessScore >= 50
      ? 'text-amber-600 border-amber-500'
      : 'text-rose-600 border-rose-500';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        {/* Readiness Score Card */}
        <div className="flex items-center gap-5">
          <div
            className={`w-24 h-24 rounded-2xl border-4 flex flex-col items-center justify-center bg-slate-50/50 shadow-inner ${scoreColor}`}
          >
            <span className="text-3xl font-black tracking-tight">{readinessScore}%</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Readiness</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">Dataset Health & Readiness</h2>
              <div className="group relative">
                <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-72 p-2.5 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl z-30">
                  {report.readinessFormulaExplanation}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Evaluated against official template constraints. Blocking errors cap score below 100%.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {totalRecords} Total Records
              </span>
              {errorRecords > 0 ? (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  {errorRecords} Blocking Error{errorRecords > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 0 Blocking Errors
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onApplyAllSafeFixes}
            disabled={!canApplySafeFixes}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            title="Applies deterministic safe fixes (trimming whitespace, standardizing numbers and dates)"
          >
            <Wand2 className="w-4 h-4" />
            <span>Fix All Automatically</span>
          </button>
        </div>
      </div>

      {/* Record State Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-800">Valid Records</p>
            <p className="text-xl font-bold text-emerald-900 mt-0.5">{validRecords}</p>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-500/80" />
        </div>

        <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-indigo-800">
              {report.autoFixAvailableRecords ? 'Auto-Fix Available' : 'Auto-Cleaned'}
            </p>
            <p className="text-xl font-bold text-indigo-900 mt-0.5">
              {report.autoFixAvailableRecords || autoCleanedRecords}
            </p>
          </div>
          <Wand2 className="w-6 h-6 text-indigo-500/80" />
        </div>

        <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-rose-800">Must Be Fixed</p>
            <p className="text-xl font-bold text-rose-900 mt-0.5">{errorRecords}</p>
          </div>
          <XCircle className="w-6 h-6 text-rose-500/80" />
        </div>
      </div>

      {/* Issue Breakdown Badges */}
      <div className="pt-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Specific Issue Breakdown</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span
            className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 ${
              issueCounts.missingValues > 0 ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <span>Missing Values:</span>
            <strong>{issueCounts.missingValues}</strong>
          </span>

          <span
            className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 ${
              issueCounts.formattingIssues > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <span>Formatting Issues:</span>
            <strong>{issueCounts.formattingIssues}</strong>
          </span>

          <span
            className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 ${
              issueCounts.duplicates > 0 ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <span>Duplicates:</span>
            <strong>{issueCounts.duplicates}</strong>
          </span>

          <span
            className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 ${
              issueCounts.invalidDates > 0 ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <span>Invalid Dates:</span>
            <strong>{issueCounts.invalidDates}</strong>
          </span>

          <span
            className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 ${
              issueCounts.invalidCategories > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <span>Invalid Categories:</span>
            <strong>{issueCounts.invalidCategories}</strong>
          </span>

          <span
            className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 ${
              issueCounts.numericIssues > 0 ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <span>Numeric Issues:</span>
            <strong>{issueCounts.numericIssues}</strong>
          </span>

          <span
            className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 ${
              issueCounts.locationIssues > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <span>Location Issues:</span>
            <strong>{issueCounts.locationIssues}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
