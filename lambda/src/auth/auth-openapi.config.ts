import { buildOpenapiSpec, zodToJson } from '../common';
import {
  authLoginReqBodySchema,
  authSignupReqBodySchema,
  jwtSchema,
} from './schemas';

export const authOpenApi = buildOpenapiSpec({
  paths: {
    '/auth/login': {
      post: {
        tags: ['auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              zodSchema: { authLoginReqBodySchema },
            },
          },
        },
        responses: {
          200: {
            description: '',
            content: {
              'application/json': {
                zodSchema: { jwtSchema },
              },
            },
          },
          401: { description: '' },
        },
      },
    },
    '/auth/signup': {
      post: {
        tags: ['auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              zodSchema: { authSignupReqBodySchema },
            },
          },
        },
        responses: { 200: { description: 'Success signup' } },
      },
    },
    '/auth/refresh': {
      post: {
        security: [{ bearerAuth: [] }],
        tags: ['auth'],
        responses: {
          200: {
            description: '',
            content: {
              'application/json': {
                zodSchema: { jwtSchema },
              },
            },
          },
        },
      },
    },
  },
});

// export const authOpenApi: Omit<OpenAPIV3zod, 'openapi' | 'info'> = {
//   paths: {
//     '/auth/login': {
//       post: {
//         tags: ['auth'],
//         requestBody: {
//           required: true,
//           content: {
//             'application/json': {
//               schema: zodToJson(authLoginReqBodySchema),
//             },
//           },
//         },
//         responses: {
//           200: {
//             description: '',
//             content: {
//               'application/json': {
//                 schema: { $ref: '#/components/schemas/JwtSchema' },
//               },
//             },
//           },
//           401: { $ref: '#/components/responses/401Unauthorized' },
//         },
//       },
//     },
//     '/auth/signup': {
//       post: {
//         tags: ['auth'],
//         requestBody: {
//           required: true,
//           content: {
//             'application/json': { schema: zodToJson(authSignupReqBodySchema) },
//           },
//         },
//         responses: { 200: { description: 'Success signup' } },
//       },
//     },
//     '/auth/refresh': {
//       post: {
//         security: [{ bearerAuth: [] }],
//         tags: ['auth'],
//         responses: {
//           200: {
//             description: '',
//             content: {
//               'application/json': {
//                 schema: { $ref: '#/components/schemas/JwtSchema' },
//               },
//             },
//           },
//         },
//       },
//     },
//   },
//   components: {
//     schemas: {
//       JwtSchema: {
//         description: 'JWT Token',
//         ...zodToJson(jwtSchema),
//       },
//     },
//   },
// } as const;
