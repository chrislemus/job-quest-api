import { buildOpenapiSpec, BuildOpenApiSpecArgOperationObj } from './common';
import { EventHandler } from './common/types';
import fs from 'fs';
export const openapi: BuildOpenApiSpecArgOperationObj = {
  responses: { 200: { description: '', content: { 'text/html': {} } } },
};
import { openapi as authLoginOptionsHandler } from './auth/login/options.handler';
import { openapi as authLoginPostHandler } from './auth/login/post.handler';
import { openapi as authLogoutOptionsHandler } from './auth/logout/options.handler';
import { openapi as authLogoutPostHandler } from './auth/logout/post.handler';
import { openapi as authRefreshOptionsHandler } from './auth/refresh/options.handler';
import { openapi as authRefreshPostHandler } from './auth/refresh/post.handler';
import { openapi as authSignupOptionsHandler } from './auth/signup/options.handler';
import { openapi as authSignupPostHandler } from './auth/signup/post.handler';
import { openapi as getHandler } from './get.handler';
import { openapi as jobGetHandler } from './job/get.handler';
import { openapi as jobOptionsHandler } from './job/options.handler';
import { openapi as jobPostHandler } from './job/post.handler';
import { openapi as jobIdDeleteHandler } from './job/{id}/delete.handler';
import { openapi as jobIdGetHandler } from './job/{id}/get.handler';
import { openapi as jobIdOptionsHandler } from './job/{id}/options.handler';
import { openapi as jobIdPatchHandler } from './job/{id}/patch.handler';
import { openapi as jobListGetHandler } from './job-list/get.handler';
import { openapi as jobListOptionsHandler } from './job-list/options.handler';
import { openapi as jobListPostHandler } from './job-list/post.handler';
import { openapi as jobListIdDeleteHandler } from './job-list/{id}/delete.handler';
import { openapi as jobListIdGetHandler } from './job-list/{id}/get.handler';
import { openapi as jobListIdOptionsHandler } from './job-list/{id}/options.handler';
import { openapi as jobListIdPatchHandler } from './job-list/{id}/patch.handler';
import { openapi as userOptionsHandler } from './user/options.handler';
import { openapi as userProfileGetHandler } from './user/profile/get.handler';
import { openapi as userProfileOptionsHandler } from './user/profile/options.handler';
import { openapi as userIdDeleteHandler } from './user/{id}/delete.handler';
import { openapi as userIdOptionsHandler } from './user/{id}/options.handler';

const paths = {
  ['/v1/auth/login']: {
    options: authLoginOptionsHandler,
    post: authLoginPostHandler,
  },
  ['/v1/auth/logout']: {
    options: authLogoutOptionsHandler,
    post: authLogoutPostHandler,
  },
  ['/v1/auth/refresh']: {
    options: authRefreshOptionsHandler,
    post: authRefreshPostHandler,
  },
  ['/v1/auth/signup']: {
    options: authSignupOptionsHandler,
    post: authSignupPostHandler,
  },
  ['/v1']: { get: getHandler },
  ['/v1/job']: {
    get: jobGetHandler,
    options: jobOptionsHandler,
    post: jobPostHandler,
  },
  ['/v1/job/{id}']: {
    delete: jobIdDeleteHandler,
    get: jobIdGetHandler,
    options: jobIdOptionsHandler,
    patch: jobIdPatchHandler,
  },
  ['/v1/job-list']: {
    get: jobListGetHandler,
    options: jobListOptionsHandler,
    post: jobListPostHandler,
  },
  ['/v1/job-list/{id}']: {
    delete: jobListIdDeleteHandler,
    get: jobListIdGetHandler,
    options: jobListIdOptionsHandler,
    patch: jobListIdPatchHandler,
  },
  ['/v1/user']: { options: userOptionsHandler },
  ['/v1/user/profile']: {
    get: userProfileGetHandler,
    options: userProfileOptionsHandler,
  },
  ['/v1/user/{id}']: {
    delete: userIdDeleteHandler,
    options: userIdOptionsHandler,
  },
};

export const apiSpec = buildOpenapiSpec({
  openapi: '3.0.0',
  info: { title: 'What up !', version: '1.0.0' },
  paths,
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

export const handler: EventHandler = async () => {
  const css = fs.readFileSync('./swagger.css').toString();
  const js = fs.readFileSync('./swagger.js').toString();
  const spec = apiSpec;
  spec.paths = { ...paths, ['/v1']: undefined as any };

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: `<!DOCTYPE html>
  <html>
    <head> <meta charset="UTF-8" /> <title>Job Quest API</title> <style>${css}</style> </head>
    <body>
      <div id="swagger"></div>
      <script>${js}</script>
      <script>
        window.onload = () => {  window.ui = SwaggerUIBundle({ spec: ${JSON.stringify(spec, null, 2)}, dom_id: '#swagger'}); };
      </script>
    </body>
  </html>
  `,
  };
};
