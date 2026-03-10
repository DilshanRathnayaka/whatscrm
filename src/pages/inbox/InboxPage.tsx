import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  SearchIcon,
  PlusIcon,
  SendIcon,
  PaperclipIcon,
  SmileIcon,
  MoreVerticalIcon,
  TagIcon,
  UserPlusIcon,
  CheckCheckIcon,
  StickyNoteIcon,
} from
  'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAppStore } from '../../store/useAppStore';
import {
  mockContacts,
  mockTeamMembers
} from
  '../../data/mockData';
import { buildContactsApiUrl, buildInboxApiUrl } from '../../config/api';
import { apiFetch } from '../../services/http';
import { connectWebSocket } from '../../services/whatsappSocket';
import type {
  Conversation,
  Contact,
  Message,
  ConversationStatus,
  MessageStatus
} from '../../types';
const statusColors: Record<string, 'green' | 'yellow' | 'gray' | 'blue'> = {
  open: 'green',
  pending: 'yellow',
  resolved: 'gray',
  bot: 'blue'
};

type InboxApiMessage = {
  id?: string | number;
  from?: string;
  phone?: string;
  body?: string;
  message?: string;
  direction?: string;
  timestamp?: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
};

type InboxApiConversation = {
  id?: string | number;
  conversationId?: string | number;
  contactName?: string;
  phone?: string;
  contactPhone?: string;
  status?: string;
  unreadCount?: number;
  lastMessage?: string;
  lastMessageText?: string;
  lastMessageTime?: string;
  updatedAt?: string;
  tags?: string[];
  assignedAgent?: string;
  contact?: {
    id?: string;
    name?: string;
    phone?: string;
    avatar?: string;
    email?: string;
  };
};

type InboxApiMessageDto = {
  id?: string | number;
  messageId?: string | number;
  conversationId?: string | number;
  from?: string;
  to?: string;
  phone?: string;
  body?: string;
  message?: string;
  text?: string;
  content?: string;
  direction?: string;
  senderType?: 'user' | 'customer' | string;
  timestamp?: string;
  createdAt?: string;
  status?: string;
};

const normalizePhone = (phone: string) => phone.replace(/[^\d+]/g, '');

const normalizeDirection = (
  direction?: string,
  senderType?: string
): 'inbound' | 'outbound' => {
  const normalizedDirection = (direction ?? '').toLowerCase().trim();
  if (normalizedDirection === 'inbound' || normalizedDirection === 'outbound') {
    return normalizedDirection;
  }

  const normalizedSenderType = (senderType ?? '').toLowerCase().trim();
  if (normalizedSenderType === 'user' || normalizedSenderType === 'agent') {
    return 'outbound';
  }

  return 'inbound';
};

const normalizeConversationStatus = (status?: string): ConversationStatus => {
  if (!status) return 'open';
  const lowered = status.toLowerCase();

  if (
    lowered === 'open' ||
    lowered === 'pending' ||
    lowered === 'resolved' ||
    lowered === 'bot'
  ) {
    return lowered;
  }

  return 'open';
};

const normalizeMessageStatus = (status?: string): MessageStatus => {
  if (!status) return 'read';
  const lowered = status.toLowerCase();

  if (
    lowered === 'sent' ||
    lowered === 'delivered' ||
    lowered === 'read' ||
    lowered === 'failed'
  ) {
    return lowered;
  }

  return 'read';
};

const formatTime = (value?: string) => {
  if (!value) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const toTimestampKey = (value?: string) => {
  if (!value) return 'no-time';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return String(parsed.getTime());
};

const buildMessageDeterministicId = (
  conversationId: string,
  direction: 'inbound' | 'outbound',
  content: string,
  timestamp?: string,
  senderSeed?: string
) => {
  const normalizedContent = content.trim().toLowerCase();
  const normalizedSender = (senderSeed ?? '').trim().toLowerCase();
  return `msg:${conversationId}|${direction}|${normalizedContent}|${toTimestampKey(timestamp)}|${normalizedSender}`;
};

const getMessageDedupKey = (message: Message) => {
  return `${message.conversationId}|${message.direction}|${message.content.trim().toLowerCase()}|${message.timestamp}`;
};

const getContactForPhone = (phone: string): Contact => {
  const cleaned = normalizePhone(phone);
  const matched = mockContacts.find(
    (contact) => normalizePhone(contact.phone) === cleaned
  );

  if (matched) return matched;

  return {
    id: `contact-${cleaned}`,
    name: phone,
    phone,
    tags: ['WhatsApp'],
    notes: '',
    status: 'active',
    totalOrders: 0,
    totalRevenue: 0,
    lastSeen: 'Just now',
    createdAt: new Date().toISOString()
  };
};

const resolveConversationId = (item: InboxApiConversation): string | null => {
  const rawId = item.id ?? item.conversationId;
  if (rawId !== undefined && rawId !== null && String(rawId).trim()) {
    return String(rawId);
  }

  const phone = item.phone ?? item.contactPhone ?? item.contact?.phone;
  if (!phone) return null;

  return `phone-${normalizePhone(phone)}`;
};

const mapConversationFromApi = (item: InboxApiConversation): Conversation | null => {
  const id = resolveConversationId(item);
  if (!id) return null;

  const contactPhone = item.contact?.phone ?? item.phone ?? item.contactPhone ?? '';
  const fallbackPhone = id.startsWith('phone-') ? id.slice(6) : id;
  const baseContact = getContactForPhone(contactPhone || fallbackPhone);

  const contact: Contact = {
    ...baseContact,
    id: item.contact?.id ?? baseContact.id,
    name: item.contactName ?? item.contact?.name ?? baseContact.name,
    phone: contactPhone || baseContact.phone,
    avatar: item.contact?.avatar ?? baseContact.avatar,
    email: item.contact?.email ?? baseContact.email
  };

  const lastMessage = item.lastMessageText ?? item.lastMessage ?? '';
  const lastMessageTime = formatTime(item.lastMessageTime ?? item.updatedAt);

  return {
    id,
    contactId: contact.id,
    contact,
    status: normalizeConversationStatus(item.status),
    assignedAgent: item.assignedAgent,
    tags: item.tags ?? ['Live'],
    lastMessage,
    lastMessageTime,
    unreadCount: Number(item.unreadCount ?? 0),
    channel: 'whatsapp'
  };
};

const mapMessageDto = (
  item: InboxApiMessageDto,
  fallbackConversationId: string
): Message | null => {
  const content = item.content ?? item.text ?? item.body ?? item.message;
  if (!content) return null;

  const rawConversationId = item.conversationId;
  const conversationId =
    rawConversationId !== undefined && rawConversationId !== null && String(rawConversationId).trim() ?
      String(rawConversationId) :
      fallbackConversationId;

  const phone = item.from ?? item.to ?? item.phone;
  const sourceTimestamp = item.timestamp ?? item.createdAt;
  const direction = normalizeDirection(item.direction, item.senderType);

  return {
    id:
      item.id !== undefined && item.id !== null ?
        String(item.id) :
        item.messageId !== undefined && item.messageId !== null ?
          String(item.messageId) :
          buildMessageDeterministicId(
            conversationId,
            direction,
            content,
            sourceTimestamp,
            phone
          ),
    conversationId,
    content,
    type: 'text',
    direction,
    status: normalizeMessageStatus(item.status),
    sender: direction === 'outbound' ? 'You' : (phone ?? 'Customer'),
    timestamp: formatTime(sourceTimestamp)
  };
};

const mapApiMessage = (item: InboxApiMessage): Message | null => {
  const phone = item.from ?? item.phone;
  const content = item.body ?? item.message;
  if (!phone || !content) return null;

  const conversationId = `phone-${normalizePhone(phone)}`;
  const sourceTimestamp = item.timestamp;
  const direction = normalizeDirection(item.direction);

  return {
    id:
      typeof item.id === 'string' || typeof item.id === 'number' ?
        String(item.id) :
        buildMessageDeterministicId(
          conversationId,
          direction,
          content,
          sourceTimestamp,
          phone
        ),
    conversationId,
    content,
    type: 'text',
    direction,
    status: item.status ?? 'read',
    sender: direction === 'outbound' ? 'You' : (phone ?? 'Customer'),
    timestamp: formatTime(sourceTimestamp)
  };
};

const buildMessageSignatures = (item: InboxApiMessage) => {
  const signatures: string[] = [];
  const phone = normalizePhone(item.from ?? item.phone ?? '');
  const content = (item.body ?? item.message ?? '').trim().toLowerCase();
  const direction = normalizeDirection(item.direction);
  const timestamp = item.timestamp ? String(new Date(item.timestamp).getTime()) : '';
  const externalId =
    typeof item.id === 'string' || typeof item.id === 'number' ? String(item.id) : '';

  if (externalId) {
    signatures.push(`id:${externalId}`);
  }

  signatures.push(`sig:${phone}|${direction}|${content}|${timestamp}`);

  // Handles duplicated events where id/timestamp fields differ across frames.
  signatures.push(`weak:${phone}|${direction}|${content}`);
  return signatures;
};

const upsertConversationActivity = (
  previous: Conversation[],
  message: Message,
  incrementUnread: boolean
): Conversation[] => {
  const index = previous.findIndex((conv) => conv.id === message.conversationId);

  if (index === -1) {
    const inferredPhone =
      message.conversationId.startsWith('phone-') ?
        message.conversationId.slice(6) :
        message.sender ?? message.conversationId;
    const contact = getContactForPhone(inferredPhone);

    const createdConversation: Conversation = {
      id: message.conversationId,
      contactId: contact.id,
      contact,
      status: 'open',
      tags: ['Live'],
      lastMessage: message.content,
      lastMessageTime: message.timestamp,
      unreadCount: incrementUnread ? 1 : 0,
      channel: 'whatsapp'
    };

    return [
      createdConversation,
      ...previous
    ];
  }

  const current = previous[index];
  const updated: Conversation = {
    ...current,
    lastMessage: message.content,
    lastMessageTime: message.timestamp,
    unreadCount: incrementUnread ? current.unreadCount + 1 : current.unreadCount
  };

  return [updated, ...previous.slice(0, index), ...previous.slice(index + 1)];
};

const mergeMessagesForConversation = (
  previous: Message[],
  conversationId: string,
  incoming: Message[]
) => {
  const byKey = new Map<string, Message>();
  incoming.forEach((message) => {
    byKey.set(getMessageDedupKey(message), message);
  });

  const others = previous.filter((message) => message.conversationId !== conversationId);
  return [...others, ...Array.from(byKey.values())];
};

export function InboxPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    activeConversationId,
    setActiveConversation,
    inboxFilter,
    setInboxFilter,
    setNotifications
  } = useAppStore();
  const [messageInput, setMessageInput] = useState('');
  const [isNote, setIsNote] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isReceivingMessage, setIsReceivingMessage] = useState(false);
  const [apiFeedback, setApiFeedback] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showConversationMenu, setShowConversationMenu] = useState(false);
  const [showSaveContactModal, setShowSaveContactModal] = useState(false);
  const [contactNameInput, setContactNameInput] = useState('');
  const [isSavingContact, setIsSavingContact] = useState(false);
  const seenMessageSignatures = useRef<Map<string, number>>(new Map());
  const activeConversationIdRef = useRef<string | null>(null);
  const receivingIndicatorTimeoutRef = useRef<number | null>(null);
  const conversationMenuRef = useRef<HTMLDivElement | null>(null);
  const handledPhoneSelectionRef = useRef<string | null>(null);

  const activeConv = conversations.find(
    (c) => c.id === activeConversationId
  );
  const convMessages = messages.filter(
    (m) => m.conversationId === activeConversationId
  );

  const filteredConvs = conversations.filter((c) => {
    const matchesFilter = inboxFilter === 'all' || c.status === inboxFilter;
    const matchesSearch =
      !searchQuery ||
      c.contact.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleOpenContactDetail = (contact: Contact, fallbackId?: string) => {
    const targetId = contact.id || fallbackId || `phone-${normalizePhone(contact.phone)}`;
    navigate(`/contacts/${encodeURIComponent(targetId)}`, {
      state: {
        contact: {
          ...contact,
          id: targetId
        }
      }
    });
  };

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversation(conversationId);
    void markConversationAsRead(conversationId);
    setShowConversationMenu(false);
  };

  const handleOpenSaveContactModal = () => {
    setShowConversationMenu(false);
    setContactNameInput(activeConv?.contact.name ?? '');
    setShowSaveContactModal(true);
  };

  const handleSaveContact = async () => {
    if (!activeConversationId) return;
    const trimmedName = contactNameInput.trim();
    if (!trimmedName) {
      setApiFeedback('Contact name is required');
      return;
    }

    setIsSavingContact(true);
    setApiFeedback(null);

    try {
      const endpoint = `/save-contacts?id=${encodeURIComponent(activeConversationId)}&name=${encodeURIComponent(trimmedName)}`;
      const response = await apiFetch(buildContactsApiUrl(endpoint), {
        method: 'POST'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to save contact (${response.status})`);
      }

      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === activeConversationId ?
            {
              ...conversation,
              contact: {
                ...conversation.contact,
                name: trimmedName
              }
            } :
            conversation
        )
      );

      setShowSaveContactModal(false);
    } catch (error) {
      setApiFeedback(
        error instanceof Error ? error.message : 'Unable to save contact'
      );
    } finally {
      setIsSavingContact(false);
    }
  };

  const fetchConversations = async () => {
    setIsLoadingConversations(true);

    try {
      const response = await apiFetch(buildInboxApiUrl('/conversations'));
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to load conversations (${response.status})`);
      }

      const payload = (await response.json()) as InboxApiConversation[];
      const mapped = payload
        .map(mapConversationFromApi)
        .filter((item): item is Conversation => item !== null);

      setConversations(mapped);
      setApiFeedback(null);
    } catch (error) {
      setApiFeedback(
        error instanceof Error ? error.message : 'Unable to load conversations'
      );
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    setIsLoadingMessages(true);

    try {
      const encodedId = encodeURIComponent(conversationId);
      const response = await apiFetch(buildInboxApiUrl(`/${encodedId}`));
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to load messages (${response.status})`);
      }

      const payload = (await response.json()) as InboxApiMessageDto[];
      const mapped = payload
        .map((item) => mapMessageDto(item, conversationId))
        .filter((item): item is Message => item !== null);

      setMessages((previous) =>
        mergeMessagesForConversation(previous, conversationId, mapped)
      );
      setApiFeedback(null);
    } catch (error) {
      setApiFeedback(
        error instanceof Error ? error.message : 'Unable to load messages'
      );
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const markConversationAsRead = async (conversationId: string) => {
    try {
      const encodedId = encodeURIComponent(conversationId);
      const response = await apiFetch(buildInboxApiUrl(`/conversations/${encodedId}/read`), {
        method: 'PUT'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to mark read (${response.status})`);
      }

      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation
        )
      );
      setApiFeedback(null);
    } catch (error) {
      setApiFeedback(
        error instanceof Error ? error.message : 'Unable to update read state'
      );
    }
  };

  const updateConversationStatus = async (
    conversationId: string,
    status: ConversationStatus
  ) => {
    try {
      const encodedId = encodeURIComponent(conversationId);
      const response = await apiFetch(
        buildInboxApiUrl(`/conversations/${encodedId}/status`),
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to update status (${response.status})`);
      }

      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === conversationId ? { ...conversation, status } : conversation
        )
      );
      setApiFeedback(null);
    } catch (error) {
      setApiFeedback(
        error instanceof Error ? error.message : 'Unable to update conversation status'
      );
    }
  };

  useEffect(() => {
    void fetchConversations();
  }, []);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    const stompClient = connectWebSocket<InboxApiMessage>((receivedMessage) => {
      const signatures = buildMessageSignatures(receivedMessage);
      const now = Date.now();
      const hasRecentDuplicate = signatures.some((signature) => {
        const seenAt = seenMessageSignatures.current.get(signature);
        return Boolean(seenAt && now - seenAt < 10000);
      });

      if (hasRecentDuplicate) {
        return;
      }

      signatures.forEach((signature) => {
        seenMessageSignatures.current.set(signature, now);
      });

      if (seenMessageSignatures.current.size > 1000) {
        const expiry = now - 60000;
        seenMessageSignatures.current.forEach((time, key) => {
          if (time < expiry) {
            seenMessageSignatures.current.delete(key);
          }
        });
      }

      const mapped = mapApiMessage(receivedMessage);
      if (!mapped) return;

      if (mapped.direction === 'inbound') {
        setIsReceivingMessage(true);
        if (receivingIndicatorTimeoutRef.current) {
          window.clearTimeout(receivingIndicatorTimeoutRef.current);
        }

        receivingIndicatorTimeoutRef.current = window.setTimeout(() => {
          setIsReceivingMessage(false);
          receivingIndicatorTimeoutRef.current = null;
        }, 1200);
      }

      setMessages((previous) => {
        const incomingKey = getMessageDedupKey(mapped);
        const exists = previous.some(
          (message) =>
            message.id === mapped.id || getMessageDedupKey(message) === incomingKey
        );
        if (exists) return previous;

        const shouldIncrementUnread =
          mapped.direction === 'inbound' && mapped.conversationId !== activeConversationIdRef.current;
        setConversations((previousConversations) =>
          upsertConversationActivity(previousConversations, mapped, shouldIncrementUnread)
        );

        return [...previous, mapped];
      });

      setApiFeedback(null);
    });

    return () => {
      if (receivingIndicatorTimeoutRef.current) {
        window.clearTimeout(receivingIndicatorTimeoutRef.current);
        receivingIndicatorTimeoutRef.current = null;
      }

      if (stompClient && stompClient.connected) {
        stompClient.disconnect(() => undefined);
      }
    };
  }, []);

  useEffect(() => {
    const unreadCount = conversations.reduce(
      (total, conversation) => total + Math.max(0, conversation.unreadCount ?? 0),
      0
    );
    setNotifications(unreadCount);
  }, [conversations, setNotifications]);

  useEffect(() => {
    if (activeConversationId) return;
    if (conversations.length === 0) return;
    setActiveConversation(conversations[0].id);
  }, [activeConversationId, conversations, setActiveConversation]);

  useEffect(() => {
    if (!activeConversationId) return;

    void fetchMessages(activeConversationId);
  }, [activeConversationId]);

  useEffect(() => {
    const searchPhone = new URLSearchParams(location.search).get('phone') ?? '';
    const statePhone =
      typeof location.state === 'object' && location.state !== null && 'phone' in location.state ?
        String((location.state as { phone?: string }).phone ?? '') :
        '';
    const targetPhone = normalizePhone(searchPhone || statePhone);

    if (!targetPhone || conversations.length === 0) return;
    if (handledPhoneSelectionRef.current === targetPhone) return;

    const matchedConversation = conversations.find(
      (conversation) => normalizePhone(conversation.contact.phone) === targetPhone
    );

    if (!matchedConversation) return;

    handledPhoneSelectionRef.current = targetPhone;

    if (matchedConversation.id !== activeConversationId) {
      setActiveConversation(matchedConversation.id);
      void markConversationAsRead(matchedConversation.id);
    }
  }, [activeConversationId, conversations, location.search, location.state, setActiveConversation]);

  useEffect(() => {
    if (!showConversationMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;
      if (!conversationMenuRef.current || !(target instanceof Node)) return;

      if (!conversationMenuRef.current.contains(target)) {
        setShowConversationMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showConversationMenu]);

  const activePhone = useMemo(() => {
    return activeConv?.contact.phone ?? '';
  }, [activeConv?.contact.phone]);

  const handleSend = async () => {
    if (!messageInput.trim()) return;

    if (!activeConversationId || !activePhone) return;

    if (isNote) {
      const noteMessage: Message = {
        id: `note-${Date.now()}`,
        conversationId: activeConversationId,
        content: messageInput.trim(),
        type: 'note',
        direction: 'outbound',
        status: 'sent',
        sender: 'Internal',
        isNote: true,
        timestamp: formatTime()
      };

      const nextMessages = [...messages, noteMessage];
      setMessages(nextMessages);
      setMessageInput('');
      return;
    }

    setIsSendingMessage(true);
    setApiFeedback(null);

    try {
      const response = await apiFetch(buildInboxApiUrl('/send'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: activePhone,
          message: messageInput.trim()
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to send message (${response.status})`);
      }

      const outgoingMessage: Message = {
        id: `out-${Date.now()}`,
        conversationId: activeConversationId,
        content: messageInput.trim(),
        type: 'text',
        direction: 'outbound',
        status: 'sent',
        sender: 'You',
        timestamp: formatTime()
      };

      const nextMessages = [...messages, outgoingMessage];
      setMessages(nextMessages);
      setConversations((previous) =>
        upsertConversationActivity(previous, outgoingMessage, false)
      );
      setMessageInput('');
    } catch (error) {
      setApiFeedback(
        error instanceof Error ? error.message : 'Unable to send message'
      );
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Chat List ── */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-[var(--border-color)] bg-[var(--bg-primary)]">
        {/* Header */}
        <div className="p-3 border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Conversations
            </h2>
            <Button variant="ghost" size="xs" icon={<PlusIcon size={14} />} />
          </div>
          <div className="relative">
            <SearchIcon
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />

            <input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[var(--input-border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-brand-green/30" />

          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1 px-3 py-2 border-b border-[var(--border-color)] overflow-x-auto">
          {(['all', 'open', 'pending', 'resolved', 'bot'] as const).map((f) =>
            <button
              key={f}
              onClick={() => setInboxFilter(f)}
              className={`px-2.5 py-1 text-xs rounded-full font-medium whitespace-nowrap transition-colors ${inboxFilter === f ? 'bg-brand-green text-white' : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]'}`}>

              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          )}
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingConversations &&
            <div className="px-3 py-2 text-xs text-[var(--text-muted)]">
              Loading conversations...
            </div>
          }
          {filteredConvs.map((conv) =>
            <ConversationItem
              key={conv.id}
              conv={conv}
              isActive={conv.id === activeConversationId}
              onClick={() => handleConversationSelect(conv.id)} />

          )}
        </div>
      </div>

      {/* ── Chat Thread ── */}
      {activeConv ?
        <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-secondary)]">
          {/* Chat header */}
          <div className="h-14 flex items-center justify-between px-4 bg-[var(--bg-primary)] border-b border-[var(--border-color)] flex-shrink-0">
            <div className="flex items-center gap-3">
              <Avatar
                src={activeConv.contact.avatar}
                name={activeConv.contact.name}
                size="md"
                status="online" />

              <div>
                <button
                  type="button"
                  onClick={() => handleOpenContactDetail(activeConv.contact, activeConv.id)}
                  className="text-sm font-semibold text-[var(--text-primary)] hover:underline">
                  {activeConv.contact.name}
                </button>
                <p className="text-xs text-[var(--text-muted)]">
                  {activeConv.contact.phone}
                </p>
              </div>
              <Badge variant={statusColors[activeConv.status]} size="sm">
                {activeConv.status}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="xs"
                icon={<UserPlusIcon size={14} />}
                onClick={() => setShowAssign(!showAssign)}>

                Assign
              </Button>
              <Button variant="ghost" size="xs" icon={<TagIcon size={14} />}>
                Tag
              </Button>
              <div ref={conversationMenuRef} className="relative">
                <Button
                  variant="ghost"
                  size="xs"
                  icon={<MoreVerticalIcon size={14} />}
                  onClick={() => setShowConversationMenu((previous) => !previous)}
                />

                {showConversationMenu &&
                  <div className="absolute right-0 top-9 z-20 min-w-36 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-md p-1">
                    <button
                      onClick={handleOpenSaveContactModal}
                      className="w-full text-left px-3 py-2 text-xs rounded-md text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
                      Save Contact
                    </button>
                    <button
                      onClick={() => {
                        if (!activeConversationId) return;
                        setShowConversationMenu(false);
                        void updateConversationStatus(activeConversationId, 'open');
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded-md text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
                      Reopen
                    </button>
                  </div>
                }
              </div>
              <Button
                variant="success"
                size="xs"
                onClick={() => {
                  if (!activeConversationId) return;
                  void updateConversationStatus(activeConversationId, 'resolved');
                }}>
                Resolve
              </Button>

            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoadingMessages &&
              <div className="text-xs text-[var(--text-muted)]">
                Loading messages...
              </div>
            }
            {apiFeedback &&
              <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-3 py-2 text-xs text-red-700 dark:text-red-300">
                {apiFeedback}
              </div>
            }
            {convMessages.map((msg) =>
              <div
                key={msg.id}
                className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>

                {msg.isNote ?
                  <div className="max-w-[70%] bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-1 mb-1">
                      <StickyNoteIcon size={12} className="text-yellow-600" />
                      <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                        Internal Note
                      </span>
                    </div>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      {msg.content}
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                      {msg.timestamp}
                    </p>
                  </div> :

                  <div
                    className={`max-w-[70%] ${msg.direction === 'outbound' ? 'chat-bubble-sent' : 'chat-bubble-received'} px-3 py-2`}>

                    {msg.sender && msg.direction === 'outbound' &&
                      <p className="text-xs font-medium mb-1 opacity-80">
                        {msg.sender}
                      </p>
                    }
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 ${msg.direction === 'outbound' ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>

                      <span className="text-xs">{msg.timestamp}</span>
                      {msg.direction === 'outbound' &&
                        <CheckCheckIcon
                          size={12}
                          className={
                            msg.status === 'read' ? 'text-blue-300' : ''
                          } />

                      }
                    </div>
                  </div>
                }
              </div>
            )}

            {isReceivingMessage &&
              <div className="flex justify-start">
                <div className="chat-bubble-received px-4 py-3 flex items-center gap-1">
                  <span className="typing-dot w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full" />
                  <span className="typing-dot w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full" />
                  <span className="typing-dot w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full" />
                </div>
              </div>
            }
          </div>

          {/* Message input */}
          <div className="bg-[var(--bg-primary)] border-t border-[var(--border-color)] p-3 flex-shrink-0">
            {/* Note toggle */}
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setIsNote(false)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${!isNote ? 'bg-brand-green text-white' : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]'}`}>

                Reply
              </button>
              <button
                onClick={() => setIsNote(true)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${isNote ? 'bg-yellow-500 text-white' : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]'}`}>

                Internal Note
              </button>
            </div>

            <div
              className={`flex items-end gap-2 rounded-xl border p-2 ${isNote ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10' : 'border-[var(--input-border)] bg-[var(--input-bg)]'}`}>

              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={
                  isNote ? 'Add an internal note...' : 'Type a message...'
                }
                rows={2}
                className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }} />

              <div className="flex items-center gap-1 flex-shrink-0">
                <button className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  <PaperclipIcon size={16} />
                </button>
                <button className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  <SmileIcon size={16} />
                </button>
                <button
                  onClick={handleSend}
                  disabled={isSendingMessage}
                  className="w-8 h-8 bg-brand-green hover:bg-brand-green-dark rounded-lg flex items-center justify-center text-white transition-colors">

                  <SendIcon size={14} />
                </button>
              </div>
            </div>
          </div>
        </div> :

        <div className="flex-1 flex items-center justify-center bg-[var(--bg-secondary)]">
          <div className="text-center">
            <MessageSquareIcon
              size={48}
              className="text-[var(--text-muted)] mx-auto mb-3" />

            <p className="text-[var(--text-muted)]">
              Select a conversation to start
            </p>
          </div>
        </div>
      }

      {/* ── Customer Profile Panel ── */}
      {activeConv &&
        <div className="w-72 flex-shrink-0 border-l border-[var(--border-color)] bg-[var(--bg-primary)] overflow-y-auto">
          <div className="p-4 border-b border-[var(--border-color)] text-center">
            <Avatar
              src={activeConv.contact.avatar}
              name={activeConv.contact.name}
              size="xl"
              className="mx-auto mb-2" />

            <button
              type="button"
              onClick={() => handleOpenContactDetail(activeConv.contact, activeConv.id)}
              className="font-semibold text-[var(--text-primary)] hover:underline">
              {activeConv.contact.name}
            </button>
            <p className="text-xs text-[var(--text-muted)]">
              {activeConv.contact.phone}
            </p>
            <div className="flex flex-wrap gap-1 justify-center mt-2">
              {activeConv.contact.tags.map((tag) =>
                <Badge key={tag} variant="blue" size="sm">
                  {tag}
                </Badge>
              )}
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[var(--bg-secondary)] rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold text-[var(--text-primary)]">
                  {activeConv.contact.totalOrders}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Orders</p>
              </div>
              <div className="bg-[var(--bg-secondary)] rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold text-[var(--text-primary)]">
                  ${activeConv.contact.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Revenue</p>
              </div>
            </div>

            {/* Contact info */}
            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
                Contact Info
              </p>
              <div className="space-y-1.5">
                {activeConv.contact.email &&
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <span className="text-[var(--text-muted)]">Email:</span>
                    <span>{activeConv.contact.email}</span>
                  </div>
                }
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <span className="text-[var(--text-muted)]">Last seen:</span>
                  <span>{activeConv.contact.lastSeen}</span>
                </div>
                {activeConv.contact.city &&
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <span className="text-[var(--text-muted)]">Location:</span>
                    <span>
                      {activeConv.contact.city}, {activeConv.contact.country}
                    </span>
                  </div>
                }
              </div>
            </div>

            {/* Assigned agent */}
            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
                Assigned To
              </p>
              {activeConv.assignedAgent ?
                <div className="flex items-center gap-2">
                  <Avatar
                    name={
                      mockTeamMembers.find(
                        (m) => m.id === activeConv.assignedAgent
                      )?.name || 'Agent'
                    }
                    size="sm" />

                  <span className="text-xs text-[var(--text-primary)]">
                    {mockTeamMembers.find(
                      (m) => m.id === activeConv.assignedAgent
                    )?.name || 'Unknown'}
                  </span>
                </div> :

                <Button
                  variant="outline"
                  size="xs"
                  fullWidth
                  icon={<UserPlusIcon size={12} />}>

                  Assign Agent
                </Button>
              }
            </div>

            {/* Notes */}
            {activeConv.contact.notes &&
              <div>
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
                  Notes
                </p>
                <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] rounded-lg p-2.5">
                  {activeConv.contact.notes}
                </p>
              </div>
            }
          </div>
        </div>
      }
      <Modal
        isOpen={showSaveContactModal}
        onClose={() => setShowSaveContactModal(false)}
        title="Save Contact"
        subtitle="Enter a name for this conversation contact"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSaveContactModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveContact}
              loading={isSavingContact}
            >
              Add
            </Button>
          </>
        }
      >
        <Input
          label="Name"
          placeholder="Enter contact name"
          value={contactNameInput}
          onChange={(event) => setContactNameInput(event.target.value)}
        />
      </Modal>
    </div>);

}
function MessageSquareIcon({
  size,
  className



}: { size: number; className?: string; }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}>

      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>);

}
function ConversationItem({
  conv,
  isActive,
  onClick




}: { conv: Conversation; isActive: boolean; onClick: () => void; }) {
  const statusDotColors: Record<string, string> = {
    open: 'bg-green-500',
    pending: 'bg-yellow-500',
    resolved: 'bg-gray-400',
    bot: 'bg-blue-500'
  };
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-3 py-3 text-left transition-colors border-b border-[var(--border-color)] ${isActive ? 'bg-brand-green/10 border-l-2 border-l-brand-green' : 'hover:bg-[var(--bg-secondary)]'}`}>

      <div className="relative flex-shrink-0">
        <Avatar src={conv.contact.avatar} name={conv.contact.name} size="md" />
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${statusDotColors[conv.status]} rounded-full border-2 border-[var(--bg-primary)]`} />

      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p
            className={`text-sm font-medium truncate ${isActive ? 'text-brand-green' : 'text-[var(--text-primary)]'}`}>

            {conv.contact.name}
          </p>
          <span className="text-xs text-[var(--text-muted)] flex-shrink-0 ml-1">
            {conv.lastMessageTime}
          </span>
        </div>
        <p className="text-xs text-[var(--text-muted)] truncate">
          {conv.lastMessage}
        </p>
        {conv.tags.length > 0 &&
          <div className="flex gap-1 mt-1">
            {conv.tags.slice(0, 2).map((tag) =>
              <span
                key={tag}
                className="text-xs px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-muted)] rounded">

                {tag}
              </span>
            )}
          </div>
        }
      </div>
      {conv.unreadCount > 0 &&
        <span className="w-5 h-5 bg-brand-green text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          {conv.unreadCount}
        </span>
      }
    </button>);

}