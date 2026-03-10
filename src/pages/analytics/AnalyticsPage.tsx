import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend } from
'recharts';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import {
  TrendingUpIcon,
  MessageSquareIcon,
  ShoppingCartIcon,
  DollarSignIcon,
  UsersIcon,
  BarChart3Icon } from
'lucide-react';
import {
  mockRevenueData,
  mockMessagesData,
  mockAgentPerformance,
  mockDashboardStats } from
'../../data/mockData';
const dateRanges = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'This year'];
const inventoryTrendData = [
{
  date: 'Mar 1',
  normal: 45,
  low: 8,
  out: 2
},
{
  date: 'Mar 5',
  normal: 43,
  low: 9,
  out: 3
},
{
  date: 'Mar 10',
  normal: 40,
  low: 11,
  out: 4
},
{
  date: 'Mar 15',
  normal: 44,
  low: 8,
  out: 3
},
{
  date: 'Mar 20',
  normal: 46,
  low: 7,
  out: 2
},
{
  date: 'Mar 25',
  normal: 42,
  low: 10,
  out: 3
}];

const conversionFunnelData = [
{
  stage: 'Messages Received',
  value: 4820,
  color: '#3b82f6'
},
{
  stage: 'Conversations Opened',
  value: 3240,
  color: '#8b5cf6'
},
{
  stage: 'Products Viewed',
  value: 1890,
  color: '#f59e0b'
},
{
  stage: 'Orders Placed',
  value: 342,
  color: '#25D366'
}];

const topProductsData = [
{
  name: 'Wireless Headphones',
  revenue: 6750,
  orders: 45
},
{
  name: 'Yoga Mat Pro',
  revenue: 3999,
  orders: 50
},
{
  name: 'Smart Water Bottle',
  revenue: 2499,
  orders: 50
},
{
  name: 'Organic T-Shirt',
  revenue: 2099,
  orders: 70
},
{
  name: 'Coffee Mug Set',
  revenue: 1749,
  orders: 50
}];

const COLORS = ['#25D366', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('Last 30 days');
  const stats = mockDashboardStats;
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Analytics
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Track your business performance metrics
          </p>
        </div>
        <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] rounded-lg p-1">
          {dateRanges.map((range) =>
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors whitespace-nowrap ${dateRange === range ? 'bg-[var(--card-bg)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>

              {range}
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Conversations"
          value={stats.totalConversations.toLocaleString()}
          change="↑ 12.4% vs last period"
          changeType="positive"
          icon={<MessageSquareIcon size={18} />}
          color="green" />

        <StatCard
          title="Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change="↑ 8.3% vs last period"
          changeType="positive"
          icon={<DollarSignIcon size={18} />}
          color="blue" />

        <StatCard
          title="Orders"
          value={stats.totalOrders}
          change="↑ 5.1% vs last period"
          changeType="positive"
          icon={<ShoppingCartIcon size={18} />}
          color="purple" />

        <StatCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          change="↓ 0.4% vs last period"
          changeType="negative"
          icon={<TrendingUpIcon size={18} />}
          color="orange" />

      </div>

      {/* Revenue + Messages charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Revenue Trend" subtitle={dateRange} />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockRevenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
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
                formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#25D366"
                strokeWidth={2.5}
                fill="url(#revGrad)"
                dot={false} />

            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Message Volume" subtitle={dateRange} />
          <ResponsiveContainer width="100%" height={220}>
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
                }}
                formatter={(v: number) => [v, 'Messages']} />

              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Conversion funnel + Inventory trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader
            title="Conversion Funnel"
            subtitle="Customer journey breakdown" />

          <div className="space-y-3 mt-2">
            {conversionFunnelData.map((stage, i) => {
              const maxVal = conversionFunnelData[0].value;
              const pct = (stage.value / maxVal * 100).toFixed(0);
              return (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[var(--text-secondary)]">
                      {stage.stage}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[var(--text-primary)]">
                        {stage.value.toLocaleString()}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-7 bg-[var(--bg-tertiary)] rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg flex items-center px-3 transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: stage.color
                      }}>

                      {Number(pct) > 20 &&
                      <span className="text-xs text-white font-medium">
                          {stage.value.toLocaleString()}
                        </span>
                      }
                    </div>
                  </div>
                </div>);

            })}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Inventory Trend"
            subtitle="Stock levels over time" />

          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={inventoryTrendData}>
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

              <Legend
                wrapperStyle={{
                  fontSize: '11px'
                }} />

              <Line
                type="monotone"
                dataKey="normal"
                stroke="#25D366"
                strokeWidth={2}
                dot={false}
                name="Normal" />

              <Line
                type="monotone"
                dataKey="low"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                name="Low" />

              <Line
                type="monotone"
                dataKey="out"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="Out of Stock" />

            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top products + Agent performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Top Products by Revenue" subtitle={dateRange} />
          <div className="space-y-3">
            {topProductsData.map((product, i) => {
              const maxRevenue = topProductsData[0].revenue;
              const pct = (product.revenue / maxRevenue * 100).toFixed(0);
              return (
                <div key={product.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[var(--text-muted)] w-4 flex-shrink-0">
                    #{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                        {product.name}
                      </p>
                      <p className="text-xs font-semibold text-[var(--text-primary)] ml-2 flex-shrink-0">
                        ${product.revenue.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: COLORS[i]
                        }} />

                    </div>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] flex-shrink-0 w-16 text-right">
                    {product.orders} orders
                  </span>
                </div>);

            })}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Agent Performance"
            subtitle="Resolved conversations today" />

          <div className="space-y-4">
            {mockAgentPerformance.map((agent, i) =>
            <div key={agent.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-[var(--text-muted)] w-4 flex-shrink-0">
                  #{i + 1}
                </span>
                <Avatar name={agent.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                      {agent.name}
                    </p>
                    <div className="flex items-center gap-1 text-yellow-500 text-xs ml-2 flex-shrink-0">
                      <span>★</span>
                      <span className="font-semibold">
                        {agent.satisfaction}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[var(--bg-tertiary)] rounded-full">
                      <div
                      className="h-1.5 bg-brand-green rounded-full"
                      style={{
                        width: `${agent.resolved / 60 * 100}%`
                      }} />

                    </div>
                    <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
                      {agent.resolved} resolved
                    </span>
                    <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
                      {agent.avgTime} avg
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>);

}