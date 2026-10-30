import React, { ReactNode } from 'react';

/**
 * NourishNet FoodTech Design System
 * Standardized reusable UI primitives for typography, cards, buttons, badges, and form controls.
 */

// 1. BRAND COLOR CONSTANTS
export const BRAND_COLORS = {
  primaryGreen: '#059669',
  emerald: '#10B981',
  teal: '#0D9488',
  deepNavy: '#0F172A',
  background: '#F1F5F9',
  warmCream: '#FFFBEB',
  accentOrange: '#F59E0B',
  accentBlue: '#3B82F6',
  white: '#FFFFFF',
} as const;

// 2. BUTTONS
interface FoodTechButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'teal' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const FoodTechButton: React.FC<FoodTechButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-3.5 py-2 text-xs font-bold rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-sm font-bold rounded-xl gap-2.5'
  }[size];

  const variantClasses = {
    primary:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:bg-emerald-800 disabled:bg-slate-300 disabled:shadow-none disabled:translate-y-0',
    secondary:
      'bg-slate-900 hover:bg-slate-850 text-white shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:bg-slate-950 disabled:bg-slate-300 disabled:shadow-none',
    outline:
      'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 shadow-2xs hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 active:bg-slate-200 disabled:opacity-50',
    teal:
      'bg-teal-600 hover:bg-teal-700 text-white shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:bg-slate-300',
    orange:
      'bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:bg-slate-300'
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-bold tracking-wide transition-all duration-150 cursor-pointer disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!isLoading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};

// 3. CARDS
interface FoodTechCardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  borderAccent?: 'none' | 'emerald' | 'teal' | 'orange' | 'blue';
}

export const FoodTechCard: React.FC<FoodTechCardProps> = ({
  children,
  className = '',
  hoverable = false,
  padding = 'md',
  borderAccent = 'none'
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8'
  }[padding];

  const accentClasses = {
    none: 'border-slate-200/90',
    emerald: 'border-emerald-500/80 ring-1 ring-emerald-500/20',
    teal: 'border-teal-500/80 ring-1 ring-teal-500/20',
    orange: 'border-amber-500/80 ring-1 ring-amber-500/20',
    blue: 'border-blue-500/80 ring-1 ring-blue-500/20'
  }[borderAccent];

  return (
    <div
      className={`bg-white rounded-2xl border ${accentClasses} shadow-xs ${
        hoverable
          ? 'hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200'
          : ''
      } ${paddingClasses} ${className}`}
    >
      {children}
    </div>
  );
};

// 4. BADGES
interface FoodTechBadgeProps {
  children: ReactNode;
  variant?: 'emerald' | 'teal' | 'orange' | 'blue' | 'navy' | 'neutral' | 'cream';
  icon?: ReactNode;
  className?: string;
}

export const FoodTechBadge: React.FC<FoodTechBadgeProps> = ({
  children,
  variant = 'emerald',
  icon,
  className = ''
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    teal: 'bg-teal-50 text-teal-800 border-teal-200/80',
    orange: 'bg-amber-50 text-amber-900 border-amber-200/80',
    blue: 'bg-blue-50 text-blue-800 border-blue-200/80',
    navy: 'bg-slate-900 text-slate-100 border-slate-750',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    cream: 'bg-amber-50/70 text-amber-950 border-amber-200/60'
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-lg border tracking-tight ${variantStyles} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

// 5. FORM INPUT
interface FoodTechInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  requiredAsterisk?: boolean;
  leftIcon?: ReactNode;
}

export const FoodTechInput: React.FC<FoodTechInputProps> = ({
  label,
  error,
  helperText,
  requiredAsterisk = false,
  leftIcon,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="block text-xs font-bold text-slate-800">
          {label} {requiredAsterisk && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          className={`w-full px-3.5 py-2 text-xs text-slate-900 bg-white border rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
            leftIcon ? 'pl-9' : ''
          } ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/30'
              : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-500/20 hover:border-slate-300'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-[11px] font-semibold text-rose-600">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}
    </div>
  );
};

// 6. FORM SELECT
interface FoodTechSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  requiredAsterisk?: boolean;
}

export const FoodTechSelect: React.FC<FoodTechSelectProps> = ({
  label,
  error,
  requiredAsterisk = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="block text-xs font-bold text-slate-800">
          {label} {requiredAsterisk && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 text-xs text-slate-900 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all cursor-pointer ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
            : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-500/20 hover:border-slate-300'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-[11px] font-semibold text-rose-600">{error}</p>}
    </div>
  );
};
