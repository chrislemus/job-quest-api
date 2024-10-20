import { createPageResDto } from '@/shared/pagination';
import { JobDto } from './job.dto';

const jobRanks = JobDto.pick({ jobRank: true, jobListId: true }).extend({
  jobId: JobDto.shape.id,
});

export const JobRanksPageResDto = createPageResDto({ jobRanks });
