const systemReloadCommand = require('../commands/reload'),
      inquirer = require('inquirer'),
      run = require('../utils/run'),
      sites = require('../utils/sites');

const deleteCommand = function(argv) {

	run.requireSystemUp();

	let siteQuestions = [];

	if (!argv.site) {
		siteQuestions.push({
			name: 'site',
			type: 'list',
			message: 'Which local site do you want to delete?',
			choices: sites.getSites()
		});
	}

	inquirer.prompt(siteQuestions).then(function(siteAnswers) {

		const siteToDelete = argv.site || siteAnswers.site;

		const confirmQuestions = [
			{
				name: 'confirmation',
				type: 'confirm',
				message: 'Are you sure you want to delete the local site ' + siteToDelete + '?',
				default: false
			}
		];

		inquirer.prompt(confirmQuestions).then(function(confirmAnswers){

			if (!confirmAnswers.confirmation) {
				process.exit();
			}

			sites.deleteSite(siteToDelete);
			systemReloadCommand.handler();
		});
	});
};

exports.command = 'delete [site]';
exports.desc    = 'Deletes an existing local site.';
exports.handler = deleteCommand;
