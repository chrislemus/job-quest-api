import express, { Express } from 'express';
import swaggerRouter from './swagger.router';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandlerV2,
  Context,
} from 'aws-lambda';

// const lambda = new aws.Lambda({
//   apiVersion: '2015-03-31',
//   endpoint: 'http://localhost:3002',
// });
// export async function handler() {
//   const clientContextData = stringify({
//     foo: 'foo',
//   });
//   const payload = stringify({
//     data: 'foo',
//   });
//   const params = {
//     ClientContext: Buffer.from(clientContextData).toString('base64'),
//     // FunctionName is composed of: service name - stage - function name, e.g.
//     FunctionName: 'myServiceName-dev-invokedHandler',
//     InvocationType: 'RequestResponse',
//     Payload: payload,
//   };
//   const response = await lambda.invoke(params).promise();
//   return {
//     body: stringify(response),
//     statusCode: 200,
//   };
// }

//
//
//
// import swaggerUi from 'swagger-ui-express';
// import swaggerDocument from './swagger.json';
// console.log(SwaggerUI);
// import dotenv from 'dotenv';

// dotenv.config();

const app: Express = express();
const port = 4000;

// app.get('/', (req: Request, res: Response) => {
//   res.send(`Express + TypeScript Server ${message}`);
// });

app.use('/', swaggerRouter);

app.get('/api/v1/*', (req, res) => {
  const queryStringParameters: Record<string, string> = {};
  const multiValueQueryStringParameters: Record<string, string[]> = {};

  // if (req.query) {
  //   Object.entries(req.query).forEach(([key, value]) => {
  //     if (Array.isArray(value)) {
  //       multiValueQueryStringParameters[key] = value;
  //       queryStringParameters[key] = value[value.length - 1];
  //     } else {
  //       queryStringParameters[key] = value as string;
  //       multiValueQueryStringParameters[key] = [value as string];
  //     }

  //     // queryStringParameters[key] = req.query[key] as string;
  //     // multiValueQueryStringParameters[key] = [req.query[key] as string];
  //   });
  // }
  // const aaa = req.
  const lambdaStringData = req.header('xlambda');
  type BBBB = APIGatewayProxyHandlerV2;
  const { event, context } = JSON.parse(lambdaStringData as string) as {
    event: APIGatewayProxyEvent;
    context: Context;
  };
  console.log('event', event);
  console.log('context', context);
  const lambdaEvent: APIGatewayProxyEvent = {
    // rawPath: req.path as any,
    body: req.body,
    headers: req.headers as any,
    httpMethod: req.method,
    isBase64Encoded: false,
    multiValueHeaders: '' as any,
    multiValueQueryStringParameters: req.query as unknown as any,
    path: req.path,
    pathParameters: {},
    stageVariables: {},
    resource: '',
    queryStringParameters: req.query as any,
    requestContext: {
      accountId: '',
      apiId: '',
      authorizer: {
        jwt: {
          claims: {},
          scopes: [],
        },
      },
      domainName: '',
      domainPrefix: '',
      requestId: '',
      routeKey: '',
      stage: '',
      httpMethod: req.method,
      requestTimeEpoch: 0,
      requestTime: '',
      identity: {} as any,
      resourceId: '',
      resourcePath: '',
      protocol: '',
      path: req.path,
    },
  };
  res.json(lambdaEvent);
});

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
