#!/usr/bin/env node

const program = require('commander'),
      systemRestart = require('../commands/restart'),
      utils = require('../utils');

let restartContainer = 'system';

program
    .description(utils.commandDescriptions.restart)
    .arguments('[container]')
    .action(function(containerArg){
        restartContainer = containerArg;
    })
    .parse(process.argv);

if ('system' === restartContainer) {
    systemRestart();
} else {
    utils.composeCommand(['restart', restartContainer]);
}
