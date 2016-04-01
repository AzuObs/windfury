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
        let routerPath = path.substring(0, (path.length - 1));

        routerPath = routerPath.substring(1, routerPath.length);

        if (routerPath !== '' && routerPath !== 'not-found') {
          return <Route key={index} path={routerPath} component={require(`../documents/${routerPath}/index.js`)} />;
        }

        return null;
      })}
      <Route path="*" component={NotFound} status={404} />
    </Route>
  );
}
