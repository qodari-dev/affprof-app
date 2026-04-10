import { isErrorResponse } from '@ts-rest/core';

type ErrorBodyWithMessage = {
  message?: string;
};

export function getTsRestErrorMessage(error: unknown | null | undefined): string {
  if (!error) {
    return 'An unexpected error occurred';
  }

  // ts-rest ErrorResponse
  if (isErrorResponse(error)) {
    const body = error.body as ErrorBodyWithMessage;

    if (body.message && typeof body.message === 'string') {
      return body.message;
    }
  }

  // Standard JS/TS Error
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'An unexpected error occurred';
}
