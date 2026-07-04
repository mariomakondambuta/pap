import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useProduct, useEnrollFree } from '../../api/products';
import { useCheckout } from '../../api/orders';
import { useAuth } from '../../auth/AuthContext';
import { Icon } from '../../lib/icons';
import { LEVEL_LABELS } from '../../lib/format';
import { formatPrice } from '../../lib/format';
import { FormatBadge } from '../../components/FormatBadge';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Spinner } from '../../components/Spinner';
import { EmptyState } from '../../components/EmptyState';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data, isLoading, error, refetch } = useProduct(id);
  const enrollFree = useEnrollFree();
  const checkout = useCheckout();
  const [actionError, setActionError] = useState('');

  if (isLoading) return <div className="mx-auto max-w-[1180px] px-6 py-10"><Spinner /></div>;
  if (error || !data) {
    return (
      <div className="mx-auto max-w-[1180px] px-6 py-10">
        <EmptyState icon="alert-triangle">{error instanceof Error ? error.message : 'Produto não encontrado.'}</EmptyState>
      </div>
    );
  }

  const { product, lessons, hasAccess, progress, pendingOrderId, isOwner } = data;
  const levelLabel = LEVEL_LABELS[product.level] || product.level;

  async function handleAccessFree() {
    if (!isAuthenticated) return navigate('/login');
    setActionError('');
    try {
      await enrollFree.mutateAsync(product.id);
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erro ao aceder ao produto.');
    }
  }

  async function handleBuy() {
    if (!isAuthenticated) return navigate('/login');
    setActionError('');
    try {
      const { orderId, simulated, checkoutUrl } = await checkout.mutateAsync(product.id);
      if (simulated) navigate(`/checkout/${orderId}`);
      else if (checkoutUrl) window.location.href = checkoutUrl;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erro ao iniciar o pagamento.');
    }
  }

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-10">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[2fr_1fr]">
        <div>
          <div className="mb-3 flex gap-2">
            <FormatBadge format={product.format} />
            <Badge variant="neutral">{product.category || 'Geral'}</Badge>
          </div>
          <h1>{product.title}</h1>
          <p className="text-[1.05rem]">{product.description}</p>
          <div className="mb-6 flex flex-wrap gap-3">
            <Badge variant="neutral">{levelLabel}</Badge>
            <Badge variant="neutral">{lessons.length} conteúdos</Badge>
            <Badge variant="neutral">{product.student_count} alunos</Badge>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-sm bg-bg-alt p-3.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white">
              {(product.seller_name || '?').slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold">{product.seller_name}</div>
              <div className="text-[0.82rem] text-text-muted">{product.seller_bio || 'Produtor na EduWeb'}</div>
            </div>
          </div>

          <h3 className="mt-8">Conteúdo do produto</h3>
          {lessons.length === 0 ? (
            <EmptyState>Ainda não há conteúdos disponíveis neste produto.</EmptyState>
          ) : (
            <ul className="flex list-none flex-col gap-2 p-0">
              {lessons.map((lesson) => {
                const canAccess = hasAccess || isOwner;
                const inner = (
                  <>
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-bg-alt">
                      <Icon name={lesson.completed ? 'check' : lesson.type === 'video' ? 'video' : lesson.type === 'pdf' ? 'file-text' : 'paperclip'} size={18} />
                    </span>
                    <div className="flex-1">
                      <div className="font-semibold">{lesson.title}</div>
                      <div className="text-[0.8rem] text-text-muted">
                        {lesson.type === 'video' ? 'Vídeo-aula' : lesson.type === 'pdf' ? 'Documento PDF' : 'Ficheiro para descarregar'}
                        {lesson.duration_minutes ? ` · ${lesson.duration_minutes} min` : ''}
                      </div>
                    </div>
                    <span>{canAccess ? <Icon name="chevron-right" size={16} /> : <Icon name="lock" size={16} />}</span>
                  </>
                );
                const className = `flex items-center gap-3 rounded-sm border p-3.5 ${lesson.completed ? 'border-success bg-success-light' : 'border-border bg-white'} ${!canAccess ? 'opacity-60' : ''}`;
                return (
                  <li key={lesson.id}>
                    {canAccess ? (
                      <Link to={`/aula/${lesson.id}`} className={className}>{inner}</Link>
                    ) : (
                      <div className={className}>{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <Card>
          <div className="mb-5 flex h-40 items-center justify-center rounded-sm bg-gradient-to-br from-[#3a3a3a] to-dark p-4 text-center font-heading font-semibold text-white">
            {product.title}
          </div>
          <div className={`mb-4 font-heading text-[1.4rem] font-bold ${product.is_free ? 'text-success' : 'text-dark'}`}>
            {product.is_free ? 'Grátis' : formatPrice(product.price_cents, product.currency)}
          </div>

          {isOwner ? (
            <Link to="/negocio/produtos" className="flex w-full items-center justify-center gap-2 rounded-sm border border-border px-[22px] py-3 font-heading font-semibold text-text hover:border-primary hover:text-primary">
              Gerir este produto
            </Link>
          ) : hasAccess ? (
            <>
              <div className="mb-2 flex items-center justify-between text-[0.85rem]">
                <span className="text-text-muted">O seu progresso</span>
                <strong>{progress?.percent ?? 0}%</strong>
              </div>
              <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-bg-alt">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${progress?.percent ?? 0}%` }} />
              </div>
              {progress?.percent === 100 ? (
                <Link to="/painel/certificados" className="flex w-full items-center justify-center gap-2 rounded-sm bg-accent px-[22px] py-3 font-heading font-semibold text-white hover:bg-accent-dark">
                  <Icon name="award" size={18} /> Ver certificado
                </Link>
              ) : (
                <Badge variant="success">Já tem acesso</Badge>
              )}
            </>
          ) : product.is_free ? (
            <Button block onClick={handleAccessFree} disabled={enrollFree.isPending}>
              Aceder gratuitamente
            </Button>
          ) : (
            <Button block onClick={handleBuy} disabled={checkout.isPending}>
              {pendingOrderId ? 'Continuar compra' : 'Comprar agora'}
            </Button>
          )}
          {actionError && <p className="mt-3 text-[0.85rem] text-danger">{actionError}</p>}

          <div className="mt-4.5 flex flex-wrap gap-4.5 border-t border-border pt-4.5">
            <span className="flex items-center gap-2 text-[0.82rem] text-text-muted"><Icon name="lock" size={16} className="text-primary" /> Pagamento seguro</span>
            <span className="flex items-center gap-2 text-[0.82rem] text-text-muted"><Icon name="zap" size={16} className="text-primary" /> Acesso imediato</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
