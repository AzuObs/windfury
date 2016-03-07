import webpack from 'webpack';
import generateDevConfig from './webpack/generateDevConfig';
import runPostBuild from './runPostBuild';
import colors from 'colors/safe';

generateDevConfig(function(webpackConfig) {
  const compiler = webpack(webpackConfig);

  compiler.watch({}, function(err, stats) {
    let jsonStats = stats.toJson();

    if (err) throw err;

    if (jsonStats.errors.length > 0) console.log(colors.red(jsonStats.errors));
    if (jsonStats.warnings.length > 0) console.log(colors.yellow(jsonStats.warnings));

    console.log(colors.green('webpack build done'));
    runPostBuild(webpackConfig.entry);
  });
});
