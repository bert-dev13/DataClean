'use client';

import React from 'react';
import { Check } from 'lucide-react';

export type WorkflowStep = 1 | 2 | 3 | 4 | 5;

interface WorkflowStepperProps {
  currentStep: WorkflowStep;
  maxAccessibleStep: WorkflowStep;
  onStepClick: (step: WorkflowStep) => void;
  systemName?: 'DBL' | 'ODeSSEE';
  datasetName?: string;
}

const STEPS = [
  { id: 1, number: '01', title: 'System', subtitle: 'Select Engine' },
  { id: 2, number: '02', title: 'Dataset', subtitle: 'Choose Schema' },
  { id: 3, number: '03', title: 'Upload', subtitle: 'Drop Spreadsheet' },
  { id: 4, number: '04', title: 'Review', subtitle: 'Quality & Audit' },
  { id: 5, number: '05', title: 'Export', subtitle: 'Download Ready' },
] as const;

export function WorkflowStepper({
  currentStep,
  maxAccessibleStep,
  onStepClick,
}: WorkflowStepperProps) {
  // Progress percentage calculation
  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-2 relative z-20">
      {/* Contained Stepper Deck */}
      <div className="relative rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-2 sm:p-2.5 shadow-sm">
        {/* Subtle Progress Bar Track at Top of Container */}
        <div className="absolute top-0 left-4 right-4 h-0.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 transition-all duration-500 ease-out"
            style={{ width: `${Math.max(4, progressPercent)}%` }}
          />
        </div>

        {/* 5-Step Segmented Cards */}
        <nav aria-label="Workflow Navigation">
          <ol className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {STEPS.map((step) => {
              const isCurrent = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const isClickable = step.id <= maxAccessibleStep;

              return (
                <li key={step.id}>
                  <button
                    type="button"
                    disabled={!isClickable}
                    onClick={() => onStepClick(step.id as WorkflowStep)}
                    className={`w-full text-left rounded-xl p-2 sm:p-3 transition-all duration-200 flex flex-col justify-between relative group ${
                      isCurrent
                        ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white shadow-md shadow-blue-600/25 ring-2 ring-blue-500/20'
                        : isCompleted
                        ? 'bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/70 text-emerald-950'
                        : isClickable
                        ? 'bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/70 text-slate-700 cursor-pointer'
                        : 'bg-slate-50/40 border border-slate-200/40 text-slate-400 cursor-not-allowed opacity-75'
                    }`}
                  >
                    {/* Top Row: Number / Status Icon & Small Badge */}
                    <div className="flex items-center justify-between w-full mb-1 sm:mb-1.5">
                      <span
                        className={`text-[10px] sm:text-xs font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                          isCurrent
                            ? 'bg-white/20 text-white backdrop-blur-xs'
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200/70 text-slate-500'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : (
                          step.number
                        )}
                      </span>

                      {/* Active Beacon or Completed Indicator */}
                      {isCurrent && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                      )}
                    </div>

                    {/* Step Title */}
                    <div>
                      <p
                        className={`text-xs sm:text-sm font-extrabold tracking-tight leading-tight ${
                          isCurrent
                            ? 'text-white'
                            : isCompleted
                            ? 'text-slate-900 group-hover:text-emerald-900'
                            : isClickable
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.title}
                      </p>
                      
                      {/* Subtitle / Action Hint (Hidden on smallest mobile screens) */}
                      <p
                        className={`hidden md:block text-[10px] mt-0.5 truncate font-medium ${
                          isCurrent
                            ? 'text-blue-100'
                            : isCompleted
                            ? 'text-emerald-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.subtitle}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
