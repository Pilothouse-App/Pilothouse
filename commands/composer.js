const config = require('../utils/config'),
      environment = require('../utils/environment'),
      utils = require('../utils/general');

const composerCommand = function(argv) {

	let phpVersion = config.default_php_version.toString();
	if (argv.php) {
		phpVersion = argv.php.toString();
	}
	const phpContainer = 'php' + phpVersion.replace(/\./g, '');

	let workDir = '/var/www/html';
	if (environment.currentSiteName) {
		workDir += '/' + environment.currentSiteName + '/' + environment.currentPathInSite;
	}

	const shellCommand = 'cd ' + workDir + ' && composer ' + environment.subCommandArgs.join(' ');

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
			default: config.default_php_version,
			describe: 'The version of PHP which should be used to run the command.'
		});
};
exports.desc    = 'Runs a Composer command in the Docker container against the current site.';
exports.handler = composerCommand;
