import webpack from 'webpack';
import webpackConfig from './webpack/DevConfig';
import runPostBuild from './runPostBuild';

const compiler = webpack(webpackConfig);

compiler.watch({}, function(err, stats) {
  if (err) console.error(err);

  console.info(stats.toString());

  runPostBuild(webpackConfig.entry);
});
