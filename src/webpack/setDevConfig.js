import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import AssetsPlugin from 'assets-webpack-plugin';
import autoprefixer from 'autoprefixer';
import nodeExternals from 'webpack-node-externals';
import _ from 'lodash';

import resolveEnvConfig from '../helpers/resolveEnvConfig';
import * as windfuryConfig from '../utils/Config';

const HotModuleReplacementPlugin = webpack.HotModuleReplacementPlugin;
const OccurenceOrderPlugin = webpack.optimize.OccurenceOrderPlugin;
const NoErrorsPlugin = webpack.NoErrorsPlugin;
const DefinePlugin = webpack.DefinePlugin;
const DedupePlugin = webpack.optimize.DedupePlugin;
const AggressiveMergingPlugin = webpack.optimize.AggressiveMergingPlugin;
const babelRc = JSON.parse(fs.readFileSync(path.join(process.cwd(), './.babelrc')));

babelRc.cacheDirectory = path.join(__dirname, '../../.cache');

const clientBabelRc = _.cloneDeep(babelRc);

clientBabelRc.plugins = clientBabelRc.plugins || [];
clientBabelRc.presets = clientBabelRc.presets || [];
clientBabelRc.plugins.push(['babel-plugin-react-transform', {
  transforms: [
    {
      transform: 'react-transform-hmr',
      imports: ['react'],
      locals: ['module']
    },
    {
      transform: 'react-transform-catch-errors',
      imports: ['react', 'redbox-react']
    }
  ]
}]);
clientBabelRc.presets.push('babel-preset-react-hmre');

/**
 * Set Webpack development configuration.
 *
 * @param {Object} options
 * @returns {Array}
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
    cache: true,
    output: {
      publicPath: `http://localhost:${windfuryConfig.appPort + 1}/build/`
    },
    module: {
      loaders: [
        {
          test: /\.json$/,
          include: path.join(process.cwd(), './src'),
          loader: 'json'
        },
        {
          test: /\.(png|jpg|jpg|gif|svg|woff|woff2|eot)/,
          include: path.join(process.cwd(), './src'),
          loader: 'file'
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
    }
  };
  const clientConfig = {
    context: path.join(process.cwd(), './build'),
    devtool: 'inline-eval-cheap-source-map',
    target: 'web',
    name: 'client',
    cache: config.cache,
    entry: {
      app: ['webpack-hot-middleware/client', path.join(__dirname, '../utils/entry-points/client.js')],
      async: ['webpack-hot-middleware/client', path.join(__dirname, '../utils/entry-points/async.js')]
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
          test: /\.js$/,
          include: path.join(process.cwd(), './src'),
          loader: 'babel',
          babelrc: false,
          query: clientBabelRc
        },
        {
          test: /\.css$/,
          include: path.join(process.cwd(), './src'),
          loaders: [
            'style',
            'css?modules&importLoaders=1&sourceMap&localIdentName=_[local]_[hash:base64:5]',
            'postcss'
          ]
        },
        {
          test: /\.scss$/,
          include: path.join(process.cwd(), './src'),
          loaders: [
            'style',
            'css?modules&importLoaders=1&sourceMap&localIdentName=_[local]_[hash:base64:5]',
            'postcss',
            'sass?outputStyle=expanded&sourceMap'
          ]
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
    plugins: [
      new OccurenceOrderPlugin(),
      new HotModuleReplacementPlugin(),
      new NoErrorsPlugin(),
      new DedupePlugin(),
      new DefinePlugin({
        'process.env': {
          ...definePluginConfig,
          windfury: JSON.stringify(windfuryConfig),
          isClient: JSON.stringify(true),
          isServer: JSON.stringify(false)
        }
      }),
      new AggressiveMergingPlugin(),
      new AssetsPlugin({
        path: path.join(process.cwd(), './build')
      })
    ],
    postcss: () => [autoprefixer({
      browsers: windfuryConfig.autoprefixerBrowsers
    })],
    resolve: config.resolve,
    resolveLoader: config.resolveLoader
  };
  const serverConfig = {
    context: path.join(process.cwd(), './build'),
    name: 'server',
    target: 'node',
    cache: config.cache,
    externals: [nodeExternals()],
    entry: [path.join(__dirname, '../utils/entry-points/server.js')],
    output: {
      ...config.output,
      path: path.join(process.cwd(), './build'),
      filename: 'index.js',
      libraryTarget: 'commonjs2'
    },
    module: {
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
          IS_SERVER: JSON.stringify(true)
        }
      })
    ],
    resolve: config.resolve,
    resolveLoader: config.resolveLoader
  };

  return [clientConfig, serverConfig];
}
