import webpack from 'webpack';
import generateDevConfig from './webpack/generateDevConfig';
import colors from 'colors';
import path from 'path';
import browserSync from 'browser-sync';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import hygienistMiddleware from 'hygienist-middleware';

const browserSyncServer = browserSync.create();

generateDevConfig(function(webpackConfig) {
  const compiler = webpack(webpackConfig);
  const browserSyncServerOpts = {
    open: false,
    server: {
      baseDir: path.join(process.cwd(), './dist'),
      middleware: [
        hygienistMiddleware(path.join(process.cwd(), './dist')),
        webpackDevMiddleware(compiler, {
          publicPath: webpackConfig.output.publicPath,
          noInfo: true,
          stats: {
            colors: true
          }
        }),
        webpackHotMiddleware(compiler)
      ]
    },
    files: [
      path.join(process.cwd(), './dist/**/*.html'),
      path.join(process.cwd(), './dist/**/*.css')
    ]
  };

  browserSyncServer.init(browserSyncServerOpts);
});
