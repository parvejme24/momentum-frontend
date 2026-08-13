import type { ApiErrorDetail } from "@/lib/api/types";

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "TOKEN_EXPIRED"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "NETWORK_ERROR"
  | "UNKNOWN";

const KNOWN_CODES = new Set<string>([
  "UNAUTHORIZED",
  "TOKEN_EXPIRED",
  "VALIDATION_ERROR",
  "NOT_FOUND",
  "CONFLICT",
  "RATE_LIMITED",
  "INTERNAL_ERROR",
  "NETWORK_ERROR",
  "UNKNOWN",
]);

export function normalizeApiErrorCode(code: string): ApiErrorCode {
  if (KNOWN_CODES.has(code)) {
    return code as ApiErrorCode;
  }
  return "UNKNOWN";
}

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly details: ApiErrorDetail[];

  constructor(options: {
    code: string;
    message: string;
    status: number;
    details?: ApiErrorDetail[];
  }) {
    super(options.message);
    this.name = "ApiError";
    this.code = normalizeApiErrorCode(options.code);
    this.status = options.status;
    this.details = options.details ?? [];
  }

  fieldErrors(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const detail of this.details) {
      if (detail.field && detail.message && !(detail.field in result)) {
        result[detail.field] = detail.message;
      }
    }
    return result;
  }
}
