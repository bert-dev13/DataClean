'use client';

import React from 'react';
import { DetectionResult } from '@/lib/detector/templateDetector';
import { CheckCircle2, AlertTriangle, HelpCircle, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';

interface TemplateMatchBannerProps {
  detection: DetectionResult;
  onConvertToCurrentTemplate: () => void;
  isConverting?: boolean;
}

export function TemplateMatchBanner({
  detection,
  onConvertToCurrentTemplate,
  isConverting = false,
}: TemplateMatchBannerProps) {
  const { dataset, confidenceScore, matchedColumns, missingColumns, extraColumns, isOldOrIncompleteTemplate } =
    detection;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden mb-6">
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
              confidenceScore >= 80
                ? 'bg-emerald-100 text-emerald-700'
                : confidenceScore >= 50
                ? 'bg-amber-100 text-amber-700'
                : 'bg-rose-100 text-rose-700'
            }`}
          >
            {confidenceScore}%
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                {dataset.system}
              </span>
              <h3 className="text-base font-bold text-slate-900">{dataset.name} Template Detected</h3>
              <span className="text-xs text-slate-500">({matchedColumns.length} of {dataset.fields.length} columns matched)</span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">{dataset.description}</p>
          </div>
        </div>

        {isOldOrIncompleteTemplate && (
          <div className="flex items-center">
            <button
              onClick={onConvertToCurrentTemplate}
              disabled={isConverting}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isConverting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Convert to Current Template</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {isOldOrIncompleteTemplate && (
        <div className="px-5 py-3 bg-amber-50/80 border-b border-amber-200/60 text-xs text-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Old / Incomplete Template Detected:</strong> This file is missing {missingColumns.length} official columns ({missingColumns.join(', ')}). Converting will safely retain all existing data, synthesize the missing columns as blank for your review, and <strong>never fabricate values</strong>.
          </span>
        </div>
      )}

      {/* Column Mapping Details */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Matched */}
        <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
          <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Matched Columns ({matchedColumns.length})</span>
          </div>
          <ul className="space-y-1 text-slate-700 max-h-32 overflow-y-auto pr-1">
            {matchedColumns.map((c) => (
              <li key={c.fieldKey} className="flex items-center justify-between py-0.5 border-b border-emerald-100/40">
                <span className="font-medium text-slate-900">{c.template}</span>
                <span className="text-[10px] text-slate-500 font-mono">from &quot;{c.uploaded}&quot;</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Missing */}
        <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100">
          <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Missing Official Columns ({missingColumns.length})</span>
          </div>
          {missingColumns.length > 0 ? (
            <ul className="space-y-1 text-slate-700 max-h-32 overflow-y-auto pr-1">
              {missingColumns.map((col) => (
                <li key={col} className="flex items-center gap-1 text-amber-900 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span className="font-medium">{col}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 italic">No official columns missing.</p>
          )}
        </div>

        {/* Extra / Unknown */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-2">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>Extra / Unmatched Columns ({extraColumns.length})</span>
          </div>
          {extraColumns.length > 0 ? (
            <ul className="space-y-1 text-slate-600 max-h-32 overflow-y-auto pr-1">
              {extraColumns.map((col) => (
                <li key={col} className="truncate py-0.5" title={col}>
                  • {col}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 italic">No extra columns in file.</p>
          )}
        </div>
      </div>
    </div>
  );
}
