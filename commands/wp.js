const commands = require('../utils/commands'),
      config = require('../utils/config'),
      environment = require('../utils/environment'),
      run = require('../utils/run'),
      sites = require('../utils/sites');

const wpCommand = function(argv) {

	run.requireSystemUp();

	let phpVersion = config.default_php_version;
	if (environment.currentSiteName) {
		const siteSettings = sites.getSiteSettings(environment.currentSiteName);
		phpVersion = siteSettings.default_php_version;
	}

    if (argv.php) {
        phpVersion = argv.php;
    }
    let phpContainer = 'php' + phpVersion.toString().replace(/\./g, '');

	if (argv.xdebug) {
		phpContainer += '-xdebug';
	}

	commands.wpCommand(environment.subCommandArgs, phpContainer);
};

exports.command = 'wp [command]';
exports.builder = function(yargs) {
	return yargs
		.option('php <version>', {
			default: config.default_php_version,
			describe: 'The version of PHP which should be used to run the command.'
		})
		.option('xdebug', {
			default: false,
			describe: 'Whether to enable Xdebug for the command.'
		});
};
exports.desc    = 'Runs a WP-CLI command in the Docker container against the current site.';
exports.handler = wpCommand;
