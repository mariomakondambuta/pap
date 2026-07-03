const user = Api.getUser();
document.getElementById('welcome-title').textContent = `Olá, ${user?.name?.split(' ')[0] || ''}`;

/* ---------- Tabs ---------- */
function activateTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('active', b.dataset.tab === tabName));
  document.querySelectorAll('.tab-panel').forEach((p) => p.classList.toggle('active', p.id === `tab-${tabName}`));
}
document.querySelectorAll('.tab-btn[data-tab]').forEach((btn) => {
  btn.addEventListener('click', () => activateTab(btn.dataset.tab));
});

/* ---------- Alternador Comprar / Vender ---------- */
const MODE_KEY = 'eduweb_panel_mode';
const MODE_SUBTITLE = {
  comprar: 'A sua biblioteca e os seus certificados.',
  vender: 'Os seus produtos à venda e a sua carteira.',
};
const MODE_FIRST_TAB = { comprar: 'biblioteca', vender: 'produtos' };

function setMode(mode, tab) {
  document.querySelectorAll('.mode-switch-btn').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
  document.querySelectorAll('.app-nav-item[data-mode]').forEach((item) => {
    item.hidden = item.dataset.mode !== mode;
  });
  document.getElementById('mode-subtitle').textContent = MODE_SUBTITLE[mode];
  activateTab(tab || MODE_FIRST_TAB[mode]);
  localStorage.setItem(MODE_KEY, mode);
}

document.querySelectorAll('.mode-switch-btn').forEach((btn) => {
  btn.addEventListener('click', () => setMode(btn.dataset.mode));
});

const params = new URLSearchParams(window.location.search);
const initialMode = params.get('mode') || localStorage.getItem(MODE_KEY) || 'comprar';
setMode(initialMode, params.get('tab'));

/* ---------- Biblioteca ---------- */
function libraryCardHtml(product) {
  const percent = product.progress_percent;
  const isComplete = percent === 100;
  return `
    <div class="card course-card">
      <div class="course-card-thumb">${escapeHtml(product.title)}</div>
      <div class="course-card-body">
        <span class="format-badge">${formatBadgeHtml(product.format)}</span>
        <h3 style="margin-bottom:4px;">${escapeHtml(product.title)}</h3>
        <div class="flex-between" style="font-size:0.8rem;">
          <span class="muted">${product.completed_lessons}/${product.total_lessons} concluídos</span>
          <strong>${percent}%</strong>
        </div>
        <div class="progress-bar"><div class="progress-bar-fill" style="width:${percent}%;"></div></div>
      </div>
      <div class="course-card-footer">
        ${isComplete
          ? `<a href="/painel.html?mode=comprar&tab=certificados" class="btn btn-accent btn-sm">${icon('award', 16)} Certificado</a>`
          : `<a href="/curso.html?id=${product.id}" class="btn btn-primary btn-sm">Continuar</a>`}
        <a href="/curso.html?id=${product.id}" class="btn btn-ghost btn-sm">Ver produto</a>
      </div>
    </div>
  `;
}

async function loadLibrary() {
  const container = document.getElementById('my-library');
  try {
    const { products } = await Api.request('/enrollments/me');
    if (products.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="icon">${icon('book-open', 32)}</div>
          Ainda não tem produtos na sua biblioteca.
          <div style="margin-top:16px;"><a href="/cursos.html" class="btn btn-primary">Explorar produtos</a></div>
        </div>`;
      return;
    }
    container.innerHTML = products.map(libraryCardHtml).join('');
  } catch (err) {
    container.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">Não foi possível carregar a sua biblioteca.</div>`;
  }
}

/* ---------- Certificados ---------- */
function myCertificateCardHtml(cert) {
  const issuedDate = new Date(cert.issued_at).toLocaleDateString('pt-PT', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  return `
    <div class="card">
      <div style="color:var(--color-accent); margin-bottom:8px;">${icon('award', 32)}</div>
      <h3>${escapeHtml(cert.product_title)}</h3>
      <p style="font-size:0.85rem;">Emitido em ${issuedDate}</p>
      <p class="muted" style="font-size:0.8rem; margin-bottom:16px;">Código: ${cert.certificate_code}</p>
      <button class="btn btn-primary btn-block" data-code="${cert.certificate_code}">Descarregar PDF</button>
    </div>
  `;
}

async function downloadCertificate(code, btn) {
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'A gerar...';
  try {
    const res = await fetch(`/api/certificates/${code}/download`, {
      headers: { Authorization: `Bearer ${Api.getToken()}` },
    });
    if (!res.ok) throw new Error('Não foi possível gerar o certificado.');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificado-${code}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

async function loadMyCertificates() {
  const container = document.getElementById('my-certificates');
  try {
    const { certificates } = await Api.request('/certificates/me');
    if (certificates.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="icon">${icon('award', 32)}</div>
          Ainda não concluiu nenhum produto.
          <div style="margin-top:16px;"><a href="/painel.html?mode=comprar&tab=biblioteca" class="btn btn-primary">Continuar a aprender</a></div>
        </div>`;
      return;
    }
    container.innerHTML = certificates.map(myCertificateCardHtml).join('');
    container.querySelectorAll('button[data-code]').forEach((btn) => {
      btn.addEventListener('click', () => downloadCertificate(btn.dataset.code, btn));
    });
  } catch (err) {
    container.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">Não foi possível carregar os certificados.</div>`;
  }
}

/* ---------- Vender: produtos ---------- */
let myProductsCache = [];

function sellerProductCardHtml(product) {
  return `
    <div class="card seller-product-card">
      <div class="course-card-thumb">${escapeHtml(product.title)}</div>
      <div class="course-card-body">
        <div class="flex-between">
          <span class="format-badge">${formatBadgeHtml(product.format)}</span>
          ${product.published ? '<span class="badge badge-success">Publicado</span>' : '<span class="badge badge-warning">Rascunho</span>'}
        </div>
        <h3 style="margin-bottom:4px;">${escapeHtml(product.title)}</h3>
        <p class="product-id">ID #${product.id}</p>
        <div class="flex-between muted" style="font-size:0.85rem;">
          <span>${product.is_free ? 'Grátis' : formatPrice(product.price_cents, product.currency)}</span>
          <span>${product.lesson_count} conteúdos · ${product.student_count} alunos</span>
        </div>
      </div>
      <div class="course-card-footer">
        <button class="icon-btn" data-action="content" data-id="${product.id}" title="Gerir conteúdos">${icon('paperclip', 16)}</button>
        <button class="icon-btn" data-action="edit" data-id="${product.id}" title="Editar produto">${icon('edit', 16)}</button>
        <button class="icon-btn icon-btn-danger" data-action="delete" data-id="${product.id}" title="Eliminar produto">${icon('trash', 16)}</button>
      </div>
    </div>
  `;
}

function renderMyProducts(products) {
  const container = document.getElementById('my-products-grid');
  container.innerHTML = products.length
    ? products.map(sellerProductCardHtml).join('')
    : `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="icon">${icon('briefcase', 32)}</div>
        Ainda não criou nenhum produto. Comece agora!
        <div style="margin-top:16px;"><a href="/produto-novo.html" class="btn btn-primary">Criar produto</a></div>
      </div>`;

  container.querySelectorAll('button[data-action]').forEach((btn) => {
    const product = myProductsCache.find((p) => p.id === Number(btn.dataset.id));
    if (btn.dataset.action === 'edit') btn.addEventListener('click', () => { window.location.href = `/produto-editar.html?id=${product.id}`; });
    if (btn.dataset.action === 'content') btn.addEventListener('click', () => openContentModal(product, loadMyProducts));
    if (btn.dataset.action === 'delete') btn.addEventListener('click', () => deleteProduct(product));
  });
}

async function loadMyProducts() {
  try {
    const { products } = await Api.request('/products/mine');
    myProductsCache = products;
    renderMyProducts(products);
  } catch (err) {
    document.getElementById('my-products-grid').innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">${escapeHtml(err.message)}</div>`;
  }
}

document.getElementById('products-search').addEventListener('input', (e) => {
  const term = e.target.value.trim().toLowerCase();
  const filtered = term ? myProductsCache.filter((p) => p.title.toLowerCase().includes(term)) : myProductsCache;
  renderMyProducts(filtered);
});

async function deleteProduct(product) {
  if (!confirm(`Eliminar o produto "${product.title}"? Esta ação não pode ser revertida.`)) return;
  try {
    await Api.request(`/products/${product.id}`, { method: 'DELETE' });
    await loadMyProducts();
  } catch (err) {
    alert(err.message);
  }
}

/* ---------- Vender: vendas ---------- */
async function loadMySales() {
  const tbody = document.getElementById('my-sales-body');
  try {
    const { orders } = await Api.request('/orders/sales/me');
    const STATUS_LABEL = { paid: 'Pago', pending: 'Pendente', failed: 'Falhou', refunded: 'Reembolsado', canceled: 'Cancelado' };
    tbody.innerHTML = orders.length
      ? orders.map((o) => `
          <tr>
            <td>${escapeHtml(o.buyer_name)}</td>
            <td>${escapeHtml(o.product_title)}</td>
            <td>${formatPrice(o.amount_cents, o.currency)}</td>
            <td><span class="badge ${o.status === 'paid' ? 'badge-success' : 'badge-neutral'}">${STATUS_LABEL[o.status] || o.status}</span></td>
            <td>${new Date(o.created_at).toLocaleDateString('pt-PT')}</td>
          </tr>`).join('')
      : '<tr><td colspan="5">Ainda não tem vendas.</td></tr>';
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5">${escapeHtml(err.message)}</td></tr>`;
  }
}

/* ---------- Carteira ---------- */
async function loadWallet() {
  try {
    const wallet = await Api.request('/wallet/me');
    document.getElementById('wallet-balance').textContent = formatPrice(wallet.balance_cents);
    document.getElementById('wallet-earned').textContent = formatPrice(wallet.total_earned_cents);
    document.getElementById('wallet-pending').textContent = formatPrice(wallet.pending_withdrawals_cents);
    document.getElementById('withdraw-available').textContent = formatPrice(wallet.balance_cents);

    const ledgerEl = document.getElementById('wallet-ledger');
    const LEDGER_LABEL = { sale: 'Venda', withdrawal: 'Levantamento', reversal: 'Estorno' };
    ledgerEl.innerHTML = wallet.ledger.length
      ? wallet.ledger.map((entry) => `
          <div class="ledger-item">
            <div>
              <div>${LEDGER_LABEL[entry.type] || entry.type}</div>
              <div class="muted" style="font-size:0.78rem;">${new Date(entry.created_at).toLocaleDateString('pt-PT')}</div>
            </div>
            <span class="ledger-amount ${entry.amount_cents >= 0 ? 'positive' : 'negative'}">
              ${entry.amount_cents >= 0 ? '+' : ''}${formatPrice(entry.amount_cents)}
            </span>
          </div>`).join('')
      : '<p class="muted" style="padding:16px 0;">Ainda não há movimentos na carteira.</p>';
  } catch (err) {
    document.getElementById('wallet-balance').textContent = '—';
  }
}

let payoutAccountsCache = [];

async function loadPayoutAccounts() {
  const listEl = document.getElementById('payout-accounts-list');
  try {
    const { accounts } = await Api.request('/wallet/payout-accounts');
    payoutAccountsCache = accounts;
    listEl.innerHTML = accounts.length
      ? accounts.map((a) => `
          <div class="payout-account-card">
            <div>
              <div style="font-weight:600;">${a.method === 'iban' ? 'IBAN' : 'MB WAY'} ${a.is_default ? '<span class="badge badge-success">Principal</span>' : ''}</div>
              <div class="muted" style="font-size:0.85rem;">${escapeHtml(a.holder_name || '')} · ${escapeHtml(a.iban || a.phone || '')}</div>
            </div>
            <button class="btn btn-danger btn-sm" data-delete-account="${a.id}">Remover</button>
          </div>`).join('')
      : '<p class="muted">Ainda não adicionou nenhuma conta de pagamento.</p>';

    listEl.querySelectorAll('button[data-delete-account]').forEach((btn) => {
      btn.addEventListener('click', () => deletePayoutAccount(btn.dataset.deleteAccount));
    });

    const select = document.getElementById('withdraw-account');
    select.innerHTML = accounts
      .map((a) => `<option value="${a.id}">${a.method === 'iban' ? 'IBAN' : 'MB WAY'} — ${escapeHtml(a.iban || a.phone || '')}</option>`)
      .join('') || '<option value="">Adicione uma conta primeiro</option>';
  } catch (err) {
    listEl.innerHTML = `<p class="muted">${escapeHtml(err.message)}</p>`;
  }
}

async function deletePayoutAccount(id) {
  if (!confirm('Remover esta conta de pagamento?')) return;
  try {
    await Api.request(`/wallet/payout-accounts/${id}`, { method: 'DELETE' });
    await loadPayoutAccounts();
  } catch (err) {
    alert(err.message);
  }
}

document.getElementById('btn-new-payout-account').addEventListener('click', () => {
  document.getElementById('payout-form').reset();
  document.getElementById('payout-form-error').classList.remove('show');
  openModal('payout-modal');
});

document.getElementById('payout-method').addEventListener('change', (e) => {
  const isIban = e.target.value === 'iban';
  document.getElementById('payout-iban-group').classList.toggle('hidden', !isIban);
  document.getElementById('payout-phone-group').classList.toggle('hidden', isIban);
});

document.getElementById('payout-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('payout-form-error');
  errorEl.classList.remove('show');
  try {
    await Api.request('/wallet/payout-accounts', {
      method: 'POST',
      body: {
        method: document.getElementById('payout-method').value,
        holder_name: document.getElementById('payout-holder').value.trim(),
        iban: document.getElementById('payout-iban').value.trim(),
        phone: document.getElementById('payout-phone').value.trim(),
      },
    });
    closeModal('payout-modal');
    await loadPayoutAccounts();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.add('show');
  }
});

document.getElementById('btn-withdraw').addEventListener('click', () => {
  if (payoutAccountsCache.length === 0) {
    alert('Adicione primeiro uma conta de pagamento.');
    return;
  }
  document.getElementById('withdraw-form').reset();
  document.getElementById('withdraw-form-error').classList.remove('show');
  openModal('withdraw-modal');
});

document.getElementById('withdraw-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('withdraw-form-error');
  errorEl.classList.remove('show');
  try {
    const amountCents = Math.round(Number(document.getElementById('withdraw-amount').value) * 100);
    await Api.request('/wallet/withdrawals', {
      method: 'POST',
      body: {
        amount_cents: amountCents,
        payout_account_id: Number(document.getElementById('withdraw-account').value),
      },
    });
    closeModal('withdraw-modal');
    await loadWallet();
    await loadWithdrawals();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.add('show');
  }
});

async function loadWithdrawals() {
  const tbody = document.getElementById('withdrawals-body');
  const STATUS_LABEL = { pending: 'Pendente', approved: 'Aprovado', paid: 'Pago', rejected: 'Rejeitado' };
  try {
    const { withdrawals } = await Api.request('/wallet/withdrawals/me');
    tbody.innerHTML = withdrawals.length
      ? withdrawals.map((w) => `
          <tr>
            <td>${formatPrice(w.amount_cents)}</td>
            <td><span class="badge ${w.status === 'paid' ? 'badge-success' : w.status === 'rejected' ? 'badge-danger' : 'badge-neutral'}">${STATUS_LABEL[w.status] || w.status}</span></td>
            <td>${new Date(w.requested_at).toLocaleDateString('pt-PT')}</td>
          </tr>`).join('')
      : '<tr><td colspan="3">Ainda não pediu nenhum levantamento.</td></tr>';
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="3">${escapeHtml(err.message)}</td></tr>`;
  }
}

loadLibrary();
loadMyCertificates();
loadMyProducts();
loadMySales();
loadWallet();
loadPayoutAccounts();
loadWithdrawals();
