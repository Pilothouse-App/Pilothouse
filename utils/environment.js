const chalk = require('chalk'),
      commandExists = require('command-exists').sync,
      findUp = require('find-up'),
      path = require('path');

if (!commandExists('docker-compose')) {
	console.log(chalk.red('Docker Compose does not appear to be installed. Please install Docker and rerun Pilothouse.'));
	process.exit(1);
}

module.exports = {
	appDirectory: getAppDirectory(),
	appHomeDirectory: getAppHomeDirectory(),
	currentPathInSite: getCurrentPathInSite(),
	currentSiteName: getCurrentSiteName(),
	currentSiteRootDirectory: getCurrentSiteRootDirectory(),
	gitCommandExists: commandExists('git'),
	homeDirectory: getHomeDirectory(),
	httpsCertificateCertPath: getHTTPSCertificateCertPath(),
	httpsCertificateKeyPath: getHTTPSCertificateKeyPath(),
	isThirdPartyCommand: isThirdPartyCommand(),
	runDirectory: getRunDirectory(),
	subCommandArgs: getSubCommandArgs()
};

/**
 * Gets the app's directory.
 *
 * @returns {String}
 */
function getAppDirectory() {
	return path.join(__dirname, '../');
}

/**
 * Returns the app's home directory.
 *
 * @returns {String}
 */
function getAppHomeDirectory() {
	return getHomeDirectory() + '/.pilothouse';
}

/**
 * Returns the current path relative to the site directory.
 *
 * @returns {String}
 */
function getCurrentPathInSite() {
	const currentSiteRoot = getCurrentSiteRootDirectory();

	if (null === currentSiteRoot) {
		return null;
	}

	let pathInSite = process.cwd().replace(currentSiteRoot + '/', '');

	if (currentSiteRoot === pathInSite) {
		pathInSite = '';
	}

	return pathInSite;
}

/**
 * Returns the name of the current site.
 *
 * @returns {String}
 */
function getCurrentSiteName() {
	const currentSiteRoot = getCurrentSiteRootDirectory();

	if (!currentSiteRoot) {
		return null;
	}

	const pathParts = currentSiteRoot.split('/');

	return pathParts[pathParts.length - 1];
}

/**
 * Returns the path of the current site's root directory.
 *
 * @returns {String}
 */
function getCurrentSiteRootDirectory() {
	const htdocsPath = findUp.sync('htdocs');

	if (!htdocsPath) {
		return null;
	}

	return htdocsPath.replace('/htdocs', '');
}

/**
 * Gets the current user's home directory.
 *
 * @returns {String}
 */
function getHomeDirectory() {
	return process.env.APPDATA || process.env.HOME;
}

/**
 * Gets the HTTPS certificate cert path.
 *
 * @returns {String}
 */
function getHTTPSCertificateCertPath() {
	return path.join(getAppHomeDirectory(), 'https-certificate.cert');
}

/**
 * Gets the HTTPS certificate key path.
 *
 * @returns {String}
 */
function getHTTPSCertificateKeyPath() {
	return path.join(getAppHomeDirectory(), 'https-certificate.key');
}

/**
 * Returns the full path to the `run` directory.
 *
 * @returns {String}
 */
function getRunDirectory() {
	return getAppHomeDirectory() + '/_run';
}

/**
 * Gets arguments to be passed to subcommands.
 *
 * @returns {Array}
 */
function getSubCommandArgs() {
	let commandArgs = [],
		rawArgs = JSON.parse(JSON.stringify(process.argv));

	rawArgs.shift();
	rawArgs.shift();
	rawArgs.shift();

	rawArgs.forEach(function(arg){
		if (0 === arg.indexOf('--php') || 0 === arg.indexOf('--xdebug')) {
			return;
		}

		commandArgs.push(arg);
	});

	return commandArgs;
}

/**
 * Determines whether the current command is a third-party helper command.
 */
function isThirdPartyCommand() {
	const thirdPartyCommands = ['artisan', 'composer', 'wp'];
	const args = JSON.parse(JSON.stringify(process.argv));

	args.shift();
	args.shift();
	const currentCommand = args[0];

	return thirdPartyCommands.includes(currentCommand);
}
