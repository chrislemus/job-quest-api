import { z } from 'zod';
import { PageInfoDto } from './page-info.dto';
import { upperFirst, size, entries } from 'lodash';

export function createPageResDto<
  SchemaObj extends Record<string, z.ZodTypeAny>,
>(schemaObj: SchemaObj) {
  if (size(schemaObj) !== 1) throw new Error('Only one schema is allowed');
  const [_schemaName, schema] = entries(schemaObj)[0];
  const schemaName = `PageResOf${upperFirst(_schemaName)}`;

  const res = {
    items: z.array(schema),
    pageInfo: PageInfoDto,
  };
  return { [schemaName]: z.object(res) } as {
    [Prop in keyof SchemaObj as `PageResOf${Capitalize<
      string & Prop
    >}`]: z.ZodObject<{
      pageInfo: typeof PageInfoDto;
      items: z.ZodArray<SchemaObj[Prop]>;
    }>;
  };
}
