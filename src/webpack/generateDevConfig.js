import {
  IgnorePlugin,
  DefinePlugin,
  HotModuleReplacementPlugin,
  NoErrorsPlugin,
  optimize
} from 'webpack';
import fs from 'fs';
import path from 'path';
import recursive from 'recursive-readdir';
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin';
import autoprefixer from 'autoprefixer';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import logatim from 'logatim';
import {copyDirSyncRecursive} from 'wrench';

export default function(done) {
  const babelrc = fs.readFileSync(path.join(process.cwd(), './.babelrc'));
  const documentsDir = path.join(process.cwd(), './src/documents');
  const distDir = path.join(process.cwd(), './dist');
  const paths = ['/'];
  const buildDir = path.join(process.cwd(), './src/build');

  let babelLoaderQuery = {};
  let webpackConfig = {};

  try {
    babelLoaderQuery = JSON.parse(babelrc);
  } catch (error) {
    logatim.error('ERROR: Error parsing .babelrc.', error);
  }

  babelLoaderQuery.plugins = babelLoaderQuery.plugins || [];
  babelLoaderQuery.plugins.push(['react-transform', {
    transforms: [{
      transform: 'react-transform-hmr',
      imports: ['react'],
      locals: ['module']
    }]
  }]);

  if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir);

  copyDirSyncRecursive(path.join(__dirname, '../../helpers'), buildDir, {
    forceDelete: true
  });

  recursive(documentsDir, ['index.js', '*.scss'], (err, files) => {
    let documentPath;

    files.map((file) => {
      documentPath = file.replace(new RegExp(documentsDir), '');
      documentPath = `${path.dirname(documentPath)}/`;

      if (paths.indexOf(documentPath) === -1) paths.push(documentPath);

      return file;
    });

    fs.writeFileSync(path.join(process.cwd(), './src/build/paths.json'), JSON.stringify(paths));

    webpackConfig = {
      devtool: 'inline-source-map',
      context: path.join(process.cwd(), './src'),
      entry: {
        main: ['webpack-hot-middleware/client', path.join(process.cwd(), './src/build/index.js')],
        async: ['webpack-hot-middleware/client', path.join(process.cwd(), './src/async.js')]
      },
      output: {
        path: distDir,
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
            loader: `babel?${JSON.stringify(babelLoaderQuery)}`,
            include: path.join(process.cwd(), './src')
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
          },
          __STATIC__: false,
          __LOCALE__: JSON.stringify('en')
        }),
        new optimize.OccurenceOrderPlugin(),
        new HotModuleReplacementPlugin(),
        new NoErrorsPlugin(),
        new StaticSiteGeneratorPlugin('main', paths),
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
      postcss() {
        return [autoprefixer];
      }
    };

    done(webpackConfig, paths);
  });
}
