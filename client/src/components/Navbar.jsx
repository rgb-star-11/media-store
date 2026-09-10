import React, { useState, useEffect, useRef } from 'react';
import { UserCircle, Menu, X, Search } from 'lucide-react';

export default function Navbar({ onOpenAuth, settings, onSearch }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [userName, setUserName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    const token = localStorage.getItem('auth_token');
    const name = localStorage.getItem('user_name');
    if (token && name) setUserName(name);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const handleNavClick = (e, path) => {
    if (path && path.startsWith('#')) {
      e.preventDefault();
      setMenuOpen(false);
      const target = document.querySelector(path);
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    onSearch && onSearch(val);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchValue('');
    onSearch && onSearch('');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // scroll to gallery when searching
    const gallery = document.querySelector('#gallery') || document.querySelector('[id]');
    if (gallery) {
      const top = gallery.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  if (!settings) return null;

  return (
    <nav className={`fixed w-full z-40 top-0 transition-all duration-300 ${isScrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/5 py-4' : 'bg-gradient-to-b from-black/80 to-transparent py-6'}`} dir="rtl">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">

        {/* Logo */}
        <a href="#" onClick={(e) => handleNavClick(e, '#')} className="flex items-center gap-3 shrink-0">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.siteName} className="h-10 w-auto object-contain" />
          ) : (
            <span className="text-amber-500 font-black text-2xl tracking-tight">{settings.siteName || 'استودیو'}</span>
          )}
        </a>

        {/* Search Bar (expands) */}
        {searchOpen ? (
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 bg-zinc-900/90 border border-zinc-700 rounded-full px-4 py-2 backdrop-blur-md">
            <Search size={16} className="text-amber-500 shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="جستجو با هشتگ یا عنوان... مثال: #طبیعت"
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder-zinc-500"
              dir="rtl"
            />
            <button type="button" onClick={handleSearchClose} className="text-zinc-400 hover:text-white transition shrink-0">
              <X size={16} />
            </button>
          </form>
        ) : (
          <>
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6 flex-1">
              <ul className="flex items-center gap-6">
                {settings.navLinks?.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.path}
                      onClick={(e) => handleNavClick(e, link.path)}
                      className="text-sm font-bold text-zinc-300 hover:text-amber-400 transition"
                    >
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {/* Search Icon */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-zinc-400 hover:text-amber-400 transition"
                title="جستجو"
              >
                <Search size={20} />
              </button>

              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 bg-zinc-900/80 hover:bg-amber-500 hover:text-black text-zinc-300 px-4 py-2 rounded-full border border-zinc-700/50 transition backdrop-blur-md"
              >
                <UserCircle size={18} />
                <span className="text-sm font-bold">{userName ? 'پنل کاربری' : 'ورود / ثبت‌نام'}</span>
              </button>
            </div>
          </>
        )}

        {/* Mobile Buttons */}
        {!searchOpen && (
          <div className="flex md:hidden items-center gap-2">
            <button onClick={() => setSearchOpen(true)} className="p-2 text-zinc-400 hover:text-amber-400">
              <Search size={20} />
            </button>
            <button onClick={onOpenAuth} className="p-2 text-zinc-300 hover:text-amber-400">
              <UserCircle size={22} />
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-zinc-300 hover:text-amber-400">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && !searchOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-zinc-800 px-6 py-4" dir="rtl">
          <ul className="space-y-3">
            {settings.navLinks?.map((link, idx) => (
              <li key={idx}>
                <a
                  href={link.path}
                  onClick={(e) => handleNavClick(e, link.path)}
                  className="block text-sm font-bold text-zinc-300 hover:text-amber-400 transition py-2"
                >
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
