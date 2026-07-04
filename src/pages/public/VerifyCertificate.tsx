import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { verifyCertificate, type VerifiedCertificate } from '../../api/certificates';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Spinner } from '../../components/Spinner';
import { Icon } from '../../lib/icons';
import { inputClasses, labelClasses } from '../../components/formControls';
import { formatDate } from '../../lib/format';

export function VerifyCertificate() {
  const [params] = useSearchParams();
  const [code, setCode] = useState(params.get('codigo') || '');
  const [state, setState] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [certificate, setCertificate] = useState<VerifiedCertificate | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    try {
      const { certificate: cert } = await verifyCertificate(code.trim().toUpperCase());
      setCertificate(cert);
      setState('success');
    } catch {
      setState('error');
    }
  }

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-10">
      <Card className="mx-auto max-w-[520px]">
        <h2 className="text-center">Verificar certificado</h2>
        <p className="text-center">Introduza o código presente no certificado para confirmar a sua autenticidade.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={labelClasses}>Código do certificado</label>
            <input className={`${inputClasses()} uppercase`} required placeholder="EDU-XXXXXXXX" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <Button type="submit" block>Verificar</Button>
        </form>

        <div className="mt-6">
          {state === 'loading' && <Spinner />}
          {state === 'error' && <div className="rounded-sm bg-danger-light px-4 py-3 text-[0.9rem] text-danger">Certificado não encontrado. Verifique o código introduzido.</div>}
          {state === 'success' && certificate && (
            <>
              <div className="mb-4 flex items-center gap-2 rounded-sm bg-success-light px-4 py-3 text-[0.9rem] text-success">
                <Icon name="check-circle" size={18} /> Certificado válido
              </div>
              <Card>
                <p className="mb-1.5"><strong>Aluno:</strong> {certificate.student_name}</p>
                <p className="mb-1.5"><strong>Produto:</strong> {certificate.product_title}</p>
                <p className="mb-0"><strong>Emitido em:</strong> {formatDate(certificate.issued_at)}</p>
              </Card>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
