function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function certificateCardHtml(cert) {
  const issuedDate = new Date(cert.issued_at).toLocaleDateString('pt-PT', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  return `
    <div class="card">
      <div style="color:var(--color-accent); margin-bottom:8px;">${icon('award', 32)}</div>
      <h3>${escapeHtml(cert.product_title)}</h3>
      <p style="font-size:0.85rem;">Emitido em ${issuedDate}</p>
      <p class="muted" style="font-size:0.8rem; margin-bottom:16px;">Código: ${cert.certificate_code}</p>
      <button class="btn btn-primary btn-block" data-code="${cert.certificate_code}">Descarregar PDF</button>
    </div>
  `;
}

async function downloadCertificate(code, btn) {
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'A gerar...';
  try {
    const res = await fetch(`/api/certificates/${code}/download`, {
      headers: { Authorization: `Bearer ${Api.getToken()}` },
    });
    if (!res.ok) throw new Error('Não foi possível gerar o certificado.');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificado-${code}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

async function loadCertificates() {
  const container = document.getElementById('certificates-list');
  try {
    const { certificates } = await Api.request('/certificates/me');
    if (certificates.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="icon">${icon('award', 32)}</div>
          Ainda não concluiu nenhum produto.
          <div style="margin-top:16px;"><a href="/painel.html" class="btn btn-primary">Continuar a aprender</a></div>
        </div>`;
      return;
    }
    container.innerHTML = certificates.map(certificateCardHtml).join('');
    container.querySelectorAll('button[data-code]').forEach((btn) => {
      btn.addEventListener('click', () => downloadCertificate(btn.dataset.code, btn));
    });
  } catch (err) {
    container.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">Não foi possível carregar os certificados.</div>`;
  }
}

loadCertificates();
