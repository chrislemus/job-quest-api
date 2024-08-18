import z from 'zod';

export const jobListIdPathParamsSchema = z.object({ id: z.string().uuid() });
