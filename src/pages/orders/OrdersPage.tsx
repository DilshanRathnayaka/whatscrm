import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import type { Order, OrderStatus, PaymentStatus } from '../../types';
import { fetchOrders } from './orderApi';
const orderStatusVariants: Record<
  OrderStatus,
  'green' | 'blue' | 'yellow' | 'gray' | 'red'> =
{
  delivered: 'green',
  shipped: 'blue',
  confirmed: 'blue',
  pending: 'yellow',
  cancelled: 'red'
};
const paymentVariants: Record<
  PaymentStatus,
  'green' | 'yellow' | 'red' | 'gray'> =
{
  paid: 'green',
  pending: 'yellow',
  failed: 'red',
  refunded: 'gray'
};

const formatPaymentMethod = (value?: string) => {
  if (!value) return '—';
  if (value.toLowerCase() === 'cod') return 'COD';

  return value.
    split('_').
    map((word) => word.charAt(0).toUpperCase() + word.slice(1)).
    join(' ');
};
export function OrdersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const phoneFilter = useMemo(() => {
    return new URLSearchParams(location.search).get('phone')?.trim() ?? '';
  }, [location.search]);

  useEffect(() => {
    let isCancelled = false;

    const loadOrders = async () => {
      setIsLoadingOrders(true);
      setOrdersError(null);

      try {
        const loaded = await fetchOrders(phoneFilter || undefined);
        if (!isCancelled) {
          setOrders(loaded);
        }
      } catch (error) {
        if (!isCancelled) {
          setOrdersError(error instanceof Error ? error.message : 'Unable to load orders');
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingOrders(false);
        }
      }
    };

    void loadOrders();

    return () => {
      isCancelled = true;
    };
  }, [phoneFilter]);

  const columns: Column<Order>[] = [
    {
      key: 'orderNumber',
      header: 'Order',
      sortable: true,
      render: (v) =>
        <span className="text-sm font-mono font-medium text-brand-blue">
          {String(v)}
        </span>

    },
    {
      key: 'contact',
      header: 'Customer',
      render: (_, row) =>
        <div className="flex items-center gap-2">
          <Avatar src={row.contact.avatar} name={row.contact.name} size="sm" />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {row.contact.name}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {row.contact.phone}
            </p>
          </div>
        </div>

    },
    {
      key: 'items',
      header: 'Items',
      render: (_, row) =>
        <span className="text-sm text-[var(--text-secondary)]">
          {row.items.length} item{row.items.length !== 1 ? 's' : ''}
        </span>

    },
    {
      key: 'total',
      header: 'Total',
      sortable: true,
      render: (v) =>
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          ${Number(v).toFixed(2)}
        </span>

    },
    {
      key: 'status',
      header: 'Status',
      render: (v) =>
        <Badge variant={orderStatusVariants[v as OrderStatus]} dot>
          {String(v)}
        </Badge>

    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (_, row) =>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[var(--text-muted)]">
            {formatPaymentMethod(row.paymentMethod)}
          </span>
          <Badge variant={paymentVariants[row.paymentStatus]}>
            {row.paymentStatus}
          </Badge>
        </div>

    },
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      render: (v) =>
        <span className="text-xs text-[var(--text-muted)]">{String(v)}</span>

    }];

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, item) => sum + item.total, 0);
  }, [orders]);

  const pendingOrders = useMemo(() => {
    return orders.filter((item) => item.status === 'pending').length;
  }, [orders]);

  const deliveredOrders = useMemo(() => {
    return orders.filter((item) => item.status === 'delivered').length;
  }, [orders]);

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Orders
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {orders.length} total orders
          </p>
        </div>
        <Button variant="outline" size="sm">
          Export Orders
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Revenue',
            value: `$${totalRevenue.toFixed(2)}`,
            color: 'text-brand-green'
          },
          {
            label: 'Total Orders',
            value: orders.length,
            color: 'text-[var(--text-primary)]'
          },
          {
            label: 'Pending',
            value: pendingOrders,
            color: 'text-yellow-600'
          },
          {
            label: 'Delivered',
            value: deliveredOrders,
            color: 'text-green-600'
          }].
          map((s) =>
            <div
              key={s.label}
              className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4">

              <p className="text-xs text-[var(--text-muted)] mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          )}
      </div>

      {ordersError &&
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {ordersError}
        </div>
      }

      {isLoadingOrders &&
        <div className="text-xs text-[var(--text-muted)]">
          Loading orders...
        </div>
      }

      <Table
        data={orders as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchPlaceholder="Search orders..."
        onRowClick={(row) =>
          navigate(`/orders/${(row as unknown as Order).id}`)
        }
        pageSize={8} />

    </div>);

}