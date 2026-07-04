import { useMyLibrary } from '../../api/enrollments';
import { useMyCertificates } from '../../api/certificates';
import { LibraryCard } from '../../components/LibraryCard';
import { EmptyState } from '../../components/EmptyState';
import { Spinner } from '../../components/Spinner';
import { LinkButton } from '../../components/LinkButton';
import { Card } from '../../components/Card';
import { useAuth } from '../../auth/AuthContext';

export function BuyerHome() {
  const { user } = useAuth();
  const { data: libraryData, isLoading: libraryLoading } = useMyLibrary();
  const { data: certData } = useMyCertificates();
  const products = libraryData?.products || [];
  const certificates = certData?.certificates || [];

  return (
    <div>
      <div className="mb-6">
        <h1>Olá, {user?.name?.split(' ')[0]}</h1>
        <p className="mb-0 text-text-muted">Aqui encontra tudo o que precisa e tem acesso às suas compras.</p>
      </div>

      {libraryLoading ? (
        <Spinner />
      ) : products.length === 0 ? (
        <EmptyState hero icon="shopping-bag" title="As suas compras vão aparecer aqui" action={<LinkButton to="/explorar">Comprar um produto</LinkButton>}>
          Explore o marketplace, encontre os produtos que procura e faça a sua primeira compra.
        </EmptyState>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card><p className="mb-1 text-text-muted">Na biblioteca</p><h2 className="mb-0">{products.length}</h2></Card>
            <Card><p className="mb-1 text-text-muted">Certificados</p><h2 className="mb-0">{certificates.length}</h2></Card>
            <Card><p className="mb-1 text-text-muted">Concluídos</p><h2 className="mb-0">{products.filter((p) => p.progress_percent === 100).length}</h2></Card>
          </div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="mb-0">Continuar a aprender</h3>
            <LinkButton to="/painel/compras" variant="ghost" size="sm">Ver todas</LinkButton>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 3).map((p) => (
              <LibraryCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
