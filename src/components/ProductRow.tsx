import { useNavigate } from 'react-router-dom';
import type { Product } from '../lib/types';
import { formatPrice } from '../lib/format';
import { FORMAT_LABELS } from '../lib/format';
import { Badge } from './Badge';
import { Icon } from '../lib/icons';

interface ProductRowProps {
  product: Product;
  onManageContent: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductRow({ product, onManageContent, onDelete }: ProductRowProps) {
  const navigate = useNavigate();

  function handleRowClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('button, input')) return;
    navigate(`/produto/editar?id=${product.id}`);
  }

  return (
    <tr className="cursor-pointer hover:bg-bg-alt" onClick={handleRowClick}>
      <td className="w-[34px] border-b border-border px-3.5 py-2.5">
        <input type="checkbox" disabled />
      </td>
      <td className="border-b border-border px-3.5 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 flex-shrink-0 rounded-lg bg-gradient-to-br from-[#3a3a3a] to-dark" />
          <div>
            <div className="font-semibold text-text">{product.title}</div>
            <div className="text-[0.76rem] text-text-muted">{FORMAT_LABELS[product.format] || product.format} · ID #{product.id}</div>
          </div>
        </div>
      </td>
      <td className="border-b border-border px-3.5 py-2.5">
        <Badge variant={product.published ? 'success' : 'warning'}>{product.published ? 'Publicado' : 'Rascunho'}</Badge>
      </td>
      <td className="border-b border-border px-3.5 py-2.5">{product.lesson_count}</td>
      <td className="border-b border-border px-3.5 py-2.5">{product.student_count}</td>
      <td className="border-b border-border px-3.5 py-2.5">{product.is_free ? 'Grátis' : formatPrice(product.price_cents, product.currency)}</td>
      <td className="border-b border-border px-3.5 py-2.5">
        <div className="flex justify-end gap-1">
          <button className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] border border-border bg-white text-text hover:bg-bg-alt" title="Gerir conteúdos" onClick={() => onManageContent(product)}>
            <Icon name="paperclip" size={15} />
          </button>
          <button className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] border border-border bg-white text-danger hover:border-[#f2c6c2] hover:bg-[#fdecec]" title="Eliminar produto" onClick={() => onDelete(product)}>
            <Icon name="trash" size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}
