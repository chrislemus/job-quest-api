import { z } from 'zod';
import { PaginationReqQueryDto } from '@/shared/pagination';

export const GetJobsQueryParamsDto = PaginationReqQueryDto.extend({
  jobListId: z.string().optional(),
});
