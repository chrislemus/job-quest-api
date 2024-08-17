// import { OpenAPIV3 } from 'openapi-types';
// import _ from 'lodash';
// import z, { ZodTypeAny } from 'zod';
// // import { authOpenApi } from './auth/auth-openapi.config';
// // import { jobOpenApi } from './job/job-openapi.config';
// // import { userOpenApi } from './user/user-openapi.config';
// import {
//   buildOpenapiSpec,
//   BuildOpenApiSpecReturn,
//   OpenAPIV3Internal,
// } from './common';

// const openApiSpec = buildOpenapiSpec({
//   openapi: '3.0.0',
//   info: { title: 'What up !', version: '1.0.0' },
//   servers: [{ url: 'http://localhost:3000' }],
//   paths: {},
//   components: {
//     securitySchemes: {
//       bearerAuth: {
//         type: 'http',
//         scheme: 'bearer',
//         bearerFormat: 'JWT',
//       },
//     },
//   },
// });

// export const resourceSpecs: BuildOpenApiSpecReturn[] = [
//   authOpenApi,
//   userOpenApi,
//   jobOpenApi,
// ];

// // export const resourceHandlers = (() => {
// //   const handlers = {};
// //   resourceSpecs.forEach((resourceSpec) => {
// //     _.forIn(resourceSpec.paths, (pathConfig, path) => {
// //       _.forIn(pathConfig, (methodObj, method) => {
// //         if (!methodObj) return;
// //         const { handlerFn } = methodObj;
// //         // console.log({ path, methodObj });
// //         if (!handlerFn) return;
// //         if (!handlers[path]) handlers[path] = {};
// //         handlers[path][method] = methodObj['handlerFn'];
// //       });
// //     });
// //   });
// //   return handlers;
// // })();
// resourceSpecs.forEach((resourceSpec) => {
//   _.defaultsDeep(openApiSpec, resourceSpec);
// });

// export { openApiSpec };
