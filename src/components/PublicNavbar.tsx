import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AccountMenu } from './AccountMenu';
import { LinkButton } from './LinkButton';
import { Icon } from '../lib/icons';

export function PublicNavbar() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    { to: isAuthenticated ? '/painel' : '/', label: 'Início' },
    { to: isAuthenticated ? '/explorar' : '/cursos', label: 'Explorar' },
    { to: '/precos', label: 'Preços' },
    { to: '/verificar', label: 'Verificar Certificado' },
  ];

  return (
    <nav className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4">
        <Link to="/" className="font-heading text-lg font-bold text-text">
          Edu<span className="text-text-muted">Web</span>
        </Link>
        <ul className={`${open ? 'flex' : 'hidden'} absolute top-full left-0 w-full flex-col gap-1 border-b border-border bg-white px-6 py-2 md:static md:flex md:w-auto md:flex-row md:gap-7 md:border-0 md:bg-transparent md:p-0`}>
          {links.map((l) => (
            <li key={l.label} className="border-b border-border py-3 last:border-0 md:border-0 md:py-0">
              <NavLink to={l.to} end={l.to === '/'} className={({ isActive }) => `text-[0.92rem] font-medium ${isActive ? 'text-primary' : 'text-text'} hover:text-primary`}>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <AccountMenu />
          ) : (
            <>
              <LinkButton to="/login" variant="ghost" size="sm">Entrar</LinkButton>
              <LinkButton to="/registar" variant="primary" size="sm">Começar grátis</LinkButton>
            </>
          )}
        </div>
        <button className="md:hidden" aria-label="Abrir menu" onClick={() => setOpen((v) => !v)}>
          <Icon name="menu" size={20} />
        </button>
      </div>
    </nav>
  );
}
