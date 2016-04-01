import commander from 'commander';
import fs from 'fs';
import logatim from 'logatim';
import path from 'path';
import yaml from 'js-yaml';
import watch from './tasks/watch';
import build from './tasks/build';
import createConfig from './helpers/createConfig';

const logatimLevel = commander.debug ? 'debug' : 'info';
const configFileName = 'windfury.yml';
const packageJson = JSON.parse(fs.readFileSync('./package.json'));

let config = {};

logatim.setLevel(logatimLevel);

try {
  const customConfig = yaml.safeLoad(fs.readFileSync(path.join(process.cwd(), `./${configFileName}`), 'utf8'));

  config = createConfig(customConfig);
} catch (err) {
  throw new Error(err);
}

commander
  .version(packageJson.version)
  .option('-d --deploy', 'Enable sources deployment.')
  .option('-de --debug', 'Enable debug logs.');
commander
  .command('watch')
  .action(() => watch(config));
commander
  .command('build')
  .action(() => build(config, commander.deploy));
commander.parse(process.argv);
