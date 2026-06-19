import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Menu, X, LogIn, LogOut, User, Bell, Shield } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  user: any; // User object from Firebase auth
  isAdmin: boolean;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onDashboardClick: () => void;
  onNotifToggle: () => void;
  unreadNotifsCount: number;
  activeSection: string;
  onSectionSelect: (section: string) => void;
}

export default function Header({
  darkMode,
  onToggleDarkMode,
  user,
  isAdmin,
  onLoginClick,
  onLogoutClick,
  onDashboardClick,
  onNotifToggle,
  unreadNotifsCount,
  activeSection,
  onSectionSelect
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sections = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'profil', label: 'Profil' },
    { id: 'mahasiswa', label: 'Mahasiswa' },
    { id: 'galeri', label: 'Galeri' },
    { id: 'memories', label: 'Memories' },
    { id: 'buku-tamu', label: 'Buku Tamu' },
    { id: 'chat', label: 'Lounge Chat' }
  ];

  const handleNavClick = (id: string) => {
    onSectionSelect(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-white/80 dark:bg-[#03140e]/90 backdrop-blur-md shadow-sm border-b border-[#113e31] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('beranda')}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="brand-mark w-9 h-9 rounded-full flex items-center justify-center text-gold-soft font-display font-extrabold text-lg">
            ☾
          </div>
          <span className="font-display font-black text-emerald-deep dark:text-cream-soft tracking-tight text-sm sm:text-base">
            PAI D <em className="not-italic text-gold-classic font-bold">IMMORTAL</em>
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Navigasi Desktop">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => handleNavClick(sec.id)}
              className={`text-xs font-semibold relative py-1 transition-colors cursor-pointer ${
                activeSection === sec.id
                  ? 'text-emerald-medium dark:text-gold-classic font-bold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-emerald-deep dark:hover:text-cream-soft'
              }`}
            >
              {sec.label}
              {activeSection === sec.id && (
                <motion.div
                  layoutId="activeUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-medium dark:bg-gold-classic"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Topbar Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Notifications Icon with Badge */}
          <button
            onClick={onNotifToggle}
            className="relative p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 text-emerald-medium dark:text-zinc-400 hover:text-emerald-deep dark:hover:text-cream-soft transition-colors cursor-pointer"
            aria-label="Tonton aktivitas terbaru"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 text-emerald-medium dark:text-zinc-400 hover:text-emerald-deep dark:hover:text-cream-soft transition-colors cursor-pointer"
            aria-label="Toggle tema gelap/terang"
          >
            {darkMode ? <Sun className="w-4 h-4 text-gold-classic" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Sign In and Auth Portal */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-emerald-medium/10 pr-1">
              {isAdmin && (
                <span className="flex items-center gap-1 text-[10px] bg-gold-classic/20 text-gold-classic font-bold px-2 py-0.5 rounded-full border border-gold-classic/20">
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
              )}
              <button
                onClick={onDashboardClick}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors cursor-pointer text-xs"
                title={`${user.displayName || 'Akun'} - Klik untuk buka Dashboard`}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full border border-gold-classic/30 object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-medium/20 text-emerald-deep dark:text-gold-soft flex items-center justify-center font-bold text-[10px] border border-gold-classic/20">
                    {user.displayName ? user.displayName.substring(0, 1).toUpperCase() : <User className="w-3 h-3" />}
                  </div>
                )}
                <span className="hidden lg:inline text-xs font-semibold text-emerald-deep dark:text-zinc-300 max-w-[100px] truncate">
                  {user.displayName?.split(' ')[0] || 'User'}
                </span>
              </button>

              <button
                onClick={onLogoutClick}
                className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/20 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full btn-primary text-white text-xs font-semibold cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 md:hidden rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 text-emerald-deep dark:text-zinc-400 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-emerald-deep/95 border-t border-emerald-medium/10 shadow-lg"
          >
            <div className="px-2 pt-2 pb-4 space-y-1">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => handleNavClick(sec.id)}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === sec.id
                      ? 'bg-emerald-medium/10 dark:bg-gold-classic/10 text-emerald-medium dark:text-gold-classic font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-emerald-deep dark:hover:text-cream-soft'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
