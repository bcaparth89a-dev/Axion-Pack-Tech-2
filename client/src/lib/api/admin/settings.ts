import { adminApiClient } from './adminClient';

export async function getSiteSettingsAdmin<T = Record<string, unknown>>(): Promise<T> {
  return adminApiClient.get<T>('/settings');
}

export async function updateSiteSettingsAdmin<T = Record<string, unknown>>(data: Partial<T>): Promise<T> {
  return adminApiClient.put<T>('/settings', data);
}

export async function getContactSettingsAdmin<T = Record<string, unknown>>(): Promise<T> {
  return adminApiClient.get<T>('/contact/settings');
}

export async function updateContactSettingsAdmin<T = Record<string, unknown>>(data: Partial<T>): Promise<T> {
  return adminApiClient.put<T>('/contact/settings', data);
}
