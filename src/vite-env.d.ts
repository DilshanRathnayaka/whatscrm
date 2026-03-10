/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_WHATSAPP_API_BASE_PATH?: string;
  readonly VITE_INBOX_API_BASE_PATH?: string;
  readonly VITE_WHATSAPP_WS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
