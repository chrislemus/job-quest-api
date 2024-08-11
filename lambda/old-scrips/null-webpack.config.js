/* eslint-disable @typescript-eslint/no-var-requires */
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const fs = require('fs');
const path = require('path');
const swaggerUiAssetPath = require('swagger-ui-dist').getAbsoluteFSPath();
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OpenApiWebpackPlugin = require('./build/openapi-webpack.plugin.js');
//swagger-ui-bundle.js

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
/**
 * Webpack configuration for building a Lambda function.
 * @type {import('webpack').Configuration}
 */
module.exports = {
  mode: 'production',
  // mode: 'production',
  cache: false,
  // watch: true,
  watchOptions: {
    // ignored: ['**/node_modules', '**/dist', '**/public'],
    // ignored: ['**/node_modules'],
    // ignored: /node_modules|public|build/,
    // ignored: /node_modules|public|build/,
    // ignored: ['**/node_modules'],
    // ignored: ['**/dist/**', '**/node_modules'],
    // ignored: ['**/node_modules', '**/dist/index.html'],
    // aggregateTimeout: 3000,
    // poll: 3000,
  },
  entry: () => {
    // const entries = {};
    const entries = {
      openapi: './src/openapi.config.ts',
      // openapi: {
      //   import: './src/openapi.config.ts',
      //   dependOn: 'openapi-format',
      //   async: false,
      // },
      'openapi-format': './src/openapi-format.ts',
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
  // devServer: {
  //   static: {
  //     directory: path.join(__dirname, 'dist'),
  //   },

  //   compress: false,
  //   port: 9000,
  //   hot: true,
  //   // liveReload: true,
  //   // // inline: true,
  //   watchFiles: ['./src/**/*'],
  //   open: true,
  //   // contentBase: './dist/',
  //   // Make webpack-dev-server live-reload when your
  //   // shell page changes
  //   // watchContentBase: true,
  //   // proxy: [
  //   //   {
  //   //     context: ['**', '!/index.html'],
  //   //     // ...
  //   //   },
  //   // ],
  // },
  // target: 'node',
  target: 'node',
  resolve: {
    extensions: ['.ts', '.js'],
  },
  // externals: [nodeExternals()],
  // optimization: {
  //   minimizer: [
  //     new TerserPlugin({
  //       // include: /node_modules/,
  //       extractComments: false,
  //     }),
  //   ],
  // },

  module: {
    rules: [
      {
        test: /.ts?$/,
        // test: /(src).*\.ts?$/,
        // exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.json$/,
        // exclude: /node_modules/,
        loader: 'json-loader',
      },
    ],
  },
  // mode: 'production',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    // publicPath: '/build/',
    // filename: '[path][name]',
    // filename: '[file]',
    // filename: 'app/[path]-[name].js',
    libraryTarget: 'commonjs2',

    // libraryTarget: 'web',
    // target: 'web',
    // libraryTarget: 'umd',
  },
  // cache: {
  //   type: 'filesystem',
  //   cacheLocation: path.resolve(__dirname, '.test_cache'),
  // },
  // cache: false,
  plugins: [
    // new CleanWebpackPlugin(),
    new OpenApiWebpackPlugin(),
    // new CopyWebpackPlugin({
    //   patterns: [
    //     {
    //       from: require.resolve('swagger-ui/dist/swagger-ui.css'),
    //       to: 'index.css',
    //       // to: path.join(__dirname, 'public/index.css'),
    //     },
    //     // {
    //     //   from: path.join(__dirname, 'src/openapi.json'),
    //     //   to: 'openapi.json',
    //     // },
    //     {
    //       from: require.resolve(swaggerUiAssetPath + '/swagger-ui-bundle.js'),
    //       to: 'index.js',
    //       // to: path.join(__dirname, 'public/index.js'),
    //     },
    //   ],
    // }),
    // new HtmlWebpackPlugin({
    //   template: path.join(__dirname, 'src/index.html'),
    //   filename: 'index.html',
    //   // chunks: ['openapi', 'openapi-format'],
    //   chunks: [],
    //   // minify: false,
    // }),
    // new webpack.IgnorePlugin(/\.(md|yml.encrypted|sh|vm)$/),
    // function () {
    //   this.hooks.done.tap('done', (stats) => {
    //     const openApiSpec = JSON.stringify({ openapi: '3.0.0' });
    //     // const rawReadSpec = fs.readFileSync(
    //     //   path.join(__dirname, './api-json.json'),
    //     // );
    //     fs.writeFileSync(
    //       path.join(__dirname, './dist/api-json.json'),
    //       openapiSpec,
    //     );

    //     //
    //     //

    //     // const chunkGroups = stats.toJson().namedChunkGroups;
    //     // const apiChunks = Object.keys(chunkGroups).filter((chunk) =>
    //     //   chunk.startsWith('api/'),
    //     // );
    //     // apiChunks.forEach((chunk) => {
    //     // const module = require(path.join(__dirname, 'dist', `${chunk}.js`));
    //     // console.log(module);
    //     // const chunkFiles = chunkGroups[chunk].assets;
    //     // console.log(chunkFiles);
    //     // });

    //     // console.log(stats.toJson());
    //     // console.log(stats.toJson());
    //     // console.log(apiChunks);
    //     // console.log(swaggerUiAssetPath);
    //     // console.log(path.resolve(__dirname));
    //   });
    // },
  ],
};
