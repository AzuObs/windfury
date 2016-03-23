import React from 'react';
import {renderToString} from 'react-dom/server';
import {Router, RouterContext, match, browserHistory, createMemoryHistory} from 'react-router';
import {render} from 'react-dom';
import Routes from './Routes';
import Root from '../Root';
import counterpart from 'counterpart';

counterpart.setLocale(__LOCALE__);

if (typeof window !== 'undefined' || __STATIC__) require('../style.scss');

if (typeof document !== 'undefined') {
  render(<Router history={browserHistory} routes={Routes} />, document.getElementById('website'));
}

export default function(locals, callback) {
  const history = createMemoryHistory();
  const location = history.createLocation(locals.path);
  const webpackStatsAssets = locals.webpackStats.toJson().assetsByChunkName;
  const assets = {
    scripts: {},
    styles: {}
  };

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

  match({routes: Routes, location}, (error, redirectLocation, renderProps) => {
    callback(null, `<!DOCTYPE html>${renderToString(
      <Root assets={assets} component={<RouterContext {...renderProps} />} />
    )}`);
  });
}