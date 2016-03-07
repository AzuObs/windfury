import React from 'react';
import Home from './home/layout';
import About from './about/layout';
import Support from './support/layout';
import GettingStarted from './getting-started/layout';
import NotFound from './not-found/layout';

if (typeof window !== 'undefined') require('./style.scss');

const Website = React.createClass({
  render: function() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
});

export default {
  Website,
  Home,
  About,
  Support,
  GettingStarted,
  NotFound
};