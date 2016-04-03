import recursive from 'recursive-readdir';
import path from 'path';
import zlib from 'zlib';
import fs from 'fs';
import RawSource from 'webpack/lib/RawSource';
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

    return recursive(path.join(process.cwd(), config.distPath, `./${locale}`), ['!*.{html,css,js}'], (err, files) => {
      const compressedFiles = [];

      let originalSize = 0;
      let content;

      files.map((file) => {
        content = fs.readFileSync(file);
        content = new Buffer(content, 'utf-8');
        originalSize = content.length;

        return algorithm(content, {level: config.gzipCompressionLevel}, (algorithmErr, result) => {
          files.splice(files.indexOf(file), 1);

          if (result.length / originalSize < config.gzipCompressionRatio) {
            fs.writeFileSync(file, new RawSource(result));
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
