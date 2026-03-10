import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Company } from '../types';

interface AppState {
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Auth
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  login: (user: User, company: Company) => void;
  logout: () => void;

  // Inbox
  activeConversationId: string | null;
  setActiveConversation: (id: string | null) => void;
  inboxFilter: 'all' | 'open' | 'resolved' | 'pending' | 'bot';
  setInboxFilter: (filter: AppState['inboxFilter']) => void;

  // Notifications
  notifications: number;
  setNotifications: (count: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'light',
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Auth
      user: null,
      company: null,
      isAuthenticated: false,
      login: (user, company) => set({ user, company, isAuthenticated: true }),
      logout: () => set({ user: null, company: null, isAuthenticated: false }),

      // Inbox
      activeConversationId: 'conv1',
      setActiveConversation: (id) => set({ activeConversationId: id }),
      inboxFilter: 'all',
      setInboxFilter: (filter) => set({ inboxFilter: filter }),

      // Notifications
      notifications: 0,
      setNotifications: (count) => set({ notifications: count })
    }),
    {
      name: 'whatsapp-crm-store',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        user: state.user,
        company: state.company,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      }
    }
  )
);