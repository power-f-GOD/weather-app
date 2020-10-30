const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlCriticalPlugin = require('html-critical-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/ts/index.ts',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public')
  },
  // devtool: 'inline-source-map',
  devServer: {
    contentBase: './public',
    hot: true
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: true }),
    new HtmlWebpackPlugin({ template: './src/index.html', minify: 'auto' }),
    new MiniCssExtractPlugin(),
    // new HtmlCriticalPlugin({
    //   base: path.join(path.resolve(__dirname), 'public/'),
    //   src: 'index.html',
    //   dest: 'index.html',
    //   inline: true,
    //   minify: true,
    //   extract: true,
    //   width: 320,
    //   height: 568,
    //   penthouse: {
    //     blockJSRequests: false
    //   }
    // }),
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
          sizes: [96, 128, 192, 256, 512]
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
        test: /index\.(sc|sa|c)ss$/,
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
