const commands = require('../utils/commands'),
      run = require('../utils/run');

const mysqlCommand = function(argv) {
	run.requireSystemUp();
	commands.mysqlCommand(argv.sql);
};

exports.command = 'mysql <sql>';
exports.desc    = 'Runs the provided MySQL command. The command will be run on the database of the current site, or with no database selected if not run from within a site directory.';
exports.handler = mysqlCommand;
