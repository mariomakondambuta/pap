(function () {
  const modalHtml = `
  <div class="modal-overlay" id="content-modal">
    <div class="modal" style="max-width:680px;">
      <div class="modal-header">
        <h3 id="content-modal-title" style="margin-bottom:0;">Conteúdos do produto</h3>
        <button class="modal-close" data-close="content-modal">&times;</button>
      </div>
      <ul class="lesson-list" id="content-list" style="margin-bottom:24px;"></ul>

      <h4 id="content-form-title">Adicionar conteúdo</h4>
      <div class="alert alert-error" id="content-form-error"></div>
      <form id="content-form">
        <input type="hidden" id="content-id" />
        <input type="hidden" id="content-product-id" />
        <div class="form-group">
          <label for="content-title">Título</label>
          <input type="text" id="content-title" required />
        </div>
        <div class="form-group">
          <label for="content-description">Descrição (opcional)</label>
          <textarea id="content-description"></textarea>
        </div>
        <div class="grid grid-2">
          <div class="form-group">
            <label for="content-type">Tipo</label>
            <select id="content-type">
              <option value="video">Vídeo</option>
              <option value="pdf">PDF</option>
              <option value="file">Ficheiro (planilha, doc, zip...)</option>
            </select>
          </div>
          <div class="form-group">
            <label for="content-order">Ordem</label>
            <input type="number" id="content-order" value="0" min="0" />
          </div>
        </div>
        <div class="form-group">
          <label for="content-duration">Duração (minutos, opcional)</label>
          <input type="number" id="content-duration" min="0" value="0" />
        </div>
        <div class="form-group">
          <label for="content-url">Link do conteúdo (YouTube ou URL direto)</label>
          <input type="text" id="content-url" placeholder="https://www.youtube.com/watch?v=..." />
        </div>
        <div class="form-group">
          <label for="content-file">Ou enviar ficheiro</label>
          <input type="file" id="content-file" />
        </div>
        <div class="flex gap-md">
          <button type="submit" class="btn btn-primary" style="flex:1;">Guardar conteúdo</button>
          <button type="button" class="btn btn-outline" id="content-form-reset">Cancelar edição</button>
        </div>
      </form>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  let currentProductId = null;
  let onChangeCallback = null;
  const TYPE_ICON = { video: 'video', pdf: 'file-text', file: 'paperclip' };

  async function loadContents() {
    const listEl = document.getElementById('content-list');
    listEl.innerHTML = '<div class="spinner"></div>';
    try {
      const { lessons } = await Api.request(`/products/${currentProductId}`);
      listEl.innerHTML = lessons.length
        ? lessons.map((l) => `
            <li class="lesson-item">
              <span class="lesson-icon">${icon(TYPE_ICON[l.type] || 'file-text', 18)}</span>
              <div style="flex:1;">
                <div style="font-weight:600;">${escapeHtml(l.title)}</div>
                <div class="muted" style="font-size:0.8rem;">Ordem ${l.order_index}${l.duration_minutes ? ` · ${l.duration_minutes} min` : ''}</div>
              </div>
              <div class="flex gap-sm">
                <button class="btn btn-outline btn-sm" data-edit="${l.id}">Editar</button>
                <button class="btn btn-danger btn-sm" data-delete="${l.id}">Eliminar</button>
              </div>
            </li>`).join('')
        : '<li class="muted">Ainda não há conteúdos neste produto.</li>';

      listEl.querySelectorAll('button[data-edit]').forEach((btn) => {
        btn.addEventListener('click', () => editContent(btn.dataset.edit));
      });
      listEl.querySelectorAll('button[data-delete]').forEach((btn) => {
        btn.addEventListener('click', () => deleteContent(btn.dataset.delete));
      });
    } catch (err) {
      listEl.innerHTML = `<li>${escapeHtml(err.message)}</li>`;
    }
  }

  function resetContentForm() {
    document.getElementById('content-form-title').textContent = 'Adicionar conteúdo';
    document.getElementById('content-id').value = '';
    document.getElementById('content-title').value = '';
    document.getElementById('content-description').value = '';
    document.getElementById('content-type').value = 'video';
    document.getElementById('content-order').value = 0;
    document.getElementById('content-duration').value = 0;
    document.getElementById('content-url').value = '';
    document.getElementById('content-file').value = '';
    document.getElementById('content-form-error').classList.remove('show');
  }
  document.getElementById('content-form-reset').addEventListener('click', resetContentForm);

  async function editContent(lessonId) {
    try {
      const { lesson } = await Api.request(`/lessons/${lessonId}`);
      document.getElementById('content-form-title').textContent = 'Editar conteúdo';
      document.getElementById('content-id').value = lesson.id;
      document.getElementById('content-title').value = lesson.title;
      document.getElementById('content-description').value = lesson.description || '';
      document.getElementById('content-type').value = lesson.type;
      document.getElementById('content-order').value = lesson.order_index;
      document.getElementById('content-duration').value = lesson.duration_minutes;
      document.getElementById('content-url').value = lesson.content_url.startsWith('/uploads/') ? '' : lesson.content_url;
      document.getElementById('content-file').value = '';
    } catch (err) {
      alert(err.message);
    }
  }

  async function deleteContent(lessonId) {
    if (!confirm('Eliminar este conteúdo?')) return;
    try {
      await Api.request(`/lessons/${lessonId}`, { method: 'DELETE' });
      await loadContents();
      if (onChangeCallback) await onChangeCallback();
    } catch (err) {
      alert(err.message);
    }
  }

  document.getElementById('content-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('content-form-error');
    errorEl.classList.remove('show');

    const contentId = document.getElementById('content-id').value;
    const file = document.getElementById('content-file').files[0];
    const url = document.getElementById('content-url').value.trim();

    if (!file && !url) {
      errorEl.textContent = 'Indique um link para o conteúdo ou envie um ficheiro.';
      errorEl.classList.add('show');
      return;
    }

    const formData = new FormData();
    formData.append('title', document.getElementById('content-title').value.trim());
    formData.append('description', document.getElementById('content-description').value.trim());
    formData.append('type', document.getElementById('content-type').value);
    formData.append('order_index', document.getElementById('content-order').value);
    formData.append('duration_minutes', document.getElementById('content-duration').value);
    if (url) formData.append('content_url', url);
    if (file) formData.append('file', file);

    try {
      if (contentId) {
        await Api.request(`/lessons/${contentId}`, { method: 'PUT', body: formData, isFormData: true });
      } else {
        await Api.request(`/products/${currentProductId}/lessons`, { method: 'POST', body: formData, isFormData: true });
      }
      resetContentForm();
      await loadContents();
      if (onChangeCallback) await onChangeCallback();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.add('show');
    }
  });

  window.openContentModal = async function (product, changeCallback) {
    currentProductId = product.id;
    onChangeCallback = changeCallback || null;
    document.getElementById('content-modal-title').textContent = `Conteúdos — ${product.title}`;
    document.getElementById('content-product-id').value = product.id;
    resetContentForm();
    await loadContents();
    openModal('content-modal');
  };
})();
