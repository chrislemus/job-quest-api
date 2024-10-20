import { Entity } from 'electrodb';
import { buildDefaultEntityConfig } from '../utils';

export const defaultConstraintConfig = buildDefaultEntityConfig('_constraint');
const { model, dbConfig } = defaultConstraintConfig;

export const _constraint = new Entity(
  {
    model,
    attributes: {
      name: {
        type: 'string',
        required: true,
      },
      value: {
        type: 'string',
        required: true,
      },
      entity: {
        type: 'string',
        required: true,
      },
    },
    indexes: {
      value: {
        pk: {
          field: 'pk',
          composite: ['value'],
        },
        sk: {
          field: 'sk',
          composite: ['name', 'entity'],
        },
      },
      name: {
        index: 'gsi1',
        pk: {
          field: 'gsi1pk',
          composite: ['name', 'entity'],
        },
        sk: {
          field: 'gsi1sk',
          composite: ['value'],
        },
      },
    },
  },
  {
    ...dbConfig,
  },
);
