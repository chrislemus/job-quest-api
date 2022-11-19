import { PaginatedQuery } from '@app/common/pagination';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class FindAllJobsQueryDto extends PaginatedQuery {
  @IsOptional()
  @IsNumber({}, { each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value?.map((strNum) => +strNum);
    } else {
      return [+value];
    }
  })
  jobListId?: number[];
}
