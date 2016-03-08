import webpack from 'webpack';
import generateProdConfig from '../webpack/generateProdConfig';
import compress from './compress';
import deploy from './deploy';
import colors from 'colors/safe';
import path from 'path';

export default function() {
  generateProdConfig(function(webpackConfig) {
    const compiler = webpack(webpackConfig);

    compiler.run(async function(err, stats) {
      let jsonStats = stats.toJson();
      let compressedFiles;

      if (err) throw err;

      if (jsonStats.errors.length > 0) console.log(colors.red(jsonStats.errors));
      if (jsonStats.warnings.length > 0) console.log(colors.yellow(jsonStats.warnings));

      console.log(colors.green('webpack build done'));

      compressedFiles = await compress();
      deploy(compressedFiles);
    });
  });
}
