import { OpenAPIV3 } from 'openapi-types';
import { ExceptionError, fmtQueryParams } from './shared';
import { apiSpecPreformatted } from './api-spec.config';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

type APIGatewayProxyResultOptionalBody = Omit<APIGatewayProxyResult, 'body'> &
  Partial<Pick<APIGatewayProxyResult, 'body'>>;

type Event = APIGatewayProxyEvent & {
  queryParams: Record<string, string | string[]>;
};

export const handler = async (
  event: Event,
): Promise<APIGatewayProxyResultOptionalBody> => {
  const { resource, httpMethod } = event;
  const method = httpMethod.toLowerCase() as OpenAPIV3.HttpMethods;
  const methodObj = apiSpecPreformatted.paths[resource]?.[method];

  const handlerFn = methodObj?.handlerFn;
  if (!handlerFn) {
    throw new Error(`NoHandler|resource:${resource}|method:${method}`);
  }
  fmtQueryParams(event);

  try {
    const pathParams = event.pathParameters || {};
    const queryParams = event.queryStringParameters || {};
    const { headers, body } = event;
    const { status, ...res } = await handlerFn(
      { body, queryParams, pathParams, headers },
      {},
    );

    const response = { statusCode: status, ...res };
    return response;
  } catch (error) {
    if (error instanceof ExceptionError) {
      return {
        statusCode: error.status,
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
