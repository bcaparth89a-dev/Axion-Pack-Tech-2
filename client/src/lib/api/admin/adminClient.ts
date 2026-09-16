const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  }
  return process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
};

export class AdminApiError extends Error {
  statusCode: number;
  errors?: Array<{ field?: string; message: string }>;

  constructor(
    message: string,
    statusCode: number = 500,
    errors?: Array<{ field?: string; message: string }>
  ) {
    let detailedMessage = message;
    if (errors && errors.length > 0) {
      const fieldDetails = errors
        .map((e) => (e.field ? `${e.field}: ${e.message}` : e.message))
        .join(', ');
      if (!detailedMessage.includes(fieldDetails)) {
        detailedMessage = `${message} (${fieldDetails})`;
      }
    }
    super(detailedMessage);
    this.name = 'AdminApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export const ADMIN_AUTH_TOKEN_KEY = 'axion_admin_token';
export const ADMIN_REFRESH_TOKEN_KEY = 'axion_admin_refresh_token';
export const ADMIN_USER_KEY = 'axion_admin_user';

let inMemoryToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;

export const getStoredToken = (): string | null => {
  if (inMemoryToken) return inMemoryToken;
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(ADMIN_AUTH_TOKEN_KEY);
  if (stored) {
    inMemoryToken = stored;
  }
  return inMemoryToken;
};

export const getStoredRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY);
};

export const setStoredToken = (token: string, refreshToken?: string): void => {
  inMemoryToken = token;
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_AUTH_TOKEN_KEY, token);
  if (refreshToken) {
    localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, refreshToken);
  }
  // Also sync cookie for server-side requests
  document.cookie = `auth_token=${token}; path=/; max-age=604800; SameSite=Lax`;
};

export const clearStoredAuth = (): void => {
  inMemoryToken = null;
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_AUTH_TOKEN_KEY);
  localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
  document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax';
  document.cookie = 'axion_refresh_token=; path=/; max-age=0; SameSite=Lax';
};

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  token?: string;
  _retry?: boolean;
}

/**
 * Attempts to silently refresh the access token using the HTTP-only refresh cookie or header token.
 * Uses a singleton promise to avoid multiple simultaneous refresh requests (stampede protection).
 */
async function performTokenRefresh(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const baseUrl = getBaseUrl();
      const storedRefreshToken = getStoredRefreshToken();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (storedRefreshToken) {
        headers['x-refresh-token'] = storedRefreshToken;
      }

      const res = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ refreshToken: storedRefreshToken || undefined }),
        credentials: 'include',
      });

      if (!res.ok) {
        clearStoredAuth();
        return false;
      }

      const json = await res.json();
      if (json.data?.token) {
        setStoredToken(json.data.token, json.data.refreshToken);
        if (json.data.user && typeof window !== 'undefined') {
          localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(json.data.user));
        }
        return true;
      }
      return false;
    } catch {
      clearStoredAuth();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = getBaseUrl();
  let url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = options.token || getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  let json: {
    success?: boolean;
    message?: string;
    data?: T;
    errors?: Array<{ field?: string; message: string }>;
  } | null = null;

  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    // Check if error is 401 Unauthorized and request is eligible for silent refresh
    const isAuthEndpoint =
      endpoint.includes('/auth/login') ||
      endpoint.includes('/auth/refresh') ||
      endpoint.includes('/auth/logout');

    if (res.status === 401 && !options._retry && !isAuthEndpoint && typeof window !== 'undefined') {
      const hadPreviousSession = !!(getStoredToken() || getStoredRefreshToken());
      const refreshed = await performTokenRefresh();
      if (refreshed) {
        // Retry the original request with the fresh token
        return request<T>(endpoint, {
          ...options,
          _retry: true,
          token: getStoredToken() || undefined,
        });
      }

      // Refresh genuinely failed -> redirect to login safely
      clearStoredAuth();
      if (!window.location.pathname.startsWith('/admin/login') && window.location.pathname.startsWith('/admin')) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = hadPreviousSession ? '/admin/login?sessionExpired=1' : '/admin/login';
      }
    }

    const errorMsg = json?.message || `Request failed with status ${res.status}`;
    throw new AdminApiError(errorMsg, res.status, json?.errors);
  }

  if (json && json.data !== undefined) {
    return json.data;
  }

  return json as unknown as T;
}

export const adminApiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),

  refreshToken: performTokenRefresh,
};
