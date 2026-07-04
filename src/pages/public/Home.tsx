import { Link } from 'react-router-dom';
import { useProducts } from '../../api/products';
import { ProductCard } from '../../components/ProductCard';
import { EmptyState } from '../../components/EmptyState';
import { Spinner } from '../../components/Spinner';
import { Icon } from '../../lib/icons';
import { useInView } from '../../hooks/useInView';

const HERO_ITEMS = [
  { icon: 'video', label: 'Cursos em vídeo' },
  { icon: 'book', label: 'E-books' },
  { icon: 'bar-chart', label: 'Planilhas' },
  { icon: 'file-text', label: 'Templates' },
];

const TRUST_ITEMS = [
  { icon: 'lock', label: 'Pagamentos protegidos pela Stripe' },
  { icon: 'card', label: 'Nenhum dado de cartão fica guardado na EduWeb' },
  { icon: 'coins', label: 'Comissão transparente para produtores' },
  { icon: 'graduation-cap', label: 'Certificado digital verificável' },
];

const STEPS = [
  { title: '1. Crie a sua conta', desc: 'Uma única conta para vender e para comprar.' },
  { title: '2. Publique ou explore', desc: 'Crie o seu produto em minutos ou escolha entre o catálogo disponível.' },
  { title: '3. Pague ou receba com segurança', desc: 'Checkout protegido pela Stripe; produtores recebem na sua carteira.' },
  { title: '4. Acompanhe tudo', desc: 'Progresso, certificados, vendas e levantamentos, num único painel.' },
];

function Reveal({ children }: { children: React.ReactNode }) {
  const { ref, visible } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      {children}
    </div>
  );
}

export function Home() {
  const { data, isLoading } = useProducts();
  const products = data?.products || [];
  const totalStudents = products.reduce((sum, p) => sum + Number(p.student_count || 0), 0);

  return (
    <>
      <header className="bg-[radial-gradient(circle_at_top_right,var(--color-bg-alt),#fff_55%)] py-16 sm:py-24">
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-light px-3.5 py-1.5 text-[0.8rem] font-semibold text-primary">
              O marketplace de infoprodutos
            </span>
            <h1 className="text-[clamp(2.2rem,5.5vw,3.6rem)] tracking-tight">
              Venda o seu conhecimento.
              <br /> Aprenda com quem já sabe.
            </h1>
            <p className="mt-4 max-w-[480px] text-[1.05rem] text-text-muted">
              Cursos, e-books, planilhas e templates — tudo num só sítio, com pagamentos processados em segurança.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <Link to="/registar" className="inline-flex items-center gap-2 rounded-sm bg-primary px-[22px] py-3 font-heading font-semibold text-white shadow-sm hover:bg-primary-dark">
                Quero vender
              </Link>
              <Link to="/cursos" className="inline-flex items-center gap-2 rounded-sm border border-border px-[22px] py-3 font-heading font-semibold text-text hover:border-primary hover:text-primary">
                Quero aprender
              </Link>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg bg-gradient-to-br from-[#2a2a2a] to-dark p-8 text-center text-white shadow-lg">
            <ul className="mb-5 flex list-none flex-col gap-3.5 p-0">
              {HERO_ITEMS.map((item) => (
                <li key={item.label} className="flex items-center gap-2.5">
                  <Icon name={item.icon} size={18} /> {item.label}
                </li>
              ))}
            </ul>
            <div className="w-full border-t border-white/25 pt-4 text-[0.85rem] text-white/85">Pagamento seguro com Stripe</div>
          </div>
        </div>
      </header>

      <div className="border-y border-border py-7">
        <div className="mx-auto flex max-w-[1180px] flex-wrap justify-center gap-10 px-6">
          {TRUST_ITEMS.map((item) => (
            <span key={item.label} className="flex items-center gap-2 text-[0.9rem] text-text">
              <Icon name={item.icon} size={18} className="text-primary" /> {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="border-b border-border py-10">
        <div className="mx-auto grid max-w-[1180px] grid-cols-2 gap-7 px-6 text-center sm:grid-cols-3">
          <div>
            <div className="font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-bold text-dark">{isLoading ? '—' : products.length}</div>
            <div className="mt-0.5 text-[0.85rem] text-text-muted">Produtos disponíveis</div>
          </div>
          <div>
            <div className="font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-bold text-dark">{isLoading ? '—' : totalStudents}</div>
            <div className="mt-0.5 text-[0.85rem] text-text-muted">Alunos inscritos</div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-bold text-dark">100%</div>
            <div className="mt-0.5 text-[0.85rem] text-text-muted">Pagamentos seguros</div>
          </div>
        </div>
      </div>

      <section className="py-16">
        <div className="mx-auto max-w-[1180px] px-6">
          <Reveal>
            <div className="mx-auto mb-10 max-w-[640px] text-center">
              <span className="mb-3 inline-flex rounded-full bg-primary-light px-3.5 py-1.5 text-[0.8rem] font-semibold text-primary">Um só lugar, dois lados</span>
              <h2>Para quem vende e para quem aprende</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Reveal>
              <div className="flex h-full flex-col gap-3.5 rounded-lg bg-gradient-to-br from-[#4a4a4a] to-[#232323] p-10 text-white">
                <span className="mb-1 inline-flex w-fit rounded-full bg-white/15 px-3.5 py-1.5 text-[0.8rem] font-semibold text-white">Para produtores</span>
                <h3 className="text-white">Venda os seus infoprodutos</h3>
                <p className="text-white/85">Publique cursos, e-books, planilhas ou templates, defina o preço (ou ofereça grátis) e receba os seus pagamentos diretamente na sua carteira EduWeb.</p>
                <Link to="/registar" className="mt-auto inline-flex w-fit items-center gap-2 rounded-sm bg-accent px-[22px] py-3 font-heading font-semibold text-white hover:bg-accent-dark">
                  Criar o meu primeiro produto
                </Link>
              </div>
            </Reveal>
            <Reveal>
              <div className="flex h-full flex-col gap-3.5 rounded-lg bg-gradient-to-br from-[#232323] to-dark p-10 text-white">
                <span className="mb-1 inline-flex w-fit rounded-full bg-white/15 px-3.5 py-1.5 text-[0.8rem] font-semibold text-white">Para alunos</span>
                <h3 className="text-white">Aprenda ao seu ritmo</h3>
                <p className="text-white/85">Explore o catálogo, compre com segurança ou aceda a conteúdos gratuitos, acompanhe o seu progresso e receba certificado ao concluir.</p>
                <Link to="/cursos" className="mt-auto inline-flex w-fit items-center gap-2 rounded-sm bg-white px-[22px] py-3 font-heading font-semibold text-primary hover:bg-white/90">
                  Explorar produtos
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-bg-alt py-16">
        <div className="mx-auto max-w-[1180px] px-6">
          <Reveal>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="mb-2 inline-flex rounded-full bg-primary-light px-3.5 py-1.5 text-[0.8rem] font-semibold text-primary">Catálogo</span>
                <h2 className="mb-0">Produtos em destaque</h2>
              </div>
              <Link to="/cursos" className="inline-flex items-center gap-2 rounded-sm border border-border px-[22px] py-3 font-heading font-semibold text-text hover:border-primary hover:text-primary">
                Ver todos
              </Link>
            </div>
          </Reveal>
          {isLoading ? (
            <Spinner />
          ) : products.length === 0 ? (
            <EmptyState icon="inbox">Ainda não há produtos publicados.</EmptyState>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.slice(0, 6).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-[1180px] px-6">
          <Reveal>
            <div className="mx-auto mb-12 max-w-[640px] text-center">
              <span className="mb-3 inline-flex rounded-full bg-primary-light px-3.5 py-1.5 text-[0.8rem] font-semibold text-primary">Como funciona</span>
              <h2>Simples para vender, simples para comprar</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <Reveal key={step.title}>
                <div className="rounded-md border border-border bg-white p-6 text-center shadow-sm">
                  <h3>{step.title}</h3>
                  <p className="mb-0">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 text-center">
        <Reveal>
          <div className="mx-auto max-w-[640px] px-6">
            <h2>Pronto para começar?</h2>
            <p>Junte-se a quem já está a vender e a aprender na EduWeb.</p>
            <Link to="/registar" className="inline-flex items-center gap-2 rounded-sm bg-primary px-[22px] py-3 font-heading font-semibold text-white shadow-sm hover:bg-primary-dark">
              Criar conta grátis
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
