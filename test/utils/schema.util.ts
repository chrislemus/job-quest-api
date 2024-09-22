import { z, ZodType, ZodTypeDef } from 'zod';

export function buildCommonApiResSchema<
  T1,
  T2 extends ZodTypeDef,
  T3,
  T6 extends ZodType<T1, T2, T3>,
>(status: number, dataSchema: T6) {
  return z
    .object({
      status: z.literal(status),
      data: z.object({
        data: dataSchema,
      }),
    })
    .transform((res) => res.data as { data: z.output<T6> });
}

export const zTest = <
  T1,
  T2 extends ZodTypeDef,
  T3,
  T6 extends ZodType<T1, T2, T3>,
>(
  _zodEffect: T6,
  data: any,
) => {
  const res = _zodEffect.safeParse(data);
  if (res.error) {
    const errors = {};
    const SchemaErrors = res.error.errors.forEach((_e) => {
      const { path, ...e } = _e;
      const length = path.length;
      path.forEach((key, i) => {
        if (!errors[key]) errors[key] = {};

        if (i === length - 1) {
          const stringErrors: string[] = [];
          Object.entries(e).forEach(([k, v]) => {
            stringErrors.push(`${k}:${v}`);
          });
          errors[key] = stringErrors.join(' | ');
        }
      });
    });

    // expect(JSON.stringify({ SchemaErrors })).toEqual(1);
    expect({ data: data?.data, status: data?.status }).toEqual({
      data: { data: errors },
    });
    expect({ data: data?.data, status: data?.status }).toEqual(SchemaErrors);
    // expect({ data: data?.data, status: data?.status }).toEqual(SchemaErrors);

    throw new Error(JSON.stringify({ SchemaErrors }, null, 2));
  }
  if (!res.data) throw new Error(JSON.stringify(res.error));
  return res.data as z.output<T6>;
};
