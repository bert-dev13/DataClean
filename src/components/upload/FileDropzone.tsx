'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { ParsedWorkbook, parseExcelOrCsvFile } from '@/lib/parser/excelParser';
import { DBL_DATASETS, ODESSEE_DATASETS } from '@/lib/templates';

interface FileDropzoneProps {
  onFileParsed: (parsed: ParsedWorkbook) => void;
  isLoading?: boolean;
  selectedSystem: 'DBL' | 'ODeSSEE';
  onSelectSystem: (system: 'DBL' | 'ODeSSEE') => void;
  selectedDatasetId: string;
  onSelectDataset: (id: string) => void;
  onLoadDblSample: (datasetId: string, variant?: 'issues' | 'valid' | 'old') => void;
  onLoadOdesseeSample: (datasetId: string, variant?: 'issues' | 'valid') => void;
}

export function FileDropzone({
  onFileParsed,
  selectedSystem,
  onSelectSystem,
  selectedDatasetId,
  onSelectDataset,
  onLoadDblSample,
  onLoadOdesseeSample,
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeDatasets = selectedSystem === 'DBL' ? DBL_DATASETS : ODESSEE_DATASETS;

  const handleProcessFile = async (file: File) => {
    setErrorMsg(null);
    try {
      const parsed = await parseExcelOrCsvFile(file);
      onFileParsed(parsed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to parse file. Please upload a valid Excel or CSV document.';
      setErrorMsg(message);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleProcessFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleProcessFile(file);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 mb-6">
      {/* System & Dataset Selection Toolbar */}
      <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 font-mono">
              Mode A: Manual Template Selection
            </span>
            <h3 className="text-sm font-bold text-slate-800">
              Select System &amp; Dataset (Optional prior to upload)
            </h3>
          </div>
          
          {/* System Toggle Tabs */}
          <div className="inline-flex p-1 bg-slate-200/70 rounded-lg text-xs font-semibold gap-1">
            <button
              type="button"
              onClick={() => {
                onSelectSystem('DBL');
                if (!DBL_DATASETS.some((d) => d.id === selectedDatasetId)) {
                  onSelectDataset(DBL_DATASETS[0].id);
                }
              }}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-2 ${
                selectedSystem === 'DBL'
                  ? 'bg-white text-blue-900 shadow-xs font-bold ring-1 ring-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Image
                src="/DBL-LOGO.png"
                alt="DBL"
                width={70}
                height={14}
                className="h-3.5 w-auto object-contain"
              />
              <span className="hidden sm:inline">(8 Datasets)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectSystem('ODeSSEE');
                if (!ODESSEE_DATASETS.some((d) => d.id === selectedDatasetId)) {
                  onSelectDataset(ODESSEE_DATASETS[0].id);
                }
              }}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-2 ${
                selectedSystem === 'ODeSSEE'
                  ? 'bg-white text-emerald-900 shadow-xs font-bold ring-1 ring-emerald-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Image
                src="/ODESSEEE-LOGO.png"
                alt="ODeSSEE"
                width={65}
                height={14}
                className="h-3.5 w-auto object-contain"
              />
              <span className="hidden sm:inline">(7 Datasets)</span>
            </button>
          </div>
        </div>

        {/* Dataset Buttons for Selected System */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {activeDatasets.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => onSelectDataset(d.id)}
              className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                selectedDatasetId === d.id
                  ? selectedSystem === 'DBL'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold shadow-xs ring-1 ring-blue-600'
                    : 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-bold shadow-xs ring-1 ring-emerald-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="truncate font-semibold">{d.name}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{d.fields.length} columns</div>
            </button>
          ))}
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragOver
            ? selectedSystem === 'DBL' ? 'border-blue-500 bg-blue-50/60' : 'border-emerald-500 bg-emerald-50/60'
            : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex items-center justify-center mb-3">
          <div className="h-9 px-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex items-center">
            <Image
              src={selectedSystem === 'DBL' ? '/DBL-LOGO.png' : '/ODESSEEE-LOGO.png'}
              alt={`${selectedSystem} Logo`}
              width={120}
              height={24}
              className="h-5.5 w-auto object-contain"
            />
          </div>
        </div>

        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner ${
          selectedSystem === 'DBL' ? 'bg-blue-100/80 text-blue-600' : 'bg-emerald-100/80 text-emerald-600'
        }`}>
          <Upload className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-slate-800">
          Upload {selectedSystem} Dataset Spreadsheet (.xlsx, .xls, .csv)
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Drag and drop your spreadsheet here or click to browse. DataClean will automatically detect the dataset or align with your selected template.
        </p>

        <div className="inline-flex items-center gap-1.5 mt-4 px-3 py-1 rounded-full bg-slate-100 text-[11px] text-slate-600 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Your file is processed locally in your browser and is not uploaded or stored on our server.</span>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quick Test Fixtures for all 15 Datasets */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-2.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Load Realistic Test Cases (1-Click Evaluation):</span>
        </div>

        <div className="space-y-2">
          {/* DBL Samples */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1">
              DBL Datasets (8):
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {DBL_DATASETS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => onLoadDblSample(d.id, 'issues')}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-medium transition-colors cursor-pointer text-[11px]"
                >
                  {d.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onLoadDblSample('dbl-water', 'old')}
                className="px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 font-medium transition-colors cursor-pointer text-[11px]"
              >
                Water (Old Template)
              </button>
            </div>
          </div>

          {/* ODeSSEE Samples */}
          <div className="pt-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1">
              ODeSSEE Datasets (7):
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {ODESSEE_DATASETS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => onLoadOdesseeSample(d.id, 'issues')}
                  className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-medium transition-colors cursor-pointer text-[11px]"
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
