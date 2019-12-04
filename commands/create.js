const chalk = require('chalk'),
      config = require('../utils/config'),
      environment = require('../utils/environment'),
      fs = require('fs-extra'),
      inquirer = require('inquirer'),
      path = require('path'),
      systemRestartCommand = require('../commands/restart'),
      run = require('../utils/run'),
      sites = require('../utils/sites'),
      validator = require('validator');

const createCommand = function(argv) {

	run.requireSystemUp();

	const basicQuestions = [
		{
			name: 'type',
			type: 'list',
			message: 'Type of site:',
			choices: [
				{ name: 'Laravel', value: 'laravel', short: 'Laravel' },
				{ name: 'PHP', value: 'php', short: 'PHP' },
				{ name: 'Proxy', value: 'proxy', short: 'Proxy' },
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

			if ('proxy' === basicAnswers.type) {

				const proxySiteQuestions = [
					{
						name: 'proxyPort',
						type: 'input',
						message: 'Proxy port:',
						validate: function(answer) {
							return validator.isInt(answer, {
								allow_leading_zeroes: false,
								gt: 0
							});
						}
					}
				];

				inquirer.prompt(proxySiteQuestions).then(function(proxySiteAnswers){

					let config = {
						domain: domainAnswers.domain,
						proxy_port: proxySiteAnswers.proxyPort,
						type: basicAnswers.type
					};

					sites.createSite(siteToCreate, config);
					systemRestartCommand.handler();
				});

			} else {

				const phpVersionQuestions = [
					{
						name: 'phpVersion',
						type: 'list',
						message: 'PHP version:',
						choices: [
							{ name: 'Global default', value: 'globalDefault', short: 'Global default' },
							{ name: '5.6', value: '5.6', short: '5.6' },
							{ name: '7.0', value: '7.0', short: '7.0' },
							{ name: '7.1', value: '7.1', short: '7.1' },
							{ name: '7.2', value: '7.2', short: '7.2' },
							{ name: '7.3', value: '7.3', short: '7.3' },
							{ name: '7.4', value: '7.4', short: '7.4' }
						],
						default: 'globalDefault'
					}
				];

				inquirer.prompt(phpVersionQuestions).then(function(phpVersionAnswers) {

					let config = {
						default_php_version: phpVersionAnswers.phpVersion,
						domain: domainAnswers.domain,
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
							},
							{
								name: 'enableObjectCache',
								type: 'confirm',
								message: 'Enable Object Cache?',
								default: false,
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

							config.enable_object_cache = wpAnswers.enableObjectCache,
							config.wp_uploads_proxy_url = validator.trim(wpAnswers.uploadsProxyUrl, '/');
							config.wp_content_repo_url = wpAnswers.wpcontentRepoURL || null;

							sites.createSite(siteToCreate, config);
							systemRestartCommand.handler();
						});
					} else if ('laravel' === basicAnswers.type) {

						const laravelQuestions = [
							{
								name: 'storageProxyUrl',
								type: 'input',
								message: 'URL to proxy storage from:',
								validate: function(answer) {
									if (validator.isEmpty(answer)) {
										return true;
									}
									return validator.isURL(answer, {protocols: ['http', 'https'], require_protocols: true}) ? true : 'Please enter a valid URL.';
								}
							},
						];

						if (environment.gitCommandExists) {
							laravelQuestions.push(
								{
									name: 'repoURL',
									type: 'input',
									message: 'Git repository to clone:'
								}
							);
						}

						inquirer.prompt(laravelQuestions).then(function (laravelAnswers) {
							config.repo_url = laravelAnswers.repoURL || null;
							config.laravel_storage_proxy_url = validator.trim(laravelAnswers.storageProxyUrl, '/');

							sites.createSite(siteToCreate, config);
							systemRestartCommand.handler();
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

							sites.createSite(siteToCreate, config);
							systemRestartCommand.handler();
						});
					} else {
						sites.createSite(siteToCreate, config);
						systemRestartCommand.handler();
					}
				});
			}
		});
	});
};

exports.command = 'create [site]';
exports.desc    = 'Creates a new local site.';
exports.handler = createCommand;
