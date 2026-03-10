import React, { useState } from 'react';
import { CheckIcon, CreditCardIcon, DownloadIcon, ZapIcon } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { mockPlans, mockInvoices, mockCompany } from '../../data/mockData';
export function BillingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>(
    'monthly'
  );
  const currentPlan =
  mockPlans.find((p) => p.id === mockCompany.plan) || mockPlans[1];
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Billing & Plans
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current plan */}
      <Card className="border-brand-green/30 bg-brand-green/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-green rounded-xl flex items-center justify-center">
              <ZapIcon size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-[var(--text-primary)] text-lg">
                  {currentPlan.name} Plan
                </p>
                <Badge variant="green">Active</Badge>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                ${currentPlan.price}/month · Renews on April 1, 2024
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Cancel Plan
            </Button>
            <Button size="sm">Upgrade</Button>
          </div>
        </div>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader title="Usage This Month" />
        <div className="grid grid-cols-3 gap-4">
          {[
          {
            label: 'Agents',
            used: 4,
            limit: currentPlan.limits.agents
          },
          {
            label: 'Conversations',
            used: 6842,
            limit: currentPlan.limits.conversations
          },
          {
            label: 'Broadcasts',
            used: 12,
            limit: currentPlan.limits.broadcasts
          }].
          map((usage) =>
          <div key={usage.label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-[var(--text-secondary)]">
                  {usage.label}
                </span>
                <span className="font-medium text-[var(--text-primary)]">
                  {usage.used.toLocaleString()} /{' '}
                  {usage.limit === -1 ? '∞' : usage.limit.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-[var(--bg-tertiary)] rounded-full">
                <div
                className={`h-2 rounded-full transition-all ${usage.limit === -1 ? 'bg-brand-green' : usage.used / usage.limit > 0.8 ? 'bg-red-500' : usage.used / usage.limit > 0.6 ? 'bg-yellow-500' : 'bg-brand-green'}`}
                style={{
                  width:
                  usage.limit === -1 ?
                  '30%' :
                  `${Math.min(usage.used / usage.limit * 100, 100)}%`
                }} />

              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Plans */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            Available Plans
          </h3>
          <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${billingPeriod === 'monthly' ? 'bg-[var(--card-bg)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)]'}`}>

              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${billingPeriod === 'yearly' ? 'bg-[var(--card-bg)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)]'}`}>

              Yearly <span className="text-brand-green">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {mockPlans.map((plan) => {
            const isCurrent = plan.id === mockCompany.plan;
            const price =
            billingPeriod === 'yearly' ?
            Math.round(plan.price * 0.8) :
            plan.price;
            return (
              <div
                key={plan.id}
                className={`rounded-xl border-2 p-5 ${isCurrent ? 'border-brand-green bg-brand-green/5' : 'border-[var(--border-color)] bg-[var(--card-bg)]'}`}>

                {isCurrent &&
                <Badge variant="green" className="mb-3">
                    Current Plan
                  </Badge>
                }
                <h4 className="text-lg font-bold text-[var(--text-primary)]">
                  {plan.name}
                </h4>
                <div className="flex items-baseline gap-1 my-2">
                  <span className="text-3xl font-bold text-[var(--text-primary)]">
                    ${price}
                  </span>
                  <span className="text-[var(--text-muted)] text-sm">/mo</span>
                </div>
                <ul className="space-y-2 mb-5">
                  {plan.features.map((feature) =>
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">

                      <CheckIcon
                      size={14}
                      className="text-brand-green mt-0.5 flex-shrink-0" />

                      {feature}
                    </li>
                  )}
                </ul>
                <Button
                  variant={isCurrent ? 'outline' : 'primary'}
                  fullWidth
                  disabled={isCurrent}>

                  {isCurrent ?
                  'Current Plan' :
                  plan.id === 'enterprise' ?
                  'Contact Sales' :
                  'Upgrade'}
                </Button>
              </div>);

          })}
        </div>
      </div>

      {/* Invoices */}
      <Card>
        <CardHeader title="Invoice History" />
        <div className="space-y-2">
          {mockInvoices.map((invoice) =>
          <div
            key={invoice.id}
            className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)]">

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[var(--bg-tertiary)] rounded-lg flex items-center justify-center">
                  <CreditCardIcon
                  size={14}
                  className="text-[var(--text-muted)]" />

                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {invoice.number}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {invoice.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  ${invoice.amount}
                </p>
                <Badge variant={invoice.status === 'paid' ? 'green' : 'yellow'}>
                  {invoice.status}
                </Badge>
                <Button
                variant="ghost"
                size="xs"
                icon={<DownloadIcon size={13} />} />

              </div>
            </div>
          )}
        </div>
      </Card>
    </div>);

}