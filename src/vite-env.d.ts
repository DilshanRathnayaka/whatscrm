/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WHATSAPP_WS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
