import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer shadow-xs';

  const variants = {
    primary:
      'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 hover:shadow-emerald-200 hover:shadow-md',
    secondary:
      'bg-slate-800 hover:bg-slate-900 text-white focus:ring-slate-700 hover:shadow-md',
    outline:
      'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 focus:ring-emerald-500 hover:border-slate-400',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-400 shadow-none',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 hover:shadow-rose-200 hover:shadow-md',
    amber:
      'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-400 hover:shadow-amber-200 hover:shadow-md',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-semibold gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base font-semibold gap-2.5',
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
