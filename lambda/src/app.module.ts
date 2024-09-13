import { EventHandler } from './shared/types';
import { buildOpenapiSpec, ExceptionError, fmtQueryParams } from './shared';
import { userController } from './features/user/user.controller';
import { appController } from './app.controller';
import { authController } from './features/auth/auth.controller';
import { jobListController } from './features/job-list/job-list.controller';
import { jobController } from './features/job/job.controller';

const allControllers = {
  ...authController,
  ...userController,
  ...appController,
  ...jobController,
  ...jobListController,
};

export const apiSpec = buildOpenapiSpec({
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
});

export const handler: EventHandler = async (event, ctx) => {
  const { resource, httpMethod } = event;
  const method = httpMethod.toLowerCase();

  fmtQueryParams(event);

  const childHandler: EventHandler =
    allControllers[resource]?.[method]['handlerFn'];
  if (!childHandler) {
    throw new Error(`NoHandler|resource:${resource}|method:${method}`);
  }

  try {
    const res = await childHandler(event, ctx);
    // if (!res['headers']) res['headers'] = {};
    // res['headers']['Access-Control-Allow-Origin'] = '*';
    return res;
  } catch (error) {
    if (error instanceof ExceptionError) {
      return {
        statusCode: error.statusCode,
        body: JSON.stringify({ message: error.message, error: error.error }),
      };
    } else {
      console.error(error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal Server Error' }),
      };
    }
  }
};
