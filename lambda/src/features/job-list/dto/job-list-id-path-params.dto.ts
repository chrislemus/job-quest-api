import z from 'zod';

export const JobListIdPathParamsDto = z.object({ id: z.string().uuid() });
