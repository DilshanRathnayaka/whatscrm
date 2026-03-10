import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { Select } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import type { Order, OrderStatus, PaymentStatus } from '../../types';
import { fetchOrderById, updateOrderStatus } from './orderApi';
const statusVariants: Record<
  OrderStatus,
  'green' | 'blue' | 'yellow' | 'gray' | 'red'> =
{
  delivered: 'green',
  shipped: 'blue',
  confirmed: 'blue',
  pending: 'yellow',
  cancelled: 'red'
};

const paymentVariants: Record<PaymentStatus, 'green' | 'yellow' | 'red' | 'gray'> = {
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
export function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setOrderError('Order id is missing');
      return;
    }

    let isCancelled = false;

    const loadOrder = async () => {
      setIsLoadingOrder(true);
      setOrderError(null);

      try {
        const loadedOrder = await fetchOrderById(id);
        if (!isCancelled) {
          setOrder(loadedOrder);
          setStatus(loadedOrder.status);
        }
      } catch (error) {
        if (!isCancelled) {
          setOrderError(error instanceof Error ? error.message : 'Unable to load order');
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingOrder(false);
        }
      }
    };

    void loadOrder();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  const handleStatusChange = async (nextStatus: OrderStatus) => {
    if (!id) return;

    const previousStatus = status;
    setStatus(nextStatus);
    setIsUpdatingStatus(true);
    setOrderError(null);

    try {
      const updated = await updateOrderStatus(id, nextStatus);
      setOrder(updated);
      setStatus(updated.status);
    } catch (error) {
      setStatus(previousStatus);
      setOrderError(error instanceof Error ? error.message : 'Unable to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoadingOrder) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-sm text-[var(--text-muted)]">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeftIcon size={14} />}
          onClick={() => navigate('/orders')}>

          Back to Orders
        </Button>
        <p className="text-sm text-red-600 dark:text-red-300">
          {orderError ?? 'Order not found'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeftIcon size={14} />}
          onClick={() => navigate('/orders')}>

          Back to Orders
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariants[status]} dot size="md">
            {status}
          </Badge>
          <Select
            options={[
              {
                value: 'pending',
                label: 'Pending'
              },
              {
                value: 'confirmed',
                label: 'Confirmed'
              },
              {
                value: 'shipped',
                label: 'Shipped'
              },
              {
                value: 'delivered',
                label: 'Delivered'
              },
              {
                value: 'cancelled',
                label: 'Cancelled'
              }]
            }
            value={status}
            onChange={(e) => {
              void handleStatusChange(e.target.value as OrderStatus);
            }}
            disabled={isUpdatingStatus}
            fullWidth={false}
            className="w-36" />

        </div>
      </div>

      {orderError &&
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {orderError}
        </div>
      }

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {/* Order items */}
          <Card>
            <CardHeader
              title={`Order ${order.orderNumber}`}
              subtitle={`Placed on ${order.createdAt}`} />

            <div className="space-y-3">
              {order.items.map((item, i) =>
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-[var(--border-color)] last:border-0">

                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {item.productName}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    ${item.total.toFixed(2)}
                  </p>
                </div>
              )}
              <div className="flex justify-between pt-2">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Total
                </p>
                <p className="text-lg font-bold text-brand-green">
                  ${order.total.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader title="Order Timeline" />
            <div className="space-y-0">
              {order.timeline.map((event, i) =>
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-brand-green/15 border-2 border-brand-green flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon size={14} className="text-brand-green" />
                    </div>
                    {i < order.timeline.length - 1 &&
                      <div className="w-0.5 h-8 bg-[var(--border-color)] my-1" />
                    }
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {event.status}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {event.timestamp}
                    </p>
                    {event.note &&
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {event.note}
                      </p>
                    }
                  </div>
                </div>
              )}
              {order.timeline.length === 0 &&
                <p className="text-xs text-[var(--text-muted)]">No timeline data</p>
              }
            </div>
          </Card>
        </div>

        {/* Customer info */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Customer" />
            <div className="flex items-center gap-3 mb-3">
              <Avatar
                src={order.contact.avatar}
                name={order.contact.name}
                size="md" />

              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {order.contact.name}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {order.contact.phone}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              fullWidth
              onClick={() =>
                navigate(
                  `/inbox?phone=${encodeURIComponent(order.contact.phone)}`,
                  { state: { phone: order.contact.phone } }
                )
              }>

              Message
            </Button>
          </Card>

          <Card>
            <CardHeader title="Payment" />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Method</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {formatPaymentMethod(order.paymentMethod)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Status</span>
                <Badge variant={paymentVariants[order.paymentStatus]}>

                  {order.paymentStatus}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Amount</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>);

}