import React from 'react';

interface MegaZapLogoProps {
  className?: string;
  isCollapsed?: boolean;
}

export const MegaZapLogo: React.FC<MegaZapLogoProps> = ({ className = '', isCollapsed = false }) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Zap / Chat Emblem */}
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-sky-500 text-white shadow-xs">
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.4" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-4.5 h-4.5"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          <path d="M13 8l-3 4h4l-2 4" strokeWidth="2.2" stroke="white" fill="white" />
        </svg>
      </div>

      {!isCollapsed && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[15px] tracking-tight text-slate-800 dark:text-white">
              Mega<span className="text-sky-600 dark:text-sky-400 font-extrabold">Zap</span>
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800 rounded-md">
              Academy
            </span>
          </div>
          <span className="text-[10.5px] font-medium text-slate-600 dark:text-slate-400">
            Parceiros White Label
          </span>
        </div>
      )}
    </div>
  );
};
