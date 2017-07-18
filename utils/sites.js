const chalk = require('chalk'),
      commands = require('./commands'),
      config = require('./config'),
      environment = require('./environment'),
      fs = require('fs-extra'),
      helpers = require('./helpers'),
      path = require('path'),
      request = require('sync-request');

module.exports = {
	compileSitesNginxConfig: compileSitesNginxConfig,
	createSite: createSite
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
 * Creates a new local site.
 *
 * @param {Object} siteConfig The site configuration data.
 */
function createSite(siteConfig) {

	fs.ensureDirSync(path.join(config.sites_dir, siteConfig.name, 'htdocs'));

	if ('php' !== siteConfig.type || siteConfig.create_database) {
		commands.mysqlCommand('CREATE DATABASE IF NOT EXISTS `' + siteConfig.name + '`;');
	}

	environment.currentPathInSite = 'htdocs';
	environment.currentSiteName = siteConfig.name;
	environment.currentSiteRootDirectory = path.join(config.sites_dir, siteConfig.name);

	if ('wordpress' === siteConfig.type) {

		// Download WP core files.
		commands.wpCommand([
			'core',
			'download'
		]);

		// Generate wp-config.php
		commands.wpCommand([
			'core',
			'config',
			'--dbhost=mysql',
			'--dbname=' + siteConfig.name,
			'--dbuser=pilothouse',
			'--dbpass=pilothouse'
		]);

		// Install WordPress.
		commands.wpCommand([
			'core',
			'install',
			'--url=' + siteConfig.domain,
			'--title=' + siteConfig.name,
			'--admin_user=' + config.wp_default_username,
			'--admin_password=' + config.wp_default_password,
			'--admin_email=' + config.wp_default_username + '@' + siteConfig.domain,
			'--skip-email'
		]);

		// Clone wp-content repo, if applicable.
		if (siteConfig.wp_content_repo_url) {

			commands.shellCommand(
				path.join(environment.currentSiteRootDirectory, 'htdocs'),
				'git',
				['clone', siteConfig.wp_content_repo_url, 'wp-content.tmp'],
				true
			);

			if (fs.existsSync(path.join(environment.currentSiteRootDirectory, 'htdocs/wp-content.tmp'))) {
				fs.moveSync(
					path.join(environment.currentSiteRootDirectory, 'htdocs/wp-content.tmp'),
					path.join(environment.currentSiteRootDirectory, 'htdocs/wp-content'),
					{overwrite: true}
				);
			} else {
				console.log(chalk.red('Could not clone the Git repository for wp-content.'));
			}
		}

		// Add object cache dropin.
		const objectCacheDropinRequest = request(
			'GET',
			'https://raw.githubusercontent.com/pantheon-systems/wp-redis/master/object-cache.php'
		);
		const objectCacheContent = objectCacheDropinRequest.getBody().toString();
		fs.writeFileSync(
			path.join(environment.currentSiteRootDirectory, 'htdocs/wp-content/object-cache.php'),
			objectCacheContent
		);

		// Update wp-config.php with additional directives.
		let wpConfigAdditionsFile = path.join(environment.appDirectory, '/config/wordpress/wp-config.php.inc');
		if (fs.existsSync(path.join(environment.appHomeDirectory, 'config/wordpress/wp-config.php.inc'))) {
			wpConfigAdditionsFile = path.join(environment.appHomeDirectory, 'config/wordpress/wp-config.php.inc');
		}
		let wpConfigAdditionsContent = fs.readFileSync(wpConfigAdditionsFile, 'UTF-8');
		wpConfigAdditionsContent = helpers.populateTemplate(wpConfigAdditionsContent, {site_name: environment.currentSiteName});
		let wpConfigContent = fs.readFileSync(path.join(environment.currentSiteRootDirectory, 'htdocs/wp-config.php'), 'UTF-8');
		wpConfigContent = wpConfigContent.replace(/\n\n\/\* That's all/, wpConfigAdditionsContent + "\n\n/* That's all");
		fs.writeFileSync(path.join(environment.currentSiteRootDirectory, 'htdocs/wp-config.php'), wpConfigContent);
	}

	// @todo resolve duplicated code in run.js
	fs.outputFileSync(environment.runDirectory + '/nginx-compiled-sites.conf', compileSitesNginxConfig());

	commands.composeCommand(['restart', 'nginx']);
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
