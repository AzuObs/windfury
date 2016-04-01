import fs from 'fs';
import path from 'path';

/**
 * Create the Babel Loader configuration.
 *
 * @param {Object} config
 * @param {String} env
 * @returns {Object}
 */
export default function(config, env = 'development') {
  const babelrc = fs.readFileSync(path.join(process.cwd(), config.babelConfigPath));

  let babelLoaderQuery = {};

  try {
    babelLoaderQuery = JSON.parse(babelrc);
  } catch (err) {
    throw new Error(err);
  }

  if (env === 'development') {
    babelLoaderQuery.plugins = babelLoaderQuery.plugins || [];
    babelLoaderQuery.plugins.push(['react-transform', {
      transforms: [{
        transform: 'react-transform-hmr',
        imports: ['react'],
        locals: ['module']
      }]
    }]);
  }

  return babelLoaderQuery;
}
