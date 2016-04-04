import recursive from 'recursive-readdir';
import path from 'path';
import zlib from 'zlib';
import fs from 'fs';
import logatim from 'logatim';

/**
 * Compress HTML, CSS, and JavaScript files with Gzip.
 *
 * @param {String} locale
 * @param {Object} config
 * @returns {Array|Promise}
 */
export default async function(locale, config) {
  return new Promise((resolve) => {
    const algorithm = zlib.gzip;
    const distDir = locale ?
      path.join(process.cwd(), config.distPath, `./${locale}`) :
      path.join(process.cwd(), config.distPath);

    return recursive(distDir, ['!*.{html,css,js}'], (err, files) => {
      const compressedFiles = [];

      let originalSize = 0;

      files.map((file) => {
        const content = fs.readFileSync(file, 'utf-8');

        originalSize = content.length;

        return algorithm(content, {level: config.gzipCompressionLevel}, (algorithmErr, result) => {
          files.splice(files.indexOf(file), 1);

          if (result.length / originalSize > config.gzipCompressionRatio) {
            fs.writeFileSync(file, result);
            compressedFiles.push(file);

            logatim.green(path.basename(file)).white(' is now gzipped.').info();
          }

          if (files.length === 0) return resolve(compressedFiles);

          return result;
        });
      });
    });
  });
}
