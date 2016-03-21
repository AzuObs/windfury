import webpack from 'webpack';
import path from 'path';
import winston from 'winston';
import yaml from 'js-yaml';
import fs from 'fs';
import generateProdConfig from '../webpack/generateProdConfig';
import compress from './compress';

function runCompiler(webpackConfig) {
  const compiler = webpack(webpackConfig);

  compiler.run((err, stats) => {
    const jsonStats = stats.toJson();

    if (err) throw err;
    if (jsonStats.errors.length > 0) winston.error(jsonStats.errors);
    if (jsonStats.warnings.length > 0) winston.info(jsonStats.warnings);

    winston.info('webpack build done');

    return compress();
  });
}

export default function() {
  let config = {};

  try {
    config = yaml.safeLoad(fs.readFileSync(path.join(process.cwd(), './config.yml')));
  } catch (exception) {
    winston.error(exception);
  }

  config.locales.map((locale) => generateProdConfig({locale}, runCompiler));
}
