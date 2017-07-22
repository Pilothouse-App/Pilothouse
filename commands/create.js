const chalk = require('chalk'),
      config = require('../utils/config'),
      environment = require('../utils/environment'),
      fs = require('fs-extra'),
      inquirer = require('inquirer'),
      path = require('path'),
      sites = require('../utils/sites'),
      validator = require('validator');

const createCommand = function(argv) {

	const basicQuestions = [
		{
			name: 'type',
			type: 'list',
			message: 'Type of site:',
			choices: [
				{ name: 'Laravel', value: 'laravel', short: 'Laravel' },
				{ name: 'PHP', value: 'php', short: 'PHP' },
				{ name: 'WordPress', value: 'wordpress', short: 'WordPress' }
			],
			default: 'php'
		}
	];

	if (!argv.site) {
		basicQuestions.push({
			name: 'name',
			type: 'input',
			message: 'Name of local site directory:',
			validate: function(answer) {
				if (validator.isEmpty(answer)) {
					return false;
				}

				if (fs.existsSync(path.join(config.sites_directory, answer))) {
					return 'The site directory "' + answer + '" already exists.';
				}

				return validator.matches(answer, /[^A-Za-z0-9-._]/, 'g') ? 'Please enter a valid local site directory name.' : true;
			}
		});
	} else if (fs.existsSync(path.join(config.sites_directory, argv.site))) {
		console.log(chalk.red('The site directory "' + argv.site + '" already exists.'));
		process.exit(1);
	}

	inquirer.prompt(basicQuestions).then(function(basicAnswers) {

		const siteToCreate = argv.site || basicAnswers.name;

		const domainQuestions = [
			{
				name: 'domain',
				type: 'input',
				message: 'Local domain name to use:',
				default: function() {
					return (siteToCreate + '.dev').replace('_', '-').toLowerCase();
				},
				validate: function(answer) {
					if (validator.isEmpty(answer)) {
						return false;
					}
					return validator.isFQDN(answer) ? true : 'Please enter a valid local domain name.';
				}
			}
		];

		inquirer.prompt(domainQuestions).then(function(domainAnswers) {

			let config = {
				domain: domainAnswers.domain,
				name: siteToCreate,
				type: basicAnswers.type
			};

			if ('wordpress' === basicAnswers.type) {

				const wpQuestions = [
					{
						name: 'uploadsProxyUrl',
						type: 'input',
						message: 'URL to proxy uploads from:',
						validate: function(answer) {
							if (validator.isEmpty(answer)) {
								return true;
							}
							return validator.isURL(answer, {protocols: ['http', 'https'], require_protocols: true}) ? true : 'Please enter a valid URL.';
						}
					}
				];

				if (environment.gitCommandExists) {
					wpQuestions.push(
						{
							name: 'wpcontentRepoURL',
							type: 'input',
							message: 'Git repository to clone for the wp-content directory:'
						}
					);
				}

				inquirer.prompt(wpQuestions).then(function(wpAnswers) {

					config.wp_uploads_proxy_url = validator.trim(wpAnswers.uploadsProxyUrl, '/');
					config.wp_content_repo_url = wpAnswers.wpcontentRepoURL || null;

					sites.createSite(config);
				});
			} else if ('php' === basicAnswers.type) {

				const phpQuestions = [
					{
						name: 'createDatabase',
						type: 'confirm',
						message: 'Create a MySQL database?',
						default: false
					}
				];

				inquirer.prompt(phpQuestions).then(function(phpAnswers) {

					config.create_database = phpAnswers.createDatabase;

					sites.createSite(config);
				});
			} else {
				sites.createSite(config);
			}
		});
	});
};

exports.command = 'create [site]';
exports.desc    = 'Creates a new local site.';
exports.handler = createCommand;
