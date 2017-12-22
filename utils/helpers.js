const fs = require('fs-extra');
      yaml = require('js-yaml');

module.exports = {
    formatPhpVersionBackend: formatPhpVersionBackend,
	populateTemplate: populateTemplate,
	readYamlConfig: readYamlConfig,
    writeYamlConfig: writeYamlConfig,
};

/**
 * Formats a PHP version (e.g. 7.0) for use in Nginx (e.g. 'backend_php70_default')
 *
 * Converts to string, removes decimals, and adds trailing zeros if necessary.
 *
 * @param {Integer|String} phpVersion
 *
 * @return {String}
 */
function formatPhpVersionBackend(phpVersion) {
	return '$backend_php' + phpVersion.toString().replace('.', '').padEnd(2, '0') + '_default';
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
 * Returns the configuration variables from the specified YAML config file, with optional defaults applied.
 *
 * @param {String} configFile The configuration file to read.
 * @param {Object} defaults   The configuration defaults.
 *
 * @return {Object}
 */
function readYamlConfig(configFile, defaults = {}) {
	let config;

	try {
		config = yaml.safeLoad(fs.readFileSync(configFile, 'utf8'));
	} catch (e) {
		config = {};
	}

	return Object.assign({}, defaults, config);
}

/**
 * Writes configuration variables to the specified YAML config file.
 *
 * @param {String} configFile The configuration file to write.
 * @param {Object} data       The data to write.
 */
function writeYamlConfig(configFile, data) {
	const yamlData = yaml.safeDump(data);
	fs.writeFileSync(configFile, yamlData);
}
