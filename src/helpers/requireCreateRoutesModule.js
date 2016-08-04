import path from 'path';

export default function() {
  require('babel-register');

  const createRoutesFilePath = path.join(process.cwd(), './src/helpers/createRoutes');

  return require(createRoutesFilePath).default();
}
