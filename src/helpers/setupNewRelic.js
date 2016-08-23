import fs from 'fs-extra';
import path from 'path';

/**
 * Setup New Relic configuration.
 *
 * @returns {Promise}
 */
export default function setupNewRelic() {
  return new Promise(resolve => {
    fs.copySync(
      path.join(__dirname, '../utils/new-relic/new-relic.js'), path.join(process.cwd(), './build/newrelic.js')
    );
    fs.copySync(
      path.join(
        __dirname, '../utils/new-relic/new-relic.config'),
        path.join(process.cwd(), './build/eb/.ebextensions/newrelic.config'
      )
    );

    resolve();
  });
}
