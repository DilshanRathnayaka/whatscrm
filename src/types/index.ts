// ─── User & Auth ───────────────────────────────────────────────────────────────
export type UserRole = 'owner' | 'admin' | 'agent';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  status: 'online' | 'away' | 'offline';
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  plan: 'starter' | 'growth' | 'enterprise';
  whatsappConnected: boolean;
  phoneNumber?: string;
}

// ─── Contact / CRM ────────────────────────────────────────────────────────────
export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  tags: string[];
  notes: string;
  status: 'active' | 'inactive' | 'blocked';
  assignedAgent?: string;
  totalOrders: number;
  totalRevenue: number;
  lastSeen: string;
  createdAt: string;
  city?: string;
  country?: string;
}

// ─── Chat / Inbox ─────────────────────────────────────────────────────────────
export type MessageType = 'text' | 'image' | 'template' | 'product' | 'note';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';
export type ConversationStatus = 'open' | 'resolved' | 'pending' | 'bot';

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  type: MessageType;
  direction: 'inbound' | 'outbound';
  status: MessageStatus;
  sender?: string;
  timestamp: string;
  mediaUrl?: string;
  isNote?: boolean;
}

export interface Conversation {
  id: string;
  contactId: string;
  contact: Contact;
  status: ConversationStatus;
  assignedAgent?: string;
  tags: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  channel: 'whatsapp';
}

// ─── Products ─────────────────────────────────────────────────────────────────
export type ProductStatus = 'active' | 'inactive' | 'draft';

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  discount: number;
  category: string;
  images: string[];
  inventory: number;
  status: ProductStatus;
  description?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  productCount: number;
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export type OrderStatus =
  'pending' |
  'confirmed' |
  'shipped' |
  'delivered' |
  'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';
export type PaymentMethod =
  'cod' |
  'card' |
  'upi' |
  'bank_transfer' |
  'wallet' |
  'other';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  contactId: string;
  contact: Contact;
  items: OrderItem[];
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  timeline: OrderTimeline[];
}

export interface OrderTimeline {
  status: string;
  timestamp: string;
  note?: string;
}

// ─── Inventory ────────────────────────────────────────────────────────────────
export type StockLevel = 'normal' | 'low' | 'out';

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  minQuantity: number;
  stockLevel: StockLevel;
  warehouse: string;
  lastUpdated: string;
}

// ─── Broadcast / Campaign ─────────────────────────────────────────────────────
export type CampaignStatus =
  'draft' |
  'scheduled' |
  'running' |
  'completed' |
  'failed';

export interface Campaign {
  id: string;
  name: string;
  template: string;
  audience: string[];
  scheduledAt?: string;
  status: CampaignStatus;
  stats: {
    sent: number;
    delivered: number;
    read: number;
    converted: number;
  };
  createdAt: string;
}

// ─── Automation ───────────────────────────────────────────────────────────────
export type WorkflowNodeType = 'trigger' | 'condition' | 'action';
export type WorkflowStatus = 'active' | 'inactive' | 'draft';

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  subtype: string;
  config: Record<string, unknown>;
  position: { x: number; y: number; };
}

export interface Workflow {
  id: string;
  name: string;
  status: WorkflowStatus;
  nodes: WorkflowNode[];
  triggerCount: number;
  lastTriggered?: string;
  createdAt: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalConversations: number;
  totalRevenue: number;
  totalOrders: number;
  conversionRate: number;
  activeAgents: number;
  pendingChats: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

// ─── WhatsApp Setup ───────────────────────────────────────────────────────────
export type SetupStep =
  'meta' |
  'business' |
  'phone' |
  'otp' |
  'template' |
  'webhook';
export type ConnectionStatus =
  'connected' |
  'error' |
  'pending' |
  'disconnected';

export interface WhatsAppAccount {
  phoneNumber: string;
  displayName: string;
  status: ConnectionStatus;
  webhookUrl?: string;
  lastSync?: string;
}

// ─── Billing ──────────────────────────────────────────────────────────────────
export interface Plan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  limits: {
    agents: number;
    conversations: number;
    broadcasts: number;
  };
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  date: string;
  dueDate: string;
}

// ─── Team ─────────────────────────────────────────────────────────────────────
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'invited' | 'inactive';
  avatar?: string;
  assignedChats: number;
  resolvedToday: number;
  joinedAt: string;
}