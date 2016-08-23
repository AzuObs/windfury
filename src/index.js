import path from 'path';
import commander from 'commander';

import run from './helpers/run';
import watch from './tasks/watch';
import build from './tasks/build';
import deployStatic from './tasks/deployStatic';
import deployToEB from './tasks/deployToEB';
import setup from './tasks/setup';
import setupBabel from './tasks/setupBabel';
import setupESLint from './tasks/setupESLint';
import setupFelfire from './tasks/setupFelfire';

const {version} = require(path.join(__dirname, '../package.json'));

commander
  .version(version)
  .option('-e, --env-file <envFile>', 'the .env file Felfire will use to compile the app (default: ./env/.env.dev).')
  .option('-n, --eb-env <ebEnv>', 'the AWS environment name that Felfire must deploys to.');
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
      envFile: commander.envFile
    }));
commander
  .command('deploy:static')
  .action(() => run(deployStatic));
commander
  .command('deploy:eb')
  .action(() =>
    run(deployToEB, {
      envFile: commander.envFile,
      AWSEBEnv: commander.ebEnv
    }));
commander
  .command('setup:babel')
  .action(() => run(setupBabel));
commander
  .command('setup:eslint')
  .action(() => run(setupESLint));
commander
  .command('setup:felfire')
  .action(() => run(setupFelfire));
commander
  .command('setup')
  .action(() => run(setup));
commander
  .command('*')
  .action(() => {
    throw new Error('Unknown Felfire task. See all available commands in the documentation: ' +
      'https://github.com/mapleinside/felfire#commands');
  });
commander.parse(process.argv);
