import React, { useState } from 'react';
import {
  PlusIcon,
  MailIcon,
  ShieldIcon,
  TrashIcon,
  EditIcon } from
'lucide-react';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { mockTeamMembers } from '../../data/mockData';
import type { TeamMember, UserRole } from '../../types';
const roleVariants: Record<UserRole, 'purple' | 'blue' | 'gray'> = {
  owner: 'purple',
  admin: 'blue',
  agent: 'gray'
};
export function TeamPage() {
  const [showInvite, setShowInvite] = useState(false);
  const columns: Column<TeamMember>[] = [
  {
    key: 'name',
    header: 'Member',
    sortable: true,
    render: (_, row) =>
    <div className="flex items-center gap-3">
          <Avatar
        src={row.avatar}
        name={row.name}
        size="sm"
        status={row.status === 'active' ? 'online' : 'offline'} />

          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {row.name}
            </p>
            <p className="text-xs text-[var(--text-muted)]">{row.email}</p>
          </div>
        </div>

  },
  {
    key: 'role',
    header: 'Role',
    render: (v) =>
    <Badge variant={roleVariants[v as UserRole]}>{String(v)}</Badge>

  },
  {
    key: 'status',
    header: 'Status',
    render: (v) =>
    <Badge
      variant={
      v === 'active' ? 'green' : v === 'invited' ? 'yellow' : 'gray'
      }
      dot>

          {String(v)}
        </Badge>

  },
  {
    key: 'assignedChats',
    header: 'Active Chats',
    sortable: true,
    render: (v) =>
    <span className="text-sm text-[var(--text-primary)]">{String(v)}</span>

  },
  {
    key: 'resolvedToday',
    header: 'Resolved Today',
    sortable: true,
    render: (v) =>
    <span className="text-sm font-medium text-brand-green">
          {String(v)}
        </span>

  },
  {
    key: 'joinedAt',
    header: 'Joined',
    render: (v) =>
    <span className="text-xs text-[var(--text-muted)]">{String(v)}</span>

  },
  {
    key: 'id',
    header: 'Actions',
    render: (_, row) =>
    <div className="flex items-center gap-1">
          <Button variant="ghost" size="xs" icon={<EditIcon size={13} />} />
          {(row as unknown as TeamMember).role !== 'owner' &&
      <Button
        variant="ghost"
        size="xs"
        icon={<TrashIcon size={13} />}
        className="text-red-500" />

      }
        </div>

  }];

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Team Management
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {mockTeamMembers.length} team members
          </p>
        </div>
        <Button
          size="sm"
          icon={<PlusIcon size={14} />}
          onClick={() => setShowInvite(true)}>

          Invite Member
        </Button>
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
        {
          role: 'Owners',
          count: mockTeamMembers.filter((m) => m.role === 'owner').length,
          color: 'text-purple-600',
          bg: 'bg-purple-50 dark:bg-purple-900/20'
        },
        {
          role: 'Admins',
          count: mockTeamMembers.filter((m) => m.role === 'admin').length,
          color: 'text-blue-600',
          bg: 'bg-blue-50 dark:bg-blue-900/20'
        },
        {
          role: 'Agents',
          count: mockTeamMembers.filter((m) => m.role === 'agent').length,
          color: 'text-[var(--text-primary)]',
          bg: 'bg-[var(--bg-secondary)]'
        }].
        map((r) =>
        <div
          key={r.role}
          className={`${r.bg} rounded-xl p-4 border border-[var(--border-color)]`}>

            <p className={`text-2xl font-bold ${r.color}`}>{r.count}</p>
            <p className="text-sm text-[var(--text-muted)]">{r.role}</p>
          </div>
        )}
      </div>

      <Table
        data={mockTeamMembers as unknown as Record<string, unknown>[]}
        columns={columns as Column<Record<string, unknown>>[]}
        searchPlaceholder="Search team members..."
        pageSize={8} />


      <Modal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        title="Invite Team Member"
        subtitle="Send an invitation email to add a new member"
        footer={
        <>
            <Button variant="outline" onClick={() => setShowInvite(false)}>
              Cancel
            </Button>
            <Button
            icon={<MailIcon size={14} />}
            onClick={() => setShowInvite(false)}>

              Send Invitation
            </Button>
          </>
        }>

        <div className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="colleague@company.com"
            required />

          <Select
            label="Role"
            options={[
            {
              value: 'agent',
              label: 'Agent — Can handle conversations'
            },
            {
              value: 'admin',
              label: 'Admin — Full access except billing'
            }]
            } />

          <div className="p-3 bg-[var(--bg-secondary)] rounded-lg text-xs text-[var(--text-muted)]">
            <p className="font-semibold mb-1">Role Permissions:</p>
            <p>
              <strong>Agent:</strong> View & respond to conversations, manage
              assigned contacts
            </p>
            <p className="mt-1">
              <strong>Admin:</strong> All agent permissions + manage team,
              products, orders, campaigns
            </p>
          </div>
        </div>
      </Modal>
    </div>);

}