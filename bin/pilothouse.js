#!/usr/bin/env node

const yargs = require('yargs');

const program = yargs
	.commandDir('../commands/')
	.help()
	.usage('$0 <command> [args]')
	.version()
	.wrap(yargs.terminalWidth())
	.argv;
