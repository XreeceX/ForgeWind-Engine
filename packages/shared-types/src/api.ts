export interface ApiError {
  code: string;
  message: string;
  details: Record<string, unknown> | null;
}

export interface ResponseMetadata {
  requestId: string;
  timestamp: string;
  version: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  metadata: ResponseMetadata;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
