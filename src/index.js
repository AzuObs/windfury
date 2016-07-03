import commander from 'commander';
import fs from 'fs';
import logatim from 'logatim';
import path from 'path';
import yaml from 'js-yaml';
import _ from 'lodash';

import watch from './tasks/watch';
// import build from './tasks/build';
import createConfig from './helpers/createConfig';
import createDevConfig from './helpers/createDevConfig';

const logatimLevel = commander.debug ? 'debug' : 'info';
const configFileName = 'windfury.yml';
const devConfigFileName = 'windfury-dev.yml';
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')));

let config = {};
let customConfig = {};
let devCustomConfig = {};

logatim.setLevel(logatimLevel);

try {
  customConfig = yaml.safeLoad(fs.readFileSync(path.join(process.cwd(), `./${configFileName}`), 'utf8'));
} catch (err) {
  throw new Error(err);
}

try {
  fs.statSync(path.join(process.cwd(), `./${devConfigFileName}`)).isFile();
  devCustomConfig = yaml.safeLoad(fs.readFileSync(path.join(process.cwd(), `./${devConfigFileName}`), 'utf8'));
} catch (err) {
  logatim.info(`No ${devConfigFileName} found. Using default development configuration.`);
}

config = _.assign(createConfig(customConfig), createDevConfig(devCustomConfig));

commander
  .version(packageJson.version)
  .option('-d --deploy', 'Enable sources deployment.')
  .option('-de --debug', 'Enable debug logs.');
commander
  .command('watch')
  .action(() => watch(config));
// commander
//   .command('build')
//   .action(() => build(config, commander.deploy));
commander.parse(process.argv);
