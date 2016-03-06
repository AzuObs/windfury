import React from 'react';
import content from './index.md';

export default React.createClass({
  render: function() {
    return (
      <div dangerouslySetInnerHTML={{__html: content}}></div>
    );
  }
});
