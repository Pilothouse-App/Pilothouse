const config = require('./config'),
      environment = require('./environment'),
      fs = require('fs-extra'),
      helpers = require('./helpers'),
      path = require('path');

module.exports = {
	compileSitesNginxConfig: compileSitesNginxConfig
};

/**
 * Builds the Nginx config file for an individual site.
 *
 * @param {String} site
 *
 * @returns {String}
 */
function buildNginxConfigForSite(site) {

	// Check for nginx.conf override file in the site directory; if it exists, use it instead of programmatically
	// generating one.
	const nginxOverrideFile = path.join(config.sites_dir, site, 'nginx.conf');
	if (fs.existsSync(nginxOverrideFile)) {
		return fs.readFileSync(nginxOverrideFile, 'UTF-8');
	}

	const siteSettings = getSiteSettings(site);

	const configFileTemplate = path.join(environment.appDirectory, '/templates/nginx/', siteSettings.type + '-site.conf');
	let templateData = fs.readFileSync(configFileTemplate, 'UTF-8');

	const templateVars = {
		server_name: siteSettings.hosts.join(' '),
		site_name: site,
		ssl_config: "\t# SSL not configured for site",
		wp_uploads_proxy_config: "\t# WP uploads proxy not configured for site"
	};

	// Add WP uploads proxy if applicable.
	if (siteSettings.wp_uploads_proxy_url) {
		const wpUploadsProxyTemplate = fs.readFileSync(path.join(environment.appDirectory, '/templates/nginx/wp-uploads-proxy.conf'), 'UTF-8');
		templateVars.wp_uploads_proxy_config = helpers.populateTemplate(wpUploadsProxyTemplate, {wp_uploads_proxy_url: siteSettings.wp_uploads_proxy_url});
	}

	// Add SSL configuration if applicable.
	if (fs.existsSync(path.join(config.sites_dir, site, site + '.cert')) && fs.existsSync(path.join(config.sites_dir, site, site + '.key'))) {
		const sslConfigTemplate = fs.readFileSync(path.join(environment.appDirectory, '/templates/nginx/ssl-config.conf'), 'UTF-8');
		templateVars.ssl_config = helpers.populateTemplate(sslConfigTemplate, {site_name: site});
	}

	return helpers.populateTemplate(templateData, templateVars);
}

/**
 * Compiles the aggregated sites Nginx configuration.
 *
 * @returns {String}
 */
function compileSitesNginxConfig() {
	const sites = getSites();
	let nginxCompiledConfig = '';

	sites.forEach(function(site) {
		nginxCompiledConfig += buildNginxConfigForSite(site) + "\n";
	});

	return nginxCompiledConfig;
}

/**
 * Builds a list of all valid local sites.
 *
 * @returns {Array}
 */
function getSites() {
	return fs.readdirSync(config.sites_dir).filter(isValidSite);
}

/**
 * Gets the site-specific settings for an individual site.
 *
 * @param {String} site
 *
 * @returns {Object}
 */
function getSiteSettings(site) {
	const configFile = path.join(config.sites_dir, site, 'config.yml');
	const defaults = {
		hosts: [site + '.dev'],
		type: 'php',
		wp_uploads_proxy_url: null,
	};

	if (fs.existsSync(path.join(config.sites_dir, site, 'htdocs/artisan'))) {
		defaults.type = 'laravel';
	}
	else if (fs.existsSync(path.join(config.sites_dir, site, 'htdocs/wp-config.php'))) {
		defaults.type = 'wordpress';
	}

	return helpers.readYamlConfig(configFile, defaults);
}

/**
 * Determines whether the specified item is a valid site in the sites directory.
 *
 * @param {String} item The name of the item in the sites directory.
 *
 * @returns {Boolean}
 */
function isValidSite(item) {
	const fullPath = path.join(config.sites_dir, item);

	// Return false if this is not a directory.
	if (!fs.lstatSync(fullPath).isDirectory()) {
		return false;
	}

	// Return false if there is not an htdocs directory inside.
	if (!fs.existsSync(path.join(fullPath, 'htdocs'))) {
		return false;
	}

	return true;
}
