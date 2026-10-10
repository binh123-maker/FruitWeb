import React from 'react';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <ShoppingBag className="w-12 h-12 text-emerald-500/80" />,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="relative overflow-hidden flex flex-col items-center justify-center text-center py-16 px-6 bg-gradient-to-b from-white to-slate-50/70 rounded-3xl border border-slate-200/80 shadow-xs my-6 max-w-2xl mx-auto">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mb-5 p-5 bg-emerald-50/80 rounded-2xl border border-emerald-100 shadow-sm text-emerald-600">
        {icon}
      </div>

      <h3 className="relative text-xl font-extrabold text-slate-900 mb-2 tracking-tight">{title}</h3>
      <p className="relative text-sm text-slate-500 max-w-md mb-6 leading-relaxed">{description}</p>

      {actionText && onAction && (
        <div className="relative">
          <Button onClick={onAction} variant="primary" size="md" icon={<Sparkles className="w-4 h-4 text-emerald-200" />}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};
