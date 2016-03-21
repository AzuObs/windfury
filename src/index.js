import commander from 'commander';
import fs from 'fs';
import watch from './tasks/watch';
import build from './tasks/build';

const packageJson = JSON.parse(fs.readFileSync('./package.json'));

commander.version(packageJson.version);

commander
  .command('watch')
  .action(() => watch());

commander
  .command('build')
  .action(() => build());

commander.parse(process.argv);
