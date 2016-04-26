import _ from 'lodash';

/**
 * Create the development configuration.
 *
 * @param {Object} customConfig
 * @returns {Object}
 */
export default function(customConfig) {
  return {
    server: {
      port: _.hasIn(customConfig, 'server.port') ? customConfig.server.port : 3000,
      uiPort: _.hasIn(customConfig, 'proxy.ui_port') ? customConfig.proxy.ui_port : 3001
    },
    openOnStart: customConfig.open_on_start ? customConfig.open_on_start : false,
    developmentEndpoint: customConfig.development_endpoint ?
      customConfig.development_endpoint : 'http://localhost:3000'
  };
}
