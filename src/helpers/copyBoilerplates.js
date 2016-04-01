import fs from 'fs';
import {copyDirSyncRecursive} from 'wrench';
import path from 'path';

/**
 * Copy boilerplates to the build directory.
 *
 * @param {Object} config
 * @returns {Boolean}
 */
export default function(config) {
  const buildPath = `${config.srcPath}/${config.buildDirName}`;

  if (!fs.existsSync(buildPath)) fs.mkdirSync(buildPath);

  return copyDirSyncRecursive(path.join(__dirname, '../../boilerplates'), buildPath, {
    forceDelete: true
  });
}
