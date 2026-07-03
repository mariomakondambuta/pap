function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

const user = Api.getUser();
document.getElementById('welcome-title').textContent = `Olá, ${user?.name?.split(' ')[0] || 'aluno'} 👋`;

function courseProgressCardHtml(course) {
  const percent = course.progress_percent;
  const isComplete = percent === 100;
  return `
    <div class="card course-card">
      <div class="course-card-thumb">${escapeHtml(course.title)}</div>
      <div class="course-card-body">
        <span class="badge badge-neutral">${escapeHtml(course.category || 'Geral')}</span>
        <h3 style="margin-bottom:4px;">${escapeHtml(course.title)}</h3>
        <div class="flex-between" style="font-size:0.8rem;">
          <span class="muted">${course.completed_lessons}/${course.total_lessons} aulas concluídas</span>
          <strong>${percent}%</strong>
        </div>
        <div class="progress-bar"><div class="progress-bar-fill" style="width:${percent}%;"></div></div>
      </div>
      <div class="course-card-footer">
        ${isComplete
          ? `<a href="/certificados.html" class="btn btn-accent btn-sm">🏆 Certificado</a>`
          : `<a href="/curso.html?id=${course.id}" class="btn btn-primary btn-sm">Continuar</a>`}
        <a href="/curso.html?id=${course.id}" class="btn btn-ghost btn-sm">Ver curso</a>
      </div>
    </div>
  `;
}

async function loadMyCourses() {
  const container = document.getElementById('my-courses');
  try {
    const { courses } = await Api.request('/enrollments/me');
    if (courses.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="icon">📚</div>
          Ainda não está inscrito em nenhum curso.
          <div style="margin-top:16px;"><a href="/cursos.html" class="btn btn-primary">Explorar cursos</a></div>
        </div>`;
      return;
    }
    container.innerHTML = courses.map(courseProgressCardHtml).join('');
  } catch (err) {
    container.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">Não foi possível carregar os seus cursos.</div>`;
  }
}

loadMyCourses();
