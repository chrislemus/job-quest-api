import z from 'zod';

export const jobIdPathParamsSchema = z.object({ id: z.string().uuid() });
