import { API_URL_CONFIG } from '../config/api';

type SocketClient = {
  connected: boolean;
  disconnect: (callback?: () => void) => void;
};

const wsUrl =
  import.meta.env.VITE_WHATSAPP_WS_URL ??
  `${API_URL_CONFIG.gatewayBaseUrl}/${API_URL_CONFIG.services.whatsapp}/ws/whatsapp`;

export const connectWebSocket = <T = unknown>(
  onMessageReceived: (message: T) => void
): SocketClient => {
  let stompClient: any = null;
  let isClosed = false;

  void (async () => {
    try {
      const sockJSImport = await import('sockjs-client/dist/sockjs');
      const stompModule = await import('@stomp/stompjs');

      if (isClosed) return;

      const SockJS = (sockJSImport as any).default ?? sockJSImport;
      const Stomp = (stompModule as any).Stomp;

      if (!SockJS || !Stomp?.over) {
        throw new Error('SockJS/STOMP client is not available');
      }

      const socket = new SockJS(wsUrl);
      stompClient = Stomp.over(socket);

      stompClient.connect(
        {},
        (frame: string) => {
          if (isClosed) {
            stompClient.disconnect(() => undefined);
            return;
          }

          console.log('Connected: ' + frame);

          stompClient.subscribe('/topic/messages', (message: { body: string }) => {
            const receivedMessage = JSON.parse(message.body) as T;
            // alert('Message received: ' + message.body);
            onMessageReceived(receivedMessage);
          });
        },
        (error: unknown) => {
          console.error('Connection error:', error);
        }
      );
    } catch (error) {
      console.error('WebSocket initialization failed:', error);
    }
  })();

  return {
    get connected() {
      return Boolean(stompClient?.connected);
    },
    disconnect: (callback?: () => void) => {
      isClosed = true;

      if (stompClient?.connected) {
        stompClient.disconnect(callback ?? (() => undefined));
        return;
      }

      callback?.();
    }
  };
};
