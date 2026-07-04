import { useMyLibrary } from '../../api/enrollments';
import { LibraryCard } from '../../components/LibraryCard';
import { EmptyState } from '../../components/EmptyState';
import { Spinner } from '../../components/Spinner';
import { LinkButton } from '../../components/LinkButton';

export function Library() {
  const { data, isLoading } = useMyLibrary();
  const products = data?.products || [];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="mb-0">Os meus produtos</h3>
        <LinkButton to="/explorar" variant="outline" size="sm">Explorar mais produtos</LinkButton>
      </div>
      {isLoading ? (
        <Spinner />
      ) : products.length === 0 ? (
        <EmptyState icon="book-open" action={<LinkButton to="/explorar">Explorar produtos</LinkButton>}>
          Ainda não tem produtos na sua biblioteca.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <LibraryCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
