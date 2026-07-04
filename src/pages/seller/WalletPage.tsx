import { useState } from 'react';
import { useWallet, usePayoutAccounts, useCreatePayoutAccount, useDeletePayoutAccount, useCreateWithdrawal, useMyWithdrawals } from '../../api/wallet';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { Alert } from '../../components/Alert';
import { inputClasses, labelClasses } from '../../components/formControls';
import { formatDateShort, formatPrice, WITHDRAWAL_STATUS_LABEL } from '../../lib/format';

const LEDGER_LABEL: Record<string, string> = { sale: 'Venda', withdrawal: 'Levantamento', reversal: 'Estorno' };

export function WalletPage() {
  const { data: wallet } = useWallet();
  const { data: accountsData } = usePayoutAccounts();
  const { data: withdrawalsData } = useMyWithdrawals();
  const createAccount = useCreatePayoutAccount();
  const deleteAccount = useDeletePayoutAccount();
  const createWithdrawal = useCreateWithdrawal();

  const accounts = accountsData?.accounts || [];
  const withdrawals = withdrawalsData?.withdrawals || [];

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountMethod, setAccountMethod] = useState<'iban' | 'mbway'>('iban');
  const [holderName, setHolderName] = useState('');
  const [iban, setIban] = useState('');
  const [phone, setPhone] = useState('');
  const [accountError, setAccountError] = useState('');

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [payoutAccountId, setPayoutAccountId] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setAccountError('');
    try {
      await createAccount.mutateAsync({ method: accountMethod, holder_name: holderName.trim(), iban: iban.trim(), phone: phone.trim() });
      setShowAccountModal(false);
      setHolderName('');
      setIban('');
      setPhone('');
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'Erro ao adicionar conta.');
    }
  }

  async function handleDeleteAccount(id: number) {
    if (!confirm('Remover esta conta de pagamento?')) return;
    await deleteAccount.mutateAsync(id);
  }

  function openWithdrawModal() {
    if (accounts.length === 0) {
      alert('Adicione primeiro uma conta de pagamento.');
      return;
    }
    setAmount('');
    setPayoutAccountId(String(accounts[0].id));
    setWithdrawError('');
    setShowWithdrawModal(true);
  }

  async function handleCreateWithdrawal(e: React.FormEvent) {
    e.preventDefault();
    setWithdrawError('');
    try {
      await createWithdrawal.mutateAsync({ amount_cents: Math.round(Number(amount) * 100), payout_account_id: Number(payoutAccountId) });
      setShowWithdrawModal(false);
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : 'Erro ao pedir levantamento.');
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-8 rounded-xl bg-gradient-to-br from-dark to-black p-8 text-white">
        <div>
          <div className="text-[0.85rem] text-[#b8b8b8]">Saldo disponível</div>
          <div className="font-heading text-[2.4rem] font-bold">{wallet ? formatPrice(wallet.balance_cents) : '—'}</div>
        </div>
        <div className="flex gap-8 text-white">
          <div>
            <div className="text-[0.85rem] text-[#b8b8b8]">Total ganho</div>
            <div className="text-[1.3rem] font-semibold">{wallet ? formatPrice(wallet.total_earned_cents) : '—'}</div>
          </div>
          <div>
            <div className="text-[0.85rem] text-[#b8b8b8]">Levantamentos pendentes</div>
            <div className="text-[1.3rem] font-semibold">{wallet ? formatPrice(wallet.pending_withdrawals_cents) : '—'}</div>
          </div>
        </div>
        <Button variant="accent" onClick={openWithdrawModal}>Pedir levantamento</Button>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
        <div>
          <h3>Histórico da carteira</h3>
          <Card className="px-5 py-2">
            {!wallet || wallet.ledger.length === 0 ? (
              <p className="py-4 text-text-muted">Ainda não há movimentos na carteira.</p>
            ) : (
              wallet.ledger.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between border-b border-border py-3 text-[0.9rem] last:border-0">
                  <div>
                    <div>{LEDGER_LABEL[entry.type] || entry.type}</div>
                    <div className="text-[0.78rem] text-text-muted">{formatDateShort(entry.created_at)}</div>
                  </div>
                  <span className={`font-semibold ${entry.amount_cents >= 0 ? 'text-success' : 'text-danger'}`}>
                    {entry.amount_cents >= 0 ? '+' : ''}{formatPrice(entry.amount_cents)}
                  </span>
                </div>
              ))
            )}
          </Card>

          <h3 className="mt-8">Os meus levantamentos</h3>
          <div className="overflow-x-auto rounded-xl border border-border bg-white">
            <table className="w-full border-collapse text-[0.83rem]">
              <thead>
                <tr>
                  <th className="px-3.5 py-2.5 text-left text-[0.7rem] font-semibold uppercase tracking-wide text-text-muted">Valor</th>
                  <th className="px-3.5 py-2.5 text-left text-[0.7rem] font-semibold uppercase tracking-wide text-text-muted">Estado</th>
                  <th className="px-3.5 py-2.5 text-left text-[0.7rem] font-semibold uppercase tracking-wide text-text-muted">Pedido em</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.length === 0 ? (
                  <tr><td className="px-3.5 py-3" colSpan={3}>Ainda não pediu nenhum levantamento.</td></tr>
                ) : (
                  withdrawals.map((w) => (
                    <tr key={w.id}>
                      <td className="border-t border-border px-3.5 py-2.5">{formatPrice(w.amount_cents)}</td>
                      <td className="border-t border-border px-3.5 py-2.5"><Badge variant={w.status === 'paid' ? 'success' : w.status === 'rejected' ? 'danger' : 'neutral'}>{WITHDRAWAL_STATUS_LABEL[w.status] || w.status}</Badge></td>
                      <td className="border-t border-border px-3.5 py-2.5">{formatDateShort(w.requested_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3>Contas de pagamento</h3>
          <div className="mb-2 flex flex-col gap-2.5">
            {accounts.length === 0 ? (
              <p className="text-text-muted">Ainda não adicionou nenhuma conta de pagamento.</p>
            ) : (
              accounts.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-sm border border-border px-4 py-3.5">
                  <div>
                    <div className="flex items-center gap-2 font-semibold">
                      {a.method === 'iban' ? 'IBAN' : 'MB WAY'}
                      {a.is_default && <Badge variant="success">Principal</Badge>}
                    </div>
                    <div className="text-[0.85rem] text-text-muted">{a.holder_name} · {a.iban || a.phone}</div>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteAccount(a.id)}>Remover</Button>
                </div>
              ))
            )}
          </div>
          <Button variant="outline" block onClick={() => setShowAccountModal(true)}>+ Adicionar conta de pagamento</Button>
        </div>
      </div>

      <Modal open={showAccountModal} onClose={() => setShowAccountModal(false)} title="Adicionar conta de pagamento">
        <Alert variant="error">{accountError}</Alert>
        <form onSubmit={handleCreateAccount}>
          <div className="mb-4">
            <label className={labelClasses}>Método</label>
            <select className={inputClasses()} value={accountMethod} onChange={(e) => setAccountMethod(e.target.value as 'iban' | 'mbway')}>
              <option value="iban">Transferência bancária (IBAN)</option>
              <option value="mbway">MB WAY</option>
            </select>
          </div>
          <div className="mb-4">
            <label className={labelClasses}>Nome do titular</label>
            <input className={inputClasses()} required value={holderName} onChange={(e) => setHolderName(e.target.value)} />
          </div>
          {accountMethod === 'iban' ? (
            <div className="mb-4">
              <label className={labelClasses}>IBAN</label>
              <input className={inputClasses()} placeholder="PT50..." value={iban} onChange={(e) => setIban(e.target.value)} />
            </div>
          ) : (
            <div className="mb-4">
              <label className={labelClasses}>Número de telemóvel</label>
              <input className={inputClasses()} placeholder="+351 9xx xxx xxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          )}
          <Button type="submit" block disabled={createAccount.isPending}>Guardar conta</Button>
        </form>
      </Modal>

      <Modal open={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} title="Pedir levantamento">
        <Alert variant="error">{withdrawError}</Alert>
        <form onSubmit={handleCreateWithdrawal}>
          <div className="mb-4">
            <label className={labelClasses}>Valor a levantar (€)</label>
            <input type="number" min={10} step={0.01} required className={inputClasses()} value={amount} onChange={(e) => setAmount(e.target.value)} />
            <p className="mt-1.5 mb-0 text-[0.8rem] text-text-muted">Valor mínimo: 10,00 €. Saldo disponível: <strong>{wallet ? formatPrice(wallet.balance_cents) : '—'}</strong></p>
          </div>
          <div className="mb-4">
            <label className={labelClasses}>Conta de pagamento</label>
            <select className={inputClasses()} value={payoutAccountId} onChange={(e) => setPayoutAccountId(e.target.value)}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.method === 'iban' ? 'IBAN' : 'MB WAY'} — {a.iban || a.phone}</option>
              ))}
            </select>
          </div>
          <Button type="submit" block disabled={createWithdrawal.isPending}>Confirmar pedido</Button>
        </form>
      </Modal>
    </div>
  );
}
