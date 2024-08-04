import { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event, ctx) => {
  return {
    statusCode: 400,
    body: JSON.stringify({
      message: 'Hello from default!',
      // params,
      // query,
      // input: filteredEvent,
      // ctx,
    }),
  };
};
