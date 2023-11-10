import { ArgumentMetadata } from '@nestjs/common';
import {
  JobListDto,
  belowRangeErrorMsg,
  overRangeErrorMsg,
} from './job-list.dto';
import { ValidationPipe } from '@app/common/pipes';

const pipe = new ValidationPipe();
async function validate(object: Record<string, any>) {
  const meta: ArgumentMetadata = { type: 'body', metatype: JobListDto };
  const errors = await pipe
    .transform(object, meta)
    .then(() => [])
    .catch((e) => e.response.message);
  return errors;
}

describe('JobListDto', () => {
  it('Should return over range error', async () => {
    const data = { id: 'd', beforeJobId: 'd' };
    const errors = await validate(data);
    expect(errors).toHaveLength(2);
    expect(errors[0]).toEqual(overRangeErrorMsg);
  });
  it('Should return below range error', async () => {
    const errors = await validate({});
    expect(errors).toHaveLength(1);
    expect(errors?.[0]).toEqual(belowRangeErrorMsg);
  });
  it.each(['id', 'beforeJobId', 'afterJobId'] as (keyof JobListDto)[])(
    'JobListDto.[%s] should only return property validation error',
    async (propertyName) => {
      const data = { [propertyName]: 'fwe' };
      const errors = await validate(data);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual(
        `${propertyName} must be a number conforming to the specified constraints`,
      );
    },
  );
});
