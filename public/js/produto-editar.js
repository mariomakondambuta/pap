const params = new URLSearchParams(window.location.search);
let productId = params.get('id');
const initialFormat = params.get('formato');

const errorEl = document.getElementById('form-error');
const form = document.getElementById('product-form');
const saveBtn = document.getElementById('btn-save');

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.add('show', 'alert-error');
  errorEl.classList.remove('alert-success');
}
function showSuccess(message) {
  errorEl.textContent = message;
  errorEl.classList.add('show', 'alert-success');
  errorEl.classList.remove('alert-error');
  setTimeout(() => errorEl.classList.remove('show'), 3000);
}

function updateThumbnailPreview() {
  const url = document.getElementById('product-thumbnail').value.trim();
  const preview = document.getElementById('thumbnail-preview');
  preview.innerHTML = url ? `<img src="${url}" alt="Pré-visualização da capa" onerror="this.remove()" />` : '';
}
document.getElementById('product-thumbnail').addEventListener('input', updateThumbnailPreview);

function renderContentsPreview(lessons) {
  const listEl = document.getElementById('contents-preview');
  const hintEl = document.getElementById('contents-hint');
  if (!lessons || lessons.length === 0) {
    listEl.innerHTML = '';
    hintEl.textContent = 'Ainda não adicionou conteúdos a este produto.';
    hintEl.hidden = false;
    return;
  }
  hintEl.hidden = true;
  const TYPE_ICON = { video: 'video', pdf: 'file-text', file: 'paperclip' };
  listEl.innerHTML = lessons.map((l) => `
    <li class="lesson-item">
      <span class="lesson-icon">${icon(TYPE_ICON[l.type] || 'file-text', 18)}</span>
      <div style="flex:1;">
        <div style="font-weight:600;">${escapeHtml(l.title)}</div>
        <div class="muted" style="font-size:0.8rem;">Ordem ${l.order_index}${l.duration_minutes ? ` · ${l.duration_minutes} min` : ''}</div>
      </div>
    </li>`).join('');
}

async function refreshContentsAfterChange() {
  if (!productId) return;
  try {
    const { lessons, product } = await Api.request(`/products/${productId}`);
    renderContentsPreview(lessons);
    document.getElementById('stat-lessons').textContent = lessons.length;
    document.getElementById('stat-students').textContent = product.student_count ?? 0;
  } catch (err) {
    // silencioso: preview de conteúdos não é crítico
  }
}

function enterEditMode(product, lessons) {
  productId = product.id;
  document.getElementById('editor-title').textContent = product.title;
  document.getElementById('editor-subtitle').textContent = 'Altere os detalhes e grave para atualizar.';
  document.getElementById('btn-manage-contents').disabled = false;
  document.getElementById('stats-card').hidden = false;
  document.getElementById('stat-lessons').textContent = lessons.length;
  document.getElementById('stat-students').textContent = product.student_count ?? 0;
  renderContentsPreview(lessons);
  history.replaceState(null, '', `/produto-editar.html?id=${product.id}`);
}

function fillForm(product) {
  document.getElementById('product-title').value = product.title || '';
  document.getElementById('product-description').value = product.description || '';
  document.getElementById('product-format').value = product.format || 'curso';
  document.getElementById('product-category').value = product.category || '';
  document.getElementById('product-price').value = (product.price_cents / 100).toFixed(2);
  document.getElementById('product-thumbnail').value = product.thumbnail_url || '';
  document.getElementById('product-published').value = product.published ? '1' : '0';
  updateThumbnailPreview();
}

async function init() {
  document.getElementById('btn-manage-contents').disabled = true;
  if (productId) {
    try {
      const { product, lessons } = await Api.request(`/products/${productId}`);
      fillForm(product);
      enterEditMode(product, lessons);
    } catch (err) {
      showError('Não foi possível carregar este produto.');
    }
  } else {
    document.getElementById('product-format').value = initialFormat || 'curso';
    document.getElementById('contents-hint').textContent = 'Grave o produto primeiro para poder adicionar vídeos, PDFs ou ficheiros.';
  }
}

document.getElementById('btn-manage-contents').addEventListener('click', () => {
  if (!productId) return;
  openContentModal({ id: productId, title: document.getElementById('product-title').value || 'Produto' }, refreshContentsAfterChange);
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.classList.remove('show');

  const payload = {
    title: document.getElementById('product-title').value.trim(),
    description: document.getElementById('product-description').value.trim(),
    format: document.getElementById('product-format').value,
    category: document.getElementById('product-category').value.trim(),
    price: document.getElementById('product-price').value,
    thumbnail_url: document.getElementById('product-thumbnail').value.trim(),
    published: document.getElementById('product-published').value === '1',
  };

  saveBtn.disabled = true;
  try {
    if (productId) {
      const { product } = await Api.request(`/products/${productId}`, { method: 'PUT', body: payload });
      fillForm(product);
      showSuccess('Produto atualizado com sucesso.');
    } else {
      const { product } = await Api.request('/products', { method: 'POST', body: payload });
      fillForm(product);
      enterEditMode(product, []);
      showSuccess('Produto criado. Já pode adicionar conteúdos.');
    }
  } catch (err) {
    showError(err.message);
  } finally {
    saveBtn.disabled = false;
  }
});

init();
