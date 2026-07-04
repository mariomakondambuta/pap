import { useState } from 'react';
import { useMyProducts } from '../../api/products';
import { useMySales } from '../../api/orders';
import { useWallet } from '../../api/wallet';
import { useDeleteProduct } from '../../api/products';
import { ProductRow } from '../../components/ProductRow';
import { ContentManagerModal } from '../../components/ContentManagerModal';
import { LinkButton } from '../../components/LinkButton';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { Badge } from '../../components/Badge';
import { useAuth } from '../../auth/AuthContext';
import { formatDateShort, formatPrice, ORDER_STATUS_LABEL } from '../../lib/format';
import type { Product } from '../../lib/types';

export function SellerHome() {
  const { user } = useAuth();
  const { data: productsData } = useMyProducts();
  const { data: salesData } = useMySales();
  const { data: wallet } = useWallet();
  const deleteProduct = useDeleteProduct();
  const [managingProduct, setManagingProduct] = useState<Product | null>(null);

  const products = productsData?.products || [];
  const orders = salesData?.orders || [];
  const publishedCount = products.filter((p) => p.published).length;
  const paidSalesCount = orders.filter((o) => o.status === 'paid').length;

  async function handleDelete(product: Product) {
    if (!confirm(`Eliminar o produto "${product.title}"? Esta ação não pode ser revertida.`)) return;
    await deleteProduct.mutateAsync(product.id);
  }

  return (
    <div>
      <div className="mb-6">
        <h1>Olá, {user?.name?.split(' ')[0]}</h1>
        <p className="mb-0 text-text-muted">Uma visão geral do seu negócio.</p>
      </div>

      {products.length === 0 ? (
        <EmptyState hero icon="briefcase" title="Comece a vender" action={<LinkButton to="/produto/novo">Criar produto</LinkButton>}>
          Ainda não criou nenhum produto. Crie o primeiro e comece a receber vendas.
        </EmptyState>
      ) : (
        <>
          <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card><p className="mb-1 text-text-muted">Saldo disponível</p><h2 className="mb-0">{wallet ? formatPrice(wallet.balance_cents) : '—'}</h2></Card>
            <Card><p className="mb-1 text-text-muted">Vendas pagas</p><h2 className="mb-0">{paidSalesCount}</h2></Card>
            <Card><p className="mb-1 text-text-muted">Produtos publicados</p><h2 className="mb-0">{publishedCount}</h2></Card>
          </div>

          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="mb-0">Meus produtos</h3>
            <LinkButton to="/negocio/produtos" variant="ghost" size="sm">Ver todos</LinkButton>
          </div>
          <div className="mb-8 overflow-x-auto rounded-xl border border-border bg-white">
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
                {products.slice(0, 5).map((p) => (
                  <ProductRow key={p.id} product={p} onManageContent={setManagingProduct} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="mb-0">Vendas recentes</h3>
            <LinkButton to="/negocio/vendas" variant="ghost" size="sm">Ver todas</LinkButton>
          </div>
          <div className="overflow-x-auto rounded-md border border-border bg-white">
            <table className="w-full border-collapse text-[0.9rem]">
              <thead>
                <tr>
                  <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Comprador</th>
                  <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Produto</th>
                  <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Valor</th>
                  <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Estado</th>
                  <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Data</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td className="px-3.5 py-3" colSpan={5}>Ainda não tem vendas.</td></tr>
                ) : (
                  orders.slice(0, 5).map((o) => (
                    <tr key={o.id}>
                      <td className="border-t border-border px-3.5 py-3">{o.buyer_name}</td>
                      <td className="border-t border-border px-3.5 py-3">{o.product_title}</td>
                      <td className="border-t border-border px-3.5 py-3">{formatPrice(o.amount_cents, o.currency)}</td>
                      <td className="border-t border-border px-3.5 py-3"><Badge variant={o.status === 'paid' ? 'success' : 'neutral'}>{ORDER_STATUS_LABEL[o.status] || o.status}</Badge></td>
                      <td className="border-t border-border px-3.5 py-3">{formatDateShort(o.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {managingProduct && (
        <ContentManagerModal open productId={managingProduct.id} productTitle={managingProduct.title} onClose={() => setManagingProduct(null)} />
      )}
    </div>
  );
}
