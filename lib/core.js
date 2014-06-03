function validateArguments(realCall, altCall) {
  if (typeof(realCall) !== 'function') {
    throw new Error('poseur.core must be given a function for the first argument');
  }
  if (typeof(altCall) !== 'function') {
    throw new Error('poseur.core must be given a function for the second argument');
  }
}

function createInvokeContext(invokeThis, invokeArgs, realCall) {
  var _isAsync = false;
  var invokeContext = {};

  invokeContext.isAsync = function (flag) {
    if (typeof(flag) === 'undefined') {
      return _isAsync;
    }
    _isAsync = !!flag;
    return _isAsync;
  };

  invokeContext.callReal = function () {
    return realCall.apply(invokeThis, invokeArgs);
  };

  invokeContext.args = invokeArgs;

  return invokeContext;
}

module.exports = function pose(realCall, altCall) {
  validateArguments(realCall, altCall);

  return function invoke() {
    var invokeThis = this;
    var invokeArgs = Array.prototype.slice.call(arguments);
    var altContext = createInvokeContext(invokeThis, invokeArgs, realCall);
    var altReturn = altCall.call(invokeThis, altContext);
    if (!altContext.isAsync()) {
      if (typeof(altReturn) !== 'undefined') {
        return altReturn;
      } else {
        return altContext.callReal();
      }
    }
    return;
  }
};
