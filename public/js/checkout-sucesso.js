function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

const params = new URLSearchParams(window.location.search);
const orderId = params.get('order');
const cardEl = document.getElementById('success-card');

if (!orderId) {
  window.location.href = '/painel.html';
}

async function pollOrder(attempt = 0) {
  try {
    const { order } = await Api.request(`/orders/${orderId}`);

    if (order.status === 'paid') {
      cardEl.innerHTML = `
        <div style="color:var(--color-success);">${icon('check-circle', 48)}</div>
        <h2>Pagamento confirmado!</h2>
        <p>Já tem acesso a <strong>${escapeHtml(order.product_title)}</strong>.</p>
        <div class="flex gap-md" style="justify-content:center;">
          <a href="/curso.html?id=${order.product_id}" class="btn btn-primary">Aceder ao produto</a>
          <a href="/painel.html" class="btn btn-outline">Ir para o meu painel</a>
        </div>
      `;
      return;
    }

    if (attempt < 5) {
      cardEl.innerHTML = `<div class="spinner"></div><p>A confirmar o seu pagamento...</p>`;
      setTimeout(() => pollOrder(attempt + 1), 2000);
    } else {
      cardEl.innerHTML = `
        <div style="color:var(--color-text-muted);">${icon('clock', 40)}</div>
        <h2>Ainda a processar</h2>
        <p>O seu pagamento está a ser confirmado. Pode acompanhar o estado no seu painel.</p>
        <a href="/painel.html" class="btn btn-primary">Ir para o meu painel</a>
      `;
    }
  } catch (err) {
    cardEl.innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`;
  }
}

pollOrder();
