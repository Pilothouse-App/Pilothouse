const utils = require('../utils');

const composeCommand = function(argv) {
	utils.composeCommand(utils.environment.subCommandArgs);
};

exports.command = 'compose [command]';
exports.desc    = 'Runs a `docker-compose` command with required environment variables set.';
exports.handler = composeCommand;
