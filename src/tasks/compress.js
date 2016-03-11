import recursive from 'recursive-readdir';
import path from 'path';
import zlib from 'zlib';
import fs from 'fs';
import RawSource from 'webpack/lib/RawSource';
import debugLib from 'debug';

export default async function() {
  const debug = debugLib('compress');

  return new Promise((resolve) => {
    const algorithm = zlib.gzip;

    recursive(path.join(process.cwd(), './dist'), ['!*.{html,css,js}'], (err, files) => {
      const compressedFiles = [];

      let originalSize = 0;
      let content;

      files.map((file) => {
        content = fs.readFileSync(file);
        content = new Buffer(content, 'utf-8');
        originalSize = content.length;

        return algorithm(content, {level: 9}, (algorithmErr, result) => {
          files.splice(files.indexOf(file), 1);

          if (!result.length / originalSize > 0.8) {
            fs.writeFileSync(file, new RawSource(result));
            compressedFiles.push(file);

            debug(`${path.basename(file)} compressed`);
          }

          if (files.length === 0) {
            return resolve(compressedFiles);
          }

          return result;
        });
      });
    });
  });
}