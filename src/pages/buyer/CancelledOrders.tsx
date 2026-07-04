import { useMyPurchases } from '../../api/orders';
import { Spinner } from '../../components/Spinner';
import { Badge } from '../../components/Badge';
import { formatDateShort, formatPrice, ORDER_STATUS_LABEL } from '../../lib/format';

const CANCELLED_STATUSES = ['refunded', 'canceled', 'failed'];

export function CancelledOrders() {
  const { data, isLoading } = useMyPurchases();
  const cancelled = (data?.orders || []).filter((o) => CANCELLED_STATUSES.includes(o.status));

  return (
    <div>
      <div className="mb-5"><h3 className="mb-0">Canceladas e reembolsos</h3></div>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-white">
          <table className="w-full border-collapse text-[0.9rem]">
            <thead>
              <tr>
                <th className="border-b border-border px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Produto</th>
                <th className="border-b border-border px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Valor</th>
                <th className="border-b border-border px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Estado</th>
                <th className="border-b border-border px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Data</th>
              </tr>
            </thead>
            <tbody>
              {cancelled.length === 0 ? (
                <tr><td className="px-3.5 py-3" colSpan={4}>Não tem encomendas canceladas ou reembolsadas.</td></tr>
              ) : (
                cancelled.map((o) => (
                  <tr key={o.id}>
                    <td className="border-b border-border px-3.5 py-3 last:border-0">{o.product_title}</td>
                    <td className="border-b border-border px-3.5 py-3 last:border-0">{formatPrice(o.amount_cents, o.currency)}</td>
                    <td className="border-b border-border px-3.5 py-3 last:border-0"><Badge variant="danger">{ORDER_STATUS_LABEL[o.status] || o.status}</Badge></td>
                    <td className="border-b border-border px-3.5 py-3 last:border-0">{formatDateShort(o.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
