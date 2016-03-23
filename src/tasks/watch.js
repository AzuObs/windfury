import webpack from 'webpack';
import path from 'path';
import browserSync from 'browser-sync';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import hygienistMiddleware from 'hygienist-middleware';
import logatim from 'logatim';
import fs from 'fs';
import generateDevConfig from '../webpack/generateDevConfig';

export default function() {
  const browserSyncServer = browserSync.create();

  generateDevConfig((webpackConfig, paths) => {
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

    let routePaths = paths;

    function writePathsFile(routePath, event) {
      switch (event) {
        case 'add':
          if (routePaths.indexOf(routePath) === -1) routePaths = routePaths.concat(routePath);

          break;
        default:
          routePaths.splice(routePaths.indexOf(routePath), 1);
      }

      fs.writeFileSync(path.join(process.cwd(), './src/build/paths.json'), JSON.stringify(routePaths));
    }

    browserSyncServer
      .watch(path.join(process.cwd(), './src/documents/**/layout.js'), (event, file) => {
        let routePath = file.replace(path.join(process.cwd(), './src/documents'), '');

        routePath = routePath.replace('layout.js', '');

        if (event === 'add' || event === 'unlink') writePathsFile(routePath, event);
      });

    return browserSyncServer.init(browserSyncServerOpts, () => logatim.info('Development server is running.'));
  });
}
