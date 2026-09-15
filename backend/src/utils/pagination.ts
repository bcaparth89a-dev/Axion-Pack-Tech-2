export interface PaginationOptions {
  page?: number | string;
  limit?: number | string;
  maxLimit?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const getPagination = ({
  page = 1,
  limit = 20,
  maxLimit = 100,
}: PaginationOptions = {}): PaginationResult => {
  const parsedPage = Math.max(1, parseInt(String(page), 10) || 1);
  const rawLimit = parseInt(String(limit), 10) || 20;
  // Enforce server-side boundaries: between 1 and maxLimit
  const parsedLimit = Math.min(Math.max(1, rawLimit), maxLimit);
  const skip = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip,
  };
};

export const buildPaginatedResponse = <T>(
  items: T[],
  totalItems: number,
  page: number,
  limit: number
): PaginatedResponse<T> => {
  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    items,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};
