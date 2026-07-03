const Api = (() => {
  const TOKEN_KEY = 'eduweb_token';
  const USER_KEY = 'eduweb_user';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function isAuthenticated() {
    return Boolean(getToken());
  }

  function isAdmin() {
    return getUser()?.role === 'admin';
  }

  async function request(path, { method = 'GET', body, isFormData = false } = {}) {
    const headers = {};
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    if (!isFormData && body !== undefined) headers['Content-Type'] = 'application/json';

    const res = await fetch(`/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    });

    let data = null;
    try {
      data = await res.json();
    } catch (err) {
      data = null;
    }

    if (!res.ok) {
      const message = data?.error || 'Ocorreu um erro. Tente novamente.';
      throw new Error(message);
    }
    return data;
  }

  function logout() {
    clearSession();
    window.location.href = '/login.html';
  }

  return { getToken, getUser, setSession, clearSession, isAuthenticated, isAdmin, request, logout };
})();
