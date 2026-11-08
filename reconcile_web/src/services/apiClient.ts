/// <reference types="vite/client" />

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    const custom = window.localStorage.getItem('reconcile_api_url');
    if (custom && custom.trim().length > 0) {
      return custom.trim().replace(/\/+$/, '');
    }
  }
  const envUrl = import.meta.env?.VITE_API_URL as string;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  // In production (HTTPS origin, e.g. GitHub Pages or Netlify), fallback to Render cloud backend
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return 'https://reconcile-api-9htz.onrender.com';
  }
  return 'http://localhost:8000';
}

export function setCustomApiUrl(url: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (url.trim().length === 0) {
      window.localStorage.removeItem('reconcile_api_url');
    } else {
      window.localStorage.setItem('reconcile_api_url', url.trim());
    }
  }
}

export const API_BASE_URL: string = getApiBaseUrl();

const AUTH_TOKEN_KEY = 'reconcile_auth_token';
const RETRY_DELAYS = [2000, 5000, 10000];

export class ApiError extends Error {
  public status: number;
  public detail?: any;

  constructor(status: number, message: string, detail?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

function buildUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

function buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const token = getAuthToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

async function handleResponse<T>(response: Response, path: string): Promise<T> {
  if (response.status === 401) {
    clearAuthToken();
    if (typeof window !== 'undefined') {
      // Avoid infinite reload loop if user entered invalid credentials on auth screens
      if (!path.includes('/auth/login') && !path.includes('/auth/register')) {
        window.location.reload();
      }
    }
  }

  let data: any = null;
  const contentType = response.headers.get('content-type');
  const text = await response.text();

  if (text) {
    if (contentType && contentType.includes('application/json')) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    } else {
      data = text;
    }
  }

  if (!response.ok) {
    let message = response.statusText || `Request failed with status ${response.status}`;
    let detail: any = data;

    if (data && typeof data === 'object') {
      if (typeof data.detail === 'string') {
        message = data.detail;
        detail = data.detail;
      } else if (data.detail) {
        detail = data.detail;
        message = typeof data.detail === 'object' ? JSON.stringify(data.detail) : String(data.detail);
      } else if (data.message) {
        message = data.message;
      }
    } else if (typeof data === 'string' && data.length > 0) {
      message = data;
    }

    throw new ApiError(response.status, message, detail);
  }

  return data as T;
}

async function requestWithRetry<T>(
  method: string,
  path: string,
  body?: any,
  customHeaders?: Record<string, string>
): Promise<T> {
  const url = buildUrl(path);
  const headers = buildHeaders(customHeaders);
  const requestInit: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined) {
    requestInit.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  let attempt = 0;

  while (true) {
    try {
      const response = await fetch(url, requestInit);

      // Retry on 503 Service Unavailable (e.g. Render spinning up cold start)
      if (response.status === 503 && attempt < RETRY_DELAYS.length) {
        const delay = RETRY_DELAYS[attempt];
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return await handleResponse<T>(response, path);
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (err.status === 503 && attempt < RETRY_DELAYS.length) {
          const delay = RETRY_DELAYS[attempt];
          attempt++;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw err;
      }

      // Retry on network/fetch errors
      if (attempt < RETRY_DELAYS.length) {
        const delay = RETRY_DELAYS[attempt];
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw err;
    }
  }
}

export const apiClient = {
  get<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return requestWithRetry<T>('GET', path, undefined, headers);
  },

  post<T>(path: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return requestWithRetry<T>('POST', path, body, headers);
  },

  patch<T>(path: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return requestWithRetry<T>('PATCH', path, body, headers);
  },

  del<T = void>(path: string, headers?: Record<string, string>): Promise<T> {
    return requestWithRetry<T>('DELETE', path, undefined, headers);
  },
};
