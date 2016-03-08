import webpack from 'webpack';
import generateProdConfig from './webpack/generateProdConfig';
import runPostBuild from './runPostBuild';
import colors from 'colors/safe';
import path from 'path';

generateProdConfig(function(webpackConfig) {
  const compiler = webpack(webpackConfig);

  compiler.run(function(err, stats) {
    let jsonStats = stats.toJson();

    if (err) throw err;

    if (jsonStats.errors.length > 0) console.log(colors.red(jsonStats.errors));
    if (jsonStats.warnings.length > 0) console.log(colors.yellow(jsonStats.warnings));

    console.log(colors.green('webpack build done'));
  });
});
