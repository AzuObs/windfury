import React from 'react';
import {IndexRoute, Route} from 'react-router';
import Website from '../documents';
import Home from '../documents/home';
import NotFound from '../documents/not-found';
import paths from './paths.json';

export default function() {
  return (
    <Route path="/" component={Website}>
      <IndexRoute component={Home} />
      {paths.map((path, index) => {
        if (path !== '' && path !== '/not-found') {
          return <Route key={index} path={path} component={require(`../documents${path}index`)} />;
        }

        return null;
      })}
      <Route path="*" component={NotFound} status={404} />
    </Route>
  );
}
