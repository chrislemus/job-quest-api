import { z } from 'zod';
import { pageInfoSchema } from './page-info.schema';
import { upperFirst, size, entries } from 'lodash';

export function createPageResSchema<
  SchemaObj extends Record<string, z.ZodTypeAny>,
>(schemaObj: SchemaObj) {
  if (size(schemaObj) !== 1) throw new Error('Only one schema is allowed');
  const [_schemaName, schema] = entries(schemaObj)[0];
  const schemaName = `pageResOf${upperFirst(_schemaName)}`;

  const res = {
    items: z.array(schema),
    pageInfo: pageInfoSchema,
  };
  return { [schemaName]: z.object(res) } as {
    [Prop in keyof SchemaObj as `pageResOf${Capitalize<
      string & Prop
    >}`]: z.ZodObject<{
      pageInfo: typeof pageInfoSchema;
      items: z.ZodArray<SchemaObj[Prop]>;
    }>;
  };
}
