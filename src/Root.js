import React from 'react';
import './main.scss';

export default React.createClass({
  render: function() {
    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>React Static Generator</title>
          <link rel="stylesheet" href="/main.css" />
          <script async defer src="/async.js"></script>
        </head>
      <body>
        <div id="website">
          {this.props.children}
        </div>
        <script src="/main.js"></script>
      </body>
      </html>
    );
  }
});
