import React, { useState, Fragment } from 'react';
import {
  PlusIcon,
  ZapIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  ArrowDownIcon,
  GitBranchIcon,
  MessageSquareIcon,
  UserIcon,
  TagIcon } from
'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { mockWorkflows } from '../../data/mockData';
import type { Workflow, WorkflowNode } from '../../types';
const nodeTypeConfig = {
  trigger: {
    color: 'bg-blue-500',
    lightColor:
    'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-700 dark:text-blue-300',
    icon: <ZapIcon size={14} />
  },
  condition: {
    color: 'bg-yellow-500',
    lightColor:
    'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    icon: <GitBranchIcon size={14} />
  },
  action: {
    color: 'bg-green-500',
    lightColor:
    'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    textColor: 'text-green-700 dark:text-green-300',
    icon: <PlayIcon size={14} />
  }
};
export function AutomationPage() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(
    null
  );
  const [showBuilder, setShowBuilder] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Automation Builder
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Create automated workflows for your WhatsApp conversations
          </p>
        </div>
        <Button
          size="sm"
          icon={<PlusIcon size={14} />}
          onClick={() => setShowCreate(true)}>

          New Workflow
        </Button>
      </div>

      {/* Workflow list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockWorkflows.map((wf) =>
        <WorkflowCard
          key={wf.id}
          workflow={wf}
          onOpen={() => {
            setSelectedWorkflow(wf);
            setShowBuilder(true);
          }} />

        )}

        {/* Add new card */}
        <button
          onClick={() => setShowCreate(true)}
          className="border-2 border-dashed border-[var(--border-color)] rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-[var(--text-muted)] hover:border-brand-green hover:text-brand-green transition-colors group">

          <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] group-hover:bg-brand-green/10 flex items-center justify-center transition-colors">
            <PlusIcon size={20} />
          </div>
          <p className="text-sm font-medium">Create New Workflow</p>
        </button>
      </div>

      {/* Workflow Builder Modal */}
      {selectedWorkflow &&
      <Modal
        isOpen={showBuilder}
        onClose={() => setShowBuilder(false)}
        title={selectedWorkflow.name}
        subtitle="Visual Workflow Builder"
        size="full"
        footer={
        <>
              <Button variant="outline" onClick={() => setShowBuilder(false)}>
                Close
              </Button>
              <Button variant="secondary">Test Workflow</Button>
              <Button icon={<PlayIcon size={14} />}>Activate</Button>
            </>
        }>

          <WorkflowCanvas workflow={selectedWorkflow} />
        </Modal>
      }

      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create New Workflow"
        footer={
        <>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCreate(false)}>
              Create & Open Builder
            </Button>
          </>
        }>

        <div className="space-y-4">
          <Input
            label="Workflow Name"
            placeholder="Welcome New Customer"
            required />

          <div>
            <p className="text-sm font-medium text-[var(--text-primary)] mb-2">
              Choose a trigger
            </p>
            <div className="space-y-2">
              {[
              {
                id: 'first_message',
                label: 'First Message Received',
                desc: 'Triggers when a new contact messages for the first time'
              },
              {
                id: 'keyword',
                label: 'Keyword Match',
                desc: 'Triggers when a specific keyword is detected'
              },
              {
                id: 'order_placed',
                label: 'Order Placed',
                desc: 'Triggers when a new order is created'
              },
              {
                id: 'tag_added',
                label: 'Tag Added',
                desc: 'Triggers when a specific tag is added to a contact'
              }].
              map((trigger) =>
              <label
                key={trigger.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-[var(--border-color)] cursor-pointer hover:bg-[var(--bg-secondary)]">

                  <input type="radio" name="trigger" className="mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {trigger.label}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {trigger.desc}
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>);

}
function WorkflowCard({
  workflow,
  onOpen



}: {workflow: Workflow;onOpen: () => void;}) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-green/10 rounded-lg flex items-center justify-center">
            <ZapIcon size={16} className="text-brand-green" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              {workflow.name}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              {workflow.nodes.length} nodes
            </p>
          </div>
        </div>
        <Badge
          variant={
          workflow.status === 'active' ?
          'green' :
          workflow.status === 'inactive' ?
          'gray' :
          'yellow'
          }
          dot>

          {workflow.status}
        </Badge>
      </div>

      <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mb-4">
        <span>{workflow.triggerCount.toLocaleString()} triggers</span>
        {workflow.lastTriggered && <span>Last: {workflow.lastTriggered}</span>}
      </div>

      {/* Mini node preview */}
      {workflow.nodes.length > 0 &&
      <div className="flex items-center gap-1 mb-4 overflow-hidden">
          {workflow.nodes.slice(0, 3).map((node, i) =>
        <Fragment key={node.id}>
              <div
            className={`px-2 py-1 rounded text-xs font-medium border ${nodeTypeConfig[node.type].lightColor} ${nodeTypeConfig[node.type].textColor} whitespace-nowrap`}>

                {node.label}
              </div>
              {i < Math.min(workflow.nodes.length - 1, 2) &&
          <ArrowDownIcon
            size={10}
            className="text-[var(--text-muted)] flex-shrink-0 rotate-[-90deg]" />

          }
            </Fragment>
        )}
          {workflow.nodes.length > 3 &&
        <span className="text-xs text-[var(--text-muted)]">
              +{workflow.nodes.length - 3} more
            </span>
        }
        </div>
      }

      <div className="flex items-center gap-2">
        <Button variant="outline" size="xs" fullWidth onClick={onOpen}>
          Open Builder
        </Button>
        <Button
          variant="ghost"
          size="xs"
          icon={
          workflow.status === 'active' ?
          <PauseIcon size={13} /> :

          <PlayIcon size={13} />

          } />

        <Button
          variant="ghost"
          size="xs"
          icon={<TrashIcon size={13} />}
          className="text-red-500" />

      </div>
    </div>);

}
function WorkflowCanvas({ workflow }: {workflow: Workflow;}) {
  const blockTypes = [
  {
    type: 'trigger',
    label: 'Trigger',
    icon: <ZapIcon size={14} />,
    subtypes: [
    'Message Received',
    'Keyword Match',
    'Order Placed',
    'Tag Added']

  },
  {
    type: 'condition',
    label: 'Condition',
    icon: <GitBranchIcon size={14} />,
    subtypes: ['Keyword Check', 'Tag Check', 'Time Check']
  },
  {
    type: 'action',
    label: 'Action',
    icon: <PlayIcon size={14} />,
    subtypes: ['Send Message', 'Assign Agent', 'Add Tag', 'Send Product']
  }];

  return (
    <div className="flex gap-4 h-96">
      {/* Block palette */}
      <div className="w-48 flex-shrink-0 border-r border-[var(--border-color)] pr-4">
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
          Add Blocks
        </p>
        <div className="space-y-3">
          {blockTypes.map((bt) =>
          <div key={bt.type}>
              <p className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 capitalize">
                {bt.label}
              </p>
              <div className="space-y-1">
                {bt.subtypes.map((sub) =>
              <div
                key={sub}
                draggable
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs cursor-grab active:cursor-grabbing ${nodeTypeConfig[bt.type as keyof typeof nodeTypeConfig].lightColor} ${nodeTypeConfig[bt.type as keyof typeof nodeTypeConfig].textColor}`}>

                    {bt.icon}
                    {sub}
                  </div>
              )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 workflow-canvas rounded-xl overflow-auto relative">
        <div className="absolute inset-0 flex flex-col items-center pt-6 gap-0">
          {workflow.nodes.map((node, i) =>
          <Fragment key={node.id}>
              <WorkflowNodeBlock node={node} />
              {i < workflow.nodes.length - 1 &&
            <div className="flex flex-col items-center">
                  <div className="w-0.5 h-6 bg-[var(--border-color)]" />
                  <ArrowDownIcon
                size={14}
                className="text-[var(--text-muted)]" />

                  <div className="w-0.5 h-6 bg-[var(--border-color)]" />
                </div>
            }
            </Fragment>
          )}
          {workflow.nodes.length === 0 &&
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
              <ZapIcon size={32} className="mb-2 opacity-30" />
              <p className="text-sm">Drag blocks here to build your workflow</p>
            </div>
          }
        </div>
      </div>
    </div>);

}
function WorkflowNodeBlock({ node }: {node: WorkflowNode;}) {
  const config = nodeTypeConfig[node.type];
  return (
    <div
      className={`w-64 rounded-xl border-2 p-3 ${config.lightColor} shadow-sm`}>

      <div className="flex items-center gap-2 mb-1">
        <div
          className={`w-5 h-5 rounded-md ${config.color} flex items-center justify-center text-white`}>

          {config.icon}
        </div>
        <span
          className={`text-xs font-semibold uppercase tracking-wide ${config.textColor}`}>

          {node.type}
        </span>
      </div>
      <p className="text-sm font-medium text-[var(--text-primary)]">
        {node.label}
      </p>
    </div>);

}