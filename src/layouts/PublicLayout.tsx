import { Outlet } from 'react-router-dom';
import { ThemeContext } from '../lib/theme';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';

export function PublicLayout() {
  return (
    <ThemeContext.Provider value="public">
      <PublicNavbar />
      <Outlet />
      <Footer />
    </ThemeContext.Provider>
  );
}
