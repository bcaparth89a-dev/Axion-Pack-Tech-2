import { SiteSettings, ISiteSettings } from '../models/SiteSettings.model.js';
import { cacheService } from '../cache/cache.service.js';
import { CACHE_KEYS, CACHE_TTL } from '../constants/cacheKeys.js';
import { triggerNextjsRevalidation } from '../utils/revalidate.js';

export class SiteSettingsService {
  async getSettings(): Promise<ISiteSettings> {
    const cached = await cacheService.getCached<ISiteSettings>(CACHE_KEYS.SITE_SETTINGS);
    if (cached) return cached;

    const existing = await SiteSettings.findOne().lean();
    const settings = existing
      ? (existing as unknown as ISiteSettings)
      : ((await SiteSettings.create({})).toObject() as unknown as ISiteSettings);

    await cacheService.setCached(
      CACHE_KEYS.SITE_SETTINGS,
      settings,
      CACHE_TTL.EXTENDED
    );
    return settings;
  }

  async updateSettings(data: Partial<ISiteSettings>): Promise<ISiteSettings> {
    const settings = await SiteSettings.findOneAndUpdate({}, data, {
      new: true,
      upsert: true,
      runValidators: true,
    });
    await cacheService.deleteCached(CACHE_KEYS.SITE_SETTINGS);
    await triggerNextjsRevalidation(['/', '/contact'], ['settings', 'site-settings', 'navbar', 'home']);
    return settings as unknown as ISiteSettings;
  }
}

export const siteSettingsService = new SiteSettingsService();
