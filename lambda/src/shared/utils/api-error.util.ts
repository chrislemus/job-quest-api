import { z } from 'zod';

export function apiError(error: z.ZodError) {
  const validationErrors = error.issues.map((issue) => {
    const strPath = issue.path.join('.');
    const message = issue.message;
    const formattedMessage = strPath ? `${strPath} ${message}` : message;
    return formattedMessage;
  });
  return {
    status: 400,
    body: { messages: validationErrors },
  };
}
