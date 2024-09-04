import { z } from 'zod';

export const jobListRankDto = z.object({
  rank: z.string(),
  placement: z.enum(['top', 'bottom']).optional(),
});

export type JobListRankDtoInput = z.infer<typeof jobListRankDto>;
export type JobListRankDtoOutput = z.output<typeof jobListRankDto>;
