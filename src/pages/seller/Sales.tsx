import { useMySales } from '../../api/orders';
import { Badge } from '../../components/Badge';
import { formatDateShort, formatPrice, ORDER_STATUS_LABEL } from '../../lib/format';

export function Sales() {
  const { data, isLoading } = useMySales();
  const orders = data?.orders || [];

  return (
    <div>
      <div className="mb-3.5"><h1 className="mb-0">Vendas</h1></div>
      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full border-collapse text-[0.83rem]">
          <thead>
            <tr>
              <th className="px-3.5 py-2.5 text-left text-[0.7rem] font-semibold uppercase tracking-wide text-text-muted">Comprador</th>
              <th className="px-3.5 py-2.5 text-left text-[0.7rem] font-semibold uppercase tracking-wide text-text-muted">Produto</th>
              <th className="px-3.5 py-2.5 text-left text-[0.7rem] font-semibold uppercase tracking-wide text-text-muted">Valor</th>
              <th className="px-3.5 py-2.5 text-left text-[0.7rem] font-semibold uppercase tracking-wide text-text-muted">Estado</th>
              <th className="px-3.5 py-2.5 text-left text-[0.7rem] font-semibold uppercase tracking-wide text-text-muted">Data</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td className="px-3.5 py-4" colSpan={5}>A carregar...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td className="px-3.5 py-4" colSpan={5}>Ainda não tem vendas.</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td className="border-t border-border px-3.5 py-2.5">{o.buyer_name}</td>
                  <td className="border-t border-border px-3.5 py-2.5">{o.product_title}</td>
                  <td className="border-t border-border px-3.5 py-2.5">{formatPrice(o.amount_cents, o.currency)}</td>
                  <td className="border-t border-border px-3.5 py-2.5"><Badge variant={o.status === 'paid' ? 'success' : 'neutral'}>{ORDER_STATUS_LABEL[o.status] || o.status}</Badge></td>
                  <td className="border-t border-border px-3.5 py-2.5">{formatDateShort(o.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
