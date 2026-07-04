import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { ThemeContext } from '../lib/theme';
import { AccountMenu } from '../components/AccountMenu';
import { Icon } from '../lib/icons';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: 'home', end: true },
  { to: '/admin/produtos', label: 'Produtos', icon: 'package' },
  { to: '/admin/transacoes', label: 'Transações', icon: 'card' },
  { to: '/admin/levantamentos', label: 'Levantamentos', icon: 'wallet' },
  { to: '/admin/utilizadores', label: 'Utilizadores', icon: 'users' },
  { to: '/admin/definicoes', label: 'Definições', icon: 'sliders' },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeContext.Provider value="public">
      <div className="min-h-screen bg-bg-alt">
        <header className="sticky top-0 z-[80] flex h-[58px] items-center justify-between gap-3 bg-dark px-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <button className="flex h-9 w-9 items-center justify-center rounded-sm text-[#cfcfcf] hover:bg-white/10 md:hidden" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
              <Icon name="menu" size={20} />
            </button>
            <Link to="/admin" className="font-heading text-lg font-bold text-white">
              Edu<span className="text-[#9a9a9a]">Web</span>
            </Link>
            <span className="rounded-full border border-transparent bg-white/10 px-2.5 py-1 text-xs font-semibold text-white">Admin</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Link to="/" className="text-[0.85rem] font-medium text-[#cfcfcf] hover:text-white">Ver site</Link>
            <AccountMenu dark />
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
                      isActive ? 'bg-bg-alt text-text shadow-sm' : 'text-[#4a4a4a] hover:bg-bg-alt'
                    }`
                  }
                >
                  <Icon name={item.icon} size={18} />
                  {item.label}
                </NavLink>
              ))}
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
