/** Standard shape returned by every backend endpoint. */
export interface ApiResult<T> {
  data: T;
  message?: string;
  timestamp: string;
}

/** Error body FastAPI conventionally returns. */
export interface ApiError {
  detail: string | Array<{ loc: (string | number)[]; msg: string; type: string }>;
  code?: string;
  timestamp?: string;
}
