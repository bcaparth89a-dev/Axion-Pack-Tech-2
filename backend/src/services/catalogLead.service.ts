import { CatalogLead, ICatalogLead } from '../models/CatalogLead.model.js';
import { emailService, extractRecipientEmail, isValidEmail } from './email.service.js';
import { getPagination, buildPaginatedResponse, PaginatedResponse } from '../utils/pagination.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';

export interface GetCatalogLeadsParams {
  status?: string;
  search?: string;
  catalogName?: string;
  page?: string | number;
  limit?: string | number;
}

export interface CatalogLeadStats {
  total: number;
  unread: number;
  contacted: number;
  resolved: number;
  archived: number;
  catalogsCount: number;
}

export class CatalogLeadService {
  async submitLead(data: Partial<ICatalogLead> & Record<string, any>): Promise<ICatalogLead> {
    const normalizedEmail = extractRecipientEmail(data);
    const normalizedName = (data.name || '').trim();

    const lead = await CatalogLead.create({
      ...data,
      name: normalizedName,
      email: normalizedEmail,
    });

    try {
      const emailResults = await emailService.sendCatalogLeadEmails({
        ...data,
        _id: lead._id,
        name: normalizedName,
        email: normalizedEmail,
      });

      if (!emailResults.admin.success) {
        logger.error(`[CatalogLeadService] Admin notification failed for lead ${lead._id}: ${emailResults.admin.error}`);
      }
      if (!emailResults.user.success && isValidEmail(normalizedEmail)) {
        logger.warn(`[CatalogLeadService] User confirmation email warning for lead ${lead._id}: ${emailResults.user.error}`);
      }
    } catch (emailErr: any) {
      logger.error(`[CatalogLeadService] Unexpected error sending catalog download lead emails via Brevo SMTP: ${emailErr?.message}`);
    }

    return lead;
  }

  async getLeads(params: GetCatalogLeadsParams): Promise<PaginatedResponse<ICatalogLead>> {
    const { page, limit, skip } = getPagination({
      page: params.page,
      limit: params.limit,
    });

    const filter: Record<string, unknown> = {};

    if (params.status && params.status !== 'all') {
      filter.status = params.status;
    }

    if (params.catalogName && params.catalogName !== 'all') {
      filter.catalogName = params.catalogName;
    }

    if (params.search && params.search.trim()) {
      const searchRegex = new RegExp(params.search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { company: searchRegex },
        { catalogName: searchRegex },
        { requirement: searchRegex },
      ];
    }

    const [items, totalItems] = await Promise.all([
      CatalogLead.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CatalogLead.countDocuments(filter),
    ]);

    return buildPaginatedResponse(items as unknown as ICatalogLead[], totalItems, page, limit);
  }

  async updateLeadStatus(
    id: string,
    status: 'unread' | 'contacted' | 'resolved' | 'archived',
    notes?: string
  ): Promise<ICatalogLead> {
    const updateData: Record<string, unknown> = { status };
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const lead = await CatalogLead.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!lead) {
      throw AppError.notFound('Catalog lead record not found.');
    }

    return lead;
  }

  async deleteLead(id: string): Promise<void> {
    const lead = await CatalogLead.findByIdAndDelete(id);
    if (!lead) {
      throw AppError.notFound('Catalog lead record not found.');
    }
  }

  async getLeadStats(): Promise<CatalogLeadStats> {
    const [total, unread, contacted, resolved, archived, distinctCatalogs] = await Promise.all([
      CatalogLead.countDocuments(),
      CatalogLead.countDocuments({ status: 'unread' }),
      CatalogLead.countDocuments({ status: 'contacted' }),
      CatalogLead.countDocuments({ status: 'resolved' }),
      CatalogLead.countDocuments({ status: 'archived' }),
      CatalogLead.distinct('catalogName'),
    ]);

    return {
      total,
      unread,
      contacted,
      resolved,
      archived,
      catalogsCount: distinctCatalogs.length,
    };
  }
}

export const catalogLeadService = new CatalogLeadService();
