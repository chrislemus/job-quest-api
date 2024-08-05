import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Callback,
  Context,
} from 'aws-lambda';
import passport from 'passport';
// import { getReqData } from './get-req-data';
import { pathToRegexp, match, parse, compile } from 'path-to-regexp';
import express, { response } from 'express';
import { get } from './get.route';
import { z } from 'zod';
import { OpenAPIV3 } from 'openapi-types';
import { EventHandler, Resources } from './common.types';
import { routeBuilder } from './route-builder.util';

// const routeScema = z.object({});
// import express from 'express';
// import serverlessExpress from '@vendia/serverless-express';
// const app = express();
// const port = 3000;

// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });
// app.get('/me/:id', (req, res) => {
//   console.log(req.params);
//   res.send('me path!');
// });

// app.emit('/');
// app.r
// export const handler = serverlessExpress({ app });

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });
//

const loginGET: EventHandler = async (event, ctx) => {
  return {
    statusCode: 400,
    body: JSON.stringify({
      message: 'path: auth/loginGET',
    }),
  };
}; //s////
// export const data =

const testBuilder = (config: { pathPrefix?: string; resources: Resources }) => {
  const handler: EventHandler = async (event, ctx) => {
    const method = event.httpMethod.toLowerCase() as OpenAPIV3.HttpMethods;
    const { resource } = event;
    const innerHandler = config.resources?.[resource]?.[method]?.handler;

    if (innerHandler) {
      const data = await innerHandler(event, ctx);
      return data;
    }
    throw new Error('No handler found');
  };

  const meta = {};

  Object.entries(config.resources).forEach(
    ([resourceName, resourceMethodHandlers]) => {
      let absolutePath = resourceName === '_root' ? '' : resourceName;
      if (absolutePath[0] !== '/') absolutePath = `/${absolutePath}`;
      if (config.pathPrefix)
        absolutePath = `/${config.pathPrefix}${absolutePath}`;

      meta[absolutePath] = {};
      Object.entries(resourceMethodHandlers).forEach(
        ([method, methodConfig]) => {
          meta[absolutePath][method] = methodConfig.openapi;
        },
      );
    },
  );
  return { handler, openapi: meta };
};
const aaaa = routeBuilder({
  handler: loginGET,
  openapi: {
    responses: {
      '200': {
        description: 'man description',
        // content: {
        //   'application/json': { schema: z.object({ name: z.string() }) },
        // },
      },
    },

    parameters: { schema: z.array(z.object({ pageSize: z.string() })) } as any,
  },
});

// handler.prototype = { custom: 'custome' };
export const { handler, openapi } = testBuilder({
  pathPrefix: 'auth',
  resources: {
    _root: {
      // get: {
      //   handler: loginGET,
      //   openapi: { responses: { 200: { description: '' } } },
      // },
      get: aaaa,
    },
    // login: {
    //   get: {
    //     handler: loginGET,
    //     openapi: { responses: { 200: { description: '' } } },
    //   },
    // },
    // 'login/create': {
    //   get: {
    //     handler: loginGET,
    //     openapi: { responses: { 200: { description: '' } } },
    //   },
    // },
  },
});
