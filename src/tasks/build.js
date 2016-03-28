import webpack from 'webpack';
import path from 'path';
import logatim from 'logatim';
import yaml from 'js-yaml';
import fs from 'fs';
import generateProdConfig from '../webpack/generateProdConfig';
import compress from './compress';
import deploy from './deploy';

function runCompiler(webpackConfig, locale, hasDeployment, config) {
  const compiler = webpack(webpackConfig);

  logatim.white('Running sources compilation for the ').blue(locale).white(' website\'s variation.').info();

  compiler.run(async (err, stats) => {
    const jsonStats = stats.toJson();

    if (err) throw err;
    if (jsonStats.errors.length > 0) logatim.error(jsonStats.errors);
    if (jsonStats.warnings.length > 0) logatim.info(jsonStats.warnings);

    const compressedFiles = await compress(locale);

    logatim.white(`There is ${compressedFiles.length} file(s) gzipped.`).info();

    if (hasDeployment) deploy(locale, compressedFiles, config);

    return jsonStats;
  });
}

export default function(hasDeployment) {
  let config = {};

  try {
    config = yaml.safeLoad(fs.readFileSync(path.join(process.cwd(), './windfury.yml')));
  } catch (exception) {
    throw new Error('Missing website configuration file. Please specify a windfury.yml in your ' +
      'project root with the mandatory options.');
  }

  if (!config.locales || !config.aws.bucket || !config.aws.region) {
    throw new Error('Missing mandatory configuration in windfury.yml. Please check the corresponding ' +
      'documentation: https://mapleinside.github.io/windfury/configuration.');
  }

  config.locales.map((locale) => generateProdConfig({locale, hasDeployment, config}, runCompiler));
}
