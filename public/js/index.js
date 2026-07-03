async function loadFeaturedProducts() {
  const container = document.getElementById('featured-products');
  try {
    const { products } = await Api.request('/products');
    document.getElementById('stat-products').textContent = products.length;
    const totalStudents = products.reduce((sum, p) => sum + Number(p.student_count || 0), 0);
    document.getElementById('stat-students').textContent = totalStudents;

    if (products.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="icon">${icon('inbox', 32)}</div>Ainda não há produtos publicados.</div>`;
      return;
    }

    container.innerHTML = products.slice(0, 6).map(productCardHtml).join('');
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Não foi possível carregar os produtos.</div>`;
  }
}

loadFeaturedProducts();
