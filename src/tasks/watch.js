import webpack from 'webpack';
import path from 'path';
import browserSync from 'browser-sync';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import hygienistMiddleware from 'hygienist-middleware';
import logatim from 'logatim';
import reactRouterToArray from 'react-router-to-array';

import createDevConfig from 'webpack/createDevConfig';

const createRoutesFilePath = path.join(process.cwd(), './src/helpers/createRoutes');

/**
 * Run development build then watch for file changes.
 *
 * @param {Object} config
 * @param {Boolean} watchRouter
 */
function watch(config, watchRouter = true) {
  const routes = require(createRoutesFilePath)();
  const browserSyncServer = browserSync.create();
  const paths = reactRouterToArray(routes);
  const webpackConfig = createDevConfig(config, paths);
  const compiler = webpack(webpackConfig);
  const browserSyncServerOpts = {
    open: config.openOnStart,
    port: config.server.port,
    server: {
      baseDir: path.join(process.cwd(), config.distPath),
      middleware: [
        hygienistMiddleware(path.join(process.cwd(), config.distPath)),
        webpackDevMiddleware(compiler, {
          contentBase: `http://localhost:${config.server.port}`,
          publicPath: webpackConfig.output.publicPath,
          noInfo: true,
          hot: true,
          inline: true,
          lazy: false,
          stats: {
            colors: true
          },
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        }),
        webpackHotMiddleware(compiler)
      ]
    },
    ui: {
      port: config.server.uiPort
    },
    files: [
      path.join(process.cwd(), `./${config.distPath}/**/*.html`),
      path.join(process.cwd(), `./${config.distPath}/**/*.css`)
    ]
  };

  return browserSyncServer.init(browserSyncServerOpts, () => {
    logatim.info('Development server is running.');

    if (watchRouter) {
      browserSyncServer.watch(path.join(process.cwd(), `${config.srcPath}/helpers/createRoutes.js`), event => {
        if (event === 'change') {
          delete require.cache[require.resolve(createRoutesFilePath)];

          logatim.info('Restart Windfury...');

          browserSyncServer.exit();
          watch(config, false);
        }
      });
    }
  });
}

export default watch;
