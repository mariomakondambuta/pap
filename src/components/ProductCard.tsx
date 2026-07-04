import { Link } from 'react-router-dom';
import type { Product } from '../lib/types';
import { formatPrice, truncate } from '../lib/format';
import { FormatBadge } from './FormatBadge';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/curso/${product.id}`}
      className="flex flex-col overflow-hidden rounded-md border border-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex h-40 items-center justify-center bg-gradient-to-br from-[#3a3a3a] to-dark p-4 text-center font-heading font-semibold text-white">
        {product.title}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex items-center justify-between">
          <FormatBadge format={product.format} />
          <span className={`font-heading text-base font-bold ${product.price_cents ? 'text-dark' : 'text-success'}`}>
            {formatPrice(product.price_cents, product.currency)}
          </span>
        </div>
        <h3 className="mb-1">{product.title}</h3>
        <p className="mb-0 text-[0.9rem] text-text-muted">{truncate(product.description || '', 90)}</p>
        {product.seller_name && <p className="mb-0 text-[0.78rem] text-text-muted">por {product.seller_name}</p>}
      </div>
      <div className="flex items-center justify-between border-t border-border px-5 py-4">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-bg-alt px-2.5 py-1 text-xs font-semibold text-text-muted">
          {product.category || 'Geral'}
        </span>
        <span className="text-[0.85rem] text-text-muted">{product.lesson_count ?? 0} conteúdos</span>
      </div>
    </Link>
  );
}
