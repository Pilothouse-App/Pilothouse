const commands = require('../utils/commands'),
      run = require('../utils/run');

const reloadCommand = function() {
	run.buildRunFiles();
	commands.composeCommand(['restart', 'nginx']);
};

exports.command = 'reload';
exports.desc    = 'Rebuilds and reloads the Nginx configuration in order to activate a newly added site.';
exports.handler = reloadCommand;
