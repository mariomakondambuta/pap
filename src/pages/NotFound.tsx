import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[1180px] flex-col items-center justify-center px-6 text-center">
      <h1>Página não encontrada</h1>
      <p className="text-text-muted">O endereço que procura não existe ou foi movido.</p>
      <Link to="/" className="inline-flex items-center gap-2 rounded-sm bg-primary px-[22px] py-3 font-heading font-semibold text-white shadow-sm hover:bg-primary-dark">
        Voltar ao início
      </Link>
    </div>
  );
}
