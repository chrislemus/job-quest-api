import { CreateJobBaseDto, jobListRankSuperRefine } from '../dto';

export const UpdateJobDto = CreateJobBaseDto.partial().superRefine(
  jobListRankSuperRefine,
);
