import {createStore, applyMiddleware} from 'redux';
import reducer from './modules/reducer';
import {syncHistory} from 'react-router-redux';

/**
 * Creates Redux store and attaches middleware to it.
 *
 * @method createStore
 * @param {History} history
 * @param {Object} data
 * @returns {Object} Redux store.
 */
export default function(history, data = {}) {
  const reduxRouterMiddleware = syncHistory(history);
  const middleware = [reduxRouterMiddleware];
  const finalCreateStore = applyMiddleware(...middleware)(createStore);
  const store = finalCreateStore(reducer, data);

  reduxRouterMiddleware.listenForReplays(store);

  return store;
}
