import { userDB } from '@/shared/db/user-db.service';
import {
  apiError,
  unauthorizedException,
  BuildOpenApiSpecArgOperationObj,
} from '@/shared';
import { EventHandler } from '@/shared/types';
import { AuthLoginReqBodyDto, JwtDto } from '@/features/auth/dto';
import { getTokens } from '@/features/auth/utils';
import bcrypt from 'bcryptjs';

export const authLoginHandlerSpec: BuildOpenApiSpecArgOperationObj = {
  description: '',
  security: [],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        zodSchema: { AuthLoginReqBodyDto },
      },
    },
  },
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          zodSchema: { JwtDto },
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

export const authLoginHandler: EventHandler = async (event) => {
  const res = AuthLoginReqBodyDto.safeParse(event.body);
  if (res.error) return apiError(res.error);
  const user = await userDB.findByEmail(res.data.email);

  // try {
  if (!user?.password) throw unauthorizedException();
  const isMatch = await bcrypt.compare(res.data.password, user.password);
  if (!isMatch) throw unauthorizedException();

  const tokens = await getTokens(user);
  const body = tokens;
  return {
    status: 200,
    body,
  };
};
