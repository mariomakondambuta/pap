const listEl = document.getElementById('courses-list');
const searchInput = document.getElementById('filter-search');
const categorySelect = document.getElementById('filter-category');
const levelSelect = document.getElementById('filter-level');

let debounceTimer = null;
let allCourses = [];

async function loadCourses() {
  const params = new URLSearchParams();
  if (searchInput.value.trim()) params.set('search', searchInput.value.trim());
  if (categorySelect.value) params.set('category', categorySelect.value);
  if (levelSelect.value) params.set('level', levelSelect.value);

  listEl.innerHTML = '<div class="spinner"></div>';
  try {
    const { courses } = await Api.request(`/courses?${params.toString()}`);

    if (allCourses.length === 0) {
      allCourses = courses;
      populateCategories(courses);
    }

    if (courses.length === 0) {
      listEl.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><div class="icon">🔍</div>Nenhum curso encontrado com estes filtros.</div>`;
      return;
    }
    listEl.innerHTML = courses.map(courseCardHtml).join('');
  } catch (err) {
    listEl.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">Não foi possível carregar os cursos.</div>`;
  }
}

function populateCategories(courses) {
  const categories = [...new Set(courses.map((c) => c.category).filter(Boolean))];
  categorySelect.innerHTML =
    '<option value="">Todas as categorias</option>' +
    categories.map((cat) => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join('');
}

searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(loadCourses, 300);
});
categorySelect.addEventListener('change', loadCourses);
levelSelect.addEventListener('change', loadCourses);

loadCourses();
