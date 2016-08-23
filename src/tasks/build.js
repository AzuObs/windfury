import webpack from 'webpack';

import run from '../helpers/run';
import copy from './copy';
import clean from './clean';

/**
 * Build production-ready sources.
 *
 * @param {Object} options
 * @returns {Promise}
 */
export default async function build(options) {
  const setWebpackProdConfig = require('../webpack/setProdConfig').default;
  const webpackConfig = setWebpackProdConfig(options);

  await run(clean);
  await run(copy);
  await new Promise(resolve => webpack(webpackConfig, () => resolve()));
}
