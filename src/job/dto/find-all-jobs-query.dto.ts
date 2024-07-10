import { PaginatedQuery } from '@app/common/pagination';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FindAllJobsQueryDto extends PaginatedQuery {
  @IsOptional()
  @IsString()
  // @IsString({ each: true })
  // @Transform(({ value }) => {
  //   if (!Array.isArray(value)) return [value];
  //   return value;
  // })
  jobListId?: string;
}
