import webpack from 'webpack';
import path from 'path';
import browserSync from 'browser-sync';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import hygienistMiddleware from 'hygienist-middleware';
import debugLib from 'debug';
import generateDevConfig from '../webpack/generateDevConfig';

export default function() {
  const debug = debugLib('watch');
  const browserSyncServer = browserSync.create();

  generateDevConfig((webpackConfig) => {
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

    browserSyncServer.init(browserSyncServerOpts, () => debug('browsersync server running'));
  });
}
