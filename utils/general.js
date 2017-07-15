const config = require('./config'),
      environment = require('./environment'),
	  fs = require('fs-extra'),
	  spawn = require('child_process').spawnSync;

module.exports = {
	buildRunFiles: buildRunFiles,
	composeCommand: composeCommand,
	wpCommand: wpCommand
};

/**
 * Builds the files required for running docker-compose.
 */
function buildRunFiles() {
	const appDirectory = environment.appDirectory,
	      appHomeDirectory = environment.appHomeDirectory,
	      runDirectory = environment.runDirectory;

    // Create directories if they do not already exist.
	fs.ensureDirSync(appHomeDirectory);
	fs.emptyDirSync(runDirectory);

	// Create readme.txt
	fs.writeFileSync(runDirectory + '/readme.txt', 'All files in this directory are programmatically generated on'
	    + ' `pilothouse up`. Do not manually edit any of these files, as your changes will not persist.');

	// Copy .env
	fs.copySync(appDirectory + '/templates/run/.env', runDirectory + '/.env');

	// Generate docker-compose.yml
	const composeTemplate = appDirectory + '/templates/run/docker-compose.yml';
	let composeData = fs.readFileSync(composeTemplate, 'UTF-8');
	composeData = populateTemplate(composeData, getComposeVariables());
	fs.outputFileSync(runDirectory + '/docker-compose.yml', composeData);

	// Copy docker-compose override file if it exists.
	const dockerComposeOverrideFile = environment.appHomeDirectory + '/docker-compose.custom.yml';
	if (fs.existsSync(dockerComposeOverrideFile)) {
		fs.copySync(dockerComposeOverrideFile, environment.runDirectory + '/docker-compose.override.yml');
	}
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
 * Gets variables and their values used in the docker-compose file.
 *
 * @returns {Object}
 */
function getComposeVariables() {
	const appDirectory = environment.appDirectory;

	return {
		'MYSQL_CONFIG_FILE': appDirectory + '/config/mysql/mysql.conf',
		'NGINX_CONFIG_FILE': appDirectory + '/config/nginx/nginx.conf',
		'NGINX_DEFAULT_SITE_CONFIG_FILE': appDirectory + '/config/nginx/default-site.conf',
		'NGINX_SHARED_CONFIG_FILE': appDirectory + '/config/nginx/partials/shared.conf.inc',
		'PHP_CONFIG_FILE': appDirectory + '/config/php-fpm/php.ini',
		'PHP_FPM_CONFIG_FILE': appDirectory + '/config/php-fpm/php-fpm.conf',
		'PHP_XDEBUG_CONFIG_FILE': appDirectory + '/config/php-fpm/xdebug.ini',
		'SITES_DIR': config.sites_dir,
		'SSMTP_CONFIG_FILE': appDirectory + '/config/ssmtp/ssmtp.conf',
		'WPCLI_CONFIG_FILE': appDirectory + '/config/wp-cli/wp-cli.yml',
	}
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
	const currentSiteName = environment.currentSiteName;
	let   shellCommandString;

	if (!container) {
		container = config.default_php_container;
	}

	if (currentSiteName) {
		shellCommandString = 'cd /var/www/html/' + currentSiteName + '/' + environment.currentPathInSite
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
