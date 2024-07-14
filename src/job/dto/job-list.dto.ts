import {
  ValidationArguments,
  IsOptional,
  IsString,
  ValidationOptions,
  registerDecorator,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
const propNames = {
  id: 'id',
  beforeJobId: 'beforeJobId',
  afterJobId: 'afterJobId',
} as const;

@ValidatorConstraint({ name: 'jobListProperty', async: false })
export class JobListPropertyConstraint implements ValidatorConstraintInterface {
  validate(_, args: ValidationArguments) {
    const validPropNames = Object.values(propNames);
    const queryPropNames = Object.keys(args.object);
    const currPropName = args.property;

    if (!validPropNames.includes(currPropName as any)) return false; // invalid property name
    if (queryPropNames.length > 1) return false;

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const validPropNames = Object.values(propNames);
    const queryPropNames = Object.keys(args.object);
    const currPropName = args.property;

    if (queryPropNames.length > 1) {
      const validPropNamesStr = validPropNames.join(', ');
      return `${currPropName}: only one property must be defined: ${validPropNamesStr}`;
    }
    return `${currPropName}: invalid property name.`;
  }
}

export function JobListProperty(validationOptions?: ValidationOptions) {
  return function (object: Record<any, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: JobListPropertyConstraint,
    });
  };
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
  @JobListProperty()
  @IsOptional()
  [propNames.id]: string;

  @IsString()
  @JobListProperty()
  @IsOptional()
  [propNames.beforeJobId]?: string;

  @IsString()
  @JobListProperty()
  @IsOptional()
  [propNames.afterJobId]?: string;
}
