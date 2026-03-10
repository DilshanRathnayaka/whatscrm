import React from 'react';
type ButtonVariant =
  'primary' |
  'secondary' |
  'ghost' |
  'danger' |
  'success' |
  'outline';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand-green hover:bg-brand-green-dark text-white shadow-sm',
  secondary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
  ghost:
    'bg-transparent hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
  outline:
    'bg-transparent border border-[var(--border-color)] hover:border-[var(--border-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
};
const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1 text-xs rounded-md gap-1',
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-5 py-2.5 text-base rounded-xl gap-2'
};
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-150 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-green/50
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}>

      {loading ?
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4" />

          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />

        </svg> :

        <>
          {icon && iconPosition === 'left' &&
            <span className="flex-shrink-0">{icon}</span>
          }
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' &&
            <span className="flex-shrink-0">{icon}</span>
          }
        </>
      }
    </button>);

}