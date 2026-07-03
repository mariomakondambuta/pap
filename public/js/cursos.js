const listEl = document.getElementById('products-list');
const searchInput = document.getElementById('filter-search');
const categorySelect = document.getElementById('filter-category');
const formatSelect = document.getElementById('filter-format');
const priceSelect = document.getElementById('filter-price');

let debounceTimer = null;
let categoriesLoaded = false;

async function loadProducts() {
  const params = new URLSearchParams();
  if (searchInput.value.trim()) params.set('search', searchInput.value.trim());
  if (categorySelect.value) params.set('category', categorySelect.value);
  if (formatSelect.value) params.set('format', formatSelect.value);
  if (priceSelect.value) params.set('price', priceSelect.value);

  listEl.innerHTML = '<div class="spinner"></div>';
  try {
    const { products } = await Api.request(`/products?${params.toString()}`);

    if (!categoriesLoaded) {
      categoriesLoaded = true;
      populateCategories(products);
    }

    if (products.length === 0) {
      listEl.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><div class="icon">${icon('search', 32)}</div>Nenhum produto encontrado com estes filtros.</div>`;
      return;
    }
    listEl.innerHTML = products.map(productCardHtml).join('');
  } catch (err) {
    listEl.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">Não foi possível carregar os produtos.</div>`;
  }
}

function populateCategories(products) {
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];
  categorySelect.innerHTML =
    '<option value="">Todas as categorias</option>' +
    categories.map((cat) => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join('');
}

searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(loadProducts, 300);
});
categorySelect.addEventListener('change', loadProducts);
formatSelect.addEventListener('change', loadProducts);
priceSelect.addEventListener('change', loadProducts);

loadProducts();
