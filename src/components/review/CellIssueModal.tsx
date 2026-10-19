'use client';

import React, { useState } from 'react';
import { CellState, FieldDefinition } from '@/lib/types';
import { X, Check, Edit3, RotateCcw, XCircle, Wand2 } from 'lucide-react';

interface CellIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  rowIndex: number;
  field: FieldDefinition;
  cellState: CellState;
  onAcceptSuggestion: (suggestedVal: unknown) => void;
  onManualEdit: (newVal: unknown) => void;
  onKeepOriginal: () => void;
}

export function CellIssueModal({
  isOpen,
  onClose,
  rowIndex,
  field,
  cellState,
  onAcceptSuggestion,
  onManualEdit,
  onKeepOriginal,
}: CellIssueModalProps) {
  const currentVal =
    cellState.workingValue !== undefined
      ? cellState.workingValue
      : cellState.finalValue !== null && cellState.finalValue !== undefined
      ? cellState.finalValue
      : cellState.originalValue;

  const [editValue, setEditValue] = useState<string>(
    currentVal !== null && currentVal !== undefined ? String(currentVal) : ''
  );
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  const hasIssues = cellState.issues.length > 0;
  const primaryIssue = cellState.issues[0];
  const suggestedValue = cellState.pendingFix?.suggestedValue ?? primaryIssue?.suggestedValue;

  const handleSaveManual = () => {
    let parsedVal: unknown = editValue;
    if (field.type === 'float' || field.type === 'number') {
      const num = Number(editValue);
      if (!isNaN(num)) parsedVal = num;
    } else if (field.type === 'integer') {
      const num = parseInt(editValue, 10);
      if (!isNaN(num)) parsedVal = num;
    }
    onManualEdit(parsedVal);
    setIsEditing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-xs font-mono font-bold text-slate-500">Row {rowIndex}</span>
            <h3 className="text-base font-bold text-slate-900">{field.officialHeader}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-sm">
          {/* Issue Alert if present */}
          {hasIssues ? (
            <div
              className={`p-3.5 rounded-lg border flex items-start gap-3 ${
                cellState.status === 'ERROR'
                  ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                  : 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
              }`}
            >
              {cellState.status === 'ERROR' ? (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <Wand2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold text-xs uppercase tracking-wide">
                  {cellState.status === 'ERROR' ? 'Must Be Fixed' : 'Auto-Fix Available'}: {primaryIssue.category}
                </p>
                <p className="text-xs mt-0.5 leading-relaxed">{primaryIssue.message}</p>
                <p className="text-[10px] opacity-75 mt-1 font-mono">Rule ID: {primaryIssue.ruleId}</p>
              </div>
            </div>
          ) : cellState.status === 'AUTO-FIX' ? (
            <div className="p-3.5 rounded-lg border bg-indigo-50/80 border-indigo-200 text-indigo-900 flex items-start gap-3">
              <Wand2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs uppercase tracking-wide">Auto-Cleaned</p>
                <p className="text-xs mt-0.5">
                  {cellState.changes.map((c) => c.actionType).join('; ') || 'Safe formatting applied.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-800 text-xs">
              This cell currently satisfies all official template constraints.
            </div>
          )}

          {/* Value Comparison */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 font-medium block mb-1">Original Uploaded Value:</span>
              <span className="font-mono text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 block truncate">
                {cellState.originalValue !== '' && cellState.originalValue !== null && cellState.originalValue !== undefined
                  ? String(cellState.originalValue)
                  : '(blank)'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block mb-1">Current Value:</span>
              <span className="font-mono text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 block truncate">
                {currentVal !== '' && currentVal !== null && currentVal !== undefined
                  ? String(currentVal)
                  : '(blank)'}
              </span>
            </div>
          </div>

          {/* Suggested Value if present */}
          {suggestedValue !== undefined && (
            <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-indigo-800 font-semibold block">Suggested Standard Value:</span>
                <span className="font-mono text-indigo-950 font-bold">{String(suggestedValue)}</span>
              </div>
              <button
                onClick={() => {
                  onAcceptSuggestion(suggestedValue);
                  onClose();
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold transition-colors flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Accept Suggestion
              </button>
            </div>
          )}

          {/* Manual Edit Input */}
          {isEditing ? (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700 block">Enter Corrected Value:</label>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={`Enter valid ${field.type} value`}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveManual}
                  className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Save Correction
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 py-2 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Manually
              </button>

              <button
                onClick={() => {
                  onKeepOriginal();
                  onClose();
                }}
                className="flex-1 py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                title="Preserve original value without changes"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Keep Original
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
