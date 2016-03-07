import React from 'react';
import content from './index.md';

//import './style.scss';

export default React.createClass({
  render: function() {
    return (
      <div dangerouslySetInnerHTML={{__html: content}}></div>
    );
  }
});
