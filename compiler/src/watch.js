import webpack from 'webpack';
import generateDevConfig from './webpack/generateDevConfig';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import browserSync from 'browser-sync';
import path from 'path';

const browserSyncServer = browserSync.create();

generateDevConfig(function(webpackConfig) {
  const compiler = webpack(webpackConfig);
  const browserSyncServerOpts = {
    open: false,
    server: {
      baseDir: path.join(process.cwd(), './dist'),
      middleware: [
        webpackDevMiddleware(compiler, {
          contentBase: path.join(process.cwd(), './dist'),
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
    files: [path.join(process.cwd(), './src/client.js')]
  };

  browserSyncServer.init(browserSyncServerOpts, (err) => {
    if (err) throw err;
  });
});
