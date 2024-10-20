import { z } from 'zod';
import { Entity, EntityItem, QueryResponse } from 'electrodb';
import { TCreateEntityItem } from '../types';
import { buildDefaultEntityConfig, zValidate } from '../utils';
import { defaultJobEntityConfig } from './job.model';
import { RequireFields } from '@/shared/types';
import { uuid } from '@/shared';
import { defaultUserEntityConfig } from './user.model';

const jobLogContentSchema = z.string().min(1); // arbitrary min length
const uuidSchema = z.string().uuid();

export const defaultJobLogEntityConfig = buildDefaultEntityConfig('jobLog');
const { model, attributes, dbConfig, _itemIdPropName } =
  defaultJobLogEntityConfig;

export const JobLogEntityService = new Entity(
  {
    model,
    attributes: {
      ...attributes,
      content: {
        type: 'string',
        required: true,
        validate: (val) => zValidate(jobLogContentSchema, val),
      },
      [defaultJobEntityConfig._itemIdPropName]: {
        type: 'string',
        required: true,
        validate: (val) => zValidate(uuidSchema, val),
      },
      [defaultUserEntityConfig._itemIdPropName]: {
        type: 'string',
        required: true,
        validate: (val) => zValidate(uuidSchema, val),
      },
      createdAt: {
        type: 'number',
        readOnly: true,
        required: true,
        default: () => Date.now(),
        set: () => Date.now(),
      },
      updatedAt: {
        type: 'number',
        watch: '*',
        required: true,
        default: () => Date.now(),
        set: () => Date.now(),
      },
    },
    indexes: {
      jobLog: {
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
      jobLogByJobId: {
        scope: model.entity,
        index: 'gsi1',
        pk: {
          field: 'gsi1pk',
          composite: [defaultJobEntityConfig._itemIdPropName],
        },
        sk: {
          field: 'gsi1sk',
          composite: [_itemIdPropName],
        },
      },
    },
  },
  {
    ...dbConfig,
  },
);

export type JobLogItem = EntityItem<typeof JobLogEntityService>;
export type CreateJobLogItem = TCreateEntityItem<typeof JobLogEntityService>;
export type JobLogQueryResponse = QueryResponse<typeof JobLogEntityService>;

export function createMockJobLog(
  overrides: RequireFields<Partial<CreateJobLogItem>, 'content' | 'jobId'>,
) {
  return {
    jobLogId: uuid(),
    ...overrides,
  } as const;
}
