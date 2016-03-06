import React from 'react';

export default React.createClass({
  render: function() {
    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>React Static Generator</title>
        </head>
      <body>
        <div id="website">
          {this.props.children}
        </div>
      </body>
      </html>
    );
  }
});
