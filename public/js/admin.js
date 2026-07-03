function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}
function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

const user = Api.getUser();
document.getElementById('admin-avatar').textContent = initials(user?.name);
document.getElementById('btn-logout').addEventListener('click', () => Api.logout());

/* ---------- Tabs ---------- */
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});

/* ---------- Modais ---------- */
function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }
document.querySelectorAll('[data-close]').forEach((btn) => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});
document.querySelectorAll('.modal-overlay').forEach((overlay) => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

/* ---------- Dashboard ---------- */
async function loadStats() {
  const cardsEl = document.getElementById('stats-cards');
  const tbody = document.getElementById('recent-enrollments-body');
  try {
    const stats = await Api.request('/admin/stats');
    cardsEl.innerHTML = `
      <div class="card"><div class="stat-value">${stats.totalUsers}</div><div class="stat-label">Alunos</div></div>
      <div class="card"><div class="stat-value">${stats.totalCourses}</div><div class="stat-label">Cursos (${stats.publishedCourses} publicados)</div></div>
      <div class="card"><div class="stat-value">${stats.totalEnrollments}</div><div class="stat-label">Inscrições</div></div>
      <div class="card"><div class="stat-value">${stats.totalCertificates}</div><div class="stat-label">Certificados emitidos</div></div>
    `;
    tbody.innerHTML = stats.recentEnrollments.length
      ? stats.recentEnrollments.map((r) => `
          <tr>
            <td>${escapeHtml(r.student_name)}</td>
            <td>${escapeHtml(r.course_title)}</td>
            <td>${new Date(r.enrolled_at).toLocaleDateString('pt-PT')}</td>
          </tr>`).join('')
      : '<tr><td colspan="3">Ainda não há inscrições.</td></tr>';
  } catch (err) {
    cardsEl.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">${escapeHtml(err.message)}</div>`;
  }
}

/* ---------- Cursos ---------- */
let coursesCache = [];

async function loadCourses() {
  const tbody = document.getElementById('courses-body');
  try {
    const { courses } = await Api.request('/courses/admin/all');
    coursesCache = courses;
    tbody.innerHTML = courses.length
      ? courses.map((c) => `
          <tr>
            <td>${escapeHtml(c.title)}</td>
            <td>${escapeHtml(c.category || '—')}</td>
            <td>${escapeHtml(c.level)}</td>
            <td>${c.lesson_count}</td>
            <td>${c.student_count}</td>
            <td>${c.published ? '<span class="badge badge-success">Publicado</span>' : '<span class="badge badge-warning">Rascunho</span>'}</td>
            <td>
              <div class="flex gap-sm">
                <button class="btn btn-outline btn-sm" data-action="lessons" data-id="${c.id}">Aulas</button>
                <button class="btn btn-outline btn-sm" data-action="edit" data-id="${c.id}">Editar</button>
                <button class="btn btn-danger btn-sm" data-action="delete" data-id="${c.id}">Eliminar</button>
              </div>
            </td>
          </tr>`).join('')
      : '<tr><td colspan="7">Ainda não existem cursos. Crie o primeiro!</td></tr>';

    tbody.querySelectorAll('button[data-action]').forEach((btn) => {
      const course = coursesCache.find((c) => c.id === Number(btn.dataset.id));
      if (btn.dataset.action === 'edit') btn.addEventListener('click', () => openCourseModal(course));
      if (btn.dataset.action === 'lessons') btn.addEventListener('click', () => openLessonsModal(course));
      if (btn.dataset.action === 'delete') btn.addEventListener('click', () => deleteCourse(course));
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7">${escapeHtml(err.message)}</td></tr>`;
  }
}

function openCourseModal(course = null) {
  const errorEl = document.getElementById('course-form-error');
  errorEl.classList.remove('show');
  document.getElementById('course-modal-title').textContent = course ? 'Editar curso' : 'Novo curso';
  document.getElementById('course-id').value = course?.id || '';
  document.getElementById('course-title').value = course?.title || '';
  document.getElementById('course-description').value = course?.description || '';
  document.getElementById('course-category').value = course?.category || '';
  document.getElementById('course-level').value = course?.level || 'iniciante';
  document.getElementById('course-instructor').value = course?.instructor_name || '';
  document.getElementById('course-thumbnail').value = course?.thumbnail_url || '';
  document.getElementById('course-published').checked = Boolean(course?.published);
  openModal('course-modal');
}

document.getElementById('btn-new-course').addEventListener('click', () => openCourseModal());

document.getElementById('course-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('course-form-error');
  errorEl.classList.remove('show');

  const id = document.getElementById('course-id').value;
  const payload = {
    title: document.getElementById('course-title').value.trim(),
    description: document.getElementById('course-description').value.trim(),
    category: document.getElementById('course-category').value.trim(),
    level: document.getElementById('course-level').value,
    instructor_name: document.getElementById('course-instructor').value.trim(),
    thumbnail_url: document.getElementById('course-thumbnail').value.trim(),
    published: document.getElementById('course-published').checked,
  };

  try {
    if (id) {
      await Api.request(`/courses/${id}`, { method: 'PUT', body: payload });
    } else {
      await Api.request('/courses', { method: 'POST', body: payload });
    }
    closeModal('course-modal');
    await loadCourses();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.add('show');
  }
});

async function deleteCourse(course) {
  if (!confirm(`Eliminar o curso "${course.title}"? Esta ação não pode ser revertida.`)) return;
  try {
    await Api.request(`/courses/${course.id}`, { method: 'DELETE' });
    await loadCourses();
  } catch (err) {
    alert(err.message);
  }
}

/* ---------- Aulas ---------- */
let currentCourseId = null;
const TYPE_ICON = { video: '🎥', pdf: '📄' };

async function openLessonsModal(course) {
  currentCourseId = course.id;
  document.getElementById('lessons-modal-title').textContent = `Aulas — ${course.title}`;
  document.getElementById('lesson-course-id').value = course.id;
  resetLessonForm();
  await loadLessons();
  openModal('lessons-modal');
}

async function loadLessons() {
  const listEl = document.getElementById('lessons-list');
  listEl.innerHTML = '<div class="spinner"></div>';
  try {
    const { lessons } = await Api.request(`/courses/${currentCourseId}`);
    listEl.innerHTML = lessons.length
      ? lessons.map((l) => `
          <li class="lesson-item">
            <span class="lesson-icon">${TYPE_ICON[l.type] || '📘'}</span>
            <div style="flex:1;">
              <div style="font-weight:600;">${escapeHtml(l.title)}</div>
              <div class="muted" style="font-size:0.8rem;">Ordem ${l.order_index}${l.duration_minutes ? ` · ${l.duration_minutes} min` : ''}</div>
            </div>
            <div class="flex gap-sm">
              <button class="btn btn-outline btn-sm" data-edit="${l.id}">Editar</button>
              <button class="btn btn-danger btn-sm" data-delete="${l.id}">Eliminar</button>
            </div>
          </li>`).join('')
      : '<li class="muted">Ainda não há aulas neste curso.</li>';

    listEl.querySelectorAll('button[data-edit]').forEach((btn) => {
      btn.addEventListener('click', () => editLesson(btn.dataset.edit));
    });
    listEl.querySelectorAll('button[data-delete]').forEach((btn) => {
      btn.addEventListener('click', () => deleteLesson(btn.dataset.delete));
    });
  } catch (err) {
    listEl.innerHTML = `<li>${escapeHtml(err.message)}</li>`;
  }
}

function resetLessonForm() {
  document.getElementById('lesson-form-title').textContent = 'Adicionar aula';
  document.getElementById('lesson-id').value = '';
  document.getElementById('lesson-title').value = '';
  document.getElementById('lesson-description').value = '';
  document.getElementById('lesson-type').value = 'video';
  document.getElementById('lesson-order').value = 0;
  document.getElementById('lesson-duration').value = 0;
  document.getElementById('lesson-url').value = '';
  document.getElementById('lesson-file').value = '';
  document.getElementById('lesson-form-error').classList.remove('show');
}
document.getElementById('lesson-form-reset').addEventListener('click', resetLessonForm);

async function editLesson(lessonId) {
  try {
    const { lesson } = await Api.request(`/lessons/${lessonId}`);
    document.getElementById('lesson-form-title').textContent = 'Editar aula';
    document.getElementById('lesson-id').value = lesson.id;
    document.getElementById('lesson-title').value = lesson.title;
    document.getElementById('lesson-description').value = lesson.description || '';
    document.getElementById('lesson-type').value = lesson.type;
    document.getElementById('lesson-order').value = lesson.order_index;
    document.getElementById('lesson-duration').value = lesson.duration_minutes;
    document.getElementById('lesson-url').value = lesson.content_url.startsWith('/uploads/') ? '' : lesson.content_url;
    document.getElementById('lesson-file').value = '';
  } catch (err) {
    alert(err.message);
  }
}

async function deleteLesson(lessonId) {
  if (!confirm('Eliminar esta aula?')) return;
  try {
    await Api.request(`/lessons/${lessonId}`, { method: 'DELETE' });
    await loadLessons();
    await loadCourses();
  } catch (err) {
    alert(err.message);
  }
}

document.getElementById('lesson-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('lesson-form-error');
  errorEl.classList.remove('show');

  const lessonId = document.getElementById('lesson-id').value;
  const file = document.getElementById('lesson-file').files[0];
  const url = document.getElementById('lesson-url').value.trim();

  if (!file && !url) {
    errorEl.textContent = 'Indique um link para o conteúdo ou envie um ficheiro.';
    errorEl.classList.add('show');
    return;
  }

  const formData = new FormData();
  formData.append('title', document.getElementById('lesson-title').value.trim());
  formData.append('description', document.getElementById('lesson-description').value.trim());
  formData.append('type', document.getElementById('lesson-type').value);
  formData.append('order_index', document.getElementById('lesson-order').value);
  formData.append('duration_minutes', document.getElementById('lesson-duration').value);
  if (url) formData.append('content_url', url);
  if (file) formData.append('file', file);

  try {
    if (lessonId) {
      await Api.request(`/lessons/${lessonId}`, { method: 'PUT', body: formData, isFormData: true });
    } else {
      await Api.request(`/courses/${currentCourseId}/lessons`, { method: 'POST', body: formData, isFormData: true });
    }
    resetLessonForm();
    await loadLessons();
    await loadCourses();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.add('show');
  }
});

/* ---------- Utilizadores ---------- */
async function loadUsers() {
  const tbody = document.getElementById('users-body');
  try {
    const { users } = await Api.request('/admin/users');
    tbody.innerHTML = users.map((u) => `
      <tr>
        <td>${escapeHtml(u.name)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td><span class="badge ${u.role === 'admin' ? 'badge-success' : 'badge-neutral'}">${u.role === 'admin' ? 'Administrador' : 'Aluno'}</span></td>
        <td>${new Date(u.created_at).toLocaleDateString('pt-PT')}</td>
        <td>
          <div class="flex gap-sm">
            ${u.id === user.id ? '' : `
              <button class="btn btn-outline btn-sm" data-toggle-role="${u.id}" data-role="${u.role}">
                ${u.role === 'admin' ? 'Tornar aluno' : 'Tornar admin'}
              </button>
              <button class="btn btn-danger btn-sm" data-delete-user="${u.id}">Eliminar</button>
            `}
          </div>
        </td>
      </tr>`).join('');

    tbody.querySelectorAll('button[data-toggle-role]').forEach((btn) => {
      btn.addEventListener('click', () => toggleUserRole(btn.dataset.toggleRole, btn.dataset.role));
    });
    tbody.querySelectorAll('button[data-delete-user]').forEach((btn) => {
      btn.addEventListener('click', () => deleteUser(btn.dataset.deleteUser));
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5">${escapeHtml(err.message)}</td></tr>`;
  }
}

async function toggleUserRole(id, currentRole) {
  const newRole = currentRole === 'admin' ? 'student' : 'admin';
  try {
    await Api.request(`/admin/users/${id}/role`, { method: 'PUT', body: { role: newRole } });
    await loadUsers();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteUser(id) {
  if (!confirm('Eliminar este utilizador? Esta ação não pode ser revertida.')) return;
  try {
    await Api.request(`/admin/users/${id}`, { method: 'DELETE' });
    await loadUsers();
  } catch (err) {
    alert(err.message);
  }
}

loadStats();
loadCourses();
loadUsers();
