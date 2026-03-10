import React from 'react';
type BadgeVariant = 'green' | 'blue' | 'red' | 'yellow' | 'gray' | 'purple';
type BadgeSize = 'sm' | 'md';
interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}
const variantClasses: Record<BadgeVariant, string> = {
  green: 'badge-green',
  blue: 'badge-blue',
  red: 'badge-red',
  yellow: 'badge-yellow',
  gray: 'badge-gray',
  purple:
  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
};
const dotColors: Record<BadgeVariant, string> = {
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  gray: 'bg-gray-400',
  purple: 'bg-purple-500'
};
const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs'
};
export function Badge({
  variant = 'gray',
  size = 'sm',
  children,
  className = '',
  dot = false
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>

      {dot &&
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant]}`} />

      }
      {children}
    </span>);

}