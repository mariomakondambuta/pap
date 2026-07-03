function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

const shellUser = Api.getUser();
const accountAvatarEl = document.getElementById('account-avatar');
if (accountAvatarEl) {
  accountAvatarEl.textContent = initials(shellUser?.name);
  accountAvatarEl.title = shellUser?.name || '';
  accountAvatarEl.classList.add('avatar-btn');
  accountAvatarEl.setAttribute('role', 'button');
  accountAvatarEl.setAttribute('tabindex', '0');

  const painelLink = shellUser?.role === 'admin' ? '/admin/index.html' : '/painel.html';
  const painelLabel = shellUser?.role === 'admin' ? 'Painel Admin' : 'A minha conta';

  const wrapper = document.createElement('div');
  wrapper.className = 'account-menu';
  accountAvatarEl.parentNode.insertBefore(wrapper, accountAvatarEl);
  wrapper.appendChild(accountAvatarEl);

  const popover = document.createElement('div');
  popover.className = 'account-menu-popover';
  popover.innerHTML = `
    <div class="account-menu-header">
      <div class="account-menu-name">${shellUser?.name || ''}</div>
      <div class="muted account-menu-email">${shellUser?.email || ''}</div>
    </div>
    <a href="${painelLink}" class="account-menu-item">${icon('home', 16)} ${painelLabel}</a>
    <button class="account-menu-item" id="account-menu-logout">${icon('logout', 16)} Sair</button>
  `;
  wrapper.appendChild(popover);

  accountAvatarEl.addEventListener('click', (e) => {
    e.stopPropagation();
    popover.classList.toggle('show');
  });
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) popover.classList.remove('show');
  });
  popover.querySelector('#account-menu-logout').addEventListener('click', () => Api.logout());
}

const shellLogoutBtn = document.getElementById('btn-logout');
if (shellLogoutBtn) shellLogoutBtn.remove();

const appSidebar = document.getElementById('app-sidebar');
const appSidebarBackdrop = document.getElementById('sidebar-backdrop');
const appSidebarToggle = document.getElementById('sidebar-toggle');

function closeAppSidebar() {
  appSidebar?.classList.remove('open');
  appSidebarBackdrop?.classList.remove('show');
}
function openAppSidebar() {
  appSidebar?.classList.add('open');
  appSidebarBackdrop?.classList.add('show');
}

appSidebarToggle?.addEventListener('click', () => {
  if (appSidebar?.classList.contains('open')) closeAppSidebar();
  else openAppSidebar();
});
appSidebarBackdrop?.addEventListener('click', closeAppSidebar);

appSidebar?.querySelectorAll('.app-nav-item').forEach((item) => {
  item.addEventListener('click', closeAppSidebar);
});
