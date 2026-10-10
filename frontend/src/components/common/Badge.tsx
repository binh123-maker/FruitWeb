import React from 'react';

interface BadgeProps {
  variant?: 'emerald' | 'amber' | 'rose' | 'slate' | 'sky' | 'purple';
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'emerald',
  children,
  className = '',
  size = 'md',
  dot = false,
}) => {
  const styles = {
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-900 border-amber-200/80',
    rose: 'bg-rose-50 text-rose-800 border-rose-200/80',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    sky: 'bg-sky-50 text-sky-800 border-sky-200/80',
    purple: 'bg-purple-50 text-purple-800 border-purple-200/80',
  };

  const dotColors = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-400',
    sky: 'bg-sky-500',
    purple: 'bg-purple-500',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] font-semibold rounded-md',
    md: 'px-2.5 py-1 text-xs font-bold rounded-lg',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border shadow-2xs font-sans tracking-wide ${styles[variant]} ${sizes[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} shrink-0`} />}
      {children}
    </span>
  );
};
