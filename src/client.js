if (module.hot) module.hot.accept();

import 'babel-polyfill';
import injectTapEventPlugin from 'react-tap-event-plugin';
import React from 'react';
import {render} from 'react-dom';
import {Router, browserHistory} from 'react-router';
import Routes from './Routes';

injectTapEventPlugin();

if ('production' !== process.env.NODE_ENV) window.React = React;
