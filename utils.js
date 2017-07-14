const yaml = require('js-yaml'),
	  findUp = require('find-up'),
	  fs = require('fs-extra'),
	  spawn = require('child_process').spawnSync,
	  subCommandArgs = getSubCommandArgs();

module.exports = {
	environment: {
	    appDirectory: getAppDirectory(),
		currentPathInSite: getCurrentPathInSite(),
		currentSiteRootDirectory: getCurrentSiteRootDirectory(),
		currentSiteName: getCurrentSiteName(),
		subCommandArgs: subCommandArgs
	},
	buildRunFiles: buildRunFiles,
	composeCommand: composeCommand,
	getConfig: getConfig,
	mysqlCommand: mysqlCommand,
	wpCommand: wpCommand
};

/**
 * Builds the files required for running docker-compose.
 */
function buildRunFiles() {
	fs.ensureDirSync( getAppHomeDirectory() );
	fs.emptyDirSync( getAppHomeDirectory() + '/run' );

	// Copy .env
	fs.copySync(getAppDirectory() + '/templates/run/.env', getAppHomeDirectory() + '/run/.env');

	// Generate docker-compose.yml
	const composeTemplate = getAppDirectory() + '/templates/run/docker-compose.yml';
	let composeData = fs.readFileSync(composeTemplate, 'UTF-8');
	composeData = populateTemplate(composeData, getComposeVariables());
	fs.outputFileSync(getAppHomeDirectory() + '/run/docker-compose.yml', composeData);
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
	return shellCommand(getAppHomeDirectory() + '/run', 'docker-compose', command, captureOutput);
}

/**
 * Gets the app's directory.
 *
 * @returns {String}
 */
function getAppDirectory() {
	return __dirname;
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
 * Gets variables and their values used in the docker-compose file.
 *
 * @returns {Object}
 */
function getComposeVariables() {
	return {
		'MYSQL_CONFIG_FILE': getAppDirectory() + '/config/mysql/mysql.conf',
		'NGINX_CONFIG_FILE': getAppDirectory() + '/config/nginx/nginx.conf',
		'NGINX_DEFAULT_SITE_CONFIG_FILE': getAppDirectory() + '/config/nginx/default-site.conf',
		'NGINX_SHARED_CONFIG_FILE': getAppDirectory() + '/config/nginx/partials/shared.conf.inc',
		'PHP_CONFIG_FILE': getAppDirectory() + '/config/php-fpm/php.ini',
		'PHP_FPM_CONFIG_FILE': getAppDirectory() + '/config/php-fpm/php-fpm.conf',
		'PHP_XDEBUG_CONFIG_FILE': getAppDirectory() + '/config/php-fpm/xdebug.ini',
		'SITES_DIR': getConfig().sites_dir,
		'SSMTP_CONFIG_FILE': getAppDirectory() + '/config/ssmtp/ssmtp.conf',
		'WPCLI_CONFIG_FILE': getAppDirectory() + '/config/wp-cli/wp-cli.yml',
	}
}

/**
 * Returns the current path relative to the site directory.
 *
 * @returns {String}
 */
function getCurrentPathInSite() {
	const currentSiteRoot = getCurrentSiteRootDirectory();

	if (null === currentSiteRoot) {
		return;
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
 * Returns the default configuration.
 *
 * @returns {Object}
 */
function getDefaultConfig() {
	let config = {
		php_version: '7.0',
		sites_dir: getHomeDirectory() + '/sites'
	};

	config.default_php_container = 'php' + config.php_version.replace(/\./g, '');

	return config;
}

/**
 * Returns the configuration variables.
 *
 * @return {Object}
 */
function getConfig() {
	const configFile = getAppHomeDirectory() + '/config.yml';
	let config;

	try {
		config = yaml.safeLoad(fs.readFileSync(configFile, 'utf8'));
	} catch (e) {
		config = {};
	}

	return Object.assign({}, getDefaultConfig(), config);
}

/**
 * Gets the current user's home directory.
 *
 * @returns {String}
 */
function getHomeDirectory() {
	return homeDir = process.env.APPDATA || process.env.HOME;
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
 * Runs a MySQL command.
 *
 * @param {String} sql The SQL to run.
 */
function mysqlCommand(sql) {
	if (getCurrentSiteName()) {
		sql = 'USE "' + getCurrentSiteName() + '"; ' + sql;
	}

	composeCommand([
		'exec',
		getConfig().default_php_container,
		'mysql',
		'--host=mysql',
		'--user=root',
		'--password=root',
		'-e',
		sql
	]);
}

/**
 * Populates the provided template with the specified variables.
 *
 * @param {String} template
 * @param {Object} templateVars
 *
 * @returns {String} The populated template.
 */
function populateTemplate(template, templateVars) {
	for (let templateVar in templateVars) {
		let regex = new RegExp('{{' + templateVar + '}}', 'gi');
		template = template.replace(regex, templateVars[templateVar]);
	}
	return template;
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
 * @param {String} commandString The command to run.
 * @param {String} container     The container in which to run the command. Will use the default PHP container if none is specified.
 */
function wpCommand(commandString, container = null) {
	const currentSiteName = getCurrentSiteName();
	if (!container) {
		container = getConfig().default_php_container;
	}

	if (currentSiteName) {
		shellCommandString = 'cd /var/www/html/' + currentSiteName + '/' + getCurrentPathInSite()
			+ ' && wp --path=/var/www/html/' + currentSiteName + '/htdocs'
			+ ' ' + commandString;

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
