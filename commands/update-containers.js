const commands = require('../utils/commands'),
      systemRestart = require('./restart');

const updateContainersCommand = function() {
	commands.composeCommand(['pull']);
	commands.composeCommand(['down']);
	systemRestart.handler();
};

exports.command = 'update-containers';
exports.desc    = 'Updates the Docker containers to the latest versions.';
exports.handler = updateContainersCommand;
