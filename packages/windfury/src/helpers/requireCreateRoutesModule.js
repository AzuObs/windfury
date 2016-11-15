import path from 'path';
import fs from 'fs-extra';

export default function() {
  const babelRc = JSON.parse(fs.readFileSync(path.join(process.cwd(), './.babelrc')));
  const ignoreExtensions = ['.svg', '.png', '.jpg'];

  babelRc.plugins.push([
    'css-modules-transform', {
      extensions: ['.css', '.scss']
    }
  ]);

  require('babel-register')(babelRc);

  ignoreExtensions.forEach(ignoreExtension => {
    require.extensions[ignoreExtension] = () => true;
  });

  const createRoutesFilePath = path.join(process.cwd(), './src/helpers/createRoutes');

  return require(createRoutesFilePath).default();
}
