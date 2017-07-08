const utils = require('../utils');

module.exports = function() {
    utils.buildRunFiles();
    utils.composeCommand(['up', '-d']);
};
