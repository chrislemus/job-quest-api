/* eslint-disable @typescript-eslint/no-var-requires */
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
// nest build --webpack --webpackPath webpack.config
module.exports = {
  entry: ['./src/main.ts'],
  // target: 'node',
  target: 'node',
  // externals: [nodeExternals()],
  // optimization: {
  //   minimizer: [
  //     new TerserPlugin({
  //       // include: /node_modules/,
  //       terserOptions: {
  //         keep_classnames: true,
  //       },
  //     }),
  //   ],
  // },
  module: {
    rules: [
      {
        test: /.tsx?$/,
        // test: /^.+\\.(t|j)s$/,
        use: 'ts-loader',
        include: /node_modules/,
        // exclude: /node_modules_p/,
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
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@app': path.resolve(__dirname, 'src/'),
      // '@nestjs/core': path.resolve(__dirname, 'node_modules/@nestjs/core'),
    },
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'main.js',
    libraryTarget: 'commonjs2',
  },
};
