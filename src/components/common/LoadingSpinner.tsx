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
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <Loader2 className={`${sizes[size]} text-emerald-600 animate-spin`} />
      {label && <p className="text-sm font-medium text-slate-500">{label}</p>}
    </div>
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs animate-pulse p-4 flex flex-col gap-3">
      <div className="w-full h-48 bg-slate-200 rounded-xl"></div>
      <div className="h-4 bg-slate-200 rounded-md w-3/4 mt-1"></div>
      <div className="h-3 bg-slate-200 rounded-md w-1/2"></div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
        <div className="h-5 bg-slate-200 rounded-md w-1/3"></div>
        <div className="h-8 bg-slate-200 rounded-lg w-20"></div>
      </div>
    </div>
  );
};
