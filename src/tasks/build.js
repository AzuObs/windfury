import webpack from 'webpack';
import debugLib from 'debug';
import generateProdConfig from '../webpack/generateProdConfig';
import compress from './compress';
import deploy from './deploy';

export default function() {
  const debug = debugLib('build');

  generateProdConfig((webpackConfig) => {
    const compiler = webpack(webpackConfig);

    compiler.run(async () => {
      debug('webpack build done');

      const compressedFiles = await compress();

      deploy(compressedFiles);
    });
  });
}
