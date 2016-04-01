import webpack from 'webpack';
import path from 'path';
import browserSync from 'browser-sync';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import hygienistMiddleware from 'hygienist-middleware';
import logatim from 'logatim';
import fs from 'fs';
import createDevConfig from '../webpack/createDevConfig';
import extractRoutePaths from '../helpers/extractRoutePaths';
import writePathsFile from '../helpers/writePathsFile';
import copyBoilerplates from '../helpers/copyBoilerplates';

/**
 * Run development build then watch for file changes.
 *
 * @param {Object} config
 */
export default function(config) {
  const browserSyncServer = browserSync.create();

  return extractRoutePaths(config, paths => {
    copyBoilerplates(config);
    fs.writeFileSync(
      path.join(process.cwd(), config.srcPath, config.buildDirName, 'paths.json'), JSON.stringify(paths)
    );

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
            quiet: true,
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
      files: [
        path.join(process.cwd(), `./${config.distPath}/**/*.html`),
        path.join(process.cwd(), `./${config.distPath}/**/*.css`)
      ]
    };

    browserSyncServer
      .watch(path.join(process.cwd(), `${config.srcPath}/documents/**/index.js`), (event, file) => {
        let routePath = file.replace(path.join(process.cwd(), `${config.srcPath}/documents`), '');

        routePath = routePath.replace('index.js', '');
        writePathsFile(config, paths, routePath, event);
      });

    return browserSyncServer.init(browserSyncServerOpts, () => logatim.info('Development server is running.'));
  });
}
