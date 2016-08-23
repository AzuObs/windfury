import path from 'path';
import webpack from 'webpack';
import AssetsPlugin from 'assets-webpack-plugin';
import autoprefixer from 'autoprefixer';
import nodeExternals from 'webpack-node-externals';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import fs from 'fs-extra';

import resolveEnvConfig from '../helpers/resolveEnvConfig';
import * as felfireConfig from '../utils/Config';

const HotModuleReplacementPlugin = webpack.HotModuleReplacementPlugin;
const OccurenceOrderPlugin = webpack.optimize.OccurenceOrderPlugin;
const NoErrorsPlugin = webpack.NoErrorsPlugin;
const DefinePlugin = webpack.DefinePlugin;
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
const DedupePlugin = webpack.optimize.DedupePlugin;
const AggressiveMergingPlugin = webpack.optimize.AggressiveMergingPlugin;
const babelRc = JSON.parse(fs.readFileSync(path.join(process.cwd(), './.babelrc')));

/**
 * Set Webpack production configuration.
 *
 * @param {Object} options
 * @returns {[]}
 */
export default function(options = {}) {
  const definePluginConfig = options.envFile ? resolveEnvConfig({
    envFile: options.envFile,
    stringify: true
  }) : resolveEnvConfig({
    stringify: true
  });
  const config = {
    context: process.cwd(),
    output: {
      publicPath: felfireConfig.cdnEndpoint
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          include: path.join(process.cwd(), './src'),
          loader: 'babel',
          babelrc: false,
          query: babelRc
        },
        {
          test: /\.json$/,
          include: path.join(process.cwd(), './src'),
          loader: 'json'
        },
        {
          test: /\.eot$/,
          include: path.join(process.cwd(), './src'),
          loader: 'file'
        },
        {
          test: /\.(png|jpg|jpg|gif|svg|woff|woff2)$/,
          include: path.join(process.cwd(), './src'),
          loaders: [
            'url?limit=10000',
            'image-webpack?{progressive:true,optimizationLevel:7,interlaced:false,pngquant:' +
            '{quality:"65-90",speed:4}}'
          ]
        }
      ]
    },
    resolve: {
      root: process.cwd(),
      alias: {
        'isomorphic-fetch': path.join(process.cwd(), './node_modules/isomorphic-fetch'),
        'whatwg-fetch': path.join(process.cwd(), './node_modules/whatwg-fetch'),
        newrelic: path.join(process.cwd(), './node_modules/newrelic'),
        'server-module': path.join(process.cwd(), './src'),
        'client-module': path.join(process.cwd(), './src/client.js'),
        'async-module': path.join(process.cwd(), './src/async.js')
      },
      modulesDirectories: ['node_modules', 'src'],
      extensions: ['', '.js', '.json'],
      unsafeCache: true,
      fallback: path.join(__dirname, '../../node_modules')
    },
    resolveLoader: {
      root: __dirname,
      modulesDirectories: ['node_modules'],
      fallback: path.join(__dirname, '../../node_modules')
    },
    plugins: [
      new UglifyJsPlugin({
        comments: false,
        compress: {
          warnings: false
        }
      })
    ]
  };
  const clientConfig = {
    context: config.context,
    target: 'web',
    name: 'client',
    entry: {
      app: [path.join(process.cwd(), './src/client.js')],
      async: [path.join(process.cwd(), './src/async.js')]
    },
    output: {
      ...config.output,
      path: path.join(process.cwd(), './build'),
      chunkFilename: '[name]-[chunkhash].js',
      filename: '[name]-[hash].js'
    },
    module: {
      loaders: config.module.loaders.concat([
        {
          test: /\.css$/,
          exclude: /node_modules/,
          loader: ExtractTextPlugin.extract(
            'style',
            [
              'css?modules&importLoaders=1&localIdentName=_[local]_[hash:base64:5]',
              'postcss'
            ]
          )
        },
        {
          test: /\.scss$/,
          exclude: /node_modules/,
          loader: ExtractTextPlugin.extract(
            'style',
            [
              'css?modules&importLoaders=1&localIdentName=_[local]_[hash:base64:5]',
              'postcss',
              'sass?outputStyle=expanded'
            ]
          )
        }
      ])
    },
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false
    },
    node: {
      fs: 'empty'
    },
    plugins: config.plugins.concat([
      new OccurenceOrderPlugin(),
      new HotModuleReplacementPlugin(),
      new NoErrorsPlugin(),
      new DedupePlugin(),
      new DefinePlugin({
        'process.env': {
          ...definePluginConfig,
          felfire: JSON.stringify(felfireConfig),
          isClient: JSON.stringify(false),
          isServer: JSON.stringify(true)
        }
      }),
      new AggressiveMergingPlugin(),
      new AssetsPlugin({
        path: path.join(process.cwd(), './build')
      }),
      new ExtractTextPlugin('app-[chunkhash].css', {
        allChunks: true
      })
    ]),
    postcss: () => [autoprefixer({
      browsers: felfireConfig.autoprefixerBrowsers
    })],
    resolve: config.resolve,
    resolveLoader: config.resolveLoader
  };
  const serverConfig = {
    context: config.context,
    name: 'server',
    target: 'node',
    externals: [nodeExternals()],
    entry: [path.join(process.cwd(), './src/index.js')],
    output: {
      ...config.output,
      path: path.join(process.cwd(), './build'),
      filename: 'index.js',
      libraryTarget: 'commonjs2'
    },
    module: {
      loaders: config.module.loaders.concat([
        {
          test: /\.css$/,
          include: path.join(process.cwd(), './src'),
          loader: 'css/locals?modules&importLoaders=1&localIdentName=_[local]_[hash:base64:5]'
        },
        {
          test: /\.scss$/,
          include: path.join(process.cwd(), './src'),
          loaders: [
            'css/locals?modules&importLoaders=1&localIdentName=_[local]_[hash:base64:5]',
            'sass?outputStyle=expanded'
          ]
        }
      ])
    },
    resolve: config.resolve,
    resolveLoader: config.resolveLoader,
    plugins: config.plugins.concat([
      new DefinePlugin({
        'process.env': {
          ...definePluginConfig,
          felfire: JSON.stringify(felfireConfig),
          isClient: JSON.stringify(false),
          isServer: JSON.stringify(true)
        }
      })
    ])
  };

  return [clientConfig, serverConfig];
}
