import zodToJsonSchema from 'zod-to-json-schema';
import { MethodConfig, RouteBuilder } from './common.types';
import { z } from 'zod';

export const routeBuilder: RouteBuilder = (config) => {
  if (config.openapi) {
    function formatSchema(object) {
      Object.keys(object).forEach(function (k) {
        if (k == 'schema') {
          // const schema: z.Schema = object[k];
          object[k] = zodToJsonSchema(object[k]);
        } else {
          if (object[k] && typeof object[k] === 'object') {
            formatSchema(object[k]);
          }
        }
      });
    }
    formatSchema(config.openapi);
  }
  return config as MethodConfig;
};
