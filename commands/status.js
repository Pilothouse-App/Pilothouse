const chalk = require('chalk'),
      run = require('../utils/run');

const statusCommand = function() {
	if (run.isSystemUp()) {
		console.log(chalk.green('Pilothouse is running.'));
	} else {
		console.log(chalk.red('Pilothouse is not running.'));
	}
};

exports.command = 'status';
exports.desc    = 'Displays Pilothouse\'s status.';
exports.handler = statusCommand;
