import { z } from 'zod';

export const JobLogEntity = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  jobId: z.string().uuid(),
  content: z.string().min(1),
  /** epoch time */
  createdAt: z.number().min(1),
  /** epoch time */
  updatedAt: z.number().min(1),
});

export type JobLogEntity = z.output<typeof JobLogEntity>;
export type JobLogEntityInput = z.input<typeof JobLogEntity>;
