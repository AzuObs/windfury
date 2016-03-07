import {
  IgnorePlugin,
  DefinePlugin,
  HotModuleReplacementPlugin,
  NoErrorsPlugin,
  optimize
} from 'webpack';
import fs from 'fs';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import AssetsPlugin from 'assets-webpack-plugin';
import path from 'path';
import recursive from 'recursive-readdir';
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin';

const babelrc = fs.readFileSync(path.join(process.cwd(), '.babelrc'));

let babelLoaderQuery = {};

try {
  babelLoaderQuery = JSON.parse(babelrc);
} catch (error) {
  console.error('ERROR: Error parsing .babelrc.');
  console.error(error);
}

babelLoaderQuery.plugins = babelLoaderQuery.plugins || [];
babelLoaderQuery.plugins.push(['react-transform', {
  transforms: [{
    transform: 'react-transform-hmr',
    imports: ['react'],
    locals: ['module']
  }]
}]);

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
      devtool: 'inline-source-map',
      context: path.join(process.cwd(), './src'),
      entry: {
        main: ['webpack-hot-middleware/client', path.join(process.cwd(), './src/index.js')],
        async: ['webpack-hot-middleware/client', path.join(process.cwd(), './src/async.js')]
      },
      output: {
        path: path.join(process.cwd(), './dist'),
        filename: '[name].js',
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
            loader: 'babel',
            include: path.join(process.cwd(), './src'),
            query: babelLoaderQuery
          },
          {
            test: /\.scss$/,
            loaders: [
              'style',
              'css?modules&importLoaders=2&sourceMap&localIdentName=[local]',
              'sass?outputStyle=expanded&sourceMap'
            ]
          },
          {
            test: /\.(woff|woff2|ttf)$/,
            loader: 'url?limit=10000&name=[path][name].[ext]'
          },
          {
            test: /\.eot$/,
            loader: 'file?name=[path][name].[ext]'
          },
          {
            test: /\.(jpg|png|gif|svg)$/,
            loader: 'url?limit=10000&name=[path][name].[ext]'
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
            NODE_ENV: JSON.stringify('development')
          }
        }),
        new AssetsPlugin(),
        new optimize.OccurenceOrderPlugin(),
        new HotModuleReplacementPlugin(),
        new NoErrorsPlugin(),
        new StaticSiteGeneratorPlugin('main', paths)
      ],
      resolve: {
        modulesDirectories: ['src', 'node_modules'],
        extensions: ['', '.js', '.json']
      }
    };

    done(webpackConfig);
  });
}
