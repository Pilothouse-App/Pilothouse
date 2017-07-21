const fs = require('fs-extra');
      yaml = require('js-yaml');

module.exports = {
	populateTemplate: populateTemplate,
	readYamlConfig: readYamlConfig,
};

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
