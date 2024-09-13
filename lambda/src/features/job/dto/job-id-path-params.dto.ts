import z from 'zod';

export const JobIdPathParamsDto = z.object({ id: z.string().uuid() });
