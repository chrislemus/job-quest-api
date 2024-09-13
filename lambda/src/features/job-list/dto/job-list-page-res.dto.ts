import { createPageResDto } from '@/shared/pagination';
import { JobListDto } from './job-list.dto';

export const JobListPageResDto = createPageResDto({ JobListDto });
