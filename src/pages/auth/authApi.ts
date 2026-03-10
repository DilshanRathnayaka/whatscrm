import { buildAuthApiUrl, buildCompanyApiUrl } from '../../config/api';
import { apiFetch } from '../../services/http';

export interface RegisterUserDto {
    id?: number;
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    type: string;
    companyId?: number;
    companyName: string;
    companyAddress?: string;
    companyPhone?: string;
    teamSize?: string;
    industry?: string;
    planType: string;
}

export interface LoginUserDto {
    username: string;
    password: string;
}

export interface UserCompanyDto {
    id?: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    password?: string;
    type?: string;
    companyId?: number;
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
    teamSize?: string;
    industry?: string;
    planType?: string;
}

export const registerUser = async (payload: RegisterUserDto): Promise<string> => {
    const response = await apiFetch(buildAuthApiUrl('/register'), {
        method: 'POST',
        includeCompanyIdHeader: false,
        includeCredentials: false,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Registration failed (${response.status})`);
    }

    return response.text();
};

export const loginUser = async (payload: LoginUserDto): Promise<string> => {
    const response = await apiFetch(buildAuthApiUrl('/login'), {
        method: 'POST',
        includeCompanyIdHeader: false,
        includeCredentials: false,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Login failed (${response.status})`);
    }

    return response.text();
};

export const getCompanyByUsername = async (
    username: string
): Promise<UserCompanyDto> => {
    const endpoint = `/get-company?username=${encodeURIComponent(username)}`;
    const response = await apiFetch(buildCompanyApiUrl(endpoint), {
        method: 'GET',
        includeCompanyIdHeader: false,
        includeCredentials: true
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to load company (${response.status})`);
    }

    return (await response.json()) as UserCompanyDto;
};

const expireCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
};

export const clearClientJwtCookies = () => {
    ['jwtE', 'jwt', 'JWT', 'token', 'authToken', 'accessToken'].forEach(expireCookie);
};

export const logoutUser = async (): Promise<void> => {
    try {
        // Best effort: backend should clear HttpOnly JWT cookie.
        await apiFetch(buildAuthApiUrl('/logout'), {
            method: 'POST',
            includeCompanyIdHeader: false,
            includeCredentials: true
        });
    } catch {
        // Do not block local logout if backend endpoint is unavailable.
    }
};
