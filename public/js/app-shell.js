function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

const shellUser = Api.getUser();
const accountAvatarEl = document.getElementById('account-avatar');
if (accountAvatarEl) {
  accountAvatarEl.textContent = initials(shellUser?.name);
  accountAvatarEl.title = shellUser?.name || '';
}

const shellLogoutBtn = document.getElementById('btn-logout');
if (shellLogoutBtn) shellLogoutBtn.addEventListener('click', () => Api.logout());

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
