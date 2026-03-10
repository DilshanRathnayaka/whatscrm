const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://chung-unoutspoken-unnicely.ngrok-free.dev/whatsapp';
const AUTH_API_BASE_URL =
  import.meta.env.VITE_AUTH_API_BASE_URL ?? 'https://chung-unoutspoken-unnicely.ngrok-free.dev/auth';
const WHATSAPP_API_BASE_PATH =
  import.meta.env.VITE_WHATSAPP_API_BASE_PATH ?? '/api/whatsapp';
const INBOX_API_BASE_PATH =
  import.meta.env.VITE_INBOX_API_BASE_PATH ?? '/webhook/whatsapp';
const CONTACTS_API_BASE_PATH =
  import.meta.env.VITE_CONTACTS_API_BASE_PATH ?? '/api/contacts';
const ORDERS_API_BASE_PATH =
  import.meta.env.VITE_ORDERS_API_BASE_PATH ?? '/api/orders';
const COMPANY_API_BASE_PATH =
  import.meta.env.VITE_COMPANY_API_BASE_PATH ?? '/api/company';
const AUTH_API_BASE_PATH =
  import.meta.env.VITE_AUTH_API_BASE_PATH ?? '/auth/user';

const buildApiUrl = (basePath: string, endpoint: string) => {
  const base = API_BASE_URL.replace(/\/$/, '');
  const root = basePath.replace(/^\//, '').replace(/\/$/, '');
  const path = endpoint.replace(/^\//, '');

  return path ? `${base}/${root}/${path}` : `${base}/${root}`;
};

const buildApiUrlWithCustomBase = (
  apiBaseUrl: string,
  basePath: string,
  endpoint: string
) => {
  const base = apiBaseUrl.replace(/\/$/, '');
  const root = basePath.replace(/^\//, '').replace(/\/$/, '');
  const path = endpoint.replace(/^\//, '');

  return path ? `${base}/${root}/${path}` : `${base}/${root}`;
};

export const buildWhatsAppApiUrl = (endpoint: string) => {
  return buildApiUrl(WHATSAPP_API_BASE_PATH, endpoint);
};

export const buildInboxApiUrl = (endpoint = '') => {
  return buildApiUrl(INBOX_API_BASE_PATH, endpoint);
};

export const buildContactsApiUrl = (endpoint = '') => {
  return buildApiUrl(CONTACTS_API_BASE_PATH, endpoint);
};

export const buildOrdersApiUrl = (endpoint = '') => {
  return buildApiUrl(ORDERS_API_BASE_PATH, endpoint);
};

export const buildCompanyApiUrl = (endpoint = '') => {
  return buildApiUrl(COMPANY_API_BASE_PATH, endpoint);
};

export const buildAuthApiUrl = (endpoint = '') => {
  return buildApiUrlWithCustomBase(
    AUTH_API_BASE_URL,
    AUTH_API_BASE_PATH,
    endpoint
  );
};
