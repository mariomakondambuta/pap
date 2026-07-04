import { useAdminOrders } from '../../api/admin';
import { Badge } from '../../components/Badge';
import { formatDateShort, formatPrice, ORDER_STATUS_LABEL } from '../../lib/format';

export function Transactions() {
  const { data, isLoading } = useAdminOrders();
  const orders = data?.orders || [];

  return (
    <div>
      <h3>Todas as transações</h3>
      <div className="overflow-x-auto rounded-md border border-border bg-white">
        <table className="w-full border-collapse text-[0.9rem]">
          <thead>
            <tr>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">#</th>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Comprador</th>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Produtor</th>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Produto</th>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Valor</th>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Comissão</th>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Estado</th>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Data</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td className="px-3.5 py-3" colSpan={8}>A carregar...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td className="px-3.5 py-3" colSpan={8}>Ainda não há transações.</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td className="border-t border-border px-3.5 py-3">#{o.id}</td>
                  <td className="border-t border-border px-3.5 py-3">{o.buyer_name}</td>
                  <td className="border-t border-border px-3.5 py-3">{o.seller_name}</td>
                  <td className="border-t border-border px-3.5 py-3">{o.product_title}</td>
                  <td className="border-t border-border px-3.5 py-3">{formatPrice(o.amount_cents, o.currency)}</td>
                  <td className="border-t border-border px-3.5 py-3">{formatPrice(o.platform_fee_cents, o.currency)}</td>
                  <td className="border-t border-border px-3.5 py-3"><Badge variant={o.status === 'paid' ? 'success' : 'neutral'}>{ORDER_STATUS_LABEL[o.status] || o.status}</Badge></td>
                  <td className="border-t border-border px-3.5 py-3">{formatDateShort(o.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
