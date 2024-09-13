import { z } from 'zod';

export const JobListRankDto = z.object({
  rank: z.string(),
  placement: z.enum(['top', 'bottom']).optional(),
});

export type JobListRankDtoInput = z.infer<typeof JobListRankDto>;
export type JobListRankDto = z.output<typeof JobListRankDto>;
