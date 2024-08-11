// import _, { functions } from 'lodash';
// import { OpenAPIV3 } from 'openapi-types';
// import { ZodTypeAny } from 'zod';
// import zodToJsonSchema from 'zod-to-json-schema';
// import { OpenAPIV3zod } from './openapi.config';

// type ApiMetaConfig = { description?: string; schemaName: string };
// type ApiMetadata = ApiMetaConfig & { _type: 'apiMeta' };
// export function apiMeta(config: ApiMetaConfig) {
//   const data = { ...config, _type: 'apiMeta' } as ApiMetadata;
//   return JSON.stringify(data);
// }
// const apiMetaParse = (strData: string): ApiMetadata => {
//   const data: ApiMetadata = JSON.parse(strData);
//   if (data._type !== 'apiMeta') throw new Error('Invalid apiMeta');
//   return data;
// };
// console.log('formatSchemas');
// console.log('formatSchemas');
// console.log('formatSchemas');
// console.log('formatSchemas');
// console.log('formatSchemas');
// console.log('formatSchemas');

// const httpMethodsSet = new Set(Object.values(OpenAPIV3.HttpMethods));
// export const formatSchemas = (openApiSpec: OpenAPIV3zod) => {
//   const components = {
//     schemas: {},
//   };
//   const { paths } = openApiSpec;
//   Object.entries(paths).forEach(([path, pathObj]) => {
//     if (!pathObj) return;
//     Object.entries(pathObj).forEach(([method, methodObj]) => {
//       if (!httpMethodsSet.has(method as OpenAPIV3.HttpMethods)) return;
//       if (methodObj && typeof methodObj === 'object') {
//         const schemaPath = 'requestBody.content.application/json.schema';

//         const { apiMeta, jsonSchema, $ref } =
//           handleMethodConfig({
//             methodConfig: methodObj as OpenAPIV3zod['paths'][string],
//           }) || {};

//         if (apiMeta) components.schemas[apiMeta.schemaName] = jsonSchema;
//         _.set(methodObj, schemaPath, {
//           $ref: $ref,
//         });
//       }
//     });
//   });
//   openApiSpec.components = components;
//   return openApiSpec;
// };

// function handleMethodConfig(config: {
//   methodConfig: OpenAPIV3zod['paths'][string];
// }) {
//   const { methodConfig } = config;

//   const schemaPath = 'requestBody.content.application/json.schema';
//   const reqBodyZodSchema = _.get(methodConfig, schemaPath) as
//     | ZodTypeAny
//     | undefined;

//   if (reqBodyZodSchema) {
//     const schemaDesc = _.get(reqBodyZodSchema, '_def.description', '');
//     const apiMeta = apiMetaParse(schemaDesc);

//     const jsonSchema = zodToJsonSchema(reqBodyZodSchema, {
//       target: 'openApi3',
//     });
//     jsonSchema['description'] = apiMeta.description;
//     // jsonSchema['description'] = undefined;
//     // console.log(apiMeta);
//     // console.log(jsonSchema);
//     if (!jsonSchema) throw new Error('jsonSchema is undefined');
//     return {
//       $ref: `#/components/schemas/${apiMeta.schemaName}`,
//       jsonSchema,
//       apiMeta,
//     };
//     // components.schemas[apiMeta.schemaName] = jsonSchema;
//     // _.set(methodConfig, schemaPath, {
//     //   $ref: `#/components/schemas/${apiMeta.schemaName}`,
//     // });
//   }
// }
