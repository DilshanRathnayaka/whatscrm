import React, { useState } from 'react';
import { PlusIcon, EditIcon, TrashIcon, ImageIcon } from 'lucide-react';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { mockProducts } from '../../data/mockData';
import type { Product } from '../../types';
export function ProductsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const columns: Column<Product>[] = [
  {
    key: 'name',
    header: 'Product',
    sortable: true,
    render: (_, row) =>
    <div className="flex items-center gap-3">
          {row.images[0] ?
      <img
        src={row.images[0]}
        alt={row.name}
        className="w-10 h-10 rounded-lg object-cover flex-shrink-0" /> :


      <div className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
              <ImageIcon size={16} className="text-[var(--text-muted)]" />
            </div>
      }
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {row.name}
            </p>
            <p className="text-xs text-[var(--text-muted)] font-mono">
              {row.sku}
            </p>
          </div>
        </div>

  },
  {
    key: 'category',
    header: 'Category',
    sortable: true,
    render: (v) => <Badge variant="gray">{String(v)}</Badge>
  },
  {
    key: 'price',
    header: 'Price',
    sortable: true,
    render: (_, row) =>
    <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            ${row.price.toFixed(2)}
          </p>
          {row.discount > 0 &&
      <p className="text-xs text-green-600">-{row.discount}% off</p>
      }
        </div>

  },
  {
    key: 'inventory',
    header: 'Stock',
    sortable: true,
    render: (v) => {
      const qty = Number(v);
      const variant = qty === 0 ? 'red' : qty < 10 ? 'yellow' : 'green';
      return (
        <Badge variant={variant}>
            {qty === 0 ? 'Out of stock' : `${qty} units`}
          </Badge>);

    }
  },
  {
    key: 'status',
    header: 'Status',
    render: (v) => {
      const variant =
      v === 'active' ? 'green' : v === 'inactive' ? 'red' : 'yellow';
      return (
        <Badge variant={variant as 'green' | 'red' | 'yellow'} dot>
            {String(v)}
          </Badge>);

    }
  },
  {
    key: 'id',
    header: 'Actions',
    render: (_, row) =>
    <div className="flex items-center gap-1">
          <Button
        variant="ghost"
        size="xs"
        icon={<EditIcon size={13} />}
        onClick={(e) => {
          e.stopPropagation();
          setEditProduct(row);
          setShowModal(true);
        }} />

          <Button
        variant="ghost"
        size="xs"
        icon={<TrashIcon size={13} />}
        className="text-red-500 hover:text-red-600" />

        </div>

  }];

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Products
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {mockProducts.length} products in catalog
          </p>
        </div>
        <Button
          size="sm"
          icon={<PlusIcon size={14} />}
          onClick={() => {
            setEditProduct(null);
            setShowModal(true);
          }}>

          Add Product
        </Button>
      </div>

      <Table
        data={mockProducts as unknown as Record<string, unknown>[]}
        columns={columns as Column<Record<string, unknown>>[]}
        searchPlaceholder="Search products..."
        pageSize={8} />


      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
        footer={
        <>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowModal(false)}>
              {editProduct ? 'Save Changes' : 'Add Product'}
            </Button>
          </>
        }>

        <div className="space-y-4">
          <Input
            label="Product Name"
            placeholder="Premium Wireless Headphones"
            defaultValue={editProduct?.name}
            required />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="SKU"
              placeholder="WH-PRO-001"
              defaultValue={editProduct?.sku}
              required />

            <Select
              label="Category"
              options={[
              {
                value: 'Electronics',
                label: 'Electronics'
              },
              {
                value: 'Apparel',
                label: 'Apparel'
              },
              {
                value: 'Lifestyle',
                label: 'Lifestyle'
              },
              {
                value: 'Sports',
                label: 'Sports'
              },
              {
                value: 'Kitchen',
                label: 'Kitchen'
              },
              {
                value: 'Accessories',
                label: 'Accessories'
              }]
              } />

          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Price ($)"
              type="number"
              placeholder="149.99"
              defaultValue={editProduct?.price} />

            <Input
              label="Discount (%)"
              type="number"
              placeholder="0"
              defaultValue={editProduct?.discount} />

            <Input
              label="Inventory"
              type="number"
              placeholder="100"
              defaultValue={editProduct?.inventory} />

          </div>
          <Textarea
            label="Description"
            placeholder="Product description..."
            rows={3}
            defaultValue={editProduct?.description} />

          <Select
            label="Status"
            options={[
            {
              value: 'active',
              label: 'Active'
            },
            {
              value: 'inactive',
              label: 'Inactive'
            },
            {
              value: 'draft',
              label: 'Draft'
            }]
            } />

        </div>
      </Modal>
    </div>);

}