import { APIGatewayProxyHandler } from 'aws-lambda';
import { EventHandler } from './common/types';
import { handler as authLoginGetHandler } from '././auth/login/get.handler';
import { handler as authLoginPostHandler } from '././auth/login/post.handler';
import { handler as authSignupGetHandler } from '././auth/signup/get.handler';
import { handler as jobGetHandler } from '././job/get.handler';

const resourceHandlers = {
  ['/auth/login']: { get: authLoginGetHandler, post: authLoginPostHandler },
  ['/auth/signup']: { get: authSignupGetHandler },
  ['/job']: { get: jobGetHandler },
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
