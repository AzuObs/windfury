import webpack from 'webpack';
import generateDevConfig from './webpack/generateDevConfig';
import runPostBuild from './runPostBuild';

generateDevConfig(function(webpackConfig) {
  const compiler = webpack(webpackConfig);

  compiler.watch({}, function(err, stats) {
    if (err) console.error(err);

    console.info(stats.toString());

    runPostBuild(webpackConfig.entry);
  });
});
