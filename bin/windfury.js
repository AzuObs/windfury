#!/usr/bin/env node

const path = require('path');
const dotenv = require('dotenv');

let envFile = './env/dev.env';

process.argv.map(arg => {
  if (arg.indexOf('--env-file') > -1) envFile = arg.split('=')[1];

  return arg;
});

dotenv.config({
  path: path.join(process.cwd(), envFile)
});

require('babel-polyfill');
require('../lib');
