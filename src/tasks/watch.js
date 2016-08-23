import webpack from 'webpack';
import BrowserSync from 'browser-sync';
import webpackMiddleware from 'webpack-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import runServer from '../helpers/runServer';
import run from '../helpers/run';
import copy from './copy';
import clean from './clean';

/**
 * Run a development server then watch for files changes using live-reload and HMR.
 *
 * @param {Object} options
 * @returns {Promise}
 */
export default async function watch(options) {
  const {appPort} = require('../utils/Config');
  const setWebpackDevConfig = require('../webpack/setDevConfig').default;
  const webpackConfig = setWebpackDevConfig(options);

  await run(clean);
  await run(copy);
  await new Promise(resolve => {
    const bundler = webpack(webpackConfig);
    const webpackMiddlewareInstance = webpackMiddleware(bundler, {
      publicPath: webpackConfig[0].output.publicPath,
      stats: webpackConfig[0].stats
    });
    const hotMiddleWares = bundler
      .compilers
      .filter(compiler => compiler.options.target !== 'node')
      .map(compiler => webpackHotMiddleware(compiler));

    let handleServerBundleComplete = () => {
      runServer((err, host) => {
        if (!err) {
          const bs = BrowserSync.create();

          bs.init({
            ui: {
              port: appPort + 2
            },
            port: appPort + 1,
            proxy: {
              target: host,
              middleware: [webpackMiddlewareInstance, ...hotMiddleWares]
            },
            files: []
          });
          handleServerBundleComplete = runServer;

          process.on('SIGINT', () => {
            resolve();
            process.exit();
            bs.exit();
          });
        }
      });
    };

    bundler
      .compilers
      .find(x => x.options.target === 'node')
      .plugin('done', () => handleServerBundleComplete());
  });
}
