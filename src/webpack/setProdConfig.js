import path from 'path';
import webpack from 'webpack';
import autoprefixer from 'autoprefixer';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import fs from 'fs-extra';
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin';
import reactRouterToArray from 'react-router-to-array';
import nodeExternals from 'webpack-node-externals';
import AssetsPlugin from 'assets-webpack-plugin';

import resolveEnvConfig from '../helpers/resolveEnvConfig';
import requireCreateRoutesModule from '../helpers/requireCreateRoutesModule';
import * as windfuryConfig from '../utils/Config';

const HotModuleReplacementPlugin = webpack.HotModuleReplacementPlugin;
const OccurenceOrderPlugin = webpack.optimize.OccurenceOrderPlugin;
const NoErrorsPlugin = webpack.NoErrorsPlugin;
const DefinePlugin = webpack.DefinePlugin;
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
const DedupePlugin = webpack.optimize.DedupePlugin;
const AggressiveMergingPlugin = webpack.optimize.AggressiveMergingPlugin;
const babelRc = JSON.parse(fs.readFileSync(path.join(process.cwd(), './.babelrc')));

/**
 * Set Webpack development configuration.
 *
 * @param {Object} options
 * @returns {Array}
 */
export default function(options = {}) {
  const paths = reactRouterToArray(requireCreateRoutesModule());
  const definePluginConfig = options.envFile ? resolveEnvConfig({
    envFile: options.envFile,
    stringify: true
  }) : resolveEnvConfig({
    stringify: true
  });
  const config = {
    context: path.join(process.cwd(), './src'),
    output: {
      publicPath: windfuryConfig.cdnEndpoint
    },
    module: {
      noParse: /node_modules\/json-schema\/lib\/validate\.js/,
      loaders: [
        {
          test: /\.json$/,
          loader: 'json'
        },
        {
          test: /\.eot$/,
          include: path.join(process.cwd(), './src'),
          loader: 'file?name=[path][name]-[hash].[ext]'
        },
        {
          test: /\.(png|jpg|jpg|gif|svg|woff|woff2)$/,
          include: path.join(process.cwd(), './src'),
          loaders: [
            'url?limit=10000&name=[path][name]-[hash].[ext]',
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
    }
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
      path: path.join(process.cwd(), './build', options.locale),
      chunkFilename: '[name]-[chunkhash].js',
      filename: '[name]-[hash].js'
    },
    module: {
      noParse: config.module.noParse,
      loaders: config.module.loaders.concat([
        {
          test: /\.js$/,
          include: path.join(process.cwd(), './src'),
          loader: 'babel',
          babelrc: false,
          query: babelRc
        },
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
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    },
    plugins: [
      new UglifyJsPlugin({
        comments: false,
        compress: {
          warnings: false
        }
      }),
      new OccurenceOrderPlugin(),
      new HotModuleReplacementPlugin(),
      new NoErrorsPlugin(),
      new DedupePlugin(),
      new DefinePlugin({
        'process.env': {
          ...definePluginConfig,
          WINDFURY: JSON.stringify(windfuryConfig),
          IS_CLIENT: JSON.stringify(true),
          IS_SERVER: JSON.stringify(false),
          LOCALE: JSON.stringify(options.locale)
        }
      }),
      new AggressiveMergingPlugin(),
      new ExtractTextPlugin('app-[chunkhash].css', {
        allChunks: true
      }),
      new AssetsPlugin({
        path: path.join(process.cwd(), './build', options.locale)
      })
    ],
    postcss: () => [autoprefixer({
      browsers: windfuryConfig.autoprefixerBrowsers
    })],
    resolve: config.resolve,
    resolveLoader: config.resolveLoader
  };
  const serverConfig = {
    context: config.context,
    name: 'server',
    target: 'node',
    externals: [nodeExternals()],
    entry: {
      app: [path.join(process.cwd(), './src/static.js')]
    },
    output: {
      ...config.output,
      path: path.join(process.cwd(), './build', options.locale),
      filename: 'static.js',
      libraryTarget: 'umd'
    },
    module: {
      noParse: config.module.noParse,
      loaders: config.module.loaders.concat([
        {
          test: /\.js$/,
          include: path.join(process.cwd(), './src'),
          babelrc: false,
          loader: 'babel',
          query: babelRc
        },
        {
          test: /\.css$/,
          include: path.join(process.cwd(), './src'),
          loader: 'css/locals?modules&importLoaders=1&sourceMap&localIdentName=_[local]_[hash:base64:5]'
        },
        {
          test: /\.scss$/,
          include: path.join(process.cwd(), './src'),
          loaders: [
            'css/locals?modules&importLoaders=1&sourceMap&localIdentName=_[local]_[hash:base64:5]',
            'sass?outputStyle=expanded&sourceMap'
          ]
        }
      ])
    },
    plugins: [
      new DefinePlugin({
        'process.env': {
          ...definePluginConfig,
          WINDFURY: JSON.stringify(windfuryConfig),
          IS_CLIENT: JSON.stringify(false),
          IS_SERVER: JSON.stringify(true),
          LOCALE: JSON.stringify(options.locale)
        }
      }),
      new StaticSiteGeneratorPlugin('app', paths)
    ],
    resolve: config.resolve,
    resolveLoader: config.resolveLoader
  };

  return [clientConfig, serverConfig];
}
