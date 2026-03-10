import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MessageSquareIcon,
  DollarSignIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
  UsersIcon,
  ClockIcon,
  ZapIcon
} from
  'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from
  'recharts';
import { StatCard, Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/useAppStore';
import { getCompanyByUsername, type UserCompanyDto } from '../auth/authApi';
import type { Company, User } from '../../types';
import {
  mockDashboardStats,
  mockRevenueData,
  mockMessagesData,
  mockAgentPerformance,
  mockConversations
} from
  '../../data/mockData';

const toPlan = (value?: string): Company['plan'] => {
  const normalized = (value ?? '').toLowerCase();
  if (normalized === 'starter' || normalized === 'growth' || normalized === 'enterprise') {
    return normalized;
  }
  return 'growth';
};

const mapUserFromDto = (dto: UserCompanyDto, fallback?: User | null): User => {
  const fullName = [dto.firstName, dto.lastName]
    .map((item) => (item ?? '').trim())
    .filter(Boolean)
    .join(' ');

  return {
    id: String(dto.id ?? fallback?.id ?? Date.now()),
    name: fullName || fallback?.name || 'User',
    email: dto.username ?? fallback?.email ?? '',
    avatar: fallback?.avatar,
    role: fallback?.role ?? 'owner',
    status: fallback?.status ?? 'online',
    createdAt: fallback?.createdAt ?? new Date().toISOString()
  };
};

const mapCompanyFromDto = (dto: UserCompanyDto, fallback?: Company | null): Company => {
  return {
    id: String(dto.companyId ?? fallback?.id ?? ''),
    name: dto.companyName ?? fallback?.name ?? 'Company',
    logo: fallback?.logo,
    plan: toPlan(dto.planType ?? fallback?.plan),
    whatsappConnected: fallback?.whatsappConnected ?? true,
    phoneNumber: dto.companyPhone ?? fallback?.phoneNumber
  };
};

export function DashboardPage() {
  const { user, company, login } = useAppStore();
  const location = useLocation();
  const stats = mockDashboardStats;
  const hasSyncedCompanyRef = useRef(false);

  useEffect(() => {
    if (hasSyncedCompanyRef.current) {
      return;
    }

    hasSyncedCompanyRef.current = true;

    const loadCompany = async () => {
      const shouldSkipCompanySync =
        typeof location.state === 'object' &&
        location.state !== null &&
        'skipCompanySync' in location.state &&
        Boolean((location.state as { skipCompanySync?: boolean }).skipCompanySync);

      if (shouldSkipCompanySync) {
        return;
      }

      const usernameFromRoute =
        typeof location.state === 'object' &&
          location.state !== null &&
          'username' in location.state ?
          String((location.state as { username?: string }).username ?? '') :
          '';

      const usernameFromStorage = window.localStorage.getItem('authUsername') ?? '';
      const usernameFromUser = user?.email ?? '';
      const username = usernameFromRoute || usernameFromStorage || usernameFromUser;

      if (!username) {
        return;
      }

      try {
        const dto = await getCompanyByUsername(username);
        const mappedUser = mapUserFromDto(dto, user);
        const mappedCompany = mapCompanyFromDto(dto, company);

        login(mappedUser, mappedCompany);

        if (mappedCompany.id) {
          window.localStorage.setItem('companyId', mappedCompany.id);
        }

        if (mappedUser.email) {
          window.localStorage.setItem('authUsername', mappedUser.email);
        }
      } catch {
        // Keep dashboard usable even if profile sync fails.
      }
    };

    void loadCompany();
  }, [company, location.state, login, user?.email]);

  const displayName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Good morning, {displayName} 👋
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="green" dot>
            WhatsApp Connected
          </Badge>
          <Button variant="outline" size="sm">
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Conversations"
          value={stats.totalConversations.toLocaleString()}
          change="↑ 12% from last month"
          changeType="positive"
          icon={<MessageSquareIcon size={18} />}
          color="green" />

        <StatCard
          title="Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change="↑ 8.3% from last month"
          changeType="positive"
          icon={<DollarSignIcon size={18} />}
          color="blue" />

        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          change="↑ 5 new today"
          changeType="positive"
          icon={<ShoppingCartIcon size={18} />}
          color="purple" />

        <StatCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          change="↓ 0.4% from last week"
          changeType="negative"
          icon={<TrendingUpIcon size={18} />}
          color="orange" />

      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <UsersIcon
                size={16}
                className="text-green-600 dark:text-green-400" />

            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Active Agents</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {stats.activeAgents}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <ClockIcon
                size={16}
                className="text-yellow-600 dark:text-yellow-400" />

            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Pending Chats</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {stats.pendingChats}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <ZapIcon size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">
                Active Workflows
              </p>
              <p className="text-lg font-bold text-[var(--text-primary)]">2</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <TrendingUpIcon
                size={16}
                className="text-purple-600 dark:text-purple-400" />

            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Avg. Response</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">
                4.2m
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Revenue Trend" subtitle="Last 30 days" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockRevenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#25D366" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#25D366" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-color)" />

              <XAxis
                dataKey="date"
                tick={{
                  fontSize: 11,
                  fill: 'var(--text-muted)'
                }}
                axisLine={false}
                tickLine={false} />

              <YAxis
                tick={{
                  fontSize: 11,
                  fill: 'var(--text-muted)'
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`} />

              <Tooltip
                contentStyle={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(v: number) => [`$${v}`, 'Revenue']} />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#25D366"
                strokeWidth={2}
                fill="url(#revenueGrad)" />

            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Messages Trend" subtitle="Last 30 days" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockMessagesData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-color)" />

              <XAxis
                dataKey="date"
                tick={{
                  fontSize: 11,
                  fill: 'var(--text-muted)'
                }}
                axisLine={false}
                tickLine={false} />

              <YAxis
                tick={{
                  fontSize: 11,
                  fill: 'var(--text-muted)'
                }}
                axisLine={false}
                tickLine={false} />

              <Tooltip
                contentStyle={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '12px'
                }} />

              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent conversations */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent Conversations"
            action={
              <Button variant="ghost" size="xs">
                View all
              </Button>
            } />

          <div className="space-y-3">
            {mockConversations.slice(0, 4).map((conv) =>
              <div
                key={conv.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer">

                <Avatar
                  src={conv.contact.avatar}
                  name={conv.contact.name}
                  size="md" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {conv.contact.name}
                    </p>
                    <span className="text-xs text-[var(--text-muted)] flex-shrink-0 ml-2">
                      {conv.lastMessageTime}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unreadCount > 0 &&
                  <span className="w-5 h-5 bg-brand-green text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                    {conv.unreadCount}
                  </span>
                }
              </div>
            )}
          </div>
        </Card>

        {/* Agent performance */}
        <Card>
          <CardHeader title="Agent Performance" subtitle="Today" />
          <div className="space-y-3">
            {mockAgentPerformance.map((agent) =>
              <div key={agent.name} className="flex items-center gap-3">
                <Avatar name={agent.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                    {agent.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {agent.resolved} resolved · {agent.avgTime} avg
                  </p>
                </div>
                <div className="flex items-center gap-0.5 text-yellow-500 text-xs font-medium">
                  ★ {agent.satisfaction}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>);

}