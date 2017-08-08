const commands = require('../utils/commands'),
      config = require('../utils/config'),
      environment = require('../utils/environment'),
      run = require('../utils/run'),
      sites = require('../utils/sites');

const artisanCommand = function(argv) {
	const siteSettings = sites.getSiteSettings(environment.currentSiteName);

	run.requireSystemUp();

	let phpVersion = siteSettings.default_php_version;
	if (argv.php) {
		phpVersion = argv.php;
	}
	let phpContainer = 'php' + phpVersion.toString().replace(/\./g, '');

	if (argv.xdebug) {
		phpContainer += '-xdebug';
	}

	commands.artisanCommand(environment.subCommandArgs, phpContainer);
};

exports.command = 'artisan [command]';
exports.builder = function(yargs) {
	return yargs
		.option('php <version>', {
			default: config.default_php_version,
			describe: 'The version of PHP which should be used to run the command.'
		});
};
exports.desc    = 'Runs Laravel Artisan in the Docker container against the current site.';
exports.handler = artisanCommand;
