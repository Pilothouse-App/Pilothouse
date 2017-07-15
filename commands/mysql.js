const mysqlUtils = require('../utils/mysql');

const mysqlCommand = function(argv) {
	mysqlUtils.mysqlCommand(argv.sql);
};

exports.command = 'mysql <sql>';
exports.desc    = 'Runs the provided MySQL command. The command will be run on the database of the current site, or with no database selected if not run from within a site directory.';
exports.handler = mysqlCommand;
