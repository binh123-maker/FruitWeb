import React from 'react';

interface BadgeProps {
  variant?: 'emerald' | 'amber' | 'rose' | 'slate' | 'sky' | 'purple';
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'emerald',
  children,
  className = '',
  size = 'md',
}) => {
  const styles = {
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    rose: 'bg-rose-100 text-rose-800 border-rose-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    sky: 'bg-sky-100 text-sky-800 border-sky-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs font-semibold rounded-md',
    md: 'px-2.5 py-1 text-xs font-bold rounded-lg',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 border ${styles[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};
