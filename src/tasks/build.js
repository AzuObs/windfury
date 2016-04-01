import webpack from 'webpack';
import logatim from 'logatim';
import fs from 'fs';
import path from 'path';
import generateProdConfig from '../webpack/createProdConfig';
import compress from './compress';
import deploy from './deploy';
import extractRoutePaths from '../helpers/extractRoutePaths';
import copyBoilerplates from '../helpers/copyBoilerplates';

/**
 * Run the production build.
 *
 * @param {Object} config
 * @param {Boolean} hasDeployment
 */
export default function(config, hasDeployment = false) {
  return extractRoutePaths(config, paths => {
    fs.writeFileSync(
      path.join(process.cwd(), config.srcPath, config.buildDirName, 'paths.json'), JSON.stringify(paths)
    );
    copyBoilerplates(config);

    config.locales.map(locale => {
      const webpackConfig = generateProdConfig(config, locale, paths);
      const compiler = webpack(webpackConfig);

      logatim.white('Running sources compilation for the ').blue(locale).white(' website\'s variation.').info();

      return compiler.run(async (err, stats) => {
        const jsonStats = stats.toJson();

        if (err) throw err;
        if (jsonStats.errors.length > 0) logatim.error(jsonStats.errors);
        if (jsonStats.warnings.length > 0) logatim.info(jsonStats.warnings);

        const compressedFiles = await compress(locale);

        logatim.white(`There is ${compressedFiles.length} file(s) gzipped.`).info();

        if (hasDeployment) deploy(locale, compressedFiles, config);

        return jsonStats;
      });
    });
  });
}
