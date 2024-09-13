import { JwtPayload } from '@/features/auth/types';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';

type APIGatewayProxyResultOptionalBody = Omit<APIGatewayProxyResult, 'body'> &
  Partial<Pick<APIGatewayProxyResult, 'body'>>;

export type EventHandler = (
  event: APIGatewayProxyEvent & {
    queryParams: Record<any, any>;
  },
  context: Context,
) => Promise<APIGatewayProxyResultOptionalBody>;

export type AuthEventHandler = (
  authUser: JwtPayload,
  event: APIGatewayProxyEvent & {
    queryParams: Record<any, any>;
  },
  context: Context,
) => Promise<APIGatewayProxyResultOptionalBody>;

export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
