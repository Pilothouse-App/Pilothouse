const commands = require('../utils/commands'),
      sites = require('../utils/sites');

const downCommand = function() {
	commands.composeCommand(['stop']);
	sites.hostsRemoveAll();
};

exports.command = 'down';
exports.desc    = 'Halts the Docker containers, removing all site entries from the host\'s hosts file.';
exports.handler = downCommand;
