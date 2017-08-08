const commands = require('../utils/commands'),
      run = require('../utils/run');

const logsCommand = function(argv) {

	run.requireSystemUp();

	let args = [
		'logs',
		'-f',
		'--tail=10'
	];

	if (argv.container) {
		args.push(argv.container);
	}

	commands.composeCommand(args);
};

exports.command = 'logs [container]';
exports.desc    = 'Tails the logs for the specified container, or the entire stack if no container is specified.';
exports.handler = logsCommand;
