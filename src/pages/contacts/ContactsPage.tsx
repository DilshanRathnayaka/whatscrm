import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, DownloadIcon, FilterIcon } from 'lucide-react';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
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

const formatLastSeen = (value?: string) => {
  if (!value) return '—';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
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
  const lastSeen = formatLastSeen(item.lastSeen ?? item.lastMessageTime ?? item.createdAt);

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
    lastSeen,
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

export function ContactsPage() {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoadingContacts(true);

      try {
        const response = await apiFetch(withCompanyIdQuery(buildContactsApiUrl('/get-contacts')), {
          includeCompanyIdHeader: false,
          includeCredentials: true
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Failed to load contacts (${response.status})`);
        }

        const payload = (await response.json()) as ContactApiItem[];
        const mappedContacts = Array.isArray(payload) ?
          payload.map((item, index) => mapContactFromApi(item, index)) :
          [];

        setContacts(mappedContacts);
        setContactsError(null);
      } catch (error) {
        setContactsError(
          error instanceof Error ? error.message : 'Unable to load contacts'
        );
      } finally {
        setIsLoadingContacts(false);
      }
    };

    void fetchContacts();
  }, []);

  const columns: Column<Contact>[] = [
    {
      key: 'name',
      header: 'Contact',
      sortable: true,
      render: (_, row) =>
        <div className="flex items-center gap-3">
          <Avatar src={row.avatar} name={row.name} size="sm" />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {row.name}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {row.email || '—'}
            </p>
          </div>
        </div>

    },
    {
      key: 'phone',
      header: 'Phone',
      sortable: true,
      render: (v) =>
        <span className="text-sm font-mono text-[var(--text-secondary)]">
          {String(v)}
        </span>

    },
    {
      key: 'tags',
      header: 'Tags',
      render: (_, row) =>
        <div className="flex flex-wrap gap-1">
          {row.tags.slice(0, 2).map((tag) =>
            <Badge key={tag} variant="blue" size="sm">
              {tag}
            </Badge>
          )}
          {row.tags.length > 2 &&
            <Badge variant="gray" size="sm">
              +{row.tags.length - 2}
            </Badge>
          }
        </div>

    },
    {
      key: 'totalOrders',
      header: 'Orders',
      sortable: true,
      render: (v) =>
        <span className="text-sm text-[var(--text-primary)]">{String(v)}</span>

    },
    {
      key: 'totalRevenue',
      header: 'Revenue',
      sortable: true,
      render: (v) =>
        <span className="text-sm font-medium text-[var(--text-primary)]">
          ${Number(v).toLocaleString()}
        </span>

    },
    {
      key: 'status',
      header: 'Status',
      render: (v) => {
        const variant =
          v === 'active' ? 'green' : v === 'inactive' ? 'yellow' : 'red';
        return (
          <Badge variant={variant as 'green' | 'yellow' | 'red'} dot>
            {String(v)}
          </Badge>);

      }
    },
    {
      key: 'lastSeen',
      header: 'Last Seen',
      render: (v) =>
        <span className="text-xs text-[var(--text-muted)]">{String(v)}</span>

    }];

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Contacts
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {contacts.length} total contacts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<DownloadIcon size={14} />}>
            Export
          </Button>
          <Button variant="outline" size="sm" icon={<FilterIcon size={14} />}>
            Filter
          </Button>
          <Button
            size="sm"
            icon={<PlusIcon size={14} />}
            onClick={() => setShowAddModal(true)}>

            Add Contact
          </Button>
        </div>
      </div>

      {contactsError &&
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-3 py-2 text-xs text-red-700 dark:text-red-300">
          {contactsError}
        </div>
      }

      <Table
        data={contacts as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchPlaceholder="Search contacts..."
        loading={isLoadingContacts}
        emptyMessage="No contacts found"
        onRowClick={(row) =>
          navigate(`/contacts/${(row as unknown as Contact).id}`)
        }
        pageSize={8} />


      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Contact"
        subtitle="Create a new contact in your CRM"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddModal(false)}>Save Contact</Button>
          </>
        }>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" placeholder="Sarah" required />
            <Input label="Last Name" placeholder="Mitchell" required />
          </div>
          <Input
            label="Phone Number"
            placeholder="+1 555-0101"
            type="tel"
            required />

          <Input
            label="Email Address"
            placeholder="sarah@email.com"
            type="email" />

          <Input
            label="Tags"
            placeholder="VIP, Repeat Customer"
            hint="Comma-separated tags" />

        </div>
      </Modal>
    </div>);

}