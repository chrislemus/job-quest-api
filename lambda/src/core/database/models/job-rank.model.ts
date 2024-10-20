import { z } from 'zod';
import { Entity, EntityItem, QueryResponse } from 'electrodb';
import { TCreateEntityItem } from '../types';
import { buildDefaultEntityConfig, zValidate } from '../utils';
import { defaultJobListEntityConfig } from './job-list.model';
import { defaultJobEntityConfig } from './job.model';
import { RequireFields } from '@/shared/types';
import { uuid } from '@/shared';

const jobListRankSchema = z.string().min(1); // arbitrary min length
const uuidSchema = z.string().uuid();

export const defaultJobRankEntityConfig = buildDefaultEntityConfig('jobRank');
const { model, attributes, dbConfig, _itemIdPropName } =
  defaultJobRankEntityConfig;

export const JobRankEntityService = new Entity(
  {
    model,
    attributes: {
      ...attributes,
      jobRank: {
        type: 'string',
        required: true,
        validate: (val) => zValidate(jobListRankSchema, val),
      },
      [defaultJobListEntityConfig._itemIdPropName]: {
        type: 'string',
        required: true,
        validate: (val) => zValidate(uuidSchema, val),
      },
      [defaultJobEntityConfig._itemIdPropName]: {
        type: 'string',
        required: true,
        validate: (val) => zValidate(uuidSchema, val),
      },
    },
    indexes: {
      jobRank: {
        scope: model.entity,
        pk: {
          field: 'pk',
          composite: [defaultJobListEntityConfig._itemIdPropName],
        },
        sk: {
          field: 'sk',
          composite: ['jobRank'],
        },
      },
    },
  },
  {
    ...dbConfig,
  },
);

export type JobRankItem = EntityItem<typeof JobRankEntityService>;
export type CreateJobRankItem = TCreateEntityItem<typeof JobRankEntityService>;
export type JobRankQueryResponse = QueryResponse<typeof JobRankEntityService>;

export function createMockJobRank(
  overrides: RequireFields<
    Partial<CreateJobRankItem>,
    'jobRank' | 'jobListId' | 'jobId'
  >,
) {
  return {
    jobRankId: uuid(),
    ...overrides,
  } as const;
}
