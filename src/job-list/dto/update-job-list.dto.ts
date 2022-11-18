import { PartialType } from '@nestjs/swagger';
import { CreateJobListDto } from './create-job-list.dto';

export class UpdateJobListDto extends PartialType(CreateJobListDto) {}
