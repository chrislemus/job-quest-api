import {
  apiParse,
  badRequestException,
  BuildOpenApiSpecArgOperationObj,
  internalServerException,
  uuid,
} from '@/shared';
import { EventHandler } from '@/shared/types';
import { AuthSignupReqBodyDto, JwtDto } from '@/features/auth/dto';
import { getTokens } from '@/features/auth/utils';
import { createNewUserStarterData } from '@/features/user/utils';
import { JobQuestDBService } from '@/core/database';

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
  const reqBody = await apiParse(AuthSignupReqBodyDto, req.body);

  const userId = uuid();
  const newUser = { userId, ...reqBody };

  const dbRes = await JobQuestDBService.transaction
    .write(({ user, _constraint }) => [
      user.create(newUser).commit(),

      _constraint
        .create({
          name: 'email',
          value: newUser.email,
          entity: user.schema.model.entity,
        })
        .commit(),
    ])
    .go();

  const [_userDbRes, constraintDbRes] = dbRes.data;
  if (constraintDbRes.rejected) {
    throw badRequestException('User with this email already exists');
  }

  const { data: user } = await JobQuestDBService.entities.user
    .get({ userId })
    .go();

  if (!user) {
    throw internalServerException();
  }

  await createNewUserStarterData(user);
  const tokens = await getTokens(user);

  console.log({ tokens, user });
  return {
    status: 200,
    body: tokens,
  };
};
// export const authSignupHandler: EventHandler = async (req) => {
//   const res = await AuthSignupReqBodyDto.spa(req.body);
//   if (res.error) return apiError(res.error);

//   const user = await userDB.create(res.data);

//   await createNewUserStarterData(user);
//   const tokens = await getTokens(user);

//   return {
//     status: 200,
//     body: tokens,
//   };
// };
