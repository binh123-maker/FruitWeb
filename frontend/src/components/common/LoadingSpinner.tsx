import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ label?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  label = 'Đang tải...',
  size = 'md',
}) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3.5" role="status" aria-live="polite">
      <div className="relative flex items-center justify-center">
        <Loader2 className={`${sizes[size]} text-emerald-600 animate-spin`} />
      </div>
      {label && <p className="text-sm font-semibold text-slate-500 tracking-wide">{label}</p>}
    </div>
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div
      className="bg-white rounded-2xl border border-slate-100/80 overflow-hidden shadow-xs p-3.5 flex flex-col gap-3"
      aria-hidden="true"
    >
      {/* Square image skeleton with shimmer */}
      <div className="w-full aspect-square animate-shimmer rounded-xl relative overflow-hidden" />

      {/* Origin & Category tags */}
      <div className="flex items-center justify-between pt-1">
        <div className="h-3 w-20 animate-shimmer rounded-md" />
        <div className="h-3 w-12 animate-shimmer rounded-md" />
      </div>

      {/* Product title */}
      <div className="h-4 w-5/6 animate-shimmer rounded-md mt-0.5" />
      <div className="h-3.5 w-1/2 animate-shimmer rounded-md" />

      {/* Rating & Sold count */}
      <div className="flex items-center gap-2 pt-1">
        <div className="h-3 w-10 animate-shimmer rounded-md" />
        <div className="h-3 w-14 animate-shimmer rounded-md" />
      </div>

      {/* Price & action button */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
        <div className="h-5 w-24 animate-shimmer rounded-md" />
        <div className="h-9 w-9 animate-shimmer rounded-xl shrink-0" />
      </div>
    </div>
  );
};
