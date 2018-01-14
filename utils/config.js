const chalk = require('chalk'),
      environment = require('./environment'),
      fs = require('fs-extra'),
      helpers = require('./helpers'),
      path = require('path');

let config = helpers.readYamlConfig(environment.appHomeDirectory + '/config.yml', getDefaultConfig());

config.default_php_container = 'php' + config.default_php_version.toString().replace(/\./g, '');
config.default_php_backend = '$backend_' + config.default_php_container + '_default';

config.composeVariables = getComposeVariables();

fs.ensureDirSync(config.sites_directory);
if (!fs.existsSync(config.sites_directory)) {
	console.log(chalk.red('The sites directory ' + chalk.gray(config.sites_directory) + ' does not exist. Please create it before starting Pilothouse.'));
	process.exit(1);
}

if (config.php_images_local_path && ! fs.existsSync(config.php_images_local_path)) {
	console.log(chalk.red('The PHP images local path ' + chalk.gray(config.php_images_local_path) + ' does not exist.'));
	process.exit(1);
}

module.exports = config;

/**
 * Gets variables and their values used in the docker-compose file.
 *
 * @returns {Object}
 */
function getComposeVariables() {
	return {
		'HTTPS_CERTIFICATE_CERT': environment.httpsCertificateCertPath,
		'HTTPS_CERTIFICATE_KEY': environment.httpsCertificateKeyPath,
		'MYSQL_CONFIG_FILE': getConfigFilePath('mysql.conf'),
		'NGINX_COMPILED_SITES_CONFIG_FILE': environment.runDirectory + '/nginx-compiled-sites.conf',
		'NGINX_CONFIG_FILE': getConfigFilePath('nginx.conf'),
		'NGINX_DEFAULT_SITE_DIRECTORY': environment.runDirectory + '/nginx-default-site/',
		'PHP_CONFIG_FILE': getConfigFilePath('php.ini'),
		'PHP_FPM_CONFIG_FILE': getConfigFilePath('php-fpm.conf'),
		'PHP_IMAGE_56': getPHPImage('5.6'),
		'PHP_IMAGE_56_XDEBUG': getPHPImage('5.6-xdebug'),
		'PHP_IMAGE_70': getPHPImage('7.0'),
		'PHP_IMAGE_70_XDEBUG': getPHPImage('7.0-xdebug'),
		'PHP_IMAGE_71': getPHPImage('7.1'),
		'PHP_IMAGE_71_XDEBUG': getPHPImage('7.1-xdebug'),
		'PHP_IMAGE_72': getPHPImage('7.2'),
		'PHP_IMAGE_72_XDEBUG': getPHPImage('7.2-xdebug'),
		'PHP_XDEBUG_CONFIG_FILE': getConfigFilePath('xdebug.ini'),
		'SITES_DIRECTORY': config.sites_directory,
		'SSMTP_CONFIG_FILE': getConfigFilePath('ssmtp.conf')
	}
}

/**
 * Returns the path for the specified config file.
 *
 * Will return the path to the override file instead of the bundled file, if it exists.
 *
 * @param {String} filename The config filename.
 *
 * @returns The full path to the config file.
 */
function getConfigFilePath(filename) {

	if (fs.existsSync(path.join(environment.appHomeDirectory, filename))) {
		return path.join(environment.appHomeDirectory, filename);
	}

	return path.join(environment.runDirectory, 'config', filename);
}

/**
 * Returns the default configuration.
 *
 * @returns {Object}
 */
function getDefaultConfig() {
	return {
		default_php_version: '7.0',
		sites_directory: environment.homeDirectory + '/Sites',
		wp_default_username: 'admin',
		wp_default_password: 'password'
	};
}

/**
 * Returns the PHP image name for the specified version.
 *
 * If Pilothouse is configured for local PHP images, this function will return the local build path instead.
 *
 * @param phpVersion
 */
function getPHPImage(phpVersion) {
	if (config.php_images_local_path) {
		let phpVersionPath = phpVersion.replace('-xdebug', '/xdebug');
		return 'build: ' + path.join(config.php_images_local_path, phpVersionPath);
	} else {
		return 'image: pilothouseapp/php:' + phpVersion + '-dev';
	}
}
