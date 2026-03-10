import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  SunIcon,
  MoonIcon,
  BellIcon,
  SearchIcon,
  ChevronDownIcon,
  LogOutIcon,
  UserIcon,
  SettingsIcon
} from
  'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Avatar } from '../ui/Avatar';
import { clearClientJwtCookies, logoutUser } from '../../pages/auth/authApi';
const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/inbox': 'Team Inbox',
  '/contacts': 'Contacts & CRM',
  '/orders': 'Orders',
  '/products': 'Products',
  '/inventory': 'Inventory',
  '/broadcast': 'Broadcast & Campaigns',
  '/automation': 'Automation Builder',
  '/analytics': 'Analytics',
  '/whatsapp-setup': 'WhatsApp Setup',
  '/team': 'Team Management',
  '/billing': 'Billing & Plans',
  '/settings': 'Settings'
};
export function Topbar() {
  const { theme, toggleTheme, user, notifications, logout } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pageTitle =
    Object.entries(pageTitles).find(
      ([path]) =>
        location.pathname === path || location.pathname.startsWith(path + '/')
    )?.[1] || 'Dashboard';

  const handleSignOut = async () => {
    await logoutUser();
    clearClientJwtCookies();

    window.sessionStorage.clear();
    window.localStorage.clear();

    logout();
    setShowUserMenu(false);
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-5 bg-[var(--bg-primary)] border-b border-[var(--border-color)] z-20">
      {/* Left: Page title */}
      <div>
        <h1 className="text-base font-semibold text-[var(--text-primary)]">
          {pageTitle}
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
          aria-label="Search">

          <SearchIcon size={16} />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
          aria-label="Toggle theme">

          {theme === 'light' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
        </button>

        {/* Notifications */}
        <button
          className="relative w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
          aria-label="Notifications">

          <BellIcon size={16} />
          {notifications > 0 &&
            <span className="absolute top-1 right-1 w-2 h-2 bg-brand-green rounded-full" />
          }
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-[var(--border-color)] mx-1" />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">

            <Avatar
              src={user?.avatar}
              name={user?.name || 'User'}
              size="sm"
              status={user?.status} />

            <div className="hidden sm:block text-left min-w-0 max-w-[160px]">
              <p
                className="text-xs font-medium text-[var(--text-primary)] leading-tight truncate"
                title={user?.name || 'User'}>
                {user?.name}
              </p>
              <p className="text-xs text-[var(--text-muted)] capitalize leading-tight">
                {user?.role}
              </p>
            </div>
            <ChevronDownIcon
              size={14}
              className="text-[var(--text-muted)] hidden sm:block" />

          </button>

          {showUserMenu &&
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)} />

              <div className="absolute right-0 top-full mt-1 w-64 max-w-[calc(100vw-1rem)] bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-modal z-20 py-1 animate-fade-in">
                <div className="px-3 py-2 border-b border-[var(--border-color)]">
                  <p
                    className="text-sm font-medium text-[var(--text-primary)] truncate"
                    title={user?.name || 'User'}>
                    {user?.name}
                  </p>
                  <p
                    className="text-xs text-[var(--text-muted)] break-all"
                    title={user?.email || ''}>
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigate('/settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors">

                  <UserIcon size={14} /> Profile
                </button>
                <button
                  onClick={() => {
                    navigate('/settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors">

                  <SettingsIcon size={14} /> Settings
                </button>
                <div className="border-t border-[var(--border-color)] mt-1 pt-1">
                  <button
                    onClick={() => {
                      void handleSignOut();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">

                    <LogOutIcon size={14} /> Sign out
                  </button>
                </div>
              </div>
            </>
          }
        </div>
      </div>
    </header>);

}