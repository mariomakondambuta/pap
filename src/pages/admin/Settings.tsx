import { useEffect, useState } from 'react';
import { useSettings } from '../../api/settings';
import { useUpdateAdminSettings } from '../../api/admin';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Icon } from '../../lib/icons';
import { inputClasses, labelClasses } from '../../components/formControls';

export function Settings() {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateAdminSettings();
  const [name, setName] = useState('');
  const [commission, setCommission] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setName(settings.platform_name);
    setCommission(String(settings.commission_percent));
  }, [settings]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await updateSettings.mutateAsync({ platform_name: name.trim(), commission_percent: commission });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <div>
      <h3>Definições da plataforma</h3>
      <Card className="max-w-[480px]">
        {success && <div className="mb-4 rounded-sm bg-success-light px-4 py-3 text-[0.9rem] text-success">Definições guardadas com sucesso.</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={labelClasses}>Nome da plataforma</label>
            <input className={inputClasses()} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className={labelClasses}>Comissão da plataforma (%)</label>
            <input type="number" min={0} max={100} step={0.1} className={inputClasses()} value={commission} onChange={(e) => setCommission(e.target.value)} />
            <p className="mt-1.5 mb-0 text-[0.8rem] text-text-muted">Percentagem retida em cada venda paga. O restante é creditado ao produtor.</p>
          </div>
          <div className="mb-4">
            <label className={labelClasses}>Estado dos pagamentos</label>
            <p>
              {settings ? (
                <Badge variant={settings.stripe_enabled ? 'success' : 'warning'}>
                  <Icon name={settings.stripe_enabled ? 'check-circle' : 'flask'} size={14} />
                  {settings.stripe_enabled ? 'Stripe ativa (pagamentos reais)' : 'Modo de demonstração (sem chaves Stripe)'}
                </Badge>
              ) : '—'}
            </p>
          </div>
          <Button type="submit" disabled={updateSettings.isPending}>Guardar definições</Button>
        </form>
      </Card>
    </div>
  );
}
