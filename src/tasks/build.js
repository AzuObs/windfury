import fs from 'fs';
import path from 'path';
import extractRoutePaths from '../helpers/extractRoutePaths';
import copyBoilerplates from '../helpers/copyBoilerplates';
import buildWithLocales from '../helpers/buildWithLocales';

/**
 * Run the production build.
 *
 * @param {Object} config
 * @param {Boolean} hasDeployment
 */
export default function(config, hasDeployment = false) {
  return extractRoutePaths(config, paths => {
    copyBoilerplates(config);
    fs.writeFileSync(
      path.join(process.cwd(), config.srcPath, config.buildDirName, './paths.json'), JSON.stringify(paths)
    );

    if (config.locales) {
      config.locales.map(locale => buildWithLocales(config, paths, hasDeployment, locale));
    } else {
      buildWithLocales(config, paths, hasDeployment);
    }
  });
}
