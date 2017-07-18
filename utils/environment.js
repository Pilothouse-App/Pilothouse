const commandExists = require('command-exists').sync,
      findUp = require('find-up'),
      path = require('path');

module.exports = {
	appDirectory: getAppDirectory(),
	appHomeDirectory: getAppHomeDirectory(),
	currentPathInSite: getCurrentPathInSite(),
	currentSiteName: getCurrentSiteName(),
	currentSiteRootDirectory: getCurrentSiteRootDirectory(),
	gitCommandExists: commandExists('git'),
	homeDirectory: getHomeDirectory(),
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
