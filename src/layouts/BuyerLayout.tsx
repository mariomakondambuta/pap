import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { ThemeContext } from '../lib/theme';
import { AccountMenu } from '../components/AccountMenu';
import { Icon } from '../lib/icons';

const NAV_ITEMS = [
  { to: '/painel', label: 'Início', icon: 'home', end: true },
  { to: '/painel/compras', label: 'Minhas compras', icon: 'book-open' },
  { to: '/painel/certificados', label: 'Certificados', icon: 'award' },
  { to: '/painel/canceladas', label: 'Canceladas/Reembolsos', icon: 'refresh-ccw' },
  { to: '/painel/conta', label: 'Minha conta', icon: 'users' },
];

export function BuyerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeContext.Provider value="buyer">
      <div className="min-h-screen bg-bg-alt">
        <header className="sticky top-0 z-[80] flex h-[58px] items-center justify-between gap-3 border-b border-border bg-white px-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <button className="flex h-9 w-9 items-center justify-center rounded-sm text-text-muted hover:bg-bg-alt md:hidden" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
              <Icon name="menu" size={20} />
            </button>
            <Link to="/painel" className="font-heading text-lg font-bold text-text">
              Edu<span className="text-text-muted">Web</span>
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <Link to="/negocio" className="inline-flex items-center gap-2 rounded-full bg-dark px-[18px] py-2.5 font-heading text-[0.85rem] font-semibold text-white hover:bg-black">
              <Icon name="briefcase" size={16} /> Gerenciar meu negócio
            </Link>
            <AccountMenu crossLink={{ to: '/negocio', label: 'Gerenciar meu negócio', icon: 'briefcase' }} />
          </div>
        </header>

        <div className="flex items-start">
          {sidebarOpen && <div className="fixed inset-0 top-[58px] z-[65] bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />}
          <aside
            className={`fixed top-[58px] bottom-0 left-0 z-[70] w-[264px] max-w-[82vw] overflow-y-auto border-r border-border bg-white p-3 transition-transform md:sticky md:h-[calc(100vh-58px)] md:translate-x-0 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <nav className="flex flex-col gap-0.5">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[0.92rem] font-medium ${
                      isActive ? 'bg-primary-light text-primary' : 'text-text-muted hover:bg-bg-alt'
                    }`
                  }
                >
                  <Icon name={item.icon} size={18} />
                  {item.label}
                </NavLink>
              ))}
              <Link to="/explorar" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[0.92rem] font-medium text-text-muted hover:bg-bg-alt">
                <Icon name="plus" size={18} />
                Comprar um produto
              </Link>
            </nav>
          </aside>

          <main className="w-full min-w-0 flex-1 px-4 pt-5 pb-[70px] md:px-10 md:pt-8">
            <Outlet />
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
