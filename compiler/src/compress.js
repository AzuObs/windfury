import recursive from 'recursive-readdir';
import path from 'path';
import zlib from 'zlib';
import fs from 'fs';
import colors from 'colors';
import RawSource from 'webpack/lib/RawSource';

export default async function() {
  return new Promise((resolve) => {
    const algorithm = zlib.gzip;

    recursive(path.join(process.cwd(), './dist'), ['!*.{html,css,js}'], (err, files) => {
      let content;
      let originalSize;
      let compressedFiles = [];

      files.map((file) => {
        content = fs.readFileSync(file);
        content = new Buffer(content, 'utf-8');
        originalSize = content.length;

        algorithm(content, {level: 9}, (err, result) => {
          files.splice(files.indexOf(file), 1);

          if (!result.length / originalSize > 0.8) {
            fs.writeFileSync(file, new RawSource(result));
            compressedFiles.push(file);

            console.log(colors.green(`${path.basename(file)} compressed`));
          }

          if (files.length === 0) resolve(compressedFiles);
        });
      });
    });
  });
}
