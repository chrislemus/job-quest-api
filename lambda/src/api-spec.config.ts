import { buildOpenapiSpec } from './shared';
import { userController } from './features/user/user.controller';
import { appController } from './app.controller';
import { authController } from './features/auth/auth.controller';
import { jobListController } from './features/job-list/job-list.controller';
import { jobController } from './features/job/job.controller';
import { jobLogController } from './features/job-log/job-log.controller';

const allControllers = {
  ...authController,
  ...userController,
  ...appController,
  ...jobController,
  ...jobListController,
  ...jobLogController,
};

export const apiSpecPreformatted = {
  openapi: '3.0.0',
  info: { title: 'What up !', version: '1.0.0' },
  paths: allControllers,
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
} as const;
export const apiSpec = buildOpenapiSpec(apiSpecPreformatted);
