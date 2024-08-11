import { OpenAPIV3 } from 'openapi-types';
import _ from 'lodash';
import z, { ZodTypeAny } from 'zod';
import { authOpenApi } from './auth/auth-openapi.config';
import { jobOpenApi } from './job/job-openapi.config';
import { userOpenApi } from './user/user-openapi.config';
import {
  buildOpenapiSpec,
  BuildOpenApiSpecReturn,
  OpenAPIV3Internal,
} from './common';

const openApiSpec = buildOpenapiSpec({
  openapi: '3.0.0',
  servers: [{ url: 'http://localhost:3000' }],
  info: { title: 'What up !', version: '1.0.0' },
  paths: {},
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
});

const resourceSpecs: BuildOpenApiSpecReturn[] = [
  authOpenApi,
  userOpenApi,
  jobOpenApi,
];
resourceSpecs.forEach((resourceSpec) => {
  _.defaultsDeep(openApiSpec, resourceSpec);
});

export default openApiSpec;
