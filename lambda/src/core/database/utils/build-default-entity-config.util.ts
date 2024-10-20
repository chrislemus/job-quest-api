// import { uuid } from '../../utils';
// import { z } from 'zod';
// import { StringAttribute } from 'electrodb';
// import { dbConfig } from '../config';

// const uuidSchema = z.string().uuid();

// export function buildDefaultEntityConfig<TEntityName extends string>(
//   entity: TEntityName
// ) {
//   const itemIdPropName = `${entity}Id` as const;

//   const attributes = {
//     id: {
//       type: 'string',
//       readOnly: true,
//       watch: '*', // set to run before all other attributes
//       get: (_, attributes) => attributes[itemIdPropName],
//       set: () => undefined,
//     } as StringAttribute,
//     [itemIdPropName]: {
//       type: 'string',
//       readOnly: true,
//       required: true,
//       hidden: true,
//       watch: ['id'], // set to run after id attribute
//       default: () => uuid(),
//       validate: (value) => uuidSchema.safeParse(value)?.error?.message,
//     } as StringAttribute,
//   } as {
//     [K in TEntityName as `${K}Id`]: StringAttribute;
//   } & { id: StringAttribute };

//   return {
//     attributes,
//     model: {
//       entity,
//       version: '1',
//       service: 'jobquest',
//     },
//     dbConfig,
//     _itemIdPropName: `${entity}Id` as const,
//   } as const;
// }
import { dbConfig } from '../config';
import { z } from 'zod';
import { StringAttribute } from 'electrodb';
import { uuid } from '@/shared';

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

const uuidSchema = z.string().uuid();

export function buildDefaultEntityConfig<TEntityName extends string>(
  entity: TEntityName,
) {
  const itemIdPropName = `${entity}Id` as const;

  const itemIdConfig: StringAttribute = {
    type: 'string',
    readOnly: true,
    required: true,
    watch: ['id'],
    hidden: true,
    default: () => uuid(),
    validate: ((value: string) =>
      uuidSchema.safeParse(value).error
        ?.message) as StringAttribute['validate'],
  } as const;

  const itemPropNameConfig = {
    type: [itemIdPropName],
    readOnly: true,
    required: true,
    watch: '*',
    default: itemIdPropName,
    set: () => undefined,
    get: ((_, attributes) =>
      attributes[itemIdPropName]) as StringAttribute['get'],
  } as const;

  type TAttributes = {
    [K in TEntityName as `${K}Id`]: typeof itemIdConfig;
  } & {
    // _itemIdProp: typeof itemPropNameConfig;
    id: typeof itemPropNameConfig;
  };

  const attributes = {
    [itemIdPropName]: itemIdConfig,
    // _itemIdProp: itemPropNameConfig,
    id: itemPropNameConfig,
  } as Prettify<TAttributes>;

  return {
    attributes,
    model: {
      entity,
      version: '1',
      service: 'jobquest',
    },
    dbConfig,
    _itemIdPropName: `${entity}Id` as const,
  } as const;
}
