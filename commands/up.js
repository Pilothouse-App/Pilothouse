const sleep = require('system-sleep'),
      utils = require('../utils');

const upCommand = function() {
	utils.buildRunFiles();
	utils.composeCommand(['up', '-d']);
	waitForMysql();
	utils.mysqlCommand("CREATE USER IF NOT EXISTS 'pilothouse'@'%' IDENTIFIED BY 'pilothouse'; GRANT ALL PRIVILEGES ON *.* to 'pilothouse'@'%'; FLUSH PRIVILEGES;");
};

function waitForMysql() {
	let iteration = 0,
	    status;

	while (true) {
		status = utils.composeCommand([
			'exec',
			'-T',
			'php70',
			'/bin/sh',
			'-c',
			'mysqladmin ping --no-beep --host=mysql --user=root --password=root'
		], true);

		if ('mysqld is alive' === status) {
			break;
		}

		if (3 === iteration) {
			console.info('Waiting for MySQL...');
		}

		if (iteration >= 60) {
			console.error('Error: MySQL could not be started.');
			exit(1);
		}

		sleep(1000);
		iteration++;
	}

	if (iteration >= 4) {
		console.info('done.');
	}
}

exports.command = 'up';
exports.desc    = 'Boots up the Docker containers, and adds all necessary site entries to the host\'s hosts file.';
exports.handler = upCommand;
