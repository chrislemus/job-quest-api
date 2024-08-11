import { buildOpenapiSpec } from '../common';
import {
  userDeletePathParamsSchema,
  userProfileResBodySchema,
} from './schemas';

export const userOpenApi = buildOpenapiSpec({
  paths: {
    '/user/profile': {
      get: {
        security: [{ bearerAuth: [] }],
        tags: ['user'],
        responses: {
          200: {
            description: '',
            content: {
              'application/json': {
                zodSchema: { userProfileResBodySchema },
              },
            },
          },
        },
      },
    },
    '/user/{id}': {
      delete: {
        security: [{ bearerAuth: [] }],
        tags: ['user'],
        zodPathParamsSchema: userDeletePathParamsSchema,
        responses: {
          200: { description: '' },
        },
      },
    },
  },
});
