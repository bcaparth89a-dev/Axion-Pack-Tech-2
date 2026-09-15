/**
 * AXION PackTech - Unified API Client
 *
 * Lightweight, type-safe API client for Next.js App Router.
 * Uses native fetch with Next.js ISR revalidation (revalidate: 60s).
 * Zero external dependencies (No Axios, No Redux, No GraphQL).
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: unknown;
}

export interface HealthStatus {
  success: boolean;
  status: 'healthy' | 'degraded';
  services: {
    mongodb: 'connected' | 'disconnected' | 'connecting' | 'disconnecting';
    redis: 'connected' | 'disconnected' | 'connecting';
  };
  uptimeSeconds: number;
  timestamp: string;
  environment: string;
}

export class ApiError extends Error {
  statusCode: number;
  data?: unknown;

  constructor(message: string, statusCode: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

export interface RequestOptions extends Omit<RequestInit, 'next'> {
  revalidate?: number | false;
  tags?: string[];
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Resolves the appropriate backend API base URL depending on execution environment.
 */
export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    // Server-Side (Next.js Server Components, SSR, Route Handlers)
    return (
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:5000/api/v1'
    );
  }
  // Client-Side (Browser runtime)
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:5000/api/v1'
  );
}

/**
 * Reusable typed API request wrapper using native fetch.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  let url = `${baseUrl}${cleanEndpoint}`;

  // Append query parameters safely if provided
  if (options.params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const { revalidate = 300, tags, headers, ...restOptions } = options;

  const fetchOptions: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  // Configure Next.js caching only for GET requests
  const method = (restOptions.method || 'GET').toUpperCase();
  if (method === 'GET') {
    if (revalidate === 0 || revalidate === false) {
      fetchOptions.cache = 'no-store';
    } else {
      fetchOptions.next = {
        revalidate,
        tags,
      };
    }
  }

  let res: Response;
  try {
    res = await fetch(url, fetchOptions);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network request failed';
    throw new ApiError(`Network error connecting to ${endpoint}: ${message}`, 503);
  }

  let json: ApiResponse<T>;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(
      `Invalid JSON response from ${endpoint} (Status: ${res.status} ${res.statusText})`,
      res.status
    );
  }

  if (!res.ok || json.success === false) {
    const errorMsg = json.message || `Request to ${endpoint} failed with status ${res.status}`;
    throw new ApiError(errorMsg, res.status, json);
  }

  // Automatically unwrap standard { success: true, data: ... } envelopes
  if ('data' in json && json.data !== undefined) {
    return json.data as T;
  }

  return json as unknown as T;
}

/**
 * Health check helper querying Express -> MongoDB/Redis
 */
export async function getHealth(): Promise<HealthStatus> {
  return apiRequest<HealthStatus>('/health', {
    revalidate: 0, // Health checks must not be cached
  });
}

/**
 * Convenient method-based API client
 */
export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),

  upload: async <T>(
    endpoint: string,
    formData: FormData,
    _options?: Omit<RequestOptions, 'body'>
  ): Promise<T> => {
    const baseUrl = getApiBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        body: formData,
        // Note: Do not explicitly set Content-Type header so browser adds correct boundary
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Network upload failed';
      throw new ApiError(`Network error connecting to ${endpoint}: ${message}`, 503);
    }

    let json: ApiResponse<T>;
    try {
      json = (await res.json()) as ApiResponse<T>;
    } catch {
      throw new ApiError(`Invalid response from ${endpoint} (Status: ${res.status})`, res.status);
    }

    if (!res.ok || json.success === false) {
      const errorMsg = json.message || `Upload failed with status ${res.status}`;
      throw new ApiError(errorMsg, res.status, json);
    }

    if ('data' in json && json.data !== undefined) {
      return json.data as T;
    }

    return json as unknown as T;
  },
};
