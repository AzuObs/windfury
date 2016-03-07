import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Router, RouterContext, match, browserHistory, createMemoryHistory} from 'react-router';
import Routes from './Routes';

export default function(locals, callback) {
  const history = createMemoryHistory();
  const location = history.createLocation(locals.path);

  match({routes: Routes, location}, (error, redirectLocation, renderProps) => {
    callback(null, `<!DOCTYPE html>${renderToStaticMarkup(<RouterContext {...renderProps} />)}`);
  });
}
