const systemUp = require('./up'),
      systemDown = require('./down'),
      utils = require('../utils/general');

const restartCommand = function(argv) {
	if (argv.container) {
		utils.composeCommand(['restart', argv.container]);
	} else {
		systemDown.handler();
		systemUp.handler();
	}
};

exports.command = 'restart [container]';
exports.desc    = 'Restarts the specified Docker container (nginx, memcached, etc.), or the entire system if no container is specified.';
exports.handler = restartCommand;
