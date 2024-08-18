import { z } from 'zod';

export const jobListSchema = z.object({
  id: z.string().uuid(),
  label: z.string(),
  order: z.number(),
  userId: z.string().uuid(),
});
