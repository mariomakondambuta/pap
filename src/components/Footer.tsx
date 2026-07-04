import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-20 bg-dark py-14 pb-7 text-[#b0b0b0]">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-8 px-6 sm:grid-cols-[2fr_1fr_1fr]">
        <div>
          <div className="mb-3 font-heading text-lg font-bold text-white">
            Edu<span className="text-[#9a9a9a]">Web</span>
          </div>
          <p className="text-[#b0b0b0]">O marketplace onde produtores vendem infoprodutos e alunos aprendem ao seu ritmo, com pagamentos seguros.</p>
        </div>
        <div>
          <h4 className="mb-3.5 text-base text-white">Plataforma</h4>
          <div className="flex flex-col gap-2">
            <Link to="/cursos" className="text-[0.9rem] hover:text-white">Explorar produtos</Link>
            <Link to="/precos" className="text-[0.9rem] hover:text-white">Preços</Link>
            <Link to="/registar" className="text-[0.9rem] hover:text-white">Criar conta</Link>
            <Link to="/login" className="text-[0.9rem] hover:text-white">Entrar</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3.5 text-base text-white">Suporte</h4>
          <div className="flex flex-col gap-2">
            <Link to="/verificar" className="text-[0.9rem] hover:text-white">Verificar certificado</Link>
            <a href="mailto:suporte@eduweb.com" className="text-[0.9rem] hover:text-white">Contacto</a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-[1180px] border-t border-white/10 px-6 pt-5 text-center text-[0.82rem] text-[#8a8a8a]">
        &copy; 2026 EduWeb. Projeto desenvolvido no âmbito da Prova de Aptidão Profissional (PAP).
      </div>
    </footer>
  );
}
