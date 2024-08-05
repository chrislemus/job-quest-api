import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { OpenAPIV3 } from 'openapi-types';
import { OpenAPIV3zod } from './open-api-zod';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// type Modify<T, R> = Omit<T, keyof R> & R;
type RequireKeys<T extends object, K extends keyof T> = Required<Pick<T, K>> &
  Omit<T, K>;

export type EventHandler = (
  event: APIGatewayProxyEvent,
  context: Context,
) => Promise<APIGatewayProxyResult>;

export type MethodConfig = {
  handler: EventHandler;
  // openapi: { responses: { 200: { description: '' } } };
  // openapi: Omit<OpenAPIV3_1.OperationObject, 'responses'> &
  //   Required<Pick<OpenAPIV3_1.OperationObject, 'responses'>>;
  openapi: RequireKeys<OpenAPIV3.OperationObject, 'responses'>;
};

export type ResourceConfig = {
  [method in OpenAPIV3.HttpMethods]?: MethodConfig;
};

export type Resources = Record<string, ResourceConfig>;

export type RouteBuilder = (config: {
  handler: EventHandler;
  // openapi?: OpenAPIV3zod.OperationObject;
  openapi: RequireKeys<OpenAPIV3zod.OperationObject, 'responses'>;
  // openapi: OpenAPIV3_1.OperationObject<{ responses: string }>;
  // openapi: Modify<OpenAPIV3.OperationObject, { responses: string }>;
}) => MethodConfig;

// type BBB = RouteBuilder['openapi']['responses'][number]['content'];
// type aaaaa = OpenAPIV3zod.MediaTypeObject['schema'];

// const aaaa: OpenAPIV3zod.MediaTypeObject['schema'] = z.object({});
// const zzzzz: OpenAPIV3zod.MediaTypeObject['schema'] = z.object({});
// parameters?: (ReferenceObject | ParameterObject)[];
// requestBody?: ReferenceObject | RequestBodyObject;
// responses?: ResponsesObject;
