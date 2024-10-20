export class ExceptionError extends Error {
  status: number;
  error?: string | string[];
  constructor(status: number, message: string, error?: string | string[]) {
    super(message);
    this.status = status;
    this.error = error;
  }
}

export function notFoundException(error?: string | string[]) {
  return new ExceptionError(404, 'Not found', error);
}

export function unauthorizedException(error?: string | string[]) {
  return new ExceptionError(401, 'Unauthorized', error);
}

export function conflictException(error?: string | string[]) {
  return new ExceptionError(409, 'Conflict', error);
}

export function badRequestException(error?: string | string[]) {
  return new ExceptionError(400, 'Bad request', error);
}

export function internalServerException(error?: string | string[]) {
  return new ExceptionError(500, 'Internal server error', error);
}
