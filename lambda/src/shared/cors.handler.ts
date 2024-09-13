import { BuildOpenApiSpecArgOperationObj } from '@/shared';
import { EventHandler } from './types';

// // Record<'x-amazon-apigateway-integration', any>
// export const corsOpenApi: BuildOpenApiSpecArgOperationObj = {
//   tags: ['zDefault'],
//   security: [],
//   responses: {
//     200: {
//       description: '',
//       // headers: {
//       //   'Access-Control-Allow-Origin': {
//       //     schema: {
//       //       type: 'string',
//       //     },
//       //   },
//       //   'Access-Control-Allow-Methods': {
//       //     schema: {
//       //       type: 'string',
//       //     },
//       //   },
//       //   'Access-Control-Allow-Headers': {
//       //     schema: {
//       //       type: 'string',
//       //     },
//       //   },
//       // },
//     },
//   },
//   // 'x-amazon-apigateway-integration': {
//   //   type: 'mock',
//   //   requestTemplates: {
//   //     'application/json': '{"statusCode": 200}',
//   //   },
//   //   passthroughBehavior: 'never',
//   //   responses: {
//   //     default: {
//   //       statusCode: 200,
//   //       responseParameters: {
//   //         'method.response.header.Access-Control-Allow-Headers':
//   //           "'Content-Type,X-Amz-Date,Authorization,X-Api-Key'",
//   //         'method.response.header.Access-Control-Allow-Methods': "'*'",
//   //         'method.response.header.Access-Control-Allow-Origin': "'*'",
//   //       },
//   //     },
//   //   },
//   // } as any,
// };
// Record<'x-amazon-apigateway-integration', any>
export const corsOpenApi: BuildOpenApiSpecArgOperationObj = {
  security: [],
  responses: {
    '200': {
      description: '',
      headers: {
        'Access-Control-Allow-Headers': {
          schema: {
            type: 'string',
          },
        },
        'Access-Control-Allow-Methods': {
          schema: {
            type: 'string',
          },
        },
        'Access-Control-Allow-Origin': {
          schema: {
            type: 'string',
          },
        },
      },
      content: {
        'application/json': {
          schema: {
            type: 'object',
          },
        } as any,
      },
    },
  },
  /** @ts-ignore */
  'x-amazon-apigateway-integration': {
    type: 'mock',
    requestTemplates: {
      'application/json': '{"statusCode": 200}',
    },
    passthroughBehavior: 'never',
    responses: {
      default: {
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers':
            "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
          'method.response.header.Access-Control-Allow-Methods': "'*'",
          'method.response.header.Access-Control-Allow-Origin': "'*'",
        },
      },
    },
  },
};
export const corsHandler: EventHandler = async (event, ctx) => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    },
  };
};
