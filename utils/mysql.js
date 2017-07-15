const config = require('./config'),
      environment = require('./environment'),
      utils = require('./general');

module.exports = {
	mysqlCommand: mysqlCommand,
	waitForMysql: waitForMysql
};

/**
 * Runs a MySQL command.
 *
 * @param {String} sql The SQL to run.
 */
function mysqlCommand(sql) {
	if (environment.currentSiteName) {
		sql = 'USE "' + environment.currentSiteName + '"; ' + sql;
	}

	utils.composeCommand([
		'exec',
		config.default_php_container,
		'mysql',
		'--host=mysql',
		'--user=root',
		'--password=root',
		'-e',
		sql
	]);
}

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
