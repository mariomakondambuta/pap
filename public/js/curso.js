const LEVEL_LABELS_FULL = {
  iniciante: 'Iniciante',
  intermedio: 'Intermédio',
  avancado: 'Avançado',
};
const TYPE_ICON = { video: 'video', pdf: 'file-text', file: 'paperclip' };
const TYPE_LABEL = { video: 'Vídeo-aula', pdf: 'Documento PDF', file: 'Ficheiro para descarregar' };

const params = new URLSearchParams(window.location.search);
const productId = params.get('id');
const contentEl = document.getElementById('course-content');

if (!productId) {
  window.location.href = '/cursos.html';
}

function lessonItemHtml(lesson, hasAccess) {
  const iconHtml = lesson.completed ? icon('check', 18) : icon(TYPE_ICON[lesson.type] || 'file-text', 18);
  const classes = ['lesson-item'];
  if (lesson.completed) classes.push('completed');

  const inner = `
    <span class="lesson-icon">${iconHtml}</span>
    <div style="flex:1;">
      <div style="font-weight:600;">${escapeHtml(lesson.title)}</div>
      <div class="muted" style="font-size:0.8rem;">${TYPE_LABEL[lesson.type] || lesson.type}${lesson.duration_minutes ? ` · ${lesson.duration_minutes} min` : ''}</div>
    </div>
    <span>${hasAccess ? icon('chevron-right', 16) : icon('lock', 16)}</span>
  `;

  if (hasAccess) {
    return `<a href="/aula.html?id=${lesson.id}" class="${classes.join(' ')}">${inner}</a>`;
  }
  return `<div class="${classes.join(' ')}" style="opacity:0.6;">${inner}</div>`;
}

async function accessFree() {
  if (!Api.isAuthenticated()) {
    window.location.href = `/login.html`;
    return;
  }
  const btn = document.getElementById('access-btn');
  btn.disabled = true;
  btn.textContent = 'A processar...';
  try {
    await Api.request(`/products/${productId}/enroll`, { method: 'POST' });
    await loadProduct();
  } catch (err) {
    alert(err.message);
    btn.disabled = false;
    btn.textContent = 'Aceder gratuitamente';
  }
}

async function buyNow() {
  if (!Api.isAuthenticated()) {
    window.location.href = `/login.html`;
    return;
  }
  const btn = document.getElementById('buy-btn');
  btn.disabled = true;
  btn.textContent = 'A preparar pagamento...';
  try {
    const { orderId, simulated, checkoutUrl } = await Api.request('/orders/checkout', {
      method: 'POST',
      body: { product_id: Number(productId) },
    });
    if (simulated) {
      window.location.href = `/checkout.html?order=${orderId}`;
    } else {
      window.location.href = checkoutUrl;
    }
  } catch (err) {
    alert(err.message);
    btn.disabled = false;
    btn.textContent = 'Comprar agora';
  }
}

async function loadProduct() {
  try {
    const { product, lessons, hasAccess, progress, pendingOrderId, isOwner } = await Api.request(`/products/${productId}`);

    const levelLabel = LEVEL_LABELS_FULL[product.level] || product.level;
    const priceHtml = product.is_free
      ? `<div class="price-tag is-free" style="margin-bottom:16px;">Grátis</div>`
      : `<div class="price-tag" style="margin-bottom:16px;">${formatPrice(product.price_cents, product.currency)}</div>`;

    let actionHtml;
    if (isOwner) {
      actionHtml = `<a href="/painel.html?tab=vender" class="btn btn-outline btn-block">Gerir este produto</a>`;
    } else if (hasAccess) {
      actionHtml = `
        <div class="flex-between" style="margin-bottom:8px;">
          <span class="muted" style="font-size:0.85rem;">O seu progresso</span>
          <strong>${progress?.percent ?? 0}%</strong>
        </div>
        <div class="progress-bar" style="margin-bottom:16px;">
          <div class="progress-bar-fill" style="width:${progress?.percent ?? 0}%;"></div>
        </div>
        ${progress?.percent === 100
          ? `<a href="/certificados.html" class="btn btn-accent btn-block">${icon('award', 18)} Ver certificado</a>`
          : `<span class="badge badge-success">Já tem acesso</span>`}
      `;
    } else if (product.is_free) {
      actionHtml = `<button class="btn btn-primary btn-block" id="access-btn">Aceder gratuitamente</button>`;
    } else {
      actionHtml = `<button class="btn btn-primary btn-block" id="buy-btn">${pendingOrderId ? 'Continuar compra' : 'Comprar agora'}</button>`;
    }

    actionHtml += `
      <div class="trust-strip">
        <span class="trust-item"><span class="trust-icon">${icon('lock', 16)}</span> Pagamento seguro</span>
        <span class="trust-item"><span class="trust-icon">${icon('zap', 16)}</span> Acesso imediato</span>
      </div>
    `;

    contentEl.innerHTML = `
      <div class="grid" style="grid-template-columns: 2fr 1fr; gap:40px; align-items:start;">
        <div>
          <div class="flex gap-sm" style="margin-bottom:12px;">
            <span class="format-badge">${formatBadgeHtml(product.format)}</span>
            <span class="badge">${escapeHtml(product.category || 'Geral')}</span>
          </div>
          <h1>${escapeHtml(product.title)}</h1>
          <p style="font-size:1.05rem;">${escapeHtml(product.description || '')}</p>
          <div class="flex gap-md" style="margin-bottom:24px; flex-wrap:wrap;">
            <span class="badge badge-neutral">${levelLabel}</span>
            <span class="badge badge-neutral">${lessons.length} conteúdos</span>
            <span class="badge badge-neutral">${product.student_count} alunos</span>
          </div>

          <div class="seller-inline">
            <div class="avatar">${escapeHtml((product.seller_name || '?').slice(0, 1).toUpperCase())}</div>
            <div>
              <div style="font-weight:600;">${escapeHtml(product.seller_name)}</div>
              <div class="muted" style="font-size:0.82rem;">${escapeHtml(product.seller_bio || 'Produtor na EduWeb')}</div>
            </div>
          </div>

          <h3 style="margin-top:32px;">Conteúdo do produto</h3>
          ${lessons.length === 0
            ? `<div class="empty-state">Ainda não há conteúdos disponíveis neste produto.</div>`
            : `<ul class="lesson-list">${lessons.map((l) => `<li>${lessonItemHtml(l, hasAccess || isOwner)}</li>`).join('')}</ul>`}
        </div>
        <div class="card">
          <div class="course-card-thumb" style="border-radius: var(--radius-sm); margin-bottom:20px;">${escapeHtml(product.title)}</div>
          ${priceHtml}
          ${actionHtml}
        </div>
      </div>
    `;

    const accessBtn = document.getElementById('access-btn');
    if (accessBtn) accessBtn.addEventListener('click', accessFree);
    const buyBtn = document.getElementById('buy-btn');
    if (buyBtn) buyBtn.addEventListener('click', buyNow);
  } catch (err) {
    contentEl.innerHTML = `<div class="empty-state"><div class="icon">${icon('alert-triangle', 32)}</div>${escapeHtml(err.message)}</div>`;
  }
}

loadProduct();
