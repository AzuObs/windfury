import webpack from 'webpack';
import fs from 'fs';
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import AssetsPlugin from 'assets-webpack-plugin';
import recursive from 'recursive-readdir';
import path from 'path';

const babelrc = fs.readFileSync(path.join(process.cwd(), '.babelrc'));

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

  recursive(path.join(process.cwd(), './src/documents'), ['src/*'], (err, files) => {
    let documentPath;

    files.map((file) => {
      documentPath = file.replace(new RegExp(path.join(process.cwd(), './src/documents')), '');
      documentPath = `${path.dirname(documentPath)}/`;

      if (paths.indexOf(documentPath) === -1) {
        paths.push(documentPath);
      }
    });

    webpackConfig = {
      context: path.join(process.cwd(), './src'),
      entry: {
        main: [path.join(process.cwd(), './src/static.js')],
        async: [path.join(process.cwd(), './src/async.js')]
      },
      output: {
        path: path.join(process.cwd(), 'dist'),
        filename: '[name]-[hash].js',
        libraryTarget: 'umd'
      },
      module: {
        loaders: [
          {
            test: /\.md$/,
            loaders: ['html', 'markdown']
          },
          {
            test: /\.js$/,
            loader: 'babel',
            include: path.join(process.cwd(), './src'),
            query: babelLoaderQuery
          },
          {
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract(
              'style',
              ['css?modules&importLoaders=2&sourceMap&localIdentName=[local]', 'sass?outputStyle=expanded&sourceMap']
            )
          },
          {
            test: /\.(woff|woff2|ttf)$/,
            loader: 'url?limit=10000&name=/[path][name]-[hash].[ext]'
          },
          {
            test: /\.eot$/,
            loader: 'file?name=/[path][name]-[hash].[ext]'
          },
          {
            test: /\.(jpg|png|gif|svg)$/,
            loader: 'url?limit=10000&name=/[path][name]-[hash].[ext]'
          },
          {
            test: /\.json$/,
            loader: 'json'
          }
        ]
      },
      progress: true,
      watch: true,
      plugins: [
        new webpack.IgnorePlugin(/webpack-stats\.json$/),
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: JSON.stringify('production')
          }
        }),
        new StaticSiteGeneratorPlugin('main', paths),
        new CleanWebpackPlugin([path.join(process.cwd(), './dist')], {
          root: process.cwd()
        }),
        new ExtractTextPlugin('main-[chunkhash].css'),
        new AssetsPlugin()
      ],
      resolve: {
        modulesDirectories: ['src', 'node_modules'],
        extensions: ['', '.js', '.json']
      }
    };

    done(webpackConfig);
  });
}
