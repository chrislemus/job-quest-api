import {
  ValidationArguments,
  IsNumber,
  ValidateIf,
  IsOptional,
} from 'class-validator';

/**
 * Parameters for assigning job list to job
 * - only one property must be defined
 */
export class JobListDto {
  @ValidateIf((obj: JobListDto) => {
    const keys = Object.keys(obj);
    const valueCountNotInRange = !valueCountInRange(obj);
    const propValueProvided = keys.includes('id');
    return propValueProvided || valueCountNotInRange;
  })
  @IsNumber(
    {},
    {
      message: ({ object, property }: ValidationArguments) => {
        const count = Object.keys(object)?.length;
        const overRange = count > 1;
        const belowRange = count < 1;

        // global class validation
        if (overRange || belowRange) {
          return overRange ? overRangeErrorMsg : belowRangeErrorMsg;
        } else {
          return `${property} must be a number conforming to the specified constraints`;
        }
      },
    },
  )
  id?: number;

  @ValidateIf((obj: JobListDto) => valueCountInRange(obj))
  @IsNumber()
  @IsOptional()
  beforeJobId?: number;

  @ValidateIf((obj: JobListDto) => valueCountInRange(obj))
  @IsNumber()
  @IsOptional()
  afterJobId?: number;
}

export const overRangeErrorMsg =
  'Job list should have at most one property defined';
export const belowRangeErrorMsg =
  'Job list should have at least one property defined';

function valueCountInRange(obj: JobListDto) {
  const keys = Object.keys(obj);
  const count = keys.length;
  return count == 1;
}
