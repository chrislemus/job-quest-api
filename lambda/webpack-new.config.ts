import path from 'path';
import { Compiler, Configuration } from 'webpack';
import fs from 'fs';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { myPlugin } from './build-api';

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

const config: Configuration = {
  // mode: 'production',
  mode: 'development',
  // watch: true,
  entry: () => {
    // return { 'api/auth/index': './src/auth/auth.controller.ts' };
    const entries = {
      openapi: './src/openapi.config.ts',
      // openapi: {
      //   import: './src/openapi.config.ts',
      //   dependOn: 'openapi-format',
      //   async: false,
      // },
      // 'openapi-format': './src/openapi-format.ts',
    };

    for (const file of readAllFiles('./src')) {
      if (file.endsWith('controller.ts')) {
        const path = file.split('/').slice(1, -1).join('/');
        // const pathWithoutExt = path.slice(0, -3);
        entries[`api/${path}/index`] = `./${file}`;
      }
    }
    console.log({ entries });
    return entries;
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [{ test: /\.ts$/, loader: 'ts-loader' }],
  },
  resolve: {
    extensions: ['.js', '.ts'],
    // plugins: [new TsconfigPathsPlugin()],
    alias: {
      '@': path.resolve(__dirname, './src/'),
    },
  },
  target: 'node',
  plugins: [new CleanWebpackPlugin()],
  // more
};

export default config;
