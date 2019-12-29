const chalk = require('chalk'),
      commands = require('../utils/commands'),
      config = require('../utils/config'),
      figlet = require('figlet'),
      run = require('../utils/run'),
      sites = require('../utils/sites');

const upCommand = function(displayFiglet = true) {

	if (run.isSystemUp()) {
		console.log(chalk.green('Pilothouse is already running.'));
		return;
	}

	run.triggerBackgroundUpdateCheck()

	if (displayFiglet) {
		console.log(chalk.blue(figlet.textSync('Pilothouse', {font: 'slant'})));
	}

	run.buildRunFiles();
	sites.hostsAllAdd();
	commands.composeCommand(['up', '-d', '--remove-orphans']);

	run.updateCaCertificates()

	run.waitForMysql();
	commands.mysqlCommand(
		"CREATE USER IF NOT EXISTS 'pilothouse'@'%' IDENTIFIED BY 'pilothouse';"
		+ " GRANT ALL PRIVILEGES ON *.* to 'pilothouse'@'%';"
		+ " FLUSH PRIVILEGES;"
	);

  run.maybeShowUpdateNotification()
};

exports.command = 'up';
exports.desc    = 'Boots up the Docker containers, and adds all necessary site entries to the host\'s hosts file.';
exports.handler = upCommand;
