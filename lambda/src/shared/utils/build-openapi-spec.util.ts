import _ from 'lodash';
import { OpenAPIV3 } from 'openapi-types';
import { z, ZodObject } from 'zod';
import { zodToJson, zodToParamJson } from './zod-json-formatters.util';
import { EventHandler } from '../types';

export type OpenAPIV3Internal = OpenAPIV3.Document<{
  // zodSchema?: ZodTypeAny;
  handlerFn?: EventHandler;
  zodQueryParamsSchema?: ZodObject<any, any>;
  zodPathParamsSchema?: ZodObject<any, any>;
  responses: Required<
    {
      [code: string]: {
        content?: {
          ['application/json']?: {
            zodSchema?: Record<string, z.ZodObject<any, any>>;
          };
        };
      };
    } & OpenAPIV3.ResponsesObject
  >;
  requestBody?: {
    content?: {
      ['application/json']: {
        zodSchema?: Record<string, z.ZodSchema<any>>;
        schema?: OpenAPIV3.SchemaObject;
        // schema: {
        // };
      } & OpenAPIV3.MediaTypeObject;
    } & OpenAPIV3.RequestBodyObject['content'];
  } & OpenAPIV3.RequestBodyObject;
}>;
// type aaaa = OpenAPIV3Internal['paths'][string][OpenAPIV3.HttpMethods];

const mediaPath = 'content.application/json';
const schemaPath = `${mediaPath}.schema`;
const zodSchemaPath = `${mediaPath}.zodSchema`;

export type BuildOpenApiSpecReturn = ReturnType<typeof buildOpenapiSpec>;
export type BuildOpenApiSpecArg = Parameters<typeof buildOpenapiSpec>[0];
export type BuildOpenApiSpecArgOperationObj = NonNullable<
  NonNullable<BuildOpenApiSpecArg['paths'][string]>[OpenAPIV3.HttpMethods]
>;

// const aaaa: Pick<BuildOpenApiSpecArg, 'paths'> = {
//   // openapi: '3.0.0',
//   paths: {
//     ded: {
//       get: {
//         responses: {},
//         handlerFn: () => {},
//       },
//     },
//   },
// };
// function buildHandlerOpenapi<T extends BuildOpenApiSpecArgOperationObj>(spec:T) {
//   return spec as const
// }

export function buildController(controller: {
  [path: string]: {
    [httpMethod in OpenAPIV3.HttpMethods]?: NonNullable<
      BuildOpenApiSpecArg['paths'][string]
    >[httpMethod];

    // [method: string]: BuildOpenApiSpecArgOperationObj;
    // get: BuildOpenApiSpecArg['paths'][string][OpenAPIV3.HttpMethods];
  };
}) {
  _.forIn(controller, function (pathConfig, currentPath) {
    let newPath = currentPath;
    if (!currentPath.startsWith('/')) newPath = `/${newPath}`;
    if (!currentPath.startsWith('/v1')) newPath = `/v1${newPath}`; // assume currentPath always starts with '/'

    if (newPath !== currentPath) {
      _.unset(controller, currentPath);
      _.set(controller, newPath, pathConfig);
    }

    _.forIn(pathConfig, function (methodConfig, _httpMethod) {
      if (!methodConfig) throw new Error('No method config');
      const { handlerFn, requestBody } = methodConfig;

      const hasJsonReqBody = !!requestBody?.content['application/json'];

      if (hasJsonReqBody && !!handlerFn) {
        methodConfig.handlerFn = async (req, ...args) => {
          const { body } = req;
          if (body && typeof body === 'string') req.body = JSON.parse(body);

          const res = await handlerFn(req, ...args);

          if (res.body && typeof res.body === 'object') {
            res.body = JSON.stringify(res.body);
            const existingHeaders = res.headers || {};
            res.headers = {
              'Content-Type': 'application/json',
              ...existingHeaders,
            };
          }

          return res;
        };
      }
    });
  });

  return controller;
}

export function buildOpenapiSpec<
  T extends Omit<OpenAPIV3Internal, 'openapi' | 'info'> &
    Partial<Pick<OpenAPIV3Internal, 'openapi' | 'info'>>,
>(_spec: T) {
  const spec = _.cloneDeep(_spec);

  _.forIn(spec.paths, function (pathConfig, path) {
    if (!pathConfig) return;
    _.forIn(pathConfig, function (methodObj, method) {
      if (!methodObj) return;

      if (!methodObj['x-amazon-apigateway-integration']) {
        methodObj['x-amazon-apigateway-integration'] = {
          httpMethod: 'POST',
          payloadFormatVersion: '2.0',
          type: 'AWS_PROXY',
          uri: '${lambda_arn}',
        };
      }
      if (!methodObj['security']) methodObj['security'] = [{ bearerAuth: [] }];
      if (!methodObj['tags'])
        methodObj['tags'] = [path.split('/')[2]] || undefined;
      if (methodObj['handlerFn']) _.unset(methodObj, 'handlerFn');
      const responses = _.get(methodObj, 'responses');
      if (responses) {
        _.forIn(responses, function (responseObj, responseCode) {
          const zodSchema = _.get(responseObj, zodSchemaPath);
          if (!zodSchema) return;
          if (_.size(zodSchema) !== 1)
            throw new Error('Only one schema allowed');

          const [schemaName, schemaZodDef] = _.entries(zodSchema)[0];
          const jsonSchema = zodToJson(schemaZodDef);

          const $ref = `#/components/schemas/${schemaName}`;
          _.set(responseObj, schemaPath, { $ref });
          _.unset(responseObj, zodSchemaPath);

          const componentSchemaPath = `components.schemas.${schemaName}`;
          _.set(spec, componentSchemaPath, jsonSchema);
        });
      }
      const requestBody = _.get(methodObj, 'requestBody');
      if (requestBody) {
        const zodSchema = _.get(requestBody, zodSchemaPath);
        if (!zodSchema) return;

        if (_.size(zodSchema) !== 1) throw new Error('Only one schema allowed');

        const [schemaName, schemaZodDef] = _.entries(zodSchema)[0];
        const jsonSchema = zodToJson(schemaZodDef);

        const $ref = `#/components/schemas/${schemaName}`;
        _.set(requestBody, schemaPath, { $ref });
        _.unset(requestBody, zodSchemaPath);

        const componentSchemaPath = `components.schemas.${schemaName}`;
        _.set(spec, componentSchemaPath, jsonSchema);
      }

      const zodQueryParamsSchema = _.get(methodObj, 'zodQueryParamsSchema');
      if (zodQueryParamsSchema) _.unset(methodObj, 'zodQueryParamsSchema');
      const zodPathParamsSchema = _.get(methodObj, 'zodPathParamsSchema');
      if (zodPathParamsSchema) _.unset(methodObj, 'zodPathParamsSchema');

      if (zodQueryParamsSchema || zodPathParamsSchema) {
        const params: OpenAPIV3.ParameterObject[] = [];

        if (zodQueryParamsSchema) {
          const queryParams = zodToParamJson(zodQueryParamsSchema, 'query');
          params.push(...queryParams);
        }
        if (zodPathParamsSchema) {
          const pathParams = zodToParamJson(zodPathParamsSchema, 'path');
          params.push(...pathParams);
        }
        methodObj['parameters'] = params;
        // _.set(methodObj, 'parameters', params);
      }
    });
  });

  return spec;
}
