import axios, { AxiosHeaders } from 'axios';
import { useAppStore } from '../store/useAppStore';
import { toast } from 'react-hot-toast';
import { API_URL_CONFIG, buildAuthLogoutUrl } from '../config/api';

type ApiFetchOptions = RequestInit & {
    includeCompanyIdHeader?: boolean;
    includeCredentials?: boolean;
};

type ApiFetchResponse = {
    ok: boolean;
    status: number;
    headers: Headers;
    json: <T = unknown>() => Promise<T>;
    text: () => Promise<string>;
    clone: () => ApiFetchResponse;
};

const toHeaders = (headers?: HeadersInit) => {
    if (!headers) return new Headers();
    return new Headers(headers);
};

const NGROK_SKIP_WARNING_HEADER = 'ngrok-skip-browser-warning';

let tokenExpiredHandled = false;
const DEFAULT_COMPANY_ID = '1';
const APP_BASE_PATH = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '') || '/';
const LOGIN_PATH = APP_BASE_PATH === '/' ? '/login' : `${APP_BASE_PATH}/login`;
const AUTH_LOGOUT_URL = buildAuthLogoutUrl();

const axiosClient = axios.create({
    baseURL: API_URL_CONFIG.gatewayBaseUrl,
    withCredentials: true
});

axiosClient.interceptors.request.use((config) => {
    const headers = AxiosHeaders.from(config.headers);
    headers.set(NGROK_SKIP_WARNING_HEADER, 'true');
    config.headers = headers;

    return config;
});

const createApiFetchResponse = (status: number, responseText: string, headers: Headers): ApiFetchResponse => {
    return {
        ok: status >= 200 && status < 300,
        status,
        headers,
        json: async <T = unknown>() => JSON.parse(responseText) as T,
        text: async () => responseText,
        clone: () => createApiFetchResponse(status, responseText, new Headers(headers))
    };
};

const clearAuthCookies = () => {
    const cookieNames = ['jwtE', 'jwt', 'JWT', 'token', 'authToken', 'accessToken'];
    const host = window.location.hostname;
    const domainVariants = ['', `; domain=${host}`, host.includes('.') ? `; domain=.${host}` : ''];

    cookieNames.forEach((name) => {
        domainVariants.forEach((domainPart) => {
            if (domainPart === '') {
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; Secure; SameSite=None`;
                return;
            }

            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainPart}`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax${domainPart}`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; Secure; SameSite=None${domainPart}`;
        });
    });
};

const clearBrowserAuthState = () => {
    useAppStore.getState().logout();
    clearAuthCookies();
    window.sessionStorage.clear();
    window.localStorage.clear();
};

const performServerLogout = async () => {
    try {
        await axiosClient.request({
            url: AUTH_LOGOUT_URL,
            method: 'POST',
            withCredentials: true
        });
    } catch {
        // Best effort only; continue local cleanup.
    }
};

const handleTokenExpired = async (message: string) => {
    if (tokenExpiredHandled) return;
    tokenExpiredHandled = true;

    await performServerLogout();

    clearBrowserAuthState();

    toast.error(message || 'Token expired. Please log in again.', {
        id: 'token-expired',
        duration: 3000
    });
    if (window.location.pathname !== LOGIN_PATH) {
        clearBrowserAuthState();
        window.location.replace(LOGIN_PATH);
    }
};

const isTokenExpiredPayload = (payload: unknown) => {
    if (!payload || typeof payload !== 'object') return false;

    const errorCode = 'errorCode' in payload ? (payload as { errorCode?: unknown }).errorCode : undefined;
    const message = 'message' in payload ? (payload as { message?: unknown }).message : undefined;

    return errorCode === 'TOKEN_EXPIRED' || message === 'Token expired';
};

const getCompanyId = () => {
    return DEFAULT_COMPANY_ID;
};

export const apiFetch = async (input: RequestInfo | URL, init: ApiFetchOptions = {}) => {
    const headers = toHeaders(init.headers);

    const {
        includeCompanyIdHeader = true,
        includeCredentials = true,
        ...requestInit
    } = init;

    if (includeCompanyIdHeader && !headers.has('companyId')) {
        headers.set('companyId', getCompanyId());
    }

    if (!headers.has(NGROK_SKIP_WARNING_HEADER)) {
        headers.set(NGROK_SKIP_WARNING_HEADER, 'true');
    }

    const url = typeof input === 'string' || input instanceof URL ? input.toString() : input.url;
    const method = requestInit.method ?? (input instanceof Request ? input.method : 'GET');
    const signal = requestInit.signal ?? undefined;

    const axiosResponse = await axiosClient.request({
        url,
        method,
        data: requestInit.body,
        signal,
        withCredentials: requestInit.credentials ? requestInit.credentials === 'include' : includeCredentials,
        headers: Object.fromEntries(headers.entries()),
        responseType: 'text',
        validateStatus: () => true
    });

    const responseHeaders = new Headers();
    Object.entries(axiosResponse.headers ?? {}).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            responseHeaders.set(key, value.join(', '));
            return;
        }

        if (typeof value === 'string') {
            responseHeaders.set(key, value);
        }
    });

    const responseText =
        typeof axiosResponse.data === 'string' ?
            axiosResponse.data :
            JSON.stringify(axiosResponse.data ?? '');

    const response = createApiFetchResponse(axiosResponse.status, responseText, responseHeaders);

    if (!response.ok) {
        const contentType = response.headers.get('content-type') ?? '';
        if (contentType.includes('application/json')) {
            try {
                const payload = await response.clone().json();
                if (isTokenExpiredPayload(payload)) {
                    const message =
                        typeof (payload as { message?: unknown }).message === 'string' ?
                            (payload as { message: string }).message :
                            'Token expired. Please log in again.';
                    void handleTokenExpired(message);
                }
            } catch {
                // Ignore parse errors and let callers handle response.
            }
        }
    }

    return response;
};
