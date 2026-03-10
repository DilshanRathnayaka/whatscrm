import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboardIcon,
  MessageSquareIcon,
  UsersIcon,
  PackageIcon,
  ShoppingCartIcon,
  MegaphoneIcon,
  ZapIcon,
  BarChart3Icon,
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhoneIcon,
  ArchiveIcon,
  CreditCardIcon,
  HelpCircleIcon,
  BoxIcon } from
'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Avatar } from '../ui/Avatar';
interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  group?: string;
}
const navItems: NavItem[] = [
{
  path: '/dashboard',
  label: 'Dashboard',
  icon: <LayoutDashboardIcon size={18} />,
  group: 'main'
},
{
  path: '/inbox',
  label: 'Inbox',
  icon: <MessageSquareIcon size={18} />,
  group: 'main'
},
{
  path: '/contacts',
  label: 'Contacts',
  icon: <UsersIcon size={18} />,
  group: 'main'
},
{
  path: '/orders',
  label: 'Orders',
  icon: <ShoppingCartIcon size={18} />,
  group: 'commerce'
},
{
  path: '/products',
  label: 'Products',
  icon: <PackageIcon size={18} />,
  group: 'commerce'
},
{
  path: '/inventory',
  label: 'Inventory',
  icon: <BoxIcon size={18} />,
  group: 'commerce'
},
{
  path: '/broadcast',
  label: 'Broadcast',
  icon: <MegaphoneIcon size={18} />,
  group: 'marketing'
},
{
  path: '/automation',
  label: 'Automation',
  icon: <ZapIcon size={18} />,
  group: 'marketing'
},
{
  path: '/analytics',
  label: 'Analytics',
  icon: <BarChart3Icon size={18} />,
  group: 'marketing'
},
{
  path: '/whatsapp-setup',
  label: 'WhatsApp',
  icon: <PhoneIcon size={18} />,
  group: 'settings'
},
{
  path: '/team',
  label: 'Team',
  icon: <UsersIcon size={18} />,
  group: 'settings'
},
{
  path: '/billing',
  label: 'Billing',
  icon: <CreditCardIcon size={18} />,
  group: 'settings'
},
{
  path: '/settings',
  label: 'Settings',
  icon: <SettingsIcon size={18} />,
  group: 'settings'
}];

const groupLabels: Record<string, string> = {
  main: 'Overview',
  commerce: 'Commerce',
  marketing: 'Marketing',
  settings: 'Configuration'
};
export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, user, company, notifications } =
  useAppStore();
  const location = useLocation();
  const groups = ['main', 'commerce', 'marketing', 'settings'];
  return (
    <aside
      className={`
        sidebar-transition flex-shrink-0 h-screen flex flex-col
        bg-[var(--sidebar-bg)] border-r border-slate-800
        ${sidebarCollapsed ? 'w-16' : 'w-60'}
      `}>

      {/* Logo */}
      <div
        className={`flex items-center h-14 border-b border-slate-800 flex-shrink-0 ${sidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3'}`}>

        <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center flex-shrink-0">
          <MessageSquareIcon size={16} className="text-white" />
        </div>
        {!sidebarCollapsed &&
        <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">
              {company?.name || 'WhatsCRM'}
            </p>
            <p className="text-xs text-slate-500 capitalize">
              {company?.plan} plan
            </p>
          </div>
        }
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {groups.map((group) => {
          const items = navItems.filter((n) => n.group === group);
          return (
            <div key={group} className="mb-2">
              {!sidebarCollapsed &&
              <p className="px-3 py-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {groupLabels[group]}
                </p>
              }
              {items.map((item) => {
                const isActive =
                location.pathname === item.path ||
                location.pathname.startsWith(item.path + '/');
                const badge = item.path === '/inbox' ? notifications : undefined;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`
                      flex items-center rounded-lg transition-all duration-150 relative
                      ${sidebarCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2'}
                      ${isActive ? 'bg-brand-green/15 text-brand-green' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
                    `}>

                    {isActive &&
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-green rounded-r-full" />
                    }
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!sidebarCollapsed &&
                    <span className="text-sm font-medium flex-1 truncate">
                        {item.label}
                      </span>
                    }
                    {badge && badge > 0 && !sidebarCollapsed &&
                    <span className="bg-brand-green text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                        {badge}
                      </span>
                    }
                    {badge && badge > 0 && sidebarCollapsed &&
                    <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-brand-green rounded-full" />
                    }
                  </NavLink>);

              })}
            </div>);

        })}
      </nav>

      {/* User Profile */}
      <div
        className={`border-t border-slate-800 p-3 flex-shrink-0 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>

        {sidebarCollapsed ?
        <Avatar
          src={user?.avatar}
          name={user?.name || 'User'}
          size="sm"
          status={user?.status} /> :


        <div className="flex items-center gap-3">
            <Avatar
            src={user?.avatar}
            name={user?.name || 'User'}
            size="sm"
            status={user?.status} />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-slate-500 capitalize truncate">
                {user?.role}
              </p>
            </div>
          </div>
        }
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 bg-[var(--sidebar-bg)] border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors z-10"
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>

        {sidebarCollapsed ?
        <ChevronRightIcon size={12} /> :

        <ChevronLeftIcon size={12} />
        }
      </button>
    </aside>);

}