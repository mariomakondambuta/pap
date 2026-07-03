const LEVEL_LABELS = {
  iniciante: 'Iniciante',
  intermedio: 'Intermédio',
  avancado: 'Avançado',
};

function courseCardHtml(course) {
  const levelLabel = LEVEL_LABELS[course.level] || course.level;
  return `
    <a href="/curso.html?id=${course.id}" class="card course-card">
      <div class="course-card-thumb">${escapeHtml(course.title)}</div>
      <div class="course-card-body">
        <span class="badge">${escapeHtml(course.category || 'Geral')}</span>
        <h3 style="margin-bottom:4px;">${escapeHtml(course.title)}</h3>
        <p style="font-size:0.9rem; margin-bottom:0;">${escapeHtml(truncate(course.description || '', 90))}</p>
      </div>
      <div class="course-card-footer">
        <span class="badge badge-neutral">${levelLabel}</span>
        <span class="muted" style="font-size:0.85rem;">${course.lesson_count ?? 0} aulas</span>
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
