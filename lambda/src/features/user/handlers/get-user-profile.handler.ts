import { userDB } from '@/shared/db/user-db.service';
import { BuildOpenApiSpecArgOperationObj } from '@/shared';
import { EventHandler } from '@/shared/types';
import { UserProfileResBodyDto } from '../dto';
import { authHandler } from '@/features/auth';

export const getUserProfileHandlerSpec: BuildOpenApiSpecArgOperationObj = {
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          zodSchema: { UserProfileResBodyDto },
        },
      },
    },
  },
};

export const getUserProfileHandler: EventHandler = authHandler(
  async (authUser) => {
    const user = await userDB.queryUnique(authUser.id);
    const body = UserProfileResBodyDto.parse(user);

    return {
      statusCode: 200,
      body: JSON.stringify(body),
    };
  },
);
