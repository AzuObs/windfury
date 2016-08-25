import path from 'path';
import fs from 'fs-extra';

import {locales} from '../utils/Config';

/**
 * Copy non-versionable static sources to build directory.
 *
 * @param {Boolean} isBuild
 *
 * @returns {Promise}
 */
export default function copy(isBuild = false) {
  return new Promise(resolve => {
    const srcFiles = [
      './favicon.ico',
      './sitemap.xml',
      './robots.txt'
    ];

    if (isBuild) {
      locales.map(locale =>
        srcFiles.map(file =>
          fs.copySync(path.join(process.cwd(), './src', file), path.join(process.cwd(), './build', locale, file))));
    } else {
      srcFiles.map(file =>
        fs.copySync(path.join(process.cwd(), './src', file), path.join(process.cwd(), './build', file)));
    }

    return resolve();
  });
}
