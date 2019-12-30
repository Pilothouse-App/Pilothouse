const chalk = require('chalk'),
      commands = require('./commands'),
      config = require('./config'),
      environment = require('./environment'),
      fs = require('fs-extra'),
      helpers = require('./helpers'),
      path = require('path'),
      sites = require('./sites'),
      sleep = require('system-sleep'),
      updateNotifier = require('update-notifier')
      yaml = require('js-yaml');

module.exports = {
	buildRunFiles: buildRunFiles,
	isSystemUp: isSystemUp,
	requireSystemUp: requireSystemUp,
	triggerBackgroundUpdateCheck: triggerBackgroundUpdateCheck,
	maybeShowUpdateNotification: maybeShowUpdateNotification,
	updateCaCertificates: updateCaCertificates,
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

	generateNginxPhpUpstreamConfig()

	// Generate docker-compose.yml
	const composeTemplate = appDirectory + '/templates/run/docker-compose.yml';
	let composeData = fs.readFileSync(composeTemplate, 'UTF-8');
	composeData = helpers.populateTemplate(composeData, config.composeVariables);
	let yamlData = yaml.safeLoad(composeData)
	yamlData.services.nginx.networks.main.aliases = sites.getHosts()
	populatePhpServices(yamlData)
	fs.outputFileSync(runDirectory + '/docker-compose.yml', yaml.safeDump(yamlData))

	// Copy docker-compose override file if it exists.
	const dockerComposeOverrideFile = environment.appHomeDirectory + '/docker-compose.custom.yml';
	if (fs.existsSync(dockerComposeOverrideFile)) {
		fs.copySync(dockerComposeOverrideFile, environment.runDirectory + '/docker-compose.override.yml');
	}

	// Copy Nginx default site directory
	fs.copySync(appDirectory + '/nginx-default-site', runDirectory + '/nginx-default-site');

	// Update Nginx config.
	sites.updateSitesNginxConfig();

	// Generate hosts.
	let hostsContent = "127.0.0.1 mysql\n";
	hosts.forEach(function(host) {
		hostsContent += '127.0.0.1 ' + host + "\n";
	});
	fs.outputFileSync(environment.runDirectory + '/hosts.txt', hostsContent);

	// (Re)generate the HTTPS certificate.
	commands.regenerateHTTPSCertificate(hosts);
}

/**
 * Populate the given YAML data with the enabled PHP containers.
 *
 * @param {Object} yaml
 * @returns Object
 */
function populatePhpServices(yaml) {
	sites.enabledPhpVersions.forEach(phpVersion => {
		yaml.services[`php${phpVersion.replace('.', '')}`] = Object.assign(getPHPImage(phpVersion), JSON.parse(JSON.stringify(yaml.services.php)))
		yaml.services[`php${phpVersion.replace('.', '')}-xdebug`] = Object.assign(getPHPImage(phpVersion + '-xdebug'), JSON.parse(JSON.stringify(yaml.services.php)))
	})

	delete yaml.services.php
}

/**
 * Returns the PHP image name for the specified version.
 *
 * If Pilothouse is configured for local PHP images, this function will return the local build path instead.
 *
 * @param {String} phpVersion
 * @returns Object
 */
function getPHPImage(phpVersion) {
	if (config.php_images_local_path) {
		let phpVersionPath = phpVersion.replace('-xdebug', '/xdebug')
		return {
			build: path.join(config.php_images_local_path, phpVersionPath)
		}
	} else {
		return {
			image: 'pilothouseapp/php:' + phpVersion + '-dev'
		}
	}
}

/**
 * Generate the Nginx PHP config for the enabled PHP versions.
 */
function generateNginxPhpUpstreamConfig() {
	let nginxPhpUpstreamConfig =
`
map $cookie_php $cookie_backend_version {
	default sitedefault;
	${sites.enabledPhpVersions.map(phpVersion => `${phpVersion}     php${phpVersion.replace('.', '')};`).join('\n\t')}
}

map $arg_php $backend_version {
	default $cookie_backend_version;
	${sites.enabledPhpVersions.map(phpVersion => `${phpVersion}     php${phpVersion.replace('.', '')};`).join('\n\t')}
}

`

	nginxPhpUpstreamConfig += sites.enabledPhpVersions.map(phpVersion => {
		return `map $backend_version $backend_php${phpVersion.replace('.', '')}_default {sitedefault php${phpVersion.replace('.', '')}; default $backend_version;}`
	}).join('\n\n')

	nginxPhpUpstreamConfig += `

map $cookie_xdebug $xdebug_suffix_cookie {
	default noxdebug;
	off     noxdebug;
	on      xdebug;
}

map $arg_xdebug $xdebug_suffix {
	default $xdebug_suffix_cookie;
	off     noxdebug;
	on      xdebug;
}

`

	nginxPhpUpstreamConfig += sites.enabledPhpVersions.map(phpVersion => {
		return `upstream php${phpVersion.replace('.', '')}-noxdebug {server php${phpVersion.replace('.', '')}:9000;}\nupstream php${phpVersion.replace('.', '')}-xdebug {server php${phpVersion.replace('.', '')}-xdebug:9000;}`
	}).join('\n\n')

	fs.outputFileSync(environment.runDirectory + '/config/nginx-php-upstreams.conf', nginxPhpUpstreamConfig)
}

/**
 * Returns the full Docker name of the specified container.
 *
 * @param {String} container
 * @returns {String}
 */
function getContainerDockerName(container) {
	return commands.shellCommand(environment.runDirectory, 'docker', [
		'ps',
		'-a',
		'--format', '{{.Names}}',
		'--filter', `name=pilothouse_${container}_`,
	], true);
}

/**
 * Gets the Docker network IP address of the specified container.
 *
 * @returns String
 */
function getContainerInternalIp(container) {
	return commands.shellCommand(environment.runDirectory, 'docker', [
		'inspect',
		'--format', '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}',
		getContainerDockerName(container)
	], true);
}

/**
 * Determines whether the Docker containers are up and running.
 *
 * Currently only the default PHP container is checked, which is assumed to be representative of the rest of the stack.
 */
function isSystemUp() {
	const status = commands.composeCommand([
		'exec',
		'-T',
		config.default_php_container,
		'/bin/sh',
		'-c', 'echo "Running"'
	], true);

	return 'Running' === status;
}

/**
 * Checks whether the Docker containers are up and running, and aborts the process if they are not.
 */
function requireSystemUp() {

	if (isSystemUp()) {
		return;
	}

	console.log(chalk.red('Pilothouse is not running. Please run ') + chalk.grey('pilothouse up') + chalk.red(' first.'));
	process.exit(1);
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
			'php' + config.default_php_version.toString().replace('.', ''),
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

/**
 * Trigger an update check in the background.
 */
function triggerBackgroundUpdateCheck() {
	_getUpdateNotifier().fetchInfo()
}

/**
 * Show the update notification if one is available.
 */
function maybeShowUpdateNotification() {
	_getUpdateNotifier().notify({
		isGlobal: true
	})
}

/**
 * Get a configured update notifier instance.
 */
function _getUpdateNotifier() {
	return updateNotifier({
		pkg: require('../package'),
		updateCheckInterval: 0
	})
}

/**
 * Updates the CA certificates in the PHP containers.
 */
function updateCaCertificates() {
	commands.composeCommand([
		'exec',
		config.default_php_container,
		'/bin/sh',
		'-c',
		'update-ca-certificates &> /dev/null'
	]);
}
