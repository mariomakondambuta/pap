const user = Api.getUser();

/* ---------- Tabs ---------- */
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});

/* ---------- Modais ---------- */
function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }
document.querySelectorAll('[data-close]').forEach((btn) => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});
document.querySelectorAll('.modal-overlay').forEach((overlay) => {
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay.id); });
});

/* ---------- Dashboard ---------- */
async function loadStats() {
  const cardsEl = document.getElementById('stats-cards');
  const tbody = document.getElementById('recent-sales-body');
  try {
    const stats = await Api.request('/admin/stats');
    cardsEl.innerHTML = `
      <div class="card"><div class="stat-value">${stats.totalUsers}</div><div class="stat-label">Utilizadores</div></div>
      <div class="card"><div class="stat-value">${stats.totalProducts}</div><div class="stat-label">Produtos (${stats.publishedProducts} publicados, ${stats.totalSellers} produtores)</div></div>
      <div class="card"><div class="stat-value">${formatPrice(stats.totalRevenueCents)}</div><div class="stat-label">Receita total (${stats.totalSales} vendas)</div></div>
      <div class="card"><div class="stat-value">${formatPrice(stats.totalCommissionCents)}</div><div class="stat-label">Comissão da plataforma</div></div>
    `;
    if (stats.pendingWithdrawals > 0) {
      cardsEl.insertAdjacentHTML('afterend', `
        <div class="alert alert-error show" style="margin-top:20px; display:flex; align-items:center; gap:8px;" id="pending-withdrawals-alert">
          ${icon('alert-triangle', 18)}
          <span>${stats.pendingWithdrawals} pedido(s) de levantamento pendente(s), no valor de ${formatPrice(stats.pendingWithdrawalsCents)}.
          <a href="#" id="goto-withdrawals">Ver levantamentos ${icon('chevron-right', 14)}</a></span>
        </div>`);
      document.getElementById('goto-withdrawals').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.tab-btn[data-tab="levantamentos"]').click();
      });
    }

    tbody.innerHTML = stats.recentSales.length
      ? stats.recentSales.map((s) => `
          <tr>
            <td>${escapeHtml(s.buyer_name)}</td>
            <td>${escapeHtml(s.seller_name)}</td>
            <td>${escapeHtml(s.product_title)}</td>
            <td>${formatPrice(s.amount_cents, s.currency)}</td>
            <td>${new Date(s.paid_at).toLocaleDateString('pt-PT')}</td>
          </tr>`).join('')
      : '<tr><td colspan="5">Ainda não há vendas.</td></tr>';
  } catch (err) {
    cardsEl.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">${escapeHtml(err.message)}</div>`;
  }
}

/* ---------- Produtos ---------- */
let productsCache = [];

async function loadProducts() {
  const tbody = document.getElementById('products-body');
  try {
    const { products } = await Api.request('/products/admin/all');
    productsCache = products;
    tbody.innerHTML = products.length
      ? products.map((p) => `
          <tr>
            <td>${escapeHtml(p.title)}</td>
            <td>${escapeHtml(p.seller_name)}</td>
            <td>${FORMAT_LABELS[p.format] || p.format}</td>
            <td>${p.is_free ? 'Grátis' : formatPrice(p.price_cents, p.currency)}</td>
            <td>${p.student_count}</td>
            <td>${p.published ? '<span class="badge badge-success">Publicado</span>' : '<span class="badge badge-warning">Rascunho</span>'}</td>
            <td>
              <div class="flex gap-sm">
                <button class="btn btn-outline btn-sm" data-action="toggle" data-id="${p.id}">${p.published ? 'Despublicar' : 'Publicar'}</button>
                <button class="btn btn-danger btn-sm" data-action="delete" data-id="${p.id}">Eliminar</button>
              </div>
            </td>
          </tr>`).join('')
      : '<tr><td colspan="7">Ainda não existem produtos na plataforma.</td></tr>';

    tbody.querySelectorAll('button[data-action]').forEach((btn) => {
      const product = productsCache.find((p) => p.id === Number(btn.dataset.id));
      if (btn.dataset.action === 'toggle') btn.addEventListener('click', () => togglePublish(product));
      if (btn.dataset.action === 'delete') btn.addEventListener('click', () => deleteProduct(product));
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7">${escapeHtml(err.message)}</td></tr>`;
  }
}

async function togglePublish(product) {
  try {
    await Api.request(`/products/${product.id}`, { method: 'PUT', body: { published: !product.published } });
    await loadProducts();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteProduct(product) {
  if (!confirm(`Eliminar o produto "${product.title}"? Esta ação não pode ser revertida.`)) return;
  try {
    await Api.request(`/products/${product.id}`, { method: 'DELETE' });
    await loadProducts();
  } catch (err) {
    alert(err.message);
  }
}

/* ---------- Transações ---------- */
const ORDER_STATUS_LABEL = { paid: 'Pago', pending: 'Pendente', failed: 'Falhou', refunded: 'Reembolsado', canceled: 'Cancelado' };

async function loadOrders() {
  const tbody = document.getElementById('orders-body');
  try {
    const { orders } = await Api.request('/admin/orders');
    tbody.innerHTML = orders.length
      ? orders.map((o) => `
          <tr>
            <td>#${o.id}</td>
            <td>${escapeHtml(o.buyer_name)}</td>
            <td>${escapeHtml(o.seller_name)}</td>
            <td>${escapeHtml(o.product_title)}</td>
            <td>${formatPrice(o.amount_cents, o.currency)}</td>
            <td>${formatPrice(o.platform_fee_cents, o.currency)}</td>
            <td><span class="badge ${o.status === 'paid' ? 'badge-success' : 'badge-neutral'}">${ORDER_STATUS_LABEL[o.status] || o.status}</span></td>
            <td>${new Date(o.created_at).toLocaleDateString('pt-PT')}</td>
          </tr>`).join('')
      : '<tr><td colspan="8">Ainda não há transações.</td></tr>';
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8">${escapeHtml(err.message)}</td></tr>`;
  }
}

/* ---------- Levantamentos ---------- */
const WITHDRAWAL_STATUS_LABEL = { pending: 'Pendente', approved: 'Aprovado', paid: 'Pago', rejected: 'Rejeitado' };
let withdrawalsCache = [];
let activeWithdrawalId = null;

async function loadWithdrawals() {
  const tbody = document.getElementById('withdrawals-body');
  try {
    const { withdrawals } = await Api.request('/admin/withdrawals');
    withdrawalsCache = withdrawals;
    tbody.innerHTML = withdrawals.length
      ? withdrawals.map((w) => `
          <tr>
            <td>${escapeHtml(w.user_name)}</td>
            <td>${formatPrice(w.amount_cents)}</td>
            <td>${w.method ? `${w.method === 'iban' ? 'IBAN' : 'MB WAY'} — ${escapeHtml(w.iban || w.phone || '')}` : '—'}</td>
            <td><span class="badge ${w.status === 'paid' ? 'badge-success' : w.status === 'rejected' ? 'badge-danger' : 'badge-neutral'}">${WITHDRAWAL_STATUS_LABEL[w.status] || w.status}</span></td>
            <td>${new Date(w.requested_at).toLocaleDateString('pt-PT')}</td>
            <td>${w.status === 'pending' ? `<button class="btn btn-outline btn-sm" data-process="${w.id}">Processar</button>` : '—'}</td>
          </tr>`).join('')
      : '<tr><td colspan="6">Ainda não há pedidos de levantamento.</td></tr>';

    tbody.querySelectorAll('button[data-process]').forEach((btn) => {
      btn.addEventListener('click', () => openWithdrawalModal(btn.dataset.process));
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6">${escapeHtml(err.message)}</td></tr>`;
  }
}

function openWithdrawalModal(id) {
  const withdrawal = withdrawalsCache.find((w) => w.id === Number(id));
  if (!withdrawal) return;
  activeWithdrawalId = withdrawal.id;
  document.getElementById('withdrawal-details').innerHTML = `
    <p style="margin-bottom:6px;"><strong>Produtor:</strong> ${escapeHtml(withdrawal.user_name)} (${escapeHtml(withdrawal.user_email)})</p>
    <p style="margin-bottom:6px;"><strong>Valor:</strong> ${formatPrice(withdrawal.amount_cents)}</p>
    <p style="margin-bottom:0;"><strong>Conta:</strong> ${withdrawal.method === 'iban' ? 'IBAN' : 'MB WAY'} — ${escapeHtml(withdrawal.iban || withdrawal.phone || '')} (${escapeHtml(withdrawal.holder_name || '')})</p>
  `;
  document.getElementById('withdrawal-note').value = '';
  openModal('withdrawal-modal');
}

async function processWithdrawal(status) {
  try {
    await Api.request(`/admin/withdrawals/${activeWithdrawalId}`, {
      method: 'PUT',
      body: { status, admin_note: document.getElementById('withdrawal-note').value.trim() },
    });
    closeModal('withdrawal-modal');
    await loadWithdrawals();
  } catch (err) {
    alert(err.message);
  }
}
document.getElementById('btn-mark-paid').addEventListener('click', () => processWithdrawal('paid'));
document.getElementById('btn-reject').addEventListener('click', () => processWithdrawal('rejected'));

/* ---------- Utilizadores ---------- */
async function loadUsers() {
  const tbody = document.getElementById('users-body');
  try {
    const { users } = await Api.request('/admin/users');
    tbody.innerHTML = users.map((u) => `
      <tr>
        <td>${escapeHtml(u.name)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td><span class="badge ${u.role === 'admin' ? 'badge-success' : 'badge-neutral'}">${u.role === 'admin' ? 'Administrador' : 'Utilizador'}</span></td>
        <td>${new Date(u.created_at).toLocaleDateString('pt-PT')}</td>
        <td>
          <div class="flex gap-sm">
            ${u.id === user.id ? '' : `
              <button class="btn btn-outline btn-sm" data-toggle-role="${u.id}" data-role="${u.role}">
                ${u.role === 'admin' ? 'Tornar utilizador' : 'Tornar admin'}
              </button>
              <button class="btn btn-danger btn-sm" data-delete-user="${u.id}">Eliminar</button>
            `}
          </div>
        </td>
      </tr>`).join('');

    tbody.querySelectorAll('button[data-toggle-role]').forEach((btn) => {
      btn.addEventListener('click', () => toggleUserRole(btn.dataset.toggleRole, btn.dataset.role));
    });
    tbody.querySelectorAll('button[data-delete-user]').forEach((btn) => {
      btn.addEventListener('click', () => deleteUser(btn.dataset.deleteUser));
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5">${escapeHtml(err.message)}</td></tr>`;
  }
}

async function toggleUserRole(id, currentRole) {
  const newRole = currentRole === 'admin' ? 'user' : 'admin';
  try {
    await Api.request(`/admin/users/${id}/role`, { method: 'PUT', body: { role: newRole } });
    await loadUsers();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteUser(id) {
  if (!confirm('Eliminar este utilizador? Esta ação não pode ser revertida.')) return;
  try {
    await Api.request(`/admin/users/${id}`, { method: 'DELETE' });
    await loadUsers();
  } catch (err) {
    alert(err.message);
  }
}

/* ---------- Definições ---------- */
async function loadSettings() {
  try {
    const settings = await Api.request('/settings');
    document.getElementById('settings-name').value = settings.platform_name;
    document.getElementById('settings-commission').value = settings.commission_percent;
    const badge = document.getElementById('stripe-status-badge');
    badge.innerHTML = settings.stripe_enabled
      ? `${icon('check-circle', 14)} Stripe ativa (pagamentos reais)`
      : `${icon('flask', 14)} Modo de demonstração (sem chaves Stripe)`;
    badge.className = settings.stripe_enabled ? 'badge badge-success' : 'badge badge-warning';
  } catch (err) {
    console.error(err);
  }
}

document.getElementById('settings-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await Api.request('/admin/settings', {
      method: 'PUT',
      body: {
        platform_name: document.getElementById('settings-name').value.trim(),
        commission_percent: document.getElementById('settings-commission').value,
      },
    });
    const successEl = document.getElementById('settings-success');
    successEl.classList.add('show');
    setTimeout(() => successEl.classList.remove('show'), 3000);
  } catch (err) {
    alert(err.message);
  }
});

loadStats();
loadProducts();
loadOrders();
loadWithdrawals();
loadUsers();
loadSettings();
