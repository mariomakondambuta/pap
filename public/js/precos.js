const PRICING_FEATURES = [
  { icon: 'zap', title: 'Grátis para começar', desc: 'Criar conta e publicar produtos não custa nada, hoje e sempre.' },
  { icon: 'lock', title: 'Checkout seguro', desc: 'Pagamentos processados pela Stripe, sem dados de cartão a passar pelos nossos servidores.' },
  { icon: 'award', title: 'Certificados automáticos', desc: 'Emissão e verificação de certificados incluída em qualquer produto do tipo curso.' },
  { icon: 'wallet', title: 'Carteira e levantamentos', desc: 'Acompanhe as suas vendas e peça levantamentos para IBAN ou MB WAY quando quiser.' },
  { icon: 'infinity', title: 'Produtos ilimitados', desc: 'Publique quantos cursos, e-books, planilhas ou templates quiser.' },
  { icon: 'life-buoy', title: 'Suporte quando precisar', desc: 'A nossa equipa está disponível para ajudar a resolver qualquer questão.' },
];

function renderFeatures() {
  const container = document.getElementById('pricing-features');
  container.innerHTML = PRICING_FEATURES.map((f) => `
    <div class="card pricing-feature">
      <div class="pricing-feature-icon">${icon(f.icon, 18)}</div>
      <div>
        <h3>${f.title}</h3>
        <p>${f.desc}</p>
      </div>
    </div>
  `).join('');
}

const EXAMPLE_PRICES = [9.9, 29.9, 99.9];

async function loadPricing() {
  renderFeatures();
  try {
    const settings = await Api.request('/settings');
    const commission = Number(settings.commission_percent);

    document.querySelectorAll('[data-commission]').forEach((el) => {
      el.textContent = `${commission}%`;
    });

    const tbody = document.getElementById('pricing-examples-body');
    tbody.innerHTML = EXAMPLE_PRICES.map((price) => {
      const priceCents = Math.round(price * 100);
      const commissionCents = Math.round((priceCents * commission) / 100);
      const netCents = priceCents - commissionCents;
      return `
        <tr>
          <td>${formatPrice(priceCents)}</td>
          <td>${formatPrice(commissionCents)}</td>
          <td><strong>${formatPrice(netCents)}</strong></td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    document.querySelectorAll('[data-commission]').forEach((el) => { el.textContent = '—'; });
    document.getElementById('pricing-examples-body').innerHTML =
      '<tr><td colspan="3">Não foi possível carregar os exemplos.</td></tr>';
  }
}

loadPricing();
