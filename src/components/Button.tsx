import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { useThemeMode } from '../lib/theme';

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', dense: boolean, block?: boolean) {
  const radius = dense ? 'rounded-[10px]' : 'rounded-sm';
  const sizeClasses = dense
    ? size === 'sm'
      ? 'px-[11px] py-[6px] text-[0.78rem]'
      : 'px-[14px] py-[7px] text-[0.82rem]'
    : size === 'sm'
      ? 'px-[14px] py-2 text-[0.85rem]'
      : 'px-[22px] py-3 text-[0.95rem]';

  const variants: Record<ButtonVariant, string> = {
    primary: dense
      ? 'bg-gradient-to-b from-[#2c2c2c] to-[#050505] border border-black text-white shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_4px_10px_rgba(0,0,0,0.18)] hover:from-[#3a3a3a] hover:to-[#111]'
      : 'bg-primary text-white shadow-sm hover:bg-primary-dark',
    accent: 'bg-accent text-white hover:bg-accent-dark',
    outline: 'bg-transparent border border-border text-text hover:border-primary hover:text-primary',
    ghost: 'bg-transparent text-text hover:bg-bg-alt',
    danger: 'bg-danger text-white hover:bg-[#9e2121]',
  };

  return [
    'inline-flex items-center justify-center gap-2 font-heading font-semibold whitespace-nowrap',
    'transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed',
    radius,
    sizeClasses,
    variants[variant],
    block ? 'w-full' : '',
  ].join(' ');
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', block, className = '', ...rest },
  ref
) {
  const mode = useThemeMode();
  const dense = mode === 'seller';
  return <button ref={ref} className={`${buttonClasses(variant, size, dense, block)} ${className}`} {...rest} />;
});
