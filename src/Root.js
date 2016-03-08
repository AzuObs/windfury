import React from 'react';
import {renderToString} from 'react-dom/server';

export default React.createClass({
  render: function() {
    const {component, assets} = this.props;
    const content = component ? renderToString(component) : '';

    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>React Static Generator</title>
          {assets.styles.main && <link rel="stylesheet" href={assets.styles.main} />}
          <script async defer src={assets.scripts.async}></script>
        </head>
        <body>
          <div id="website" dangerouslySetInnerHTML={{__html: content}} />
          <script src={assets.scripts.main}></script>
        </body>
      </html>
    );
  }
});
