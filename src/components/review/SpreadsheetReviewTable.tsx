'use client';

import React, { useState, useMemo } from 'react';
import { CleanRecord, DatasetDefinition, FieldDefinition, RuleClassification } from '@/lib/types';
import { CellIssueModal } from './CellIssueModal';
import {
  Search,
  CheckCircle2,
  XCircle,
  Wand2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SpreadsheetReviewTableProps {
  records: CleanRecord[];
  dataset: DatasetDefinition;
  onUpdateCell: (rowIndex: number, fieldKey: string, newValue: unknown, isManual?: boolean) => void;
  onResetCellToOriginal: (rowIndex: number, fieldKey: string) => void;
}

export function SpreadsheetReviewTable({
  records,
  dataset,
  onUpdateCell,
  onResetCellToOriginal,
}: SpreadsheetReviewTableProps) {
  const [statusFilter, setStatusFilter] = useState<'ALL' | RuleClassification>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // Selected cell for inspection modal
  const [selectedCell, setSelectedCell] = useState<{
    rowIndex: number;
    field: FieldDefinition;
  } | null>(null);

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Status filter
      if (statusFilter !== 'ALL' && r._status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchesRow = String(r._rowIndex).includes(term);
        const matchesField = dataset.fields.some((f) => {
          const val = r[f.key];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(term);
        });
        return matchesRow || matchesField;
      }

      return true;
    });
  }, [records, statusFilter, searchTerm, dataset.fields]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Counts for pills
  const counts = useMemo(() => {
    return {
      all: records.length,
      valid: records.filter((r) => r._status === 'VALID').length,
      autoFixAvailable: records.filter((r) => r._status === 'AUTO-FIX-AVAILABLE' || r._pendingAutoFix).length,
      autoCleaned: records.filter((r) => r._status === 'AUTO-FIX').length,
      error: records.filter((r) => r._status === 'ERROR').length,
    };
  }, [records]);

  // Cell state for modal
  const activeRecord = selectedCell ? records.find((r) => r._rowIndex === selectedCell.rowIndex) : null;
  const activeCellState = activeRecord && selectedCell ? activeRecord._cells[selectedCell.field.key] : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden mb-6">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              setStatusFilter('ALL');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            All Records ({counts.all})
          </button>

          <button
            onClick={() => {
              setStatusFilter('VALID');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'VALID'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Valid ({counts.valid})
          </button>

          <button
            onClick={() => {
              setStatusFilter('AUTO-FIX-AVAILABLE');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'AUTO-FIX-AVAILABLE'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" /> Auto-Fix Available ({counts.autoFixAvailable})
          </button>

          <button
            onClick={() => {
              setStatusFilter('ERROR');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'ERROR'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" /> Must Be Fixed ({counts.error})
          </button>
        </div>

        {/* Search Box */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search cells or rows..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Spreadsheet Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold tracking-tight">
              <th className="py-2.5 px-3 w-16 text-center border-r border-slate-200">Row</th>
              {dataset.fields.map((f) => (
                <th key={f.key} className="py-2.5 px-3 min-w-[140px] border-r border-slate-200">
                  <div className="flex items-center gap-1">
                    <span>{f.officialHeader}</span>
                    {f.required && <span className="text-rose-500 font-black">*</span>}
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal uppercase font-mono">{f.type}</span>
                </th>
              ))}
              <th className="py-2.5 px-3 w-28 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedRecords.length > 0 ? (
              paginatedRecords.map((record) => {
                const rowNum = record._rowIndex;
                return (
                  <tr key={rowNum} className="hover:bg-slate-50/70 transition-colors">
                    {/* Row Index */}
                    <td className="py-2 px-3 text-center font-mono text-slate-400 font-semibold border-r border-slate-100">
                      {rowNum}
                    </td>

                    {/* Field Cells */}
                    {dataset.fields.map((field) => {
                      const cell = record._cells[field.key];
                      const val = cell
                        ? cell.workingValue !== undefined
                          ? cell.workingValue
                          : cell.finalValue !== null && cell.finalValue !== undefined
                          ? cell.finalValue
                          : cell.originalValue
                        : record[field.key];
                      const status = cell ? cell.status : 'VALID';
                      const hasIssues = cell && cell.issues.length > 0;

                      let cellBg = '';
                      if (status === 'ERROR') {
                        cellBg = 'bg-rose-50/80 text-rose-900 border border-rose-200 font-medium';
                      } else if (status === 'AUTO-FIX-AVAILABLE') {
                        cellBg = 'bg-indigo-50/60 text-indigo-900 border border-indigo-200';
                      } else if (status === 'AUTO-FIX') {
                        cellBg = 'bg-blue-50/60 text-blue-900';
                      }

                      return (
                        <td
                          key={field.key}
                          onClick={() => setSelectedCell({ rowIndex: rowNum, field })}
                          className={`py-2 px-3 border-r border-slate-100 cursor-pointer hover:ring-2 hover:ring-blue-400 hover:ring-inset transition-all ${cellBg}`}
                          title={hasIssues ? cell.issues.map((i) => i.message).join('; ') : 'Click to inspect or edit'}
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="truncate">
                              {val !== '' && val !== null && val !== undefined ? (
                                String(val)
                              ) : (
                                <span className="text-slate-300 italic font-mono">(blank)</span>
                              )}
                            </span>

                            {status === 'ERROR' && (
                              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            )}
                            {status === 'AUTO-FIX-AVAILABLE' && (
                              <Wand2 className="w-3 h-3 text-indigo-500 shrink-0" />
                            )}
                            {status === 'AUTO-FIX' && (
                              <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0" />
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Row Status Badge */}
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          record._status === 'VALID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : record._status === 'AUTO-FIX-AVAILABLE'
                            ? 'bg-indigo-100 text-indigo-800'
                            : record._status === 'AUTO-FIX'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {record._status === 'ERROR' ? 'MUST BE FIXED' : record._status}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={dataset.fields.length + 2}
                  className="py-12 text-center text-slate-400 text-sm"
                >
                  No records match the selected filter or search term.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
        <span>
          Showing {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} records
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-slate-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-1 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cell Issue / Edit Modal */}
      {selectedCell && activeRecord && activeCellState && (
        <CellIssueModal
          isOpen={true}
          onClose={() => setSelectedCell(null)}
          rowIndex={selectedCell.rowIndex}
          field={selectedCell.field}
          cellState={activeCellState}
          onAcceptSuggestion={(sugVal) =>
            onUpdateCell(selectedCell.rowIndex, selectedCell.field.key, sugVal, false)
          }
          onManualEdit={(newVal) =>
            onUpdateCell(selectedCell.rowIndex, selectedCell.field.key, newVal, true)
          }
          onKeepOriginal={() =>
            onResetCellToOriginal(selectedCell.rowIndex, selectedCell.field.key)
          }
        />
      )}
    </div>
  );
}
