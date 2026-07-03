if (Api.isAuthenticated()) {
  window.location.href = Api.isAdmin() ? '/admin/index.html' : '/painel.html';
}

const form = document.getElementById('register-form');
const alertBox = document.getElementById('alert-error');
const submitBtn = document.getElementById('submit-btn');

function showError(message) {
  alertBox.textContent = message;
  alertBox.classList.add('show');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  alertBox.classList.remove('show');
  submitBtn.disabled = true;
  submitBtn.textContent = 'A criar conta...';

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const { token, user } = await Api.request('/auth/register', { method: 'POST', body: { name, email, password } });
    Api.setSession(token, user);
    window.location.href = '/painel.html';
  } catch (err) {
    showError(err.message);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Criar conta';
  }
});
