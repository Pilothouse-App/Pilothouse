const commands = require('./commands'),
      config = require('./config'),
      environment = require('./environment'),
      fs = require('fs-extra'),
      helpers = require('./helpers'),
      sites = require('./sites'),
      sleep = require('system-sleep');

module.exports = {
	buildRunFiles: buildRunFiles,
	waitForMysql: waitForMysql
};

/**
 * Builds the files required for running docker-compose.
 */
function buildRunFiles() {
	const appDirectory = environment.appDirectory,
	      appHomeDirectory = environment.appHomeDirectory,
	      hosts = sites.getHosts(),
	      runDirectory = environment.runDirectory;

	// Create directories if they do not already exist.
	fs.ensureDirSync(appHomeDirectory);
	fs.emptyDirSync(runDirectory);

	// Create readme.txt
	fs.writeFileSync(runDirectory + '/readme.txt', 'All files in this directory are programmatically generated on'
		+ ' `pilothouse up`. Do not manually edit any of these files, as your changes will not persist.');

	// Copy .env
	fs.copySync(appDirectory + '/templates/run/.env', runDirectory + '/.env');

	// Copy config files
	fs.copySync(appDirectory + '/config', runDirectory + '/config');

	// Generate docker-compose.yml
	const composeTemplate = appDirectory + '/templates/run/docker-compose.yml';
	let composeData = fs.readFileSync(composeTemplate, 'UTF-8');
	composeData = helpers.populateTemplate(composeData, config.composeVariables);
	fs.outputFileSync(runDirectory + '/docker-compose.yml', composeData);

	// Copy docker-compose override file if it exists.
	const dockerComposeOverrideFile = environment.appHomeDirectory + '/docker-compose.custom.yml';
	if (fs.existsSync(dockerComposeOverrideFile)) {
		fs.copySync(dockerComposeOverrideFile, environment.runDirectory + '/docker-compose.override.yml');
	}

	// Update Nginx config.
	sites.updateSitesNginxConfig();

	// Generate hosts.
	let hostsContent = '';
	hosts.forEach(function(host) {
		hostsContent += '127.0.0.1 ' + host + "\n";
	});
	fs.outputFileSync(environment.runDirectory + '/hosts.txt', hostsContent);

	// Generate the HTTPS certificate if it does not exist.
	if (!fs.existsSync(environment.httpsCertificateCertPath) || !fs.existsSync(environment.httpsCertificateKeyPath)) {
		console.log('Generating global SSL certificate...');
		commands.regenerateHTTPSCertificate(hosts);
	}
}

/**
 * Waits for the MySQL container to become ready.
 */
function waitForMysql() {
	let iteration = 0,
		status;

	while (true) {
		status = commands.composeCommand([
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

		if (iteration >= 30) {
			console.error('Error: MySQL could not be started.');
			process.exit(1);
		}

		sleep(1000);
		iteration++;
	}

	if (iteration >= 4) {
		console.info('MySQL is ready.');
	}
}
