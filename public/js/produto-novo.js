const FORMAT_DESCRIPTIONS = {
  curso: 'Aulas em vídeo organizadas em módulos — ideal para ensinar passo a passo.',
  ebook: 'Um documento completo em PDF sobre um tema, pronto a ler.',
  planilha: 'Uma folha de cálculo com fórmulas, modelos ou ferramentas prontas a usar.',
  template: 'Um modelo pronto a usar — documento, apresentação ou ficheiro de design.',
  pack: 'Um conjunto de vários ficheiros e recursos agrupados num só produto.',
  outro: 'Qualquer outro tipo de ficheiro digital que não se encaixe nas categorias acima.',
};

function typePickerCardHtml(format) {
  return `
    <button class="type-picker-card" data-format="${format}">
      <div class="type-picker-card-icon">${icon(FORMAT_ICONS[format], 24)}</div>
      <h3>${FORMAT_LABELS[format]}</h3>
      <p class="muted">${FORMAT_DESCRIPTIONS[format]}</p>
    </button>
  `;
}

const grid = document.getElementById('type-picker-grid');
grid.innerHTML = Object.keys(FORMAT_LABELS).map(typePickerCardHtml).join('');
grid.querySelectorAll('.type-picker-card').forEach((card) => {
  card.addEventListener('click', () => {
    window.location.href = `/produto-editar.html?formato=${card.dataset.format}`;
  });
});
