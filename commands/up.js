const commands = require('../utils/commands'),
      run = require('../utils/run');

const upCommand = function() {
	run.buildRunFiles();
	commands.composeCommand(['up', '-d']);
	run.waitForMysql();
	commands.mysqlCommand(
		"CREATE USER IF NOT EXISTS 'pilothouse'@'%' IDENTIFIED BY 'pilothouse';"
		+ " GRANT ALL PRIVILEGES ON *.* to 'pilothouse'@'%';"
		+ " FLUSH PRIVILEGES;"
	);
};

exports.command = 'up';
exports.desc    = 'Boots up the Docker containers, and adds all necessary site entries to the host\'s hosts file.';
exports.handler = upCommand;
