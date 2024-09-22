import path from 'path';
import { Configuration } from 'webpack';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { getAbsoluteFSPath } from 'swagger-ui-dist';
import { ServerlessPlugin } from 'build-scripts';

const config: Configuration = {
  // mode: 'production',
  mode: 'development',
  watchOptions: {
    ignored: [
      // '**/*.controller.ts',
      // path.resolve(__dirname, 'src/get.handler.ts'),
      '**/node_modules',
    ],
  },
  entry: async () => {
    const entries = {
      'api-spec.config': './src/api-spec.config.ts',
      'app.express.module': './src/app.express.module.ts',
      ['api/index']: './src/app.lambda.module.ts',
    };

    // for (const file of readAllFiles(path.join(__dirname, 'src'))) {
    //   if (file.endsWith('controller.ts')) {
    //     const path = file.split('/').slice(1, -1).join('/');
    //     // const pathWithoutExt = path.slice(0, -3);
    //     entries[`api/${path}/index`] = `./${file}`;
    //   }
    // }
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
    alias: {
      '@': path.resolve(__dirname, './src/'),
    },
  },
  target: 'node',
  plugins: [
    new CleanWebpackPlugin(),
    new ServerlessPlugin(__dirname),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: require.resolve('swagger-ui/dist/swagger-ui.css'),
          to: 'api/swagger.css',
        },

        // {
        //   from: path.resolve(__dirname, 'public/api-spec.json'),
        //   to: 'api/api-spec.json',
        // },
        {
          from: require.resolve(getAbsoluteFSPath() + '/swagger-ui-bundle.js'),
          to: 'api/swagger.js',
        },
      ],
    }),
  ],
};

export default config;
