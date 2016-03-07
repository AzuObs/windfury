import React from 'react';
import {IndexRoute, Route} from 'react-router';
import Root from './Root';
import {
  Website,
  Home,
  About,
  Support,
  GettingStarted,
  NotFound
} from './documents';

export default (
  <Route path="/" component={Website}>
    <IndexRoute component={Home} />
    <Route path="/about" component={About} />
    <Route path="/support" component={Support} />
    <Route path="/getting-started" component={GettingStarted} />
    <Route path="*" component={NotFound} status={404} />
  </Route>
);
