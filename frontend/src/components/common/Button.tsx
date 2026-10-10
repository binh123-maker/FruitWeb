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
    'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer shadow-xs select-none';

  const variants = {
    primary:
      'bg-emerald-600 hover:bg-emerald-500 text-white focus-visible:ring-emerald-500 hover:shadow-md hover:shadow-emerald-600/25 active:bg-emerald-700',
    secondary:
      'bg-slate-900 hover:bg-slate-800 text-white focus-visible:ring-slate-700 hover:shadow-md active:bg-slate-950',
    outline:
      'border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 focus-visible:ring-emerald-500',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-emerald-700 focus-visible:ring-slate-400 shadow-none',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white focus-visible:ring-rose-500 hover:shadow-md hover:shadow-rose-600/20 active:bg-rose-700',
    amber:
      'bg-amber-500 hover:bg-amber-400 text-slate-900 font-extrabold focus-visible:ring-amber-400 hover:shadow-md hover:shadow-amber-500/25 active:bg-amber-600',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5 shadow-sm',
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
        icon && <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
