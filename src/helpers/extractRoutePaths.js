import recursive from 'recursive-readdir';
import path from 'path';

/**
 * Extract route paths from website directory structure.
 *
 * @param {Object} config
 * @param {Function} done
 * @returns {Array}
 */
export default function(config, done) {
  const documentsDir = path.join(process.cwd(), `${config.srcPath}/documents`);
  const paths = [];

  return recursive(documentsDir, ['*.scss'], (err, files) => {
    let documentPath;

    files.map((file) => {
      documentPath = file.replace(new RegExp(documentsDir), '');
      documentPath = path.dirname(documentPath);

      if (documentPath !== '/') documentPath += '/';
      if (paths.indexOf(documentPath) === -1 && documentPath !== '/home/') paths.push(documentPath);

      return file;
    });

    done(paths);
  });
}
