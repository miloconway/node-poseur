var core = require('./lib/core');
var Poseur = require('./lib/poseur');

module.exports = {
  core: core,
  init: function (initContext) {
    return new Poseur(initContext);
  }
};
