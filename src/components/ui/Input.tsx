import React from 'react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}
interface TextareaProps extends
  React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  options: {
    value: string;
    label: string;
  }[];
}
const baseInputClasses = `
  w-full px-3 py-2 text-sm rounded-lg border
  bg-[var(--input-bg)] border-[var(--input-border)]
  text-[var(--text-primary)] placeholder-[var(--text-muted)]
  focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green
  transition-colors duration-150
  disabled:opacity-50 disabled:cursor-not-allowed
`;
export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label &&
      <label className="text-sm font-medium text-[var(--text-primary)]">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      }
      <div className="relative">
        {leftIcon &&
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {leftIcon}
          </div>
        }
        <input
          className={`
            ${baseInputClasses}
            ${leftIcon ? 'pl-9' : ''}
            ${rightIcon ? 'pr-9' : ''}
            ${error ? 'border-red-500 focus:ring-red-500/30 focus:border-red-500' : ''}
            ${className}
          `}
          {...props} />

        {rightIcon &&
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {rightIcon}
          </div>
        }
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error &&
      <p className="text-xs text-[var(--text-muted)]">{hint}</p>
      }
    </div>);

}
export function Textarea({
  label,
  error,
  hint,
  fullWidth = true,
  className = '',
  ...props
}: TextareaProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label &&
      <label className="text-sm font-medium text-[var(--text-primary)]">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      }
      <textarea
        className={`
          ${baseInputClasses}
          resize-none
          ${error ? 'border-red-500 focus:ring-red-500/30 focus:border-red-500' : ''}
          ${className}
        `}
        {...props} />

      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error &&
      <p className="text-xs text-[var(--text-muted)]">{hint}</p>
      }
    </div>);

}
export function Select({
  label,
  error,
  hint,
  fullWidth = true,
  options,
  className = '',
  ...props
}: SelectProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label &&
      <label className="text-sm font-medium text-[var(--text-primary)]">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      }
      <select
        className={`
          ${baseInputClasses}
          cursor-pointer
          ${error ? 'border-red-500 focus:ring-red-500/30 focus:border-red-500' : ''}
          ${className}
        `}
        {...props}>

        {options.map((opt) =>
        <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        )}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error &&
      <p className="text-xs text-[var(--text-muted)]">{hint}</p>
      }
    </div>);

}