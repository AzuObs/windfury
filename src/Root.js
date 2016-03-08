import React from 'react';
import {renderToString} from 'react-dom/server';

export default React.createClass({
  render: function() {
    const {component, assets} = this.props;
    const content = component ? renderToString(component) : '';

    console.log(assets);

    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>React Static Generator</title>
          <script async defer src={assets.async}></script>
        </head>
        <body>
          <div id="website" dangerouslySetInnerHTML={{__html: content}} />
          <script src={assets.main}></script>
        </body>
      </html>
    );
  }
});
