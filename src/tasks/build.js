import webpack from 'webpack';

import run from '../helpers/run';
import copy from './copy';
import clean from './clean';
import {locales} from '../utils/Config';

/**
 * Build production-ready sources.
 *
 * @param {Object} options
 * @returns {Promise}
 */
export default async function build(options) {
  const setWebpackProdConfig = require('../webpack/setProdConfig').default;

  await run(clean);
  await run(copy, {
    isBuild: options.isBuild
  });
  await new Promise(resolve => {
    let resolvedCount = 0;

    locales.map(locale => {
      const webpackConfig = setWebpackProdConfig({
        ...options,
        locale
      });

      return webpack(webpackConfig, () => {
        resolvedCount++;

        if (resolvedCount === locales.length) resolve();
      });
    });
  });
}
