import { Link, Outlet } from 'react-router-dom';
import { ThemeContext } from '../lib/theme';
import { useAuth } from '../auth/AuthContext';
import { AccountMenu } from '../components/AccountMenu';

/** Bare topbar (logo + account menu only), used for checkout flow pages. */
export function MinimalLayout() {
  const { isAuthenticated } = useAuth();
  return (
    <ThemeContext.Provider value="public">
      <nav className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4">
          <Link to="/" className="font-heading text-lg font-bold text-text">
            Edu<span className="text-text-muted">Web</span>
          </Link>
          {isAuthenticated && <AccountMenu />}
        </div>
      </nav>
      <Outlet />
    </ThemeContext.Provider>
  );
}
