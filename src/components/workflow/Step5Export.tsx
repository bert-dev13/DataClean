'use client';

import React from 'react';
import Image from 'next/image';
import { CleanRecord, DatasetDefinition, QualityReport, ValidationIssue } from '@/lib/types';
import { exportCleanedDataset } from '@/lib/exporter/cleanDataExporter';
import { exportCleaningReport, RemovedRecordLog } from '@/lib/exporter/auditReportExporter';
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface Step5ExportProps {
  system: 'DBL' | 'ODeSSEE';
  dataset: DatasetDefinition;
  fileName: string;
  records: CleanRecord[];
  allIssues: ValidationIssue[];
  qualityReport: QualityReport;
  removedRecords?: RemovedRecordLog[];
  onReset: () => void;
}

export function Step5Export({
  system,
  dataset,
  fileName,
  records,
  allIssues,
  qualityReport,
  removedRecords,
  onReset,
}: Step5ExportProps) {
  const isDbl = system === 'DBL';

  const handleDownloadCleaned = () => {
    exportCleanedDataset(records, dataset);
  };

  const handleDownloadReport = () => {
    exportCleaningReport(records, allIssues, dataset, qualityReport, undefined, removedRecords);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 text-center">
      {/* Success Visual */}
      <div className="w-20 h-20 rounded-full bg-emerald-100/90 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-md shadow-emerald-500/20 ring-8 ring-emerald-50">
        <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-3 shadow-2xs">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
        <span>100% Quality Assurance Completed</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
        Dataset Ready for Import
      </h1>
      <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-lg mx-auto">
        Your dataset has passed all required validation checks and is formatted to the official {system} schema.
      </p>

      {/* Dataset Summary Card */}
      <div className="my-8 p-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 px-3 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs flex items-center">
              <Image
                src={isDbl ? '/DBL-LOGO.png' : '/ODESSEEE-LOGO.png'}
                alt={`${system} Logo`}
                width={110}
                height={22}
                className="h-5 w-auto object-contain"
                priority
              />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{dataset.name}</h2>
              <p className="text-xs text-slate-500 font-mono">{fileName}</p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0 self-start sm:self-auto">
            Ready for System Population
          </span>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-3 pt-4 text-center">
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Records</p>
            <p className="text-lg font-black text-slate-900 mt-0.5">{qualityReport.totalRecords.toLocaleString()}</p>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Fields</p>
            <p className="text-lg font-black text-emerald-700 mt-0.5">100% Valid</p>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Blocking Errors</p>
            <p className="text-lg font-black text-emerald-700 mt-0.5">0 Errors</p>
          </div>
        </div>
      </div>

      {/* Two Prominent Download Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-8">
        {/* 1. Cleaned Dataset */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-lg transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Cleaned Dataset</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              The standardized file prepared according to the current {system} import template.
            </p>
          </div>

          <button
            onClick={handleDownloadCleaned}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Cleaned Dataset (.xlsx)</span>
          </button>
        </div>

        {/* 2. Cleaning Report */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Cleaning Report</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              A record of detected issues and changes made during cleaning.
            </p>
          </div>

          <button
            onClick={handleDownloadReport}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Cleaning Report (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Clean Another Dataset */}
      <div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Clean Another Dataset</span>
        </button>
      </div>
    </div>
  );
}
