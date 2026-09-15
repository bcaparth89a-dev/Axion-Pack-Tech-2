import { ContactSettings, IContactSettings } from '../models/ContactSettings.model.js';
import { ContactInquiry, IContactInquiry } from '../models/ContactInquiry.model.js';
import { emailService, extractRecipientEmail, isValidEmail } from './email.service.js';
import { cacheService } from '../cache/cache.service.js';
import { CACHE_KEYS, CACHE_TTL } from '../constants/cacheKeys.js';
import { getPagination, buildPaginatedResponse, PaginatedResponse } from '../utils/pagination.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';

export class ContactService {
  async getSettings(): Promise<IContactSettings> {
    const cached = await cacheService.getCached<IContactSettings>(CACHE_KEYS.CONTACT_SETTINGS);
    if (cached) return cached;

    const existing = await ContactSettings.findOne().lean();
    const settings = existing
      ? (existing as unknown as IContactSettings)
      : ((await ContactSettings.create({})).toObject() as unknown as IContactSettings);

    await cacheService.setCached(
      CACHE_KEYS.CONTACT_SETTINGS,
      settings,
      CACHE_TTL.EXTENDED
    );
    return settings;
  }

  async updateSettings(data: Partial<IContactSettings>): Promise<IContactSettings> {
    const settings = await ContactSettings.findOneAndUpdate({}, data, {
      new: true,
      upsert: true,
      runValidators: true,
    });
    await Promise.all([
      cacheService.deleteCached(CACHE_KEYS.CONTACT_SETTINGS),
      cacheService.deleteCached(CACHE_KEYS.HOME_DATA),
    ]);
    return settings as unknown as IContactSettings;
  }

  async submitInquiry(data: Partial<IContactInquiry> & Record<string, any>): Promise<IContactInquiry> {
    const normalizedEmail = extractRecipientEmail(data);
    const normalizedName = (data.name || data.fullName || '').trim();

    const inquiry = await ContactInquiry.create({
      ...data,
      name: normalizedName,
      email: normalizedEmail,
    });

    try {
      const emailResults = await emailService.sendContactEmails({
        ...data,
        _id: inquiry._id,
        name: normalizedName,
        email: normalizedEmail,
      });

      if (!emailResults.admin.success) {
        logger.error(`[ContactService] Admin notification failed for inquiry ${inquiry._id}: ${emailResults.admin.error}`);
      }
      if (!emailResults.user.success && isValidEmail(normalizedEmail)) {
        logger.warn(`[ContactService] User confirmation email warning for inquiry ${inquiry._id}: ${emailResults.user.error}`);
      }
    } catch (emailErr: any) {
      logger.error(`[ContactService] Unexpected error sending contact inquiry emails via Brevo SMTP: ${emailErr?.message}`);
    }

    return inquiry;
  }

  async getInquiries(params: {
    status?: string;
    page?: string | number;
    limit?: string | number;
  }): Promise<PaginatedResponse<IContactInquiry>> {
    const { page, limit, skip } = getPagination({
      page: params.page,
      limit: params.limit,
    });

    const filter: Record<string, unknown> = {};
    if (params.status) {
      filter.status = params.status;
    }

    const [items, totalItems] = await Promise.all([
      ContactInquiry.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ContactInquiry.countDocuments(filter),
    ]);

    return buildPaginatedResponse(items as unknown as IContactInquiry[], totalItems, page, limit);
  }

  async updateInquiryStatus(
    id: string,
    status: 'unread' | 'contacted' | 'resolved' | 'archived',
    notes?: string
  ): Promise<IContactInquiry> {
    const inquiry = await ContactInquiry.findByIdAndUpdate(
      id,
      { status, ...(notes !== undefined ? { notes } : {}) },
      { new: true }
    );
    if (!inquiry) {
      throw AppError.notFound('Contact inquiry not found.');
    }
    return inquiry;
  }

  async deleteInquiry(id: string): Promise<void> {
    const inquiry = await ContactInquiry.findByIdAndDelete(id);
    if (!inquiry) {
      throw AppError.notFound('Contact inquiry not found.');
    }
  }
}

export const contactService = new ContactService();
