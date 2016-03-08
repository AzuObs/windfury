import {IgnorePlugin, DefinePlugin, optimize} from 'webpack';
import fs from 'fs';
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import recursive from 'recursive-readdir';
import path from 'path';
import autoprefixer from 'autoprefixer';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const babelrc = fs.readFileSync(path.join(process.cwd(), './.babelrc'));
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
const documentsDir = path.join(process.cwd(), './src/documents');
const distDir = path.join(process.cwd(), './dist');

let babelLoaderQuery = {};

try {
  babelLoaderQuery = JSON.parse(babelrc);
} catch (error) {
  console.error('ERROR: Error parsing .babelrc.');
  console.error(error);
}

export default function(done) {
  let webpackConfig;
  let paths = ['/'];

  recursive(documentsDir, ['src/*'], (err, files) => {
    let documentPath;

    files.map((file) => {
      documentPath = file.replace(new RegExp(documentsDir), '');
      documentPath = `${path.dirname(documentPath)}/`;

      if (paths.indexOf(documentPath) === -1) paths.push(documentPath);
    });

    webpackConfig = {
      context: path.join(process.cwd(), './src'),
      entry: {
        main: [path.join(process.cwd(), './src/index.js')],
        async: [path.join(process.cwd(), './src/async.js')]
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
            include: path.join(process.cwd(), './src')
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
            loader: 'url?limit=10000&name=[path][name]-[hash].[ext]'
          },
          {
            test: /\.eot$/,
            loader: 'file?name=[path][name]-[hash].[ext]'
          },
          {
            test: /\.(jpg|png|gif|svg)$/,
            loaders: [
              'url?limit=10000&name=[path][name]-[hash].[ext]',
              'image-webpack?optimizationLevel=7&interlaced=true&progressive=true'
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
        new DefinePlugin({
          'process.env': {
            NODE_ENV: JSON.stringify('production')
          },
          __STATIC__: true
        }),
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
            from: path.join(process.cwd(), './src/robots.txt'),
            to: path.join(process.cwd(), './dist/robots.txt')
          },
          {
            from: path.join(process.cwd(), './src/sitemap.xml'),
            to: path.join(process.cwd(), './dist/sitemap.xml')
          },
          {
            from: path.join(process.cwd(), './src/favicon.ico'),
            to: path.join(process.cwd(), './dist/favicon.ico')
          }
        ])
      ],
      resolve: {
        modulesDirectories: ['src', 'node_modules'],
        extensions: ['', '.js', '.json']
      },
      postcss: function() {
        return [autoprefixer];
      }
    };

    done(webpackConfig);
  });
}
