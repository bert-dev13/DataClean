'use client';

import React from 'react';
import Image from 'next/image';
import { DatasetDefinition } from '@/lib/types';
import {
  Building2,
  ShieldAlert,
  GraduationCap,
  Zap,
  Home,
  Radio,
  Bus,
  Droplets,
  Users,
  Activity,
  AlertTriangle,
  Package,
  MapPin,
  Waves,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
} from 'lucide-react';

interface Step2DatasetSelectProps {
  system: 'DBL' | 'ODeSSEE';
  datasets: DatasetDefinition[];
  selectedDatasetId: string;
  onSelectDataset: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

// Map dataset ID to appropriate Lucide icon
function getDatasetIcon(id: string) {
  switch (id) {
    // DBL Datasets
    case 'dbl-business':
      return <Building2 className="w-5 h-5 text-blue-600" />;
    case 'dbl-crime':
      return <ShieldAlert className="w-5 h-5 text-rose-600" />;
    case 'dbl-human-resource':
      return <GraduationCap className="w-5 h-5 text-indigo-600" />;
    case 'dbl-power':
      return <Zap className="w-5 h-5 text-amber-600" />;
    case 'dbl-residential':
      return <Home className="w-5 h-5 text-emerald-600" />;
    case 'dbl-telecommunication':
      return <Radio className="w-5 h-5 text-cyan-600" />;
    case 'dbl-transportation':
      return <Bus className="w-5 h-5 text-purple-600" />;
    case 'dbl-water':
      return <Droplets className="w-5 h-5 text-sky-600" />;

    // ODeSSEE Datasets
    case 'odessee-household':
      return <Users className="w-5 h-5 text-emerald-600" />;
    case 'odessee-covid':
      return <Activity className="w-5 h-5 text-rose-600" />;
    case 'odessee-disaster':
      return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    case 'odessee-drrm':
      return <Package className="w-5 h-5 text-indigo-600" />;
    case 'odessee-evacuation':
      return <MapPin className="w-5 h-5 text-blue-600" />;
    case 'odessee-flood':
      return <Waves className="w-5 h-5 text-cyan-600" />;
    case 'odessee-vra':
      return <ShieldAlert className="w-5 h-5 text-teal-600" />;

    default:
      return <Building2 className="w-5 h-5 text-slate-600" />;
  }
}

export function Step2DatasetSelect({
  system,
  datasets,
  selectedDatasetId,
  onSelectDataset,
  onBack,
  onContinue,
}: Step2DatasetSelectProps) {
  const isDbl = system === 'DBL';

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
            <Home className="w-3.5 h-3.5 text-slate-500" />
            <span>Home</span>
          </button>
          
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
            isDbl
              ? 'bg-blue-50/80 border-blue-200/80 text-blue-900'
              : 'bg-emerald-50/80 border-emerald-200/80 text-emerald-950'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isDbl ? 'bg-blue-600' : 'bg-emerald-600'}`} />
            <span>{system}</span>
            <span className="text-[11px] font-normal opacity-70 hidden md:inline">
              {isDbl ? '• Digital Business Locator' : '• Decision Support System'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-bold border border-slate-200 transition-all cursor-pointer shadow-2xs group self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Change System</span>
        </button>
      </div>

      {/* Unified Main Workspace Container */}
      <div className="relative rounded-3xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-6 sm:p-8 lg:p-10 shadow-sm overflow-hidden mb-8">
        {/* Top Accent Gradient Line */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isDbl ? 'from-blue-600 via-indigo-600 to-sky-600' : 'from-emerald-600 via-teal-600 to-cyan-600'}`} />

        {/* Ambient Subtle Background Glow */}
        <div className={`pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 ${isDbl ? 'bg-blue-500' : 'bg-emerald-500'}`} />

        {/* Precision Corner Tech Marks */}
        <div className="absolute top-3.5 left-3.5 text-xs font-mono text-slate-300 select-none pointer-events-none">+</div>
        <div className="absolute top-3.5 right-3.5 text-xs font-mono text-slate-300 select-none pointer-events-none">+</div>
        <div className="absolute bottom-3.5 left-3.5 text-xs font-mono text-slate-300 select-none pointer-events-none">+</div>
        <div className="absolute bottom-3.5 right-3.5 text-xs font-mono text-slate-300 select-none pointer-events-none">+</div>

        {/* Container Header Section */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-3 mb-2.5">
              <div className="h-8 px-2.5 bg-white rounded-lg border border-slate-200/90 shadow-2xs flex items-center">
                <Image
                  src={isDbl ? '/DBL-LOGO.png' : '/ODESSEEE-LOGO.png'}
                  alt={`${system} Logo`}
                  width={100}
                  height={20}
                  className="h-4.5 w-auto object-contain"
                  priority
                />
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${isDbl ? 'bg-blue-50 text-blue-800 border border-blue-200/60' : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'}`}>
                {datasets.length} Supported Datasets
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Choose the dataset you want to prepare
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Select an official government template to begin automated parsing, cleaning, and validation.
            </p>
          </div>
        </div>

        {/* Responsive Dataset Cards Grid (Unified 1 Section) */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 my-7">
          {datasets.map((dataset) => {
            const isSelected = selectedDatasetId === dataset.id;

            return (
              <div
                key={dataset.id}
                onClick={() => onSelectDataset(dataset.id)}
                className={`relative rounded-2xl p-5 border transition-all duration-150 cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? isDbl
                      ? 'bg-blue-50/80 border-2 border-blue-600 shadow-md ring-4 ring-blue-500/15'
                      : 'bg-emerald-50/80 border-2 border-emerald-600 shadow-md ring-4 ring-emerald-500/15'
                    : 'bg-white/95 hover:bg-slate-50/90 border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Icon Container & Selection Pill */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? isDbl
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200/70'
                      }`}
                    >
                      {getDatasetIcon(dataset.id)}
                    </div>

                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        isSelected
                          ? isDbl
                            ? 'bg-blue-600 text-white border-blue-600 flex items-center gap-1 font-bold shadow-2xs'
                            : 'bg-emerald-600 text-white border-emerald-600 flex items-center gap-1 font-bold shadow-2xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200/80'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      {dataset.fields.length} columns
                    </span>
                  </div>

                  {/* Dataset Name */}
                  <h2
                    className={`text-sm font-bold transition-colors ${
                      isSelected
                        ? isDbl
                          ? 'text-blue-950 font-extrabold'
                          : 'text-emerald-950 font-extrabold'
                        : 'text-slate-900 group-hover:text-blue-900'
                    }`}
                  >
                    {dataset.name}
                  </h2>

                  {/* Short Description */}
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                    {dataset.description}
                  </p>
                </div>

                {/* Template Filename Hint */}
                <div className="mt-4 pt-3 border-t border-slate-100/90 flex items-center justify-between text-[11px]">
                  <span className="truncate font-mono text-slate-500 font-medium">{dataset.officialFileName}</span>
                  {isSelected ? (
                    <span className={`text-[11px] font-bold flex items-center gap-0.5 ${isDbl ? 'text-blue-700' : 'text-emerald-700'}`}>
                      Active
                    </span>
                  ) : (
                    <span className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Select
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation Buttons (Contained within Section) */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200/80">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            {selectedDatasetId ? (
              <span>
                Selected: <strong className="text-slate-900">{datasets.find((d) => d.id === selectedDatasetId)?.name}</strong> ({datasets.find((d) => d.id === selectedDatasetId)?.fields.length} columns)
              </span>
            ) : (
              <span>Please choose a template to continue</span>
            )}
          </div>

          <button
            type="button"
            onClick={onContinue}
            className={`inline-flex items-center gap-2 px-6 py-2.5 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer w-full sm:w-auto justify-center ${
              isDbl
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
            }`}
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
