export class ExceptionError extends Error {
  statusCode: number;
  error?: string;
  constructor(statusCode: number, message: string, error?: string) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
  }
}

export function notFoundException(message?: string) {
  return new ExceptionError(404, 'Not found', message);
}

export function unauthorizedException(message?: string) {
  return new ExceptionError(401, 'Unauthorized', message);
}

export function conflictException(message?: string) {
  return new ExceptionError(409, 'Conflict', message);
}

export function badRequestException(message?: string) {
  return new ExceptionError(400, 'Bad Request', message);
}
