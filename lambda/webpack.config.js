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
  mode: 'development',
  // mode: 'production',
  entry: () => {
    const entries = {};
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
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
    hot: true,
    liveReload: true,
    // inline: true,

    // proxy: [
    //   {
    //     context: ['**', '!/index.html'],
    //     // ...
    //   },
    // ],
  },
  // target: 'node',
  target: 'node',
  resolve: {
    extensions: ['.ts', '.js'],
  },
  // externals: [nodeExternals()],
  optimization: {
    minimizer: [
      new TerserPlugin({
        // include: /node_modules/,
        extractComments: false,
      }),
    ],
  },

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
        loader: 'json-loader',
      },
    ],
  },
  // mode: 'production',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    // filename: '[path][name]',
    // filename: '[file]',
    // filename: 'app/[path]-[name].js',

    libraryTarget: 'commonjs2',
    // libraryTarget: 'umd',
  },
  plugins: [
    // new CleanWebpackPlugin(),
    new OpenApiWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: require.resolve('swagger-ui/dist/swagger-ui.css'),
          to: 'index.css',
        },
        {
          from: require.resolve(swaggerUiAssetPath + '/swagger-ui-bundle.js'),
          to: 'index.js',
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/index.html'),
      filename: 'index.html',
      // chunks: ['index'],
      chunks: [],
      // minify: false,
    }),
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
