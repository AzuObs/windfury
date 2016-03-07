import webpack from 'webpack';
import generateDevConfig from './webpack/generateDevConfig';
import WebpackDevServer from 'webpack-dev-server';
import colors from 'colors';
import path from 'path';

const port = 3000;

generateDevConfig(function(webpackConfig) {
  const compiler = webpack(webpackConfig);
  const server = new WebpackDevServer(compiler, {
    contentBase: path.join(process.cwd(), './dist'),
    publicPath: webpackConfig.output.publicPath,
    noInfo: true,
    inline: true,
    stats: {
      colors: true
    },
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  });

  server.listen(port, 'localhost', (err) => {
    if (err) throw err;

    console.log(colors.blue(`webpack dev server is running on http://localhost:${port}`));
  });
});
