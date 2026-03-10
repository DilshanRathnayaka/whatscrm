import React from 'react';
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}
const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6'
};
export function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  onClick
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl
        shadow-[var(--card-shadow)]
        ${paddingClasses[padding]}
        ${hover ? 'cursor-pointer transition-shadow duration-150 hover:shadow-card-hover' : ''}
        ${className}
      `}>

      {children}
    </div>);

}
export function CardHeader({
  title,
  subtitle,
  action,
  className = ''
}: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
        {subtitle &&
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>
        }
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>);

}
export function StatCard({
  title,
  value,
  change,
  changeType = 'positive',
  icon,
  color = 'green'







}: {title: string;value: string | number;change?: string;changeType?: 'positive' | 'negative' | 'neutral';icon: React.ReactNode;color?: 'green' | 'blue' | 'purple' | 'orange';}) {
  const colorClasses = {
    green:
    'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    purple:
    'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    orange:
    'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
  };
  const changeColors = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-[var(--text-muted)]'
  };
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
            {value}
          </p>
          {change &&
          <p className={`text-xs mt-1 ${changeColors[changeType]}`}>
              {change}
            </p>
          }
        </div>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClasses[color]}`}>

          {icon}
        </div>
      </div>
    </Card>);

}