export interface PageRequest {
  page: number;        // 1-indexed
  pageSize: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface Paged<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
