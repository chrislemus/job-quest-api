import { apiError, BuildOpenApiSpecArgOperationObj } from '@/shared';
import { EventHandler } from '@/shared/types';
import { AuthSignupReqBodyDto, JwtDto } from '@/features/auth/dto';
import { getTokens } from '@/features/auth/utils';
import { userDB } from '@/shared/db/user-db.service';
import { createNewUserStarterData } from '@/features/user/utils';

export const authSignupHandlerSpec: BuildOpenApiSpecArgOperationObj = {
  security: [],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        zodSchema: { AuthSignupReqBodyDto },
      },
    },
  },
  responses: {
    200: {
      description: 'Success signup',
      content: {
        'application/json': {
          zodSchema: { JwtDto },
        },
      },
    },
    400: { description: '' },
  },
};

export const authSignupHandler: EventHandler = async (req) => {
  const res = await AuthSignupReqBodyDto.spa(req.body);
  if (res.error) return apiError(res.error);

  const user = await userDB.create(res.data);

  await createNewUserStarterData(user);
  const tokens = await getTokens(user);

  return {
    status: 200,
    body: tokens,
  };
};
