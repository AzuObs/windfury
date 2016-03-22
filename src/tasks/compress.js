import recursive from 'recursive-readdir';
import path from 'path';
import zlib from 'zlib';
import fs from 'fs';
import RawSource from 'webpack/lib/RawSource';
import winston from 'winston';

export default async function(locale) {
  return new Promise((resolve) => {
    const algorithm = zlib.gzip;

    return recursive(path.join(process.cwd(), './dist', `./${locale}`), ['!*.{html,css,js}'], (err, files) => {
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

            winston.info(`${path.basename(file)} is now gzipped.`);
          }

          if (files.length === 0) return resolve(compressedFiles);

          return result;
        });
      });
    });
  });
}
