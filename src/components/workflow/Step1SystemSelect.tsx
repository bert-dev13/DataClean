'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Sparkles, Database, Layers } from 'lucide-react';

interface Step1SystemSelectProps {
  onSelectSystem: (system: 'DBL' | 'ODeSSEE') => void;
}

export function Step1SystemSelect({ onSelectSystem }: Step1SystemSelectProps) {
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 relative z-10">
      {/* Contained Hero Introduction with Ambient Background & Internal Grid */}
      <div className="relative rounded-3xl border border-slate-200/90 bg-white/80 backdrop-blur-md p-8 sm:p-12 mb-10 shadow-sm overflow-hidden text-center transition-all duration-300 hover:shadow-md">
        {/* Subtle Top Accent Shimmer Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/80 to-transparent" />

        {/* Ambient Glowing Background Orbs */}
        <div className="absolute -top-24 -left-20 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-indigo-400/10 rounded-full blur-3xl pointer-events-none animate-float-slow" />
        <div className="absolute -bottom-24 -right-20 w-80 h-80 bg-gradient-to-tl from-emerald-400/20 to-teal-400/10 rounded-full blur-3xl pointer-events-none animate-float-reverse" />

        {/* Hero Internal Grid Background Layer */}
        <div className="absolute inset-0 hero-internal-grid opacity-35 pointer-events-none" />

        {/* Technical Corner Crosshairs for Precision Tech Feel */}
        <div className="absolute top-3 left-3 text-slate-300 font-mono text-[10px] select-none pointer-events-none">+</div>
        <div className="absolute top-3 right-3 text-slate-300 font-mono text-[10px] select-none pointer-events-none">+</div>
        <div className="absolute bottom-3 left-3 text-slate-300 font-mono text-[10px] select-none pointer-events-none">+</div>
        <div className="absolute bottom-3 right-3 text-slate-300 font-mono text-[10px] select-none pointer-events-none">+</div>

        {/* Content Container (Layered above ambient effects) */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/90 text-blue-900 text-xs font-semibold mb-5 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <Sparkles className="w-3.5 h-3.5 text-blue-600 ml-0.5" />
            <span>DOST & LGU Capacity-Building Platform</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
            Prepare Your Data.<br />
            <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-teal-600 bg-clip-text text-transparent">
              Clean. Validate. Import.
            </span>
          </h1>
          
          <p className="text-slate-600 text-sm sm:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
            Prepare DBL and ODeSSEE datasets using standardized templates and automated data-quality checks.
          </p>

          {/* Three Feature Highlight Badges */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50/90 border border-slate-200/80 shadow-2xs">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span><strong>15</strong> Official Templates</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50/90 border border-slate-200/80 shadow-2xs">
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span><strong>Deterministic</strong> Rule Engine</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50/90 border border-slate-200/80 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span><strong>100% Client-Side</strong> Privacy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Prominent System Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* DBL Card */}
        <div
          onClick={() => onSelectSystem('DBL')}
          className="group relative bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
        >
          {/* Subtle Top Accent Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-80 group-hover:opacity-100 transition-opacity" />
          
          {/* Subtle Hover Gradient Fill */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-50/0 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <div className="relative z-10">
            {/* Header & Logo Container */}
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 px-3 bg-slate-50 rounded-xl border border-slate-200/80 shadow-2xs flex items-center group-hover:bg-blue-50/50 group-hover:border-blue-200 transition-colors">
                <Image
                  src="/DBL-LOGO.png"
                  alt="Digital Business Locator"
                  width={140}
                  height={26}
                  className="h-6 w-auto object-contain"
                  priority
                />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200/60">
                8 Supported Datasets
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
              DBL — Digital Business Locator
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Prepare business, infrastructure, workforce, utility, and residential datasets.
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {['Business', 'Water', 'Power', 'Residential', 'Crime', 'Telecom', 'Transport', 'HR'].map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100/80 text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between relative z-10">
            <span className="text-xs font-medium text-slate-500">Official DBL Schema</span>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 group-hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
            >
              <span>Select DBL</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* ODeSSEE Card */}
        <div
          onClick={() => onSelectSystem('ODeSSEE')}
          className="group relative bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
        >
          {/* Subtle Top Accent Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-80 group-hover:opacity-100 transition-opacity" />
          
          {/* Subtle Hover Gradient Fill */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 via-emerald-50/0 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <div className="relative z-10">
            {/* Header & Logo Container */}
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 px-3 bg-slate-50 rounded-xl border border-slate-200/80 shadow-2xs flex items-center group-hover:bg-emerald-50/50 group-hover:border-emerald-200 transition-colors">
                <Image
                  src="/ODESSEEE-LOGO.png"
                  alt="ODeSSEE Decision Support System"
                  width={130}
                  height={26}
                  className="h-6 w-auto object-contain"
                  priority
                />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                7 Supported Datasets
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-950 transition-colors">
              ODeSSEE — Decision Support System
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Prepare disaster risk, household, evacuation, resource, and hazard datasets.
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {['Household', 'COVID', 'Disaster', 'DRRM', 'Evacuation', 'Flood', 'VRA'].map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100/80 text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between relative z-10">
            <span className="text-xs font-medium text-slate-500">Official ODeSSEE Schema</span>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 group-hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <span>Select ODeSSEE</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Privacy Notice */}
      <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200/80 text-center flex items-center justify-center gap-2.5 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Your file is processed locally in your browser and is not uploaded or stored on our server.</span>
      </div>
    </div>
  );
}
