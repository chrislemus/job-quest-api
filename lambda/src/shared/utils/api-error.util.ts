import { z } from 'zod';
import { badRequestException } from './http-exceptions.util';

export async function apiParse<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  value: any,
): Promise<z.output<TSchema>> {
  const result = await schema.spa(value);
  if (result.error) {
    const validationErrors = result.error.issues.map((issue) => {
      const strPath = issue.path.join('.');
      const message = issue.message;
      const formattedMessage = strPath ? `${strPath} ${message}` : message;
      return formattedMessage;
    });
    throw badRequestException(validationErrors);
  }
  return result.data as z.output<TSchema>;
}

// export function apiError(error: z.ZodError) {
//   const validationErrors = error.issues.map((issue) => {
//     const strPath = issue.path.join('.');
//     const message = issue.message;
//     const formattedMessage = strPath ? `${strPath} ${message}` : message;
//     return formattedMessage;
//   });
//   throw badRequestException(validationErrors);
//   return {
//     status: 400,
//     body: { messages: validationErrors },
//   };
// }
