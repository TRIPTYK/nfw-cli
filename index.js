#!/usr/bin/env node
const clear = require('clear');
const New = require('./utils/New');
const minimist = require('minimist')


  const args = minimist(process.argv.slice(2))
  console.log(args)

//New.New();