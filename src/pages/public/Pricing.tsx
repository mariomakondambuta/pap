import { Link } from 'react-router-dom';
import { useSettings } from '../../api/settings';
import { Icon } from '../../lib/icons';
import { formatPrice } from '../../lib/format';
import { Card } from '../../components/Card';

const PRICING_FEATURES = [
  { icon: 'zap', title: 'Grátis para começar', desc: 'Criar conta e publicar produtos não custa nada, hoje e sempre.' },
  { icon: 'lock', title: 'Checkout seguro', desc: 'Pagamentos processados pela Stripe, sem dados de cartão a passar pelos nossos servidores.' },
  { icon: 'award', title: 'Certificados automáticos', desc: 'Emissão e verificação de certificados incluída em qualquer produto do tipo curso.' },
  { icon: 'wallet', title: 'Carteira e levantamentos', desc: 'Acompanhe as suas vendas e peça levantamentos para IBAN ou MB WAY quando quiser.' },
  { icon: 'infinity', title: 'Produtos ilimitados', desc: 'Publique quantos cursos, e-books, planilhas ou templates quiser.' },
  { icon: 'life-buoy', title: 'Suporte quando precisar', desc: 'A nossa equipa está disponível para ajudar a resolver qualquer questão.' },
];

const EXAMPLE_PRICES = [9.9, 29.9, 99.9];

const FAQS = [
  { q: 'Há alguma mensalidade ou taxa de adesão?', a: 'Não. Criar conta, publicar produtos e explorar o catálogo é sempre gratuito. A EduWeb só fica com uma pequena comissão quando um produto é efetivamente vendido.' },
  { q: 'Como e quando recebo o meu dinheiro?', a: 'Cada venda paga é creditada na sua carteira EduWeb, já com a comissão descontada. Pode pedir um levantamento para IBAN ou MB WAY a qualquer momento, a partir de 10,00 €.' },
  { q: 'A Stripe cobra taxas adicionais?', a: 'Os pagamentos são processados pela Stripe, que pode aplicar encargos de processamento de cartão próprios (habituais no setor). Esses encargos são cobrados pela Stripe e são independentes da comissão da EduWeb.' },
  { q: 'Posso vender produtos gratuitos?', a: 'Sim. Pode definir o preço de qualquer produto como 0 € para o oferecer gratuitamente — não é cobrada qualquer comissão sobre acessos gratuitos.' },
  { q: 'Existe um limite de produtos que posso publicar?', a: 'Não. Pode publicar cursos, e-books, planilhas, templates e packs sem limite, todos incluídos na mesma comissão por venda.' },
  { q: 'Posso mudar a comissão que pago?', a: 'A comissão é definida de forma transparente pela EduWeb e aplica-se por igual a todos os produtores. Qualquer alteração é sempre refletida nesta página.' },
];

export function Pricing() {
  const { data: settings } = useSettings();
  const commission = settings ? Number(settings.commission_percent) : null;

  return (
    <>
      <header className="pb-12 pt-16 text-center">
        <div className="mx-auto max-w-[1180px] px-6">
          <span className="mb-3 inline-flex rounded-full bg-primary-light px-3.5 py-1.5 text-[0.8rem] font-semibold text-primary">Preços</span>
          <h1>Preços simples. Sem surpresas.</h1>
          <p className="mx-auto max-w-[560px] text-[1.05rem] text-text-muted">
            Criar conta, publicar produtos e vender na EduWeb é sempre gratuito. Só paga quando vender — sem mensalidades, sem taxas de configuração.
          </p>
        </div>
      </header>

      <section className="pb-16">
        <div className="mx-auto max-w-[1180px] px-6">
          <Card className="mx-auto max-w-[560px] p-12 text-center">
            <div className="font-heading text-[clamp(3rem,10vw,5rem)] font-bold leading-none text-text">
              {commission !== null ? `${commission}%` : '—'}
            </div>
            <p className="mt-2 mb-0 text-base">por cada venda concluída. O restante é seu.</p>
          </Card>
          <div className="mt-6 flex flex-wrap justify-center gap-9">
            <span className="text-[0.82rem] text-text-muted">Sem mensalidades</span>
            <span className="text-[0.82rem] text-text-muted">Sem taxas de configuração</span>
            <span className="text-[0.82rem] text-text-muted">Sem limite de produtos</span>
          </div>
        </div>
      </section>

      <section className="bg-bg-alt py-16">
        <div className="mx-auto max-w-[1180px] px-6">
          <div className="mx-auto mb-10 max-w-[640px] text-center">
            <span className="mb-3 inline-flex rounded-full bg-primary-light px-3.5 py-1.5 text-[0.8rem] font-semibold text-primary">Tudo incluído</span>
            <h2>Uma só taxa. Nada escondido.</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PRICING_FEATURES.map((f) => (
              <Card key={f.title} className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-light text-text">
                  <Icon name={f.icon} size={18} />
                </div>
                <div>
                  <h3 className="mb-1 text-base">{f.title}</h3>
                  <p className="mb-0 text-[0.9rem]">{f.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-[1180px] px-6">
          <div className="mx-auto mb-10 max-w-[640px] text-center">
            <span className="mb-3 inline-flex rounded-full bg-primary-light px-3.5 py-1.5 text-[0.8rem] font-semibold text-primary">Exemplos</span>
            <h2>Quanto é que vai receber?</h2>
            <p>Alguns exemplos de quanto fica na sua carteira depois da comissão da EduWeb.</p>
          </div>
          <div className="mx-auto max-w-[640px] overflow-x-auto rounded-md border border-border bg-white">
            <table className="w-full border-collapse text-[0.9rem]">
              <thead>
                <tr>
                  <th className="border-b border-border px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Preço de venda</th>
                  <th className="border-b border-border px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Comissão EduWeb</th>
                  <th className="border-b border-border px-3.5 py-3 text-left text-[0.8rem] font-semibold uppercase tracking-wide text-text-muted">Você recebe</th>
                </tr>
              </thead>
              <tbody>
                {commission === null
                  ? <tr><td className="px-3.5 py-3" colSpan={3}>A carregar...</td></tr>
                  : EXAMPLE_PRICES.map((price) => {
                      const priceCents = Math.round(price * 100);
                      const commissionCents = Math.round((priceCents * commission) / 100);
                      const netCents = priceCents - commissionCents;
                      return (
                        <tr key={price}>
                          <td className="border-b border-border px-3.5 py-3 last:border-0">{formatPrice(priceCents)}</td>
                          <td className="border-b border-border px-3.5 py-3 last:border-0">{formatPrice(commissionCents)}</td>
                          <td className="border-b border-border px-3.5 py-3 font-semibold last:border-0">{formatPrice(netCents)}</td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
          <p className="mx-auto mt-6 max-w-[640px] rounded-sm border border-border bg-bg-alt px-5 py-4 text-[0.85rem] text-text-muted">
            Os pagamentos são processados de forma segura pela Stripe. Podem aplicar-se encargos de processamento de pagamento adicionais, cobrados diretamente pela Stripe e independentes da comissão da EduWeb.
          </p>
        </div>
      </section>

      <section className="bg-bg-alt py-16">
        <div className="mx-auto max-w-[1180px] px-6">
          <div className="mx-auto mb-10 max-w-[640px] text-center">
            <span className="mb-3 inline-flex rounded-full bg-primary-light px-3.5 py-1.5 text-[0.8rem] font-semibold text-primary">Perguntas frequentes</span>
            <h2>Ainda tem dúvidas?</h2>
          </div>
          <div className="mx-auto max-w-[760px]">
            {FAQS.map((faq, i) => (
              <details key={faq.q} className="border-b border-border py-4.5" open={i === 0}>
                <summary className="cursor-pointer font-heading text-base font-semibold text-text">{faq.q}</summary>
                <p className="mt-3 mb-0">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 text-center">
        <div className="mx-auto max-w-[640px] px-6">
          <h2>Pronto para começar a vender?</h2>
          <p>Crie a sua conta grátis e publique o seu primeiro produto em minutos.</p>
          <Link to="/registar" className="inline-flex items-center gap-2 rounded-sm bg-primary px-[22px] py-3 font-heading font-semibold text-white shadow-sm hover:bg-primary-dark">
            Criar conta grátis
          </Link>
        </div>
      </section>
    </>
  );
}
