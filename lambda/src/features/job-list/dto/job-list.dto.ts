import { z } from 'zod';

export const JobListDto = z.object({
  id: z.string().uuid(),
  label: z.string(),
  order: z.number(),
  userId: z.string().uuid(),
});
