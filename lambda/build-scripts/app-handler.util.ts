import { RawHandlersMetadata } from './';
import fs from 'fs';
import __ from 'lodash';
import * as prettier from 'prettier';
import path from 'path';

export async function buildAppHandler(
  rootPath: string,
  rawHandlersMetadata: RawHandlersMetadata,
) {
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

  fs.writeFileSync(path.join(rootPath, 'src', 'app.controller.ts'), formatted2);
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
    if(!res['headers']) res['headers'] = {};
    res['headers']['Access-Control-Allow-Origin'] = '*';
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
