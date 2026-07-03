const params = new URLSearchParams(window.location.search);
const orderId = params.get('order');
const cardEl = document.getElementById('checkout-card');

if (!orderId) {
  window.location.href = '/cursos.html';
}

function summaryHtml(order) {
  return `
    <div class="checkout-summary">
      <div class="checkout-thumb"></div>
      <div>
        <div style="font-weight:600;">${escapeHtml(order.product_title)}</div>
        <div class="muted" style="font-size:0.85rem;">Encomenda #${order.id}</div>
      </div>
    </div>
    <div class="checkout-row"><span>Preço do produto</span><span>${formatPrice(order.amount_cents, order.currency)}</span></div>
    <div class="checkout-row total"><span>Total a pagar</span><span>${formatPrice(order.amount_cents, order.currency)}</span></div>
  `;
}

function showCheckoutError(message) {
  const errorEl = document.getElementById('checkout-error');
  if (!errorEl) return;
  errorEl.textContent = message;
  errorEl.classList.add('show');
}

async function payWithStripe(productId) {
  const btn = document.getElementById('pay-btn');
  btn.disabled = true;
  btn.textContent = 'A ligar à Stripe...';
  try {
    const { checkoutUrl } = await Api.request('/orders/checkout', { method: 'POST', body: { product_id: productId } });
    window.location.href = checkoutUrl;
  } catch (err) {
    showCheckoutError(err.message);
    btn.disabled = false;
    btn.textContent = 'Pagar com cartão';
  }
}

async function payWithSimulation() {
  const btn = document.getElementById('pay-btn');
  btn.disabled = true;
  btn.textContent = 'A confirmar pagamento...';
  try {
    await Api.request(`/orders/${orderId}/simulate-pay`, { method: 'POST' });
    window.location.href = `/checkout-sucesso.html?order=${orderId}`;
  } catch (err) {
    showCheckoutError(err.message);
    btn.disabled = false;
    btn.textContent = 'Confirmar pagamento (simulado)';
  }
}

async function loadOrder() {
  try {
    const { order, stripeEnabled } = await Api.request(`/orders/${orderId}`);

    if (order.status === 'paid') {
      cardEl.innerHTML = `
        <div class="text-center">
          <div style="color:var(--color-success);">${icon('check-circle', 40)}</div>
          <h2>Já tem acesso a este produto</h2>
          <a href="/curso.html?id=${order.product_id}" class="btn btn-primary">Aceder ao produto</a>
        </div>`;
      return;
    }

    if (stripeEnabled) {
      cardEl.innerHTML = `
        <h2>Finalizar compra</h2>
        ${summaryHtml(order)}
        <div class="alert alert-error" id="checkout-error"></div>
        <button class="btn btn-primary btn-block" id="pay-btn" style="margin-top:20px;">Pagar com cartão</button>
        <a href="/curso.html?id=${order.product_id}" class="btn btn-ghost btn-block" style="margin-top:8px;">Cancelar e voltar ao produto</a>
        <div class="trust-strip">
          <span class="trust-item"><span class="trust-icon">${icon('lock', 16)}</span> Processado com segurança pela Stripe</span>
        </div>
      `;
      document.getElementById('pay-btn').addEventListener('click', () => payWithStripe(order.product_id));
      return;
    }

    cardEl.innerHTML = `
      <h2>Finalizar compra</h2>
      <span class="demo-badge">${icon('flask', 14)} Modo de demonstração — nenhum valor real será cobrado</span>
      ${summaryHtml(order)}
      <div class="demo-card-mock" style="margin-top:20px;">
        <div class="form-group">
          <label>Número do cartão</label>
          <input type="text" value="4242 4242 4242 4242" disabled />
        </div>
        <div class="grid grid-2">
          <div class="form-group"><label>Validade</label><input type="text" value="12/30" disabled /></div>
          <div class="form-group" style="margin-bottom:0;"><label>CVC</label><input type="text" value="123" disabled /></div>
        </div>
      </div>
      <div class="alert alert-error" id="checkout-error"></div>
      <button class="btn btn-primary btn-block" id="pay-btn">Confirmar pagamento (simulado)</button>
      <a href="/curso.html?id=${order.product_id}" class="btn btn-ghost btn-block" style="margin-top:8px;">Cancelar e voltar ao produto</a>
      <div class="trust-strip">
        <span class="trust-item"><span class="trust-icon">${icon('lock', 16)}</span> Em produção, isto é processado pela Stripe</span>
      </div>
    `;
    document.getElementById('pay-btn').addEventListener('click', payWithSimulation);
  } catch (err) {
    cardEl.innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`;
  }
}

loadOrder();
