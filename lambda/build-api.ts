import fs from 'fs';
import { openApiSpec } from './src/openapi.config';
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

const handlerStr = `export const handler: APIGatewayProxyHandler = async (event, ctx) => {
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
if (!childHandler) throw new Error('No handler found');


const res = await childHandler(event, ctx);
return res;
};`;

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

getRawHandlersMetaData([buildAppHandler, buildOpenapiSpec]);

async function buildAppHandler(rawHandlersMetadata: RawHandlersMetadata) {
  let newImportStatementsStr = `import { APIGatewayProxyHandler } from 'aws-lambda';import { EventHandler } from './common/types';`;
  let newResourceHandlersStr = 'const resourceHandlers = {';
  __.forIn(rawHandlersMetadata, (handlers, apiPath) => {
    const httpMethodHandlers: string[] = [];
    __.forIn(handlers, (filePath, httpMethod) => {
      const importPathRelative = filePath
        .replace('src/', './')
        .replace('.ts', '');

      const handlerName = __.camelCase(importPathRelative);
      newImportStatementsStr += `import { handler as ${handlerName} } from './${importPathRelative}';`;
      httpMethodHandlers.push(`${httpMethod}: ${handlerName}`);
    });
    const apiPathObjStr = `['${apiPath}']: {${httpMethodHandlers.join(',')}},`;
    newResourceHandlersStr += apiPathObjStr;
  });
  const strCode = `${newImportStatementsStr}\n\n${newResourceHandlersStr}}\n\n${handlerStr}`;
  const formatted2 = await prettier.format(strCode, {
    parser: 'typescript',
    singleQuote: true,
  });

  // console.log({
  //   rawHandlersMetadata,
  //   formatted2,
  // });
  fs.writeFileSync('src/app.controller.ts', formatted2);
}
async function buildOpenapiSpec(rawHandlersMetadata: RawHandlersMetadata) {
  console.log(buildOpenapiSpec.name);

  for (const [path, methods] of Object.entries(rawHandlersMetadata)) {
    for (const [method, filePath] of Object.entries(methods)) {
      const { handler2 } = await import('./' + filePath.replace('.ts', ''));

      console.log({ path, method, filePath, handler2 });
    }
  }
}
// const allFiles = readAllFiles('./src');
// console.log('hi');
// console.log(fs.readdirSync('./src'));
// console.log(allFiles);
// console.log(JSON.stringify(allFiles, null, 2));

try {
  const specStr = JSON.stringify(openApiSpec, null, 2);

  const htmlContent = `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>JobQuest API</title>
      <link rel="stylesheet" href="./index-dark.css" />
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

  fs.writeFileSync('public/index.html', htmlContent);
  fs.writeFileSync('public/openapi.json', specStr);
} catch (error) {
  console.error(error);
}
