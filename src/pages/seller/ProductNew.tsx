import { useNavigate } from 'react-router-dom';
import { Icon } from '../../lib/icons';
import { FORMAT_LABELS, FORMAT_ICONS } from '../../lib/format';

const FORMAT_DESCRIPTIONS: Record<string, string> = {
  curso: 'Aulas em vídeo organizadas em módulos — ideal para ensinar passo a passo.',
  ebook: 'Um documento completo em PDF sobre um tema, pronto a ler.',
  planilha: 'Uma folha de cálculo com fórmulas, modelos ou ferramentas prontas a usar.',
  template: 'Um modelo pronto a usar — documento, apresentação ou ficheiro de design.',
  pack: 'Um conjunto de vários ficheiros e recursos agrupados num só produto.',
  outro: 'Qualquer outro tipo de ficheiro digital que não se encaixe nas categorias acima.',
};

export function ProductNew() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-[960px]">
      <div className="mb-6">
        <h1>O que vai vender?</h1>
        <p className="mb-0 text-text-muted">Escolha o formato do seu produto. Poderá editar todos os detalhes a seguir.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.keys(FORMAT_LABELS).map((format) => (
          <button
            key={format}
            onClick={() => navigate(`/produto/editar?formato=${format}`)}
            className="flex flex-col gap-2.5 rounded-md border border-border bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-text hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-bg-alt">
              <Icon name={FORMAT_ICONS[format]} size={24} />
            </div>
            <h3 className="mb-0.5">{FORMAT_LABELS[format]}</h3>
            <p className="mb-0 text-[0.9rem] text-text-muted">{FORMAT_DESCRIPTIONS[format]}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
