import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { connectWebSocket } from '../../services/whatsappSocket';
import { useAppStore } from '../../store/useAppStore';

type InboxSocketMessage = {
  id?: string | number;
  from?: string;
  phone?: string;
  body?: string;
  message?: string;
  direction?: string;
  senderType?: string;
  timestamp?: string;
};

const normalizeDirection = (direction?: string) => {
  const normalized = (direction ?? '').toLowerCase().trim();
  if (normalized === 'inbound' || normalized === 'outbound') {
    return normalized;
  }
  return 'unknown';
};

const isInboundMessageEvent = (message: InboxSocketMessage) => {
  const direction = normalizeDirection(message.direction);
  const senderType = (message.senderType ?? '').toLowerCase().trim();
  const phone = (message.from ?? message.phone ?? '').replace(/\D/g, '');
  const content = (message.body ?? message.message ?? '').trim();

  // Ignore delivery/status/non-message frames that should not affect unread count.
  if (!phone || !content) {
    return false;
  }

  if (direction === 'inbound') {
    return true;
  }

  if (direction === 'unknown' && senderType === 'customer') {
    return true;
  }

  return false;
};

const buildMessageSignatures = (message: InboxSocketMessage) => {
  const signatures: string[] = [];
  const idPart = message.id !== undefined && message.id !== null ? String(message.id) : '';
  if (idPart) {
    signatures.push(`id:${idPart}`);
  }

  const phone = (message.from ?? message.phone ?? '').replace(/\D/g, '');
  const content = (message.body ?? message.message ?? '').trim().toLowerCase();
  const timestamp = message.timestamp ? String(new Date(message.timestamp).getTime()) : '';
  const direction = normalizeDirection(message.direction);
  signatures.push(`sig:${phone}|${direction}|${content}|${timestamp}`);

  // Fallback signature handles same-event duplicates where one payload omits timestamp/id.
  signatures.push(`weak:${phone}|${direction}|${content}`);
  return signatures;
};

export function AppLayout() {
  const location = useLocation();
  const seenMessageSignatures = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (location.pathname.startsWith('/inbox')) {
      return;
    }

    const stompClient = connectWebSocket<InboxSocketMessage>((receivedMessage) => {
      if (!isInboundMessageEvent(receivedMessage)) {
        return;
      }

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

      const state = useAppStore.getState();
      state.setNotifications(state.notifications + 1);
    });

    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect(() => undefined);
      }
    };
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)]">
      <div className="relative flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-[var(--bg-secondary)]">
          <Outlet />
        </main>
      </div>
    </div>);

}