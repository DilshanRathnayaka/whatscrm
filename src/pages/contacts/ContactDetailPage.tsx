import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeftIcon,
  MessageSquareIcon,
  EditIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon
} from
  'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { buildContactsApiUrl } from '../../config/api';
import { apiFetch } from '../../services/http';
import type { Contact } from '../../types';

type ContactApiItem = {
  id?: string | number;
  contactId?: string | number;
  name?: string;
  contactName?: string;
  phone?: string;
  contactPhone?: string;
  mobile?: string;
  email?: string;
  tags?: string[];
  status?: string;
  contactSaved?: string;
  notes?: string;
  totalOrders?: number;
  totalRevenue?: number;
  lastSeen?: string;
  lastMessageTime?: string;
  createdAt?: string;
  avatar?: string;
  city?: string;
  country?: string;
};

const normalizeContactStatus = (
  value?: string,
  contactSaved?: string
): Contact['status'] => {
  const savedFlag = contactSaved?.toLowerCase();
  if (savedFlag === 'yes' || savedFlag === 'true') return 'active';
  if (savedFlag === 'no' || savedFlag === 'false') return 'inactive';

  if (!value) return 'active';
  const lowered = value.toLowerCase();
  if (lowered === 'active' || lowered === 'inactive' || lowered === 'blocked') {
    return lowered;
  }

  if (lowered === 'resolved') return 'inactive';
  if (lowered === 'open' || lowered === 'pending' || lowered === 'bot') return 'active';

  return 'active';
};

const mapContactFromApi = (item: ContactApiItem, index: number): Contact => {
  const id =
    item.id !== undefined && item.id !== null ?
      String(item.id) :
      item.contactId !== undefined && item.contactId !== null ?
        String(item.contactId) :
        `contact-${index}`;

  const name =
    item.contactName ??
    item.name ??
    item.contactPhone ??
    item.phone ??
    item.mobile ??
    'Unknown';
  const phone = item.contactPhone ?? item.phone ?? item.mobile ?? '—';

  return {
    id,
    name,
    phone,
    email: item.email,
    avatar: item.avatar,
    tags: Array.isArray(item.tags) ? item.tags : [],
    notes: item.notes ?? '',
    status: normalizeContactStatus(item.status, item.contactSaved),
    totalOrders: Number(item.totalOrders ?? 0),
    totalRevenue: Number(item.totalRevenue ?? 0),
    lastSeen: item.lastSeen ?? item.lastMessageTime ?? item.createdAt ?? '—',
    createdAt: item.createdAt ?? new Date().toISOString(),
    city: item.city,
    country: item.country
  };
};

const getCompanyIdParam = () => {
  const companyId = window.localStorage.getItem('companyId')?.trim();
  return companyId && companyId.length > 0 ? companyId : '1';
};

const withCompanyIdQuery = (url: string) => {
  const companyId = encodeURIComponent(getCompanyIdParam());
  return url.includes('?') ? `${url}&companyId=${companyId}` : `${url}?companyId=${companyId}`;
};

export function ContactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const stateContact = (location.state as { contact?: Contact } | null)?.contact ?? null;
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContact, setIsLoadingContact] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoadingContact(true);

      try {
        const response = await apiFetch(withCompanyIdQuery(buildContactsApiUrl('/get-contacts')), {
          includeCompanyIdHeader: false,
          includeCredentials: true
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Failed to load contact (${response.status})`);
        }

        const payload = (await response.json()) as ContactApiItem[];
        const mappedContacts = Array.isArray(payload) ?
          payload.map((item, index) => mapContactFromApi(item, index)) :
          [];

        setContacts(mappedContacts);
        setContactError(null);
      } catch (error) {
        setContactError(
          error instanceof Error ? error.message : 'Unable to load contact'
        );
      } finally {
        setIsLoadingContact(false);
      }
    };

    void fetchContacts();
  }, []);

  const contactFromApi = useMemo(() => {
    if (!id) return null;
    return contacts.find((item) => item.id === id) ?? null;
  }, [contacts, id]);

  const contact = contactFromApi ??
    (stateContact ?
      {
        ...stateContact,
        id: stateContact.id || id || `contact-${Date.now()}`,
        tags: stateContact.tags ?? [],
        notes: stateContact.notes ?? '',
        status: stateContact.status ?? 'active',
        totalOrders: stateContact.totalOrders ?? 0,
        totalRevenue: stateContact.totalRevenue ?? 0,
        lastSeen: stateContact.lastSeen ?? '—',
        createdAt: stateContact.createdAt ?? new Date().toISOString()
      } :
      null);

  const orders: Array<{
    id: string;
    orderNumber: string;
    createdAt: string;
    items: Array<unknown>;
    total: number;
    status: string;
  }> = [];

  if (isLoadingContact) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <p className="text-sm text-[var(--text-muted)]">Loading contact...</p>
      </div>
    );
  }

  if (contactError) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeftIcon size={14} />}
          onClick={() => navigate('/contacts')}>
          Back to Contacts
        </Button>
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-3 py-2 text-xs text-red-700 dark:text-red-300">
          {contactError}
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeftIcon size={14} />}
          onClick={() => navigate('/contacts')}>
          Back to Contacts
        </Button>
        <p className="text-sm text-[var(--text-muted)]">Contact not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        icon={<ArrowLeftIcon size={14} />}
        onClick={() => navigate('/contacts')}>

        Back to Contacts
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile card */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <div className="text-center pb-4 border-b border-[var(--border-color)] mb-4">
              <Avatar
                src={contact.avatar}
                name={contact.name}
                size="xl"
                className="mx-auto mb-3" />

              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                {contact.name}
              </h2>
              <Badge
                variant={contact.status === 'active' ? 'green' : 'yellow'}
                dot
                className="mt-1">

                {contact.status}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <PhoneIcon size={14} className="text-[var(--text-muted)]" />
                <span className="text-[var(--text-secondary)] font-mono">
                  {contact.phone}
                </span>
              </div>
              {contact.email &&
                <div className="flex items-center gap-2 text-sm">
                  <MailIcon size={14} className="text-[var(--text-muted)]" />
                  <span className="text-[var(--text-secondary)]">
                    {contact.email}
                  </span>
                </div>
              }
              {contact.city &&
                <div className="flex items-center gap-2 text-sm">
                  <MapPinIcon size={14} className="text-[var(--text-muted)]" />
                  <span className="text-[var(--text-secondary)]">
                    {contact.city}, {contact.country}
                  </span>
                </div>
              }
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
                Tags
              </p>
              <div className="flex flex-wrap gap-1">
                {contact.tags.map((tag) =>
                  <Badge key={tag} variant="blue">
                    {tag}
                  </Badge>
                )}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                fullWidth
                icon={<MessageSquareIcon size={14} />}
                onClick={() => navigate('/inbox')}>

                Message
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<EditIcon size={14} />} />

            </div>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader title="Customer Stats" />
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {contact.totalOrders}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Total Orders</p>
              </div>
              <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-brand-green">
                  ${contact.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Total Revenue
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Notes */}
          <Card>
            <CardHeader
              title="Notes"
              action={
                <Button variant="ghost" size="xs">
                  Edit
                </Button>
              } />

            <p className="text-sm text-[var(--text-secondary)]">
              {contact.notes ||
                'No notes yet. Click edit to add notes about this contact.'}
            </p>
          </Card>

          {/* Order history */}
          <Card>
            <CardHeader
              title="Order History"
              subtitle={`${orders.length} orders`} />

            {orders.length === 0 ?
              <p className="text-sm text-[var(--text-muted)] text-center py-4">
                No orders yet
              </p> :

              <div className="space-y-2">
                {orders.map((order) =>
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)] cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
                    onClick={() => navigate(`/orders/${order.id}`)}>

                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {order.createdAt} · {order.items.length} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        ${order.total.toFixed(2)}
                      </p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                )}
              </div>
            }
          </Card>
        </div>
      </div>
    </div>);

}
function OrderStatusBadge({ status }: { status: string; }) {
  const variants: Record<string, 'green' | 'blue' | 'yellow' | 'gray' | 'red'> =
  {
    delivered: 'green',
    shipped: 'blue',
    confirmed: 'blue',
    pending: 'yellow',
    cancelled: 'red'
  };
  return (
    <Badge variant={variants[status] || 'gray'} size="sm">
      {status}
    </Badge>);

}