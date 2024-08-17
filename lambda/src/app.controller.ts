import { APIGatewayProxyHandler } from 'aws-lambda';
import { EventHandler } from './api/common/types';
import { handler as apiAuthLoginPostHandler } from './api/auth/login/post.handler';
import { handler as apiAuthRefreshPostHandler } from './api/auth/refresh/post.handler';
import { handler as apiAuthSignupPostHandler } from './api/auth/signup/post.handler';
import { handler as apiJobGetHandler } from './api/job/get.handler';
import { handler as apiUserProfileGetHandler } from './api/user/profile/get.handler';
import { handler as apiUserIdDeleteHandler } from './api/user/{id}/delete.handler';

const resourceHandlers = {
  ['/api/auth/login']: { post: apiAuthLoginPostHandler },
  ['/api/auth/refresh']: { post: apiAuthRefreshPostHandler },
  ['/api/auth/signup']: { post: apiAuthSignupPostHandler },
  ['/api/job']: { get: apiJobGetHandler },
  ['/api/user/profile']: { get: apiUserProfileGetHandler },
  ['/api/user/{id}']: { delete: apiUserIdDeleteHandler },
};

export const handler: APIGatewayProxyHandler = async (event, ctx) => {
  const { resource, httpMethod, multiValueQueryStringParameters } = event;
  const method = httpMethod.toLowerCase();

  const queryParams: Record<string, string[] | string> = {};
  if (multiValueQueryStringParameters) {
    Object.entries(multiValueQueryStringParameters).forEach(([k, v]) => {
      if (!v) return;
      queryParams[k] = v.length === 1 ? v[0] : v;
    });
  }
  event['queryParams'] = queryParams;

  const childHandler: EventHandler = resourceHandlers[resource]?.[method];
  if (!childHandler) throw new Error('No handler found');

  const res = await childHandler(event, ctx);
  return res;
};
