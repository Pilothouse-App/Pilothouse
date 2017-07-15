const environment = require('./environment'),
      fs = require('fs-extra');
      yaml = require('js-yaml');

module.exports = getConfig();

/**
 * Returns the default configuration.
 *
 * @returns {Object}
 */
function getDefaultConfig() {
	let config = {
		default_php_version: '7.0',
		sites_dir: environment.homeDirectory + '/sites'
	};

	config.default_php_container = 'php' + config.default_php_version.replace(/\./g, '');

	return config;
}

/**
 * Returns the configuration variables.
 *
 * @return {Object}
 */
function getConfig() {
	const configFile = environment.appHomeDirectory + '/config.yml';
	let config;

	try {
		config = yaml.safeLoad(fs.readFileSync(configFile, 'utf8'));
	} catch (e) {
		config = {};
	}

	return Object.assign({}, getDefaultConfig(), config);
}
