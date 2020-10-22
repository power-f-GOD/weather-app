const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

const manifest = require('./manifest.json');

module.exports = {
  mode: 'production',
  entry: './src/ts/index.ts',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  // devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    hot: true
  },
  plugins: [
    new MiniCssExtractPlugin({
      attributes: {
        id: 'main-css'
      }
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: true }),
    new HtmlWebpackPlugin({ template: './src/index.html', minify: 'auto' }),

    new WebpackPwaManifest({
      filename: 'manifest.json',
      fingerprints: false,
      name: "Weather App by @Power'f GOD⚡️⚡️",
      short_name: 'Weather App',
      lang: 'en-US',
      start_url: '.',
      display: 'standalone',
      theme_color: 'rgb(0, 141, 205)',
      background_color: 'rgb(0, 141, 205)',
      icons: [
        {
          src: path.resolve('src/icons/icon-256x256.png'),
          sizes: [96, 128, 192, 256]
        }
      ]
    })
    // new WorkboxPlugin.GenerateSW({
    //   clientsClaim: true,
    //   skipWaiting: true,
    // })
  ],
  module: {
    rules: [
      {
        test: /\.(sc|sa|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'resolve-url-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('node-sass'),
              sassOptions: {
                fiber: false,
                sourceMap: false,
                outputStyle: 'compressed'
              }
            }
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader']
      },
      {
        test: /\.html$/i,
        use: ['html-loader']
      },
      {
        test: /\.tsx?/,
        use: ['ts-loader'],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
};
