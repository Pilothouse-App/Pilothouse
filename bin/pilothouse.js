#!/usr/bin/env node

const program = require('commander'),
      packageInfo = require('../package.json'),
      utils = require('../utils');

program
    .description(packageInfo.description)
    .version(packageInfo.version)

    .command('up', utils.commandDescriptions.up)
    .command('down', utils.commandDescriptions.down)
    .command('restart [container]', utils.commandDescriptions.restart)

    //.arguments('<command> [arguments...]')
    .parse(process.argv);
