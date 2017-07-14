const utils = require('../utils');

const wpCommand = function(argv) {
	const commandString = utils.environment.subCommandArgs.join(' ');
    let   phpContainer;

	if (argv.php) {
		phpContainer = 'php' + argv.php.toString().replace(/\./g, '');
	} else {
		phpContainer = utils.getConfig().default_php_container;
	}

	if (argv.xdebug) {
		phpContainer += '-xdebug';
	}

	utils.wpCommand(commandString, phpContainer);
};

exports.command = 'wp [command]';
exports.builder = function(yargs) {
	return yargs
		.option('php <version>', {
			default: utils.getConfig().php_version,
			describe: 'The version of PHP which should be used to run the command.'
		})
		.option('xdebug', {
			default: false,
			describe: 'Whether to enable Xdebug for the command.'
		});
};
exports.desc    = 'Runs a WP-CLI command in the Docker container against the current site.';
exports.handler = wpCommand;
