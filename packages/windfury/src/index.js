import path from 'path';
import commander from 'commander';

import run from './helpers/run';
import watch from './tasks/watch';
import build from './tasks/build';
import deploy from './tasks/deploy';
import setup from './tasks/setup';
import setupBabel from './tasks/setupBabel';
import setupESLint from './tasks/setupESLint';
import setupWindfury from './tasks/setupWindfury';

const {version} = require(path.join(__dirname, '../package.json'));

commander
  .version(version)
  .option('-e, --env-file <envFile>', 'the .env file Windfury will use to compile the app (default: ./env/.env.dev).')
  .option('-n, --env <env>', 'the environment name that Windfury must deploys to.');
commander
  .command('start')
  .action(() => {
    run(watch, {
      envFile: commander.envFile
    });
  });
commander
  .command('build')
  .action(() =>
    run(build, {
      envFile: commander.envFile,
      isBuild: true
    }));
commander
  .command('deploy')
  .action(() => run(deploy, {
    env: commander.env
  }));
commander
  .command('setup:babel')
  .action(() => run(setupBabel));
commander
  .command('setup:eslint')
  .action(() => run(setupESLint));
commander
  .command('setup:windfury')
  .action(() => run(setupWindfury));
commander
  .command('setup')
  .action(() => run(setup));
commander
  .command('*')
  .action(() => {
    throw new Error('Unknown Windfury task. See all available commands in the documentation: ' +
      'https://github.com/mapleinside/windfury#commands');
  });
commander.parse(process.argv);
