const config = require('./config'),
      environment = require('./environment'),
      fs = require('fs-extra'),
      selfsigned = require('selfsigned'),
      shellEscape = require('shell-escape'),
      spawn = require('child_process').spawnSync;

module.exports = {
	artisanCommand: artisanCommand,
	composeCommand: composeCommand,
	mysqlCommand: mysqlCommand,
	regenerateHTTPSCertificate: regenerateHTTPSCertificate,
	shellCommand: shellCommand,
	wpCommand: wpCommand
};

/**
 * Runs a Laravel Artisan command in the specified container.
 *
 * @param {Array}  commandString The command to run.
 * @param {String} container     The container in which to run the command. Will use the default PHP container if none is specified.
 */
function artisanCommand(commandString, container = null) {
    const currentSiteName = environment.currentSiteName;
    let   shellCommandString;

    if (!container) {
        container = config.default_php_container;
    }

    if (currentSiteName) {
        shellCommandString = 'cd /var/www/html/' + currentSiteName + '/htdocs && php artisan ' + shellEscape(commandString);
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
 * @param {String}  sql            The SQL to run.
 * @param {Boolean} selectDatabase Whether to select the database of the current site before running the command.
 */
function mysqlCommand(sql, selectDatabase = true) {
	if (selectDatabase && environment.currentSiteName) {
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
 * Regenerates the HTTPS certificate.
 *
 * @param {Array} hosts The hosts to include in the certificate.
 */
function regenerateHTTPSCertificate(hosts = []) {

	shellCommand(environment.appHomeDirectory, 'sudo', [
		'security',
		'delete-certificate',
		'-c', 'pilothouse.dev',
		'/Library/Keychains/System.keychain'
	]);
	hosts.unshift('localhost');

	let altNames = [];
	hosts.forEach(function(host) {
		altNames.push({
			type: 2,
			value: host
		});
	});

	const attrs = [
		{
			name: 'commonName',
			value: 'pilothouse.dev'
		}
	];

	const options = {
		algorithm: 'sha256',
		days: 3650,
		extensions: [
			{
				name: 'basicConstraints',
				cA: true
			},
			{
				name: 'subjectAltName',
				altNames: altNames
			}
		],
		keySize: 2048
	};

	const pems = selfsigned.generate(attrs, options);

	fs.writeFileSync(environment.httpsCertificateCertPath, pems.cert);
	fs.writeFileSync(environment.httpsCertificateKeyPath, pems.private);

	shellCommand(environment.appHomeDirectory, 'sudo', [
		'security',
		'add-trusted-cert',
		'-d',
		'-r', 'trustRoot',
		'-k', '/Library/Keychains/System.keychain',
		environment.httpsCertificateCertPath
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

	} else if (1 === commandString.length && '--info' === commandString[0]) {
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
