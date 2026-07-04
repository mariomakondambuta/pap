import { Link, type LinkProps } from 'react-router-dom';
import { useThemeMode } from '../lib/theme';
import { buttonClasses, type ButtonSize, type ButtonVariant } from './Button';

interface LinkButtonProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}

export function LinkButton({ variant = 'primary', size = 'md', block, className = '', ...rest }: LinkButtonProps) {
  const mode = useThemeMode();
  const dense = mode === 'seller';
  return <Link className={`${buttonClasses(variant, size, dense, block)} ${className}`} {...rest} />;
}
