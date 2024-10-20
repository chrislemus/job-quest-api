import { z } from 'zod';
import { PaginationReqQueryDto } from '@/shared/pagination';

export const GetJobRanksQueryParamsDto = PaginationReqQueryDto.extend({
  jobListId: z.string(),
});
