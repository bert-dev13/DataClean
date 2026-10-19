'use client';

import React from 'react';
import { CleanRecord, DatasetDefinition, QualityReport, ValidationIssue } from '@/lib/types';
import { exportCleanedDataset } from '@/lib/exporter/cleanDataExporter';
import { exportCleaningReport } from '@/lib/exporter/auditReportExporter';
import { Download, FileSpreadsheet, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ExportPanelProps {
  records: CleanRecord[];
  allIssues: ValidationIssue[];
  dataset: DatasetDefinition;
  qualityReport: QualityReport;
}

export function ExportPanel({ records, allIssues, dataset, qualityReport }: ExportPanelProps) {
  const hasErrors = qualityReport.errorRecords > 0;

  const handleDownloadCleaned = () => {
    exportCleanedDataset(records, dataset);
  };

  const handleDownloadReport = () => {
    exportCleaningReport(records, allIssues, dataset, qualityReport);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Export Prepared Data & Reports</h3>
          <p className="text-xs text-slate-500">
            Export official template-compliant XLSX ready for system ingestion into {dataset.system}.
          </p>
        </div>

        {hasErrors ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Dataset has unresolved errors. Missing required values will remain blank.</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dataset satisfies all mandatory requirements!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {/* Cleaned Dataset Export */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-blue-300 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-sm text-slate-900">Official Cleaned Dataset</h4>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Standardized XLSX matching official {dataset.name} import schema. Contains exact canonical headers, clean types, and zero fabricated data.
            </p>
          </div>
          <button
            onClick={handleDownloadCleaned}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Cleaned Dataset (.xlsx)
          </button>
        </div>

        {/* Cleaning Report Export */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-indigo-300 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h4 className="font-bold text-sm text-slate-900">Data Cleaning Audit Report</h4>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Detailed audit workbook documenting row-by-row original values, transformations, rule violations, and human reviews for training records.
            </p>
          </div>
          <button
            onClick={handleDownloadReport}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Cleaning Report (.xlsx)
          </button>
        </div>
      </div>
    </div>
  );
}
