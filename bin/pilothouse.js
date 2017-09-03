#!/usr/bin/env node
const environment = require('../utils/environment'),
      yargs = require('yargs');

if (!environment.isThirdPartyCommand) {
	yargs
		.demandCommand(1)
		.help()
		.version();
}

yargs
	.commandDir('../commands/')
	.epilogue('See http://pilothouse-app.org/ for complete documentation and usage instructions.')
	.usage('$0 <command> [args]')
	.wrap(yargs.terminalWidth())
	.argv;
