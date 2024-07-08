import {
  ValidationArguments,
  IsNumber,
  ValidateIf,
  IsOptional,
  IsString,
  ValidationOptions,
  registerDecorator,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
} from 'class-validator';

@ValidatorConstraint({ name: 'customText', async: false })
export class OnlyOneJobIdPlacement implements ValidatorConstraintInterface {
  validate(_, args: ValidationArguments) {
    const hasBeforeJobId = args.object.hasOwnProperty('beforeJobId');
    const hasAfterJobId = args.object.hasOwnProperty('afterJobId');

    if (hasBeforeJobId && hasAfterJobId) return false;
    return true;
  }

  defaultMessage() {
    return 'Only one property must be defined: "beforeJobId" or "afterJobId"';
  }
}

/**
 * Parameters for assigning job list to job
 * - only one property must be defined
 */
export class JobListDto {
  // Review this
  // Review this
  // Review this
  // Review this
  // Review this
  // Review this
  // @ValidateIf((obj: JobListDto) => {
  //   const keys = Object.keys(obj);
  //   const valueCountNotInRange = !valueCountInRange(obj);
  //   const propValueProvided = keys.includes('id');
  //   return propValueProvided || valueCountNotInRange;
  // })
  // @IsNumber(
  //   {},
  //   {
  //     message: ({ object, property }: ValidationArguments) => {
  //       const count = Object.keys(object)?.length;
  //       const overRange = count > 1;
  //       const belowRange = count < 1;

  //       // global class validation
  //       if (overRange || belowRange) {
  //         return overRange ? overRangeErrorMsg : belowRangeErrorMsg;
  //       } else {
  //         return `${property} must be a number conforming to the specified constraints`;
  //       }
  //     },
  //   },
  // )
  @IsString()
  id: string;

  // @ValidateIf((obj: JobListDto) => valueCountInRange(obj))
  @IsString()
  @Validate(OnlyOneJobIdPlacement)
  @IsOptional()
  beforeJobId?: number;

  // @ValidateIf((obj: JobListDto) => valueCountInRange(obj))
  @IsString()
  @Validate(OnlyOneJobIdPlacement)
  @IsOptional()
  afterJobId?: number;
}
