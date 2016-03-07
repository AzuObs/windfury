import React from 'react';
import content from './index.md';
import {Link} from 'react-router';

export default React.createClass({
  render: function() {
    return (
      <section>
        <h1>Test 5</h1>
        <Link to="/about">About link 234</Link>
        <div dangerouslySetInnerHTML={{__html: content}}></div>
      </section>
    );
  }
});
