import React from 'react';
import {renderToString} from 'react-dom/server';
import {Router, RouterContext, match, browserHistory, createMemoryHistory} from 'react-router';
import {render} from 'react-dom';
import getRoutes from './getRoutes';
import counterpart from 'counterpart';
import createStore from './redux/createStore';
import {Provider} from 'react-redux';
import Root from '../Root';

const routes = getRoutes();

counterpart.setLocale(process.env.LOCALE);

if (typeof window !== 'undefined' || process.env.STATIC) require('../style.scss');

if (typeof document !== 'undefined') {
  const store = createStore(browserHistory, window.__data);
  const component = (
    <Provider key="provider" store={store}>
      <Router history={browserHistory} routes={routes} />
    </Provider>
  );

  render(component, document.getElementById('website'));
}

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') window.React = React;

export default function(locals, callback) {
  const history = createMemoryHistory(locals.path);
  const location = history.createLocation(locals.path);
  const webpackStatsAssets = locals.webpackStats.toJson().assetsByChunkName;
  const assets = {
    scripts: {},
    styles: {}
  };
  const store = createStore(history);

  if (webpackStatsAssets.async.constructor.name === 'Array') {
    assets.scripts.async = `/${webpackStatsAssets.async[0]}`;
  } else {
    assets.scripts.async = `/${webpackStatsAssets.async}`;
  }

  if (webpackStatsAssets.main.constructor.name === 'Array') {
    assets.scripts.main = `/${webpackStatsAssets.main[0]}`;
  } else {
    assets.scripts.main = `/${webpackStatsAssets.main}`;
  }

  assets.styles.main = webpackStatsAssets.main.constructor.name === 'Array' && `/${webpackStatsAssets.main[1]}`;

  match({history, routes, location}, (error, redirectLocation, renderProps) => {
    const component = (
      <Provider key="provider" store={store}>
        <RouterContext {...renderProps} />
      </Provider>
    );

    callback(null, `<!DOCTYPE html>${renderToString(<Root assets={assets} store={store} component={component} />)}`);
  });
}
