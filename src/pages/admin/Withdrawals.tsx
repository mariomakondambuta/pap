import { useState } from 'react';
import { useAdminWithdrawals, useProcessWithdrawal } from '../../api/admin';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { formatDateShort, formatPrice, WITHDRAWAL_STATUS_LABEL } from '../../lib/format';

export function Withdrawals() {
  const { data, isLoading } = useAdminWithdrawals();
  const processWithdrawal = useProcessWithdrawal();
  const withdrawals = data?.withdrawals || [];
  const [activeId, setActiveId] = useState<number | null>(null);
  const [note, setNote] = useState('');

  const active = withdrawals.find((w) => w.id === activeId);

  function openModal(id: number) {
    setActiveId(id);
    setNote('');
  }

  async function process(status: 'paid' | 'rejected') {
    if (!activeId) return;
    await processWithdrawal.mutateAsync({ id: activeId, status, admin_note: note.trim() });
    setActiveId(null);
  }

  return (
    <div>
      <h3>Pedidos de levantamento</h3>
      <div className="overflow-x-auto rounded-md border border-border bg-white">
        <table className="w-full border-collapse text-[0.9rem]">
          <thead>
            <tr>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Produtor</th>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Valor</th>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Conta</th>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Estado</th>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Pedido em</th>
              <th className="px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td className="px-3.5 py-3" colSpan={6}>A carregar...</td></tr>
            ) : withdrawals.length === 0 ? (
              <tr><td className="px-3.5 py-3" colSpan={6}>Ainda não há pedidos de levantamento.</td></tr>
            ) : (
              withdrawals.map((w) => (
                <tr key={w.id}>
                  <td className="border-t border-border px-3.5 py-3">{w.user_name}</td>
                  <td className="border-t border-border px-3.5 py-3">{formatPrice(w.amount_cents)}</td>
                  <td className="border-t border-border px-3.5 py-3">{w.method ? `${w.method === 'iban' ? 'IBAN' : 'MB WAY'} — ${w.iban || w.phone || ''}` : '—'}</td>
                  <td className="border-t border-border px-3.5 py-3"><Badge variant={w.status === 'paid' ? 'success' : w.status === 'rejected' ? 'danger' : 'neutral'}>{WITHDRAWAL_STATUS_LABEL[w.status] || w.status}</Badge></td>
                  <td className="border-t border-border px-3.5 py-3">{formatDateShort(w.requested_at)}</td>
                  <td className="border-t border-border px-3.5 py-3">
                    {w.status === 'pending' ? <Button variant="outline" size="sm" onClick={() => openModal(w.id)}>Processar</Button> : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={Boolean(active)} onClose={() => setActiveId(null)} title="Processar levantamento">
        {active && (
          <>
            <div className="mb-5">
              <p className="mb-1.5"><strong>Produtor:</strong> {active.user_name} ({active.user_email})</p>
              <p className="mb-1.5"><strong>Valor:</strong> {formatPrice(active.amount_cents)}</p>
              <p className="mb-0"><strong>Conta:</strong> {active.method === 'iban' ? 'IBAN' : 'MB WAY'} — {active.iban || active.phone} ({active.holder_name})</p>
            </div>
            <div className="mb-4">
              <label className="mb-1.5 block text-[0.88rem] font-semibold">Nota (opcional)</label>
              <textarea className="w-full rounded-sm border border-border px-3.5 py-2.5" placeholder="Ex: Transferência enviada a 03/07/2026" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <div className="flex gap-4">
              <Button className="flex-1" onClick={() => process('paid')} disabled={processWithdrawal.isPending}>Marcar como pago</Button>
              <Button variant="danger" onClick={() => process('rejected')} disabled={processWithdrawal.isPending}>Rejeitar</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
