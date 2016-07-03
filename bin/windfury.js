#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var babelRc = JSON.parse(fs.readFileSync(path.join(__dirname, '../.babelrc'), 'utf8'));

babelRc.resolveModuleSource = require('babel-resolver')(
  path.join(__dirname, '../src'),
  path.join(process.cwd(), './src')
);

require('babel-polyfill');
require('babel-register')(babelRc);
require('../src');
