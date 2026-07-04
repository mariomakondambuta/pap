import { Icon } from '../lib/icons';
import { FORMAT_ICONS, FORMAT_LABELS } from '../lib/format';

export function FormatBadge({ format, className = '' }: { format: string; className?: string }) {
  const label = FORMAT_LABELS[format] || format;
  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-text ${className}`}>
      <Icon name={FORMAT_ICONS[format] || 'grid'} size={14} />
      {label}
    </span>
  );
}
