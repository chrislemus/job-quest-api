import { createPageResSchema } from '../../pagination';
import { jobListSchema } from '../../job-list/schemas';
import { userSchema } from '../../user/schemas';
import { z } from 'zod';

export const jobSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  company: z.string(),
  location: z.string().optional(),
  url: z.string().optional(),
  salary: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  jobListRank: z.string(),
  jobListId: jobListSchema.shape.id,
  userId: userSchema.shape.id,
});

export const { pageResOfJobSchema } = createPageResSchema({ jobSchema });
