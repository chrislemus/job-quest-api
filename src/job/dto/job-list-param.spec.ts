import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  JobListParamDto,
  belowRangeErrorMsg,
  overRangeErrorMsg,
} from './job-list-param.dto';

describe('JobListParamDto', () => {
  it('Should return over range error', async () => {
    const instance = plainToInstance(JobListParamDto, {
      id: '',
      beforeJobId: 'd',
    });
    const errors = await validate(instance);
    expect(errors).toHaveLength(1);
    expect(errors?.[0].constraints?.isNumber).toEqual(overRangeErrorMsg);
  });
  it('Should return below range error', async () => {
    const instance = plainToInstance(JobListParamDto, {});
    const errors = await validate(instance);
    expect(errors).toHaveLength(1);
    expect(errors?.[0].constraints?.isNumber).toEqual(belowRangeErrorMsg);
  });
  it.each(['id', 'beforeJobId', 'afterJobId'] as (keyof JobListParamDto)[])(
    'JobListParamDto.[%s] should only return property validation error',
    async (propertyName) => {
      const data = {};
      data[`${propertyName}`] = '';
      const instance = plainToInstance(JobListParamDto, data);

      const errors = await validate(instance);
      expect(errors).toHaveLength(1);

      expect(errors[0].constraints?.isNumber).toEqual(
        `${propertyName} must be a number conforming to the specified constraints`,
      );
    },
  );
});
