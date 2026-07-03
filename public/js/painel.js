const user = Api.getUser();
document.getElementById('welcome-title').textContent = `Olá, ${user?.name?.split(' ')[0] || ''}`;

/* ---------- Tabs ---------- */
function activateTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('active', b.dataset.tab === tabName));
  document.querySelectorAll('.tab-panel').forEach((p) => p.classList.toggle('active', p.id === `tab-${tabName}`));
}
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => activateTab(btn.dataset.tab));
});
const initialTab = new URLSearchParams(window.location.search).get('tab');
if (initialTab) activateTab(initialTab);

/* ---------- Modais ---------- */
function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }
document.querySelectorAll('[data-close]').forEach((btn) => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});
document.querySelectorAll('.modal-overlay').forEach((overlay) => {
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay.id); });
});

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
          ? `<a href="/certificados.html" class="btn btn-accent btn-sm">${icon('award', 16)} Certificado</a>`
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

/* ---------- Vender: produtos ---------- */
let myProductsCache = [];

async function loadMyProducts() {
  const tbody = document.getElementById('my-products-body');
  try {
    const { products } = await Api.request('/products/mine');
    myProductsCache = products;
    tbody.innerHTML = products.length
      ? products.map((p) => `
          <tr>
            <td>${escapeHtml(p.title)}</td>
            <td>${FORMAT_LABELS[p.format] || p.format}</td>
            <td>${p.is_free ? 'Grátis' : formatPrice(p.price_cents, p.currency)}</td>
            <td>${p.lesson_count}</td>
            <td>${p.student_count}</td>
            <td>${p.published ? '<span class="badge badge-success">Publicado</span>' : '<span class="badge badge-warning">Rascunho</span>'}</td>
            <td>
              <div class="flex gap-sm">
                <button class="btn btn-outline btn-sm" data-action="content" data-id="${p.id}">Conteúdos</button>
                <button class="btn btn-outline btn-sm" data-action="edit" data-id="${p.id}">Editar</button>
                <button class="btn btn-danger btn-sm" data-action="delete" data-id="${p.id}">Eliminar</button>
              </div>
            </td>
          </tr>`).join('')
      : '<tr><td colspan="7">Ainda não criou nenhum produto. Comece agora!</td></tr>';

    tbody.querySelectorAll('button[data-action]').forEach((btn) => {
      const product = myProductsCache.find((p) => p.id === Number(btn.dataset.id));
      if (btn.dataset.action === 'edit') btn.addEventListener('click', () => openProductModal(product));
      if (btn.dataset.action === 'content') btn.addEventListener('click', () => openContentModal(product));
      if (btn.dataset.action === 'delete') btn.addEventListener('click', () => deleteProduct(product));
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7">${escapeHtml(err.message)}</td></tr>`;
  }
}

function openProductModal(product = null) {
  const errorEl = document.getElementById('product-form-error');
  errorEl.classList.remove('show');
  document.getElementById('product-modal-title').textContent = product ? 'Editar produto' : 'Novo produto';
  document.getElementById('product-id').value = product?.id || '';
  document.getElementById('product-title').value = product?.title || '';
  document.getElementById('product-description').value = product?.description || '';
  document.getElementById('product-format').value = product?.format || 'curso';
  document.getElementById('product-category').value = product?.category || '';
  document.getElementById('product-price').value = product ? (product.price_cents / 100).toFixed(2) : '0';
  document.getElementById('product-thumbnail').value = product?.thumbnail_url || '';
  document.getElementById('product-published').checked = Boolean(product?.published);
  openModal('product-modal');
}
document.getElementById('btn-new-product').addEventListener('click', () => openProductModal());

document.getElementById('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('product-form-error');
  errorEl.classList.remove('show');

  const id = document.getElementById('product-id').value;
  const payload = {
    title: document.getElementById('product-title').value.trim(),
    description: document.getElementById('product-description').value.trim(),
    format: document.getElementById('product-format').value,
    category: document.getElementById('product-category').value.trim(),
    price: document.getElementById('product-price').value,
    thumbnail_url: document.getElementById('product-thumbnail').value.trim(),
    published: document.getElementById('product-published').checked,
  };

  try {
    if (id) {
      await Api.request(`/products/${id}`, { method: 'PUT', body: payload });
    } else {
      await Api.request('/products', { method: 'POST', body: payload });
    }
    closeModal('product-modal');
    await loadMyProducts();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.add('show');
  }
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

/* ---------- Vender: conteúdos do produto ---------- */
let currentProductId = null;
const TYPE_ICON = { video: 'video', pdf: 'file-text', file: 'paperclip' };

async function openContentModal(product) {
  currentProductId = product.id;
  document.getElementById('content-modal-title').textContent = `Conteúdos — ${product.title}`;
  document.getElementById('content-product-id').value = product.id;
  resetContentForm();
  await loadContents();
  openModal('content-modal');
}

async function loadContents() {
  const listEl = document.getElementById('content-list');
  listEl.innerHTML = '<div class="spinner"></div>';
  try {
    const { lessons } = await Api.request(`/products/${currentProductId}`);
    listEl.innerHTML = lessons.length
      ? lessons.map((l) => `
          <li class="lesson-item">
            <span class="lesson-icon">${icon(TYPE_ICON[l.type] || 'file-text', 18)}</span>
            <div style="flex:1;">
              <div style="font-weight:600;">${escapeHtml(l.title)}</div>
              <div class="muted" style="font-size:0.8rem;">Ordem ${l.order_index}${l.duration_minutes ? ` · ${l.duration_minutes} min` : ''}</div>
            </div>
            <div class="flex gap-sm">
              <button class="btn btn-outline btn-sm" data-edit="${l.id}">Editar</button>
              <button class="btn btn-danger btn-sm" data-delete="${l.id}">Eliminar</button>
            </div>
          </li>`).join('')
      : '<li class="muted">Ainda não há conteúdos neste produto.</li>';

    listEl.querySelectorAll('button[data-edit]').forEach((btn) => {
      btn.addEventListener('click', () => editContent(btn.dataset.edit));
    });
    listEl.querySelectorAll('button[data-delete]').forEach((btn) => {
      btn.addEventListener('click', () => deleteContent(btn.dataset.delete));
    });
  } catch (err) {
    listEl.innerHTML = `<li>${escapeHtml(err.message)}</li>`;
  }
}

function resetContentForm() {
  document.getElementById('content-form-title').textContent = 'Adicionar conteúdo';
  document.getElementById('content-id').value = '';
  document.getElementById('content-title').value = '';
  document.getElementById('content-description').value = '';
  document.getElementById('content-type').value = 'video';
  document.getElementById('content-order').value = 0;
  document.getElementById('content-duration').value = 0;
  document.getElementById('content-url').value = '';
  document.getElementById('content-file').value = '';
  document.getElementById('content-form-error').classList.remove('show');
}
document.getElementById('content-form-reset').addEventListener('click', resetContentForm);

async function editContent(lessonId) {
  try {
    const { lesson } = await Api.request(`/lessons/${lessonId}`);
    document.getElementById('content-form-title').textContent = 'Editar conteúdo';
    document.getElementById('content-id').value = lesson.id;
    document.getElementById('content-title').value = lesson.title;
    document.getElementById('content-description').value = lesson.description || '';
    document.getElementById('content-type').value = lesson.type;
    document.getElementById('content-order').value = lesson.order_index;
    document.getElementById('content-duration').value = lesson.duration_minutes;
    document.getElementById('content-url').value = lesson.content_url.startsWith('/uploads/') ? '' : lesson.content_url;
    document.getElementById('content-file').value = '';
  } catch (err) {
    alert(err.message);
  }
}

async function deleteContent(lessonId) {
  if (!confirm('Eliminar este conteúdo?')) return;
  try {
    await Api.request(`/lessons/${lessonId}`, { method: 'DELETE' });
    await loadContents();
    await loadMyProducts();
  } catch (err) {
    alert(err.message);
  }
}

document.getElementById('content-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('content-form-error');
  errorEl.classList.remove('show');

  const contentId = document.getElementById('content-id').value;
  const file = document.getElementById('content-file').files[0];
  const url = document.getElementById('content-url').value.trim();

  if (!file && !url) {
    errorEl.textContent = 'Indique um link para o conteúdo ou envie um ficheiro.';
    errorEl.classList.add('show');
    return;
  }

  const formData = new FormData();
  formData.append('title', document.getElementById('content-title').value.trim());
  formData.append('description', document.getElementById('content-description').value.trim());
  formData.append('type', document.getElementById('content-type').value);
  formData.append('order_index', document.getElementById('content-order').value);
  formData.append('duration_minutes', document.getElementById('content-duration').value);
  if (url) formData.append('content_url', url);
  if (file) formData.append('file', file);

  try {
    if (contentId) {
      await Api.request(`/lessons/${contentId}`, { method: 'PUT', body: formData, isFormData: true });
    } else {
      await Api.request(`/products/${currentProductId}/lessons`, { method: 'POST', body: formData, isFormData: true });
    }
    resetContentForm();
    await loadContents();
    await loadMyProducts();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.add('show');
  }
});

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
loadMyProducts();
loadMySales();
loadWallet();
loadPayoutAccounts();
loadWithdrawals();
