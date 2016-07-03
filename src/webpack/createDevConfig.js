import {IgnorePlugin, DefinePlugin, HotModuleReplacementPlugin, NoErrorsPlugin, optimize} from 'webpack';
import path from 'path';
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin';
import autoprefixer from 'autoprefixer';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import WatchIgnorePlugin from 'watch-ignore-webpack-plugin';

import createBabelLoaderQuery from '../helpers/createBabelLoaderQuery';
import createDefinePluginOpts from '../helpers/createDefinePluginOpts';

/**
 * Create the Webpack development config.
 *
 * @param {Object} config
 * @param {Array} paths
 * @returns {Object}
 */
export default function(config, paths) {
  const babelLoaderQuery = createBabelLoaderQuery(config);
  const definePluginOpts = createDefinePluginOpts(config);

  return {
    devtool: 'inline-source-map',
    context: path.join(process.cwd(), config.srcPath),
    entry: {
      main: [
        'webpack-hot-middleware/client',
        path.join(process.cwd(), './src/index.js')
      ],
      async: [
        'webpack-hot-middleware/client',
        path.join(process.cwd(), config.asyncEntryPoint)
      ]
    },
    output: {
      path: path.join(process.cwd(), config.distPath),
      filename: '[name]-[hash].js',
      libraryTarget: 'umd',
      publicPath: `${config.developmentEndpoint}/`
    },
    module: {
      loaders: [
        {
          test: /\.md$/,
          loaders: ['html', 'markdown']
        },
        {
          test: /\.js$/,
          loader: `babel?${JSON.stringify(babelLoaderQuery)}`,
          include: path.join(process.cwd(), config.srcPath)
        },
        {
          test: /\.css$/,
          loaders: [
            'style',
            'css?modules&importLoaders=2&sourceMap&localIdentName=[local]',
            'postcss',
            'resolve-url'
          ]
        },
        {
          test: /\.scss$/,
          loaders: [
            'style',
            'css?modules&importLoaders=2&sourceMap&localIdentName=[local]',
            'postcss',
            'resolve-url',
            'sass?outputStyle=expanded&sourceMap'
          ]
        },
        {
          test: /\.(woff|woff2|ttf)$/,
          loader: `url?limit=${config.base64MaximumSize}&name=[path][name].[ext]`
        },
        {
          test: /\.eot$/,
          loader: 'file?name=[path][name].[ext]'
        },
        {
          test: /\.(jpg|png|gif|svg)$/,
          loader: `url?limit=${config.base64MaximumSize}&name=[path][name].[ext]`
        },
        {
          test: /\.json$/,
          loader: 'json'
        }
      ]
    },
    progress: true,
    plugins: [
      new IgnorePlugin(/webpack-stats\.json$/),
      new DefinePlugin(definePluginOpts),
      new optimize.OccurenceOrderPlugin(),
      new HotModuleReplacementPlugin(),
      new NoErrorsPlugin(),
      new StaticSiteGeneratorPlugin('main', paths),
      new CopyWebpackPlugin([
        {
          from: path.join(process.cwd(), `${config.srcPath}/robots.txt`),
          to: './robots.txt'
        },
        {
          from: path.join(process.cwd(), `${config.srcPath}/sitemap.xml`),
          to: './sitemap.xml'
        },
        {
          from: path.join(process.cwd(), `${config.srcPath}/favicon.ico`),
          to: './favicon.ico'
        }
      ]),
      new WatchIgnorePlugin([path.join(process.cwd(), './src/helpers/createRoutes.js')])
    ],
    resolve: {
      modulesDirectories: [config.srcPath, './node_modules'],
      extensions: ['', '.js', '.json']
    },
    postcss() {
      return [autoprefixer({
        browsers: config.autoprefixer
      })];
    }
  };
}
