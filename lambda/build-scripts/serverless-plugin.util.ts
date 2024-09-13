import { getRawHandlersMetaData } from './';
import path from 'path';
import Webpack from 'webpack';
import fs from 'fs';
import { buildAppHandler } from './app-handler.util';
import { buildApiSpecHandler } from './spec-handler.util';

export class ServerlessPlugin {
  rootPath: string;
  constructor(rootPath: string) {
    this.rootPath = rootPath;
  }

  apply(compiler: Webpack.Compiler) {
    // compiler.hooks.beforeCompile.tap('customWebpackPlugin', async () => {
    //   try {
    //     fs.unlinkSync(path.resolve(this.rootPath, 'dist/api-spec.json'));
    //     fs.unlinkSync(path.resolve(this.rootPath, 'apiSpec.js'));
    //   } catch (error) {}
    //   await buildLambdaHandlers(this.rootPath);
    // });
    compiler.hooks.done.tap('customWebpackPlugin', async (_stats) => {
      const { rootPath } = this;

      const { apiSpec } = await import(
        `${path.resolve(rootPath, 'dist/api/index.js')}`
      );
      fs.writeFileSync(
        path.resolve(rootPath, 'dist/api-spec.json'),
        JSON.stringify(apiSpec, null, 2),
      );
    });
  }
}

export async function buildLambdaHandlers(rootPath: string) {
  const rawHandlersMetadata = getRawHandlersMetaData(rootPath);
  const callbacks = [buildAppHandler, buildApiSpecHandler];
  await Promise.all(callbacks.map((cb) => cb(rootPath, rawHandlersMetadata)));
}
