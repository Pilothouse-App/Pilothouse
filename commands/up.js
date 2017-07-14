const utils = require('../utils');

const upCommand = function() {
	utils.buildRunFiles();
	utils.composeCommand(['up', '-d']);
};

exports.command = 'up';
exports.desc    = 'Boots up the Docker containers, and adds all necessary site entries to the host\'s hosts file.';
exports.handler = upCommand;
