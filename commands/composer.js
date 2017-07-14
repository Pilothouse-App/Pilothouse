const utils = require('../utils');

const composerCommand = function(argv) {
	const env = utils.environment;

	let phpVersion = utils.getConfig().php_version.toString();
	if (argv.php) {
		phpVersion = argv.php.toString();
	}
	const phpContainer = 'php' + phpVersion.replace(/\./g, '');

	let workDir = '/var/www/html';
	if (env.currentSiteName) {
		workDir += '/' + env.currentSiteName + '/' + env.currentPathInSite;
	}

	const shellCommand = 'cd ' + workDir + ' && composer ' + env.subCommandArgs.join(' ');

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

exports.command = 'composer [command]';
exports.builder = function(yargs) {
	return yargs
		.option('php <version>', {
			default: utils.getConfig().php_version,
			describe: 'The version of PHP which should be used to run the command.'
		});
};
exports.desc    = 'Runs a Composer command in the Docker container against the current site.';
exports.handler = composerCommand;
