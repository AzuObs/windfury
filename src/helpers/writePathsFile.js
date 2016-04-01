import path from 'path';
import fs from 'fs';
import _ from 'lodash';

/**
 * Write paths configuration file into the build directory.
 *
 * @param {Object} config
 * @param {Array} paths
 * @param {String} routePath
 * @param {String} event
 * @returns {Array}
 */
export default function(config, paths, routePath, event) {
  let routePaths = _.clone(paths);

  if (event === 'add' || event === 'unlink') {
    switch (event) {
      case 'add':
        if (routePaths.indexOf(routePath) === -1) routePaths = routePaths.concat(routePath);

        break;
      default:
        routePaths.splice(routePaths.indexOf(routePath), 1);
    }

    fs.writeFileSync(
      path.join(process.cwd(), config.srcPath, config.buildDirName, 'paths.json'), JSON.stringify(routePaths)
    );
  }

  return routePaths;
}
