const commands = require('../utils/commands'),
      environment = require('../utils/environment');

const composeCommand = function(argv) {
	commands.composeCommand(environment.subCommandArgs);
};

exports.command = 'compose [command]';
exports.desc    = 'Runs a `docker-compose` command with required environment variables set.';
exports.handler = composeCommand;
