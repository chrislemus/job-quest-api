import { ExceptionError } from './http-exceptions.util';

export function formatHandlerError(error: any) {
  if (error instanceof ExceptionError) {
    const body = Array.isArray(error.error)
      ? { error: error.message, messages: error.error }
      : { error: error.message, message: error.error };
    return {
      status: error.status,
      body,
      // body: JSON.stringify({ message: error.message, error: error.error }),
    };
  } else {
    console.error(error);
    return {
      status: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
}
