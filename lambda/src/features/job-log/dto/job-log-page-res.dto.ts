import { createPageResDto } from '@/shared/pagination';
import { JobLogEntity } from '../entities';

export const JobLogPageResDto = createPageResDto({ JobLogEntity });
