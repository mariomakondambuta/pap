import { useMemo, useState } from 'react';
import { useProducts, type ProductFilters } from '../../api/products';
import { ProductCard } from '../../components/ProductCard';
import { EmptyState } from '../../components/EmptyState';
import { Spinner } from '../../components/Spinner';
import { inputClasses } from '../../components/formControls';

export function Marketplace({ inApp = false }: { inApp?: boolean }) {
  const [search, setSearch] = useState('');
  const [format, setFormat] = useState('');
  const [price, setPrice] = useState<ProductFilters['price']>('');
  const [category, setCategory] = useState('');

  const filters = useMemo(() => ({ search, format, price, category }), [search, format, price, category]);
  const { data, isLoading } = useProducts(filters);
  const products = data?.products || [];
  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter((c): c is string => Boolean(c)))],
    [products]
  );

  return (
    <div className={inApp ? '' : 'py-10'}>
      <div className={inApp ? '' : 'mx-auto max-w-[1180px] px-6'}>
        <div className="mb-7">
          <h1 className="mb-2">Explorar produtos</h1>
          <p className="mb-0 text-text-muted">Cursos, e-books, planilhas e templates de produtores de todo o mundo.</p>
        </div>

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <input className={inputClasses()} type="search" placeholder="Pesquisar produtos..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className={inputClasses()} value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="">Todos os formatos</option>
            <option value="curso">Curso</option>
            <option value="ebook">E-book</option>
            <option value="planilha">Planilha</option>
            <option value="template">Template</option>
            <option value="pack">Pack</option>
            <option value="outro">Outro</option>
          </select>
          <select className={inputClasses()} value={price} onChange={(e) => setPrice(e.target.value as ProductFilters['price'])}>
            <option value="">Grátis e pagos</option>
            <option value="gratis">Apenas grátis</option>
            <option value="pago">Apenas pagos</option>
          </select>
          <select className={inputClasses()} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <Spinner />
        ) : products.length === 0 ? (
          <EmptyState icon="search">Nenhum produto encontrado com estes filtros.</EmptyState>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
