import { JobListDto } from './job-list.dto';

export const CreateJobListDto = JobListDto.pick({ label: true });
