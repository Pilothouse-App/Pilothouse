const spawn = require('child_process').spawnSync,
      fs = require('fs-extra');

module.exports = {
    buildRunFiles: buildRunFiles,
    composeCommand: composeCommand,
    commandDescriptions: getCommandDescriptions()
};

/**
 * Builds the files required for running docker-compose.
 */
function buildRunFiles() {
    fs.ensureDirSync( getAppHomeDirectory() );
    fs.emptyDirSync( getAppHomeDirectory() + '/run' );

    // Copy .env
    fs.copySync(getAppDirectory() + '/templates/run/.env', getAppHomeDirectory() + '/run/.env');

    // Generate docker-compose.yml
    const composeTemplate = getAppDirectory() + '/templates/run/docker-compose.yml';
    let composeData = fs.readFileSync(composeTemplate, 'UTF-8');
    composeData = populateTemplate(composeData, getComposeVariables());
    fs.outputFileSync(getAppHomeDirectory() + '/run/docker-compose.yml', composeData);
}

/**
 * Runs a docker-compose command
 *
 * @param {Array} command
 */
function composeCommand(command) {
    shellCommand(getAppHomeDirectory() + '/run', 'docker-compose', command);
}

/**
 * Gets the app's directory.
 *
 * @returns {String}
 */
function getAppDirectory() {
    return __dirname;
}

/**
 * Returns the app's home directory.
 *
 * @returns {String}
 */
function getAppHomeDirectory() {
    return getHomeDirectory() + '/.pilothouse';
}

/**
 * Returns the registered command description strings.
 *
 * @returns Object
 */
function getCommandDescriptions() {
    return {
        up: 'Boots up the Docker containers, and adds all necessary site entries to the host\'s hosts file.',
        down: 'Halts the Docker containers, removing all site entries from the host\'s hosts file.',
        restart: 'Restarts the specified Docker container (nginx, memcached, etc.), or the entire system if no container is specified.'
    }
}

/**
 * Gets variables and their values used in the docker-compose file.
 *
 * @returns {Object}
 */
function getComposeVariables() {
    return {
        'MYSQL_CONFIG_FILE': getAppDirectory() + '/config/mysql/mysql.conf',
        'NGINX_CONFIG_FILE': getAppDirectory() + '/config/nginx/nginx.conf',
        'NGINX_DEFAULT_SITE_CONFIG_FILE': getAppDirectory() + '/config/nginx/default-site.conf',
        'NGINX_SHARED_CONFIG_FILE': getAppDirectory() + '/config/nginx/partials/shared.conf.inc',
        'PHP_CONFIG_FILE': getAppDirectory() + '/config/php-fpm/php.ini',
        'PHP_FPM_CONFIG_FILE': getAppDirectory() + '/config/php-fpm/php-fpm.conf',
        'PHP_XDEBUG_CONFIG_FILE': getAppDirectory() + '/config/php-fpm/xdebug.ini',
        'SITES_DIR': getHomeDirectory() + '/sites',
        'SSMTP_CONFIG_FILE': getAppDirectory() + '/config/ssmtp/ssmtp.conf',
        'WPCLI_CONFIG_FILE': getAppDirectory() + '/config/wp-cli/wp-cli.yml',
    }
}

/**
 * Gets the current user's home directory.
 *
 * @returns {String}
 */
function getHomeDirectory() {
    return homeDir = process.env.APPDATA || process.env.HOME;
}

/**
 * Populates the provided template with the specified variables.
 *
 * @param {String} template
 * @param {Object} templateVars
 *
 * @returns {String} The populated template.
 */
function populateTemplate(template, templateVars) {
    for (let templateVar in templateVars) {
        let regex = new RegExp('{{' + templateVar + '}}', 'gi');
        template = template.replace(regex, templateVars[templateVar]);
    }
    return template;
}

/**
 * Runs a shell command.
 *
 * @param {String} cwd     The working directory in which to run the command.
 * @param {String} command The command to run.
 * @param {Array}  args    Arguments to be passed to the command.
 */
function shellCommand(cwd, command, args) {
    spawn(command, args, {cwd: cwd, stdio: 'inherit'});
}
