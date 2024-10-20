import { ZodTypeAny } from 'zod';

export const zValidate = <T extends ZodTypeAny>(zodType: T, value: any) =>
  zodType.safeParse(value).error?.message;
