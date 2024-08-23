import { RawHandlersMetadata } from './';
import path from 'path';
import fs from 'fs';
import __ from 'lodash';
import * as prettier from 'prettier';

export async function buildApiSpecHandler(
  rootPath: string,
  rawHandlersMetadata: RawHandlersMetadata,
) {
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

  const writePath = path.join(rootPath, 'src', 'get.handler.ts');
  fs.writeFileSync(writePath, formatted2);
}
