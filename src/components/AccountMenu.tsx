import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Icon } from '../lib/icons';

function initials(name?: string) {
  if (!name) return '?';
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

interface CrossLink {
  to: string;
  label: string;
  icon: string;
}

export function AccountMenu({ dark = false, crossLink }: { dark?: boolean; crossLink?: CrossLink }) {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const homeLink = isAdmin ? '/admin' : '/painel';
  const homeLabel = isAdmin ? 'Painel Admin' : 'A minha conta';

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        title={user?.name}
        className={`flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full font-heading text-[0.78rem] font-semibold ${
          dark ? 'bg-white text-dark' : 'bg-primary text-white'
        }`}
      >
        {initials(user?.name)}
      </button>
      {open && (
        <div className="absolute top-[calc(100%+10px)] right-0 z-[200] min-w-[220px] rounded-xl border border-border bg-white p-1.5 shadow-lg">
          <div className="mb-1.5 border-b border-border px-3 pt-2.5 pb-2">
            <div className="text-[0.9rem] font-semibold">{user?.name}</div>
            <div className="break-all text-[0.78rem] text-text-muted">{user?.email}</div>
          </div>
          <Link to={homeLink} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[0.88rem] text-text hover:bg-bg-alt" onClick={() => setOpen(false)}>
            <Icon name="home" size={16} /> {homeLabel}
          </Link>
          {crossLink && (
            <Link to={crossLink.to} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[0.88rem] text-text hover:bg-bg-alt" onClick={() => setOpen(false)}>
              <Icon name={crossLink.icon} size={16} /> {crossLink.label}
            </Link>
          )}
          <button
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[0.88rem] text-text hover:bg-bg-alt"
          >
            <Icon name="logout" size={16} /> Sair
          </button>
        </div>
      )}
    </div>
  );
}
