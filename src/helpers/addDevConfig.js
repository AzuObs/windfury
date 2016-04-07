import _ from 'lodash';

/**
 * Add the development configuration.
 *
 * @param {Object} config
 * @param {Object} customConfig
 * @returns {Object}
 */
export default function(config, customConfig) {
  return {
    ...config,
    server: {
      port: _.hasIn(customConfig, 'server.port') ? customConfig.server.port : config.server.port,
      uiPort: _.hasIn(customConfig, 'proxy.ui_port') ? customConfig.proxy.ui_port : config.server.uiPort
    },
    openOnStart: customConfig.open_on_start ? customConfig.open_on_start : config.openOnStart
  };
}
