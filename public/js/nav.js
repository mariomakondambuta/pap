function initials(name) {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

function renderNavActions() {
  const container = document.getElementById('nav-actions');
  if (!container) return;

  const user = Api.getUser();

  if (!user) {
    container.innerHTML = `
      <a href="/login.html" class="btn btn-ghost btn-sm">Entrar</a>
      <a href="/registar.html" class="btn btn-primary btn-sm">Começar grátis</a>
    `;
    return;
  }

  const painelLink = user.role === 'admin' ? '/admin/index.html' : '/painel.html';
  const painelLabel = user.role === 'admin' ? 'Painel Admin' : 'A minha conta';

  container.innerHTML = `
    <a href="${painelLink}" class="btn btn-outline btn-sm">${painelLabel}</a>
    <div class="avatar" title="${user.name}">${initials(user.name)}</div>
    <button class="btn btn-ghost btn-sm" id="btn-logout">Sair</button>
  `;

  document.getElementById('btn-logout').addEventListener('click', () => Api.logout());
}

function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    links.classList.toggle('nav-links-open');
  });
  document.addEventListener('click', (e) => {
    if (!links.classList.contains('nav-links-open')) return;
    if (links.contains(e.target) || toggle.contains(e.target)) return;
    links.classList.remove('nav-links-open');
  });
}

function markActiveLink() {
  const path = window.location.pathname;
  document.querySelectorAll('#nav-links a').forEach((link) => {
    if (link.getAttribute('href') === path) {
      link.classList.add('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderNavActions();
  initMobileNav();
  markActiveLink();
});
