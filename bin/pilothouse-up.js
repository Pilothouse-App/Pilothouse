#!/usr/bin/env node

const program = require('commander'),
      systemUp = require('../commands/up'),
      utils = require('../utils');

program
    .description(utils.commandDescriptions.up)
    .parse(process.argv);

systemUp();
