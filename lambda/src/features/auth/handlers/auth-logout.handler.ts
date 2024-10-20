import { authHandler } from '@/features/auth/utils';
import { EventHandler } from '@/shared/types';
import { BuildOpenApiSpecArgOperationObj } from '@/shared';
import { JobQuestDBService } from '@/core/database';

export const authLogoutHandlerSpec: BuildOpenApiSpecArgOperationObj = {
  responses: {
    200: {
      description: '',
    },
  },
};

export const authLogoutHandler: EventHandler = authHandler(async (req, ctx) => {
  const { authUser } = ctx;
  await JobQuestDBService.entities.user
    .patch({ userId: authUser.id })
    .remove(['refreshToken'])
    .go();
  return {
    status: 200,
  };
});
