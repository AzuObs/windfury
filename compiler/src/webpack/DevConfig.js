import path from 'path';
import webpack from 'webpack';
import fs from 'fs';
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin';

const babelrc = fs.readFileSync(path.join(process.cwd(), '.babelrc'));
const paths = ['/', '/about/'];

let babelLoaderQuery = {};

try {
  babelLoaderQuery = JSON.parse(babelrc);
} catch (error) {
  console.error('ERROR: Error parsing .babelrc.');
  console.error(error);
}

export default {
  devtool: 'inline-source-map',
  context: path.join(process.cwd(), './src'),
  entry: {
    main: [path.join(process.cwd(), './src/index.js')],
    async: [path.join(process.cwd(), './src/async.js')]
  },
  output: {
    path: path.join(process.cwd(), 'dist'),
    filename: 'website-[hash].js',
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
        loaders: [
          'style',
          'css?modules&importLoaders=2&sourceMap&localIdentName=[local]',
          'sass?outputStyle=expanded&sourceMap'
        ]
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
        loader: 'url?limit=10000&name=[path][name]-[hash].[ext]'
      }
    ]
  },
  progress: true,
  watch: true,
  plugins: [
    new webpack.IgnorePlugin(/webpack-stats\.json$/),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    }),
    new StaticSiteGeneratorPlugin('main', paths)
  ],
  resolve: {
    modulesDirectories: ['src', 'node_modules'],
    extensions: ['', '.js', '.json']
  }
};
