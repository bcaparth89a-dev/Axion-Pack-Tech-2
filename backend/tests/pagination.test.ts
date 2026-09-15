import { getPagination, buildPaginatedResponse } from '../src/utils/pagination.js';

describe('Server-Side Pagination Safeguards', () => {
  it('should enforce default page = 1 and limit = 20', () => {
    const { page, limit, skip } = getPagination({});
    expect(page).toBe(1);
    expect(limit).toBe(20);
    expect(skip).toBe(0);
  });

  it('should prevent unbounded queries (e.g. limit=1000000 clamped to maxLimit: 100)', () => {
    const { limit } = getPagination({ limit: 1000000, maxLimit: 100 });
    expect(limit).toBe(100);
  });

  it('should handle negative or invalid inputs defensively', () => {
    const { page, limit, skip } = getPagination({ page: -5, limit: -20 });
    expect(page).toBe(1);
    expect(limit).toBe(1);
    expect(skip).toBe(0);
  });

  it('should build accurate pagination metadata for response payloads', () => {
    const items = [{ id: 1 }, { id: 2 }];
    const totalItems = 45;
    const page = 2;
    const limit = 20;

    const response = buildPaginatedResponse(items, totalItems, page, limit);

    expect(response.items).toHaveLength(2);
    expect(response.pagination.totalItems).toBe(45);
    expect(response.pagination.totalPages).toBe(3);
    expect(response.pagination.currentPage).toBe(2);
    expect(response.pagination.hasNextPage).toBe(true);
    expect(response.pagination.hasPrevPage).toBe(true);
  });
});
