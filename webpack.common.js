const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    app: './app/main.ts',
  },
  output: {
    filename: '[name].[contenthash].js',
    clean: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      FWC_BUILD_NUMBER: JSON.stringify(new Date().getTime()),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts|jsx$/i,
        loader: 'ts-loader',
        exclude: '/node_modules/',
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name].[contenthash][ext]',
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name].[contenthash][ext]',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  cache: {
    type: 'filesystem',
  },
};
