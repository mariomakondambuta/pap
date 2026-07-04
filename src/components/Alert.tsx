import type { ReactNode } from 'react';

export function Alert({ variant, children }: { variant: 'error' | 'success'; children: ReactNode }) {
  if (!children) return null;
  const classes = variant === 'error' ? 'bg-danger-light text-danger' : 'bg-success-light text-success';
  return <div className={`mb-4 rounded-sm px-4 py-3 text-[0.9rem] ${classes}`}>{children}</div>;
}
