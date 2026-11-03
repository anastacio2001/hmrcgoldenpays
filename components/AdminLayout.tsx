import React, { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from './Navbar';
import { Spinner } from '../pages/admin/ui';

const menuGroups = [
  {
    heading: null,
    items: [
      { name: 'Dashboard', path: '/admin/dashboard' },
      { name: 'Inquiries', path: '/admin/inquiries' },
      { name: 'Clients', path: '/admin/clients' },
      { name: 'Projects', path: '/admin/projects' },
      { name: 'Payments', path: '/admin/payments' },
      { name: 'Deliverables', path: '/admin/deliverables' },
    ],
  },
  {
    heading: 'Internal',
    items: [
      { name: 'Finances', path: '/admin/finances' },
      { name: 'Documents', path: '/admin/documents' },
      { name: 'Compliance', path: '/admin/compliance' },
    ],
  },
  { heading: null, items: [{ name: 'Settings', path: '/admin/settings' }] },
];

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [location]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 lg:flex print:bg-white">
      <aside className={`${menuOpen ? 'block' : 'hidden'} print:hidden bg-obsidian text-slate-300 lg:fixed lg:flex lg:h-full lg:w-60 lg:flex-col`}>
        <div className="hidden border-b border-white/10 p-6 lg:block">
          <Link to="/"><Logo /></Link>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-slate-500">Admin</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          {menuGroups.map((group, i) => (
            <div key={i} className={i > 0 ? 'mt-4 border-t border-white/10 pt-4' : ''}>
              {group.heading && (
                <p className="mb-1 px-4 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">{group.heading}</p>
              )}
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `block rounded-md px-4 py-2.5 text-sm transition ${isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'}`}
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4 text-sm">
          <p className="truncate text-white">{user?.email}</p>
          <button onClick={handleLogout} className="mt-1 text-xs text-slate-400 hover:text-white">Sign out</button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between bg-obsidian px-4 py-3 lg:hidden print:hidden">
        <Logo />
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-sm text-white" aria-expanded={menuOpen}>
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      <main className="flex-1 p-4 sm:p-8 lg:ml-60 print:m-0 print:p-0">
        <Suspense fallback={<Spinner />}>{children}</Suspense>
      </main>
    </div>
  );
};

export default AdminLayout;
