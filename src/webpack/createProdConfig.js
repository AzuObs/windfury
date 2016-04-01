import {IgnorePlugin, DefinePlugin, optimize} from 'webpack';
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import path from 'path';
import autoprefixer from 'autoprefixer';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import createBabelLoaderQuery from '../helpers/createBabelLoaderQuery';
import createDefinePluginOpts from '../helpers/createDefinePluginOpts';

/**
 * Create the Webpack production config.
 *
 * @param {Object} config
 * @param {String} locale
 * @param {Array} paths
 * @returns {Object}
 */
export default function(config, locale, paths) {
  const babelLoaderQuery = createBabelLoaderQuery(config);
  const definePluginOpts = createDefinePluginOpts(config, locale);
  const cssLoaderQuery = {
    modules: true,
    importLoaders: 2,
    localIdentName: '[local]',
    discardComments: {
      removeAll: true
    },
    reduceTransforms: false,
    zindex: false
  };
  const distDir = path.join(process.cwd(), config.distPath, `./${locale}`);

  return {
    context: path.join(process.cwd(), config.srcPath),
    entry: {
      main: [path.join(process.cwd(), config.srcPath, config.buildDirName, 'index.js')],
      async: [path.join(process.cwd(), config.asyncEntryPoint)]
    },
    output: {
      path: distDir,
      filename: '[name]-[hash].js',
      libraryTarget: 'umd',
      publicPath: '/'
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
            `css?${JSON.stringify(cssLoaderQuery)}`,
            'postcss',
            'resolve-url'
          ]
        },
        {
          test: /\.scss$/,
          loader: ExtractTextPlugin.extract(
            'style',
            [
              `css?${JSON.stringify(cssLoaderQuery)}`,
              'postcss',
              'resolve-url',
              'sass?outputStyle=expanded&sourceMap'
            ]
          )
        },
        {
          test: /\.(woff|woff2|ttf)$/,
          loader: `url?limit=${config.base64MaximumSize}&name=[path][name]-[hash].[ext]`
        },
        {
          test: /\.eot$/,
          loader: 'file?name=[path][name]-[hash].[ext]'
        },
        {
          test: /\.(jpg|png|gif|svg)$/,
          loaders: [
            `url?limit=${config.base64MaximumSize}&name=[path][name]-[hash].[ext]`,
            `image-webpack?optimizationLevel=${config.gzipCompressionLevel}&interlaced=true&progressive=true`
          ]
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
      new CleanWebpackPlugin([distDir], {
        root: process.cwd()
      }),
      new ExtractTextPlugin('main-[chunkhash].css', {
        allChunks: true
      }),
      new StaticSiteGeneratorPlugin('main', paths),
      new optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      }),
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
      ])
    ],
    resolve: {
      modulesDirectories: ['src', 'node_modules'],
      extensions: ['', '.js', '.json']
    },
    postcss() {
      return [autoprefixer];
    }
  };
}
