import React, { useEffect } from 'react';
import { XIcon } from 'lucide-react';
import { Button } from './Button';
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}
const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-5xl'
};
export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md'
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true">

      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose} />

      <div
        className={`relative w-full ${sizeClasses[size]} bg-[var(--card-bg)] rounded-2xl shadow-modal border border-[var(--border-color)] animate-fade-in`}>

        {(title || subtitle) &&
        <div className="flex items-start justify-between p-5 border-b border-[var(--border-color)]">
            <div>
              {title &&
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  {title}
                </h2>
            }
              {subtitle &&
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
                  {subtitle}
                </p>
            }
            </div>
            <Button
            variant="ghost"
            size="xs"
            onClick={onClose}
            icon={<XIcon size={16} />} />

          </div>
        }
        <div className="p-5">{children}</div>
        {footer &&
        <div className="flex items-center justify-end gap-2 p-5 border-t border-[var(--border-color)]">
            {footer}
          </div>
        }
      </div>
    </div>);

}