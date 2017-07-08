const systemUp = require('./up'),
      systemDown = require('./down');

module.exports = function() {
    systemDown();
    systemUp();
};
