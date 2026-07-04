import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useOrder } from '../../api/orders';
import { Card } from '../../components/Card';
import { Spinner } from '../../components/Spinner';
import { Icon } from '../../lib/icons';

const MAX_ATTEMPTS = 5;
const POLL_MS = 2000;

export function CheckoutSuccess() {
  const { orderId } = useParams();
  const [attempt, setAttempt] = useState(0);
  const { data, isLoading } = useOrder(orderId, { refetchInterval: attempt < MAX_ATTEMPTS ? POLL_MS : undefined });

  useEffect(() => {
    if (!data || data.order.status === 'paid') return;
    if (attempt >= MAX_ATTEMPTS) return;
    const timer = setTimeout(() => setAttempt((a) => a + 1), POLL_MS);
    return () => clearTimeout(timer);
  }, [data, attempt]);

  return (
    <div className="mx-auto max-w-[520px] px-6 pt-16 pb-16">
      <Card className="text-center">
        {isLoading || !data ? (
          <Spinner />
        ) : data.order.status === 'paid' ? (
          <>
            <div className="text-success"><Icon name="check-circle" size={48} /></div>
            <h2>Pagamento confirmado!</h2>
            <p>Já tem acesso a <strong>{data.order.product_title}</strong>.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to={`/curso/${data.order.product_id}`} className="inline-flex items-center gap-2 rounded-sm bg-primary px-[22px] py-3 font-heading font-semibold text-white shadow-sm hover:bg-primary-dark">
                Aceder ao produto
              </Link>
              <Link to="/painel" className="inline-flex items-center gap-2 rounded-sm border border-border px-[22px] py-3 font-heading font-semibold text-text hover:border-primary hover:text-primary">
                Ir para o meu painel
              </Link>
            </div>
          </>
        ) : attempt < MAX_ATTEMPTS ? (
          <>
            <Spinner />
            <p>A confirmar o seu pagamento...</p>
          </>
        ) : (
          <>
            <div className="text-text-muted"><Icon name="clock" size={40} /></div>
            <h2>Ainda a processar</h2>
            <p>O seu pagamento está a ser confirmado. Pode acompanhar o estado no seu painel.</p>
            <Link to="/painel" className="inline-flex items-center gap-2 rounded-sm bg-primary px-[22px] py-3 font-heading font-semibold text-white shadow-sm hover:bg-primary-dark">
              Ir para o meu painel
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}
