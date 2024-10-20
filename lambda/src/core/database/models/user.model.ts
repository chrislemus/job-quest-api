import { Entity, EntityItem, QueryResponse } from 'electrodb';
import { z } from 'zod';
import { faker } from '@faker-js/faker';
import { TCreateEntityItem } from '../types';
import { buildDefaultEntityConfig, zValidate } from '../utils';
import { uuid } from '@/shared';

const emailSchema = z.string().email();
const passwordSchema = z.string().min(8);
const nameSchema = z.string().min(2);

export const userRole = ['ADMIN', 'SUBSCRIBER'] as const;

export const defaultUserEntityConfig = buildDefaultEntityConfig('user');
const { model, attributes, dbConfig, _itemIdPropName } =
  defaultUserEntityConfig;

export const UserEntityService = new Entity(
  {
    model,
    attributes: {
      ...attributes,
      email: {
        type: 'string',
        required: true,
        validate: (val) => zValidate(emailSchema, val),
      },
      password: {
        type: 'string',
        required: true,
        set: (val) => {
          return val;
        },
        validate: (val) => zValidate(passwordSchema, val),
      },
      firstName: {
        type: 'string',
        required: true,
        validate: (val) => zValidate(nameSchema, val),
      },
      lastName: {
        type: 'string',
        required: true,
        validate: (val) => zValidate(nameSchema, val),
      },
      role: {
        type: userRole,
        required: true,
      },
      refreshToken: { type: 'string' },
    },
    indexes: {
      user: {
        scope: model.entity,
        collection: 'User',
        pk: {
          field: 'pk',
          composite: [_itemIdPropName],
        },
        sk: {
          field: 'sk',
          composite: [],
        },
      },
      userByEmail: {
        scope: model.entity,
        index: 'gsi1',
        pk: {
          field: 'gsi1pk',
          composite: ['email'],
        },
        sk: {
          field: 'gsi1sk',
          composite: [],
        },
      },
    },
  },
  dbConfig,
);
export type UserItem = EntityItem<typeof UserEntityService>;
export type CreateUserItem = TCreateEntityItem<typeof UserEntityService>;
export type UserQueryResponse = QueryResponse<typeof UserEntityService>;

export function createMockUser(overrides?: Partial<CreateUserItem>) {
  return {
    userId: uuid(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    role: 'SUBSCRIBER',
    ...overrides,
  } as const;
}
