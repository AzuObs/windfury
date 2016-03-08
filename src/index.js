import React from 'react';
import {renderToString} from 'react-dom/server';
import {Router, RouterContext, match, browserHistory, createMemoryHistory} from 'react-router';
import {render} from 'react-dom';
import Routes from './Routes';
import Root from 'Root';

if (typeof window !== 'undefined' || __STATIC__) require('./style.scss');

if (typeof document !== 'undefined') {
  render(<Router history={browserHistory} routes={Routes} />, document.getElementById('website'));
}

export default function(locals, callback) {
  const history = createMemoryHistory();
  const location = history.createLocation(locals.path);
  //const assets = locals.webpackStats.toJson().assetsByChunkName;
  const assets = locals.assets;

  match({routes: Routes, location}, (error, redirectLocation, renderProps) => {
    callback(null, `<!DOCTYPE html>${renderToString(
      <Root assets={assets} component={<RouterContext {...renderProps} />} />
    )}`);
  });
}
