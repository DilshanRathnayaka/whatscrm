import React, { useState } from 'react';
import {
  AlertTriangleIcon,
  PackageIcon,
  TrendingDownIcon,
  PlusIcon } from
'lucide-react';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { StatCard } from '../../components/ui/Card';
import { mockInventory } from '../../data/mockData';
import type { InventoryItem, StockLevel } from '../../types';
const stockVariants: Record<StockLevel, 'green' | 'yellow' | 'red'> = {
  normal: 'green',
  low: 'yellow',
  out: 'red'
};
export function InventoryPage() {
  const [showAdjust, setShowAdjust] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const outOfStock = mockInventory.filter((i) => i.stockLevel === 'out').length;
  const lowStock = mockInventory.filter((i) => i.stockLevel === 'low').length;
  const normalStock = mockInventory.filter(
    (i) => i.stockLevel === 'normal'
  ).length;
  const totalUnits = mockInventory.reduce((s, i) => s + i.quantity, 0);
  const columns: Column<InventoryItem>[] = [
  {
    key: 'productName',
    header: 'Product',
    sortable: true,
    render: (_, row) =>
    <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {row.productName}
          </p>
          <p className="text-xs text-[var(--text-muted)] font-mono">
            {row.sku}
          </p>
        </div>

  },
  {
    key: 'quantity',
    header: 'Quantity',
    sortable: true,
    render: (_, row) =>
    <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {row.quantity}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Min: {row.minQuantity}
          </p>
        </div>

  },
  {
    key: 'stockLevel',
    header: 'Stock Level',
    render: (v) => {
      const level = v as StockLevel;
      return (
        <div className="flex items-center gap-2">
            <div className="flex-1 bg-[var(--bg-tertiary)] rounded-full h-1.5 w-20">
              <div
              className={`h-1.5 rounded-full ${level === 'normal' ? 'bg-green-500' : level === 'low' ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{
                width:
                level === 'normal' ? '80%' : level === 'low' ? '30%' : '0%'
              }} />

            </div>
            <Badge variant={stockVariants[level]} dot>
              {level}
            </Badge>
          </div>);

    }
  },
  {
    key: 'warehouse',
    header: 'Warehouse',
    render: (v) =>
    <span className="text-sm text-[var(--text-secondary)]">
          {String(v)}
        </span>

  },
  {
    key: 'lastUpdated',
    header: 'Last Updated',
    render: (v) =>
    <span className="text-xs text-[var(--text-muted)]">{String(v)}</span>

  },
  {
    key: 'id',
    header: 'Actions',
    render: (_, row) =>
    <Button
      variant="outline"
      size="xs"
      onClick={(e) => {
        e.stopPropagation();
        setSelectedItem(row);
        setShowAdjust(true);
      }}>

          Adjust
        </Button>

  }];

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Inventory
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Track and manage your stock levels
          </p>
        </div>
        <Button size="sm" icon={<PlusIcon size={14} />}>
          Add Stock
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Units"
          value={totalUnits.toLocaleString()}
          icon={<PackageIcon size={18} />}
          color="blue" />

        <StatCard
          title="Normal Stock"
          value={normalStock}
          icon={<PackageIcon size={18} />}
          color="green" />

        <StatCard
          title="Low Stock"
          value={lowStock}
          change="Needs attention"
          changeType="negative"
          icon={<TrendingDownIcon size={18} />}
          color="orange" />

        <StatCard
          title="Out of Stock"
          value={outOfStock}
          change="Reorder required"
          changeType="negative"
          icon={<AlertTriangleIcon size={18} />}
          color="orange" />

      </div>

      {(outOfStock > 0 || lowStock > 0) &&
      <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <AlertTriangleIcon
          size={16}
          className="text-yellow-600 flex-shrink-0" />

          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            <strong>{outOfStock} products</strong> are out of stock and{' '}
            <strong>{lowStock} products</strong> are running low. Consider
            reordering soon.
          </p>
        </div>
      }

      <Table
        data={mockInventory as unknown as Record<string, unknown>[]}
        columns={columns as Column<Record<string, unknown>>[]}
        searchPlaceholder="Search inventory..."
        pageSize={8} />


      <Modal
        isOpen={showAdjust}
        onClose={() => setShowAdjust(false)}
        title="Adjust Stock"
        subtitle={selectedItem?.productName}
        footer={
        <>
            <Button variant="outline" onClick={() => setShowAdjust(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAdjust(false)}>
              Save Adjustment
            </Button>
          </>
        }>

        <div className="space-y-4">
          <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
            <p className="text-xs text-[var(--text-muted)]">Current Stock</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {selectedItem?.quantity} units
            </p>
          </div>
          <Select
            label="Adjustment Type"
            options={[
            {
              value: 'add',
              label: 'Add Stock (+)'
            },
            {
              value: 'remove',
              label: 'Remove Stock (-)'
            },
            {
              value: 'set',
              label: 'Set Exact Quantity'
            }]
            } />

          <Input label="Quantity" type="number" placeholder="0" />
          <Input label="Reason" placeholder="Restock, damage, return..." />
        </div>
      </Modal>
    </div>);

}