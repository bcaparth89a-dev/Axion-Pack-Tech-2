import { adminApiClient, setStoredToken, clearStoredAuth } from './adminClient';
import { AdminUser } from './types';

export interface LoginResponse {
  user: AdminUser;
  token: string;
}

export async function loginAdmin(email: string, password: string): Promise<LoginResponse> {
  const result = await adminApiClient.post<LoginResponse>('/auth/login', {
    email: email.toLowerCase().trim(),
    password,
  });

  if (result.user.role !== 'admin') {
    clearStoredAuth();
    throw new Error('Access denied. Administrator privileges are required.');
  }

  setStoredToken(result.token);
  return result;
}

export async function logoutAdmin(): Promise<void> {
  try {
    await adminApiClient.post('/auth/logout');
  } catch {
    // Ignore network failures on logout
  } finally {
    clearStoredAuth();
  }
}

export async function logoutAllAdmin(): Promise<void> {
  try {
    await adminApiClient.post('/auth/logout-all');
  } catch {
    // Ignore network failures on logout all
  } finally {
    clearStoredAuth();
  }
}

export async function getAdminProfile(): Promise<AdminUser> {
  return adminApiClient.get<AdminUser>('/auth/me');
}
