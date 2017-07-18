const config = require('./config'),
      environment = require('./environment'),
      shellEscape = require('shell-escape'),
      spawn = require('child_process').spawnSync;

module.exports = {
	composeCommand: composeCommand,
	mysqlCommand: mysqlCommand,
	shellCommand: shellCommand,
	wpCommand: wpCommand
};

/**
 * Runs a docker-compose command
 *
 * @param {Array}   command       The command to run.
 * @param {Boolean} captureOutput Whether to capture and return the output, or pipe it to the console.
 *
 * @returns {Object} The command's result object.
 */
function composeCommand(command, captureOutput = false) {
	return shellCommand(environment.runDirectory, 'docker-compose', command, captureOutput);
}

/**
 * Runs a MySQL command.
 *
 * @param {String} sql The SQL to run.
 */
function mysqlCommand(sql) {
	if (environment.currentSiteName) {
		sql = 'USE "' + environment.currentSiteName + '"; ' + sql;
	}

	composeCommand([
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

/**
 * Runs a shell command.
 *
 * @param {String}  cwd           The working directory in which to run the command.
 * @param {String}  command       The command to run.
 * @param {Array}   args          Arguments to be passed to the command.
 * @param {Boolean} captureOutput Whether to capture and return the output, or pipe it to the console.
 *
 * @returns {Object} The command's result object.
 */
function shellCommand(cwd, command, args, captureOutput = false) {
	const result = spawn(command, args, {cwd: cwd, stdio: captureOutput ? 'pipe' : 'inherit'});

	if (captureOutput) {
		const stderr = result.stderr.toString();
		const stdout = result.stdout.toString();

		return stdout.length ? stdout.trim() : stderr.trim();
	}
}

/**
 * Runs a WP-CLI command in the specified container.
 *
 * @param {Array}  commandString The command to run.
 * @param {String} container     The container in which to run the command. Will use the default PHP container if none is specified.
 */
function wpCommand(commandString, container = null) {
	const currentSiteName = environment.currentSiteName;
	let   shellCommandString;

	if (!container) {
		container = config.default_php_container;
	}

	if (currentSiteName) {
		shellCommandString = 'cd /var/www/html/' + currentSiteName + '/' + environment.currentPathInSite
			+ ' && wp --path=/var/www/html/' + currentSiteName + '/htdocs'
			+ ' ' + shellEscape( commandString );

	} else if ('--info' === commandString) {
		shellCommandString = 'cd /var/www/html && wp --info';
	} else {
		console.error('This command must be run from within a site directory.');
		process.exit(1);
	}

	const composeArgs = [
		'exec',
		'--user=www-data',
		container,
		'/bin/sh',
		'-c',
		shellCommandString
	];

	composeCommand(composeArgs);
}
