import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { btnPrimary } from './ui';

const navLinks = [
  { name: 'Solutions', path: '/solutions' },
  { name: 'Productized Services', path: '/services' },
  { name: 'SaaS Catalog', path: '/saas' },
  { name: 'Deliverables Registry', path: '/registry' },
  { name: 'Verification Portal', path: '/verify' },
  { name: 'Company', path: '/company' },
  { name: 'Contact', path: '/contact' },
];

export const Logo: React.FC = () => (
  <span className="flex items-center gap-3 text-white">
    <span className="text-lg font-extrabold tracking-tight">GP</span>
    <span className="h-5 w-px bg-white/25" />
    <span className="text-sm font-semibold tracking-[0.18em]">GOLDENPAYS <span className="font-normal text-slate-400">LTD</span></span>
  </span>
);

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <nav className={`fixed z-50 w-full border-b transition-all duration-300 ${scrolled || mobileMenuOpen ? 'border-white/10 bg-obsidian/95 py-3 backdrop-blur' : 'border-transparent bg-transparent py-5'}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
        <Link to="/" aria-label="GOLDENPAYS LTD home">
          <Logo />
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `text-sm transition-colors ${isActive ? 'text-accent' : 'text-slate-300 hover:text-white'}`}
            >
              {link.name}
            </NavLink>
          ))}
          <Link to="/services" className={`${btnPrimary} px-4 py-2`}>Explore Live Services</Link>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-white lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="mx-auto max-w-6xl px-6 pt-4 pb-6 lg:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `rounded-md px-3 py-3 text-base ${isActive ? 'bg-white/5 text-accent' : 'text-slate-200 hover:bg-white/5'}`}
              >
                {link.name}
              </NavLink>
            ))}
            <Link to="/services" className={`${btnPrimary} mt-4`}>Explore Live Services</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
