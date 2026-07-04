import { useState } from 'react';
import { useMyCertificates } from '../../api/certificates';
import { downloadCertificateBlob } from '../../api/client';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Spinner } from '../../components/Spinner';
import { LinkButton } from '../../components/LinkButton';
import { Icon } from '../../lib/icons';
import { formatDate } from '../../lib/format';

export function Certificates() {
  const { data, isLoading } = useMyCertificates();
  const certificates = data?.certificates || [];
  const [downloadingCode, setDownloadingCode] = useState<string | null>(null);

  async function handleDownload(code: string) {
    setDownloadingCode(code);
    try {
      const blob = await downloadCertificateBlob(code);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificado-${code}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao gerar certificado.');
    } finally {
      setDownloadingCode(null);
    }
  }

  return (
    <div>
      <div className="mb-5"><h3 className="mb-0">Os meus certificados</h3></div>
      {isLoading ? (
        <Spinner />
      ) : certificates.length === 0 ? (
        <EmptyState icon="award" action={<LinkButton to="/painel/compras">Continuar a aprender</LinkButton>}>
          Ainda não concluiu nenhum produto.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <Card key={cert.certificate_code}>
              <div className="mb-2 text-accent"><Icon name="award" size={32} /></div>
              <h3>{cert.product_title}</h3>
              <p className="text-[0.85rem]">Emitido em {formatDate(cert.issued_at)}</p>
              <p className="mb-4 text-[0.8rem] text-text-muted">Código: {cert.certificate_code}</p>
              <Button block disabled={downloadingCode === cert.certificate_code} onClick={() => handleDownload(cert.certificate_code)}>
                {downloadingCode === cert.certificate_code ? 'A gerar...' : 'Descarregar PDF'}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
