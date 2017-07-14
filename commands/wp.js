const utils = require('../utils');

const wpCommand = function(argv) {
	const env = utils.environment;
    let shellCommand = null;

	let phpVersion = utils.getConfig().php_version.toString();
	if (argv.php) {
		phpVersion = argv.php.toString();
	}
	const phpContainer = 'php' + phpVersion.replace(/\./g, '') + (argv.xdebug ? '-xdebug' : '');

	if (env.currentSiteName) {
		shellCommand = 'cd /var/www/html/' + env.currentSiteName + '/' + env.currentPathInSite
			+ ' && wp --path=/var/www/html/' + env.currentSiteName + '/htdocs'
			+ ' ' + env.subCommandArgs.join(' ');

	} else if ('--info' === env.subCommandArgs.join()) {
		shellCommand = 'cd /var/www/html && wp --info';
	} else {
		console.error('This command must be run from within a site directory.');
		process.exit(1);
	}

	const composeArgs = [
		'exec',
		'--user=www-data',
		phpContainer,
		'/bin/sh',
		'-c',
		shellCommand
	];

	utils.composeCommand(composeArgs);
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
