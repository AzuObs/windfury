import cp from 'child_process';
import path from 'path';

import log from '../helpers/log';

/**
 * Watch for files change on a BFF platform.
 *
 * @returns {Promise}
 */
export default async function watch() {
  await new Promise(resolve => {
    const nodemon = cp.exec(`nodemon ${path.join(process.cwd(), './src')} --exec babel-node`);

    nodemon.stdout.on('data', data => log.info(data));
    nodemon.stderr.on('data', data => log(data));

    nodemon.on('exit', code => {
      log(code);
      resolve();
    });
  });
}
