import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';

export type EventHandler = (
  event: APIGatewayProxyEvent & {
    queryParams: Record<any, any>;
  },
  context: Context,
) => Promise<APIGatewayProxyResult>;
