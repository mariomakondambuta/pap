import { useAdminProducts, useUpdateProduct, useDeleteProduct } from '../../api/products';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { FORMAT_LABELS, formatPrice } from '../../lib/format';

export function AdminProducts() {
  const { data, isLoading } = useAdminProducts();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const products = data?.products || [];

  async function togglePublish(id: number, published: boolean) {
    await updateProduct.mutateAsync({ id, payload: { published: !published } });
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Eliminar o produto "${title}"? Esta ação não pode ser revertida.`)) return;
    await deleteProduct.mutateAsync(id);
  }

  return (
    <div>
      <h3>Todos os produtos da plataforma</h3>
      <div className="overflow-x-auto rounded-md border border-border bg-white">
        <table className="w-full border-collapse text-[0.9rem]">
          <thead>
            <tr>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Título</th>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Produtor</th>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Formato</th>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Preço</th>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Alunos</th>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Estado</th>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td className="px-3.5 py-3" colSpan={7}>A carregar...</td></tr>
            ) : products.length === 0 ? (
              <tr><td className="px-3.5 py-3" colSpan={7}>Ainda não existem produtos na plataforma.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td className="border-t border-border px-3.5 py-3">{p.title}</td>
                  <td className="border-t border-border px-3.5 py-3">{p.seller_name}</td>
                  <td className="border-t border-border px-3.5 py-3">{FORMAT_LABELS[p.format] || p.format}</td>
                  <td className="border-t border-border px-3.5 py-3">{p.is_free ? 'Grátis' : formatPrice(p.price_cents, p.currency)}</td>
                  <td className="border-t border-border px-3.5 py-3">{p.student_count}</td>
                  <td className="border-t border-border px-3.5 py-3"><Badge variant={p.published ? 'success' : 'warning'}>{p.published ? 'Publicado' : 'Rascunho'}</Badge></td>
                  <td className="border-t border-border px-3.5 py-3">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => togglePublish(p.id, Boolean(p.published))}>{p.published ? 'Despublicar' : 'Publicar'}</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(p.id, p.title)}>Eliminar</Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
