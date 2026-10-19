'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DatasetDefinition } from '@/lib/types';
import { ParsedWorkbook } from '@/lib/parser/excelParser';
import { DetectionResult } from '@/lib/detector/templateDetector';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Lock,
  Sparkles,
  Loader2,
  Check,
} from 'lucide-react';

interface Step3UploadAnalyzeProps {
  system: 'DBL' | 'ODeSSEE';
  dataset: DatasetDefinition;
  parsedWorkbook: ParsedWorkbook | null;
  detectionResult: DetectionResult | null;
  uploadError?: string | null;
  onFileParsed: (file: File) => void;
  onAnalyze: () => void;
  onResetFile: () => void;
  onBack: () => void;
  onLoadSample: (variant: 'issues' | 'valid' | 'old') => void;
}

export function Step3UploadAnalyze({
  system,
  dataset,
  parsedWorkbook,
  detectionResult,
  uploadError,
  onFileParsed,
  onAnalyze,
  onResetFile,
  onBack,
  onLoadSample,
}: Step3UploadAnalyzeProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showColumnsDetails, setShowColumnsDetails] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDbl = system === 'DBL';

  // Analysis Checklist Steps Animation
  const analysisSteps = [
    'Reading spreadsheet data',
    `Matching ${system} official template`,
    'Checking required government fields',
    'Scanning for duplicate records',
    `Validating ${parsedWorkbook ? parsedWorkbook.totalRows : 0} records`,
  ];

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisStep(0);
  };

  useEffect(() => {
    if (!isAnalyzing) return;

    if (analysisStep < analysisSteps.length) {
      const timer = setTimeout(() => {
        setAnalysisStep((prev) => prev + 1);
      }, 250);
      return () => clearTimeout(timer);
    } else {
      // Finished all analysis steps
      const finalTimer = setTimeout(() => {
        onAnalyze();
      }, 300);
      return () => clearTimeout(finalTimer);
    }
  }, [isAnalyzing, analysisStep, analysisSteps.length, onAnalyze]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileParsed(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileParsed(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Elevated Navigation Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:px-5 sm:py-3 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-2xs mb-6">
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium cursor-pointer"
          >
            <span>{system}</span>
          </button>
          
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
            isDbl
              ? 'bg-blue-50/80 border-blue-200/80 text-blue-900'
              : 'bg-emerald-50/80 border-emerald-200/80 text-emerald-950'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isDbl ? 'bg-blue-600' : 'bg-emerald-600'}`} />
            <span>{dataset.name}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-bold border border-slate-200 transition-all cursor-pointer shadow-2xs group self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Change Dataset</span>
        </button>
      </div>

      {/* Contained Header */}
      <div className="relative rounded-2xl border border-slate-200/90 bg-white/80 backdrop-blur-md p-6 sm:p-7 mb-8 shadow-sm overflow-hidden">
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isDbl ? 'from-blue-600 via-indigo-600 to-sky-600' : 'from-emerald-600 via-teal-600 to-cyan-600'}`} />
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100/90 px-2.5 py-0.5 rounded-md">
            {system} / {dataset.name}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Upload Dataset
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Upload the spreadsheet you want to clean and validate according to the official {dataset.name} schema.
        </p>
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-rose-950">Spreadsheet Upload Issue</h4>
            <p className="mt-0.5 text-rose-800 leading-relaxed">{uploadError}</p>
          </div>
        </div>
      )}

      {/* Main Upload / File Summary Area */}
      {!parsedWorkbook ? (
        <div>
          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-150 ${
              isDragOver
                ? isDbl
                  ? 'border-blue-500 bg-blue-50/70 scale-[1.01]'
                  : 'border-emerald-500 bg-emerald-50/70 scale-[1.01]'
                : 'border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50/50 shadow-xs'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm ${
                isDbl ? 'bg-blue-100/80 text-blue-600' : 'bg-emerald-100/80 text-emerald-700'
              }`}
            >
              <Upload className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Drop your spreadsheet here
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              or click to <span className="text-blue-600 font-semibold underline underline-offset-2">browse files</span> from your device
            </p>

            <div className="mt-5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-mono text-slate-600">
              <span>XLSX</span> • <span>XLS</span> • <span>CSV</span>
            </div>
          </div>

          {/* Privacy Guarantee Note */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              <strong>Processed locally.</strong> Your spreadsheet never leaves this device.
            </span>
          </div>

          {/* Training Sample Loader (For Capacity Building) */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Training workshop simulation:</span>
              <button
                type="button"
                onClick={() => onLoadSample('issues')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 underline underline-offset-2 cursor-pointer"
                title="Loads 25 complete, valid records with auto-fixable formatting to demonstrate automatic cleaning."
              >
                Load Auto-Fix Demo (25 records)
              </button>
            </div>
          </div>
        </div>
      ) : isAnalyzing ? (
        /* Analysis Experience Animation */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>

          <h3 className="text-lg font-bold text-slate-900">
            Analyzing your dataset...
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Applying official {dataset.name} validation rules and automated checks
          </p>

          <div className="max-w-md mx-auto space-y-2.5 text-left text-xs">
            {analysisSteps.map((stepText, idx) => {
              const isDone = analysisStep > idx;
              const isCurrent = analysisStep === idx;

              return (
                <div
                  key={stepText}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    isDone
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : isCurrent
                      ? 'bg-blue-50/70 border-blue-200 text-blue-900 font-semibold'
                      : 'bg-slate-50/50 border-slate-200/70 text-slate-400'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                  </div>
                  <span>{stepText}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* After File Upload: File Summary Card */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${
                  isDbl ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 truncate max-w-md">
                  {parsedWorkbook.fileName}
                </h3>
                <p className="text-xs text-slate-500">
                  {parsedWorkbook.selectedSheet} • {(parsedWorkbook.fileSize / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            <button
              onClick={onResetFile}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Choose Another File
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Detected Target</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">{system} / {dataset.name}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Records</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{parsedWorkbook.totalRows.toLocaleString()}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Columns</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{parsedWorkbook.headers.length} found</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Template Match</p>
              <p
                className={`text-sm font-bold mt-0.5 ${
                  detectionResult && detectionResult.confidenceScore >= 80
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                }`}
              >
                {detectionResult ? `${detectionResult.confidenceScore}%` : 'Evaluating'}
              </p>
            </div>
          </div>

          {/* Expandable Matched / Missing Columns Summary */}
          {detectionResult && (
            <div className="mb-6 rounded-xl border border-slate-200/80 bg-slate-50/60 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowColumnsDetails(!showColumnsDetails)}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {detectionResult.matchedColumns.length} of {dataset.fields.length} official columns matched
                  </span>
                  {detectionResult.missingColumns.length > 0 && (
                    <span className="text-rose-700 font-bold">
                      ({detectionResult.missingColumns.length} missing)
                    </span>
                  )}
                </div>
                {showColumnsDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showColumnsDetails && (
                <div className="p-4 pt-0 border-t border-slate-200/60 text-xs space-y-3">
                  <div>
                    <p className="font-bold text-[11px] text-slate-600 uppercase tracking-wider mb-1.5">
                      Matched Columns:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {detectionResult.matchedColumns.map((c) => (
                        <span
                          key={c.uploaded}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px]"
                        >
                          {c.uploaded}
                        </span>
                      ))}
                    </div>
                  </div>

                  {detectionResult.missingColumns.length > 0 && (
                    <div>
                      <p className="font-bold text-[11px] text-rose-700 uppercase tracking-wider mb-1.5">
                        Missing Required Columns:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {detectionResult.missingColumns.map((col) => (
                          <span
                            key={col}
                            className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[11px]"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Button: Analyze Dataset */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleStartAnalysis}
              className={`inline-flex items-center gap-2 px-6 py-2.5 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ${
                isDbl
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
              }`}
            >
              <span>Analyze Dataset</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
