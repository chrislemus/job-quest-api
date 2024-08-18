import { z } from 'zod';

export const userDeletePathParamsSchema = z.object({ id: z.string().uuid() });
