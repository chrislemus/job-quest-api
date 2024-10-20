import { z } from 'zod';
import { Entity, EntityItem, QueryResponse } from 'electrodb';
import { defaultUserEntityConfig } from './user.model';
import { TCreateEntityItem } from '../types';
import { buildDefaultEntityConfig, zValidate } from '../utils';
import { defaultJobListEntityConfig } from './job-list.model';
import { faker } from '@faker-js/faker';
import { uuid } from '@/shared';
import { RequireFields } from '@/shared/types';

const titleSchema = z.string().min(1),
  companySchema = z.string().min(1),
  jobRankSchema = z.string().min(4),
  uuidSchema = z.string().uuid();

export const defaultJobEntityConfig = buildDefaultEntityConfig('job');
const { model, attributes, dbConfig, _itemIdPropName } = defaultJobEntityConfig;

export const JobEntityService = new Entity(
  {
    model,
    attributes: {
      ...attributes,
      title: {
        type: 'string',
        required: true,
        validate: (val) => zValidate(titleSchema, val),
      },
      company: {
        type: 'string',
        required: true,
        validate: (val) => zValidate(companySchema, val),
      },
      location: {
        type: 'string',
      },
      url: {
        type: 'string',
      },
      salary: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      color: {
        type: 'string',
      },
      jobRank: {
        type: 'string',
        required: true,
        validate: (val) => zValidate(jobRankSchema, val),
      },
      [defaultJobListEntityConfig._itemIdPropName]: {
        type: 'string',
        required: true,
        validate: (val) => zValidate(uuidSchema, val),
      },
      [defaultUserEntityConfig._itemIdPropName]: {
        type: 'string',
        required: true,
        validate: (val) => zValidate(uuidSchema, val),
      },
    },
    indexes: {
      job: {
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

export type JobItem = EntityItem<typeof JobEntityService>;
export type CreateJobItem = TCreateEntityItem<typeof JobEntityService>;
export type JobQueryResponse = QueryResponse<typeof JobEntityService>;

export function createMockJob(
  overrides: RequireFields<
    Partial<CreateJobItem>,
    'jobListId' | 'userId' | 'jobRank'
  >,
) {
  return {
    jobId: uuid(),
    title: faker.person.jobTitle(),
    company: faker.company.name(),
    ...overrides,
  } as const;
}
