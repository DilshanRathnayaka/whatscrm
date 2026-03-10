export const API_URL_CONFIG = {
  gatewayBaseUrl: 'https://chung-unoutspoken-unnicely.ngrok-free.dev',
  services: {
    auth: 'auth',
    whatsapp: 'whatsapp',
  },
  paths: {
    auth: '/auth/user',
    whatsapp: '/api/whatsapp',
    inbox: '/webhook/whatsapp',
    contacts: '/api/contacts',
    orders: '/api/orders',
    company: '/api/company',
  },
} as const;

const buildApiUrl = (serviceName: string, basePath: string, endpoint: string) => {
  const base = API_URL_CONFIG.gatewayBaseUrl.replace(/\/$/, '');
  const service = serviceName.replace(/^\//, '').replace(/\/$/, '');
  const root = basePath.replace(/^\//, '').replace(/\/$/, '');
  const path = endpoint.replace(/^\//, '');

  const serviceRoot = `${base}/${service}`;
  return path ? `${serviceRoot}/${root}/${path}` : `${serviceRoot}/${root}`;
};

export const buildWhatsAppApiUrl = (endpoint: string) => {
  return buildApiUrl(API_URL_CONFIG.services.whatsapp, API_URL_CONFIG.paths.whatsapp, endpoint);
};

export const buildInboxApiUrl = (endpoint = '') => {
  return buildApiUrl(API_URL_CONFIG.services.whatsapp, API_URL_CONFIG.paths.inbox, endpoint);
};

export const buildContactsApiUrl = (endpoint = '') => {
  return buildApiUrl(API_URL_CONFIG.services.whatsapp, API_URL_CONFIG.paths.contacts, endpoint);
};

export const buildOrdersApiUrl = (endpoint = '') => {
  return buildApiUrl(API_URL_CONFIG.services.whatsapp, API_URL_CONFIG.paths.orders, endpoint);
};

export const buildCompanyApiUrl = (endpoint = '') => {
  return buildApiUrl(API_URL_CONFIG.services.whatsapp, API_URL_CONFIG.paths.company, endpoint);
};

export const buildAuthApiUrl = (endpoint = '') => {
  return buildApiUrl(API_URL_CONFIG.services.auth, API_URL_CONFIG.paths.auth, endpoint);
};

export const buildAuthLogoutUrl = () => {
  return buildApiUrl(API_URL_CONFIG.services.auth, API_URL_CONFIG.paths.auth, 'logout');
};
