import React from 'react';
import content from './index.md';

export default React.createClass({
  render: function() {
    return (
      <section>
        <h1>Test</h1>
        <div dangerouslySetInnerHTML={{__html: content}}></div>
      </section>
    );
  }
});
