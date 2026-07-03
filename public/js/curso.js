const LEVEL_LABELS_FULL = {
  iniciante: 'Iniciante',
  intermedio: 'Intermédio',
  avancado: 'Avançado',
};
const TYPE_ICON = { video: '🎥', pdf: '📄' };

const params = new URLSearchParams(window.location.search);
const courseId = params.get('id');
const contentEl = document.getElementById('course-content');

if (!courseId) {
  window.location.href = '/cursos.html';
}

function lessonItemHtml(lesson, isEnrolled) {
  const icon = lesson.completed ? '✓' : TYPE_ICON[lesson.type] || '📘';
  const classes = ['lesson-item'];
  if (lesson.completed) classes.push('completed');
  if (!isEnrolled) classes.push('locked');

  const inner = `
    <span class="lesson-icon">${icon}</span>
    <div style="flex:1;">
      <div style="font-weight:600;">${escapeHtml(lesson.title)}</div>
      <div class="muted" style="font-size:0.8rem;">${lesson.type === 'video' ? 'Vídeo-aula' : 'Documento PDF'}${lesson.duration_minutes ? ` · ${lesson.duration_minutes} min` : ''}</div>
    </div>
    <span>${isEnrolled ? '›' : '🔒'}</span>
  `;

  if (isEnrolled) {
    return `<a href="/aula.html?id=${lesson.id}" class="${classes.join(' ')}">${inner}</a>`;
  }
  return `<div class="${classes.join(' ')}" style="opacity:0.6;">${inner}</div>`;
}

async function enroll() {
  if (!Api.isAuthenticated()) {
    window.location.href = `/login.html?redirect=/curso.html?id=${courseId}`;
    return;
  }
  const btn = document.getElementById('enroll-btn');
  btn.disabled = true;
  btn.textContent = 'A inscrever...';
  try {
    await Api.request(`/courses/${courseId}/enroll`, { method: 'POST' });
    await loadCourse();
  } catch (err) {
    alert(err.message);
    btn.disabled = false;
    btn.textContent = 'Inscrever-me gratuitamente';
  }
}

async function loadCourse() {
  try {
    const { course, lessons, isEnrolled, progress } = await Api.request(`/courses/${courseId}`);

    const levelLabel = LEVEL_LABELS_FULL[course.level] || course.level;
    let actionHtml = `<button class="btn btn-primary btn-block" id="enroll-btn">Inscrever-me gratuitamente</button>`;

    if (isEnrolled) {
      actionHtml = `
        <div class="flex-between" style="margin-bottom:8px;">
          <span class="muted" style="font-size:0.85rem;">O seu progresso</span>
          <strong>${progress?.percent ?? 0}%</strong>
        </div>
        <div class="progress-bar" style="margin-bottom:16px;">
          <div class="progress-bar-fill" style="width:${progress?.percent ?? 0}%;"></div>
        </div>
        ${progress?.percent === 100
          ? `<a href="/certificados.html" class="btn btn-accent btn-block">🏆 Ver certificado</a>`
          : `<span class="badge badge-success">Já está inscrito</span>`}
      `;
    }

    contentEl.innerHTML = `
      <div class="grid" style="grid-template-columns: 2fr 1fr; gap:40px; align-items:start;">
        <div>
          <span class="badge">${escapeHtml(course.category || 'Geral')}</span>
          <h1>${escapeHtml(course.title)}</h1>
          <p style="font-size:1.05rem;">${escapeHtml(course.description || '')}</p>
          <div class="flex gap-md" style="margin-bottom:32px;">
            <span class="badge badge-neutral">${levelLabel}</span>
            <span class="badge badge-neutral">${lessons.length} aulas</span>
            <span class="badge badge-neutral">${course.student_count} alunos</span>
            ${course.instructor_name ? `<span class="badge badge-neutral">👤 ${escapeHtml(course.instructor_name)}</span>` : ''}
          </div>
          <h3>Conteúdo do curso</h3>
          ${lessons.length === 0
            ? `<div class="empty-state">Ainda não há aulas disponíveis neste curso.</div>`
            : `<ul class="lesson-list">${lessons.map((l) => `<li>${lessonItemHtml(l, isEnrolled)}</li>`).join('')}</ul>`}
        </div>
        <div class="card">
          <div class="course-card-thumb" style="border-radius: var(--radius-sm); margin-bottom:20px;">${escapeHtml(course.title)}</div>
          ${actionHtml}
        </div>
      </div>
    `;

    const enrollBtn = document.getElementById('enroll-btn');
    if (enrollBtn) enrollBtn.addEventListener('click', enroll);
  } catch (err) {
    contentEl.innerHTML = `<div class="empty-state"><div class="icon">😕</div>${escapeHtml(err.message)}</div>`;
  }
}

loadCourse();
