/* eslint-disable @typescript-eslint/no-var-requires */
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
// const nodeExternals = require('webpack-node-externals');
// nest build --webpack --webpackPath webpack.config

/**
 * Webpack configuration for building a Lambda function.
 * @type {import('webpack').Configuration}
 */
module.exports = {
  // entry: ['./src/main.ts'],
  // entry: ['./src/main.ts', './src/auth/signup.ts'],
  // entry: {
  //   main: './src/main.ts',
  //   'auth/signup': './src/auth/signup.ts',
  //   // auth: './auth.ts',
  // },
  entry: {
    main: path.join(__dirname, './src/main.ts'),
    'api/auth/signup': path.join(__dirname, './src/api/auth/signup.ts'),
    // auth: './auth.ts',
  },
  // target: 'node',
  target: 'node',
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
        use: 'ts-loader',
      },
      // {
      //   test: /.tsx?$/,
      //   use: 'ts-loader',
      //   exclude: /node_modules/,
      // },
    ],
  },
  mode: 'production',
  resolve: {
    // root: [
    //   path.resolve(__dirname, 'src'),
    //   path.resolve(__dirname, 'node_modules'),
    // ],
    // roots: [path.resolve(__dirname, 'lambda')],

    extensions: ['.tsx', '.ts', '.js'],
    // extensions: [/(src)\/.*\.ts?$/, /(src)\/.*\.js?$/],
    // exclude: [path.resolve(__dirname, '../src')],
    // modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    // alias: {
    //   '@app': path.resolve(__dirname, 'src/'),
    //   // '@nestjs/core': path.resolve(__dirname, 'node_modules/@nestjs/core'),
    // },

    plugins: [
      function () {
        // console.log(this);
        console.log('nest\n\n\n');
        // console.log(this.hooks);
        // console.log(this.hooks);
        // console.log(Object.keys(this.hooks));
        // console.log(this.hooks.resolve);
        // this.hooks.result.tap('DonePlugin', (resolveData) => {
        //   console.log(Object.keys(resolveData));
        // });
        // this.hooks.done.tap('DonePlugin', (stats) => {
        //   console.log('Webpack done');
        //   console.log('Webpack done');
        //   console.log('Webpack done');
        //   console.log('Webpack done');
        //   console.log('Webpack done');
        //   console.log('Webpack done');
        //   console.log('Webpack done');
        //   console.log(stats.toJson().assetsByChunkName);
        //   // console.log(path.resolve(__dirname));
        // });
      },
    ],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    // filename: '[name].js',
    // filename: '[path][name]',
    // filename: '[file]',
    // filename: 'app/[path]-[name].js',

    libraryTarget: 'commonjs2',
  },
  plugins: [
    // new webpack.IgnorePlugin(/\.(md|yml.encrypted|sh|vm)$/),
    function () {
      this.hooks.done.tap('DonePlugin', (stats) => {
        const chunkGroups = stats.toJson().namedChunkGroups;
        const apiChunks = Object.keys(chunkGroups).filter((chunk) =>
          chunk.startsWith('api/'),
        );
        apiChunks.forEach((chunk) => {
          const module = require(path.join(__dirname, 'dist', `${chunk}.js`));
          console.log(module);
          // const chunkFiles = chunkGroups[chunk].assets;
          // console.log(chunkFiles);
        });

        // console.log(stats.toJson());
        // console.log(stats.toJson());
        console.log(apiChunks);
        // console.log(path.resolve(__dirname));
      });
    },
  ],
};
