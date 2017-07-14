#!/usr/bin/env node

const utils = require('../utils'),
      yargs = require('yargs');

const program = yargs
	.commandDir('../commands/')
	.help()
	.usage('$0 <command> [args]')
	.version()
	.wrap(yargs.terminalWidth())
	.argv;
