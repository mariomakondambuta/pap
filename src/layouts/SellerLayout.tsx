import { useRef, useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../lib/theme';
import { AccountMenu } from '../components/AccountMenu';
import { Icon } from '../lib/icons';

const NAV_ITEMS = [
  { to: '/negocio', label: 'Home', icon: 'home', end: true },
  { to: '/negocio/produtos', label: 'Produtos', icon: 'briefcase' },
  { to: '/negocio/vendas', label: 'Vendas', icon: 'bar-chart' },
  { to: '/negocio/carteira', label: 'Carteira', icon: 'wallet' },
];

export function SellerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return;
    const term = searchRef.current?.value.trim() || '';
    navigate(`/negocio/produtos${term ? `?q=${encodeURIComponent(term)}` : ''}`);
  }

  return (
    <ThemeContext.Provider value="seller">
      <div className="min-h-screen bg-bg-alt">
        <header className="sticky top-0 z-[80] grid h-12 grid-cols-[auto_1fr_auto] items-center gap-2.5 bg-dark px-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <button className="flex h-[30px] w-[30px] items-center justify-center rounded-sm text-[#cfcfcf] hover:bg-white/10 md:hidden" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
              <Icon name="menu" size={20} />
            </button>
            <Link to="/negocio" className="font-heading text-[0.95rem] font-bold text-white">
              Edu<span className="text-[#9a9a9a]">Web</span>
            </Link>
          </div>
          <div className="flex justify-center">
            <label className="flex h-8 w-full max-w-[460px] items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3">
              <Icon name="search" size={14} className="flex-shrink-0 text-[#9a9a9a]" />
              <input ref={searchRef} type="search" placeholder="Pesquisar" onKeyDown={handleSearchKeyDown} className="h-full flex-1 border-0 bg-transparent text-[0.8rem] text-white placeholder:text-[#9a9a9a] focus:outline-none" />
            </label>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <button className="flex h-[30px] w-[30px] items-center justify-center rounded-sm text-[#cfcfcf] hover:bg-white/10" onClick={() => setBellOpen((v) => !v)} aria-label="Notificações">
                <Icon name="bell" size={18} />
              </button>
              {bellOpen && (
                <div className="absolute top-[calc(100%+8px)] right-0 z-[200] min-w-[210px] rounded-xl bg-white p-3.5 text-center text-[0.8rem] text-text shadow-lg">
                  Sem notificações no momento.
                </div>
              )}
            </div>
            <AccountMenu dark crossLink={{ to: '/painel', label: 'Voltar à minha conta', icon: 'shopping-bag' }} />
          </div>
        </header>

        <div className="flex items-start">
          {sidebarOpen && <div className="fixed inset-0 top-12 z-[65] bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />}
          <aside
            className={`fixed top-12 bottom-0 left-0 z-[70] w-[264px] max-w-[82vw] overflow-y-auto border-r border-border bg-white p-3 transition-transform md:sticky md:h-[calc(100vh-48px)] md:translate-x-0 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <nav className="flex flex-col gap-px">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[0.82rem] font-medium ${
                      isActive ? 'bg-white text-text shadow-sm' : 'text-[#4a4a4a] hover:bg-black/5'
                    }`
                  }
                >
                  <Icon name={item.icon} size={16} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <main className="w-full min-w-0 flex-1 px-4 pt-5 pb-[60px] md:px-7 md:pt-6">
            <Outlet />
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
