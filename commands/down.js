const commands = require('../utils/commands');

const downCommand = function() {
	commands.composeCommand(['stop']);
};

exports.command = 'down';
exports.desc    = 'Halts the Docker containers, removing all site entries from the host\'s hosts file.';
exports.handler = downCommand;
