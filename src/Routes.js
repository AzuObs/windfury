import React from 'react';
import {IndexRoute, Route} from 'react-router';
import Root from './Root';
import {Home, About, NotFound} from './documents';

export default (
  <Route path="/" component={Root}>
    <IndexRoute component={Home} />
    <Route path="/about" component={About} />
    <Route path="*" component={NotFound} status={404} />
  </Route>
);
