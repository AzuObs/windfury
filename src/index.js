import React from 'react';
import {render} from 'react-dom';
import {renderToString} from 'react-dom/server';
import {Router, RouterContext, match, browserHistory, createMemoryHistory} from 'react-router';
import Routes from './Routes';

if (typeof document !== 'undefined') {
  const mountNode = document.getElementById('website');

  render(<Router history={browserHistory} routes={Routes} />, mountNode);
}

export default function(locals, callback) {
  const history = createMemoryHistory();
  const location = history.createLocation(locals.path);

  match({routes: Routes, location}, (error, redirectLocation, renderProps) => {
    callback(null, renderToString(
      <RouterContext {...renderProps} />
    ));
  });
}
