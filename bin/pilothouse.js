#!/usr/bin/env node

const yargs = require('yargs');

const program = yargs
	.commandDir('../commands/')
	.epilogue('See http://pilothouse-app.org/ for complete documentation and usage instructions.')
	.help()
	.usage('$0 <command> [args]')
	.version()
	.wrap(yargs.terminalWidth())
	.argv;
