import { isErrorResponse } from '@ts-rest/core';

type ErrorBodyWithMessage = {
  message?: string;
  code?: string;
  params?: Record<string, unknown>;
};

export type TsRestApiError = {
  message: string;
  code: string;
  params?: Record<string, unknown>;
};

/**
 * Extract the error code from a ts-rest error response.
 * Returns 'GENERIC' if no code is found.
 */
export function getTsRestError(error: unknown | null | undefined): TsRestApiError {
  if (!error) {
    return { message: 'An unexpected error occurred', code: 'GENERIC' };
  }

  if (isErrorResponse(error)) {
    const body = error.body as ErrorBodyWithMessage;
    return {
      message: body.message ?? 'An unexpected error occurred',
      code: body.code ?? 'GENERIC',
      params: body.params,
    };
  }

  if (error instanceof Error && error.message) {
    return { message: error.message, code: 'GENERIC' };
  }

  return { message: 'An unexpected error occurred', code: 'GENERIC' };
}

/**
 * @deprecated Use getTsRestError() + translateError() instead for i18n support.
 * Kept for backward compatibility during migration.
 */
export function getTsRestErrorMessage(error: unknown | null | undefined): string {
  return getTsRestError(error).message;
}
