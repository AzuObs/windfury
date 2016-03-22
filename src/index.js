import commander from 'commander';
import fs from 'fs';
import watch from './tasks/watch';
import build from './tasks/build';
import logatim from 'logatim';

const logatimLevel = commander.debug ? 'debug' : 'info';
const packageJson = JSON.parse(fs.readFileSync('./package.json'));

logatim.setLevel(logatimLevel);

commander
  .version(packageJson.version)
  .option('-d --deploy', 'Enable sources deployment.')
  .option('-de --debug', 'Enable debug logs.');

commander
  .command('watch')
  .action(() => watch());

commander
  .command('build')
  .action(() => build(commander.deploy));

commander.parse(process.argv);
