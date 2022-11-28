import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class DeleteManyUsersQueryDto {
  @IsNumber({}, { each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value?.map((strNum) => +strNum);
    } else {
      return [+value];
    }
  })
  userIds: number[];
}
