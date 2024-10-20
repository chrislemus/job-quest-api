import {
  apiParse,
  unauthorizedException,
  BuildOpenApiSpecArgOperationObj,
} from '@/shared';
import { EventHandler } from '@/shared/types';
import { AuthLoginReqBodyDto, JwtDto } from '@/features/auth/dto';
import { getTokens } from '@/features/auth/utils';
import bcrypt from 'bcryptjs';
import { JobQuestDBService } from '@/core/database';

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

export const authLoginHandler: EventHandler = async (event) => {
  const reqBody = await apiParse(AuthLoginReqBodyDto, event.body);

  const { data: userList } = await JobQuestDBService.entities.user.query
    .userByEmail({ email: reqBody.email })
    .go();
  if (userList.length !== 1) {
    console.error('login user count not 1');
    console.error(userList);
    throw unauthorizedException();
  }
  const user = userList[0];

  if (!user?.password) throw unauthorizedException();
  const isMatch = await bcrypt.compare(reqBody.password, user.password);
  if (!isMatch) throw unauthorizedException();

  const tokens = await getTokens(user);
  const body = tokens;
  return {
    status: 200,
    body,
  };
};
