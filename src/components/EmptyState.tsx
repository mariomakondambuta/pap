import type { ReactNode } from 'react';
import { Icon } from '../lib/icons';

interface EmptyStateProps {
  icon?: string;
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
  hero?: boolean;
  className?: string;
}

export function EmptyState({ icon, title, children, action, hero, className = '' }: EmptyStateProps) {
  if (hero) {
    return (
      <div className={`px-5 py-[70px] text-center text-text-muted ${className}`}>
        {icon && (
          <div className="mx-auto mb-6 flex h-[110px] w-[110px] items-center justify-center rounded-full bg-primary-light text-primary">
            <Icon name={icon} size={44} />
          </div>
        )}
        {title && <h3 className="mb-1.5 text-text">{title}</h3>}
        {children && <p className="text-text-muted">{children}</p>}
        {action && <div className="mt-5">{action}</div>}
      </div>
    );
  }

  return (
    <div className={`px-5 py-[60px] text-center text-text-muted ${className}`}>
      {icon && (
        <div className="mb-3 flex justify-center text-text-muted">
          <Icon name={icon} size={32} />
        </div>
      )}
      {children}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
