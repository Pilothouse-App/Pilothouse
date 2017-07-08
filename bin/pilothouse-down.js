#!/usr/bin/env node

const program = require('commander'),
      systemDown = require('../commands/down'),
      utils = require('../utils');

program
    .description(utils.commandDescriptions.down)
    .parse(process.argv);

systemDown();
