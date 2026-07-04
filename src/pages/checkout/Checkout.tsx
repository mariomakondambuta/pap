import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useOrder } from '../../api/orders';
import { useCheckout, useSimulatePay } from '../../api/orders';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Spinner } from '../../components/Spinner';
import { Icon } from '../../lib/icons';
import { formatPrice } from '../../lib/format';

export function Checkout() {
  const { orderId } = useParams();
  const { data, isLoading, refetch } = useOrder(orderId);
  const checkout = useCheckout();
  const simulatePay = useSimulatePay();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-[560px] px-6 pt-12 pb-16">
        <Card><Spinner /></Card>
      </div>
    );
  }

  const { order, stripeEnabled } = data;

  async function payWithStripe() {
    setError('');
    setPending(true);
    try {
      const { checkoutUrl } = await checkout.mutateAsync(order.product_id);
      if (checkoutUrl) window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao ligar à Stripe.');
      setPending(false);
    }
  }

  async function payWithSimulation() {
    setError('');
    setPending(true);
    try {
      await simulatePay.mutateAsync(order.id);
      window.location.href = `/checkout-sucesso/${order.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao confirmar pagamento.');
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-[560px] px-6 pt-12 pb-16">
      <Card>
        {order.status === 'paid' ? (
          <div className="text-center">
            <div className="text-success"><Icon name="check-circle" size={40} /></div>
            <h2>Já tem acesso a este produto</h2>
            <Link to={`/curso/${order.product_id}`} className="inline-flex items-center gap-2 rounded-sm bg-primary px-[22px] py-3 font-heading font-semibold text-white shadow-sm hover:bg-primary-dark">
              Aceder ao produto
            </Link>
          </div>
        ) : (
          <>
            <h2>Finalizar compra</h2>
            {!stripeEnabled && (
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-warning-light px-2.5 py-1 text-[0.78rem] font-semibold text-warning">
                <Icon name="flask" size={14} /> Modo de demonstração — nenhum valor real será cobrado
              </span>
            )}
            <div className="mb-5 flex items-center gap-4 border-b border-border pb-5">
              <div className="h-[72px] w-[72px] flex-shrink-0 rounded-sm bg-gradient-to-br from-[#3a3a3a] to-dark" />
              <div>
                <div className="font-semibold">{order.product_title}</div>
                <div className="text-[0.85rem] text-text-muted">Encomenda #{order.id}</div>
              </div>
            </div>
            <div className="flex justify-between py-2 text-[0.92rem]"><span>Preço do produto</span><span>{formatPrice(order.amount_cents, order.currency)}</span></div>
            <div className="mt-2 flex justify-between border-t border-border pt-4 font-heading text-[1.1rem] font-bold"><span>Total a pagar</span><span>{formatPrice(order.amount_cents, order.currency)}</span></div>

            {!stripeEnabled && (
              <div className="mt-5 rounded-sm border border-dashed border-border bg-bg-alt p-4">
                <div className="mb-3">
                  <label className="mb-1.5 block text-[0.88rem] font-semibold">Número do cartão</label>
                  <input className="w-full rounded-sm border border-border bg-white px-3.5 py-2.5 opacity-70" value="4242 4242 4242 4242" disabled />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="mb-1.5 block text-[0.88rem] font-semibold">Validade</label><input className="w-full rounded-sm border border-border bg-white px-3.5 py-2.5 opacity-70" value="12/30" disabled /></div>
                  <div><label className="mb-1.5 block text-[0.88rem] font-semibold">CVC</label><input className="w-full rounded-sm border border-border bg-white px-3.5 py-2.5 opacity-70" value="123" disabled /></div>
                </div>
              </div>
            )}

            {error && <div className="mt-4 rounded-sm bg-danger-light px-4 py-3 text-[0.9rem] text-danger">{error}</div>}

            <Button block className="mt-5" disabled={pending} onClick={stripeEnabled ? payWithStripe : payWithSimulation}>
              {pending ? 'A processar...' : stripeEnabled ? 'Pagar com cartão' : 'Confirmar pagamento (simulado)'}
            </Button>
            <Link to={`/curso/${order.product_id}`} className="mt-2 flex w-full items-center justify-center gap-2 rounded-sm px-[22px] py-3 font-heading font-semibold text-text hover:bg-bg-alt" onClick={() => refetch()}>
              Cancelar e voltar ao produto
            </Link>

            <div className="mt-4.5 border-t border-border pt-4.5">
              <span className="flex items-center gap-2 text-[0.82rem] text-text-muted">
                <Icon name="lock" size={16} className="text-primary" />
                {stripeEnabled ? 'Processado com segurança pela Stripe' : 'Em produção, isto é processado pela Stripe'}
              </span>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
