const environment = require('./environment'),
      helpers = require('./helpers');

let config = helpers.readYamlConfig(environment.appHomeDirectory + '/config.yml', getDefaultConfig());
config.composeVariables = getComposeVariables();

module.exports = config;

/**
 * Gets variables and their values used in the docker-compose file.
 *
 * @returns {Object}
 */
function getComposeVariables() {
	const appDirectory = environment.appDirectory;

	return {
		'MYSQL_CONFIG_FILE': appDirectory + '/config/mysql/mysql.conf',
		'NGINX_COMPILED_SITES_CONFIG_FILE': environment.runDirectory + '/nginx-compiled-sites.conf',
		'NGINX_CONFIG_FILE': appDirectory + '/config/nginx/nginx.conf',
		'NGINX_DEFAULT_SITE_CONFIG_FILE': appDirectory + '/config/nginx/default-site.conf',
		'PHP_CONFIG_FILE': appDirectory + '/config/php-fpm/php.ini',
		'PHP_FPM_CONFIG_FILE': appDirectory + '/config/php-fpm/php-fpm.conf',
		'PHP_XDEBUG_CONFIG_FILE': appDirectory + '/config/php-fpm/xdebug.ini',
		'SITES_DIR': config.sites_dir,
		'SSMTP_CONFIG_FILE': appDirectory + '/config/ssmtp/ssmtp.conf',
		'WPCLI_CONFIG_FILE': appDirectory + '/config/wp-cli/wp-cli.yml',
	}
}

/**
 * Returns the default configuration.
 *
 * @returns {Object}
 */
function getDefaultConfig() {
	let defaults = {
		default_php_version: '7.0',
		sites_dir: environment.homeDirectory + '/Sites'
	};

	defaults.default_php_container = 'php' + defaults.default_php_version.replace(/\./g, '');

	return defaults;
}
