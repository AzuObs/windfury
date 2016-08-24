import path from 'path';
import fs from 'fs-extra';

/**
 * Copy non-versionable static sources to build directory.
 *
 * @returns {Promise}
 */
export default function copy() {
  return new Promise(resolve => {
    const srcFiles = [
      './favicon.ico',
      './sitemap.xml',
      './robots.txt'
    ];

    srcFiles.map(file =>
      fs.copySync(path.join(process.cwd(), './src', file), path.join(process.cwd(), './build', file)));

    return resolve();
  });
}
