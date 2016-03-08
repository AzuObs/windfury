import commander from 'commander';
import pathExists from 'path-exists';
import fs from 'fs';
import path from 'path';
import watch from './tasks/watch';
import build from './tasks/build';

const configFileName = 'package.json';

let errors = [];
let config;

if (!pathExists.sync(path.normalize('./' + configFileName))) {
  errors.push(configFileName + ' doesn\'t exist.');
}

if (errors.length) {
  console.error(errors.join('. '));
  process.exit(2);
}

config = JSON.parse(fs.readFileSync('./' + configFileName)).felfire;

commander
  .command('watch')
  .action(() => watch());
commander
  .command('build')
  .action(() => build());

commander.parse(process.argv);
