import fs from 'fs';
import __ from 'lodash';
import path from 'path';
import * as prettier from 'prettier';
import {
  buildOpenapiSpec,
  BuildOpenApiSpecArg,
  BuildOpenApiSpecArgOperationObj,
} from './src/common/build-openapi-spec.util';

function* readAllFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      yield* readAllFiles(path.join(dir, file.name));
    } else {
      yield path.join(dir, file.name);
    }
  }
}

const handlerStr = `export const handler: EventHandler = async (event, ctx) => {
const { resource, httpMethod, multiValueQueryStringParameters } = event;
const method = httpMethod.toLowerCase();

const queryParams: Record<string, string[] | string> = {};
if (multiValueQueryStringParameters) {
  Object.entries(multiValueQueryStringParameters).forEach(([k, v]) => {
    if (!v) return;
    queryParams[k] = v.length === 1 ? v[0] : v;
  });
}
event['queryParams'] = queryParams;

const childHandler: EventHandler = resourceHandlers[resource]?.[method];
  if (!childHandler) {
    console.log(Object.keys(resourceHandlers));
    throw new Error(\`NoHandler|resource:\${resource}|method:\${method}\`);
  }


  try {
    const res = await childHandler(event, ctx);
    return res;
  } catch (error) {
    if (error instanceof ExceptionError) {
      return {
        statusCode: error.statusCode,
        body: JSON.stringify({ message: error.message, error: error.error }),
      };
    } else {
      console.error(error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal Server Error' }),
      };
    }
  }
};`;

const htmlContent = `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>JobQuest API</title>
      <link rel="stylesheet" href="./index.css" />
    </head>
  
    <body>
      <div id="swagger"></div>
      <script src="./index.js"></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({ url: './openapi.json', dom_id: '#swagger'});
        };
      </script>
    </body>
  </html>
  `;

type RawHandlersMetadata = {
  [path: string]: { [httpMethod: string]: string };
};

async function getRawHandlersMetaData(
  callbacks: ((meta: RawHandlersMetadata) => void)[] = [],
) {
  const rawHandlersMetadata: RawHandlersMetadata = {};

  for (const file of readAllFiles('./src')) {
    if (
      file.endsWith('get.handler.ts') ||
      file.endsWith('post.handler.ts') ||
      file.endsWith('patch.handler.ts') ||
      file.endsWith('put.handler.ts') ||
      file.endsWith('delete.handler.ts')
    ) {
      const httpMethod = file.split('/').slice(-1)[0].split('.')[0];
      const path: string = '/' + file.split('/').slice(1, -1).join('/');
      __.set(rawHandlersMetadata, [path, httpMethod], file);
    }
  }
  callbacks.forEach((cb) => cb(rawHandlersMetadata));
}

getRawHandlersMetaData([buildAppHandler, buildOpenapiSpecCode]);

async function buildAppHandler(rawHandlersMetadata: RawHandlersMetadata) {
  let importStatementsStr = `import { EventHandler } from './common/types';import { ExceptionError } from './common';`;
  let resourceHandlersStr =
    'const resourceHandlers: Record<string, Record<string, EventHandler>> = {';
  __.forIn(rawHandlersMetadata, (handlers, apiPath) => {
    const httpMethodHandlers: string[] = [];
    __.forIn(handlers, (filePath, httpMethod) => {
      const importPathRelative = filePath
        .replace('src/', './')
        .replace('.ts', '');

      const handlerName = __.camelCase(importPathRelative);
      importStatementsStr += `import { handler as ${handlerName} } from '${importPathRelative}';`;
      httpMethodHandlers.push(`${httpMethod}: ${handlerName}`);
    });
    const apiPathObjStr = `['/v1${apiPath}']: {${httpMethodHandlers.join(
      ',',
    )}},`;
    resourceHandlersStr += apiPathObjStr;
  });
  const strCode = `${importStatementsStr}\n\n${resourceHandlersStr}}\n\n${handlerStr}`;
  const formatted2 = await prettier.format(strCode, {
    parser: 'typescript',
    singleQuote: true,
  });

  fs.writeFileSync('src/app.controller.ts', formatted2);
}
async function buildOpenapiSpecCode(rawHandlersMetadata: RawHandlersMetadata) {
  const openApiSpec: BuildOpenApiSpecArg = {
    openapi: '3.0.0',
    info: {
      title: 'Job Quest',
      version: '1.0.0',
      description: 'Qob Quest API Docs',
    },
    paths: {},
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  };

  for (const [path, methods] of Object.entries(rawHandlersMetadata)) {
    const pathWithPrefix = `/v1${path}`;
    for (const [method, filePath] of Object.entries(methods)) {
      const { openapi } = (await import(
        './' + filePath.replace('.ts', '')
      )) as { openapi?: BuildOpenApiSpecArgOperationObj };
      // console.log(openapi);
      if (!openapi) continue;
      if (!openapi.security) openapi.security = [{ bearerAuth: [] }];
      if (!openapi.tags) openapi.tags = [path.split('/')[1]];
      __.set(openApiSpec, ['paths', pathWithPrefix, method], openapi);
    }
  }

  const output = buildOpenapiSpec(openApiSpec);
  fs.writeFileSync('public/index.html', htmlContent);
  fs.writeFileSync('public/api-spec.json', JSON.stringify(output));
}
//
//
//
//
//
//
//
// async function buildOpenapiSpecCode(rawHandlersMetadata: RawHandlersMetadata) {
//   const openApiSpec: BuildOpenApiSpecArg = {
//     openapi: '3.0.0',
//     info: { title: 'What up !', version: '1.0.0' },
//     servers: [{ url: 'http://localhost:3000' }],
//     paths: {},
//     components: {
//       securitySchemes: {
//         bearerAuth: {
//           type: 'http',
//           scheme: 'bearer',
//           bearerFormat: 'JWT',
//         },
//       },
//     },
//   };

//   for (const [path, methods] of Object.entries(rawHandlersMetadata)) {
//     const pathWithPrefix = `/v1${path}`;
//     for (const [method, filePath] of Object.entries(methods)) {
//       const { openapi } = (await import(
//         './' + filePath.replace('.ts', '')
//       )) as { openapi?: BuildOpenApiSpecArgOperationObj };
//       // console.log(openapi);
//       if (!openapi) continue;
//       // if (!openapi.security) openapi.security = [{ bearerAuth: [] }];
//       if (!openapi.tags) openapi.tags = [path.split('/')[1]];
//       __.set(openApiSpec, ['paths', pathWithPrefix, method], openapi);
//     }
//   }

//   const output = buildOpenapiSpec(openApiSpec);
//   const apiSpec = JSON.stringify(output);
//   // fs.writeFileSync('public/index.html', htmlContent);

//   const content = `
//   import { BuildOpenApiSpecArgOperationObj } from './common';
// import { EventHandler } from './common/types';
// import fs from 'fs';

// export const openapi: BuildOpenApiSpecArgOperationObj = {
//   responses: { 200: { description: '', content: { 'text/html': {} } } },
// };

// export const handler: EventHandler = async () => {
//   const css = fs.readFileSync('./swagger.css').toString();
//   const js = fs.readFileSync('./swagger.js').toString();

//   return {
//     statusCode: 200,
//     headers: { 'Content-Type': 'text/html' },
//     body: \`<!DOCTYPE html>
//   <html>
//     <head>
//       <meta charset="UTF-8" />
//       <title>JobQuest API</title>
//       <style>\${css}</style>
//     </head>
//     <body>
//       <div id="swagger"></div>
//       <script>\${js}</script>
//       <script>
//         window.onload = () => {  window.ui = SwaggerUIBundle({ url: './v1/openapi.json', dom_id: '#swagger'}); };
//       </script>
//     </body>
//   </html>
//   \`,
//   };
// };
// `;
//   fs.writeFileSync('src/get.handler.ts', content);
// }
