const FORMAT_LABELS = {
  curso: '🎬 Curso',
  ebook: '📕 E-book',
  planilha: '📊 Planilha',
  template: '📄 Template',
  pack: '📦 Pack',
  outro: '🗂️ Produto',
};

function formatPrice(cents, currency = 'EUR') {
  if (!cents) return 'Grátis';
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency }).format(cents / 100);
}

function productCardHtml(product) {
  const formatLabel = FORMAT_LABELS[product.format] || product.format;
  const priceHtml = product.price_cents
    ? `<span class="price-tag price-tag-sm">${formatPrice(product.price_cents, product.currency)}</span>`
    : `<span class="price-tag price-tag-sm is-free">Grátis</span>`;

  return `
    <a href="/curso.html?id=${product.id}" class="card course-card">
      <div class="course-card-thumb">${escapeHtml(product.title)}</div>
      <div class="course-card-body">
        <div class="flex-between">
          <span class="format-badge">${formatLabel}</span>
          ${priceHtml}
        </div>
        <h3 style="margin-bottom:4px;">${escapeHtml(product.title)}</h3>
        <p style="font-size:0.9rem; margin-bottom:0;">${escapeHtml(truncate(product.description || '', 90))}</p>
        ${product.seller_name ? `<p class="muted" style="font-size:0.78rem; margin-bottom:0;">por ${escapeHtml(product.seller_name)}</p>` : ''}
      </div>
      <div class="course-card-footer">
        <span class="badge badge-neutral">${escapeHtml(product.category || 'Geral')}</span>
        <span class="muted" style="font-size:0.85rem;">${product.lesson_count ?? 0} conteúdos</span>
      </div>
    </a>
  `;
}

function truncate(text, max) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}
