import logatim from 'logatim';
import webpack from 'webpack';
import generateProdConfig from '../webpack/createProdConfig';
import compress from '../tasks/compress';
import deploy from '../tasks/deploy';

/**
 * Build with locales configuration.
 *
 * @param {Object} config
 * @param {Array} paths
 * @param {Boolean} hasDeployment
 * @param {String} locale
 * @returns {Boolean}
 */
export default function(config, paths, hasDeployment, locale = null) {
  const webpackConfig = generateProdConfig(config, locale, paths);
  const compiler = webpack(webpackConfig);

  if (locale) {
    logatim.white('Running sources compilation for the ').blue(locale).white(' website\'s variation.').info();
  } else {
    logatim.white('Running sources compilation.').info();
  }

  return compiler.run(async (err, stats) => {
    const jsonStats = stats.toJson();

    if (err) throw err;
    if (jsonStats.errors.length > 0) logatim.error(jsonStats.errors);
    if (jsonStats.warnings.length > 0) logatim.info(jsonStats.warnings);

    const compressedFiles = await compress(locale, config);

    logatim.white(`There is ${compressedFiles.length} file(s) gzipped.`).info();

    if (hasDeployment) deploy(locale, compressedFiles, config);

    return jsonStats;
  });
}
