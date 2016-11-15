import fs from 'fs-extra';
import path from 'path';

/**
 * Setup Babel configuration.
 *
 * @returns {Promise}
 */
export default async function setupBabel() {
  return await new Promise(resolve => {
    fs.copySync(path.join(process.cwd(), './.babelrc'), path.join(__dirname, '../utils/setup/babelrc'));

    resolve();
  });
}
