const environment = require('../utils/environment'),
      utils = require('../utils/general');

const composeCommand = function(argv) {
	utils.composeCommand(environment.subCommandArgs);
};

exports.command = 'compose [command]';
exports.desc    = 'Runs a `docker-compose` command with required environment variables set.';
exports.handler = composeCommand;
