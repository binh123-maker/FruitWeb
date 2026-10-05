/**
 * Shared API Client for FruitWeb Frontend
 * Handles: Base URL, Headers, JSON serialization, JWT authentication,
 * Token refresh queue, and consistent HTTP error parsing.
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'freshfruit_access_token',
  REFRESH_TOKEN: 'freshfruit_refresh_token',
} as const;

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const getAccessToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  } catch {
    return null;
  }
};

export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  } catch {
    return null;
  }
};

export const setAuthTokens = (accessToken: string, refreshToken?: string): void => {
  try {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
    }
  } catch (err) {
    console.error('Failed to store auth tokens in localStorage', err);
  }
};

export const clearAuthTokens = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  } catch (err) {
    console.error('Failed to clear auth tokens', err);
  }
};

// Queue to prevent concurrent refresh token requests
let refreshPromise: Promise<string | null> | null = null;

async function executeRefreshToken(): Promise<string | null> {
  const currentRefreshToken = getRefreshToken();
  if (!currentRefreshToken) {
    clearAuthTokens();
    return null;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: currentRefreshToken }),
    });

    if (!res.ok) {
      clearAuthTokens();
      return null;
    }

    const json = await res.json();
    const tokenData = json?.data || json;
    const newAccessToken = tokenData.access_token;
    const newRefreshToken = tokenData.refresh_token || currentRefreshToken;

    if (newAccessToken) {
      setAuthTokens(newAccessToken, newRefreshToken);
      return newAccessToken;
    }

    clearAuthTokens();
    return null;
  } catch (err) {
    console.error('Failed to refresh token', err);
    clearAuthTokens();
    return null;
  } finally {
    refreshPromise = null;
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: any;
  params?: Record<string, any>;
  skipAuth?: boolean;
  _retry?: boolean;
}

/**
 * Format FastAPI validation errors (422) or generic server error messages
 */
function extractErrorMessage(status: number, data: any): string {
  if (data) {
    if (typeof data.detail === 'string') {
      return data.detail;
    }
    if (Array.isArray(data.detail) && data.detail.length > 0) {
      return data.detail
        .map((err: any) => {
          const loc = Array.isArray(err.loc) ? err.loc.filter((l: any) => l !== 'body').join('.') : '';
          return loc ? `${loc}: ${err.msg}` : err.msg;
        })
        .join(', ');
    }
    if (data.errors && typeof data.errors === 'object' && Object.keys(data.errors).length > 0) {
      const errList = Object.entries(data.errors).map(([field, msg]) => (field ? `${field}: ${msg}` : String(msg)));
      return errList.join(', ');
    }
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }
  }

  switch (status) {
    case 400:
      return 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại dữ liệu.';
    case 401:
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    case 403:
      return 'Bạn không có quyền thực hiện thao tác này.';
    case 404:
      return 'Không tìm thấy dữ liệu yêu cầu.';
    case 422:
      return 'Dữ liệu gửi lên không đúng định dạng.';
    case 500:
      return 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
    default:
      return `Lỗi hệ thống (${status}).`;
  }
}

/**
 * Core HTTP Request method
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, params, skipAuth = false, _retry = false, headers = {}, ...rest } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const reqHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string>),
  };

  let formattedBody: any = body;
  if (body !== undefined && body !== null) {
    if (!(body instanceof FormData)) {
      reqHeaders['Content-Type'] = 'application/json';
      formattedBody = JSON.stringify(body);
    }
  }

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      reqHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers: reqHeaders,
      body: formattedBody,
    });
  } catch (err: any) {
    throw new ApiError(0, 'Không thể kết nối đến máy chủ backend. Vui lòng kiểm tra server.');
  }

  // Handle 401 and Token Refresh
  if (response.status === 401 && !skipAuth && !_retry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    if (!refreshPromise) {
      refreshPromise = executeRefreshToken();
    }
    const newToken = await refreshPromise;

    if (newToken) {
      return apiRequest<T>(endpoint, {
        ...options,
        _retry: true,
      });
    }
  }

  // Handle Response Parsing
  let responseData: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    try {
      responseData = await response.text();
    } catch {
      responseData = null;
    }
  }

  if (!response.ok) {
    const message = extractErrorMessage(response.status, responseData);
    throw new ApiError(response.status, message, responseData);
  }

  return responseData as T;
}

export const apiClient = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
