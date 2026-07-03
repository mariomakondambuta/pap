function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function youtubeEmbedUrl(url) {
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  return url;
}

function playerHtml(lesson) {
  if (lesson.type === 'video') {
    if (/youtube\.com|youtu\.be/i.test(lesson.content_url)) {
      return `
        <div style="position:relative; padding-top:56.25%; border-radius: var(--radius-md); overflow:hidden; background:#000;">
          <iframe src="${youtubeEmbedUrl(lesson.content_url)}" style="position:absolute; inset:0; width:100%; height:100%; border:0;" allowfullscreen></iframe>
        </div>`;
    }
    return `
      <video controls style="width:100%; border-radius: var(--radius-md); background:#000;" src="${lesson.content_url}"></video>`;
  }
  return `
    <iframe src="${lesson.content_url}" style="width:100%; height:70vh; border:1px solid var(--color-border); border-radius: var(--radius-md);"></iframe>
    <div style="margin-top:12px;"><a href="${lesson.content_url}" target="_blank" class="btn btn-outline btn-sm">Abrir PDF numa nova aba</a></div>`;
}

const params = new URLSearchParams(window.location.search);
const lessonId = params.get('id');
const contentEl = document.getElementById('lesson-content');

if (!lessonId) window.location.href = '/painel.html';

let wasCompletedBefore = false;

async function completeLesson() {
  const btn = document.getElementById('complete-btn');
  btn.disabled = true;
  btn.textContent = 'A guardar...';
  try {
    const { certificate } = await Api.request(`/lessons/${lessonId}/complete`, { method: 'POST' });
    if (certificate && !wasCompletedBefore) {
      document.getElementById('cert-modal').classList.add('show');
    }
    await loadLesson();
  } catch (err) {
    alert(err.message);
    btn.disabled = false;
    btn.textContent = 'Marcar como concluída';
  }
}

async function loadLesson() {
  try {
    const { lesson, completed, previousLesson, nextLesson, position } = await Api.request(`/lessons/${lessonId}`);
    wasCompletedBefore = completed;

    contentEl.innerHTML = `
      <a href="/curso.html?id=${lesson.product_id}" class="muted" style="font-size:0.9rem; display:inline-flex; align-items:center; gap:4px;">${icon('chevron-left', 14)} ${escapeHtml(lesson.product_title)}</a>
      <div class="flex-between" style="margin-top:8px; margin-bottom:20px;">
        <h1 style="margin-bottom:0;">${escapeHtml(lesson.title)}</h1>
        <span class="badge badge-neutral">Aula ${position.index} de ${position.total}</span>
      </div>

      <div style="max-width:900px;">
        ${playerHtml(lesson)}
        ${lesson.description ? `<p style="margin-top:20px;">${escapeHtml(lesson.description)}</p>` : ''}

        <div class="flex-between" style="margin-top:32px; padding-top:24px; border-top:1px solid var(--color-border);">
          <div>
            ${previousLesson ? `<a href="/aula.html?id=${previousLesson.id}" class="btn btn-outline">${icon('chevron-left', 16)} Anterior</a>` : ''}
          </div>
          <button class="btn ${completed ? 'btn-outline' : 'btn-primary'}" id="complete-btn" ${completed ? 'disabled' : ''}>
            ${completed ? `${icon('check', 16)} Aula concluída` : 'Marcar como concluída'}
          </button>
          <div>
            ${nextLesson ? `<a href="/aula.html?id=${nextLesson.id}" class="btn btn-outline">Seguinte ${icon('chevron-right', 16)}</a>` : ''}
          </div>
        </div>
      </div>
    `;

    const completeBtn = document.getElementById('complete-btn');
    if (completeBtn && !completed) completeBtn.addEventListener('click', completeLesson);
  } catch (err) {
    contentEl.innerHTML = `<div class="empty-state"><div class="icon">${icon('alert-triangle', 32)}</div>${escapeHtml(err.message)}</div>`;
  }
}

document.getElementById('cert-modal-close').addEventListener('click', () => {
  document.getElementById('cert-modal').classList.remove('show');
});

loadLesson();
