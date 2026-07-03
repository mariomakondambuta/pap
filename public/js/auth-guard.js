(function guard() {
  const requiresAdmin = document.body.dataset.requireAdmin === 'true';

  if (!Api.isAuthenticated()) {
    window.location.href = '/login.html';
    return;
  }
  if (requiresAdmin && !Api.isAdmin()) {
    window.location.href = '/painel.html';
  }
})();
