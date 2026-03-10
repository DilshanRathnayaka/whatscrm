import React, { useState } from 'react';
import {
  SaveIcon,
  BuildingIcon,
  BellIcon,
  ShieldIcon,
  PaletteIcon } from
'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { useAppStore } from '../../store/useAppStore';
const tabs = [
{
  id: 'company',
  label: 'Company',
  icon: <BuildingIcon size={15} />
},
{
  id: 'notifications',
  label: 'Notifications',
  icon: <BellIcon size={15} />
},
{
  id: 'security',
  label: 'Security',
  icon: <ShieldIcon size={15} />
},
{
  id: 'appearance',
  label: 'Appearance',
  icon: <PaletteIcon size={15} />
}];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company');
  const { theme, toggleTheme } = useAppStore();
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Settings
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          Manage your account and application preferences
        </p>
      </div>

      <div className="flex gap-5">
        {/* Sidebar tabs */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) =>
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-brand-green/10 text-brand-green' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'}`}>

                {tab.icon}
                {tab.label}
              </button>
            )}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {activeTab === 'company' &&
          <Card>
              <CardHeader
              title="Company Information"
              subtitle="Update your company details" />

              <div className="space-y-4">
                <Input label="Company Name" defaultValue="Acme Commerce" />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Industry" defaultValue="E-Commerce" />
                  <Select
                  label="Company Size"
                  options={[
                  {
                    value: '1-10',
                    label: '1–10 employees'
                  },
                  {
                    value: '11-50',
                    label: '11–50 employees'
                  },
                  {
                    value: '51-200',
                    label: '51–200 employees'
                  },
                  {
                    value: '200+',
                    label: '200+ employees'
                  }]
                  } />

                </div>
                <Input
                label="Website"
                defaultValue="https://acmecorp.com"
                type="url" />

                <Textarea
                label="Company Description"
                rows={3}
                defaultValue="Leading e-commerce platform for modern businesses." />

                <div className="grid grid-cols-2 gap-3">
                  <Input label="Country" defaultValue="United States" />
                  <Input label="Timezone" defaultValue="America/New_York" />
                </div>
                <Button icon={<SaveIcon size={14} />}>Save Changes</Button>
              </div>
            </Card>
          }

          {activeTab === 'notifications' &&
          <Card>
              <CardHeader
              title="Notification Preferences"
              subtitle="Control how you receive notifications" />

              <div className="space-y-1">
                {[
              {
                label: 'New conversation assigned',
                desc: 'When a conversation is assigned to you',
                defaultChecked: true
              },
              {
                label: 'New message received',
                desc: 'When a customer sends a new message',
                defaultChecked: true
              },
              {
                label: 'Order status updates',
                desc: 'When an order status changes',
                defaultChecked: true
              },
              {
                label: 'Campaign completed',
                desc: 'When a broadcast campaign finishes',
                defaultChecked: false
              },
              {
                label: 'Low inventory alert',
                desc: 'When stock falls below minimum level',
                defaultChecked: true
              },
              {
                label: 'Team member joined',
                desc: 'When a new team member accepts invitation',
                defaultChecked: false
              }].
              map((notif) =>
              <div
                key={notif.label}
                className="flex items-start justify-between py-3 border-b border-[var(--border-color)] last:border-0">

                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {notif.label}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {notif.desc}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                      <input
                    type="checkbox"
                    defaultChecked={notif.defaultChecked}
                    className="sr-only peer" />

                      <div className="w-9 h-5 bg-[var(--bg-tertiary)] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-green" />
                    </label>
                  </div>
              )}
              </div>
            </Card>
          }

          {activeTab === 'security' &&
          <Card>
              <CardHeader
              title="Security Settings"
              subtitle="Manage your account security" />

              <div className="space-y-4">
                <Input
                label="Current Password"
                type="password"
                placeholder="••••••••" />

                <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                hint="Minimum 8 characters with at least one number" />

                <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••" />

                <Button>Update Password</Button>
                <div className="pt-4 border-t border-[var(--border-color)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        Two-Factor Authentication
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable 2FA
                    </Button>
                  </div>
                </div>
                <div className="pt-4 border-t border-[var(--border-color)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        Active Sessions
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Manage devices logged into your account
                      </p>
                    </div>
                    <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20">

                      Revoke All
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          }

          {activeTab === 'appearance' &&
          <Card>
              <CardHeader
              title="Appearance"
              subtitle="Customize how the app looks" />

              <div className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-3">
                    Theme
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                    onClick={() => theme === 'dark' && toggleTheme()}
                    className={`p-4 rounded-xl border-2 text-left transition-colors ${theme === 'light' ? 'border-brand-green bg-brand-green/5' : 'border-[var(--border-color)] hover:border-[var(--border-hover)]'}`}>

                      <div className="w-full h-16 bg-white rounded-lg border border-gray-200 mb-2 overflow-hidden">
                        <div className="flex h-full">
                          <div className="w-8 bg-slate-900" />
                          <div className="flex-1 p-2 space-y-1">
                            <div className="h-1.5 bg-gray-200 rounded w-3/4" />
                            <div className="h-1.5 bg-gray-100 rounded w-1/2" />
                          </div>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        Light
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Clean and bright
                      </p>
                    </button>
                    <button
                    onClick={() => theme === 'light' && toggleTheme()}
                    className={`p-4 rounded-xl border-2 text-left transition-colors ${theme === 'dark' ? 'border-brand-green bg-brand-green/5' : 'border-[var(--border-color)] hover:border-[var(--border-hover)]'}`}>

                      <div className="w-full h-16 bg-slate-950 rounded-lg border border-slate-800 mb-2 overflow-hidden">
                        <div className="flex h-full">
                          <div className="w-8 bg-slate-900 border-r border-slate-800" />
                          <div className="flex-1 p-2 space-y-1">
                            <div className="h-1.5 bg-slate-700 rounded w-3/4" />
                            <div className="h-1.5 bg-slate-800 rounded w-1/2" />
                          </div>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        Dark
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Easy on the eyes
                      </p>
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-2">
                    Language & Region
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                    label="Language"
                    options={[
                    {
                      value: 'en',
                      label: 'English (US)'
                    },
                    {
                      value: 'es',
                      label: 'Español'
                    },
                    {
                      value: 'pt',
                      label: 'Português'
                    },
                    {
                      value: 'fr',
                      label: 'Français'
                    },
                    {
                      value: 'de',
                      label: 'Deutsch'
                    }]
                    } />

                    <Select
                    label="Date Format"
                    options={[
                    {
                      value: 'mdy',
                      label: 'MM/DD/YYYY'
                    },
                    {
                      value: 'dmy',
                      label: 'DD/MM/YYYY'
                    },
                    {
                      value: 'ymd',
                      label: 'YYYY-MM-DD'
                    }]
                    } />

                  </div>
                </div>

                <Button icon={<SaveIcon size={14} />}>Save Preferences</Button>
              </div>
            </Card>
          }
        </div>
      </div>
    </div>);

}