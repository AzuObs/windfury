import recursive from 'recursive-readdir';
import path from 'path';
import fs from 'fs';

export default function(entry) {
  const assets = JSON.parse(fs.readFileSync(path.join(process.cwd(), './webpack-assets.json')));

  recursive(path.join(process.cwd(), './dist'), ['!*.html'], (err, files) => {
    let content;
    let replaceValues;

    files.map((file) => {
      content = fs.readFileSync(file).toString();

      for (let entrypoint in entry) {
        if (entry.hasOwnProperty(entrypoint)) {
          replaceValues = assets[entrypoint];
          content = content.replace(new RegExp(`/${entrypoint}.js`, 'gm'), `/${replaceValues.js}`);

          if (replaceValues.css) {
            content = content.replace(new RegExp(`/${entrypoint}.css`, 'gm'), `/${replaceValues.css}`);
          }
        }
      }

      fs.writeFileSync(file, content);
    });
  });
}
