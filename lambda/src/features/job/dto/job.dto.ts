import { createPageResDto } from '@/shared/pagination';
import { JobListDto } from '@/features/job-list/dto';
import { UserDto } from '@/features/user/dto';
import { z } from 'zod';

export const JobDto = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().optional(),
  url: z.string().optional(),
  salary: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  jobListRank: z.string().min(1),
  jobListId: JobListDto.shape.id,
  userId: UserDto.shape.id,
});

export const { PageResOfJobDto } = createPageResDto({ JobDto });
