import { z } from 'zod';
import { JobLogEntity } from '../entities';

export const CreateAJobLogDto = JobLogEntity.pick({
  jobId: true,
  content: true,
});

export type CreateAJobLogDto = z.output<typeof CreateAJobLogDto>;
export type CreateAJobLogDtoInput = z.input<typeof CreateAJobLogDto>;
