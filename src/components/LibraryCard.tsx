import { Link } from 'react-router-dom';
import type { LibraryProduct } from '../lib/types';
import { FormatBadge } from './FormatBadge';
import { Icon } from '../lib/icons';

export function LibraryCard({ product }: { product: LibraryProduct }) {
  const isComplete = product.progress_percent === 100;
  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-border bg-white shadow-sm">
      <div className="flex h-40 items-center justify-center bg-gradient-to-br from-[#3a3a3a] to-dark p-4 text-center font-heading font-semibold text-white">
        {product.title}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <FormatBadge format={product.format} />
        <h3 className="mb-1">{product.title}</h3>
        <div className="flex items-center justify-between text-[0.8rem]">
          <span className="text-text-muted">{product.completed_lessons}/{product.total_lessons} concluídos</span>
          <strong>{product.progress_percent}%</strong>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-bg-alt">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${product.progress_percent}%` }} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border px-5 py-4">
        {isComplete ? (
          <Link to="/painel/certificados" className="inline-flex items-center gap-2 rounded-sm bg-accent px-[14px] py-2 text-[0.85rem] font-heading font-semibold text-white hover:bg-accent-dark">
            <Icon name="award" size={16} /> Certificado
          </Link>
        ) : (
          <Link to={`/curso/${product.id}`} className="inline-flex items-center gap-2 rounded-sm bg-primary px-[14px] py-2 text-[0.85rem] font-heading font-semibold text-white hover:bg-primary-dark">
            Continuar
          </Link>
        )}
        <Link to={`/curso/${product.id}`} className="inline-flex items-center gap-2 rounded-sm px-[14px] py-2 text-[0.85rem] font-heading font-semibold text-text hover:bg-bg-alt">
          Ver produto
        </Link>
      </div>
    </div>
  );
}
