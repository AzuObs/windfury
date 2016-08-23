import rimraf from 'rimraf';
import path from 'path';

/**
 * Clean build directory.
 *
 * @returns {Promise}
 */
export default function clean() {
  return new Promise(resolve => {
    rimraf.sync(path.join(__dirname, '../../.cache'), {});

    return rimraf(path.join(process.cwd(), './build'), {}, () => resolve());
  });
}
