import React, { useState } from 'react';
import {
  PlusIcon,
  SendIcon,
  ClockIcon,
  BarChart2Icon,
  UsersIcon,
  CheckCheckIcon,
  EyeIcon,
  ShoppingBagIcon } from
'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { mockCampaigns } from '../../data/mockData';
import type { Campaign, CampaignStatus } from '../../types';
const statusVariants: Record<
  CampaignStatus,
  'green' | 'blue' | 'yellow' | 'gray' | 'red'> =
{
  completed: 'green',
  running: 'blue',
  scheduled: 'yellow',
  draft: 'gray',
  failed: 'red'
};
export function BroadcastPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState(1);
  const totalSent = mockCampaigns.reduce((s, c) => s + c.stats.sent, 0);
  const totalDelivered = mockCampaigns.reduce(
    (s, c) => s + c.stats.delivered,
    0
  );
  const totalRead = mockCampaigns.reduce((s, c) => s + c.stats.read, 0);
  const totalConverted = mockCampaigns.reduce(
    (s, c) => s + c.stats.converted,
    0
  );
  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Broadcast & Campaigns
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Send targeted messages to your customers
          </p>
        </div>
        <Button
          size="sm"
          icon={<PlusIcon size={14} />}
          onClick={() => {
            setStep(1);
            setShowCreate(true);
          }}>

          Create Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <SendIcon size={14} className="text-[var(--text-muted)]" />
            <p className="text-xs text-[var(--text-muted)]">Total Sent</p>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {totalSent.toLocaleString()}
          </p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCheckIcon size={14} className="text-blue-500" />
            <p className="text-xs text-[var(--text-muted)]">Delivered</p>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {totalDelivered.toLocaleString()}
          </p>
          <p className="text-xs text-green-600 mt-0.5">
            {totalSent > 0 ?
            (totalDelivered / totalSent * 100).toFixed(1) :
            0}
            % rate
          </p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <EyeIcon size={14} className="text-purple-500" />
            <p className="text-xs text-[var(--text-muted)]">Read</p>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {totalRead.toLocaleString()}
          </p>
          <p className="text-xs text-green-600 mt-0.5">
            {totalDelivered > 0 ?
            (totalRead / totalDelivered * 100).toFixed(1) :
            0}
            % rate
          </p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBagIcon size={14} className="text-brand-green" />
            <p className="text-xs text-[var(--text-muted)]">Converted</p>
          </div>
          <p className="text-2xl font-bold text-brand-green">
            {totalConverted.toLocaleString()}
          </p>
          <p className="text-xs text-green-600 mt-0.5">
            {totalRead > 0 ?
            (totalConverted / totalRead * 100).toFixed(1) :
            0}
            % rate
          </p>
        </div>
      </div>

      {/* Campaign list */}
      <div className="space-y-3">
        {mockCampaigns.map((campaign) =>
        <CampaignCard key={campaign.id} campaign={campaign} />
        )}
      </div>

      {/* Create Campaign Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Campaign"
        subtitle={`Step ${step} of 3`}
        size="lg"
        footer={
        <>
            {step > 1 &&
          <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
          }
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            {step < 3 ?
          <Button onClick={() => setStep(step + 1)}>Next Step</Button> :

          <Button
            icon={<SendIcon size={14} />}
            onClick={() => setShowCreate(false)}>

                Launch Campaign
              </Button>
          }
          </>
        }>

        {step === 1 &&
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Campaign Details
            </h3>
            <Input
            label="Campaign Name"
            placeholder="Spring Sale 2024"
            required />

            <Select
            label="Message Template"
            options={[
            {
              value: 'spring_sale',
              label: 'Spring Sale Offer'
            },
            {
              value: 'product_launch',
              label: 'New Product Launch'
            },
            {
              value: 'winback',
              label: 'Win-Back Offer'
            },
            {
              value: 'flash_sale',
              label: 'Flash Sale'
            }]
            } />

            <Textarea
            label="Preview Message"
            rows={3}
            placeholder="Hi {{name}}, we have an exclusive offer for you..." />

          </div>
        }
        {step === 2 &&
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Select Audience
            </h3>
            <div className="space-y-2">
              {[
            'All Customers',
            'VIP',
            'New Customer',
            'Inactive',
            'Newsletter',
            'Wholesale'].
            map((tag) =>
            <label
              key={tag}
              className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-color)] cursor-pointer hover:bg-[var(--bg-secondary)]">

                  <input type="checkbox" className="rounded" />
                  <div className="flex items-center gap-2 flex-1">
                    <UsersIcon size={14} className="text-[var(--text-muted)]" />
                    <span className="text-sm text-[var(--text-primary)]">
                      {tag}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">
                    {Math.floor(Math.random() * 500 + 50)} contacts
                  </span>
                </label>
            )}
            </div>
          </div>
        }
        {step === 3 &&
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Schedule
            </h3>
            <div className="flex gap-3">
              <label className="flex-1 flex items-center gap-3 p-3 rounded-lg border-2 border-brand-green bg-brand-green/5 cursor-pointer">
                <input type="radio" name="schedule" defaultChecked />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Send Now
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Immediately after launch
                  </p>
                </div>
              </label>
              <label className="flex-1 flex items-center gap-3 p-3 rounded-lg border border-[var(--border-color)] cursor-pointer hover:bg-[var(--bg-secondary)]">
                <input type="radio" name="schedule" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Schedule
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Pick a date & time
                  </p>
                </div>
              </label>
            </div>
            <Input label="Scheduled Date & Time" type="datetime-local" />
            <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
              <p className="text-xs font-semibold text-[var(--text-muted)] mb-2">
                Campaign Summary
              </p>
              <div className="space-y-1 text-xs text-[var(--text-secondary)]">
                <p>
                  Template: <strong>Spring Sale Offer</strong>
                </p>
                <p>
                  Audience: <strong>VIP, New Customer</strong>
                </p>
                <p>
                  Estimated reach: <strong>~450 contacts</strong>
                </p>
              </div>
            </div>
          </div>
        }
      </Modal>
    </div>);

}
function CampaignCard({ campaign }: {campaign: Campaign;}) {
  const deliveryRate =
  campaign.stats.sent > 0 ?
  (campaign.stats.delivered / campaign.stats.sent * 100).toFixed(0) :
  0;
  const readRate =
  campaign.stats.delivered > 0 ?
  (campaign.stats.read / campaign.stats.delivered * 100).toFixed(0) :
  0;
  const convRate =
  campaign.stats.read > 0 ?
  (campaign.stats.converted / campaign.stats.read * 100).toFixed(0) :
  0;
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              {campaign.name}
            </h3>
            <Badge variant={statusVariants[campaign.status]} dot>
              {campaign.status}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
            <span>Template: {campaign.template}</span>
            {campaign.scheduledAt &&
            <span className="flex items-center gap-1">
                <ClockIcon size={11} />
                {campaign.scheduledAt}
              </span>
            }
            <span>Audience: {campaign.audience.join(', ')}</span>
          </div>
        </div>
        <Button variant="ghost" size="xs">
          View Details
        </Button>
      </div>

      {campaign.stats.sent > 0 &&
      <div className="grid grid-cols-4 gap-3 pt-3 border-t border-[var(--border-color)]">
          <div className="text-center">
            <p className="text-lg font-bold text-[var(--text-primary)]">
              {campaign.stats.sent.toLocaleString()}
            </p>
            <p className="text-xs text-[var(--text-muted)]">Sent</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">
              {campaign.stats.delivered.toLocaleString()}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Delivered ({deliveryRate}%)
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-purple-600">
              {campaign.stats.read.toLocaleString()}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Read ({readRate}%)
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-brand-green">
              {campaign.stats.converted.toLocaleString()}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Converted ({convRate}%)
            </p>
          </div>
        </div>
      }
    </div>);

}