import path from 'path';
import fs from 'fs-extra';
import babelRegister from 'babel-register';

const babelConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), './.babelrc'), 'utf8'));

babelRegister(babelConfig);
