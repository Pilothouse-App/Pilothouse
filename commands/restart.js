const commands = require('../utils/commands'),
      systemUp = require('./up'),
      systemDown = require('./down');

const restartCommand = function(argv) {
	if (argv.container) {
		commands.composeCommand(['restart', argv.container]);
	} else {
		systemDown.handler();
		systemUp.handler();
	}
};

exports.command = 'restart [container]';
exports.desc    = 'Restarts the specified Docker container (nginx, memcached, etc.), or the entire system if no container is specified.';
exports.handler = restartCommand;
