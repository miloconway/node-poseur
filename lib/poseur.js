var MockProvider = require('./mock-provider');
var core = require('./core');

var Poseur = function (initContext) {
  var mockProvider = new MockProvider(initContext);
  this._disabled = !!initContext.disable;
  this._getMockBound = mockProvider.getMock.bind(mockProvider);
}

Poseur.prototype.wrap = function (realCall, altProvider) {
  var self = this;
  var wrapped = core(realCall, function (altContext) {
    altContext.getMock = self._getMockBound;
    altProvider(altContext);
  });

  return function () {
    if (self._disabled) {
      return realCall.apply(this, arguments);
    }
    return wrapped.apply(this, arguments);
  }
};

Poseur.prototype.enable = function () {
  this._disabled = false;
};

Poseur.prototype.disable = function () {
  this._disabled = true;
};

module.exports = Poseur;
