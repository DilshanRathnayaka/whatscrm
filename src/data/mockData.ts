import type {
  User,
  Company,
  Contact,
  Conversation,
  Message,
  Product,
  Order,
  InventoryItem,
  Campaign,
  Workflow,
  DashboardStats,
  TeamMember,
  Invoice,
  Plan,
  WhatsAppAccount } from
'../types';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const mockUser: User = {
  id: 'u1',
  name: 'Alex Johnson',
  email: 'alex@acmecorp.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  role: 'owner',
  status: 'online',
  createdAt: '2024-01-15'
};

export const mockCompany: Company = {
  id: 'c1',
  name: 'Acme Commerce',
  plan: 'growth',
  whatsappConnected: true,
  phoneNumber: '+1 (555) 234-5678'
};

// ─── Contacts ─────────────────────────────────────────────────────────────────
export const mockContacts: Contact[] = [
{
  id: 'ct1',
  name: 'Sarah Mitchell',
  phone: '+1 555-0101',
  email: 'sarah@email.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  tags: ['VIP', 'Repeat Customer'],
  notes: 'Prefers morning contact. High-value customer.',
  status: 'active',
  assignedAgent: 'u2',
  totalOrders: 12,
  totalRevenue: 3450,
  lastSeen: '2 min ago',
  createdAt: '2024-01-10',
  city: 'New York',
  country: 'US'
},
{
  id: 'ct2',
  name: 'Marcus Chen',
  phone: '+1 555-0102',
  email: 'marcus@email.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
  tags: ['New Customer'],
  notes: 'First purchase last week.',
  status: 'active',
  totalOrders: 1,
  totalRevenue: 89,
  lastSeen: '1 hour ago',
  createdAt: '2024-03-01',
  city: 'San Francisco',
  country: 'US'
},
{
  id: 'ct3',
  name: 'Priya Sharma',
  phone: '+91 98765-43210',
  email: 'priya@email.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
  tags: ['Wholesale', 'VIP'],
  notes: 'Bulk orders every quarter.',
  status: 'active',
  assignedAgent: 'u3',
  totalOrders: 28,
  totalRevenue: 12800,
  lastSeen: '30 min ago',
  createdAt: '2023-11-05',
  city: 'Mumbai',
  country: 'IN'
},
{
  id: 'ct4',
  name: 'James Rodriguez',
  phone: '+1 555-0104',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
  tags: ['Inactive'],
  notes: '',
  status: 'inactive',
  totalOrders: 3,
  totalRevenue: 245,
  lastSeen: '5 days ago',
  createdAt: '2023-12-20',
  city: 'Miami',
  country: 'US'
},
{
  id: 'ct5',
  name: 'Emma Wilson',
  phone: '+44 7700 900123',
  email: 'emma@email.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
  tags: ['Newsletter', 'Discount'],
  notes: 'Interested in seasonal promotions.',
  status: 'active',
  totalOrders: 7,
  totalRevenue: 890,
  lastSeen: '3 hours ago',
  createdAt: '2024-02-14',
  city: 'London',
  country: 'UK'
},
{
  id: 'ct6',
  name: 'David Kim',
  phone: '+82 10-1234-5678',
  email: 'david@email.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
  tags: ['VIP', 'Wholesale'],
  notes: 'Corporate account.',
  status: 'active',
  assignedAgent: 'u2',
  totalOrders: 45,
  totalRevenue: 22500,
  lastSeen: '10 min ago',
  createdAt: '2023-09-01',
  city: 'Seoul',
  country: 'KR'
}];


// ─── Conversations ────────────────────────────────────────────────────────────
export const mockConversations: Conversation[] = [
{
  id: 'conv1',
  contactId: 'ct1',
  contact: mockContacts[0],
  status: 'open',
  assignedAgent: 'u2',
  tags: ['Support', 'Order Issue'],
  lastMessage: 'Hi, I wanted to check on my order status?',
  lastMessageTime: '2 min ago',
  unreadCount: 3,
  channel: 'whatsapp'
},
{
  id: 'conv2',
  contactId: 'ct3',
  contact: mockContacts[2],
  status: 'open',
  assignedAgent: 'u3',
  tags: ['Sales'],
  lastMessage: 'Can you send me the wholesale catalog?',
  lastMessageTime: '15 min ago',
  unreadCount: 1,
  channel: 'whatsapp'
},
{
  id: 'conv3',
  contactId: 'ct6',
  contact: mockContacts[5],
  status: 'pending',
  tags: ['New'],
  lastMessage: 'Hello, I need help with my account.',
  lastMessageTime: '1 hour ago',
  unreadCount: 0,
  channel: 'whatsapp'
},
{
  id: 'conv4',
  contactId: 'ct2',
  contact: mockContacts[1],
  status: 'resolved',
  tags: ['Resolved'],
  lastMessage: 'Thank you! Issue resolved.',
  lastMessageTime: '3 hours ago',
  unreadCount: 0,
  channel: 'whatsapp'
},
{
  id: 'conv5',
  contactId: 'ct5',
  contact: mockContacts[4],
  status: 'bot',
  tags: ['Bot'],
  lastMessage: 'Bot: Welcome! How can I help you today?',
  lastMessageTime: '5 hours ago',
  unreadCount: 0,
  channel: 'whatsapp'
}];


// ─── Messages ─────────────────────────────────────────────────────────────────
export const mockMessages: Message[] = [
{
  id: 'm1',
  conversationId: 'conv1',
  content:
  'Hi! I placed an order yesterday (#ORD-1042) and wanted to check the status.',
  type: 'text',
  direction: 'inbound',
  status: 'read',
  timestamp: '10:23 AM'
},
{
  id: 'm2',
  conversationId: 'conv1',
  content: 'Hello Sarah! Let me check that for you right away.',
  type: 'text',
  direction: 'outbound',
  status: 'read',
  sender: 'Agent Mike',
  timestamp: '10:25 AM'
},
{
  id: 'm3',
  conversationId: 'conv1',
  content:
  'Your order #ORD-1042 has been confirmed and is being prepared for shipment. Expected delivery: 2-3 business days.',
  type: 'text',
  direction: 'outbound',
  status: 'read',
  sender: 'Agent Mike',
  timestamp: '10:26 AM'
},
{
  id: 'm4',
  conversationId: 'conv1',
  content: "That's great! Can I also get a tracking number once it ships?",
  type: 'text',
  direction: 'inbound',
  status: 'read',
  timestamp: '10:28 AM'
},
{
  id: 'm5',
  conversationId: 'conv1',
  content:
  "Absolutely! We'll send you the tracking details via WhatsApp as soon as it ships.",
  type: 'text',
  direction: 'outbound',
  status: 'delivered',
  sender: 'Agent Mike',
  timestamp: '10:30 AM'
},
{
  id: 'm6',
  conversationId: 'conv1',
  content: '📝 Internal note: Customer is VIP - prioritize shipping.',
  type: 'note',
  direction: 'outbound',
  status: 'sent',
  sender: 'Agent Mike',
  timestamp: '10:31 AM',
  isNote: true
},
{
  id: 'm7',
  conversationId: 'conv1',
  content: 'Hi, I wanted to check on my order status?',
  type: 'text',
  direction: 'inbound',
  status: 'delivered',
  timestamp: '11:45 AM'
}];


// ─── Products ─────────────────────────────────────────────────────────────────
export const mockProducts: Product[] = [
{
  id: 'p1',
  name: 'Premium Wireless Headphones',
  sku: 'WH-PRO-001',
  price: 149.99,
  discount: 10,
  category: 'Electronics',
  images: [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'],

  inventory: 45,
  status: 'active',
  description: 'High-quality wireless headphones with ANC.',
  createdAt: '2024-01-15'
},
{
  id: 'p2',
  name: 'Organic Cotton T-Shirt',
  sku: 'TS-ORG-M-BLK',
  price: 29.99,
  discount: 0,
  category: 'Apparel',
  images: [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200'],

  inventory: 120,
  status: 'active',
  description: '100% organic cotton, sustainable fashion.',
  createdAt: '2024-01-20'
},
{
  id: 'p3',
  name: 'Smart Water Bottle',
  sku: 'WB-SMART-500',
  price: 49.99,
  discount: 15,
  category: 'Lifestyle',
  images: [
  'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200'],

  inventory: 8,
  status: 'active',
  description: 'Temperature tracking smart bottle.',
  createdAt: '2024-02-01'
},
{
  id: 'p4',
  name: 'Leather Wallet',
  sku: 'LW-SLIM-BRN',
  price: 59.99,
  discount: 0,
  category: 'Accessories',
  images: [
  'https://images.unsplash.com/photo-1627123424574-724758594e93?w=200'],

  inventory: 0,
  status: 'inactive',
  description: 'Genuine leather slim wallet.',
  createdAt: '2024-02-10'
},
{
  id: 'p5',
  name: 'Yoga Mat Pro',
  sku: 'YM-PRO-6MM',
  price: 79.99,
  discount: 20,
  category: 'Sports',
  images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200'],
  inventory: 33,
  status: 'active',
  description: '6mm premium non-slip yoga mat.',
  createdAt: '2024-02-15'
},
{
  id: 'p6',
  name: 'Ceramic Coffee Mug Set',
  sku: 'CM-SET-4PC',
  price: 34.99,
  discount: 5,
  category: 'Kitchen',
  images: [
  'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=200'],

  inventory: 67,
  status: 'active',
  description: 'Set of 4 handcrafted ceramic mugs.',
  createdAt: '2024-03-01'
}];


// ─── Orders ───────────────────────────────────────────────────────────────────
export const mockOrders: Order[] = [
{
  id: 'o1',
  orderNumber: 'ORD-1042',
  contactId: 'ct1',
  contact: mockContacts[0],
  items: [
  {
    productId: 'p1',
    productName: 'Premium Wireless Headphones',
    quantity: 1,
    price: 149.99,
    total: 149.99
  },
  {
    productId: 'p2',
    productName: 'Organic Cotton T-Shirt',
    quantity: 2,
    price: 29.99,
    total: 59.98
  }],

  status: 'confirmed',
  paymentStatus: 'paid',
  total: 209.97,
  createdAt: '2024-03-15',
  updatedAt: '2024-03-15',
  timeline: [
  {
    status: 'Order Placed',
    timestamp: '2024-03-15 09:00',
    note: 'Order received via WhatsApp'
  },
  {
    status: 'Payment Confirmed',
    timestamp: '2024-03-15 09:05',
    note: 'Stripe payment successful'
  },
  {
    status: 'Order Confirmed',
    timestamp: '2024-03-15 10:30',
    note: 'Processing started'
  }]

},
{
  id: 'o2',
  orderNumber: 'ORD-1041',
  contactId: 'ct3',
  contact: mockContacts[2],
  items: [
  {
    productId: 'p5',
    productName: 'Yoga Mat Pro',
    quantity: 5,
    price: 79.99,
    total: 399.95
  }],

  status: 'shipped',
  paymentStatus: 'paid',
  total: 399.95,
  createdAt: '2024-03-14',
  updatedAt: '2024-03-15',
  timeline: [
  { status: 'Order Placed', timestamp: '2024-03-14 14:00' },
  { status: 'Payment Confirmed', timestamp: '2024-03-14 14:10' },
  { status: 'Order Confirmed', timestamp: '2024-03-14 15:00' },
  {
    status: 'Shipped',
    timestamp: '2024-03-15 08:00',
    note: 'Tracking: FX123456789'
  }]

},
{
  id: 'o3',
  orderNumber: 'ORD-1040',
  contactId: 'ct6',
  contact: mockContacts[5],
  items: [
  {
    productId: 'p1',
    productName: 'Premium Wireless Headphones',
    quantity: 10,
    price: 149.99,
    total: 1499.9
  },
  {
    productId: 'p3',
    productName: 'Smart Water Bottle',
    quantity: 10,
    price: 49.99,
    total: 499.9
  }],

  status: 'delivered',
  paymentStatus: 'paid',
  total: 1999.8,
  createdAt: '2024-03-10',
  updatedAt: '2024-03-14',
  timeline: [
  { status: 'Order Placed', timestamp: '2024-03-10 10:00' },
  { status: 'Payment Confirmed', timestamp: '2024-03-10 10:15' },
  { status: 'Order Confirmed', timestamp: '2024-03-10 11:00' },
  {
    status: 'Shipped',
    timestamp: '2024-03-11 09:00',
    note: 'Tracking: FX987654321'
  },
  {
    status: 'Delivered',
    timestamp: '2024-03-14 14:30',
    note: 'Delivered to reception'
  }]

},
{
  id: 'o4',
  orderNumber: 'ORD-1039',
  contactId: 'ct2',
  contact: mockContacts[1],
  items: [
  {
    productId: 'p6',
    productName: 'Ceramic Coffee Mug Set',
    quantity: 1,
    price: 34.99,
    total: 34.99
  }],

  status: 'pending',
  paymentStatus: 'pending',
  total: 34.99,
  createdAt: '2024-03-15',
  updatedAt: '2024-03-15',
  timeline: [{ status: 'Order Placed', timestamp: '2024-03-15 16:00' }]
},
{
  id: 'o5',
  orderNumber: 'ORD-1038',
  contactId: 'ct4',
  contact: mockContacts[3],
  items: [
  {
    productId: 'p2',
    productName: 'Organic Cotton T-Shirt',
    quantity: 3,
    price: 29.99,
    total: 89.97
  }],

  status: 'cancelled',
  paymentStatus: 'refunded',
  total: 89.97,
  createdAt: '2024-03-12',
  updatedAt: '2024-03-13',
  timeline: [
  { status: 'Order Placed', timestamp: '2024-03-12 11:00' },
  {
    status: 'Cancelled',
    timestamp: '2024-03-13 09:00',
    note: 'Customer requested cancellation'
  },
  {
    status: 'Refunded',
    timestamp: '2024-03-13 09:30',
    note: 'Full refund processed'
  }]

}];


// ─── Inventory ────────────────────────────────────────────────────────────────
export const mockInventory: InventoryItem[] = [
{
  id: 'inv1',
  productId: 'p1',
  productName: 'Premium Wireless Headphones',
  sku: 'WH-PRO-001',
  quantity: 45,
  minQuantity: 10,
  stockLevel: 'normal',
  warehouse: 'Main Warehouse',
  lastUpdated: '2024-03-15'
},
{
  id: 'inv2',
  productId: 'p2',
  productName: 'Organic Cotton T-Shirt',
  sku: 'TS-ORG-M-BLK',
  quantity: 120,
  minQuantity: 20,
  stockLevel: 'normal',
  warehouse: 'Main Warehouse',
  lastUpdated: '2024-03-14'
},
{
  id: 'inv3',
  productId: 'p3',
  productName: 'Smart Water Bottle',
  sku: 'WB-SMART-500',
  quantity: 8,
  minQuantity: 15,
  stockLevel: 'low',
  warehouse: 'Main Warehouse',
  lastUpdated: '2024-03-15'
},
{
  id: 'inv4',
  productId: 'p4',
  productName: 'Leather Wallet',
  sku: 'LW-SLIM-BRN',
  quantity: 0,
  minQuantity: 10,
  stockLevel: 'out',
  warehouse: 'Main Warehouse',
  lastUpdated: '2024-03-10'
},
{
  id: 'inv5',
  productId: 'p5',
  productName: 'Yoga Mat Pro',
  sku: 'YM-PRO-6MM',
  quantity: 33,
  minQuantity: 10,
  stockLevel: 'normal',
  warehouse: 'East Warehouse',
  lastUpdated: '2024-03-15'
},
{
  id: 'inv6',
  productId: 'p6',
  productName: 'Ceramic Coffee Mug Set',
  sku: 'CM-SET-4PC',
  quantity: 67,
  minQuantity: 15,
  stockLevel: 'normal',
  warehouse: 'Main Warehouse',
  lastUpdated: '2024-03-13'
}];


// ─── Campaigns ────────────────────────────────────────────────────────────────
export const mockCampaigns: Campaign[] = [
{
  id: 'camp1',
  name: 'Spring Sale 2024',
  template: 'spring_sale_v2',
  audience: ['VIP', 'Repeat Customer'],
  scheduledAt: '2024-03-20 09:00',
  status: 'completed',
  stats: { sent: 1250, delivered: 1198, read: 876, converted: 124 },
  createdAt: '2024-03-15'
},
{
  id: 'camp2',
  name: 'New Product Launch - Headphones',
  template: 'product_launch',
  audience: ['Newsletter'],
  scheduledAt: '2024-03-25 10:00',
  status: 'scheduled',
  stats: { sent: 0, delivered: 0, read: 0, converted: 0 },
  createdAt: '2024-03-16'
},
{
  id: 'camp3',
  name: 'Win-Back Inactive Customers',
  template: 'winback_offer',
  audience: ['Inactive'],
  status: 'draft',
  stats: { sent: 0, delivered: 0, read: 0, converted: 0 },
  createdAt: '2024-03-17'
},
{
  id: 'camp4',
  name: 'Flash Sale - Weekend Only',
  template: 'flash_sale',
  audience: ['All Customers'],
  status: 'running',
  stats: { sent: 3400, delivered: 3289, read: 2100, converted: 312 },
  createdAt: '2024-03-18'
}];


// ─── Workflows ────────────────────────────────────────────────────────────────
export const mockWorkflows: Workflow[] = [
{
  id: 'wf1',
  name: 'Welcome New Customer',
  status: 'active',
  nodes: [
  {
    id: 'n1',
    type: 'trigger',
    label: 'Message Received',
    subtype: 'first_message',
    config: {},
    position: { x: 100, y: 100 }
  },
  {
    id: 'n2',
    type: 'action',
    label: 'Send Welcome Message',
    subtype: 'send_message',
    config: { message: 'Welcome!' },
    position: { x: 100, y: 220 }
  },
  {
    id: 'n3',
    type: 'action',
    label: 'Add Tag',
    subtype: 'add_tag',
    config: { tag: 'New Customer' },
    position: { x: 100, y: 340 }
  }],

  triggerCount: 342,
  lastTriggered: '5 min ago',
  createdAt: '2024-01-20'
},
{
  id: 'wf2',
  name: 'Order Confirmation Flow',
  status: 'active',
  nodes: [
  {
    id: 'n1',
    type: 'trigger',
    label: 'Order Placed',
    subtype: 'order_placed',
    config: {},
    position: { x: 100, y: 100 }
  },
  {
    id: 'n2',
    type: 'action',
    label: 'Send Confirmation',
    subtype: 'send_template',
    config: {},
    position: { x: 100, y: 220 }
  }],

  triggerCount: 1205,
  lastTriggered: '2 min ago',
  createdAt: '2024-01-25'
},
{
  id: 'wf3',
  name: 'Abandoned Cart Recovery',
  status: 'inactive',
  nodes: [],
  triggerCount: 89,
  lastTriggered: '2 days ago',
  createdAt: '2024-02-10'
}];


// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export const mockDashboardStats: DashboardStats = {
  totalConversations: 1284,
  totalRevenue: 48920,
  totalOrders: 342,
  conversionRate: 12.4,
  activeAgents: 5,
  pendingChats: 8
};

export const mockRevenueData = [
{ date: 'Mar 1', value: 3200 },
{ date: 'Mar 3', value: 4100 },
{ date: 'Mar 5', value: 3800 },
{ date: 'Mar 7', value: 5200 },
{ date: 'Mar 9', value: 4800 },
{ date: 'Mar 11', value: 6100 },
{ date: 'Mar 13', value: 5500 },
{ date: 'Mar 15', value: 7200 },
{ date: 'Mar 17', value: 6800 },
{ date: 'Mar 19', value: 8100 },
{ date: 'Mar 21', value: 7500 },
{ date: 'Mar 23', value: 9200 }];


export const mockMessagesData = [
{ date: 'Mar 1', value: 145 },
{ date: 'Mar 3', value: 189 },
{ date: 'Mar 5', value: 167 },
{ date: 'Mar 7', value: 234 },
{ date: 'Mar 9', value: 198 },
{ date: 'Mar 11', value: 278 },
{ date: 'Mar 13', value: 245 },
{ date: 'Mar 15', value: 312 },
{ date: 'Mar 17', value: 289 },
{ date: 'Mar 19', value: 356 },
{ date: 'Mar 21', value: 334 },
{ date: 'Mar 23', value: 401 }];


export const mockAgentPerformance = [
{ name: 'Mike Torres', resolved: 45, avgTime: '4.2m', satisfaction: 4.8 },
{ name: 'Lisa Park', resolved: 38, avgTime: '5.1m', satisfaction: 4.6 },
{ name: 'James Wu', resolved: 52, avgTime: '3.8m', satisfaction: 4.9 },
{ name: 'Ana Costa', resolved: 29, avgTime: '6.3m', satisfaction: 4.4 }];


// ─── Team ─────────────────────────────────────────────────────────────────────
export const mockTeamMembers: TeamMember[] = [
{
  id: 'u1',
  name: 'Alex Johnson',
  email: 'alex@acmecorp.com',
  role: 'owner',
  status: 'active',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  assignedChats: 0,
  resolvedToday: 0,
  joinedAt: '2024-01-01'
},
{
  id: 'u2',
  name: 'Mike Torres',
  email: 'mike@acmecorp.com',
  role: 'agent',
  status: 'active',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
  assignedChats: 8,
  resolvedToday: 45,
  joinedAt: '2024-01-15'
},
{
  id: 'u3',
  name: 'Lisa Park',
  email: 'lisa@acmecorp.com',
  role: 'agent',
  status: 'active',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
  assignedChats: 6,
  resolvedToday: 38,
  joinedAt: '2024-02-01'
},
{
  id: 'u4',
  name: 'James Wu',
  email: 'james@acmecorp.com',
  role: 'admin',
  status: 'active',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
  assignedChats: 3,
  resolvedToday: 52,
  joinedAt: '2024-02-10'
},
{
  id: 'u5',
  name: 'Ana Costa',
  email: 'ana@acmecorp.com',
  role: 'agent',
  status: 'invited',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
  assignedChats: 0,
  resolvedToday: 0,
  joinedAt: '2024-03-15'
}];


// ─── Billing ──────────────────────────────────────────────────────────────────
export const mockPlans: Plan[] = [
{
  id: 'starter',
  name: 'Starter',
  price: 29,
  period: 'monthly',
  features: [
  '1 WhatsApp Number',
  '2 Agents',
  '1,000 Conversations/mo',
  '5 Broadcasts/mo',
  'Basic Analytics'],

  limits: { agents: 2, conversations: 1000, broadcasts: 5 }
},
{
  id: 'growth',
  name: 'Growth',
  price: 79,
  period: 'monthly',
  features: [
  '2 WhatsApp Numbers',
  '10 Agents',
  '10,000 Conversations/mo',
  '50 Broadcasts/mo',
  'Advanced Analytics',
  'Automation Builder',
  'CRM Integration'],

  limits: { agents: 10, conversations: 10000, broadcasts: 50 }
},
{
  id: 'enterprise',
  name: 'Enterprise',
  price: 199,
  period: 'monthly',
  features: [
  'Unlimited Numbers',
  'Unlimited Agents',
  'Unlimited Conversations',
  'Unlimited Broadcasts',
  'Custom Analytics',
  'Priority Support',
  'Custom Integrations',
  'SLA Guarantee'],

  limits: { agents: -1, conversations: -1, broadcasts: -1 }
}];


export const mockInvoices: Invoice[] = [
{
  id: 'inv1',
  number: 'INV-2024-003',
  amount: 79,
  status: 'paid',
  date: '2024-03-01',
  dueDate: '2024-03-15'
},
{
  id: 'inv2',
  number: 'INV-2024-002',
  amount: 79,
  status: 'paid',
  date: '2024-02-01',
  dueDate: '2024-02-15'
},
{
  id: 'inv3',
  number: 'INV-2024-001',
  amount: 29,
  status: 'paid',
  date: '2024-01-01',
  dueDate: '2024-01-15'
}];


export const mockWhatsAppAccount: WhatsAppAccount = {
  phoneNumber: '+1 (555) 234-5678',
  displayName: 'Acme Commerce',
  status: 'connected',
  webhookUrl: 'https://api.acmecorp.com/webhooks/whatsapp',
  lastSync: '2 min ago'
};