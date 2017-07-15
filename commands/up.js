const mysqlUtils = require('../utils/mysql'),
      utils = require('../utils/general');

const upCommand = function() {
	utils.buildRunFiles();
	utils.composeCommand(['up', '-d']);
	mysqlUtils.waitForMysql();
	mysqlUtils.mysqlCommand(
		"CREATE USER IF NOT EXISTS 'pilothouse'@'%' IDENTIFIED BY 'pilothouse';"
		+ " GRANT ALL PRIVILEGES ON *.* to 'pilothouse'@'%';"
		+ " FLUSH PRIVILEGES;"
	);
};

exports.command = 'up';
exports.desc    = 'Boots up the Docker containers, and adds all necessary site entries to the host\'s hosts file.';
exports.handler = upCommand;
