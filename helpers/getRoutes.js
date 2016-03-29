import React from 'react';
import {IndexRoute, Route} from 'react-router';
import Website from '../documents';
import Home from '../documents/home/layout';
import NotFound from '../documents/not-found/layout';
import paths from './paths.json';

export default function() {
  return (
    <Route path="/" component={Website}>
      <IndexRoute component={Home} />
      {paths.map((path, index) => {
        const routerPath = path.substring(0, (path.length - 1));

        if (routerPath !== '' && routerPath !== '/not-found') {
          return <Route key={index} path={routerPath} component={require(`../documents${routerPath}/layout`)} />;
        }

        return null;
      })}
      <Route path="*" component={NotFound} status={404} />
    </Route>
  );
};
