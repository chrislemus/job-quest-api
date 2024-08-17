import { z } from 'zod';

export const jobListSchema = z.object({
  id: z.string().uuid(),
  // title: z.string(),
  // userId: userSchema.shape.id,
});
