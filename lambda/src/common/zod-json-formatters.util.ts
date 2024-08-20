import _ from 'lodash';
import { OpenAPIV3 } from 'openapi-types';
import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

export function zodToJson(zodObject: z.ZodSchema<any, any>) {
  return zodToJsonSchema(zodObject, {
    target: 'openApi3',
  }) as OpenAPIV3.SchemaObject;
}

export function zodToParamJson(
  zodObject: z.ZodSchema<any, any>,
  paramType: 'query' | 'path',
) {
  const schema = zodToJson(zodObject);
  const schemaParam: OpenAPIV3.ParameterObject[] = [];
  _.forIn(schema.properties, (propSchema, propName) => {
    const required = schema.required?.includes(propName);
    schemaParam.push({
      name: propName,
      in: paramType,
      required,
      schema: propSchema,
    });
  });
  return schemaParam;
}
