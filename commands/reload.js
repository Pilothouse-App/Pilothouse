const commands = require('../utils/commands'),
      run = require('../utils/run'),
      sites = require('../utils/sites')

const reloadCommand = function() {
	run.buildRunFiles()
	sites.hostsAllAdd()
	commands.composeCommand(['up', '-d', '--remove-orphans']);
	run.updateCaCertificates()
};

exports.command = 'reload';
exports.desc    = 'Reloads the system to activate new sites or configuration file changes.';
exports.handler = reloadCommand;
