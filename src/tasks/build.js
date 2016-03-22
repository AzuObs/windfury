import webpack from 'webpack';
import path from 'path';
import winston from 'winston';
import yaml from 'js-yaml';
import fs from 'fs';
import generateProdConfig from '../webpack/generateProdConfig';
import compress from './compress';
import deploy from './deploy';

function runCompiler(webpackConfig, locale, hasDeployment, config) {
  const compiler = webpack(webpackConfig);

  winston.info(`Running sources compilation for the ${locale} website's variation.`);

  compiler.run(async (err, stats) => {
    const jsonStats = stats.toJson();

    if (err) throw err;
    if (jsonStats.errors.length > 0) winston.error(jsonStats.errors);
    if (jsonStats.warnings.length > 0) winston.info(jsonStats.warnings);

    const compressedFiles = await compress(locale);

    winston.info(`There is ${compressedFiles.length} file(s) gzipped.`);

    if (hasDeployment) deploy(locale, compressedFiles, config);

    return jsonStats;
  });
}

export default function(hasDeployment) {
  let config = {};

  try {
    config = yaml.safeLoad(fs.readFileSync(path.join(process.cwd(), './config.yml')));
  } catch (exception) {
    throw new Error('Missing website configuration file. Please specify a config.yml in your ' +
      'project root with the mandatory options.');
  }

  if (!config.locales || !config.aws.bucket || !config.aws.region) {
    throw new Error('Missing mandatory configuration in config.yml. Please check the corresponding ' +
      'documentation: https://mapleinside.github.io/windfury/configuration.');
  }

  config.locales.map((locale) => generateProdConfig({locale, hasDeployment, config}, runCompiler));
}
