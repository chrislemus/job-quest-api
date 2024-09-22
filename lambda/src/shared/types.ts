// import { JwtPayload } from '@/features/auth/types';
// import {
//   APIGatewayProxyEvent,
//   APIGatewayProxyResult,
//   Context,
// } from 'aws-lambda';

// type APIGatewayProxyResultOptionalBody = Omit<APIGatewayProxyResult, 'body'> &
//   Partial<Pick<APIGatewayProxyResult, 'body'>>;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type THandlerResponse = {
  status: number;
  body?: any;
  headers?: Record<string, string>;
};
export type THandlerRequest = {
  queryParams: Record<any, any>;
  pathParams: Record<any, any>;
  headers: Record<any, any>;
  body: any;
};
export type THandlerContext = Record<string, unknown>;
export type EventHandler = (
  req: Prettify<THandlerRequest>,
  ctx: Prettify<THandlerContext>,
) => Promise<Prettify<THandlerResponse>>;
// export type EventHandler = (
//   event: APIGatewayProxyEvent & {
//     queryParams: Record<any, any>;
//   },
//   context: Context,
// ) => Promise<APIGatewayProxyResultOptionalBody>;

// export type AuthEventHandler = (
//   authUser: JwtPayload,
//   event: APIGatewayProxyEvent & {
//     queryParams: Record<any, any>;
//   },
//   context: Context,
// ) => Promise<THandlerResponse>;

export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
