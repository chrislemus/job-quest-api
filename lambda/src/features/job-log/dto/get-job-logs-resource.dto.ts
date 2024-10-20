import { z } from 'zod';
import { PaginationReqQueryDto } from '@/shared/pagination';

export const GetJobLogsQueryParamsDto = PaginationReqQueryDto.extend({
  jobId: z.string().uuid(),
});
