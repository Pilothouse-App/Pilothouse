const commands = require('../utils/commands'),
      environment = require('../utils/environment'),
      run = require('../utils/run');

const shellCommand = function(argv) {
	const container = argv.container;

	run.requireSystemUp();

	let shell = '/bin/sh';
	if (container.includes('mysql') || container.includes('php')) {
		shell = '/bin/bash';
	}

	commands.composeCommand([
		'exec',
		container,
		shell
	]);
};

exports.command = 'shell <container>';
exports.desc    = 'Opens a command line shell in the specified container.';
exports.handler = shellCommand;
