import { z } from 'zod';
import { Entity, EntityItem, QueryResponse } from 'electrodb';
import { defaultUserEntityConfig } from './user.model';
import { TCreateEntityItem } from '../types';
import { buildDefaultEntityConfig, zValidate } from '../utils';
import { RequireFields } from '@/shared/types';
import { uuid } from '@/shared';

const labelSchema = z.string().min(1);
const uuidSchema = z.string().uuid();

export const defaultJobListEntityConfig = buildDefaultEntityConfig('jobList');
const { model, attributes, dbConfig, _itemIdPropName } =
  defaultJobListEntityConfig;

export const JobListEntityService = new Entity(
  {
    model,
    attributes: {
      ...attributes,
      order: { type: 'number', required: true },
      label: {
        type: 'string',
        required: true,
        validate: (val) => zValidate(labelSchema, val),
      },
      [defaultUserEntityConfig._itemIdPropName]: {
        type: 'string',
        required: true,
        validate: (val) => zValidate(uuidSchema, val),
      },
    },
    indexes: {
      jobList: {
        scope: model.entity,
        pk: {
          field: 'pk',
          composite: [defaultUserEntityConfig._itemIdPropName],
        },
        sk: {
          field: 'sk',
          composite: [_itemIdPropName],
        },
      },
    },
  },
  {
    ...dbConfig,
  },
);

export type JobListItem = EntityItem<typeof JobListEntityService>;
export type CreateJobListItem = TCreateEntityItem<typeof JobListEntityService>;
export type JobListQueryResponse = QueryResponse<typeof JobListEntityService>;

export function createMockJobList(
  overrides: RequireFields<
    Partial<CreateJobListItem>,
    'order' | 'label' | 'userId'
  >,
) {
  return {
    jobListId: uuid(),
    ...overrides,
  } as const;
}
