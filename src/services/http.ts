import { useAppStore } from '../store/useAppStore';
import { toast } from 'react-hot-toast';

type ApiFetchOptions = RequestInit & {
    includeCompanyIdHeader?: boolean;
    includeCredentials?: boolean;
};

const toHeaders = (headers?: HeadersInit) => {
    if (!headers) return new Headers();
    return new Headers(headers);
};

let tokenExpiredHandled = false;
const DEFAULT_COMPANY_ID = '1';
const APP_BASE_PATH = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '') || '/';
const LOGIN_PATH = APP_BASE_PATH === '/' ? '/login' : `${APP_BASE_PATH}/login`;
const AUTH_LOGOUT_URL =
    `${import.meta.env.VITE_AUTH_API_BASE_URL ?? 'http://localhost:9000'}`.replace(/\/$/, '') +
    `${import.meta.env.VITE_AUTH_API_BASE_PATH ?? '/auth/user'}/logout`;

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
        // Use native fetch directly to avoid recursion through apiFetch interceptors.
        await fetch(AUTH_LOGOUT_URL, {
            method: 'POST',
            credentials: 'include'
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

    const response = await fetch(input, {
        ...requestInit,
        credentials: requestInit.credentials ?? (includeCredentials ? 'include' : 'omit'),
        headers
    });

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
