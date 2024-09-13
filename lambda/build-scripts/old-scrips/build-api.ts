import fs from 'fs';
import __ from 'lodash';
import path from 'path';
import * as prettier from 'prettier';

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

type RawHandlersMetadata = {
  [path: string]: { [httpMethod: string]: string };
};

async function getRawHandlersMetaData(
  callbacks: ((meta: RawHandlersMetadata) => Promise<void>)[] = [],
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
      const pathFinal = path.endsWith('/') ? path.slice(0, -1) : path;
      __.set(rawHandlersMetadata, [pathFinal, httpMethod], file);
    }
  }

  await Promise.all(callbacks.map((cb) => cb(rawHandlersMetadata)));
}

export async function buildLambdaHandlers() {
  // await getRawHandlersMetaData([buildAppHandler, buildOpenapiSpecCode]);
  // await getRawHandlersMetaData([buildAppHandler, buildApiSpecHandler]);
  await getRawHandlersMetaData([buildAppHandler, buildApiSpecHandler]);
}

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
async function buildApiSpecHandler(rawHandlersMetadata: RawHandlersMetadata) {
  let importStatementsStr = `
  import { buildOpenapiSpec, BuildOpenApiSpecArgOperationObj } from './common';
  import { EventHandler } from './common/types';
  import fs from 'fs';
  export const openapi: BuildOpenApiSpecArgOperationObj = {
  responses: { 200: { description: '', content: { 'text/html': {} } } },
  };`;

  let resourceHandlersStr = 'const paths  = {';
  __.forIn(rawHandlersMetadata, (handlers, apiPath) => {
    const httpMethodHandlers: string[] = [];
    __.forIn(handlers, (filePath, httpMethod) => {
      const importPathRelative = filePath
        .replace('src/', './')
        .replace('.ts', '');

      const handlerName = __.camelCase(importPathRelative);
      importStatementsStr += `import { openapi as ${handlerName} } from '${importPathRelative}';`;
      httpMethodHandlers.push(`${httpMethod}: ${handlerName}`);
    });
    const apiPathObjStr = `['/v1${apiPath}']: {${httpMethodHandlers.join(
      ',',
    )}},`;
    resourceHandlersStr += apiPathObjStr;
  });
  const strCode = `${importStatementsStr}\n\n${resourceHandlersStr}}\n\n
  export const apiSpec = buildOpenapiSpec({
    openapi: '3.0.0',
    info: { title: 'What up !', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3000' }],
    paths,
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

  export const handler: EventHandler = async () => {
  const css = fs.readFileSync('./swagger.css').toString();
  const js = fs.readFileSync('./swagger.js').toString();
  const spec = apiSpec
  spec.paths = { ...paths, ['/v1']: undefined as any }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: \`<!DOCTYPE html>
  <html>
    <head> <meta charset="UTF-8" /> <title>Job Quest API</title> <style>\${css}</style> </head>
    <body>
      <div id="swagger"></div>
      <script>\${js}</script>
      <script>
        window.onload = () => {  window.ui = SwaggerUIBundle({ spec: \${JSON.stringify(spec, null, 2)}, dom_id: '#swagger'}); };
      </script>
    </body>
  </html>
  \`,
  };
};`;

  const formatted2 = await prettier.format(strCode, {
    parser: 'typescript',
    singleQuote: true,
  });

  fs.writeFileSync('src/get.handler.ts', formatted2);
}
