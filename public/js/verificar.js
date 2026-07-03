function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

const form = document.getElementById('verify-form');
const resultEl = document.getElementById('verify-result');

const prefill = new URLSearchParams(window.location.search).get('codigo');
if (prefill) document.getElementById('code').value = prefill;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = document.getElementById('code').value.trim().toUpperCase();
  resultEl.innerHTML = '<div class="spinner"></div>';

  try {
    const res = await fetch(`/api/certificates/verify/${encodeURIComponent(code)}`);
    const data = await res.json();

    if (!res.ok || !data.valid) {
      resultEl.innerHTML = `<div class="alert alert-error show">Certificado não encontrado. Verifique o código introduzido.</div>`;
      return;
    }

    const cert = data.certificate;
    const issuedDate = new Date(cert.issued_at).toLocaleDateString('pt-PT', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

    resultEl.innerHTML = `
      <div class="alert alert-success show">✓ Certificado válido</div>
      <div class="card" style="padding:20px;">
        <p style="margin-bottom:6px;"><strong>Aluno:</strong> ${escapeHtml(cert.student_name)}</p>
        <p style="margin-bottom:6px;"><strong>Produto:</strong> ${escapeHtml(cert.product_title)}</p>
        <p style="margin-bottom:0;"><strong>Emitido em:</strong> ${issuedDate}</p>
      </div>
    `;
  } catch (err) {
    resultEl.innerHTML = `<div class="alert alert-error show">Erro ao verificar o certificado. Tente novamente.</div>`;
  }
});

if (prefill) form.requestSubmit();
