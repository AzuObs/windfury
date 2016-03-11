import commander from 'commander';
import pathExists from 'path-exists';
import path from 'path';
import watch from './tasks/watch';
import build from './tasks/build';

const configFileName = 'package.json';
const errors = [];

if (!pathExists.sync(path.normalize(`./${configFileName}`))) {
  errors.push(`${configFileName} doesn't exist.`);
}

if (errors.length) throw errors.join('. ');

commander
  .command('watch')
  .action(() => watch());
commander
  .command('build')
  .action(() => build());

commander.parse(process.argv);
