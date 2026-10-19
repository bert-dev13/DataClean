import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
      {/* Top Government Platform Accent Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Official DataClean Logo */}
        <Link href="/" className="flex items-center group transition-opacity hover:opacity-90 py-1">
          <Image
            src="/DataClean-Logo.png"
            alt="DataClean Platform Logo"
            width={180}
            height={60}
            className="h-10 sm:h-11 w-auto object-contain"
            priority
          />
        </Link>

        {/* Right: The 2 Official Logos */}
        <div className="flex items-center">
          <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:px-3.5 sm:py-1.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center px-1.5 py-0.5">
              <Image
                src="/DBL-LOGO.png"
                alt="Digital Business Locator (DBL) Logo"
                width={110}
                height={24}
                className="h-5 sm:h-5.5 w-auto object-contain"
                priority
              />
            </div>

            <span className="text-slate-200 font-light text-sm select-none">|</span>

            <div className="flex items-center px-1.5 py-0.5">
              <Image
                src="/ODESSEEE-LOGO.png"
                alt="ODeSSEE Decision Support System Logo"
                width={105}
                height={24}
                className="h-5 sm:h-5.5 w-auto object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

