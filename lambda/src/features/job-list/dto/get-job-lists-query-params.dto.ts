import { PaginationReqQueryDto } from '@/shared/pagination';
import { z } from 'zod';

export const GetJobListsQueryParamsDto = PaginationReqQueryDto.extend({
  jobListId: z.string().optional(),
});
