import { userDB } from '@/db/user-db.service';
import {
  apiError,
  BuildOpenApiSpecArgOperationObj,
  unauthorizedException,
} from '@/common';
import { EventHandler } from '@/common/types';
import { authLoginReqBodySchema, jwtSchema } from '@/auth/schemas';
import { getTokens } from '@/auth/utils';
import bcrypt from 'bcryptjs';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  description: '',
  security: [],
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
};
// export const openapi = buildOpenapOperationalObj({
//   security: [],
//   requestBody: {
//     required: true,
//     content: {
//       'application/json': {
//         zodSchema: { authLoginReqBodySchema },
//       },
//     },
//   },
//   responses: {
//     200: {
//       description: 'new working?',
//       content: {
//         'application/json': {
//           zodSchema: { jwtSchema },
//         },
//       },
//     },
//     401: { description: '' },
//   },
// });

export const handler: EventHandler = async (event) => {
  const res = authLoginReqBodySchema.safeParse(JSON.parse(event.body || '{}'));
  if (res.error) return apiError(res.error);
  const user = await userDB.findByEmail(res.data.email);

  // try {
  if (!user?.password) throw unauthorizedException();
  const isMatch = await bcrypt.compare(res.data.password, user.password);
  if (!isMatch) throw unauthorizedException();

  const tokens = await getTokens(user);
  const body = JSON.stringify(tokens);
  return {
    statusCode: 200,
    body,
  };
};
