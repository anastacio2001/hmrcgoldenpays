import React, { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from './Navbar';
import { Spinner } from '../pages/admin/ui';

const menuItems = [
  { name: 'Dashboard', path: '/admin/dashboard' },
  { name: 'Inquiries', path: '/admin/inquiries' },
  { name: 'Clients', path: '/admin/clients' },
  { name: 'Projects', path: '/admin/projects' },
  { name: 'Payments', path: '/admin/payments' },
  { name: 'Deliverables', path: '/admin/deliverables' },
  { name: 'Settings', path: '/admin/settings' },
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
    <div className="min-h-screen bg-slate-100 lg:flex">
      <aside className={`${menuOpen ? 'block' : 'hidden'} bg-obsidian text-slate-300 lg:fixed lg:flex lg:h-full lg:w-60 lg:flex-col`}>
        <div className="hidden border-b border-white/10 p-6 lg:block">
          <Link to="/"><Logo /></Link>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-slate-500">Admin</p>
        </div>
        <nav className="flex-1 p-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `block rounded-md px-4 py-2.5 text-sm transition ${isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'}`}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4 text-sm">
          <p className="truncate text-white">{user?.email}</p>
          <button onClick={handleLogout} className="mt-1 text-xs text-slate-400 hover:text-white">Sign out</button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between bg-obsidian px-4 py-3 lg:hidden">
        <Logo />
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-sm text-white" aria-expanded={menuOpen}>
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      <main className="flex-1 p-4 sm:p-8 lg:ml-60">
        <Suspense fallback={<Spinner />}>{children}</Suspense>
      </main>
    </div>
  );
};

export default AdminLayout;
