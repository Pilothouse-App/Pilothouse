const commands = require('../utils/commands'),
      run = require('../utils/run')
      systemDown = require('./down')
      systemUp = require('./up')

const updateContainersCommand = function() {
	const isSystemUp = run.isSystemUp()

	if (isSystemUp) {
		systemDown.handler()
	}

	run.buildRunFiles()
	commands.composeCommand(['pull'])

	if (isSystemUp) {
		systemUp.handler(false)
	}
};

exports.command = 'update-containers';
exports.desc    = 'Updates the Docker containers to the latest versions.';
exports.handler = updateContainersCommand;
