/**
 * Returns an object which represents the options for the Webpack Define Plugin.
 *
 * @param {Object} config
 * @param {String} locale
 * @returns {Object}
 */
export default function(config, locale = null) {
  const definePluginOpts = {'process.env': {}};

  for (let index = 0, env = null, value = '', key = ''; index < config.env.length; index++) {
    env = config.env[index];

    if (env.indexOf('=') > -1) {
      value = env.split('=')[1];
      key = env.split('=')[0];
    } else {
      value = process.env[env];
      key = env;
    }

    definePluginOpts['process.env'][key] = JSON.stringify(value);
  }

  definePluginOpts['process.env'].STATIC = JSON.stringify(false);
  definePluginOpts['process.env'].LOCALE = locale ? JSON.stringify(locale) : JSON.stringify(config.locales[0]);

  return definePluginOpts;
}
