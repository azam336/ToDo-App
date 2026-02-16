// Standard API response types following Constitution Article VI

export interface ApiMeta {
  timestamp: string;
  requestId: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: ApiMeta;
}

export interface ApiListResponse<T> {
  data: T[];
  meta: ApiMeta & {
    total: number;
    limit: number;
    nextCursor?: string;
    hasMore: boolean;
  };
}

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: ApiFieldError[];
}

export interface ApiFieldError {
  field: string;
  code: string;
  message: string;
}

// Pagination types
export interface PaginationParams {
  limit?: number;
  cursor?: string;
}

export interface SortParams {
  sort?: string; // Field name, prefix with '-' for descending
}
