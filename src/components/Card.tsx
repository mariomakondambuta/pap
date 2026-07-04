import type { HTMLAttributes } from 'react';
import { useThemeMode } from '../lib/theme';

export function Card({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  const mode = useThemeMode();
  const dense = mode === 'seller';
  return (
    <div
      className={`bg-white border border-border ${dense ? 'rounded-xl p-4' : 'rounded-md p-6 shadow-sm'} ${className}`}
      {...rest}
    />
  );
}
