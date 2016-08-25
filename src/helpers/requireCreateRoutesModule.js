import path from 'path';
import fs from 'fs-extra';

export default function() {
  const babelRc = JSON.parse(fs.readFileSync(path.join(process.cwd(), './.babelrc')));

  babelRc.plugins.push([
    'css-modules-transform', {
      extensions: ['.css', '.scss']
    }
  ]);

  require('babel-register')(babelRc);

  const createRoutesFilePath = path.join(process.cwd(), './src/helpers/createRoutes');

  return require(createRoutesFilePath).default();
}
