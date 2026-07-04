import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMyProducts, useDeleteProduct } from '../../api/products';
import { ProductRow } from '../../components/ProductRow';
import { ContentManagerModal } from '../../components/ContentManagerModal';
import { LinkButton } from '../../components/LinkButton';
import { Icon } from '../../lib/icons';
import type { Product } from '../../lib/types';

type Filter = 'todos' | 'publicados' | 'rascunhos';

export function Products() {
  const [params] = useSearchParams();
  const { data, isLoading } = useMyProducts();
  const deleteProduct = useDeleteProduct();
  const [filter, setFilter] = useState<Filter>('todos');
  const [search, setSearch] = useState(params.get('q') || '');
  const [managingProduct, setManagingProduct] = useState<Product | null>(null);

  const products = data?.products || [];
  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filter === 'publicados' && !p.published) return false;
      if (filter === 'rascunhos' && p.published) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, filter, search]);

  async function handleDelete(product: Product) {
    if (!confirm(`Eliminar o produto "${product.title}"? Esta ação não pode ser revertida.`)) return;
    await deleteProduct.mutateAsync(product.id);
  }

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="mb-0">Produtos</h1>
        <LinkButton to="/produto/novo" size="sm">+ Criar produto</LinkButton>
      </div>

      <div className="rounded-xl border border-border bg-white">
        <div className="flex flex-wrap items-center gap-2.5 border-b border-border p-2.5">
          <div className="flex gap-0.5">
            {(['todos', 'publicados', 'rascunhos'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 font-heading text-[0.8rem] font-semibold ${filter === f ? 'bg-bg-alt text-text' : 'text-text-muted hover:bg-bg-alt'}`}
              >
                {f === 'todos' ? 'Todos' : f === 'publicados' ? 'Publicados' : 'Rascunhos'}
              </button>
            ))}
          </div>
          <label className="flex h-8 flex-1 min-w-[160px] items-center gap-2 rounded-[10px] border border-border px-2.5">
            <Icon name="search" size={15} className="flex-shrink-0 text-text-muted" />
            <input className="h-full flex-1 border-0 bg-transparent text-[0.82rem] focus:outline-none" placeholder="Pesquisar e filtrar" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[0.83rem]">
            <thead>
              <tr>
                <th className="w-[34px] px-3.5 py-2.5"><input type="checkbox" disabled /></th>
                <th className="px-3.5 py-2.5 text-left text-[0.7rem] font-semibold uppercase tracking-wide text-text-muted">Produto</th>
                <th className="px-3.5 py-2.5 text-left text-[0.7rem] font-semibold uppercase tracking-wide text-text-muted">Estado</th>
                <th className="px-3.5 py-2.5 text-left text-[0.7rem] font-semibold uppercase tracking-wide text-text-muted">Conteúdos</th>
                <th className="px-3.5 py-2.5 text-left text-[0.7rem] font-semibold uppercase tracking-wide text-text-muted">Alunos</th>
                <th className="px-3.5 py-2.5 text-left text-[0.7rem] font-semibold uppercase tracking-wide text-text-muted">Preço</th>
                <th className="px-3.5 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td className="px-3.5 py-4" colSpan={7}>A carregar...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-3.5 py-8 text-center" colSpan={7}>
                    <div className="mb-2 flex justify-center text-text-muted"><Icon name="briefcase" size={28} /></div>
                    Ainda não criou nenhum produto. Comece agora!
                    <div className="mt-3.5"><LinkButton to="/produto/novo">Criar produto</LinkButton></div>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => <ProductRow key={p.id} product={p} onManageContent={setManagingProduct} onDelete={handleDelete} />)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {managingProduct && (
        <ContentManagerModal open productId={managingProduct.id} productTitle={managingProduct.title} onClose={() => setManagingProduct(null)} />
      )}
    </div>
  );
}
