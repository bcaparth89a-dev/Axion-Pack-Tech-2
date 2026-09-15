import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Career, ICareer } from '../models/Career.model.js';
import {
  CareerApplication,
  ICareerApplication,
  CareerApplicationStatus,
} from '../models/CareerApplication.model.js';
import { cacheService } from '../cache/cache.service.js';
import { CACHE_KEYS, CACHE_PATTERNS, CACHE_TTL } from '../constants/cacheKeys.js';
import { getPagination, buildPaginatedResponse, PaginatedResponse } from '../utils/pagination.js';
import { AppError } from '../utils/appError.js';
import { emailService, extractRecipientEmail, isValidEmail } from './email.service.js';
import { logger } from '../utils/logger.js';

export interface CareerQueryParams {
  type?: string;
  search?: string;
  page?: string | number;
  limit?: string | number;
  publishedOnly?: boolean;
}

export class CareerService {
  // --------------------------------------------------------------------------
  // Career Openings
  // --------------------------------------------------------------------------

  async getCareers(params: CareerQueryParams): Promise<PaginatedResponse<ICareer>> {
    const { page, limit, skip } = getPagination({
      page: params.page,
      limit: params.limit,
    });

    const isPublic = params.publishedOnly !== false;
    const cacheKey = isPublic
      ? CACHE_KEYS.CAREERS_LIST(params.type || '', `s_${params.search || ''}_p${page}_l${limit}`)
      : null;

    if (cacheKey) {
      const cached = await cacheService.getCached<PaginatedResponse<ICareer>>(cacheKey);
      if (cached) return cached;
    }

    const filter: Record<string, unknown> = {};
    if (isPublic) {
      filter.published = true;
      filter.status = 'active';
    }
    if (params.type) {
      filter.type = params.type.toLowerCase();
    }
    if (params.search) {
      filter.$or = [
        { title: { $regex: params.search, $options: 'i' } },
        { department: { $regex: params.search, $options: 'i' } },
        { description: { $regex: params.search, $options: 'i' } },
      ];
    }

    const [items, totalItems] = await Promise.all([
      Career.find(filter)
        .select(
          'title slug type department location description experience applicationDeadline published status sortOrder shortDescription image employmentType postedDate duration stipendOrBenefits mentorSupport certification'
        )
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Career.countDocuments(filter),
    ]);

    const result = buildPaginatedResponse(items as unknown as ICareer[], totalItems, page, limit);

    if (cacheKey) {
      await cacheService.setCached(cacheKey, result, CACHE_TTL.MEDIUM);
    }

    return result;
  }

  async getCareerBySlug(slug: string, publishedOnly: boolean = true): Promise<ICareer> {
    const cacheKey = publishedOnly ? CACHE_KEYS.CAREER_DETAIL(slug) : null;

    if (cacheKey) {
      const cached = await cacheService.getCached<ICareer>(cacheKey);
      if (cached) return cached;
    }

    const filter: Record<string, unknown> = { slug: slug.toLowerCase() };
    if (publishedOnly) {
      filter.published = true;
    }

    const career = await Career.findOne(filter).lean();
    if (!career) {
      throw AppError.notFound(`Career position "${slug}" not found.`);
    }

    if (cacheKey) {
      await cacheService.setCached(cacheKey, career as unknown as ICareer, CACHE_TTL.MEDIUM);
    }

    return career as unknown as ICareer;
  }

  async createCareer(data: Partial<ICareer>): Promise<ICareer> {
    const career = await Career.create(data);
    await this.invalidateCache(career.slug);
    return career;
  }

  async updateCareer(slug: string, data: Partial<ICareer>): Promise<ICareer> {
    const career = await Career.findOneAndUpdate(
      { slug: slug.toLowerCase() },
      data,
      { new: true, runValidators: true }
    );
    if (!career) {
      throw AppError.notFound(`Career with slug "${slug}" not found.`);
    }
    await this.invalidateCache(slug);
    return career;
  }

  async deleteCareer(slug: string): Promise<void> {
    const career = await Career.findOneAndDelete({ slug: slug.toLowerCase() });
    if (!career) {
      throw AppError.notFound(`Career with slug "${slug}" not found.`);
    }
    await this.invalidateCache(slug);
  }

  // --------------------------------------------------------------------------
  // Applications (Secure Resume Storage, MongoDB persistence, Admin Management)
  // --------------------------------------------------------------------------

  async submitApplication(
    data: {
      candidateName?: string;
      fullName?: string;
      email: string;
      phone: string;
      careerSlug?: string;
      careerTitle?: string;
      position?: string;
      coverMessage?: string;
      address?: string;
      education?: string;
      experience?: string;
      portfolioUrl?: string;
      resumeUrl?: string;
      resumeKey?: string;
    },
    file?: Express.Multer.File
  ): Promise<ICareerApplication> {
    const candidateName = (data.fullName || data.candidateName || '').trim();
    const email = extractRecipientEmail(data);
    const phone = (data.phone || '').trim();
    const coverMessage = (data.coverMessage || '').trim();

    // Resolve target position & slug
    let careerSlug = (data.careerSlug || data.position || '').toLowerCase().trim();
    let careerTitle = (data.careerTitle || data.position || '').trim();
    let careerId: mongoose.Types.ObjectId | undefined;

    if (careerSlug) {
      const career = await Career.findOne({
        $or: [
          { slug: careerSlug },
          { title: { $regex: `^${careerSlug}$`, $options: 'i' } },
        ],
      });
      if (career) {
        careerId = career._id as mongoose.Types.ObjectId;
        careerSlug = career.slug;
        careerTitle = career.title;
      }
    }

    if (!careerTitle && careerSlug) {
      careerTitle = careerSlug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }

    if (!careerSlug) {
      careerSlug = 'general-application';
      careerTitle = careerTitle || 'General Engineering Application';
    }

    // Duplicate submission check: prevent multiple submissions with same email for the same position within 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingApp = await CareerApplication.findOne({
      email,
      careerSlug,
      submittedAt: { $gte: oneDayAgo },
    });

    if (existingApp) {
      throw AppError.conflict(
        'An application with this email address has already been submitted for this position within the last 24 hours. Our HR team is reviewing it.'
      );
    }

    // Process Resume File
    let resumeUrl = data.resumeUrl || '';
    let resumeKey = data.resumeKey || '';
    let resumeFileName = file?.originalname || 'resume.pdf';
    let resumeMimeType = file?.mimetype || 'application/pdf';
    let resumeSize = file?.size || 0;

    if (file) {
      const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
      const uniqueId = crypto.randomUUID();
      const safeFileName = `${uniqueId}${ext}`;

      const uploadDir = path.resolve(process.cwd(), 'uploads/resumes');
      try {
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, safeFileName);
        if (file.buffer) {
          fs.writeFileSync(filePath, file.buffer);
        }
        resumeKey = `uploads/resumes/${safeFileName}`;
      } catch (fsErr) {
        logger.warn('Could not write resume to local disk, proceeding with internal buffer reference:', fsErr);
        resumeKey = `uploads/resumes/memory_${safeFileName}`;
      }

      resumeUrl = `/api/v1/careers/admin/applications/temp/resume`;
      resumeFileName = file.originalname;
      resumeMimeType = file.mimetype;
      resumeSize = file.size;
    }

    if (!resumeKey && !resumeUrl) {
      throw AppError.badRequest('Resume/CV file is required for application submission.');
    }

    const application = await CareerApplication.create({
      careerId,
      careerSlug,
      careerTitle,
      candidateName,
      email,
      phone,
      coverMessage,
      address: data.address || '',
      education: data.education || '',
      experience: data.experience || '',
      portfolioUrl: data.portfolioUrl || '',
      resumeUrl: resumeUrl || 'internal',
      resumeKey: resumeKey || 'internal',
      resumeFileName,
      resumeMimeType,
      resumeSize,
      status: 'new',
      submittedAt: new Date(),
    });

    // Update dynamic URL to point to this application's secure download route
    application.resumeUrl = `/api/v1/careers/admin/applications/${application._id}/resume`;
    await application.save();

    try {
      const emailResults = await emailService.sendCareerApplicationEmails({
        ...data,
        _id: application._id,
        candidateName,
        email,
        phone,
        careerSlug,
        careerTitle,
        resumeUrl: application.resumeUrl,
      });

      if (!emailResults.admin.success) {
        logger.error(`[CareerService] Admin notification failed for application ${application._id}: ${emailResults.admin.error}`);
      }
      if (!emailResults.user.success && isValidEmail(email)) {
        logger.warn(`[CareerService] Candidate confirmation email warning for application ${application._id}: ${emailResults.user.error}`);
      }
    } catch (emailErr: any) {
      logger.error(`[CareerService] Unexpected error sending career application emails via Brevo SMTP: ${emailErr?.message}`);
    }

    return application;
  }

  async getApplications(params: {
    careerSlug?: string;
    status?: string;
    search?: string;
    page?: string | number;
    limit?: string | number;
  }): Promise<PaginatedResponse<ICareerApplication>> {
    const { page, limit, skip } = getPagination({
      page: params.page,
      limit: params.limit,
    });

    const filter: Record<string, unknown> = {};
    if (params.careerSlug) {
      filter.careerSlug = params.careerSlug.toLowerCase();
    }
    if (params.status && params.status !== 'all') {
      if (params.status === 'new') {
        filter.status = { $in: ['new', 'pending'] };
      } else if (params.status === 'reviewing') {
        filter.status = { $in: ['reviewing', 'reviewed'] };
      } else {
        filter.status = params.status;
      }
    }

    if (params.search) {
      filter.$or = [
        { candidateName: { $regex: params.search, $options: 'i' } },
        { email: { $regex: params.search, $options: 'i' } },
        { phone: { $regex: params.search, $options: 'i' } },
        { careerTitle: { $regex: params.search, $options: 'i' } },
        { coverMessage: { $regex: params.search, $options: 'i' } },
      ];
    }

    const [items, totalItems] = await Promise.all([
      CareerApplication.find(filter)
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CareerApplication.countDocuments(filter),
    ]);

    return buildPaginatedResponse(items as unknown as ICareerApplication[], totalItems, page, limit);
  }

  async getApplicationById(id: string): Promise<ICareerApplication> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.notFound('Invalid career application ID.');
    }
    const application = await CareerApplication.findById(id).lean();
    if (!application) {
      throw AppError.notFound('Career application not found.');
    }
    return application as unknown as ICareerApplication;
  }

  async getResumeFile(id: string): Promise<{
    filePath?: string;
    fileName: string;
    mimeType: string;
    fileBuffer?: Buffer;
  }> {
    const application = await this.getApplicationById(id);
    const fileName = application.resumeFileName || `${application.candidateName.replace(/\s+/g, '_')}_Resume.pdf`;
    const mimeType = application.resumeMimeType || 'application/pdf';

    if (application.resumeKey) {
      const fullPath = path.isAbsolute(application.resumeKey)
        ? application.resumeKey
        : path.resolve(process.cwd(), application.resumeKey);

      if (fs.existsSync(fullPath)) {
        return { filePath: fullPath, fileName, mimeType };
      }
    }

    throw AppError.notFound('Resume file not found on server storage.');
  }

  async updateApplicationStatus(
    id: string,
    status: CareerApplicationStatus,
    notes?: string
  ): Promise<ICareerApplication> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.notFound('Invalid career application ID.');
    }

    const updatePayload: Record<string, unknown> = { status };
    if (notes !== undefined) {
      updatePayload.notes = notes;
    }

    const application = await CareerApplication.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true, runValidators: true }
    );
    if (!application) {
      throw AppError.notFound('Career application not found.');
    }
    return application;
  }

  async deleteApplication(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.notFound('Invalid career application ID.');
    }

    const application = await CareerApplication.findByIdAndDelete(id);
    if (!application) {
      throw AppError.notFound('Career application not found.');
    }

    // Clean up local resume file if exists
    if (application.resumeKey) {
      try {
        const fullPath = path.isAbsolute(application.resumeKey)
          ? application.resumeKey
          : path.resolve(process.cwd(), application.resumeKey);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch {
        // Silently continue
      }
    }
  }

  private async invalidateCache(slug?: string): Promise<void> {
    await Promise.all([
      cacheService.deleteByPattern(CACHE_PATTERNS.ALL_CAREERS),
      slug ? cacheService.deleteCached(CACHE_KEYS.CAREER_DETAIL(slug)) : Promise.resolve(),
      cacheService.deleteCached(CACHE_KEYS.HOME_DATA),
    ]);
  }
}

export const careerService = new CareerService();
