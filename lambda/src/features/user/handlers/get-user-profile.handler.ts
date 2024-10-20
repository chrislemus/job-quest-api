import { BuildOpenApiSpecArgOperationObj } from '@/shared';
import { EventHandler } from '@/shared/types';
import { UserProfileResBodyDto } from '../dto';
import { authHandler } from '@/features/auth';
import { JobQuestDBService } from '@/core/database';

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
  async (req, ctx) => {
    const { authUser } = ctx;

    // const user = await userDB.queryUnique(authUser.id);
    const { data: user } = await JobQuestDBService.entities.user
      .get({ userId: authUser.id })
      .go();
    const body = UserProfileResBodyDto.parse(user);

    return {
      status: 200,
      body: body,
    };
  },
);
