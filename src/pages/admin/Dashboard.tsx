import { useNavigate } from 'react-router-dom';
import { useAdminStats } from '../../api/admin';
import { Card } from '../../components/Card';
import { Icon } from '../../lib/icons';
import { formatDateShort, formatPrice } from '../../lib/format';

export function Dashboard() {
  const { data: stats, isLoading } = useAdminStats();
  const navigate = useNavigate();

  return (
    <div>
      <div className="mb-6"><h1>Painel administrativo</h1><p className="mb-0 text-text-muted">Controlo total da plataforma: produtos, transações, utilizadores e comissão.</p></div>

      {isLoading || !stats ? (
        <p className="text-text-muted">A carregar...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card><div className="font-heading text-[1.8rem] font-bold text-dark">{stats.totalUsers}</div><div className="text-[0.85rem] text-text-muted">Utilizadores</div></Card>
            <Card><div className="font-heading text-[1.8rem] font-bold text-dark">{stats.totalProducts}</div><div className="text-[0.85rem] text-text-muted">Produtos ({stats.publishedProducts} publicados, {stats.totalSellers} produtores)</div></Card>
            <Card><div className="font-heading text-[1.8rem] font-bold text-dark">{formatPrice(stats.totalRevenueCents)}</div><div className="text-[0.85rem] text-text-muted">Receita total ({stats.totalSales} vendas)</div></Card>
            <Card><div className="font-heading text-[1.8rem] font-bold text-dark">{formatPrice(stats.totalCommissionCents)}</div><div className="text-[0.85rem] text-text-muted">Comissão da plataforma</div></Card>
          </div>

          {stats.pendingWithdrawals > 0 && (
            <div className="mt-5 flex items-center gap-2 rounded-sm bg-danger-light px-4 py-3 text-[0.9rem] text-danger">
              <Icon name="alert-triangle" size={18} />
              <span>
                {stats.pendingWithdrawals} pedido(s) de levantamento pendente(s), no valor de {formatPrice(stats.pendingWithdrawalsCents)}.{' '}
                <button className="inline-flex items-center gap-1 underline" onClick={() => navigate('/admin/levantamentos')}>
                  Ver levantamentos <Icon name="chevron-right" size={14} />
                </button>
              </span>
            </div>
          )}

          <h3 className="mt-10">Vendas recentes</h3>
          <div className="overflow-x-auto rounded-md border border-border bg-white">
            <table className="w-full border-collapse text-[0.9rem]">
              <thead>
                <tr>
                  <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Comprador</th>
                  <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Produtor</th>
                  <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Produto</th>
                  <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Valor</th>
                  <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Data</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSales.length === 0 ? (
                  <tr><td className="px-3.5 py-3" colSpan={5}>Ainda não há vendas.</td></tr>
                ) : (
                  stats.recentSales.map((s, index) => (
                    <tr key={`${s.paid_at}-${index}`}>
                      <td className="border-t border-border px-3.5 py-3">{s.buyer_name}</td>
                      <td className="border-t border-border px-3.5 py-3">{s.seller_name}</td>
                      <td className="border-t border-border px-3.5 py-3">{s.product_title}</td>
                      <td className="border-t border-border px-3.5 py-3">{formatPrice(s.amount_cents, s.currency)}</td>
                      <td className="border-t border-border px-3.5 py-3">{s.paid_at ? formatDateShort(s.paid_at) : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
