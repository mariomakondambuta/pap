function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('show');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}

document.addEventListener('click', (e) => {
  const closeTrigger = e.target.closest('[data-close]');
  if (closeTrigger) {
    const overlay = closeTrigger.closest('.modal-overlay');
    if (overlay) overlay.classList.remove('show');
    return;
  }
  if (e.target.classList && e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('show');
  }
});
