import { buildOrdersApiUrl } from '../../config/api';
import { apiFetch } from '../../services/http';
import type { Contact, Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus } from '../../types';

type OrdersApiOrderItemDto = {
    productId?: string | number;
    productName?: string;
    quantity?: number | string;
    price?: number | string;
    unitPrice?: number | string;
    total?: number | string;
};

type OrdersApiTimelineDto = {
    status?: string;
    timestamp?: string;
    note?: string;
};

export type OrdersApiOrderDto = {
    id?: string | number;
    orderId?: string | number;
    orderNumber?: string;
    contactId?: string | number;
    customerId?: string | number;
    status?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    total?: number | string;
    createdAt?: string;
    updatedAt?: string;
    notes?: string;
    items?: OrdersApiOrderItemDto[];
    timeline?: OrdersApiTimelineDto[];
    customerName?: string;
    customerPhone?: string;
    contact?: {
        id?: string | number;
        name?: string;
        phone?: string;
        email?: string;
        avatar?: string;
    };
};

const toNumber = (value: unknown, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizePhone = (value: string) => value.replace(/[^\d+]/g, '');

const toOrderStatus = (value?: string): OrderStatus => {
    if (!value) return 'pending';
    const lowered = value.toLowerCase();
    if (lowered === 'pending' || lowered === 'confirmed' || lowered === 'shipped' || lowered === 'delivered' || lowered === 'cancelled') {
        return lowered;
    }
    return 'pending';
};

const toPaymentStatus = (value?: string): PaymentStatus => {
    if (!value) return 'pending';
    const lowered = value.toLowerCase();
    if (lowered === 'paid' || lowered === 'pending' || lowered === 'failed' || lowered === 'refunded') {
        return lowered;
    }
    return 'pending';
};

const toPaymentMethod = (value?: string): PaymentMethod => {
    if (!value) return 'other';
    const lowered = value.toLowerCase().trim().replace(/[\s-]+/g, '_');

    if (lowered === 'cod' || lowered === 'cash_on_delivery') {
        return 'cod';
    }

    if (lowered === 'card' || lowered === 'credit_card' || lowered === 'debit_card') {
        return 'card';
    }

    if (lowered === 'upi') {
        return 'upi';
    }

    if (lowered === 'bank_transfer' || lowered === 'bank') {
        return 'bank_transfer';
    }

    if (lowered === 'wallet' || lowered === 'e_wallet') {
        return 'wallet';
    }

    return 'other';
};

const buildFallbackContact = (
    id: string,
    name: string,
    phone: string,
    email?: string,
    avatar?: string
): Contact => {
    return {
        id,
        name,
        phone,
        email,
        avatar,
        tags: ['Customer'],
        notes: '',
        status: 'active',
        assignedAgent: undefined,
        totalOrders: 0,
        totalRevenue: 0,
        lastSeen: '—',
        createdAt: new Date().toISOString(),
        city: undefined,
        country: undefined
    };
};

export const mapOrderFromApi = (item: OrdersApiOrderDto): Order | null => {
    const rawId = item.id ?? item.orderId;
    if (rawId === undefined || rawId === null || String(rawId).trim() === '') {
        return null;
    }

    const id = String(rawId);
    const contactName = item.contact?.name ?? item.customerName ?? 'Customer';
    const contactPhone = item.contact?.phone ?? item.customerPhone ?? '';
    const contactId = String(
        item.contact?.id ??
        item.contactId ??
        item.customerId ??
        (contactPhone ? `phone-${normalizePhone(contactPhone)}` : `contact-${id}`)
    );

    const mappedItems: OrderItem[] = (item.items ?? []).map((entry, index) => {
        const quantity = toNumber(entry.quantity, 0);
        const price = toNumber(entry.price ?? entry.unitPrice, 0);
        return {
            productId:
                entry.productId !== undefined && entry.productId !== null ?
                    String(entry.productId) :
                    `product-${id}-${index}`,
            productName: entry.productName ?? 'Item',
            quantity,
            price,
            total: toNumber(entry.total, quantity * price)
        };
    });

    const createdAt = item.createdAt ?? new Date().toISOString();
    const status = toOrderStatus(item.status);
    const mappedTimeline = (item.timeline ?? []).map((entry) => ({
        status: entry.status ?? status,
        timestamp: entry.timestamp ?? createdAt,
        note: entry.note
    }));

    return {
        id,
        orderNumber: item.orderNumber ?? `#${id}`,
        contactId,
        contact: buildFallbackContact(
            contactId,
            contactName,
            contactPhone,
            item.contact?.email,
            item.contact?.avatar
        ),
        items: mappedItems,
        status,
        paymentMethod: toPaymentMethod(item.paymentMethod),
        paymentStatus: toPaymentStatus(item.paymentStatus),
        total: toNumber(item.total, mappedItems.reduce((sum, orderItem) => sum + orderItem.total, 0)),
        createdAt,
        updatedAt: item.updatedAt ?? createdAt,
        notes: item.notes,
        timeline:
            mappedTimeline.length > 0 ?
                mappedTimeline :
                [
                    {
                        status,
                        timestamp: createdAt
                    }
                ]
    };
};

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
    const response = await apiFetch(url, init);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Request failed (${response.status})`);
    }

    return (await response.json()) as T;
};

export const fetchOrders = async (phone?: string): Promise<Order[]> => {
    const endpoint = phone ? `/customer/${encodeURIComponent(phone)}` : '';
    const payload = await fetchJson<OrdersApiOrderDto[]>(buildOrdersApiUrl(endpoint));

    return (payload ?? [])
        .map(mapOrderFromApi)
        .filter((order): order is Order => order !== null);
};

export const fetchOrderById = async (orderId: string): Promise<Order> => {
    const payload = await fetchJson<OrdersApiOrderDto>(
        buildOrdersApiUrl(`/${encodeURIComponent(orderId)}`)
    );
    const mapped = mapOrderFromApi(payload);

    if (!mapped) {
        throw new Error('Order data is invalid');
    }

    return mapped;
};

export const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus
): Promise<Order> => {
    const payload = await fetchJson<OrdersApiOrderDto>(
        buildOrdersApiUrl(`/${encodeURIComponent(orderId)}/status`),
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        }
    );

    const mapped = mapOrderFromApi(payload);
    if (!mapped) {
        throw new Error('Failed to parse updated order');
    }

    return mapped;
};