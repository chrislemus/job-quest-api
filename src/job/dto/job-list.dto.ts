import _ from 'lodash';
import {
  ValidationArguments,
  IsNumber,
  ValidateIf,
  IsOptional,
} from 'class-validator';

function valueCount(obj: Record<string, any>) {
  return _.size(_.pickBy(obj, _.identity));
}

/**
 * Parameters for assigning job list to job
 * - only one property must be defined
 */
export class JobListDto {
  @ValidateIf((obj: JobListDto, value) => {
    if (value) return true;
    return valueCount(obj) !== 1;
  })
  @IsNumber(
    {},
    {
      message: ({ object, property }: ValidationArguments) => {
        const count = valueCount(object);
        if (count === 1) {
          return `${property} must be a number conforming to the specified constraints`;
        }
        const overRange = count > 1;
        return overRange ? overRangeErrorMsg : belowRangeErrorMsg;
      },
    },
  )
  id?: number;

  @IsNumber()
  @IsOptional()
  beforeJobId?: number;

  @IsNumber()
  @IsOptional()
  afterJobId?: number;
}

export const overRangeErrorMsg =
  'Job list should have at most one property defined';
export const belowRangeErrorMsg =
  'Job list should have at least one property defined';
